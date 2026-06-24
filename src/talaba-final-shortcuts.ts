type TalabaCategory = {
  id: string;
  apiCategory: string;
  icon: string;
  ar: string;
  ku: string;
  en: string;
};

const TALABA_API = 'https://rafid-api.mahdialmuntadhar1.workers.dev';

const categories: TalabaCategory[] = [
  { id: 'all', apiCategory: '', icon: '🌐', ar: 'الكل', ku: 'هەموو', en: 'All' },
  { id: 'job', apiCategory: 'job', icon: '💼', ar: 'فرص العمل', ku: 'دەرفەتی کار', en: 'Jobs' },
  { id: 'scholarship', apiCategory: 'scholarship', icon: '🎓', ar: 'المنح', ku: 'بورسیەکان', en: 'Scholarships' },
  { id: 'news', apiCategory: 'news', icon: '📰', ar: 'الأخبار', ku: 'هەواڵەکان', en: 'News' },
  { id: 'event', apiCategory: 'event', icon: '📅', ar: 'الفعاليات', ku: 'چالاکییەکان', en: 'Events' },
  { id: 'training', apiCategory: 'training', icon: '🧠', ar: 'التدريب', ku: 'ڕاهێنان', en: 'Training' },
  { id: 'internship', apiCategory: 'internship', icon: '🧪', ar: 'التدريب العملي', ku: 'مەشق', en: 'Internships' },
  { id: 'exam', apiCategory: 'exam', icon: '📝', ar: 'الامتحانات والتسجيل', ku: 'تاقیکردنەوە و تۆمارکردن', en: 'Exams / Registration' },
];

let activeShortcut = 'campus';
let currentLimit = 20;

function textOf(el: Element | null): string {
  return (el?.textContent || '').replace(/\s+/g, ' ').trim();
}

function findElementByText(words: string[]): HTMLElement | null {
  const all = Array.from(document.querySelectorAll<HTMLElement>('button, a, div, span'));
  return all.find((el) => {
    const t = textOf(el).toLowerCase();
    return words.every((w) => t.includes(w.toLowerCase()));
  }) || null;
}

function findOldTabContainer(): HTMLElement | null {
  const all = Array.from(document.querySelectorAll<HTMLElement>('div, section, nav'));

  let best: HTMLElement | null = null;

  for (const el of all) {
    const t = textOf(el).toLowerCase();

    if (
      t.includes('opportunities') &&
      (t.includes('campus life') || t.includes('campus')) &&
      t.length < 160
    ) {
      if (!best || textOf(el).length < textOf(best).length) {
        best = el;
      }
    }
  }

  return best;
}

function clickOldTab(name: 'campus' | 'opportunities') {
  const word = name === 'campus' ? 'campus' : 'opportunities';
  const btn = findElementByText([word]);

  if (btn) {
    btn.click();
  }
}

function getGovernorateValue(): string {
  const selects = Array.from(document.querySelectorAll<HTMLSelectElement>('select'));
  const first = selects[0];

  if (!first) return '';

  const value = (first.value || '').trim();
  const label = first.options[first.selectedIndex]?.textContent?.trim() || '';

  if (!value || value.toLowerCase() === 'all' || label.toLowerCase() === 'all') return '';

  return value;
}

function getUniversityValue(): string {
  const selects = Array.from(document.querySelectorAll<HTMLSelectElement>('select'));
  const second = selects[1];

  if (!second) return '';

  const value = (second.value || '').trim();
  const label = second.options[second.selectedIndex]?.textContent?.trim() || '';

  if (!value || value.toLowerCase() === 'all' || label.toLowerCase() === 'all') return '';

  return value;
}

