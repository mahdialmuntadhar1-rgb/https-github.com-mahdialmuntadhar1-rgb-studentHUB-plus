export function repairMojibakeText(input: string): string {
  if (!input || typeof input !== 'string') return input;

  const suspicious = /Ã|Â|â€|â€™|â€œ|â€‌|Ø|Ù|Û|Ú|Ð|Ñ|�/;
  if (!suspicious.test(input)) return input;

  const decodeOnce = (value: string) => {
    try {
      const bytes = Uint8Array.from([...value].map((char) => char.charCodeAt(0) & 0xff));
      return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    } catch {
      return value;
    }
  };

  let best = input;
  let current = input;

  const score = (value: string) => {
    const goodArabic = (value.match(/[\u0600-\u06FF]/g) || []).length;
    const bad = (value.match(/Ã|Â|â€|â€™|â€œ|Ø|Ù|Û|Ú|�/g) || []).length;
    return goodArabic * 5 - bad * 3;
  };

  for (let i = 0; i < 4; i += 1) {
    current = decodeOnce(current);
    if (score(current) > score(best)) best = current;
  }

  return best;
}

function repairNodeText(node: Node) {
  if (node.nodeType === Node.TEXT_NODE && node.nodeValue) {
    const fixed = repairMojibakeText(node.nodeValue);
    if (fixed !== node.nodeValue) node.nodeValue = fixed;
  }
}

function repairElementAttributes(element: Element) {
  const attrs = ['title', 'placeholder', 'aria-label', 'alt', 'value'];
  for (const attr of attrs) {
    const value = element.getAttribute(attr);
    if (!value) continue;
    const fixed = repairMojibakeText(value);
    if (fixed !== value) element.setAttribute(attr, fixed);
  }
}

export function startGlobalTextRepair() {
  const repairTree = (root: ParentNode) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node: Node | null;

    while ((node = walker.nextNode())) {
      repairNodeText(node);
    }

    if ('querySelectorAll' in root) {
      root.querySelectorAll('input, textarea, img, button, a, [title], [aria-label]').forEach(repairElementAttributes);
    }
  };

  const run = () => repairTree(document.body);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        repairNodeText(node);
        if (node instanceof Element) {
          repairElementAttributes(node);
          repairTree(node);
        }
      });
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
}
