export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  let normalized = String(phone).replace(/[\s\-().+]/g, "");
  if (normalized.startsWith("1") && normalized.length === 11) {
    normalized = normalized.slice(1);
  }
  return normalized || null;
}
