import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client to avoid crashes if GEMINI_API_KEY is not initially configured
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY is not defined in environment variables. Running in mock responder fallback mode.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// Root API Healthcheck
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Real-time AI Academic Mentor endpoint
app.post("/api/ask-ai", async (req, res) => {
  const { query, lang = "en", governorate = "all", university = "all", anonymous = false } = req.body;

  if (!query || typeof query !== "string") {
    res.status(400).json({ error: "Query parameters are required." });
    return;
  }

  // Check if API key is present
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Elegant fallback simulation when API key is missing
    console.log("No API key. Falling back to local offline Iraq university knowledge base simulator.");
    setTimeout(() => {
      let mockAnswer = "";
      if (lang === "ar") {
        mockAnswer = `### أهلاً بك يا زميل(ة) في تطبيق جامعتك! 👋 (الذكاء الاصطناعي في وضع الاستعداد)

شكراً لسؤالك حول **"${query}"** في جامعة **${university === 'all' ? 'عراقية' : university}**. 

بصفتي مرشدك الأكاديمي، إليك توجيه أولي سريع:
1. **الغيابات والإنذارات:** راجع مكتب معاون العميد لشؤون الطلبة فوراً وقدم طلباً رسمياً إذا كان لديك عذر طبي معتمد من مستشفى حكومي.
2. **التدريب والمستقبل:** تفقد جزء **"مستقبلك"** في التطبيق للتقديم على أحدث الفرص التدريبية والمنح المتاحة لطلاب محافظة **${governorate}**.
3. **للاستزادة:** واكب المناقشات في تبويب **"اسأل"** لمشاركة زملائك من نفس القسم الآراء.

*(ملاحظة: هذا رد نابع من نظام المعالجة الأكاديمية المصغر، لتفعيل كامل قدرات ذكاء Gemini، يرجى تهيئة مفتاح GEMINI_API_KEY في لوحة ضبط الأسرار).*`;
      } else if (lang === "ku") {
        mockAnswer = `### سڵاو هاوڕێی زانکۆ! 👋 (وەڵامی ئامادەکراوی خێرا)

سوپاس بۆ پرسیارەکەت دەربارەی **"${query}"** لە خوێندنگە/زانکۆی **${university === 'all' ? 'عێراق' : university}**.

وەک ڕاوێژکاری ئەکادیمی تۆ:
1. **ئامادەنەبوون:** سەردانی یاریدەدەری ڕاگر بکە بۆ کاروباری خوێندکاران بەپەلە ئەگەر مۆڵەتی پزیشکیت هەیە.
2. **داهاتووت:** سەردانی بەشی **"داهاتووت"** بکە بۆ دۆزینەوەی هەلی کار و مەشق لە پارێزگای **${governorate}**.
3. **هاوکاری:** لە بەشی **"بپرسە"** هاوکاری وەربگرە لە خوێندکارانی تر.

*(تێبینی: بۆ چالاککردنی ته‌واوی سیسته‌می لێکدانه‌وه‌ی زیرەکی Gemini، تکایە کلیلە نهێنییەکە لە بەشی نهێنییەکان جێبەجێ بکە).*`;
      } else {
        mockAnswer = `### Hello there, fellow student! 👋 (Offline Knowledge Base Response)

Thank you for asking about **"${query}"** regarding **${university === 'all' ? 'your university' : university}** in **${governorate === 'all' ? 'Iraq' : governorate}**.

Here is my initial guidance for you:
1. **Attendance Warning:** If this is about absences or warning cards, immediately visit the Assistant Dean of Student Affairs with any official hospital documents.
2. **Your Future:** Browse our **"Your Future"** tab in the app to check listings for internships, career prep courses, and scholarships tailored to your governorate.
3. **Collaboration:** Share your questions publicly or anonymously in the **"Ask"** section to get instant answers from other seniors and staff.

*(Note: This is a pre-generated expert response. To fully activate live AI answers, please configure the GEMINI_API_KEY in the Secrets settings).*`;
      }
      res.json({ text: mockAnswer, model: "Local Advisor" });
    }, 1200);
    return;
  }

  try {
    const ai = getGeminiClient();

    const systemInstruction = `You are Al-Murshed (المرشد), a warm, supportive, motivating, and highly knowledgeable AI Campus Advisor built into the "Iraqi Campus Social App".
    Your entire mission is to help Iraqi university students, fresh graduates, teachers, and staff navigate their academics, careers, and college lives.
    You possess deep, accurate knowledge of the Iraqi higher education system under the Ministry of Higher Education and Scientific Research (MoHESR), including common policies (e.g., براءة ذمة, إنذار غيابات, معاون العميد, ملازم, عبور, تحميل, معدل تراكمي).
    You are familiar with the job market in Iraq (companies like Zain, Asiacell, Korek, local tech startups in Erbil/Baghdad/Basra, development NGOs, and universities).

    Context for current user query:
    - User Language requested: ${lang === 'ar' ? 'Arabic' : lang === 'ku' ? 'Kurdish' : 'English'}. Respond strictly in that language.
    - Active Governorate context: ${governorate}
    - Active University context: ${university}
    - Question submitted anonymously: ${anonymous ? 'Yes' : 'No'}

    Styling rules:
    - Always respond warmly and authentically.
    - Write structured responses using Markdown (headings, bold text, bullet points).
    - Keep answers clear, encouraging, and highly actionable (within 3-4 short paragraphs maximum).
    - Use positive, energetic student-centric vernacular suitable for modern Iraq or Kurdistan.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: query }],
        },
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "I was unable to formulate an answer. Please try again in a moment.";
    res.json({ text: replyText, model: "gemini-3.5-flash" });

  } catch (err: any) {
    console.error("Gemini Endpoint Error:", err);
    res.status(500).json({ error: "Failed to communicate with AI Advisor: " + err.message });
  }
});

// -------------------------------------------------------------
// Vite or Static Asset Middlewares
// -------------------------------------------------------------
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    // Spin up Vite in middleware mode for ultra-fast local sandbox reload
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production mode (from compiled /dist)
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[OK] Full-stack Dev/Production Server active on http://0.0.0.0:${PORT}`);
  });
}

initServer().catch((error) => {
  console.error("Failed to start server:", error);
});
