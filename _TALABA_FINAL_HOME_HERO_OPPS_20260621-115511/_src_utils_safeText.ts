export function isLikelyUrl(value: unknown): boolean {
  if (typeof value !== "string") return false;

  const text = value.trim();

  if (!text) return false;

  return (
    /^https?:\/\//i.test(text) ||
    /images\.unsplash/i.test(text) ||
    /unsplash\.com/i.test(text) ||
    /auto=format/i.test(text) ||
    /fit=crop/i.test(text) ||
    /ixlib=/i.test(text) ||
    /[?&](q|fm|crop|cs|w|h)=/i.test(text) ||
    text.length > 120
  );
}

export function safeText(value: unknown, fallback = "University Opportunity"): string {
  if (typeof value !== "string") return fallback;

  const text = value.trim();

  if (!text) return fallback;
  if (isLikelyUrl(text)) return fallback;

  return text;
}

export function safeOpportunityTitle(value: unknown, fallback = "Student Opportunity"): string {
  return safeText(value, fallback);
}

export function safeUniversityName(value: unknown, fallback = "University"): string {
  return safeText(value, fallback);
}

export function safeDescription(value: unknown, fallback = ""): string {
  return safeText(value, fallback);
}

// Clean display text helper to remove mojibake and corrupted characters
export function cleanDisplayText(text: any, fallback: string, category?: string): string {
  if (!text || typeof text !== 'string') {
    // Category-specific fallbacks
    if (category === 'job' || category === 'full_time_job' || category === 'part_time_job') {
      return 'Job Opportunity';
    }
    if (category === 'scholarship' || category === 'fellowship') {
      return 'Scholarship Opportunity';
    }
    if (category === 'training') {
      return 'Training Opportunity';
    }
    return fallback;
  }

  let cleaned = text.trim();
  
  // Remove mojibake sequences
  cleaned = cleaned.replace(/ðŸ/g, '');
  cleaned = cleaned.replace(/â€œ/g, '"');
  cleaned = cleaned.replace(/â€/g, '"');
  cleaned = cleaned.replace(/â€™/g, "'");
  cleaned = cleaned.replace(/â€˜/g, "'");
  cleaned = cleaned.replace(/â€¢/g, '•');
  cleaned = cleaned.replace(/â€“/g, '–');
  cleaned = cleaned.replace(/â€”/g, '—');
  cleaned = cleaned.replace(/ï¿½/g, '');
  
  // Remove weird replacement characters
  cleaned = cleaned.replace(/[^\x20-\x7E\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/g, '');
  
  // Trim extra spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // Check if text looks like a URL
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://') || 
      cleaned.includes('images.unsplash.com') || cleaned.includes('auto=format') || 
      cleaned.includes('fit=crop')) {
    // Category-specific fallbacks for URLs
    if (category === 'job' || category === 'full_time_job' || category === 'part_time_job') {
      return 'Job Opportunity';
    }
    if (category === 'scholarship' || category === 'fellowship') {
      return 'Scholarship Opportunity';
    }
    if (category === 'training') {
      return 'Training Opportunity';
    }
    return fallback;
  }

  return cleaned || fallback;
}

