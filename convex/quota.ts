import { ConvexError } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

export type QuotaKind = "article" | "briefing" | "delivery";

function positiveEnv(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isSafeInteger(value) && value > 0 ? value : fallback;
}

export const quotas = {
  userArticlesPerDay: positiveEnv("MARGINFIELD_USER_ARTICLES_PER_DAY", 20),
  globalArticlesPerDay: positiveEnv("MARGINFIELD_GLOBAL_ARTICLES_PER_DAY", 200),
  userBriefingsPerDay: positiveEnv("MARGINFIELD_USER_BRIEFINGS_PER_DAY", 6),
  globalBriefingsPerDay: positiveEnv("MARGINFIELD_GLOBAL_BRIEFINGS_PER_DAY", 60),
  userDeliveriesPerDay: positiveEnv("MARGINFIELD_USER_DELIVERIES_PER_DAY", 10),
  globalDeliveriesPerDay: positiveEnv("MARGINFIELD_GLOBAL_DELIVERIES_PER_DAY", 100),
  userActiveArticles: positiveEnv("MARGINFIELD_USER_ACTIVE_ARTICLES", 4),
  globalActiveArticles: positiveEnv("MARGINFIELD_GLOBAL_ACTIVE_ARTICLES", 30),
  userActiveBriefings: positiveEnv("MARGINFIELD_USER_ACTIVE_BRIEFINGS", 2),
  globalActiveBriefings: positiveEnv("MARGINFIELD_GLOBAL_ACTIVE_BRIEFINGS", 12),
} as const;

export function utcDay(now = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10);
}

export async function reserveDailyQuota(
  ctx: MutationCtx,
  userId: Id<"users">,
  kind: QuotaKind,
  now = Date.now(),
): Promise<void> {
  const day = utcDay(now);
  const [userCounter, globalCounter] = await Promise.all([
    ctx.db
      .query("usageCounters")
      .withIndex("by_userId_and_day", (q) => q.eq("userId", userId).eq("day", day))
      .unique(),
    ctx.db
      .query("usageCounters")
      .withIndex("by_scope_and_day", (q) => q.eq("scope", "global").eq("day", day))
      .unique(),
  ]);
  const field = kind === "article" ? "articleStarts" : kind === "briefing" ? "briefingStarts" : "deliveryStarts";
  const userLimit = kind === "article" ? quotas.userArticlesPerDay : kind === "briefing" ? quotas.userBriefingsPerDay : quotas.userDeliveriesPerDay;
  const globalLimit = kind === "article" ? quotas.globalArticlesPerDay : kind === "briefing" ? quotas.globalBriefingsPerDay : quotas.globalDeliveriesPerDay;
  if ((userCounter?.[field] ?? 0) >= userLimit || (globalCounter?.[field] ?? 0) >= globalLimit) {
    throw new ConvexError("Daily capacity is currently exhausted. Try again tomorrow.");
  }
  if (userCounter === null) {
    await ctx.db.insert("usageCounters", {
      scope: "user",
      userId,
      day,
      articleStarts: kind === "article" ? 1 : 0,
      briefingStarts: kind === "briefing" ? 1 : 0,
      deliveryStarts: kind === "delivery" ? 1 : 0,
      updatedAt: now,
    });
  } else {
    await ctx.db.patch(userCounter._id, { [field]: userCounter[field] + 1, updatedAt: now });
  }
  if (globalCounter === null) {
    await ctx.db.insert("usageCounters", {
      scope: "global",
      day,
      articleStarts: kind === "article" ? 1 : 0,
      briefingStarts: kind === "briefing" ? 1 : 0,
      deliveryStarts: kind === "delivery" ? 1 : 0,
      updatedAt: now,
    });
  } else {
    await ctx.db.patch(globalCounter._id, { [field]: globalCounter[field] + 1, updatedAt: now });
  }
}