function ensureStyles() {
  if (document.getElementById('talaba-final-shortcuts-style')) return;

  const style = document.createElement('style');
  style.id = 'talaba-final-shortcuts-style';
  style.textContent = `
    [data-talaba-old-tabs-hidden="true"] {
      display: none !important;
    }

    .talaba-final-shortcuts-wrap {
      width: 100%;
      margin: 16px auto 18px;
      padding: 14px;
      border-radius: 28px;
      background: linear-gradient(135deg, rgba(236, 213, 255, .82), rgba(219, 234, 254, .82));
      border: 1px solid rgba(168, 85, 247, .28);
      box-shadow: 0 16px 36px rgba(109, 40, 217, .18);
    }

    .talaba-final-shortcuts-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin: 0 0 12px;
      font-weight: 900;
      color: #4c1d95;
      letter-spacing: .02em;
      font-size: 13px;
      text-transform: uppercase;
    }

    .talaba-final-shortcuts-grid {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      padding: 2px 2px 8px;
      scrollbar-width: thin;
    }

    .talaba-shortcut-btn {
      flex: 0 0 auto;
      min-width: 138px;
      border: 1px solid rgba(168, 85, 247, .35);
      border-radius: 22px;
      padding: 12px 14px;
      background: rgba(255,255,255,.82);
      color: #3b0764;
      box-shadow: 0 10px 22px rgba(88, 28, 135, .12);
      cursor: pointer;
      text-align: center;
      font-family: inherit;
      transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
    }

    .talaba-shortcut-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 16px 30px rgba(88, 28, 135, .18);
    }

    .talaba-shortcut-btn.active {
      background: linear-gradient(135deg, #7c3aed, #2563eb);
      color: #fff;
      border-color: rgba(255,255,255,.4);
      box-shadow: 0 18px 38px rgba(79, 70, 229, .32);
    }

    .talaba-shortcut-icon {
      display: block;
      font-size: 21px;
      margin-bottom: 5px;
    }

    .talaba-shortcut-main {
      display: block;
      font-weight: 950;
      font-size: 13px;
      line-height: 1.3;
    }

    .talaba-shortcut-sub {
      display: block;
      font-weight: 800;
      font-size: 11px;
      opacity: .82;
      margin-top: 3px;
      line-height: 1.3;
    }

    .talaba-opportunity-panel {
      margin: 14px 0 20px;
      padding: 16px;
      border-radius: 26px;
      background: rgba(255,255,255,.9);
      border: 1px solid rgba(168, 85, 247, .26);
      box-shadow: 0 14px 34px rgba(88, 28, 135, .13);
      direction: rtl;
    }

    .talaba-opportunity-panel h3 {
      margin: 0 0 12px;
      color: #4c1d95;
      font-size: 18px;
      font-weight: 950;
    }

    .talaba-opportunity-card {
      border-radius: 18px;
      padding: 14px;
      margin: 10px 0;
      background: linear-gradient(135deg, #fff, #f8f5ff);
      border: 1px solid rgba(168, 85, 247, .18);
      color: #111827;
    }

    .talaba-opportunity-card strong {
      display: block;
      color: #4c1d95;
      font-size: 15px;
      margin-bottom: 7px;
      line-height: 1.5;
    }

    .talaba-opportunity-meta {
      font-size: 12px;
      color: #6b7280;
      line-height: 1.6;
      margin-bottom: 9px;
    }

    .talaba-opportunity-card a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      background: #7c3aed;
      color: white;
      padding: 8px 12px;
      font-weight: 900;
      text-decoration: none;
      font-size: 12px;
    }

    .talaba-load-more {
      width: 100%;
      border: 0;
      border-radius: 999px;
      padding: 12px 16px;
      margin-top: 10px;
      background: linear-gradient(135deg, #7c3aed, #2563eb);
      color: #fff;
      font-weight: 950;
      cursor: pointer;
    }

    @media (max-width: 640px) {
      .talaba-final-shortcuts-wrap {
        border-radius: 22px;
        padding: 12px;
      }

      .talaba-shortcut-btn {
        min-width: 124px;
        padding: 11px 12px;
      }
    }
  `;

  document.head.appendChild(style);
}

function ensureShortcutBar(): HTMLElement | null {
  ensureStyles();

  const oldTabs = findOldTabContainer();

  if (oldTabs) {
    oldTabs.setAttribute('data-talaba-old-tabs-hidden', 'true');
  }

  let wrap = document.getElementById('talaba-final-shortcuts') as HTMLElement | null;

  if (!wrap) {
    wrap = document.createElement('section');
    wrap.id = 'talaba-final-shortcuts';
    wrap.className = 'talaba-final-shortcuts-wrap';

    wrap.innerHTML = `
      <div class="talaba-final-shortcuts-title">
        <span>اختر ما تريد</span>
        <span>ئەوە هەڵبژێرە کە دەتەوێت</span>
        <span>Choose</span>
      </div>
      <div class="talaba-final-shortcuts-grid" id="talaba-final-shortcuts-grid"></div>
    `;

    if (oldTabs && oldTabs.parentElement) {
      oldTabs.parentElement.insertBefore(wrap, oldTabs);
    } else {
      const root = document.getElementById('root');
      const firstPanel = Array.from(document.querySelectorAll<HTMLElement>('section, main, div'))
        .find((el) => textOf(el).toLowerCase().includes('governorate'));

      if (firstPanel?.parentElement) {
        firstPanel.parentElement.insertBefore(wrap, firstPanel.nextSibling);
      } else if (root) {
        root.prepend(wrap);
      }
    }
  }

  const grid = document.getElementById('talaba-final-shortcuts-grid');

  if (grid && !grid.children.length) {
    const campus = document.createElement('button');
    campus.type = 'button';
    campus.className = 'talaba-shortcut-btn active';
    campus.dataset.shortcut = 'campus';
    campus.innerHTML = `
      <span class="talaba-shortcut-icon">🏛️</span>
      <span class="talaba-shortcut-main">Campus Life</span>
      <span class="talaba-shortcut-sub">ژانی زانکۆ / حياة الجامعة</span>
    `;

    campus.addEventListener('click', () => {
      activeShortcut = 'campus';
      currentLimit = 20;
      setActiveShortcutButton('campus');
      removeOpportunityPanel();
      clickOldTab('campus');
    });

    grid.appendChild(campus);

    for (const cat of categories) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'talaba-shortcut-btn';
      btn.dataset.shortcut = cat.id;
      btn.innerHTML = `
        <span class="talaba-shortcut-icon">${cat.icon}</span>
        <span class="talaba-shortcut-main">${cat.ar}</span>
        <span class="talaba-shortcut-sub">${cat.ku} / ${cat.en}</span>
      `;

      btn.addEventListener('click', () => {
        activeShortcut = cat.id;
        currentLimit = 20;
        setActiveShortcutButton(cat.id);
        clickOldTab('opportunities');
        renderOpportunityPanel(cat);
      });

      grid.appendChild(btn);
    }
  }

  return wrap;
}

