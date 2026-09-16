import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

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
  }
) {
  // Ordered by preference; if a model has high demand (503), immediately try next
  const candidateModels = [
    "gemini-3.8-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
  ];

  let lastError: any = null;

  for (const model of candidateModels) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[AI] Invoking model '${model}' (attempt ${attempt})...`);
        const response = await ai.models.generateContent({
          model,
          contents: requestParams.contents,
          config: requestParams.config,
        });

        if (response && response.text) {
          console.log(`[AI] Success with model '${model}' on attempt ${attempt}`);
          return { response, usedModel: model };
        }
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || String(err);
        console.warn(`[AI] Model '${model}' attempt ${attempt} failed: ${msg}`);

        const isTransient =
          msg.includes("503") ||
          msg.includes("high demand") ||
          msg.includes("UNAVAILABLE") ||
          msg.includes("429") ||
          msg.includes("RESOURCE_EXHAUSTED") ||
          err?.status === 503 ||
          err?.status === 429;

        if (isTransient && attempt === 1) {
          // Wait 1.2s before retry with same model
          await new Promise((resolve) => setTimeout(resolve, 1200));
        } else {
          // Move to next candidate model
          break;
        }
      }
    }
  }

  throw lastError || new Error("সবগুলো AI মডেলে এই মুহূর্তে সাময়িক চাপ রয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
}

function parseAndCleanErrorMessage(error: any): string {
  if (!error) return "অপ্রত্যাশিত কোনো ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।";
  const raw = typeof error === "string" ? error : error.message || JSON.stringify(error);

  if (raw.includes("503") || raw.includes("high demand") || raw.includes("UNAVAILABLE")) {
    return "AI মডেলে এই মুহূর্তে সাময়িক অতিরিক্ত ট্রাফিকের চাপ রয়েছে (503 High Demand)। অনুগ্রহ করে নিচে 'আবার চেষ্টা করুন' বাটনে চাপ দিন।";
  }
  if (raw.includes("429") || raw.includes("RESOURCE_EXHAUSTED") || raw.includes("quota")) {
    return "API অনুরোধের সীমা সাময়িকভাবে অতিক্রান্ত হয়েছে। ১-২ মিনিট অপেক্ষা করে আবার চেষ্টা করুন।";
  }
  if (raw.includes("Could not parse JSON")) {
    return "ছবি থেকে প্রশ্ন বিন্যাস করতে সমস্যা হয়েছে। অনুগ্রহ করে স্পষ্ট আলোযুক্ত সোজা ছবি আপলোড করুন।";
  }
  return raw;
}

// Initialize Google Gemini AI client
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in the environment.");
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
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Quizify AI Bangladesh Backend",
    timestamp: new Date().toISOString(),
  });
});

// MCQ Extraction API endpoint
app.post("/api/extract-mcq", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", subjectHint } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64 data" });
    }

    // Clean base64 string if data URI scheme was passed
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");

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

5. MULTI-COLUMN & MULTI-SUBJECT PAGES:
   - Question papers may contain 2 or more columns, or questions from different subjects on the same sheet (e.g. Higher Math on left column, Biology on right column).
   - Read and extract ALL valid MCQ questions from all columns.
   - Tag each question's individual "subject" accurately (e.g. "Higher Math", "Biology", "Physics", "Chemistry").

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

    const userPromptText = `Please analyze this uploaded Bangladeshi exam page carefully. Extract all MCQ questions found in the image. Subject preference: ${subjectHint || "Auto-detect from image"}. Ensure all Bangla text, LaTeX equations, chemical formulas, and units are preserved with 100% precision. Clean out any student handwritten marks or tick marks.`;

    const { response, usedModel } = await generateContentWithFallback(ai, {
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType,
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
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      // Fallback regex in case of markdown wrapping
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse JSON response from Gemini model");
      }
    }

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
    console.error("Error in /api/extract-mcq:", error);
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

// AI Tutor / Step-by-Step Question Help
app.post("/api/tutor-explain", async (req, res) => {
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

startServer();
