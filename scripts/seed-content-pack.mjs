import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const packPath = path.join(process.cwd(), "content-seed", "content-source-pack.json");
const pack = JSON.parse(fs.readFileSync(packPath, "utf8").replace(/^\uFEFF/, ""));

const now = new Date().toISOString();

function esc(v) {
  if (v === null || v === undefined) return "";
  return String(v).replaceAll("'", "''");
}

const sqlParts = [];

sqlParts.push("-- Jamiaati content population seed");
sqlParts.push("-- Generated at " + now);
sqlParts.push("");

sqlParts.push("BEGIN TRANSACTION;");

for (const s of pack.sources) {
  sqlParts.push(`
INSERT OR IGNORE INTO sources (id, name, url, type, enabled, last_checked, error_status)
VALUES ('${esc(s.id)}', '${esc(s.name)}', '${esc(s.url)}', '${esc(s.type)}', 1, NULL, NULL);`.trim());
}

for (const item of pack.pendingOpportunities) {
  sqlParts.push(`
INSERT OR IGNORE INTO opportunities (
  id,
  titleEN,
  titleAR,
  titleKU,
  contentEN,
  contentAR,
  contentKU,
  organization,
  category,
  country,
  governorateId,
  deadline,
  application_link,
  original_source_url,
  published_date,
  imageUrl,
  status,
  created_at,
  workplaceType,
  whoCanApply,
  salary,
  location,
  savedCount,
  universityAppliedCount,
  companyVerified
)
VALUES (
  '${esc(item.id)}',
  '${esc(item.titleEN)}',
  '${esc(item.titleAR)}',
  '${esc(item.titleKU)}',
  '${esc(item.contentEN)}',
  '${esc(item.contentAR)}',
  '${esc(item.contentKU)}',
  '${esc(item.organization)}',
  '${esc(item.category)}',
  '${esc(item.country || "Iraq")}',
  '${esc(item.governorateId || "all")}',
  '${esc(item.deadline || "")}',
  '${esc(item.application_link)}',
  '${esc(item.original_source_url)}',
  '${esc(now)}',
  '${esc(item.imageUrl || "")}',
  'pending_review',
  '${esc(now)}',
  '${esc(item.workplaceType || "")}',
  '${esc(item.whoCanApply || "")}',
  '',
  '${esc(item.location || "")}',
  0,
  0,
  1
);`.trim());
}

sqlParts.push("COMMIT;");
sqlParts.push("");

const outPath = path.join(process.cwd(), "content-seed", "generated-content-seed.sql");
fs.writeFileSync(outPath, sqlParts.join("\n\n"), "utf8");

console.log("Generated SQL:", outPath);
console.log("Sources:", pack.sources.length);
console.log("Pending opportunities/posts:", pack.pendingOpportunities.length);

if (process.argv.includes("--execute")) {
  console.log("Executing against remote D1 rafid-db...");
  execFileSync("wrangler", ["d1", "execute", "rafid-db", "--remote", "--file", outPath], {
    stdio: "inherit",
    shell: true
  });
  console.log("Remote D1 seed completed.");
} else {
  console.log("Dry run only. Use --execute to insert into remote D1.");
}
