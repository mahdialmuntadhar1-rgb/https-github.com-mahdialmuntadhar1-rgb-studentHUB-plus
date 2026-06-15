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
