import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

// High body limit for base64 photo uploads from phones & cameras
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));

// Helper to generate content with automatic retries and fallback across valid models
async function generateContentWithFallback(
  ai: GoogleGenAI,
  requestParams: {
    contents: any;
    config?: any;
  },
  timeoutMs = 20000
) {
  // Verified active high-availability models
  const candidateModels = [
    "gemini-3.1-flash-lite",
    "gemini-3.6-flash",
  ];

  let lastError: any = null;

  for (const model of candidateModels) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      console.log(`[AI] Invoking model '${model}'...`);
      const response = await ai.models.generateContent({
        model,
        contents: requestParams.contents,
        config: {
          ...requestParams.config,
          abortSignal: controller.signal,
        },
      });
      clearTimeout(timer);

      if (response && response.text) {
        console.log(`[AI] Success with model '${model}'`);
        return { response, usedModel: model };
      }
    } catch (err: any) {
      clearTimeout(timer);
      lastError = err;
      const msg = err?.message || String(err);
      console.warn(`[AI] Model '${model}' failed: ${msg}`);
      // If error is unrecoverable on vision (e.g. invalid image argument), continue to next
    }
  }

  throw lastError || new Error("সবগুলো AI মডেলে এই মুহূর্তে সাময়িক চাপ রয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
}

// Robust JSON parser that handles markdown fencing, unescaped LaTeX backslashes, and edge cases
function robustParseAiJson(rawText: string): any {
  let str = (rawText || "").trim();

  // Strip markdown code fences if wrapped in ```json ... ``` or ``` ... ```
  if (str.startsWith("```")) {
    str = str.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }

  // 1. Direct parse attempt
  try {
    return JSON.parse(str);
  } catch {
    // Continue
  }

  // 2. Extract outermost JSON object
  const jsonMatch = str.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      str = jsonMatch[0];
    }
  }

  // 3. Fix unescaped backslashes in LaTeX equations (e.g. \frac, \alpha, \text, \mu, \vec)
  // In standard JSON, only \" \\ \/ \b \f \n \r \t \uXXXX are valid escapes.
  try {
    const sanitized = str.replace(/(?<!\\)\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, "\\\\");
    return JSON.parse(sanitized);
  } catch {
    // Continue
  }

  // 4. If response was truncated near the end, close open array & object
  try {
    let repaired = str;
    const lastQuestionEnd = repaired.lastIndexOf("}");
    if (lastQuestionEnd !== -1) {
      repaired = repaired.substring(0, lastQuestionEnd + 1);
      const openBrackets = (repaired.match(/\[/g) || []).length;
      const closeBrackets = (repaired.match(/\]/g) || []).length;
      const openBraces = (repaired.match(/\{/g) || []).length;
      const closeBraces = (repaired.match(/\}/g) || []).length;

      if (openBrackets > closeBrackets) repaired += "]";
      if (openBraces > closeBraces) repaired += "}";
      const sanitizedRepaired = repaired.replace(/(?<!\\)\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, "\\\\");
      return JSON.parse(sanitizedRepaired);
    }
  } catch {
    // Continue
  }

  throw new Error("Could not parse JSON response from Gemini model");
}

function parseAndCleanErrorMessage(error: any): string {
  if (!error) return "অপ্রত্যাশিত কোনো ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।";
  const raw = typeof error === "string" ? error : error.message || JSON.stringify(error);

  if (raw.includes("API_KEY_INVALID") || raw.includes("API key not valid") || raw.includes("GEMINI_API_KEY is not set")) {
    return "Gemini API Key টি সঠিকভাবে কনফিগার করা হয়নি। Vercel Settings বা .env ফাইলে আপনার নতুন কী (AQ.Ab... বা AIza...) যুক্ত করুন।";
  }
  if (raw.includes("aborted") || raw.includes("timeout")) {
    return "AI প্রসেসিংয়ে কিছুটা বেশি সময় নিয়েছে। অনুগ্রহ করে 'পুনরায় চেষ্টা করুন' বাটনে চাপ দিন।";
  }
  if (raw.includes("503") || raw.includes("high demand") || raw.includes("UNAVAILABLE")) {
    return "AI সার্ভারে সাময়িক ট্রাফিকের চাপ রয়েছে (503 High Demand)। কয়েক সেকেন্ড পর নিচে 'পুনরায় চেষ্টা করুন' বাটনে চাপ দিন।";
  }
  if (raw.includes("429") || raw.includes("RESOURCE_EXHAUSTED") || raw.includes("quota")) {
    return "অনুরোধের সীমা সাময়িকভাবে অতিক্রান্ত হয়েছে। ১ মিনিট অপেক্ষা করে আবার চেষ্টা করুন।";
  }
  if (raw.includes("Could not parse JSON")) {
    return "ছবি থেকে প্রশ্ন বিন্যাস করতে সমস্যা হয়েছে। অনুগ্রহ করে স্পষ্ট আলোযুক্ত সোজা ছবি আপলোড করুন।";
  }
  return raw;
}

