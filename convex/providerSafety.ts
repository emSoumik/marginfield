/** Provider boundary helpers. They perform no network I/O. */
const MAX_CONTENT = 100_000;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function validatePublicHttpUrl(value: string): string {
  let url: URL;
  try { url = new URL(value); } catch { throw new Error("Enter a valid public HTTP(S) URL."); }
  if ((url.protocol !== "https:" && url.protocol !== "http:") || url.username || url.password || !url.hostname) throw new Error("Enter a valid public HTTP(S) URL.");
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  // Literal private addresses are rejected before provider egress. DNS host policy is owned by Firecrawl.
  if (host === "localhost" || host === "::1" || /^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host) || /^169\.254\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host) || /^(fc|fd|fe80):/i.test(host)) throw new Error("Enter a public URL.");
  return url.href;
}
export function boundedText(value: unknown, max = MAX_CONTENT): string {
  return typeof value === "string" ? value.replace(/\u0000/g, "").trim().slice(0, max) : "";
}
export function plainExcerpt(value: string, max = 500): string { return boundedText(value, max).replace(/\s+/g, " "); }
export function validRecipient(value: string): string | undefined { const normalized = value.trim().toLowerCase(); return normalized.length <= 254 && EMAIL.test(normalized) ? normalized : undefined; }
export function recipientAllowed(recipient: string, verifiedEmail: string | undefined, allowlist: string | undefined): boolean {
  const email = validRecipient(recipient); if (!email) return false;
  if (verifiedEmail && email === verifiedEmail.trim().toLowerCase()) return true;
  return (allowlist ?? "").split(",").map((item) => item.trim().toLowerCase()).includes(email);
}
export function eventKey(eventId: unknown, messageId: unknown): string | undefined { const event = boundedText(eventId, 200); const message = boundedText(messageId, 200); return event || message || undefined; }
