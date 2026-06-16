import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// -------------------------------------------------------------
// Local JSON File Database Layer (Cloudflare D1 Emulation Engine)
// -------------------------------------------------------------
const DB_FILE = path.join(process.cwd(), "database.json");

function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return { sources: [], opportunities: [], logs: [] };
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading database.json:", err);
    return { sources: [], opportunities: [], logs: [] };
  }
}

function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing database.json:", err);
  }
}

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
// Scraping & Parsing Engine (Cloudflare Workers emulation inside Express)
// -------------------------------------------------------------

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// Root API Healthcheck
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Dynamic Opportunities feed (Returns Approved opportunities to standard search with query filtering)
app.get("/api/opportunities", (req, res) => {
  const db = readDB();
  
  // 1. Core Filtering: Filter for approved/expired opportunities
  let list = db.opportunities || [];
  
  // Enforce approved or expired status for search feed
  list = list.filter((o: any) => o.status === "approved" || o.status === "expired" || !o.status);
  
  // Map category constraint
  const allowedCategories = ["job", "scholarship", "internship", "training", "fellowship", "volunteering", "competition"];
  list = list.filter((o: any) => allowedCategories.includes(o.category));

  // 2. Query Parameters Filters
  const { type, category, governorate, university_id, institution_id, limit, offset } = req.query;

  // Filter by category or type specifically
  const catFilter = category || type;
  if (catFilter) {
    list = list.filter((o: any) => o.category?.toLowerCase() === String(catFilter).toLowerCase());
  }

  // Filter by governorate (handles "all" nicely)
  if (governorate && governorate !== "all") {
    list = list.filter((o: any) => 
      o.governorateId?.toLowerCase() === String(governorate).toLowerCase() || 
      o.governorate?.toLowerCase() === String(governorate).toLowerCase() ||
      o.governorateId === "all" ||
      o.governorate === "All Iraq"
    );
  }

  // Filter by university_id or institution_id
  const uniFilter = university_id || institution_id;
  if (uniFilter && uniFilter !== "all") {
    list = list.filter((o: any) => 
      o.universityId?.toLowerCase() === String(uniFilter).toLowerCase() ||
      o.university_id?.toLowerCase() === String(uniFilter).toLowerCase() ||
      o.universityId === "all" ||
      o.university_id === "all"
    );
  }

  // 3. Pagination Support (offset/limit)
  let result = list;
  const start = offset ? parseInt(String(offset), 10) : 0;
  const size = limit ? parseInt(String(limit), 10) : result.length;
  
  if (!isNaN(start) && !isNaN(size)) {
    result = result.slice(start, start + size);
  }

  res.json(result);
});

// Dynamic Highlights feed (Returns academic newsletters and notifications)
app.get("/api/highlights", (req, res) => {
  const db = readDB();
  
  // 1. Core Filtering: Filter for approved/expired highlights from database (if matching status)
  let list = db.opportunities || [];
  
  // Enforce approved status
  list = list.filter((o: any) => o.status === "approved" || o.status === "expired" || !o.status);
  
  // Map highlights categories
  const allowedCategories = ["event", "news", "announcement", "exam", "registration", "student_club", "activity"];
  list = list.filter((o: any) => allowedCategories.includes(o.category));

  // 2. Query Parameters Filters
  const { category, governorate, university_id, institution_id, limit, offset } = req.query;

  // Filter by category specifically
  if (category) {
    list = list.filter((o: any) => o.category?.toLowerCase() === String(category).toLowerCase());
  }

  // Filter by governorate
  if (governorate && governorate !== "all") {
    list = list.filter((o: any) => 
      o.governorateId?.toLowerCase() === String(governorate).toLowerCase() || 
      o.governorate?.toLowerCase() === String(governorate).toLowerCase() ||
      o.governorateId === "all" ||
      o.governorate === "All Iraq"
    );
  }

  // Filter by university
  const uniFilter = university_id || institution_id;
  if (uniFilter && uniFilter !== "all") {
    list = list.filter((o: any) => 
      o.universityId?.toLowerCase() === String(uniFilter).toLowerCase() ||
      o.university_id?.toLowerCase() === String(uniFilter).toLowerCase() ||
      o.universityId === "all" ||
      o.university_id === "all"
    );
  }

  // 3. Pagination Support (offset/limit)
  let result = list;
  const start = offset ? parseInt(String(offset), 10) : 0;
  const size = limit ? parseInt(String(limit), 10) : result.length;
  
  if (!isNaN(start) && !isNaN(size)) {
    result = result.slice(start, start + size);
  }

  res.json(result);
});