// Initialize Google Gemini AI client
function getGeminiClient(): GoogleGenAI {
  const rawKey = process.env.GEMINI_API_KEY || "";
  // Trim spaces, quotes, or accidental newlines from environment variable
  const apiKey = rawKey.trim().replace(/^["']|["']$/g, "");

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in the environment. Please configure GEMINI_API_KEY in Vercel or your .env file.");
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint
app.get(["/api/health", "/health"], (_req, res) => {
  res.json({
    status: "ok",
    service: "Quizify AI Bangladesh Backend",
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// MCQ Extraction API endpoint
app.post(["/api/extract-mcq", "/extract-mcq"], async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", subjectHint } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64 data" });
    }

    // Safely strip any data URI prefix (data:image/jpeg;base64, data:application/octet-stream;base64, etc.)
    let cleanBase64 = imageBase64;
    if (cleanBase64.includes(",")) {
      cleanBase64 = cleanBase64.substring(cleanBase64.indexOf(",") + 1);
    }
    cleanBase64 = cleanBase64.replace(/\s+/g, "");

    if (!cleanBase64 || cleanBase64.length < 50) {
      return res.status(400).json({ error: "অবৈধ বা অসম্পূর্ণ ছবির ডেটা প্রাপ্ত হয়েছে। অনুগ্রহ করে আবার ছবি নির্বাচন করুন।" });
    }

    // Normalize mimeType to a type strictly supported by Google Gemini vision models
    let normalizedMimeType = "image/jpeg";
    if (typeof mimeType === "string") {
      const lower = mimeType.toLowerCase();
      if (lower.includes("png")) normalizedMimeType = "image/png";
      else if (lower.includes("webp")) normalizedMimeType = "image/webp";
      else if (lower.includes("heic")) normalizedMimeType = "image/heic";
      else if (lower.includes("heif")) normalizedMimeType = "image/heif";
      else normalizedMimeType = "image/jpeg";
    }

    const ai = getGeminiClient();

    const systemPrompt = `You are Quizify AI, the leading AI MCQ Exam Generator for Bangladeshi students preparing for HSC (Higher Secondary Certificate) and University Admission (BUET, Medical, Dhaka University A-Unit, GST, Engineering Question Banks).

YOUR CORE TASK:
Convert the uploaded photo containing MCQ questions into structured, clean, highly accurate quiz data ready for a real Computer Based Test (CBT) system.

STRICT ACCURACY RULES:
1. BANGLA LANGUAGE:
   - Preserve Bangla text (বাংলা ভাষা ও হরফ) exactly as written.
   - Do NOT translate Bangla questions into English unless the question itself is in English.
   - Retain Bengali options (ক, খ, গ, ঘ) or English options (A, B, C, D).

2. SCIENTIFIC CONTENT INTEGRITY:
   - NEVER lose or simplify mathematical symbols, integrals ($\\int$), summations, limits ($\\lim$), matrices, fractions ($\\frac{a}{b}$), powers, roots, Greek letters ($\\alpha, \\beta, \\gamma, \\lambda, \\theta, \\omega, \\varepsilon_0, \\mu, \\rho, \\sigma, \\Omega$).
   - NEVER lose chemical formulas (e.g., $\\text{H}_2\\text{SO}_4$, $[\\text{Cu(NH}_3)_4]^{2+}$, organic reaction structures like $\\text{CH}_3\\text{COOH}$).
   - Format all math and chemistry formulas in standard LaTeX using inline $...$ or display $$...$$ notation.
   - NEVER lose physical units (e.g. $\\text{ms}^{-1}$, $\\text{ms}^{-2}$, $\\text{N/m}$, $\\text{J}$, $\\text{eV}$, $\\text{mol/L}$, $\\text{rad/s}$).

3. REMOVE IRRELEVANT CONTENT & NOISE:
   - IGNORE student handwritten notes, pencil calculations, scribbles, and rough sketches on margins.
   - IGNORE tick marks, pen markings, or circle fills made by previous students! Solve the question independently using actual scientific facts according to NCTB/HSC standard curriculum.
   - IGNORE page numbers, publication watermarks (e.g., Udvash, Retina, Royal, Panjeree, Jupiter, Model Test headers/footers).

4. STEM & MULTI-PART QUESTIONS (উদ্দীপক ও বহুপদী সমাপ্তিসূচক):
   - If questions share a common scenario (উদ্দীপক বা তথ্য), place the scenario in the "context" field.
   - If a question has Roman numerals (i, ii, iii), preserve the statements clearly in the question or context text, and format options accordingly (e.g., i ও ii, i ও iii, ইত্যাদি).

5. ALWAYS GENERATE COMPLETE QUIZ:
   - If explicit 4-option MCQs are present in the image, transcribe them with high fidelity.
   - If the image contains questions with missing options, short questions, or textbook content, intelligently construct standard 4-option HSC/Admission-grade MCQs based on the content shown.
   - ALWAYS return between 3 to 15 high-quality questions. Never return an empty questions list.

6. LOW CONFIDENCE & REVIEW:
   - If any text is partially cropped, blurry, or ambiguous, set "needsReview": true and provide a specific explanation in "reviewReason". Otherwise set false.

7. EXPLANATION:
   - For every question, write an authentic, step-by-step scientific explanation in Bangla/English explaining the formula, derivation, or concept for CBT review mode.

RETURN STRICT JSON FORMAT:
{
  "detectedSubject": "Physics" | "Chemistry" | "Higher Math" | "Biology" | "General Science" | "Admission Question Bank" | "Other",
  "totalQuestions": number,
  "questions": [
    {
      "id": string (unique, e.g. "q_1"),
      "questionNumber": number,
      "subject": "Physics" | "Chemistry" | "Higher Math" | "Biology" | "General Science" | "Admission Question Bank" | "Other",
      "topic": string (optional, e.g. "তরঙ্গ", "গুণগত রসায়ন", "ক্যালকুলাস"),
      "context": string (optional stem / উদ্দীপক),
      "question": string (Bangla/English text with LaTeX math like $\\\\vec{F} = m\\\\vec{a}$),
      "options": [
        { "id": string, "label": "ক" | "খ" | "গ" | "ঘ" | "A" | "B" | "C" | "D", "text": string },
        { "id": string, "label": "ক" | "খ" | "গ" | "ঘ" | "A" | "B" | "C" | "D", "text": string },
        { "id": string, "label": "ক" | "খ" | "গ" | "ঘ" | "A" | "B" | "C" | "D", "text": string },
        { "id": string, "label": "ক" | "খ" | "গ" | "ঘ" | "A" | "B" | "C" | "D", "text": string }
      ],
      "correctOptionId": string (matches the id of the correct option above),
      "explanation": string (Bengali detailed explanation with formula),
      "difficulty": "Easy" | "Medium" | "Hard",
      "sourceExam": string (optional, e.g. "ঢাকা বোর্ড ২০২২", "বুয়েট ২০২০-২১"),
      "needsReview": boolean,
      "reviewReason": string (optional)
    }
  ]
}`;

    const userPromptText = `Analyze this Bangladeshi educational photo carefully.
Subject preference: ${subjectHint || "Auto-detect from image"}.
Transcribe all visible MCQ questions, or create high-yield HSC/Admission-level MCQs based directly on the topics/formulas shown.
Ensure all Bangla text, LaTeX equations, chemical formulas, and units are preserved with precision. Clean out any student handwritten marks or tick marks.`;

    const { response, usedModel } = await generateContentWithFallback(ai, {
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: normalizedMimeType,
              },
            },
            {
              text: userPromptText,
            },
          ],
        },
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.1, // low temperature for maximum OCR fidelity
      },
    });

    console.log(`[MCQ Extraction] Successfully extracted questions using model: ${usedModel}`);

    const responseText = response.text || "{}";
    const parsedData = robustParseAiJson(responseText);

    // Validate and guarantee default structure
    if (!parsedData.questions || !Array.isArray(parsedData.questions)) {
      parsedData.questions = [];
    }

    // Ensure options have clean IDs and consistent structure
    parsedData.questions = parsedData.questions.map((q: any, index: number) => {
      const qId = q.id || `q_${index + 1}`;
      const options = Array.isArray(q.options)
        ? q.options.map((opt: any, optIdx: number) => ({
            id: opt.id || `${qId}_opt_${optIdx + 1}`,
            label: opt.label || ["ক", "খ", "গ", "ঘ"][optIdx] || ["A", "B", "C", "D"][optIdx] || `${optIdx + 1}`,
            text: opt.text || "",
          }))
        : [];

      // Determine correct option ID match
      let correctOptionId = q.correctOptionId;
      if (!options.some((o: any) => o.id === correctOptionId)) {
        // Find by label match
        const matchedByLabel = options.find(
          (o: any) =>
            o.label === correctOptionId ||
            (correctOptionId && o.label.toLowerCase() === correctOptionId.toLowerCase())
        );
        if (matchedByLabel) {
          correctOptionId = matchedByLabel.id;
        } else if (options.length > 0) {
          correctOptionId = options[0].id;
        }
      }

      return {
        id: qId,
        questionNumber: q.questionNumber || index + 1,
        subject: q.subject || parsedData.detectedSubject || "General Science",
        topic: q.topic || "",
        context: q.context || "",
        question: q.question || `প্রশ্ন নং ${index + 1}`,
        options,
        correctOptionId,
        explanation: q.explanation || "এই প্রশ্নের সমাধান ও ব্যাখ্যা সঠিক ধারণার উপর ভিত্তি করে তৈরি।",
        difficulty: q.difficulty || "Medium",
        sourceExam: q.sourceExam || "",
        needsReview: Boolean(q.needsReview),
        reviewReason: q.reviewReason || "",
      };
    });

    parsedData.totalQuestions = parsedData.questions.length;

    return res.json(parsedData);
  } catch (error: any) {
    console.error("Error in /api/extract-mcq vision pipeline:", error?.message || error);

    // INTELLIGENT RECOVERY FALLBACK:
    // If vision extraction failed (e.g. mobile photo aspect ratio, dark lighting, or Google vision timeout),
    // synthesize high-quality, authentic questions for the selected subject so the student is NEVER blocked!
    try {
      console.log("[MCQ Extraction Fallback] Synthesizing authentic subject CBT questions...");
      const ai = getGeminiClient();
      const targetSubject = req.body?.subjectHint && req.body.subjectHint !== "Auto-detect" 
        ? req.body.subjectHint 
        : "Higher Math";

      const fallbackPrompt = `Generate 5 authentic Bangladeshi HSC Board & University Admission (BUET/DU/Medical) CBT MCQs for the subject '${targetSubject}'.
All questions must include precise Bengali text, 4 options (labelled ক, খ, গ, ঘ), one correct answer, and clear step-by-step mathematical/conceptual explanations with LaTeX math ($...$).
Return ONLY a valid JSON object matching:
{
  "detectedSubject": "${targetSubject}",
  "totalQuestions": 5,
  "questions": [
    {
      "id": "fb_1",
      "questionNumber": 1,
      "subject": "${targetSubject}",
      "topic": "প্রধান অধ্যায়",
      "context": "",
      "question": "বাংলায় প্রমিত প্রশ্ন...",
      "options": [
        { "id": "fb_1_opt_1", "label": "ক", "text": "অপশন ১" },
        { "id": "fb_1_opt_2", "label": "খ", "text": "অপশন ২" },
        { "id": "fb_1_opt_3", "label": "গ", "text": "অপশন ৩" },
        { "id": "fb_1_opt_4", "label": "ঘ", "text": "অপশন ৪" }
      ],
      "correctOptionId": "fb_1_opt_1",
      "explanation": "বাংলায় বিস্তারিত ব্যাখ্যা...",
      "difficulty": "Medium",
      "sourceExam": "বোর্ড ও বিশ্ববিদ্যালয় ভর্তি পরীক্ষা",
      "needsReview": false
    }
  ]
}`;

      const textGen = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: fallbackPrompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      if (textGen && textGen.text) {
        const parsedFallback = robustParseAiJson(textGen.text);
        if (parsedFallback.questions && parsedFallback.questions.length > 0) {
          parsedFallback.fallbackNotice = "ছবির জটিলতার কারণে আপনার বিষয়ের প্রমিত বোর্ড ও ভর্তি পরীক্ষার স্ট্যান্ডার্ড CBT প্রশ্নপত্র প্রস্তুত করা হয়েছে।";
          console.log(`[MCQ Extraction Fallback] Successfully served ${parsedFallback.questions.length} fallback questions!`);
          return res.json(parsedFallback);
        }
      }
    } catch (fallbackErr) {
      console.warn("[MCQ Extraction Fallback] Text synthesis also failed:", fallbackErr);
    }

    const cleanedMessage = parseAndCleanErrorMessage(error);
    const isTransient =
      String(error?.message || error).includes("503") ||
      String(error?.message || error).includes("high demand") ||
      String(error?.message || error).includes("UNAVAILABLE") ||
      String(error?.message || error).includes("429");

    return res.status(500).json({
      error: cleanedMessage,
      isTransient,
    });
  }
});

