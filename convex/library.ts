import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import {
  MAX_SOURCE_CONTENT_LENGTH,
  MAX_SOURCE_URL_LENGTH,
  MAX_TITLE_LENGTH,
  requireBoundedText,
} from "./access";
import { quotas, reserveDailyQuota } from "./quota";

const MAX_LIBRARY_ITEMS = 100;

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
      .query("sources")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(MAX_LIBRARY_ITEMS);
  },
});

export const addNote = mutation({
  args: { title: v.string(), content: v.string() },
  returns: v.id("sources"),
  handler: async (ctx, args) => {
    const userId = await currentUser(ctx);
    const title = requireBoundedText(args.title, MAX_TITLE_LENGTH, "Title");
    const content = requireBoundedText(args.content, MAX_SOURCE_CONTENT_LENGTH, "Content");
    return await ctx.db.insert("sources", {
      userId,
      title,
      content,
      excerpt: content.slice(0, 500),
      kind: "note",
      status: "ready",
      read: false,
      bookmarked: false,
      createdAt: Date.now(),
    });
  },
});

export const queueArticle = mutation({
  args: { url: v.string() },
  returns: v.id("sources"),
  handler: async (ctx, args) => {
    const userId = await currentUser(ctx);
    const url = requireBoundedText(args.url, MAX_SOURCE_URL_LENGTH, "URL");
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw new ConvexError("URL must be valid.");
    }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      throw new ConvexError("URL must use HTTP or HTTPS.");
    }
    const duplicate = await ctx.db
      .query("sources")
      .withIndex("by_userId_and_url", (q) => q.eq("userId", userId).eq("url", url))
      .order("desc")
      .first();
    if (duplicate !== null && duplicate.status !== "failed") return duplicate._id;
    const [userQueued, userProcessing, globalQueued, globalProcessing] = await Promise.all([
      ctx.db.query("sources").withIndex("by_userId_and_status", (q) => q.eq("userId", userId).eq("status", "queued")).take(quotas.userActiveArticles + 1),
      ctx.db.query("sources").withIndex("by_userId_and_status", (q) => q.eq("userId", userId).eq("status", "processing")).take(quotas.userActiveArticles + 1),
      ctx.db.query("sources").withIndex("by_status_and_createdAt", (q) => q.eq("status", "queued")).take(quotas.globalActiveArticles + 1),
      ctx.db.query("sources").withIndex("by_status_and_createdAt", (q) => q.eq("status", "processing")).take(quotas.globalActiveArticles + 1),
    ]);
    if (userQueued.length + userProcessing.length >= quotas.userActiveArticles || globalQueued.length + globalProcessing.length >= quotas.globalActiveArticles) {
      throw new ConvexError("Import capacity is currently full. Try again soon.");
    }
    await reserveDailyQuota(ctx, userId, "article");
    if (duplicate !== null) {
      const sourceId = duplicate._id;
      await ctx.db.patch(sourceId, {
        status: "queued",
        error: undefined,
        processingDeadlineAt: undefined,
        processingAttempt: (duplicate.processingAttempt ?? 0) + 1,
      });
      await ctx.scheduler.runAfter(0, internal.ingestion.scrape, { sourceId });
      return sourceId;
    }
    const sourceId = await ctx.db.insert("sources", {
      userId,
      url,
      title: parsed.hostname,
      content: "",
      excerpt: "",
      kind: "article",
      status: "queued",
      read: false,
      bookmarked: false,
      createdAt: Date.now(),
      processingAttempt: 0,
    });
    await ctx.scheduler.runAfter(0, internal.ingestion.scrape, { sourceId });
    return sourceId;
  },
});

export const setState = mutation({
  args: {
    id: v.id("sources"),
    read: v.optional(v.boolean()),
    bookmarked: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await currentUser(ctx);
    if (args.read === undefined && args.bookmarked === undefined) {
      throw new ConvexError("Set read or bookmarked.");
    }
    const source = await ctx.db.get(args.id);
    if (source === null || source.userId !== userId) throw new ConvexError("Source not found.");
    await ctx.db.patch(args.id, {
      ...(args.read !== undefined ? { read: args.read } : {}),
      ...(args.bookmarked !== undefined ? { bookmarked: args.bookmarked } : {}),
    });
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("sources") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await currentUser(ctx);
    const source = await ctx.db.get(args.id);
    if (source === null || source.userId !== userId) throw new ConvexError("Source not found.");
    await ctx.db.delete(args.id);
    return null;
  },
});
