export function cleanText(value: unknown): string {
  if (value === null || value === undefined) return '';

  let text = String(value);

  const looksBroken = /[ØÙÚÛÃÂðŸ]/.test(text);
  if (!looksBroken) return text;

  const decodeOnce = (input: string) => {
    try {
      const bytes = Uint8Array.from([...input].map((char) => char.charCodeAt(0) & 255));
      const decoded = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
      if (!decoded || decoded.includes('�')) return input;
      return decoded;
    } catch {
      return input;
    }
  };

  for (let i = 0; i < 2; i += 1) {
    const decoded = decodeOnce(text);
    if (decoded === text) break;
    text = decoded;
  }

  return text;
}
