export function parseNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value as number;
  if (typeof value === 'string') {
    const s = value.trim();
    const hasDot = s.includes('.');
    const hasComma = s.includes(',');
    let normalized = s;

    if (hasDot && hasComma) {
      const lastDot = s.lastIndexOf('.');
      const lastComma = s.lastIndexOf(',');
      if (lastComma > lastDot) {
        normalized = s.replace(/\./g, '').replace(',', '.');
      } else {
        normalized = s.replace(/,/g, '');
      }
    } else if (hasComma) {
      normalized = s.replace(/\./g, '').replace(',', '.');
    }

    const n = parseFloat(normalized);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function stripNamespace(key: string | null | undefined): string {
  if (!key) return '';
  return key.split(':').pop() || key;
}
