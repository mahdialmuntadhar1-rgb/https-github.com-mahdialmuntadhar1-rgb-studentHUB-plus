const fs = require("fs");

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function write(path, text) {
  fs.writeFileSync(path, text, "utf8");
}

const feedPath = "src/components/FeedCard.tsx";
let feed = read(feedPath);

const oldTitleBlock =
`  const title = getLocalizedContent(item, 'title', language, showOriginal);
  const content = getLocalizedContent(item, 'content', language, showOriginal);`;

const newTitleBlock =
`  const isBadVisibleText = (value?: string) => {
    const raw = String(value || '').trim();
    if (!raw) return true;
    return (
      /^https?:\\/\\//i.test(raw) ||
      /^www\\./i.test(raw) ||
      /^blob:/i.test(raw) ||
      /^data:/i.test(raw) ||
      raw.includes('images.unsplash.com') ||
      raw.includes('auto=format') ||
      raw.includes('fit=crop') ||
      raw.includes('w=') ||
      raw.includes('q=80')
    );
  };

  const cleanMainText = (value?: string, fallback = '') => {
    const raw = String(value || '').trim();
    if (isBadVisibleText(raw)) return fallback;

    const cleaned = raw
      .replace(/https?:\\/\\/\\S+/gi, '')
      .replace(/www\\.\\S+/gi, '')
      .replace(/\\S*images\\.unsplash\\.com\\S*/gi, '')
      .replace(/\\S*auto=format\\S*/gi, '')
      .replace(/\\S*fit=crop\\S*/gi, '')
      .replace(/\\S*w=\\d+\\S*/gi, '')
      .replace(/\\S*q=80\\S*/gi, '')
      .replace(/\\s{2,}/g, ' ')
      .trim();

    return cleaned || fallback;
  };

  const safeTinyLogo = (value?: string) => {
    const cleaned = cleanMainText(value, '');
    if (!cleaned) return 'UNI';
    if (isBadVisibleText(cleaned)) return 'UNI';
    if (cleaned.length > 4) return 'UNI';
    return cleaned;
  };

  const rawTitle = getLocalizedContent(item, 'title', language, showOriginal);
  const rawContent = getLocalizedContent(item, 'content', language, showOriginal);

  const title = cleanMainText(rawTitle, 'Student Opportunity');
  const content = cleanMainText(rawContent, 'Open details to learn more and apply through the official source.');`;

if (!feed.includes(oldTitleBlock) && !feed.includes("const safeTinyLogo =")) {
  throw new Error("FeedCard title/content target not found.");
}

if (feed.includes(oldTitleBlock)) {
  feed = feed.replace(oldTitleBlock, newTitleBlock);
}

feed = feed.replace(/\{item\.companyLogo\s*\|\|\s*'[^']*'\}/g, "{safeTinyLogo(item.companyLogo)}");
feed = feed.replace(/\{item\.opportunityCategory\s*\|\|\s*'Career'\}/g, "{cleanMainText(item.opportunityCategory, 'Career')}");

write(feedPath, feed);

const futurePath = "src/components/FutureFeed.tsx";
let future = read(futurePath);
future = future.replace(/companyLogo:\s*imgUrl\s*\|\|\s*'https:\/\/images\.unsplash\.com[^']*',/g, "companyLogo: 'UNI',");
future = future.replace(/companyLogo:\s*'https:\/\/images\.unsplash\.com[^']*',/g, "companyLogo: 'UNI',");
write(futurePath, future);

const appPath = "src/App.tsx";
let app = read(appPath);
app = app.replace(/companyLogo:\s*item\.institution_logo\s*\|\|\s*'https:\/\/images\.unsplash\.com[^']*',/g, "companyLogo: 'UNI',");
app = app.replace(/companyLogo:\s*'https:\/\/images\.unsplash\.com[^']*',/g, "companyLogo: 'UNI',");
write(appPath, app);

console.log("UTF-8 safe URL leak patch applied.");
