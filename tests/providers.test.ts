import { describe, expect, it } from "vitest";
import { boundedText, eventKey, recipientAllowed, validatePublicHttpUrl } from "../convex/providerSafety";
describe("provider safety", () => {
  it("accepts public HTTP(S) and rejects credentials/private literals", () => { expect(validatePublicHttpUrl("https://example.com/a")).toBe("https://example.com/a"); for (const url of ["file:///x", "https://u:p@example.com", "http://127.0.0.1", "http://[::1]"]) expect(() => validatePublicHttpUrl(url)).toThrow(); });
  it("bounds provider text before persistence", () => { expect(boundedText("a".repeat(10), 3)).toBe("aaa"); expect(boundedText(null)).toBe(""); });
  it("only permits verified or explicitly allowlisted recipients", () => { expect(recipientAllowed("me@example.com", "ME@example.com", undefined)).toBe(true); expect(recipientAllowed("digest@example.com", undefined, "digest@example.com")).toBe(true); expect(recipientAllowed("other@example.com", undefined, "digest@example.com")).toBe(false); });
  it("creates a stable dedupe key", () => { expect(eventKey("event-1", "message-1")).toBe("event-1"); expect(eventKey(undefined, "message-1")).toBe("message-1"); expect(eventKey(undefined, undefined)).toBeUndefined(); });
});

// This exercises the app-owned inbound mutation without invoking the external webhook.
import { convexTest } from "convex-test";
import schema from "../convex/schema";
import { internal } from "../convex/_generated/api";

it("creates one newsletter only for the registered inbox owner", async () => {
  const t = convexTest(schema, import.meta.glob("../convex/**/*.ts"));
  const [owner, stranger] = await t.run(async (ctx) => [await ctx.db.insert("users", { isAnonymous: false }), await ctx.db.insert("users", { isAnonymous: false })]);
  await t.run((ctx) => ctx.db.insert("inboxes", { userId: owner, inboxId: "owner-inbox", email: "owner@example.com" }));
  const callback = { message: { message_id: "message-1", inbox_id: "owner-inbox", subject: "Weekly", text: "Owned content" }, thread: {} };
  await t.mutation((internal as any).mail.receiveInbound, { ...callback, eventId: "event-1" });
  await t.mutation((internal as any).mail.receiveInbound, { ...callback, eventId: "event-1" });
  await t.mutation((internal as any).mail.receiveInbound, { message: { message_id: "message-2", inbox_id: "missing-inbox", subject: "Nope", text: "Nope" }, thread: {}, eventId: "event-2" });
  const sources = await t.run((ctx) => ctx.db.query("sources").collect());
  expect(sources).toHaveLength(1);
  expect(sources[0]).toMatchObject({ userId: owner, kind: "newsletter", status: "ready", title: "Weekly" });
  expect(sources[0]?.userId).not.toBe(stranger);
});
