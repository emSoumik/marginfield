import { FirecrawlClient } from "@firecrawl/firecrawl-convex";
import { internalAction, internalMutation } from "./_generated/server";
import { components, internal } from "./_generated/api";
import { v } from "convex/values";
import { boundedText, plainExcerpt, validatePublicHttpUrl } from "./providerSafety";

const firecrawl = new FirecrawlClient(components.firecrawl);
export const claim = internalMutation({ args: { sourceId: v.id("sources") }, handler: async (ctx, { sourceId }) => {
  const source = await ctx.db.get(sourceId);
  if (!source || source.status !== "queued" || !source.url) return null;
  const attempt = (source.processingAttempt ?? 0) + 1;
  await ctx.db.patch(sourceId, { status: "processing", error: undefined, processingDeadlineAt: Date.now() + 120_000, processingAttempt: attempt });
  return { url: source.url, title: source.title, attempt };
} });
export const complete = internalMutation({ args: { sourceId: v.id("sources"), attempt: v.number(), title: v.string(), content: v.string(), excerpt: v.string(), imageUrl: v.optional(v.string()) }, handler: async (ctx, args) => { const source = await ctx.db.get(args.sourceId); if (!source || source.status !== "processing" || source.processingAttempt !== args.attempt) return; await ctx.db.patch(args.sourceId, { status: "ready", title: args.title, content: args.content, excerpt: args.excerpt, imageUrl: args.imageUrl, error: undefined, processingDeadlineAt: undefined }); } });
export const fail = internalMutation({ args: { sourceId: v.id("sources"), attempt: v.number() }, handler: async (ctx, { sourceId, attempt }) => { const source = await ctx.db.get(sourceId); if (!source || source.status !== "processing" || source.processingAttempt !== attempt) return; await ctx.db.patch(sourceId, { status: "failed", error: "We could not import this article. Try again later.", processingDeadlineAt: undefined }); } });
export const scrape = internalAction({ args: { sourceId: v.id("sources") }, handler: async (ctx, { sourceId }) => {
  const source = await ctx.runMutation(internal.ingestion.claim, { sourceId }); if (!source) return;
  try {
    const url = validatePublicHttpUrl(source.url);
    const page = await firecrawl.scrape(ctx, url, { formats: ["markdown"], onlyMainContent: true, maxAge: 3_600_000 });
    const content = boundedText(page.markdown);
    if (!content) throw new Error("No readable content");
    const title = boundedText(page.metadata?.title || source.title, 500) || "Untitled article";
    const imageUrl = typeof page.metadata?.image === "string" ? boundedText(page.metadata.image, 2048) : undefined;
    await ctx.runMutation(internal.ingestion.complete, { sourceId, attempt: source.attempt, title, content, excerpt: plainExcerpt(content), imageUrl });
  } catch { await ctx.runMutation(internal.ingestion.fail, { sourceId, attempt: source.attempt }); }
} });
