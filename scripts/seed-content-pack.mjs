import fs from "node:fs";
import path from "node:path";

const packPath = path.join(process.cwd(), "content-seed", "content-source-pack.json");
const pack = JSON.parse(fs.readFileSync(packPath, "utf8").replace(/^\uFEFF/, ""));
const now = new Date().toISOString();

function esc(v) {
  if (v === null || v === undefined) return "";
  return String(v).replaceAll("'", "''");
}

function sourceTypeFor(type) {
  if (type === "jobs") return "job_board";
  if (type === "scholarships") return "scholarship_portal";
  if (type === "announcements") return "university";
  if (type === "events") return "website";
  return "website";
}

function categoryScopeFor(type) {
  const allowed = new Set([
    "jobs", "scholarships", "internships", "trainings", "events",
    "volunteering", "fellowships", "competitions", "announcements",
    "registration", "exams", "mixed"
  ]);
  return allowed.has(type) ? type : "mixed";
}

const sql = [];
sql.push("-- Jamiaati real D1 content seed");
sql.push("-- Generated at " + now);
sql.push("-- Targets: opportunity_sources, opportunity_candidates, highlight_items");
sql.push("");
sql.push("BEGIN TRANSACTION;");

for (const s of pack.sources) {
  const categoryScope = categoryScopeFor(s.type);
  const sourceType = sourceTypeFor(s.type);

  sql.push(`
INSERT OR IGNORE INTO opportunity_sources (
  id,
  name,
  url,
  source_type,
  category_scope,
  country_scope,
  governorate_scope,
  language,
  is_active,
  crawl_frequency_hours,
  notes,
  type,
  active,
  enabled,
  created_at,
  updated_at
)
VALUES (
  '${esc(s.id)}',
  '${esc(s.name)}',
  '${esc(s.url)}',
  '${esc(sourceType)}',
  '${esc(categoryScope)}',
  'Iraq',
  'all',
  'mixed',
  1,
  24,
  'Seeded from Jamiaati content population pack. Pending review workflow only; no auto publish.',
  '${esc(s.type)}',
  1,
  1,
  '${esc(now)}',
  '${esc(now)}'
);`.trim());
}

for (const item of pack.pendingOpportunities) {
  if (item.category === "activity" || item.category === "student_club") {
    const category = item.category === "student_club" ? "student_club" : "activity";
    sql.push(`
INSERT OR IGNORE INTO highlight_items (
  id,
  category,
  title,
  organization,
  governorate,
  city,
  university_id,
  source_name,
  source_url,
  apply_url,
  event_date,
  deadline,
  summary,
  full_description_optional,
  image_url,
  language,
  status,
  duplicate_key,
  confidence_score,
  raw_text,
  created_at,
  updated_at
)
VALUES (
  '${esc(item.id)}',
  '${esc(category)}',
  '${esc(item.titleEN)}',
  '${esc(item.organization)}',
  '${esc(item.governorateId || "all")}',
  '${esc(item.location || "All Iraq")}',
  'all',
  '${esc(item.organization)}',
  '${esc(item.original_source_url)}',
  '${esc(item.application_link)}',
  '',
  '',
  '${esc(item.contentEN)}',
  '${esc(JSON.stringify({ titleAR: item.titleAR, titleKU: item.titleKU, contentAR: item.contentAR, contentKU: item.contentKU }))}',
  '${esc(item.imageUrl || "")}',
  'mixed',
  'pending_review',
  'seed-highlight-${esc(item.id)}',
  85,
  '${esc(item.contentEN)}',
  '${esc(now)}',
  '${esc(now)}'
);`.trim());
    continue;
  }

  const sourceId =
    item.organization?.toLowerCase().includes("daad") ? "daad-iraq-scholarship-database" :
    item.organization?.toLowerCase().includes("chevening") ? "chevening-iraq" :
    item.organization?.toLowerCase().includes("erasmus") || item.organization?.toLowerCase().includes("european") ? "erasmus-mundus-catalogue" :
    item.organization?.toLowerCase().includes("türkiye") || item.organization?.toLowerCase().includes("turkiye") ? "turkiye-scholarships" :
    item.organization?.toLowerCase().includes("campus france") ? "campus-france-iraq-scholarships" :
    null;

  sql.push(`
INSERT OR IGNORE INTO opportunity_candidates (
  id,
  source_id,
  title,
  organization,
  category,
  description,
  summary,
  eligibility,
  deadline,
  published_date,
  apply_url,
  source_url,
  image_url,
  country,
  governorate,
  city,
  language,
  salary_or_funding,
  confidence_score,
  duplicate_key,
  status,
  created_at,
  updated_at,
  titleEN,
  titleAR,
  titleKU,
  university,
  governorateId,
  source_website,
  original_source_url,
  application_link,
  sourceUrl,
  contentEN,
  contentAR,
  contentKU,
  raw_extracted_text
)
VALUES (
  '${esc(item.id)}',
  ${sourceId ? "'" + esc(sourceId) + "'" : "NULL"},
  '${esc(item.titleEN)}',
  '${esc(item.organization)}',
  '${esc(item.category)}',
  '${esc(item.contentEN)}',
  '${esc(item.contentEN)}',
  '${esc(item.whoCanApply || "")}',
  '${esc(item.deadline || "")}',
  '${esc(now)}',
  '${esc(item.application_link)}',
  '${esc(item.original_source_url)}',
  '${esc(item.imageUrl || "")}',
  '${esc(item.country || "Iraq")}',
  '${esc(item.governorateId || "all")}',
  '${esc(item.location || "")}',
  'mixed',
  '${esc(item.workplaceType || "")}',
  90,
  'seed-opportunity-${esc(item.id)}',
  'pending_review',
  '${esc(now)}',
  '${esc(now)}',
  '${esc(item.titleEN)}',
  '${esc(item.titleAR)}',
  '${esc(item.titleKU)}',
  'all',
  '${esc(item.governorateId || "all")}',
  '${esc(item.original_source_url)}',
  '${esc(item.original_source_url)}',
  '${esc(item.application_link)}',
  '${esc(item.original_source_url)}',
  '${esc(item.contentEN)}',
  '${esc(item.contentAR)}',
  '${esc(item.contentKU)}',
  '${esc(item.contentEN)}'
);`.trim());
}

sql.push("COMMIT;");
sql.push("");

const outPath = path.join(process.cwd(), "content-seed", "generated-content-seed.sql");
fs.writeFileSync(outPath, sql.join("\n\n"), "utf8");

console.log("Generated real-schema SQL:", outPath);
console.log("Sources prepared:", pack.sources.length);
console.log("Pending items prepared:", pack.pendingOpportunities.length);
console.log("Targets: opportunity_sources, opportunity_candidates, highlight_items");