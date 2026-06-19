const fs = require("fs");
const path = require("path");

const appPath = path.join(process.cwd(), "src", "App.tsx");
let app = fs.readFileSync(appPath, "utf8");

const newFeedState = `// Feed database state - strong browser persistence for Campus Life custom posts
  const CUSTOM_FEED_STORAGE_KEYS = [
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

    if (
      typeof safeItem.imageUrl === 'string' &&
      safeItem.imageUrl.startsWith('data:image/') &&
      safeItem.imageUrl.length > 1600000
    ) {
      safeItem.imageUrl = undefined;
      safeItem.imageAlt = safeItem.imageAlt || 'Large image removed from browser storage';
    }

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

    for (const key of CUSTOM_FEED_STORAGE_KEYS) {
      const fromLocal = readFrom(localStorage, key);
      if (fromLocal.length > 0) return fromLocal;
    }

    for (const key of CUSTOM_FEED_STORAGE_KEYS) {
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

      for (const key of CUSTOM_FEED_STORAGE_KEYS) {
        localStorage.setItem(key, payload);
      }

      for (const key of CUSTOM_FEED_STORAGE_KEYS) {
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

app = app.replace(
  /\/\/ Feed database state[\s\S]*?const \[feedItems, setFeedItems\] = useState<FeedItem\[\]>\(\(\) => \{[\s\S]*?\n  \}\);/,
  newFeedState
);

app = app.replace(
  /\/\/ Sync to local states - save only user-created custom posts\s*useEffect\(\(\) => \{\s*const customOnly = feedItems\.filter\(item => item\.id && String\(item\.id\)\.startsWith\('custom-'\)\);\s*localStorage\.setItem\('jamiaati_feed_v2', JSON\.stringify\(customOnly\)\);\s*\}, \[feedItems\]\);/s,
  `// Sync to browser storage - save only user-created Campus Life posts
  useEffect(() => {
    writeCustomFeedItemsToBrowser(feedItems);
  }, [feedItems]);`
);

app = app.replace(
  /setFeedItems\(prev => \[freshPost, \.\.\.prev\]\);/,
  `setFeedItems(prev => {
      const next = [freshPost, ...prev];
      writeCustomFeedItemsToBrowser(next);
      return next;
    });`
);

app = app.replace(
  /const handleEditFeedItem = \(id: string, updatedFields: Partial<FeedItem>\) => \{\s*setFeedItems\(prev => prev\.map\(item => \{\s*if \(item\.id === id\) \{\s*return \{\s*\.\.\.item,\s*\.\.\.updatedFields\s*\};\s*\}\s*return item;\s*\}\)\);/s,
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
  /const handleDeleteFeedItem = \(id: string\) => \{\s*setFeedItems\(prev => prev\.filter\(item => item\.id !== id\)\);/s,
  `const handleDeleteFeedItem = (id: string) => {
    setFeedItems(prev => {
      const next = prev.filter(item => item.id !== id);
      writeCustomFeedItemsToBrowser(next);
      return next;
    });`
);

if (!app.includes("writeCustomFeedItemsToBrowser")) {
  throw new Error("Persistence helper was not added.");
}

fs.writeFileSync(appPath, app, "utf8");
console.log("OK: Campus Life strong browser persistence patched.");
