const TALABA_API_BASE = 'https://rafid-api.mahdialmuntadhar1.workers.dev';

type ShortcutItem = {
  key: string;
  category: string;
  ar: string;
  ku: string;
  en: string;
  emoji: string;
};

const shortcutItems: ShortcutItem[] = [
  { key: 'all', category: '', ar: 'الكل', ku: 'هەموو', en: 'All', emoji: '🌐' },
  { key: 'job', category: 'job', ar: 'فرص العمل', ku: 'دەرفەتی کار', en: 'Jobs', emoji: '💼' },
  { key: 'scholarship', category: 'scholarship', ar: 'المنح', ku: 'بورسیەکان', en: 'Scholarships', emoji: '🎓' },
  { key: 'news', category: 'news', ar: 'الأخبار', ku: 'هەواڵەکان', en: 'News', emoji: '📰' },
  { key: 'event', category: 'event', ar: 'الفعاليات', ku: 'چالاکییەکان', en: 'Events', emoji: '📅' },
  { key: 'training', category: 'training', ar: 'التدريب', ku: 'ڕاهێنان', en: 'Training', emoji: '🧠' },
  { key: 'internship', category: 'internship', ar: 'التدريب العملي', ku: 'مەشق', en: 'Internships', emoji: '🧪' },
  { key: 'exam', category: 'exam', ar: 'الامتحانات والتسجيل', ku: 'تاقیکردنەوە و تۆمارکردن', en: 'Exams / Registration', emoji: '📝' },
];

const governorates = [
  'All Iraq',
  'Baghdad',
  'Erbil',
  'Sulaymaniyah',
  'Duhok',
  'Nineveh',
  'Kirkuk',
  'Basra',
  'Najaf',
  'Karbala',
  'Babil',
  'Anbar',
  'Diyala',
  'Salah al-Din',
  'Wasit',
  'Maysan',
  'Dhi Qar',
  'Muthanna',
  'Qadisiyyah',
];

type RenderState = {
  item: ShortcutItem;
  governorate: string;
  limit: number;
};

let renderState: RenderState | null = null;

