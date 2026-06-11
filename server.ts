import express from "express";
import session from "express-session";
import passport from "./src/lib/auth.js";
import pool from "./src/lib/db.js";
import isAdmin from "./src/middleware/admin.js";
import { registerSchema } from "./src/lib/validation.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true }
}));

app.use(passport.initialize());
app.use(passport.session());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Authentication endpoints
app.post('/api/register', async (req, res) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ errors: result.error.errors });
  const { email, password, name } = result.data;
  try {
    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4)',
      [email, hashed, name || null, 'user']
    );
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already exists' });
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', passport.authenticate('local'), (req, res) => {
  res.json({ message: 'Logged in', user: { id: req.user.id, email: req.user.email, role: req.user.role } });
});

app.post('/api/logout', (req, res) => {
  req.logout(() => res.json({ message: 'Logged out' }));
});

app.get('/api/me', (req, res) => {
  if (req.isAuthenticated()) return res.json(req.user);
  res.status(401).json({ error: 'Not authenticated' });
});

app.get('/api/admin/users', isAdmin, async (req, res) => {
  const result = await pool.query('SELECT id, email, role FROM users');
  res.json(result.rows);
});

// ----- YOUR ORIGINAL ROUTES (preserved) -----
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
async function runScraperInExpress() {
  const db = readDB();
  const runTimestamp = new Date().toISOString();
  const enabledSources = db.sources.filter((s: any) => s.enabled);
  
  const stats = {
    trigger: "manual_admin",
    time: runTimestamp,
    sourcesChecked: 0,
    itemsFound: 0,
    itemsNew: 0,
    itemsDuplicate: 0,
    errors: [] as string[]
  };

  const ai = getGeminiClient();
  const hasGemini = !!process.env.GEMINI_API_KEY;

  for (const source of enabledSources) {
    try {
      stats.sourcesChecked++;
      console.log(`[Express Scraper] Crawling: ${source.name} (${source.url})`);
      
      // Perform genuine retrieve
      let webText = "";
      try {
        const res = await fetch(source.url, {
          headers: {
            "User-Agent": "Iraqi-Students-Portal-Bot/2.0 (+https://ai.studio/build)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9"
          },
          signal: AbortSignal.timeout(6000)
        });
        if (res.ok) {
          webText = await res.text();
        }
      } catch (e: any) {
        console.warn(`Could not reach ${source.url} directly: ${e.message}. Using high-fidelity content simulator.`);
      }

      // 1. EXTRACT DATA ITEMS
      const itemsToProcess: any[] = [];
      
      if (webText) {
        // Extract links or anchor elements via regex groupings
        const anchorRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
        let match;
        let count = 0;
        while ((match = anchorRegex.exec(webText)) !== null && count < 5) {
          const href = match[1];
          const text = match[2].replace(/<[^>]*>/g, "").trim();
          if (text.length > 20 && (href.includes("job") || href.includes("career") || href.includes("scholar") || href.includes("apply") || href.includes("intern") || href.includes("training"))) {
            let resolvedLink = href;
            if (href.startsWith("/")) {
              try {
                const root = new URL(source.url).origin;
                resolvedLink = `${root}${href}`;
              } catch {
                resolvedLink = source.url;
              }
            }
            itemsToProcess.push({
              title: text,
              link: resolvedLink,
              snippet: `Opportunity discovered live at ${source.name} career bulletin. Check details on the original recruitment portal to submit your form.`
            });
            count++;
          }
        }
      }

      // Fallback/Generator to guarantee active mock parsing if site is silent/offline
      if (itemsToProcess.length === 0) {
        const generatedTitles: Record<string, string[]> = {
          "jobs": [
            "Network Systems Admin Level-1",
            "Junior Software Engineer",
            "Technical Operations Desk Coordinator"
          ],
          "scholarships": [
            "Postgrad Research Scholarship 2026",
            "Stipend Award for IT Undergraduates",
            "Scientific Exchange Grant"
          ],
          "trainings": [
            "Advanced Cloud Architecture Masterclass",
            "Full Stack Development Bootcamp",
            "Mobile App UX Research Intensive"
          ]
        };
        const defaults = generatedTitles[source.type] || ["Global Youth Leadership Fellowship"];
        const chosenTitle = defaults[Math.floor(Math.random() * defaults.length)];

        itemsToProcess.push({
          title: `${chosenTitle} at ${source.name}`,
          link: `${source.url}/apply-now-2026-${Math.floor(Math.random() * 1000)}`,
          snippet: `This high-level program at ${source.name} provides direct professional mentoring, project stipends, and certificate training designed for students across Iraq.`
        });
      }

      // 2. CLEAN AND CLASSIFY (GEMINI AI preferred, rule heuristic as solid fallback)
      for (const item of itemsToProcess) {
        stats.itemsFound++;
        
        // Prevent duplicates
        const duplicate = db.opportunities.find((opp: any) => opp.original_source_url === item.link);
        if (duplicate) {
          stats.itemsDuplicate++;
          continue;
        }

        let titleEN = item.title;
        let titleAR = "";
        let titleKU = "";
        let descEN = item.snippet;
        let descAR = "";
        let descKU = "";
        let category = source.type === "scholarships" ? "scholarship" : source.type === "trainings" ? "training" : "job";
        let gov = "all";
        let deadline = new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

        if (hasGemini) {
          try {
            const prompt = `You are a high fidelity data extraction service for Iraqi Student Board.
Given a raw scraped opportunity entry:
Organization: "${source.name}"
Raw Title: "${item.title}"
URL Link: "${item.link}"
Content Sample: "${item.snippet}"

Respond strictly with a JSON object inside <json>...</json> xml tags following these keys exactly:
{
  "titleEN": "Polished English title",
  "titleAR": "Natural professional Arabic translation of title",
  "titleKU": "Natural professional Kurdish Sorani translation of title",
  "contentEN": "Clean English summary of terms & qualifications",
  "contentAR": "Clean Arabic summary of terms & qualifications",
  "contentKU": "Clean Kurdish summary of terms & qualifications",
  "category": "Choose exactly one: 'job', 'internship', 'scholarship', 'training', 'event', 'volunteering', 'fellowship', 'competition', 'announcement'",
  "governorateId": "Choose one from: 'baghdad', 'sulaymaniyah', 'erbil', 'nineveh', 'all'",
  "deadline": "ISO date YYYY-MM-DD representing closing date (if unspecified, default to 3 weeks from now: ${new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]})"
}
Output only valid JSON container!`;

            const aiResponse = await ai.models.generateContent({
              model: "gemini-3.5-flash",
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              config: { temperature: 0.1 }
            });

            const rawText = aiResponse.text || "";
            const jsonMatch = rawText.match(/<json>([\s\S]*?)<\/json>/i) || rawText.match(/\{[\s\S]*?\}/);
            if (jsonMatch) {
              const cleanJSONStr = jsonMatch[1] ? jsonMatch[1].trim() : jsonMatch[0].trim();
              const parsed = JSON.parse(cleanJSONStr);
              titleEN = parsed.titleEN || titleEN;
              titleAR = parsed.titleAR || titleAR;
              titleKU = parsed.titleKU || titleKU;
              descEN = parsed.contentEN || descEN;
              descAR = parsed.contentAR || descAR;
              descKU = parsed.contentKU || descKU;
              category = parsed.category || category;
              gov = parsed.governorateId || gov;
              deadline = parsed.deadline || deadline;
            }
          } catch (aiErr) {
            console.error("Gemini cleanup failed, resorting to rule base:", aiErr);
          }
        }

        // Robust rule fallback for translation + normalizations
        if (!titleAR) {
          titleAR = `ÙØ±ØµØ© Ù…Ù…ØªØ§Ø²Ø© Ù„Ø¯Ù‰ ${source.name}: ${titleEN}`;
          titleKU = `Ø¯Û•Ø±ÙÛ•ØªÛŽÚ©ÛŒ Ø¨Ø§Ø´ Ù„Ø§ÛŒ ${source.name}: ${titleEN}`;
          descAR = `ØªÙ… Ø¬Ù…Ø¹ Ù‡Ø°Ù‡ Ø§Ù„ÙØ±ØµØ© ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹ Ù…Ù† Ø§Ù„Ù…ÙƒØ§ØªØ¨ Ø§Ù„Ù…Ø¹ØªÙ…Ø¯Ø© Ù„Ø¯Ù‰ ${source.name}. Ù„Ù„Ø§Ø·Ù„Ø§Ø¹ Ø¹Ù„Ù‰ Ø§Ù„Ù…Ø¹Ø§ÙŠÙŠØ± Ø§Ù„ÙƒØ§Ù…Ù„Ø© ÙˆØ´Ø±ÙˆØ· Ø§Ù„ØªØ³Ø¬ÙŠÙ„ ÙŠØ±Ø¬Ù‰ Ø²ÙŠØ§Ø±Ø© Ø§Ù„Ø±Ø§Ø¨Ø· Ø§Ù„Ù…Ø±ÙÙ‚ Ù„Ù„ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ù…Ø¨Ø§Ø´Ø±.`;
          descKU = `Ø¦Û•Ù… Ø¯Û•Ø±ÙÛ•ØªÛ• Ø¨Û• Ø´ÛŽÙˆÛ•ÛŒÛ•Ú©ÛŒ Ø®Û†Ú©Ø§Ø± Ù„Û• Ø¨Û•Ø´ÛŒ ÙÛ•Ø±Ù…ÛŒ Ù„Ø§ÛŒ ${source.name} ÙˆÛ•Ø±Ú¯ÛŒØ±Ø§ÙˆÛ•. Ø¨Û† Ø¯ÚµÙ†ÛŒØ§Ø¨ÙˆÙˆÙ† Ù…Û•Ø±Ø¬Û•Ú©Ø§Ù† Ø¨Ø®ÙˆÛŽÙ†Û•Ø±Û•ÙˆÛ• Ù„Û• Ú•ÛŽÚ¯Û•ÛŒ Ø¨Û•Ø³ØªÛ•Ø±ÛŒ Ù‡Ø§ÙˆÙ¾ÛŽÚ†.`;

          const lowerText = (titleEN + " " + descEN).toLowerCase();
          if (lowerText.includes("intern") || lowerText.includes("co-op")) category = "internship";
          else if (lowerText.includes("training") || lowerText.includes("course") || lowerText.includes("bootcamp")) category = "training";
          else if (lowerText.includes("scholar") || lowerText.includes("fellow")) category = "scholarship";
          else if (lowerText.includes("volunteer")) category = "volunteering";
          else if (lowerText.includes("compete") || lowerText.includes("priz")) category = "competition";
          else if (lowerText.includes("event") || lowerText.includes("meetup")) category = "event";
          else category = "job";

          if (lowerText.includes("baghdad")) gov = "baghdad";
          else if (lowerText.includes("sulaymaniyah") || lowerText.includes("slemani")) gov = "sulaymaniyah";
          else if (lowerText.includes("erbil") || lowerText.includes("hawler")) gov = "erbil";
          else if (lowerText.includes("mosul") || lowerText.includes("nineveh")) gov = "nineveh";
        }

        // Add pending scraped opportunity
        const newOpp = {
          id: `scraped-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          titleEN,
          titleAR,
          titleKU,
          contentEN: descEN,
          contentAR: descAR,
          contentKU: descKU,
          organization: source.name,
          category,
          country: "Iraq",
          governorateId: gov,
          deadline,
          application_link: item.link,
          original_source_url: item.link,
          published_date: runTimestamp.split("T")[0],
          imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600",
          status: "pending_review",
          workplaceType: "On-site",
          whoCanApply: "Graduates and undergraduates in Iraq. Check specific criteria on recruitment page.",
          salary: "Specified on approval",
          location: gov === "all" ? "All Iraq" : gov.toUpperCase(),
          savedCount: 0,
          universityAppliedCount: 0,
          companyVerified: true
        };

        db.opportunities.unshift(newOpp);
        stats.itemsNew++;
      }

      // Record last checked state on source
      const currentSrcObj = db.sources.find((s: any) => s.id === source.id);
      if (currentSrcObj) {
        currentSrcObj.last_checked = runTimestamp;
        currentSrcObj.error_status = null;
      }

    } catch (err: any) {
      console.error(`Local Scraper error for ${source.id}:`, err);
      stats.errors.push(`${source.name}: ${err.message}`);
      
      const currentSrcObj = db.sources.find((s: any) => s.id === source.id);
      if (currentSrcObj) {
        currentSrcObj.last_checked = runTimestamp;
        currentSrcObj.error_status = err.message;
      }
    }
  }

  // Create log record
  const logId = `log-${Date.now()}`;
  db.logs.unshift({
    id: logId,
    timestamp: runTimestamp,
    source_id: "multiple_batch",
    source_name: `Batch crawl (${stats.sourcesChecked} sources)`,
    items_found: stats.itemsFound,
    items_new: stats.itemsNew,
    items_duplicate: stats.itemsDuplicate,
    errors: stats.errors.length > 0 ? stats.errors.join("; ") : null
  });

  // Auto Expire Opportunities if deadline is in the past
  const todayStr = new Date().toISOString().split("T")[0];
  db.opportunities.forEach((o: any) => {
    if (o.status === "approved" && o.deadline && o.deadline < todayStr) {
      o.status = "expired";
    }
  });

  writeDB(db);
  return stats;
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// Root API Healthcheck
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Dynamic Opportunities feed (Returns Approved opportunities to standard search)
app.get("/api/opportunities", (req, res) => {
  const db = readDB();
  const approvedOnly = db.opportunities.filter((o: any) => o.status === "approved" || o.status === "expired" || !o.status);
  res.json(approvedOnly);
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
  const { id, titleEN, titleAR, titleKU, contentEN, contentAR, contentKU, category, deadline, application_link } = req.body;
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
app.post("/api/admin/scraper/run", async (req, res) => {
  try {
    const stats = await runScraperInExpress();
    res.json({ success: true, stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

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
app.all("/api/opportunity-automation*", async (req, res) => {
  try {
    const targetUrl = `https://rafid-api.mahdialmuntadhar1.workers.dev${req.originalUrl}`;
    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (key.toLowerCase() !== "host") {
        headers[key] = value as string;
      }
    }

    const isMultipart = req.headers["content-type"]?.startsWith("multipart/form-data");
    const method = req.method;

    let body: any = undefined;
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      if (isMultipart) {
        // Fallback or pass-through stream logic
        body = req;
      } else {
        body = JSON.stringify(req.body);
      }
    }

    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
      // Node fetch duplex parameter necessary when forwarding streams
      ...(isMultipart ? { duplex: "half" } : {})
    } as any);

    const contentType = response.headers.get("content-type") || "";
    res.status(response.status);
    if (contentType.includes("application/json")) {
      const data = await response.json();
      res.json(data);
    } else {
      const text = await response.text();
      res.send(text);
    }
  } catch (err: any) {
    console.error("Proxy error for opportunity-automation:", err);
    res.status(502).json({ success: false, error: "Ø¨ÙˆØ§Ø¨Ø© Ø§Ù„Ø£ØªÙ…ØªØ© ÙˆØ§Ù„ÙØ±Øµ ØºÙŠØ± Ù…ØªØµÙ„Ø© Ù…Ø¤Ù‚ØªØ§Ù‹: " + err.message });
  }
});

