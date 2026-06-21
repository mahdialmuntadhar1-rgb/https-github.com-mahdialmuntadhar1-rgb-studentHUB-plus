
declare global {
  interface Window {
    __talabaSuppressAuthUntil?: number;
  }
}

function hasAuthToken(): boolean {
  return Boolean(
    localStorage.getItem('rafid_token') ||
    localStorage.getItem('talaba_token') ||
    localStorage.getItem('jamiaati_token') ||
    localStorage.getItem('admin_token') ||
    localStorage.getItem('auth_token')
  );
}

function textOf(el: Element | null): string {
  return (el?.textContent || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function isBrowseClick(text: string): boolean {
  return [
    'job',
    'jobs',
    'scholarship',
    'scholarships',
    'opportunities',
    'campus life',
    'فرص',
    'وظائف',
    'منح',
    'بورسی',
    'کار',
    'دەرفەت',
    'کەمپەس'
  ].some(word => text.includes(word));
}

function isInteractionClick(text: string): boolean {
  return [
    'details',
    'view details',
    'apply',
    'save',
    'like',
    'comment',
    'message',
    'add friend',
    'post',
    'register',
    'login',
    'sign in',
    'تفاصيل',
    'تقديم',
    'تعليق',
    'رسالة',
    'تسجيل',
    'دخول',
    'وردەکاری',
    'پێشکەش',
    'کۆمێنت',
    'نامە',
    'تۆمار'
  ].some(word => text.includes(word));
}

document.addEventListener('click', event => {
  if (hasAuthToken()) return;

  const target = event.target as HTMLElement | null;
  const clickable = target?.closest('button,a,[role="button"],[data-tab],[data-category]');
  const text = textOf(clickable);

  if (!text) return;

  if (isBrowseClick(text) && !isInteractionClick(text)) {
    window.__talabaSuppressAuthUntil = Date.now() + 2500;
  }
}, true);

function closeAuthModalIfItWasOnlyBrowseNag() {
  if (hasAuthToken()) return;
  if (!window.__talabaSuppressAuthUntil || Date.now() > window.__talabaSuppressAuthUntil) return;

  const dialogs = Array.from(document.querySelectorAll('[role="dialog"], .modal, [class*="modal"], [class*="auth"]')) as HTMLElement[];

  for (const dialog of dialogs) {
    const txt = textOf(dialog);
    const looksAuth =
      txt.includes('login') ||
      txt.includes('register') ||
      txt.includes('reset password') ||
      txt.includes('sign in') ||
      txt.includes('تسجيل') ||
      txt.includes('دخول');

    if (!looksAuth) continue;

    const closeButton =
      Array.from(dialog.querySelectorAll('button')).find(btn => {
        const t = textOf(btn);
        return t === '×' || t === 'x' || t.includes('close') || t.includes('cancel');
      }) as HTMLButtonElement | undefined;

    if (closeButton) {
      closeButton.click();
    } else {
      dialog.style.display = 'none';
    }
  }
}

const observer = new MutationObserver(() => closeAuthModalIfItWasOnlyBrowseNag());
observer.observe(document.documentElement, { childList: true, subtree: true });

setInterval(closeAuthModalIfItWasOnlyBrowseNag, 500);

console.info('[Talaba] public browsing guard active');

export {};