function injectStyles() {
  if (document.getElementById('talaba-home-shortcuts-style')) return;

  const style = document.createElement('style');
  style.id = 'talaba-home-shortcuts-style';
  style.textContent = `
    .talaba-hidden-old-tabs {
      display: none !important;
      visibility: hidden !important;
      height: 0 !important;
      overflow: hidden !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    .talaba-shortcut-shell {
      width: 100%;
      margin: 12px 0 14px;
      padding: 10px 0 2px;
      direction: rtl;
      position: relative;
      z-index: 20;
    }

    .talaba-shortcut-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 0 12px 8px;
      font-family: "Noto Sans Arabic", "Noto Kufi Arabic", "Segoe UI", Arial, sans-serif;
      font-weight: 900;
      color: #fff;
      text-shadow: 0 2px 12px rgba(0,0,0,.35);
    }

    .talaba-shortcut-title strong {
      font-size: 15px;
      line-height: 1.4;
    }

    .talaba-shortcut-row-wrap {
      overflow: hidden;
      width: 100%;
      -webkit-mask-image: linear-gradient(to left, transparent, #000 8%, #000 92%, transparent);
      mask-image: linear-gradient(to left, transparent, #000 8%, #000 92%, transparent);
    }

    .talaba-shortcut-row {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      padding: 4px 12px 14px;
      scrollbar-width: none;
      animation: talabaShortcutDrift 22s linear infinite alternate;
    }

    .talaba-shortcut-row::-webkit-scrollbar {
      display: none;
    }

    .talaba-shortcut-row:hover,
    .talaba-shortcut-row:active {
      animation-play-state: paused;
    }

    @keyframes talabaShortcutDrift {
      from { transform: translateX(0); }
      to { transform: translateX(-56px); }
    }

    .talaba-shortcut-btn {
      flex: 0 0 auto;
      width: 92px;
      min-height: 98px;
      border: 1px solid rgba(255,255,255,.22);
      border-radius: 26px;
      background:
        radial-gradient(circle at 30% 15%, rgba(255,255,255,.32), transparent 32%),
        linear-gradient(145deg, rgba(109,40,217,.95), rgba(29,78,216,.86));
      color: #fff;
      box-shadow: 0 16px 34px rgba(24, 20, 80, .35), inset 0 1px 0 rgba(255,255,255,.25);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 7px;
      padding: 10px 8px;
      cursor: pointer;
      scroll-snap-align: start;
      font-family: "Noto Sans Arabic", "Noto Kufi Arabic", "Segoe UI", Arial, sans-serif;
      text-align: center;
      transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
    }

    .talaba-shortcut-btn:hover,
    .talaba-shortcut-btn.is-active {
      transform: translateY(-3px) scale(1.03);
      border-color: rgba(255,255,255,.55);
      box-shadow: 0 20px 42px rgba(99,102,241,.45), 0 0 24px rgba(168,85,247,.36);
    }

    .talaba-shortcut-emoji {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: rgba(255,255,255,.2);
      font-size: 23px;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.28);
    }

    .talaba-shortcut-label-ar {
      font-size: 12px;
      font-weight: 900;
      line-height: 1.2;
    }

    .talaba-shortcut-label-ku {
      font-size: 11px;
      font-weight: 800;
      line-height: 1.2;
      opacity: .94;
    }

    .talaba-shortcut-results {
      margin: 4px 12px 16px;
      padding: 12px;
      border-radius: 24px;
      background: rgba(255,255,255,.94);
      box-shadow: 0 20px 48px rgba(17,24,39,.18);
      color: #111827;
      direction: rtl;
      font-family: "Noto Sans Arabic", "Noto Kufi Arabic", "Segoe UI", Arial, sans-serif;
    }

    .talaba-shortcut-results-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }

    .talaba-shortcut-results-title {
      font-weight: 950;
      font-size: 16px;
      color: #21123f;
    }

    .talaba-gov-only-filter {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      font-size: 13px;
      font-weight: 800;
    }

    .talaba-gov-only-filter select {
      border: 1px solid rgba(99,102,241,.28);
      border-radius: 14px;
      padding: 9px 12px;
      background: #fff;
      color: #111827;
      font-weight: 800;
      min-width: 150px;
    }

    .talaba-results-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin: 12px 0;
    }

    .talaba-home-btn,
    .talaba-load-more-btn {
      border: 0;
      border-radius: 999px;
      padding: 10px 14px;
      cursor: pointer;
      font-family: "Noto Sans Arabic", "Noto Kufi Arabic", "Segoe UI", Arial, sans-serif;
      font-size: 13px;
      font-weight: 950;
      box-shadow: 0 10px 22px rgba(17,24,39,.12);
    }

    .talaba-home-btn {
      background: #111827;
      color: white;
    }

    .talaba-load-more-btn {
      background: #6d28d9;
      color: white;
      width: 100%;
      margin-top: 12px;
    }

    .talaba-load-more-btn[disabled] {
      opacity: .55;
      cursor: wait;
    }

    .talaba-shortcut-grid {
      display: grid;
      gap: 10px;
    }

    .talaba-mini-card {
      border: 1px solid rgba(99,102,241,.14);
      border-radius: 18px;
      padding: 12px;
      background: linear-gradient(180deg, #ffffff, #f7f4ff);
      box-shadow: 0 8px 22px rgba(17,24,39,.08);
      text-align: right;
    }

    .talaba-mini-card-title {
      font-size: 15px;
      font-weight: 950;
      color: #21123f;
      margin-bottom: 5px;
      line-height: 1.45;
    }

    .talaba-mini-card-meta {
      font-size: 12px;
      color: #5b6475;
      font-weight: 800;
      margin-bottom: 7px;
    }

    .talaba-mini-card-desc {
      font-size: 13px;
      color: #374151;
      line-height: 1.55;
    }

    .talaba-mini-card-link {
      display: inline-flex;
      margin-top: 10px;
      padding: 8px 12px;
      border-radius: 999px;
      background: #6d28d9;
      color: #fff !important;
      text-decoration: none;
      font-weight: 900;
      font-size: 12px;
    }

    .talaba-empty {
      padding: 18px;
      border-radius: 18px;
      background: #f8fafc;
      color: #475569;
      text-align: center;
      font-weight: 800;
    }

    @media (max-width: 640px) {
      .talaba-shortcut-btn {
        width: 88px;
        min-height: 96px;
        border-radius: 24px;
      }

      .talaba-shortcut-title strong {
        font-size: 14px;
      }

      .talaba-shortcut-results {
        margin-left: 8px;
        margin-right: 8px;
      }
    }
  `;

  document.head.appendChild(style);
}

