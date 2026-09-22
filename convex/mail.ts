import { AgentMail } from "@agentmail/convex";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { HttpRouter } from "convex/server";
import { ConvexError, v } from "convex/values";
import { action, httpAction, internalAction, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { components, internal } from "./_generated/api";
import { boundedText, eventKey, plainExcerpt, recipientAllowed, validRecipient } from "./providerSafety";
import { reserveDailyQuota } from "./quota";

const agentmail = new AgentMail(components.agentmail, {
  onMessageReceived: internal.mail.receiveInbound,
});

async function requireUser(ctx: { auth: unknown }) {
  const userId = await getAuthUserId(ctx as never);
  if (!userId) throw new ConvexError("Sign in is required.");
  return userId;
}

export const persistInbox = internalMutation({
  args: { userId: v.id("users"), inboxId: v.string(), email: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("inboxes").withIndex("by_userId", (q) => q.eq("userId", args.userId)).unique();
    if (existing) return existing;
    return await ctx.db.insert("inboxes", args);
  },
});

export const ownedInbox = internalQuery({
  args: { userId: v.id("users") },
  handler: (ctx, args) => ctx.db.query("inboxes").withIndex("by_userId", (q) => q.eq("userId", args.userId)).unique(),
});

export const createInbox = action({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUser(ctx);
    const existing = await ctx.runQuery(internal.mail.ownedInbox, { userId });
    if (existing) return { inboxId: existing.inboxId, email: existing.email };
    const inbox = await agentmail.createInbox(ctx, { clientId: String(userId) });
    await ctx.runMutation(internal.mail.persistInbox, { userId, inboxId: inbox.inbox_id, email: inbox.email });
    return { inboxId: inbox.inbox_id, email: inbox.email };
  },
});

export const getInbox = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUser(ctx);
    const inbox = await ctx.db.query("inboxes").withIndex("by_userId", (q) => q.eq("userId", userId)).unique();
    return inbox ? { inboxId: inbox.inboxId, email: inbox.email } : null;
  },
});

export const recordInbound = internalMutation({
  args: {
    eventId: v.string(),
    messageId: v.optional(v.string()),
    inboxId: v.string(),
    title: v.string(),
    content: v.string(),
    author: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sameEvent = await ctx.db.query("providerEvents").withIndex("by_eventId", (q) => q.eq("eventId", args.eventId)).unique();
    if (sameEvent) return false;
    if (args.messageId) {
      const sameMessage = await ctx.db.query("providerEvents").withIndex("by_messageId", (q) => q.eq("messageId", args.messageId)).unique();
      if (sameMessage) return false;
    }
    const inbox = await ctx.db.query("inboxes").withIndex("by_inboxId", (q) => q.eq("inboxId", args.inboxId)).unique();
    if (!inbox) return false;
    await ctx.db.insert("providerEvents", {
      eventId: args.eventId,
      messageId: args.messageId,
      inboxId: args.inboxId,
      createdAt: Date.now(),
    });
    await ctx.db.insert("sources", {
      userId: inbox.userId,
      title: args.title,
      content: args.content,
      excerpt: plainExcerpt(args.content),
      kind: "newsletter",
      status: "ready",
      author: args.author,
      read: false,
      bookmarked: false,
      createdAt: Date.now(),
      processingAttempt: 0,
    });
    return true;
  },
});

export const receiveInbound = internalMutation({
  args: { message: v.any(), thread: v.any(), eventId: v.string() },
  handler: async (ctx, args) => {
    const message = args.message as Record<string, unknown>;
    const messageId = boundedText(message.message_id, 200) || undefined;
    const eventId = eventKey(args.eventId, messageId);
    const inboxId = boundedText(message.inbox_id, 200);
    const content = boundedText(message.text ?? message.extracted_text ?? message.body_text);
    if (!eventId || !inboxId || !content) return;
    await ctx.runMutation(internal.mail.recordInbound, {
      eventId,
      messageId,
      inboxId,
      title: boundedText(message.subject, 500) || "Newsletter",
      content,
      author: boundedText(message.from ?? message.sender, 500) || undefined,
    });
  },
});

export const setDeliveryStatus = internalMutation({
  args: { briefingId: v.id("briefings"), expectedOutboundId: v.string(), emailStatus: v.union(v.literal("queued"), v.literal("sent"), v.literal("delivered"), v.literal("failed"), v.literal("bounced")) },
  handler: async (ctx, args) => {
    const briefing = await ctx.db.get(args.briefingId);
    if (briefing?.outboundId !== args.expectedOutboundId) return false;
    const rank = { queued: 0, sent: 1, delivered: 2, failed: 2, bounced: 2 } as const;
    const current = briefing.emailStatus ?? "queued";
    if (rank[args.emailStatus] < rank[current]) return false;
    await ctx.db.patch(args.briefingId, { emailStatus: args.emailStatus });
    return true;
  },
});

function toEmailStatus(status: string | undefined) {
  if (status === "delivered") return "delivered" as const;
  if (status === "sent") return "sent" as const;
  if (status === "bounced" || status === "complained" || status === "rejected") return "bounced" as const;
  if (status === "failed") return "failed" as const;
  return undefined;
}