function setActiveShortcutButton(id: string) {
  document.querySelectorAll<HTMLElement>('.talaba-shortcut-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.shortcut === id);
  });
}

function removeOpportunityPanel() {
  document.getElementById('talaba-opportunity-panel')?.remove();
}

async function renderOpportunityPanel(cat: TalabaCategory) {
  const wrap = ensureShortcutBar();
  if (!wrap) return;

  removeOpportunityPanel();

  const panel = document.createElement('section');
  panel.id = 'talaba-opportunity-panel';
  panel.className = 'talaba-opportunity-panel';

  panel.innerHTML = `
    <h3>${cat.icon} ${cat.ar} / ${cat.ku}</h3>
    <div id="talaba-opportunity-list">Loading...</div>
  `;

  wrap.insertAdjacentElement('afterend', panel);

  await loadOpportunities(cat);
}

function pickFirst(obj: any, keys: string[], fallback = ''): string {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }
  return fallback;
}

async function loadOpportunities(cat: TalabaCategory) {
  const list = document.getElementById('talaba-opportunity-list');
  if (!list) return;

  list.innerHTML = 'Loading...';

  const gov = getGovernorateValue();

  const params = new URLSearchParams();
  params.set('limit', String(currentLimit));

  if (cat.apiCategory) params.set('category', cat.apiCategory);
  if (gov) params.set('governorate', gov);

  try {
    const res = await fetch(`${TALABA_API}/api/opportunities?${params.toString()}`);
    const data = await res.json();

    const items = Array.isArray(data) ? data : Array.isArray(data.items) ? data.items : Array.isArray(data.opportunities) ? data.opportunities : [];

    if (!items.length) {
      list.innerHTML = `
        <div class="talaba-opportunity-card">
          <strong>لا توجد نتائج حالياً</strong>
          <div class="talaba-opportunity-meta">
            جرّب اختيار محافظة أخرى أو اختر الكل.
          </div>
        </div>
      `;
      return;
    }

    list.innerHTML = items.map((item: any) => {
      const title = pickFirst(item, ['title', 'name', 'headline'], 'Opportunity');
      const org = pickFirst(item, ['organization', 'university', 'company', 'source_name', 'source'], '');
      const governorate = pickFirst(item, ['governorate', 'city', 'location', 'duty_station'], gov || 'All');
      const category = pickFirst(item, ['category', 'type'], cat.en);
      const url = pickFirst(item, ['url', 'link', 'apply_url', 'source_url'], '');

      return `
        <article class="talaba-opportunity-card">
          <strong>${escapeHtml(title)}</strong>
          <div class="talaba-opportunity-meta">
            ${escapeHtml(category)} ${org ? ' • ' + escapeHtml(org) : ''} • ${escapeHtml(governorate)}
          </div>
          ${url ? `<a href="${escapeAttr(url)}" target="_blank" rel="noopener">فتح التفاصيل</a>` : ''}
        </article>
      `;
    }).join('');

    const more = document.createElement('button');
    more.type = 'button';
    more.className = 'talaba-load-more';
    more.textContent = 'تحميل المزيد / زیاتر پیشان بدە / Load more';
    more.addEventListener('click', () => {
      currentLimit += 20;
      loadOpportunities(cat);
    });

    list.appendChild(more);
  } catch (error) {
    list.innerHTML = `
      <div class="talaba-opportunity-card">
        <strong>تعذر تحميل الفرص الآن</strong>
        <div class="talaba-opportunity-meta">
          Please try again later. ${escapeHtml(String((error as Error)?.message || error))}
        </div>
      </div>
    `;
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttr(value: string): string {
  return escapeHtml(value);
}

function installFilterListener() {
  document.querySelectorAll<HTMLSelectElement>('select').forEach((select) => {
    if (select.dataset.talabaShortcutListener === 'true') return;

    select.dataset.talabaShortcutListener = 'true';

    select.addEventListener('change', () => {
      if (activeShortcut !== 'campus') {
        const cat = categories.find((c) => c.id === activeShortcut) || categories[0];
        currentLimit = 20;
        renderOpportunityPanel(cat);
      }
    });
  });
}

function boot() {
  ensureShortcutBar();
  installFilterListener();

  const observer = new MutationObserver(() => {
    ensureShortcutBar();
    installFilterListener();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

export {};