function textOf(el: Element): string {
  return (el.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function hideOldTabsAndOpenCampusLife() {
  const candidates = Array.from(document.querySelectorAll('button, [role="tab"], a, div'));

  const campusButtons = candidates.filter((el) => {
    const t = textOf(el);
    return t === 'campus life' || t.includes('campus life') || t.includes('ژیانی کەمپەس') || t.includes('الحياة الجامعية');
  });

  const opportunityButtons = candidates.filter((el) => {
    const t = textOf(el);
    return t === 'opportunities' || t.includes('opportunities') || t.includes('فرص') || t.includes('دەرفەت');
  });

  const campusButton = campusButtons.find((el) => el instanceof HTMLButtonElement || el.getAttribute('role') === 'tab') as HTMLElement | undefined;

  if (campusButton && !campusButton.dataset.talabaClicked) {
    campusButton.dataset.talabaClicked = 'true';
    setTimeout(() => {
      try { campusButton.click(); } catch {}
    }, 60);
  }

  const allButtons = [...campusButtons, ...opportunityButtons];

  for (const btn of allButtons) {
    const parent = btn.parentElement;
    const grand = parent?.parentElement;

    if (parent) {
      const pText = textOf(parent);
      if (pText.includes('campus life') && pText.includes('opportunities')) {
        parent.classList.add('talaba-hidden-old-tabs');
      }
    }

    if (grand) {
      const gText = textOf(grand);
      if (gText.includes('campus life') && gText.includes('opportunities')) {
        grand.classList.add('talaba-hidden-old-tabs');
      }
    }
  }
}

function findFilterAnchor(): Element | null {
  const selects = Array.from(document.querySelectorAll('select'));

  if (selects.length >= 2) {
    const first = selects[0];
    const second = selects[1];

    let node: Element | null = first.parentElement;
    while (node && !node.contains(second)) {
      node = node.parentElement;
    }

    if (node) return node;
  }

  const all = Array.from(document.querySelectorAll('div, section, form, header'));
  const likely = all.find((el) => {
    const t = textOf(el);
    return (
      (t.includes('governorate') || t.includes('المحافظة') || t.includes('پارێزگا')) &&
      (t.includes('university') || t.includes('الجامعة') || t.includes('زانکۆ'))
    );
  });

  if (likely) return likely;

  return document.querySelector('main') || document.body.firstElementChild;
}

function getTopGovernorate(): string {
  const selects = Array.from(document.querySelectorAll('select'));

  for (const select of selects) {
    const options = Array.from(select.options).map((o) => `${o.textContent || ''} ${o.value || ''}`.toLowerCase()).join(' ');
    if (
      options.includes('baghdad') ||
      options.includes('erbil') ||
      options.includes('sulaymaniyah') ||
      options.includes('محافظة') ||
      options.includes('پارێزگا')
    ) {
      return select.value || select.options[select.selectedIndex]?.textContent || 'All Iraq';
    }
  }

  return 'All Iraq';
}

function normalizeGovernorate(value: string): string {
  const v = (value || '').trim();
  if (!v || v.toLowerCase().includes('all')) return '';
  return v;
}

async function fetchShortcutItems(item: ShortcutItem, governorate: string, limit: number) {
  const params = new URLSearchParams();

  if (item.category) {
    params.set('category', item.category);
  }

  params.set('limit', String(limit));

  const gov = normalizeGovernorate(governorate);
  if (gov) params.set('governorate', gov);

  const url = `${TALABA_API_BASE}/api/opportunities?${params.toString()}`;

  const res = await fetch(url, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      'X-Talaba-Client': 'web-shortcuts',
    },
  });

  if (!res.ok) {
    throw new Error(`API ${res.status}`);
  }

  const data = await res.json().catch(() => ({}));
  const list = Array.isArray(data) ? data : (data.items || data.opportunities || data.results || data.data || []);

  return Array.isArray(list) ? list : [];
}