export const ownedBriefing = internalQuery({
  args: { briefingId: v.id("briefings"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const briefing = await ctx.db.get(args.briefingId);
    return briefing?.userId === args.userId ? briefing : null;
  },
});

export const getDelivery = query({
  args: { briefingId: v.id("briefings") },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const briefing = await ctx.db.get(args.briefingId);
    if (!briefing || briefing.userId !== userId || !briefing.outboundId) return null;
    const delivery = await agentmail.status(ctx as never, briefing.outboundId as never);
    return { status: toEmailStatus(delivery?.status) ?? briefing.emailStatus ?? "queued", error: delivery?.errorMessage ?? null };
  },
});

export const reconcileDelivery = internalAction({
  args: { briefingId: v.id("briefings"), expectedOutboundId: v.string() },
  handler: async (ctx, args) => {
    const briefing = await ctx.runQuery(internal.mail.reconcileTarget, args);
    if (!briefing) return;
    const delivery = await agentmail.status(ctx as never, args.expectedOutboundId as never);
    const status = toEmailStatus(delivery?.status);
    if (status) await ctx.runMutation(internal.mail.setDeliveryStatus, { ...args, emailStatus: status });
  },
});

export const reconcileTarget = internalQuery({
  args: { briefingId: v.id("briefings"), expectedOutboundId: v.string() },
  handler: async (ctx, args) => {
    const briefing = await ctx.db.get(args.briefingId);
    return briefing?.outboundId === args.expectedOutboundId ? briefing : null;
  },
});

export const refreshDelivery = action({
  args: { briefingId: v.id("briefings") },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const briefing = await ctx.runQuery(internal.mail.ownedBriefing, { briefingId: args.briefingId, userId });
    if (!briefing?.outboundId) throw new ConvexError("Briefing delivery not found.");
    const delivery = await agentmail.status(ctx as never, briefing.outboundId as never);
    const status = toEmailStatus(delivery?.status);
    if (status) await ctx.runMutation(internal.mail.setDeliveryStatus, { briefingId: args.briefingId, expectedOutboundId: briefing.outboundId, emailStatus: status });
    return { status: status ?? briefing.emailStatus ?? "queued" };
  },
});

export const sendBriefing = mutation({
  args: { briefingId: v.id("briefings"), to: v.string(), attemptId: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const to = validRecipient(args.to);
    const attemptId = boundedText(args.attemptId, 100);
    if (!to || !attemptId) throw new ConvexError("Enter a valid recipient and attempt.");
    if (!recipientAllowed(to, undefined, process.env.ALLOWED_DIGEST_RECIPIENT)) {
      throw new ConvexError("Recipient is not allowed for briefings.");
    }
    const briefing = await ctx.db.get(args.briefingId);
    if (!briefing || briefing.userId !== userId || briefing.status !== "ready") throw new ConvexError("Briefing not found.");
    if (briefing.emailStatus && briefing.emailStatus !== "failed" && briefing.emailStatus !== "bounced") {
      throw new ConvexError("This briefing is already queued or delivered.");
    }
    const receipt = await ctx.db.query("mutationReceipts").withIndex("by_userId_and_operation_and_key", (q) => q.eq("userId", userId).eq("operation", "sendBriefing").eq("key", `${args.briefingId}:${to}:${attemptId}`)).unique();
    if (receipt) throw new ConvexError("This delivery attempt was already queued.");
    const recent = await ctx.db.query("mutationReceipts").withIndex("by_userId_and_operation", (q) => q.eq("userId", userId).eq("operation", "sendBriefing")).collect();
    if (recent.filter((entry) => entry.createdAt > Date.now() - 86_400_000).length >= 10) throw new ConvexError("Daily briefing delivery limit reached.");
    await reserveDailyQuota(ctx, userId, "delivery");
    const inbox = await ctx.db.query("inboxes").withIndex("by_userId", (q) => q.eq("userId", userId)).unique();
    if (!inbox) throw new ConvexError("Create your mail inbox first.");
    const sources = await Promise.all(briefing.sections.flatMap((section) => section.sourceIds).slice(0, 50).map((sourceId) => ctx.db.get(sourceId)));
    const sourceList = sources.filter((source) => source?.userId === userId).map((source) => `- ${source!.title}${source!.url ? `\n  ${source!.url}` : ""}`).join("\n");
    const text = boundedText(`${briefing.summary}\n\n${briefing.sections.map((section) => `${section.title}\n${section.body}`).join("\n\n")}\n\nSources\n${sourceList}`);
    const outboundId = await agentmail.sendMessage(ctx, inbox.inboxId, { to, subject: boundedText(briefing.title, 200) || "Marginfield briefing", text });
    await ctx.db.insert("mutationReceipts", { userId, operation: "sendBriefing", key: `${args.briefingId}:${to}:${attemptId}`, createdAt: Date.now() });
    await ctx.db.patch(args.briefingId, { emailStatus: "queued", outboundId });
    await ctx.scheduler.runAfter(60_000, internal.mail.reconcileDelivery, { briefingId: args.briefingId, expectedOutboundId: outboundId });
    return { status: "queued" as const };
  },
});

export function registerMailHttpRoutes(http: HttpRouter) {
  http.route({
    path: "/agentmail/webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
      if (!process.env.AGENTMAIL_WEBHOOK_SECRET) return new Response("Service unavailable", { status: 503 });
      return await agentmail.handleWebhook(ctx as never, request);
    }),
  });
}
