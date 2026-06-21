
function isZiadaText(text: string): boolean {
  const t = text.toLowerCase();
  return (
    t.includes('ziada') ||
    t.includes('ziyadah') ||
    t.includes('زيادة') ||
    t.includes('زياده') ||
    t.includes('زیادە') ||
    t.includes('زیاده')
  );
}

function cleanZiadaLinks() {
  const nodes = Array.from(document.querySelectorAll('a,button,[role="button"],nav *')) as HTMLElement[];

  for (const node of nodes) {
    const text = node.textContent || '';
    const href = (node as HTMLAnchorElement).href || '';

    if (isZiadaText(text) || isZiadaText(href)) {
      node.style.display = 'none';
      node.setAttribute('aria-hidden', 'true');
    }
  }
}

document.addEventListener('click', event => {
  const target = event.target as HTMLElement | null;
  const clickable = target?.closest('a,button,[role="button"]') as HTMLElement | null;
  if (!clickable) return;

  const text = clickable.textContent || '';
  const href = (clickable as HTMLAnchorElement).href || '';

  if (isZiadaText(text) || isZiadaText(href)) {
    event.preventDefault();
    event.stopPropagation();
  }
}, true);

const observer = new MutationObserver(cleanZiadaLinks);
observer.observe(document.documentElement, { childList: true, subtree: true });
setInterval(cleanZiadaLinks, 1000);
cleanZiadaLinks();

export {};