function renderResults(container: HTMLElement, item: ShortcutItem, governorate: string, limit = 30) {
  renderState = { item, governorate, limit };

  container.innerHTML = `
    <div class="talaba-shortcut-results-head">
      <div class="talaba-shortcut-results-title">${item.emoji} ${item.ar} / ${item.ku}</div>
      <label class="talaba-gov-only-filter">
        <span>المحافظة / پارێزگا</span>
        <select id="talaba-shortcut-governorate">
          ${governorates.map((g) => `<option value="${g}" ${g === governorate ? 'selected' : ''}>${g}</option>`).join('')}
        </select>
      </label>
    </div>
    <div class="talaba-results-actions">
      <button class="talaba-home-btn" type="button" id="talaba-back-home">العودة للرئيسية / گەڕانەوە بۆ سەرەکی</button>
    </div>
    <div class="talaba-shortcut-grid">
      <div class="talaba-empty">جاري التحميل... / چاوەڕوان بە...</div>
    </div>
  `;

  const select = container.querySelector('#talaba-shortcut-governorate') as HTMLSelectElement | null;
  select?.addEventListener('change', () => {
    renderResults(container, item, select.value, 30);
  });

  const homeBtn = container.querySelector('#talaba-back-home') as HTMLButtonElement | null;
  homeBtn?.addEventListener('click', () => {
    container.style.display = 'none';
    container.innerHTML = '';
    document.querySelectorAll('.talaba-shortcut-btn').forEach((x) => x.classList.remove('is-active'));
    renderState = null;
    hideOldTabsAndOpenCampusLife();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const grid = container.querySelector('.talaba-shortcut-grid') as HTMLElement;

  fetchShortcutItems(item, governorate, limit)
    .then((items) => {
      if (!items.length) {
        grid.innerHTML = `<div class="talaba-empty">لا توجد نتائج حالياً لهذه المحافظة. / بۆ ئەم پارێزگایە ئەنجام نییە.</div>`;
        return;
      }

      grid.innerHTML = items.map((x: any) => {
        const title = x.title || x.name || x.position || x.job_title || 'Opportunity';
        const org = x.organization || x.company || x.source_name || x.university || '';
        const gov = x.governorate || x.location || x.city || '';
        const type = x.category || x.type || item.en || '';
        const desc = x.description || x.summary || x.details || '';
        const link = x.url || x.source_url || x.apply_url || x.link || '';

        return `
          <article class="talaba-mini-card">
            <div class="talaba-mini-card-title">${escapeHtml(title)}</div>
            <div class="talaba-mini-card-meta">${escapeHtml([type, org, gov].filter(Boolean).join(' • '))}</div>
            ${desc ? `<div class="talaba-mini-card-desc">${escapeHtml(String(desc).slice(0, 220))}</div>` : ''}
            ${link ? `<a class="talaba-mini-card-link" href="${escapeAttribute(link)}" target="_blank" rel="noreferrer">فتح التفاصيل</a>` : ''}
          </article>
        `;
      }).join('');

      const loadMore = document.createElement('button');
      loadMore.className = 'talaba-load-more-btn';
      loadMore.type = 'button';
      loadMore.textContent = 'تحميل المزيد / زیاتر پیشان بدە / Load more';

      loadMore.addEventListener('click', () => {
        loadMore.disabled = true;
        loadMore.textContent = 'جاري التحميل... / چاوەڕوان بە...';

        const nextLimit = (renderState?.limit || limit) + 30;
        renderResults(container, item, governorate, nextLimit);
      });

      grid.appendChild(loadMore);
    })
    .catch((error) => {
      grid.innerHTML = `<div class="talaba-empty">حدث خطأ في تحميل النتائج. / هەڵەیەک ڕوویدا. ${escapeHtml(error.message || '')}</div>`;
    });
}

function escapeHtml(value: string): string {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replaceAll('`', '');
}

function createShortcutShell(): HTMLElement {
  const shell = document.createElement('section');
  shell.id = 'talaba-home-shortcuts';
  shell.className = 'talaba-shortcut-shell';

  shell.innerHTML = `
    <div class="talaba-shortcut-title">
      <strong>اختر ما تريد</strong>
      <strong>ئەوە هەڵبژێرە کە دەتەوێت</strong>
    </div>
    <div class="talaba-shortcut-row-wrap">
      <div class="talaba-shortcut-row">
        ${shortcutItems.map((item) => `
          <button class="talaba-shortcut-btn" type="button" data-talaba-shortcut="${item.key}">
            <span class="talaba-shortcut-emoji">${item.emoji}</span>
            <span class="talaba-shortcut-label-ar">${item.ar}</span>
            <span class="talaba-shortcut-label-ku">${item.ku}</span>
          </button>
        `).join('')}
      </div>
    </div>
    <div id="talaba-shortcut-results" class="talaba-shortcut-results" style="display:none"></div>
  `;

  const results = shell.querySelector('#talaba-shortcut-results') as HTMLElement;

  shell.querySelectorAll<HTMLButtonElement>('[data-talaba-shortcut]').forEach((btn) => {
    btn.addEventListener('click', () => {
      shell.querySelectorAll('.talaba-shortcut-btn').forEach((x) => x.classList.remove('is-active'));
      btn.classList.add('is-active');

      const key = btn.dataset.talabaShortcut || '';
      const item = shortcutItems.find((x) => x.key === key);
      if (!item) return;

      results.style.display = 'block';

      const gov = getTopGovernorate();
      renderResults(results, item, gov && gov !== 'All Iraq' ? gov : 'All Iraq', 30);

      setTimeout(() => {
        results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 80);
    });
  });

  return shell;
}

function mountShortcuts() {
  if (document.getElementById('talaba-home-shortcuts')) return;

  const anchor = findFilterAnchor();
  if (!anchor || !anchor.parentElement) return;

  const shell = createShortcutShell();

  if (anchor.nextSibling) {
    anchor.parentElement.insertBefore(shell, anchor.nextSibling);
  } else {
    anchor.parentElement.appendChild(shell);
  }
}

function bootTalabaHomeShortcuts() {
  injectStyles();
  hideOldTabsAndOpenCampusLife();
  mountShortcuts();

  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts++;
    hideOldTabsAndOpenCampusLife();
    mountShortcuts();

    if (attempts > 25 || document.getElementById('talaba-home-shortcuts')) {
      window.clearInterval(timer);
    }
  }, 400);

  const observer = new MutationObserver(() => {
    hideOldTabsAndOpenCampusLife();
    mountShortcuts();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootTalabaHomeShortcuts);
} else {
  bootTalabaHomeShortcuts();
}

export {};