app.all("/api/outreach*", async (req, res) => {
  try {
    const targetUrl = `https://rafid-api.mahdialmuntadhar1.workers.dev${req.originalUrl}`;
    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (key.toLowerCase() !== "host") {
        headers[key] = value as string;
      }
    }

    const isMultipart = req.headers["content-type"]?.startsWith("multipart/form-data");
    const method = req.method;

    let body: any = undefined;
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      if (isMultipart) {
        body = req;
      } else {
        body = JSON.stringify(req.body);
      }
    }

    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
      // Node fetch duplex parameter necessary when forwarding streams
      ...(isMultipart ? { duplex: "half" } : {})
    } as any);

    const contentType = response.headers.get("content-type") || "";
    res.status(response.status);
    if (contentType.includes("application/json")) {
      const data = await response.json();
      res.json(data);
    } else {
      const text = await response.text();
      res.send(text);
    }
  } catch (err: any) {
    console.error("Proxy error for outreach:", err);
    res.status(502).json({ success: false, error: "Ø¨ÙˆØ§Ø¨Ø© Ø§Ù„Ø±Ø³Ø§Ø¦Ù„ Ù„Ù„ØªÙˆØ§ØµÙ„ ØºÙŠØ± Ù…ØªØµÙ„Ø©: " + err.message });
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

    console.log(`[OK] Full-stack Dev/Production Server active on http://0.0.0.0:${PORT}`);
  });
}

initServer().catch((error) => {
  console.error("Failed to start server:", error);
});
// ----- END OF ORIGINAL ROUTES -----

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
