import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "../convex/_generated/api";
import schema from "../convex/schema";
import { reserveDailyQuota, quotas } from "../convex/quota";
const modules = import.meta.glob("../convex/**/*.ts");

describe("library isolation and partial state", () => {
  it("preserves untouched required state and prevents cross-account access", async () => {
    const t = convexTest(schema, modules);
    const [alice, bob] = await t.run(async (ctx) =>
      Promise.all([ctx.db.insert("users", {}), ctx.db.insert("users", {})]),
    );
    const owner = t.withIdentity({ subject: `${alice}|session` });
    const other = t.withIdentity({ subject: `${bob}|session` });
    const id = await owner.mutation(api.library.addNote, {
      title: "Private note",
      content: "Private content",
    });
    await owner.mutation(api.library.setState, { id, read: true });
    expect(await t.run((ctx) => ctx.db.get(id))).toMatchObject({
      read: true,
      bookmarked: false,
    });
    await owner.mutation(api.library.setState, { id, bookmarked: true });
    expect(await t.run((ctx) => ctx.db.get(id))).toMatchObject({
      read: true,
      bookmarked: true,
    });
    expect(await other.query(api.library.list, {})).toEqual([]);
    await expect(
      other.mutation(api.library.setState, { id, read: false }),
    ).rejects.toThrow("Source not found");
    await expect(other.mutation(api.library.remove, { id })).rejects.toThrow(
      "Source not found",
    );
    await expect(t.query(api.library.list, {})).rejects.toThrow(
      "Authentication",
    );
  });
  it("keeps generation and delivery quotas separate and rejects exhausted user quota", async () => {
    const t = convexTest(schema, modules);
    const user = await t.run((ctx) => ctx.db.insert("users", {}));
    const now = Date.UTC(2026, 8, 22);
    for (let i = 0; i < quotas.userBriefingsPerDay; i++)
      await t.run((ctx) => reserveDailyQuota(ctx, user, "briefing", now));
    await expect(
      t.run((ctx) => reserveDailyQuota(ctx, user, "briefing", now)),
    ).rejects.toThrow("Daily capacity");
    await t.run((ctx) => reserveDailyQuota(ctx, user, "delivery", now));
    const counters = await t.run((ctx) =>
      ctx.db.query("usageCounters").collect(),
    );
    expect(counters).toHaveLength(2);
    expect(
      counters.every(
        (c) =>
          c.briefingStarts === quotas.userBriefingsPerDay &&
          c.deliveryStarts === 1,
      ),
    ).toBe(true);
  });
});
