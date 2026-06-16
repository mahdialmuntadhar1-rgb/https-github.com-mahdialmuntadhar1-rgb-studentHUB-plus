import fs from "fs";
import path from "path";

const root = process.cwd();
const BACKEND_URL = process.env.VITE_BACKEND_URL || "https://rafid-api.mahdialmuntadhar1.workers.dev";

const results = [];
let blockers = 0;

function record(name, ok, detail = "") {
  results.push({ name, ok, detail });
  if (!ok) blockers++;
}

function readSafe(file) {
  try {
    return fs.readFileSync(path.join(root, file), "utf8");
  } catch {
    return "";
  }
}

function listSourceFiles(dir) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return [];
  const out = [];
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const full = path.join(abs, entry.name);
    const rel = path.relative(root, full).replace(/\\/g, "/");
    if (entry.isDirectory()) {
      if (!["node_modules", "dist", ".git"].includes(entry.name)) {
        out.push(...listSourceFiles(rel));
      }
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      out.push(rel);
    }
  }
  return out;
}

async function fetchJson(url, required = true) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    const text = await res.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }

    clearTimeout(timer);
    return { ok: res.ok, status: res.status, json, text };
  } catch (err) {
    clearTimeout(timer);
    return { ok: false, status: 0, json: null, text: err.message };
  }
}

const packageJson = JSON.parse((readSafe("package.json") || "{}").replace(/^\\uFEFF/, ""));
record("package.json has smoke:public script", !!packageJson.scripts?.["smoke:public"], "Expected npm run smoke:public");

const sourceFiles = listSourceFiles("src");
const sourceText = sourceFiles.map((f) => readSafe(f)).join("\n");

record("No public mock token generation remains", !sourceText.includes("mock_token_for_student_hub") && !sourceText.includes("mock_token_"), "Remove mock token strings from src");
record("No forced initialFeedItems fallback remains", !sourceText.includes("[...customOnly, ...initialFeedItems]"), "Public feed must not force demo items");
record("Backend URL is configurable", readSafe("src/lib/api.ts").includes("VITE_BACKEND_URL"), "src/lib/api.ts should use VITE_BACKEND_URL fallback");
record("Arabic is default language", readSafe("src/App.tsx").includes("useState<Language>('ar')"), "App should default to Arabic for public launch");
record("Public empty-state text exists", sourceText.includes("No published opportunities yet") && sourceText.includes("لا توجد فرص منشورة حالياً"), "Need clean empty state");

record("API base configured", !!BACKEND_URL, BACKEND_URL);

const health = await fetchJson(`${BACKEND_URL}/api/health`, false);
record("Health endpoint reachable or safely optional", health.ok || health.status === 404 || health.status === 405, `status=${health.status}`);

const institutions = await fetchJson(`${BACKEND_URL}/api/institutions?limit=5&offset=0`);
record("Institutions endpoint returns JSON", institutions.ok && !!institutions.json, `status=${institutions.status}`);

const opportunities = await fetchJson(`${BACKEND_URL}/api/opportunities`);
record("Opportunities endpoint returns JSON", opportunities.ok && !!opportunities.json, `status=${opportunities.status}`);

let oppList = [];
if (Array.isArray(opportunities.json)) {
  oppList = opportunities.json;
} else if (Array.isArray(opportunities.json?.opportunities)) {
  oppList = opportunities.json.opportunities;
} else if (Array.isArray(opportunities.json?.items)) {
  oppList = opportunities.json.items;
}

const forbiddenStatuses = new Set(["pending", "pending_review", "rejected", "expired"]);
const leaked = oppList.filter((o) => forbiddenStatuses.has(String(o.status || "").toLowerCase()));
record("Public opportunities do not expose pending/rejected/expired", leaked.length === 0, `leaked=${leaked.length}, total=${oppList.length}`);

const percentage = blockers === 0 ? 90 : blockers <= 2 ? 82 : blockers <= 4 ? 75 : 68;

const report = `# PUBLIC SHIPPING FINAL STATUS

Generated: ${new Date().toISOString()}

## Commands expected
- npm run lint
- npm run build
- npm run smoke:public

## Smoke results

${results.map((r) => `- ${r.ok ? "PASS" : "FAIL"} - ${r.name}${r.detail ? ` (${r.detail})` : ""}`).join("\n")}

## Remaining blocker count
${blockers}

## Estimated public shipping readiness
${percentage}%

## Interpretation
${blockers === 0
  ? "Core public-shipping smoke checks passed. The app is close to public shipping. Final live deployment verification is still required."
  : "There are still public-shipping blockers. Fix the failed smoke checks before public launch."}
`;

fs.writeFileSync(path.join(root, "PUBLIC_SHIPPING_FINAL_STATUS.md"), report, "utf8");
console.log(report);

if (blockers > 0) {
  process.exitCode = 1;
}
