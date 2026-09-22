import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

const WATCHDOG_BATCH_SIZE = 100;

export const failStale = internalMutation({
  args: { now: v.optional(v.number()) },
  returns: v.object({ sources: v.number(), briefings: v.number() }),
  handler: async (ctx, args) => {
    const now = args.now ?? Date.now();
    const [sources, briefings] = await Promise.all([
      ctx.db
        .query("sources")
        .withIndex("by_status_and_createdAt", (q) => q.eq("status", "processing"))
        .order("asc")
        .take(WATCHDOG_BATCH_SIZE),
      ctx.db
        .query("briefings")
        .withIndex("by_status_and_createdAt", (q) => q.eq("status", "generating"))
        .order("asc")
        .take(WATCHDOG_BATCH_SIZE),
    ]);
    let failedSources = 0;
    for (const source of sources) {
      if (source.processingDeadlineAt !== undefined && source.processingDeadlineAt <= now) {
        await ctx.db.patch(source._id, {
          status: "failed",
          error: "Import timed out. Try again later.",
          processingDeadlineAt: undefined,
        });
        failedSources += 1;
      }
    }
    let failedBriefings = 0;
    for (const briefing of briefings) {
      if (briefing.generationDeadlineAt !== undefined && briefing.generationDeadlineAt <= now) {
        await ctx.db.patch(briefing._id, {
          status: "failed",
          error: "Briefing generation timed out. Try again later.",
          generationDeadlineAt: undefined,
        });
        failedBriefings += 1;
      }
    }
    return { sources: failedSources, briefings: failedBriefings };
  },
});