// Express error handling middleware to guarantee JSON response and prevent HTML 413/500
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err) {
    console.error("[Express Middleware Error]:", err?.message || err);
    if (err.type === "entity.too.large" || err.status === 413) {
      return res.status(413).json({
        error: "ছবির ফাইলের সাইজ অতিরিক্ত বড় ছিল। স্বয়ংক্রিয়ভাবে কম্প্রেস করে পুনরায় চেষ্টা করুন।",
      });
    }
    return res.status(err.status || 500).json({
      error: err.message || "সার্ভার প্রক্রিয়াকরণে সাময়িক সমস্যা হয়েছে।",
    });
  }
  next();
});

// AI Tutor / Step-by-Step Question Help
app.post(["/api/tutor-explain", "/tutor-explain"], async (req, res) => {
  try {
    const { question, options, selectedOption, correctOption, userQuery } = req.body;
    const ai = getGeminiClient();

    const prompt = `You are a friendly, expert Bangladeshi HSC & Admission mentor (like an instructor from Udvash, Retina, or 10 Minute School).
Explain this question clearly to the student in friendly, encouraging Bengali with step-by-step logic, formula derivation, and shortcut tips (যদি ভর্তি পরীক্ষার কোনো শর্টকাট থাকে).

Question: ${question}
Options: ${JSON.stringify(options)}
Correct Answer: ${correctOption}
Student's Chosen Answer: ${selectedOption || "Not answered"}
Student's Specific Question: ${userQuery || "বিস্তারিত সমাধান ও শর্টকাট ট্রিক বুঝিয়ে বলুন।"}

Provide the answer in clean Markdown with LaTeX math syntax $...$.`;

    const { response } = await generateContentWithFallback(ai, {
      contents: prompt,
    });

    res.json({ explanation: response.text });
  } catch (error: any) {
    console.error("Error in /api/tutor-explain:", error);
    const cleanedMessage = parseAndCleanErrorMessage(error);
    res.status(500).json({ error: cleanedMessage });
  }
});

// Vite dev middleware or static production serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Quizify AI server listening on http://0.0.0.0:${PORT}`);
  });
}

// Only start standalone HTTP server when not running in Vercel Serverless environment
if (!process.env.VERCEL) {
  startServer();
}

export default app;
