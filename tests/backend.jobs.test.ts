import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { internal } from "../convex/_generated/api";
import schema from "../convex/schema";

const modules = import.meta.glob("../convex/**/*.ts");

describe("backend watchdog", () => {
  it("fails only expired processing and generating work", async () => {
    const t = convexTest(schema, modules);
    const now = 1_000_000;
    const { staleSource, freshSource, staleBriefing, freshBriefing } = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {});
      const staleSource = await ctx.db.insert("sources", { userId, title: "stale", content: "", excerpt: "", kind: "article", status: "processing", read: false, bookmarked: false, createdAt: 1, processingDeadlineAt: now - 1 });
      const freshSource = await ctx.db.insert("sources", { userId, title: "fresh", content: "", excerpt: "", kind: "article", status: "processing", read: false, bookmarked: false, createdAt: 2, processingDeadlineAt: now + 1 });
      const staleBriefing = await ctx.db.insert("briefings", { userId, title: "stale", summary: "", sourceIds: [], requestKey: "stale", sections: [], status: "generating", createdAt: 1, generationAttempt: 1, generationDeadlineAt: now - 1 });
      const freshBriefing = await ctx.db.insert("briefings", { userId, title: "fresh", summary: "", sourceIds: [], requestKey: "fresh", sections: [], status: "generating", createdAt: 2, generationAttempt: 1, generationDeadlineAt: now + 1 });
      return { staleSource, freshSource, staleBriefing, freshBriefing };
    });
    await t.mutation(internal.jobs.failStale, { now });
    const state = await t.run(async (ctx) => Promise.all([ctx.db.get(staleSource), ctx.db.get(freshSource), ctx.db.get(staleBriefing), ctx.db.get(freshBriefing)]));
    expect(state.map((item) => item?.status)).toEqual(["failed", "processing", "failed", "generating"]);
  });
});
