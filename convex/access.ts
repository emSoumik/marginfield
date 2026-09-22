import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const MAX_TITLE_LENGTH = 500;
export const MAX_SOURCE_CONTENT_LENGTH = 100_000;
export const MAX_SOURCE_URL_LENGTH = 4_096;
export const MAX_BRIEFING_SOURCES = 8;

export function requireBoundedText(value: string, maximum: number, field: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > maximum) {
    throw new ConvexError(`${field} must contain 1 to ${maximum} characters.`);
  }
  return trimmed;
}

export async function requireUserId(ctx: { auth: unknown }): Promise<any> {
  const userId = await getAuthUserId(ctx as never);
  if (userId === null) throw new ConvexError("Authentication is required.");
  return userId;
}

export const getOwnedSource = internalQuery({
  args: { sourceId: v.id("sources"), userId: v.id("users") },
  returns: v.union(v.null(), v.any()),
  handler: async (ctx, args) => {
    const source = await ctx.db.get(args.sourceId);
    return source?.userId === args.userId ? source : null;
  },
});

export const getOwnedBriefing = internalQuery({
  args: { briefingId: v.id("briefings"), userId: v.id("users") },
  returns: v.union(v.null(), v.any()),
  handler: async (ctx, args) => {
    const briefing = await ctx.db.get(args.briefingId);
    return briefing?.userId === args.userId ? briefing : null;
  },
});

export const getBriefingSnapshot = internalQuery({
  args: { briefingId: v.id("briefings") },
  returns: v.union(v.null(), v.any()),
  handler: (ctx, args) => ctx.db.get(args.briefingId),
});

export const getSourceSnapshot = internalQuery({
  args: { sourceId: v.id("sources") },
  returns: v.union(v.null(), v.any()),
  handler: (ctx, args) => ctx.db.get(args.sourceId),
});

export const updateSource = internalMutation({
  args: {
    sourceId: v.id("sources"),
    status: v.union(v.literal("processing"), v.literal("ready"), v.literal("failed")),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    error: v.optional(v.string()),
    author: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { sourceId, ...patch } = args;
    const source = await ctx.db.get(sourceId);
    if (source === null) throw new ConvexError("Source not found.");
    await ctx.db.patch(sourceId, patch);
    return null;
  },
});

export const updateBriefing = internalMutation({
  args: {
    briefingId: v.id("briefings"),
    expectedAttempt: v.number(),
    status: v.union(v.literal("ready"), v.literal("failed")),
    title: v.optional(v.string()),
    summary: v.optional(v.string()),
    sections: v.optional(
      v.array(v.object({ title: v.string(), body: v.string(), sourceIds: v.array(v.id("sources")) })),
    ),
    error: v.optional(v.string()),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const { briefingId, expectedAttempt, ...patch } = args;
    const briefing = await ctx.db.get(briefingId);
    if (briefing === null || briefing.status !== "generating" || briefing.generationAttempt !== expectedAttempt) {
      return false;
    }
    await ctx.db.patch(briefingId, { ...patch, generationDeadlineAt: undefined });
    return true;
  },
});
