const fs = require("fs");
const path = require("path");

const appPath = path.join(process.cwd(), "src", "App.tsx");
const feedCardPath = path.join(process.cwd(), "src", "components", "FeedCard.tsx");
const cssPath = path.join(process.cwd(), "src", "index.css");

function read(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

function write(file, content) {
  fs.writeFileSync(file, content, "utf8");
}

let app = read(appPath);

if (!app) {
  throw new Error("src/App.tsx not found.");
}

/**
 * 1) Strong Campus Life browser persistence.
 * This does NOT change design. It only makes custom-* posts safer after refresh.
 */
if (!app.includes("SAFE_MVP_CUSTOM_FEED_STORAGE_KEYS")) {
  const feedStatePattern =
    /\/\/ Feed database state[\s\S]*?const \[feedItems, setFeedItems\] = useState<FeedItem\[\]>\(\(\) => \{[\s\S]*?\n  \}\);/;

  const strongFeedState = `// Feed database state - SAFE_MVP strong browser persistence for Campus Life custom posts
  const SAFE_MVP_CUSTOM_FEED_STORAGE_KEYS = [
    'jamiaati_feed_v2',
    'jamiaati_feed_v2_backup',
    'jamiaati_custom_feed_backup'
  ];

  const cleanCustomFeedItemForStorage = (item: any): FeedItem | null => {
    if (!item?.id || !String(item.id).startsWith('custom-')) return null;

    const safeItem: any = {
      ...item,
      commentsList: Array.isArray(item.commentsList) ? item.commentsList : [],
      tags: Array.isArray(item.tags) ? item.tags : ['StudentShare', 'CampusLife']
    };

    // Keep normal compressed images, remove only dangerously huge base64 images.
    if (
      typeof safeItem.imageUrl === 'string' &&
      safeItem.imageUrl.startsWith('data:image/') &&
      safeItem.imageUrl.length > 1600000
    ) {
      safeItem.imageUrl = undefined;
      safeItem.imageAlt = safeItem.imageAlt || 'Large image removed from browser storage';
    }

    // Never store huge profile/avatar data inside posts.
    if (
      safeItem.author &&
      typeof safeItem.author.avatar === 'string' &&
      safeItem.author.avatar.startsWith('data:image/')
    ) {
      safeItem.author = {
        ...safeItem.author,
        avatar: defaultUserProfile.avatar
      };
    }

    return safeItem as FeedItem;
  };

  const readCustomFeedItemsFromBrowser = (): FeedItem[] => {
    const readFrom = (storage: Storage | null, key: string): FeedItem[] => {
      if (!storage) return [];
      const raw = storage.getItem(key);
      if (!raw) return [];

      try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        return parsed
          .map(cleanCustomFeedItemForStorage)
          .filter(Boolean) as FeedItem[];
      } catch (error) {
        console.warn('Could not read saved Campus Life posts from', key, error);
        return [];
      }
    };

    for (const key of SAFE_MVP_CUSTOM_FEED_STORAGE_KEYS) {
      const fromLocal = readFrom(localStorage, key);
      if (fromLocal.length > 0) return fromLocal;
    }

    for (const key of SAFE_MVP_CUSTOM_FEED_STORAGE_KEYS) {
      const fromSession = readFrom(sessionStorage, key);
      if (fromSession.length > 0) return fromSession;
    }

    return [];
  };

  const writeCustomFeedItemsToBrowser = (items: FeedItem[]) => {
    const customOnly = items
      .map(cleanCustomFeedItemForStorage)
      .filter(Boolean) as FeedItem[];

    const saveAll = (payloadItems: FeedItem[]) => {
      const payload = JSON.stringify(payloadItems);

      for (const key of SAFE_MVP_CUSTOM_FEED_STORAGE_KEYS) {
        localStorage.setItem(key, payload);
      }

      for (const key of SAFE_MVP_CUSTOM_FEED_STORAGE_KEYS) {
        sessionStorage.setItem(key, payload);
      }
    };

    try {
      saveAll(customOnly);
    } catch (error) {
      console.warn('Campus Life storage quota issue. Saving text-first backup.', error);

      const textOnly = customOnly.map((item: any) => ({
        ...item,
        imageUrl:
          typeof item.imageUrl === 'string' && item.imageUrl.startsWith('data:image/')
            ? undefined
            : item.imageUrl,
        imageAlt: item.imageAlt || 'Image removed from browser backup'
      }));

      try {
        saveAll(textOnly as FeedItem[]);
      } catch (fallbackError) {
        console.error('Could not save Campus Life posts even as text backup.', fallbackError);
      }
    }
  };

  const [feedItems, setFeedItems] = useState<FeedItem[]>(() => readCustomFeedItemsFromBrowser());`;

  if (!feedStatePattern.test(app)) {
    throw new Error("Could not find feedItems state block. Stop before changing anything.");
  }

  app = app.replace(feedStatePattern, strongFeedState);
}

/**
 * 2) Replace old simple save effect with safe save effect.
 */
if (!app.includes("SAFE_MVP_SYNC_CUSTOM_POSTS")) {
  const oldSaveEffect =
    /\/\/ Sync to local states - save only user-created custom posts\s*useEffect\(\(\) => \{\s*const customOnly = feedItems\.filter\(item => item\.id && String\(item\.id\)\.startsWith\('custom-'\)\);\s*localStorage\.setItem\('jamiaati_feed_v2', JSON\.stringify\(customOnly\)\);\s*\}, \[feedItems\]\);/;

  const newSaveEffect = `// SAFE_MVP_SYNC_CUSTOM_POSTS
  // Sync to browser storage - save only user-created Campus Life posts.
  useEffect(() => {
    writeCustomFeedItemsToBrowser(feedItems);
  }, [feedItems]);`;

  app = app.replace(oldSaveEffect, newSaveEffect);
}

/**
 * 3) Make add/edit/delete save immediately too.
 */
app = app.replace(
  /setFeedItems\(prev => \[freshPost, \.\.\.prev\]\);/,
  `setFeedItems(prev => {
      const next = [freshPost, ...prev];
      writeCustomFeedItemsToBrowser(next);
      return next;
    });`
);

app = app.replace(
  /const handleEditFeedItem = \(id: string, updatedFields: Partial<FeedItem>\) => \{\s*setFeedItems\(prev => prev\.map\(item => \{\s*if \(item\.id === id\) \{\s*return \{\s*\.\.\.item,\s*\.\.\.updatedFields\s*\};\s*\}\s*return item;\s*\}\)\);/,
  `const handleEditFeedItem = (id: string, updatedFields: Partial<FeedItem>) => {
    setFeedItems(prev => {
      const next = prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            ...updatedFields
          };
        }
        return item;
      });
      writeCustomFeedItemsToBrowser(next);
      return next;
    });`
);

app = app.replace(
  /const handleDeleteFeedItem = \(id: string\) => \{\s*setFeedItems\(prev => prev\.filter\(item => item\.id !== id\)\);/,
  `const handleDeleteFeedItem = (id: string) => {
    setFeedItems(prev => {
      const next = prev.filter(item => item.id !== id);
      writeCustomFeedItemsToBrowser(next);
      return next;
    });`
);

if (!app.includes("writeCustomFeedItemsToBrowser")) {
  throw new Error("Persistence helper missing after patch.");
}

write(appPath, app);
console.log("OK: App post persistence is safe.");

/**
 * 4) FeedCard safety: do not use profile avatar as post image fallback.
 */
let feed = read(feedCardPath);
if (feed) {
  feed = feed.replace(
    /const candidates = \[\s*item\.imageUrl,\s*item\.videoThumbnail,\s*item\.companyLogo,\s*item\.author\?\.avatar\s*\];/s,
    `const candidates = [
    item.imageUrl,
    item.videoThumbnail,
    item.companyLogo
  ];`
  );

  write(feedCardPath, feed);
  console.log("OK: FeedCard avatar fallback removed if present.");
}

/**
 * 5) Gentle public launch CSS only: no aggressive layout changes.
 */
let css = read(cssPath);
if (css && !css.includes("SAFE_MVP_GENTLE_CSS")) {
  css += `

/* SAFE_MVP_GENTLE_CSS */
/* Hide obvious public debug/admin labels without changing layout heavily */
.mvp-debug,
.debug-only,
.test-only {
  display: none !important;
}

/* Prevent uploaded images from stretching badly */
img {
  max-width: 100%;
}

/* Keep Campus Life images visually stable */
article img {
  object-fit: cover;
}
`;
  write(cssPath, css);
  console.log("OK: Gentle MVP CSS added.");
}