// Admin list of all opportunities
app.get("/api/admin/opportunities", (req, res) => {
  const db = readDB();
  res.json(db.opportunities);
});

// Admin perform moderation action (approve, reject, expire)
app.post("/api/admin/opportunities/action", (req, res) => {
  const { id, action } = req.body;
  if (!id || !action) {
    res.status(400).json({ error: "Missing required parameters: id and action." });
    return;
  }
  
  const db = readDB();
  const item = db.opportunities.find((o: any) => o.id === id);
  if (!item) {
    res.status(404).json({ error: "Opportunity not found." });
    return;
  }

  if (action === "approve") {
    item.status = "approved";
  } else if (action === "reject") {
    item.status = "rejected";
  } else if (action === "expire") {
    item.status = "expired";
  } else {
    res.status(400).json({ error: "Invalid action. Choose 'approve', 'reject', or 'expire'." });
    return;
  }

  writeDB(db);
  res.json({ success: true, item });
});

// Admin edit opportunity
app.post("/api/admin/opportunities/edit", (req, res) => {
  const { id, titleEN, titleAR, titleKU, contentEN, contentAR, contentKU, category, deadline, application_link, original_language, title_original, content_original } = req.body;
  if (!id) {
    res.status(400).json({ error: "Opportunity ID is required." });
    return;
  }

  const db = readDB();
  const item = db.opportunities.find((o: any) => o.id === id);
  if (!item) {
    res.status(404).json({ error: "Opportunity not found." });
    return;
  }

  if (titleEN) item.titleEN = titleEN;
  if (titleAR) item.titleAR = titleAR;
  if (titleKU) item.titleKU = titleKU;
  if (contentEN) item.contentEN = contentEN;
  if (contentAR) item.contentAR = contentAR;
  if (contentKU) item.contentKU = contentKU;
  if (category) item.category = category;
  if (deadline) item.deadline = deadline;
  if (original_language) item.original_language = original_language;
  if (title_original) item.title_original = title_original;
  if (content_original) item.content_original = content_original;
  if (application_link) {
    item.application_link = application_link;
    item.original_source_url = application_link;
  }

  writeDB(db);
  res.json({ success: true, item });
});

// Admin get sources
app.get("/api/admin/sources", (req, res) => {
  const db = readDB();
  res.json(db.sources);
});

// Admin save or create source
app.post("/api/admin/sources", (req, res) => {
  const { id, name, url, type, enabled } = req.body;
  if (!name || !url || !type) {
    res.status(400).json({ error: "Missing required fields: name, url, and type are required." });
    return;
  }

  const db = readDB();
  const sourceIndex = id ? db.sources.findIndex((s: any) => s.id === id) : -1;

  const sourceData = {
    id: id || `source-${Date.now()}`,
    name,
    url,
    type,
    enabled: typeof enabled === "boolean" ? enabled : true,
    last_checked: sourceIndex !== -1 ? db.sources[sourceIndex].last_checked : null,
    error_status: sourceIndex !== -1 ? db.sources[sourceIndex].error_status : null
  };

  if (sourceIndex !== -1) {
    db.sources[sourceIndex] = sourceData;
  } else {
    // Check url unique constraints
    const exists = db.sources.some((s: any) => s.url === url);
    if (exists) {
      res.status(400).json({ error: "Source Url already exists." });
      return;
    }
    db.sources.push(sourceData);
  }

  writeDB(db);
  res.json({ success: true, source: sourceData });
});

