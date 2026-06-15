const fs = require("fs");

function write(path, content) {
  fs.writeFileSync(path, content, "utf8");
  console.log("wrote", path);
}

write("src/lib/feedSafety.ts", `
export function toStringArray(value: unknown): string[] {
  if (!value) return [];

  let raw: unknown = value;

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      raw = parsed;
    } catch {
      raw = trimmed.split(/[,#،؛|]/g);
    }
  }

  if (Array.isArray(raw)) {
    return Array.from(
      new Set(
        raw
          .map((item) => String(item || '').trim())
          .filter(Boolean)
      )
    ).slice(0, 8);
  }

  if (typeof raw === 'object' && raw !== null) {
    return Array.from(
      new Set(
        Object.values(raw as Record<string, unknown>)
          .map((item) => String(item || '').trim())
          .filter(Boolean)
      )
    ).slice(0, 8);
  }

  return [String(raw).trim()].filter(Boolean);
}

export function pickOpportunityImage(category: string, existing?: string): string {
  const current = String(existing || '').trim();
  if (current.startsWith('http://') || current.startsWith('https://') || current.startsWith('/')) {
    return current;
  }

  const cat = String(category || '').toLowerCase();

  if (cat.includes('scholar')) {
    return 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&q=80&w=900';
  }

  if (cat.includes('intern') || cat.includes('train')) {
    return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=900';
  }

  if (cat.includes('event') || cat.includes('competition')) {
    return 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=900';
  }

  if (cat.includes('exam') || cat.includes('announcement')) {
    return 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=900';
  }

  return 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=900';
}
`.trimStart());

let feedCard = fs.readFileSync("src/components/FeedCard.tsx", "utf8");

if (!feedCard.includes("../lib/feedSafety")) {
  feedCard = feedCard.replace(
    "import { cleanText } from '../lib/textClean';",
    "import { cleanText } from '../lib/textClean';\nimport { toStringArray } from '../lib/feedSafety';"
  );
}

if (!feedCard.includes("const safeTags = toStringArray")) {
  feedCard = feedCard.replace(
    "const cleanAuthorName = cleanText(item.author?.name || 'Student');",
    "const cleanAuthorName = cleanText(item.author?.name || 'Student');\n  const safeTags = toStringArray((item as any).tags);"
  );
}

feedCard = feedCard.replace(
  "{item.tags && item.tags.length > 0 && (",
  "{safeTags.length > 0 && ("
);

feedCard = feedCard.replace(
  "{item.tags.map(tag => (",
  "{safeTags.map(tag => ("
);

write("src/components/FeedCard.tsx", feedCard);

let futureFeed = fs.readFileSync("src/components/FutureFeed.tsx", "utf8");

if (!futureFeed.includes("../lib/feedSafety")) {
  futureFeed = futureFeed.replace(
    "import { cleanText } from '../lib/textClean';",
    "import { cleanText } from '../lib/textClean';\nimport { toStringArray, pickOpportunityImage } from '../lib/feedSafety';"
  );
}

futureFeed = futureFeed.replace(
  "const mapBackendOpportunity = (item: any): FeedItem => {",
  "const mapBackendOpportunity = (item: any, index = 0): FeedItem => {"
);

futureFeed = futureFeed.replace(
  "const imgUrl = item.image_url || item.imageUrl || '';",
  `const imgUrl = item.image_url || item.imageUrl || '';
    const safeTags = toStringArray(item.tags || item.keywords || item.categories || [categoryRaw, displayCategory]);
    const safeImageUrl = pickOpportunityImage(categoryRaw, imgUrl);
    const safeId = String(item.id || item.uuid || item.source_id || sourceUrl || applyUrl || \`\${categoryRaw}-\${titleEN}-\${index}\`);
    const backendUniversityId = cleanText(item.university_id || item.universityId || item.university || item.institution_id || item.institution_name || selectedUni || orgName || 'all');`
);

futureFeed = futureFeed.replace("id: String(item.id),", "id: safeId,");
futureFeed = futureFeed.replace(
  "avatar: imgUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=100',",
  "avatar: safeImageUrl,"
);
futureFeed = futureFeed.replace("universityId: orgName,", "universityId: backendUniversityId,");
futureFeed = futureFeed.replace("tags: [categoryRaw, displayCategory],", "tags: safeTags.length ? safeTags : [categoryRaw, displayCategory],");
futureFeed = futureFeed.replace(
  "companyLogo: imgUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=100',",
  "companyLogo: safeImageUrl,"
);
futureFeed = futureFeed.replace("imageUrl: imgUrl,", "imageUrl: safeImageUrl,");

futureFeed = futureFeed.replaceAll(
  "setOpportunities(data.opportunities.map(mapBackendOpportunity));",
  `const raw = Array.isArray((data as any)?.opportunities)
                    ? (data as any).opportunities
                    : Array.isArray((data as any)?.items)
                    ? (data as any).items
                    : Array.isArray(data as any)
                    ? (data as any)
                    : [];
                  setOpportunities(raw.map((entry: any, index: number) => mapBackendOpportunity(entry, index)));`
);

futureFeed = futureFeed.replace(
  `const featuredUniItems = filteredBaseOpportunities.filter(item => 
    item.universityId === selectedUni
  );`,
  `const selectedUniNames = [
    selectedUni,
    currentUniversity?.nameEN,
    currentUniversity?.nameAR,
    currentUniversity?.nameKU
  ].filter(Boolean).map(value => String(value).toLowerCase());

  const featuredUniItems = filteredBaseOpportunities.filter(item => {
    if (selectedUni === 'all') return true;
    const haystack = [
      item.universityId,
      item.company,
      item.author?.name,
      item.location,
      item.contentEN,
      item.contentAR,
      item.contentKU
    ].filter(Boolean).join(' ').toLowerCase();

    return selectedUniNames.some(name => name && haystack.includes(name));
  });`
);

futureFeed = futureFeed.replaceAll(".map(item => (", ".map((item, index) => (");
futureFeed = futureFeed.replaceAll("key={item.id}", "key={`${item.id}-${index}`}");

write("src/components/FutureFeed.tsx", futureFeed);

console.log("Data-loading root patch applied.");
