import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { MAX_BRIEFING_SOURCES } from "./access";
import { quotas, reserveDailyQuota } from "./quota";

const MAX_BRIEFINGS = 30;

async function currentUser(ctx: Parameters<typeof getAuthUserId>[0]) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) throw new ConvexError("Authentication is required.");
  return userId;
}

export const list = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const userId = await currentUser(ctx);
    return await ctx.db
      .query("briefings")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(MAX_BRIEFINGS);
  },
});

export const request = mutation({
  args: { sourceIds: v.array(v.id("sources")) },
  returns: v.id("briefings"),
  handler: async (ctx, args) => {
    const userId = await currentUser(ctx);
    if (args.sourceIds.length === 0 || args.sourceIds.length > MAX_BRIEFING_SOURCES) {
      throw new ConvexError(`Select 1 to ${MAX_BRIEFING_SOURCES} sources.`);
    }
    if (new Set(args.sourceIds).size !== args.sourceIds.length) {
      throw new ConvexError("Sources must be unique.");
    }
    const requestKey = [...args.sourceIds].map(String).sort().join(":");
    const duplicate = await ctx.db
      .query("briefings")
      .withIndex("by_userId_and_requestKey", (q) => q.eq("userId", userId).eq("requestKey", requestKey))
      .order("desc")
      .first();
    if (duplicate !== null && duplicate.status !== "failed") return duplicate._id;
    const sources = await Promise.all(args.sourceIds.map((sourceId) => ctx.db.get(sourceId)));
    if (sources.some((source) => source === null || source.userId !== userId || source.status !== "ready")) {
      throw new ConvexError("Every source must be ready and owned by you.");
    }
    const [userGenerating, globalGenerating] = await Promise.all([
      ctx.db.query("briefings").withIndex("by_userId_and_status", (q) => q.eq("userId", userId).eq("status", "generating")).take(quotas.userActiveBriefings + 1),
      ctx.db.query("briefings").withIndex("by_status_and_createdAt", (q) => q.eq("status", "generating")).take(quotas.globalActiveBriefings + 1),
    ]);
    if (userGenerating.length >= quotas.userActiveBriefings || globalGenerating.length >= quotas.globalActiveBriefings) {
      throw new ConvexError("Briefing capacity is currently full. Try again soon.");
    }
    const now = Date.now();
    await reserveDailyQuota(ctx, userId, "briefing", now);
    if (duplicate !== null) {
      await ctx.db.patch(duplicate._id, {
        status: "generating",
        error: undefined,
        generationAttempt: duplicate.generationAttempt + 1,
        generationDeadlineAt: now + 5 * 60_000,
      });
      await ctx.scheduler.runAfter(0, internal.briefingActions.generate, { briefingId: duplicate._id });
      return duplicate._id;
    }
    const briefingId = await ctx.db.insert("briefings", {
      userId,
      title: "Generating briefing",
      summary: "",
      sourceIds: args.sourceIds,
      requestKey,
      sections: [],
      status: "generating",
      createdAt: now,
      generationAttempt: 1,
      generationDeadlineAt: now + 5 * 60_000,
    });
    await ctx.scheduler.runAfter(0, internal.briefingActions.generate, { briefingId });
    return briefingId;
  },
});
