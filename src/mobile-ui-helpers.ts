export function startMobileUiEnhancements() {
  const applyEnhancements = () => {
    document.documentElement.classList.add('jamiaati-readable-font');

    const buttons = Array.from(document.querySelectorAll('button')) as HTMLButtonElement[];

    buttons.forEach((btn) => {
      const text = (btn.textContent || '').trim().toLowerCase();

      if (text.includes('load more')) {
        btn.classList.add('load-more-btn');
      }

      if (
        text.includes('show details') ||
        text.includes('view details') ||
        text.includes('details')
      ) {
        btn.classList.add('show-details-btn');
      }
    });
  };

  const safeApply = () => {
    try {
      applyEnhancements();
    } catch (error) {
      console.warn('Jamiaati mobile UI enhancement warning:', error);
    }
  };

  safeApply();
  window.setTimeout(safeApply, 500);
  window.setTimeout(safeApply, 1500);
  window.setTimeout(safeApply, 3000);

  const observer = new MutationObserver(() => safeApply());
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}
