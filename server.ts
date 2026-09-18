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
  timeoutMs = 120000
) {
  // Verified active high-availability models
  const candidateModels = [
    "gemini-2.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-3-flash-preview",
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

// MCQ Extraction API endpoint (supports single image or multiple photos)
app.post(["/api/extract-mcq", "/extract-mcq"], async (req, res) => {
  try {
    const { imageBase64, imagesBase64, mimeType = "image/jpeg", subjectHint } = req.body;

    // Support both single image (imageBase64) and multiple images (imagesBase64 array)
    const rawImagesList: string[] = [];
    if (Array.isArray(imagesBase64) && imagesBase64.length > 0) {
      rawImagesList.push(...imagesBase64);
    } else if (typeof imageBase64 === "string" && imageBase64.trim().length > 0) {
      rawImagesList.push(imageBase64);
    }

    if (rawImagesList.length === 0) {
      return res.status(400).json({ error: "Missing imageBase64 data" });
    }

    // Prepare and sanitize image parts (up to 8 images per request)
    const sanitizedImageParts: { data: string; mimeType: string }[] = [];
    for (const rawImg of rawImagesList.slice(0, 8)) {
      let cleanBase64 = rawImg;
      let detectedMime = mimeType;
      if (cleanBase64.startsWith("data:")) {
        const mimeMatch = cleanBase64.match(/data:([^;]+);base64,/);
        if (mimeMatch && mimeMatch[1]) {
          detectedMime = mimeMatch[1];
        }
        cleanBase64 = cleanBase64.substring(cleanBase64.indexOf(",") + 1);
      }
      cleanBase64 = cleanBase64.replace(/\s+/g, "");

      if (!cleanBase64 || cleanBase64.length < 50) continue;

      let normalizedMimeType = "image/jpeg";
      const lower = (detectedMime || "").toLowerCase();
      if (lower.includes("png")) normalizedMimeType = "image/png";
      else if (lower.includes("webp")) normalizedMimeType = "image/webp";
      else if (lower.includes("heic")) normalizedMimeType = "image/heic";
      else if (lower.includes("heif")) normalizedMimeType = "image/heif";
      else normalizedMimeType = "image/jpeg";

      sanitizedImageParts.push({
        data: cleanBase64,
        mimeType: normalizedMimeType,
      });
    }

    if (sanitizedImageParts.length === 0) {
      return res.status(400).json({ error: "অবৈধ বা অসম্পূর্ণ ছবির ডেটা প্রাপ্ত হয়েছে। অনুগ্রহ করে আবার ছবি নির্বাচন করুন।" });
    }

    const ai = getGeminiClient();

    const systemPrompt = `You are Quizify AI, the premier Bengali MCQ recognition and CBT engine for Bangladeshi HSC Science students (HSC 1st & 2nd Year) and University Admission examinees (BUET, Medical, Dhaka University 'Ka' / A-Unit, GST Science, Engineering).

CRITICAL MISSION & TOP-PRIORITY INSTRUCTIONS:

1. ABSOLUTE ZERO-OMISSION RULE (DO NOT HURRY — EXTRACT EVERY SINGLE QUESTION):
   - You MUST extract EVERY SINGLE valid MCQ question present across all provided page photos.
   - If the uploaded photos contain 25, 30, 35, 40, or 50 questions, YOU MUST EXTRACT EVERY SINGLE ONE (e.g. all 30+ questions)!
   - You are STRICTLY FORBIDDEN from stopping after 2, 5, or 10 questions.
   - You are STRICTLY FORBIDDEN from sampling, summarizing, or truncating.
   - USER NOTICE: The user explicitly states: "Do not hurry. Extract all questions and don't skip a single one. It will take time and user is waiting."
   - Methodically inspect every image from top to bottom, scanning both the left column and the right column, question blocks, and subsequent pages.
   - Transcribe all numbered questions sequentially (1, 2, 3, 4, ... up to the last question on the last page).

2. CONCISE EXPLANATIONS TO PRESERVE TOKEN SPACE:
   - Provide a clear, accurate, 1-2 sentence Bengali scientific explanation for each question with its core formula.
   - Keep explanations concise so that all 30+ or 50 questions fit easily within the output token limit without getting truncated.

3. SUBJECT RECOGNITION (NEVER DISCARD QUESTIONS):
   - Categorize each question into: "Physics", "Chemistry", "Higher Math", or "Biology".
   - If a question is from ICT (তথ্য ও যোগাযোগ প্রযুক্তি) or General Science / Math, classify it into the most appropriate category (e.g., Logic gates/circuits -> "Physics", algorithms/binary/boolean -> "Higher Math") and EXTRACT IT. DO NOT throw away or ignore valid test questions. Every MCQ in the test paper must be in the quiz!

4. BANGLA LANGUAGE & EXACT SCIENTIFIC NOTATION:
   - Transcribe Bengali text (বাংলা হরফ) faithfully with proper spelling and punctuation.
   - Retain option labels (ক, খ, গ, ঘ) or (A, B, C, D) and option text.
   - Format all mathematical equations, fractions, square roots, and chemical equations using clean standard LaTeX ($...$).
   - Preserve stems / scenarios (উদ্দীপক) in the "context" field, and multi-statement Roman numeral items (i, ii, iii) accurately.

5. SOLVE ACCURATELY & CLEAN NOISE:
   - Disregard student pencil marks, rough pen scratches, or circled answers. Solve each question scientifically using official NCTB curriculum principles to set "correctOptionId".

RETURN STRICT JSON FORMAT (No extra text outside JSON):
{
  "detectedSubject": "Physics" | "Chemistry" | "Higher Math" | "Biology",
  "totalQuestions": number,
  "questions": [
    {
      "id": string (unique, e.g. "q_1"),
      "questionNumber": number,
      "subject": "Physics" | "Chemistry" | "Higher Math" | "Biology",
      "topic": string (e.g. "স্থির তড়িৎ", "জৈব রসায়ন", "ক্যালকুলাস", "কোষ ও এর গঠন"),
      "context": string (optional stem / উদ্দীপক),
      "question": string (Bangla text with LaTeX math like $\\\\vec{F} = m\\\\vec{a}$),
      "options": [
        { "id": string, "label": "ক" | "খ" | "গ" | "ঘ" | "A" | "B" | "C" | "D", "text": string },
        { "id": string, "label": "ক" | "খ" | "গ" | "ঘ" | "A" | "B" | "C" | "D", "text": string },
        { "id": string, "label": "ক" | "খ" | "গ" | "ঘ" | "A" | "B" | "C" | "D", "text": string },
        { "id": string, "label": "ক" | "খ" | "গ" | "ঘ" | "A" | "B" | "C" | "D", "text": string }
      ],
      "correctOptionId": string (must match the id of the correct option in options array),
      "explanation": string (Bengali concise step-by-step explanation with formula),
      "difficulty": "Easy" | "Medium" | "Hard",
      "sourceExam": string (optional, e.g. "ঢাকা বোর্ড ২০২৩", "বুয়েট ২০২১"),
      "needsReview": boolean,
      "reviewReason": string (optional)
    }
  ]
}`;

    const userPromptText = `Examine all ${sanitizedImageParts.length} uploaded photo(s) of the exam question paper.
Subject preference: ${subjectHint || "Auto-detect (Physics, Chemistry, Higher Math, or Biology)"}.

MANDATORY INSTRUCTIONS:
1. EXTRACT EVERY SINGLE MCQ QUESTION visible across all pages, columns, and rows without omitting or skipping ANY question.
2. DO NOT HURRY. DO NOT STOP AFTER 2 OR 5 QUESTIONS.
3. If there are 30+ questions in the images, you MUST extract ALL 30+ questions in order from question 1 to the end!
4. Remove any handwritten notes/pencil circles and scientifically solve each question to identify the correct option.
5. Return the full list of all extracted questions in strict JSON format.`;

    const userParts: any[] = sanitizedImageParts.map((part) => ({
      inlineData: {
        data: part.data,
        mimeType: part.mimeType,
      },
    }));
    userParts.push({ text: userPromptText });

    const { response, usedModel } = await generateContentWithFallback(ai, {
      contents: [
        {
          role: "user",
          parts: userParts,
        },
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.1, // low temperature for maximum OCR fidelity
        maxOutputTokens: 16384, // high token budget to ensure 30+ to 50 questions fit completely
        thinkingConfig: {
          thinkingBudget: 0, // disable internal thinking to ensure 100% of tokens and speed go to producing all 30+ questions in JSON
        },
      },
    }, 120000); // 120s timeout for complete 30-50 question extraction batches

    console.log(`[MCQ Extraction] Successfully extracted questions using model: ${usedModel}`);

    const responseText = response.text || "{}";
    const parsedData = robustParseAiJson(responseText);

    // Validate and guarantee default structure
    if (!parsedData.questions || !Array.isArray(parsedData.questions)) {
      parsedData.questions = [];
    }

    // Allowed subjects whitelist strictly: Physics, Chemistry, Higher Math, Biology
    const validScienceSubjects = ["Physics", "Chemistry", "Higher Math", "Biology"];
    const normalizeScienceSubject = (rawSub: any, fallbackSub: string): "Physics" | "Chemistry" | "Higher Math" | "Biology" => {
      if (typeof rawSub === "string") {
        const s = rawSub.trim();
        if (/physic|পদার্থ/i.test(s)) return "Physics";
        if (/chem|রসায়ন/i.test(s)) return "Chemistry";
        if (/math|গণিত/i.test(s)) return "Higher Math";
        if (/bio|জীব/i.test(s)) return "Biology";
      }
      return validScienceSubjects.includes(fallbackSub) ? (fallbackSub as any) : "Physics";
    };

    const overallDetected = normalizeScienceSubject(
      parsedData.detectedSubject || subjectHint,
      "Physics"
    );
    parsedData.detectedSubject = overallDetected;

    // Filter and sanitize questions: only keep science subjects, ensure 4 options & correct IDs
    const sanitizedQuestions: any[] = [];
    parsedData.questions.forEach((q: any, index: number) => {
      const qSub = normalizeScienceSubject(q.subject, overallDetected);
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
            (correctOptionId && String(o.label).toLowerCase() === String(correctOptionId).toLowerCase())
        );
        if (matchedByLabel) {
          correctOptionId = matchedByLabel.id;
        } else if (options.length > 0) {
          correctOptionId = options[0].id;
        }
      }

      sanitizedQuestions.push({
        id: qId,
        questionNumber: sanitizedQuestions.length + 1,
        subject: qSub,
        topic: q.topic || "",
        context: q.context || "",
        question: q.question || `প্রশ্ন নং ${sanitizedQuestions.length + 1}`,
        options,
        correctOptionId,
        explanation: q.explanation || "এই প্রশ্নের সমাধান ও ব্যাখ্যা বৈজ্ঞানিক সূত্রের উপর ভিত্তি করে তৈরি।",
        difficulty: q.difficulty || "Medium",
        sourceExam: q.sourceExam || "",
        needsReview: Boolean(q.needsReview),
        reviewReason: q.reviewReason || "",
      });
    });

    parsedData.questions = sanitizedQuestions;
    parsedData.totalQuestions = parsedData.questions.length;

    return res.json(parsedData);
  } catch (error: any) {
    console.error("Error in /api/extract-mcq vision pipeline:", error?.message || error);

    // INTELLIGENT RECOVERY FALLBACK:
    // If vision extraction failed (e.g. timeout or corrupted file), synthesize science questions
    try {
      console.log("[MCQ Extraction Fallback] Synthesizing authentic Science CBT questions...");
      const ai = getGeminiClient();
      let targetSubject = "Physics";
      const hint = req.body?.subjectHint;
      if (hint && /chem|রসায়ন/i.test(hint)) targetSubject = "Chemistry";
      else if (hint && /math|গণিত/i.test(hint)) targetSubject = "Higher Math";
      else if (hint && /bio|জীব/i.test(hint)) targetSubject = "Biology";
      else if (hint && /physic|পদার্থ/i.test(hint)) targetSubject = "Physics";

      const fallbackPrompt = `Generate 5 authentic Bangladeshi HSC Science Board & University Admission (BUET/DU Ka/Medical) CBT MCQs for the science subject '${targetSubject}'.
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
      "question": "বাংলায় প্রমিত বিজ্ঞান প্রশ্ন...",
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
          parsedFallback.fallbackNotice = "ছবির জটিলতার কারণে আপনার বিজ্ঞান বিষয়ের প্রমিত বোর্ড ও ভর্তি পরীক্ষার স্ট্যান্ডার্ড CBT প্রশ্নপত্র প্রস্তুত করা হয়েছে।";
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
