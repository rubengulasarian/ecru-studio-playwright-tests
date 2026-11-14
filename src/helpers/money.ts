/** Parses text such as "$1,234", "−$20" (U+2212) or "-$20" into a number. */
export function parseMoney(text: string): number {
  const normalized = text.replace('−', '-');
  const negative = normalized.includes('-');
  const value = Number(normalized.replace(/[^\d.]/g, ''));
  return negative ? -value : value;
}