// Admin delete source
app.delete("/api/admin/sources", (req, res) => {
  const { id } = req.body;
  if (!id) {
    res.status(400).json({ error: "Source ID is required." });
    return;
  }

  const db = readDB();
  const filtered = db.sources.filter((s: any) => s.id !== id);
  
  if (filtered.length === db.sources.length) {
    res.status(404).json({ error: "Source not found." });
    return;
  }

  db.sources = filtered;
  writeDB(db);
  res.json({ success: true });
});

// Admin manual scraper trigger API

// Admin logs
app.get("/api/admin/logs", (req, res) => {
  const db = readDB();
  res.json(db.logs);
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
        mockAnswer = `### Ø£Ù‡Ù„Ø§Ù‹ Ø¨Ùƒ ÙŠØ§ Ø²Ù…ÙŠÙ„(Ø©) ÙÙŠ ØªØ·Ø¨ÙŠÙ‚ Ø¬Ø§Ù…Ø¹ØªÙƒ! ðŸ‘‹ (Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ ÙÙŠ ÙˆØ¶Ø¹ Ø§Ù„Ø§Ø³ØªØ¹Ø¯Ø§Ø¯)

Ø´ÙƒØ±Ø§Ù‹ Ù„Ø³Ø¤Ø§Ù„Ùƒ Ø­ÙˆÙ„ **"${query}"** ÙÙŠ Ø¬Ø§Ù…Ø¹Ø© **${university === 'all' ? 'Ø¹Ø±Ø§Ù‚ÙŠØ©' : university}**. 

Ø¨ØµÙØªÙŠ Ù…Ø±Ø´Ø¯Ùƒ Ø§Ù„Ø£ÙƒØ§Ø¯ÙŠÙ…ÙŠØŒ Ø¥Ù„ÙŠÙƒ ØªÙˆØ¬ÙŠÙ‡ Ø£ÙˆÙ„ÙŠ Ø³Ø±ÙŠØ¹:
1. **Ø§Ù„ØºÙŠØ§Ø¨Ø§Øª ÙˆØ§Ù„Ø¥Ù†Ø°Ø§Ø±Ø§Øª:** Ø±Ø§Ø¬Ø¹ Ù…ÙƒØªØ¨ Ù…Ø¹Ø§ÙˆÙ† Ø§Ù„Ø¹Ù…ÙŠØ¯ Ù„Ø´Ø¤ÙˆÙ† Ø§Ù„Ø·Ù„Ø¨Ø© ÙÙˆØ±Ø§Ù‹ ÙˆÙ‚Ø¯Ù… Ø·Ù„Ø¨Ø§Ù‹ Ø±Ø³Ù…ÙŠØ§Ù‹ Ø¥Ø°Ø§ ÙƒØ§Ù† Ù„Ø¯ÙŠÙƒ Ø¹Ø°Ø± Ø·Ø¨ÙŠ Ù…Ø¹ØªÙ…Ø¯ Ù…Ù† Ù…Ø³ØªØ´ÙÙ‰ Ø­ÙƒÙˆÙ…ÙŠ.
2. **Ø§Ù„ØªØ¯Ø±ÙŠØ¨ ÙˆØ§Ù„Ù…Ø³ØªÙ‚Ø¨Ù„:** ØªÙÙ‚Ø¯ Ø¬Ø²Ø¡ **"Ù…Ø³ØªÙ‚Ø¨Ù„Ùƒ"** ÙÙŠ Ø§Ù„ØªØ·Ø¨ÙŠÙ‚ Ù„Ù„ØªÙ‚Ø¯ÙŠÙ… Ø¹Ù„Ù‰ Ø£Ø­Ø¯Ø« Ø§Ù„ÙØ±Øµ Ø§Ù„ØªØ¯Ø±ÙŠØ¨ÙŠØ© ÙˆØ§Ù„Ù…Ù†Ø­ Ø§Ù„Ù…ØªØ§Ø­Ø© Ù„Ø·Ù„Ø§Ø¨ Ù…Ø­Ø§ÙØ¸Ø© **${governorate}**.
3. **Ù„Ù„Ø§Ø³ØªØ²Ø§Ø¯Ø©:** ÙˆØ§ÙƒØ¨ Ø§Ù„Ù…Ù†Ø§Ù‚Ø´Ø§Øª ÙÙŠ ØªØ¨ÙˆÙŠØ¨ **"Ø§Ø³Ø£Ù„"** Ù„Ù…Ø´Ø§Ø±ÙƒØ© Ø²Ù…Ù„Ø§Ø¦Ùƒ Ù…Ù† Ù†ÙØ³ Ø§Ù„Ù‚Ø³Ù… Ø§Ù„Ø¢Ø±Ø§Ø¡.

*(Ù…Ù„Ø§Ø­Ø¸Ø©: Ù‡Ø°Ø§ Ø±Ø¯ Ù†Ø§Ø¨Ø¹ Ù…Ù† Ù†Ø¸Ø§Ù… Ø§Ù„Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„Ø£ÙƒØ§Ø¯ÙŠÙ…ÙŠØ© Ø§Ù„Ù…ØµØºØ±ØŒ Ù„ØªÙØ¹ÙŠÙ„ ÙƒØ§Ù…Ù„ Ù‚Ø¯Ø±Ø§Øª Ø°ÙƒØ§Ø¡ GeminiØŒ ÙŠØ±Ø¬Ù‰ ØªÙ‡ÙŠØ¦Ø© Ù…ÙØªØ§Ø­ GEMINI_API_KEY ÙÙŠ Ù„ÙˆØ­Ø© Ø¶Ø¨Ø· Ø§Ù„Ø£Ø³Ø±Ø§Ø±).*`;
      } else if (lang === "ku") {
        mockAnswer = `### Ø³ÚµØ§Ùˆ Ù‡Ø§ÙˆÚ•ÛŽÛŒ Ø²Ø§Ù†Ú©Û†! ðŸ‘‹ (ÙˆÛ•ÚµØ§Ù…ÛŒ Ø¦Ø§Ù…Ø§Ø¯Û•Ú©Ø±Ø§ÙˆÛŒ Ø®ÛŽØ±Ø§)

Ø³ÙˆÙ¾Ø§Ø³ Ø¨Û† Ù¾Ø±Ø³ÛŒØ§Ø±Û•Ú©Û•Øª Ø¯Û•Ø±Ø¨Ø§Ø±Û•ÛŒ **"${query}"** Ù„Û• Ø®ÙˆÛŽÙ†Ø¯Ù†Ú¯Û•/Ø²Ø§Ù†Ú©Û†ÛŒ **${university === 'all' ? 'Ø¹ÛŽØ±Ø§Ù‚' : university}**.

ÙˆÛ•Ú© Ú•Ø§ÙˆÛŽÚ˜Ú©Ø§Ø±ÛŒ Ø¦Û•Ú©Ø§Ø¯ÛŒÙ…ÛŒ ØªÛ†:
1. **Ø¦Ø§Ù…Ø§Ø¯Û•Ù†Û•Ø¨ÙˆÙˆÙ†:** Ø³Û•Ø±Ø¯Ø§Ù†ÛŒ ÛŒØ§Ø±ÛŒØ¯Û•Ø¯Û•Ø±ÛŒ Ú•Ø§Ú¯Ø± Ø¨Ú©Û• Ø¨Û† Ú©Ø§Ø±ÙˆØ¨Ø§Ø±ÛŒ Ø®ÙˆÛŽÙ†Ø¯Ú©Ø§Ø±Ø§Ù† Ø¨Û•Ù¾Û•Ù„Û• Ø¦Û•Ú¯Û•Ø± Ù…Û†ÚµÛ•ØªÛŒ Ù¾Ø²ÛŒØ´Ú©ÛŒØª Ù‡Û•ÛŒÛ•.
2. **Ø¯Ø§Ù‡Ø§ØªÙˆÙˆØª:** Ø³Û•Ø±Ø¯Ø§Ù†ÛŒ Ø¨Û•Ø´ÛŒ **"Ø¯Ø§Ù‡Ø§ØªÙˆÙˆØª"** Ø¨Ú©Û• Ø¨Û† Ø¯Û†Ø²ÛŒÙ†Û•ÙˆÛ•ÛŒ Ù‡Û•Ù„ÛŒ Ú©Ø§Ø± Ùˆ Ù…Û•Ø´Ù‚ Ù„Û• Ù¾Ø§Ø±ÛŽØ²Ú¯Ø§ÛŒ **${governorate}**.
3. **Ù‡Ø§ÙˆÚ©Ø§Ø±ÛŒ:** Ù„Û• Ø¨Û•Ø´ÛŒ **"Ø¨Ù¾Ø±Ø³Û•"** Ù‡Ø§ÙˆÚ©Ø§Ø±ÛŒ ÙˆÛ•Ø±Ø¨Ú¯Ø±Û• Ù„Û• Ø®ÙˆÛŽÙ†Ø¯Ú©Ø§Ø±Ø§Ù†ÛŒ ØªØ±.

*(ØªÛŽØ¨ÛŒÙ†ÛŒ: Ø¨Û† Ú†Ø§Ù„Ø§Ú©Ú©Ø±Ø¯Ù†ÛŒ ØªÙ‡â€ŒÙˆØ§ÙˆÛŒ Ø³ÛŒØ³ØªÙ‡â€ŒÙ…ÛŒ Ù„ÛŽÚ©Ø¯Ø§Ù†Ù‡â€ŒÙˆÙ‡â€ŒÛŒ Ø²ÛŒØ±Û•Ú©ÛŒ GeminiØŒ ØªÚ©Ø§ÛŒÛ• Ú©Ù„ÛŒÙ„Û• Ù†Ù‡ÛŽÙ†ÛŒÛŒÛ•Ú©Û• Ù„Û• Ø¨Û•Ø´ÛŒ Ù†Ù‡ÛŽÙ†ÛŒÛŒÛ•Ú©Ø§Ù† Ø¬ÛŽØ¨Û•Ø¬ÛŽ Ø¨Ú©Û•).*`;
      } else {
        mockAnswer = `### Hello there, fellow student! ðŸ‘‹ (Offline Knowledge Base Response)

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

    const systemInstruction = `You are Al-Murshed (Ø§Ù„Ù…Ø±Ø´Ø¯), a warm, supportive, motivating, and highly knowledgeable AI Campus Advisor built into the "Iraqi Campus Social App".
    Your entire mission is to help Iraqi university students, fresh graduates, teachers, and staff navigate their academics, careers, and college lives.
    You possess deep, accurate knowledge of the Iraqi higher education system under the Ministry of Higher Education and Scientific Research (MoHESR), including common policies (e.g., Ø¨Ø±Ø§Ø¡Ø© Ø°Ù…Ø©, Ø¥Ù†Ø°Ø§Ø± ØºÙŠØ§Ø¨Ø§Øª, Ù…Ø¹Ø§ÙˆÙ† Ø§Ù„Ø¹Ù…ÙŠØ¯, Ù…Ù„Ø§Ø²Ù…, Ø¹Ø¨ÙˆØ±, ØªØ­Ù…ÙŠÙ„, Ù…Ø¹Ø¯Ù„ ØªØ±Ø§ÙƒÙ…ÙŠ).
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
// Proximity Routing & Live Workers Proxying (Outreach & Automation)
// -------------------------------------------------------------


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

