import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const sourceStatus = v.union(
  v.literal("queued"),
  v.literal("processing"),
  v.literal("ready"),
  v.literal("failed"),
);

export default defineSchema({
  ...authTables,
  sources: defineTable({
    userId: v.id("users"),
    url: v.optional(v.string()),
    title: v.string(),
    content: v.string(),
    excerpt: v.string(),
    kind: v.union(v.literal("article"), v.literal("newsletter"), v.literal("note")),
    status: sourceStatus,
    error: v.optional(v.string()),
    author: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    read: v.boolean(),
    bookmarked: v.boolean(),
    createdAt: v.number(),
    processingDeadlineAt: v.optional(v.number()),
    processingAttempt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_status", ["userId", "status"])
    .index("by_userId_and_url", ["userId", "url"])
    .index("by_status_and_createdAt", ["status", "createdAt"]),
  briefings: defineTable({
    userId: v.id("users"),
    title: v.string(),
    summary: v.string(),
    sourceIds: v.array(v.id("sources")),
    requestKey: v.string(),
    sections: v.array(
      v.object({ title: v.string(), body: v.string(), sourceIds: v.array(v.id("sources")) }),
    ),
    status: v.union(v.literal("generating"), v.literal("ready"), v.literal("failed")),
    error: v.optional(v.string()),
    createdAt: v.number(),
    generationAttempt: v.number(),
    generationDeadlineAt: v.optional(v.number()),
    outboundId: v.optional(v.string()),
    emailStatus: v.optional(v.union(v.literal("queued"), v.literal("sent"), v.literal("delivered"), v.literal("failed"), v.literal("bounced"))),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_requestKey", ["userId", "requestKey"])
    .index("by_userId_and_status", ["userId", "status"])
    .index("by_status_and_createdAt", ["status", "createdAt"])
    .index("by_outboundId", ["outboundId"]),
  inboxes: defineTable({
    userId: v.id("users"),
    inboxId: v.string(),
    email: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_inboxId", ["inboxId"]),
  providerEvents: defineTable({
    eventId: v.string(),
    messageId: v.optional(v.string()),
    inboxId: v.string(),
    createdAt: v.number(),
  })
    .index("by_eventId", ["eventId"])
    .index("by_messageId", ["messageId"]),
  mutationReceipts: defineTable({
    userId: v.id("users"),
    operation: v.string(),
    key: v.string(),
    createdAt: v.number(),
  })
    .index("by_userId_and_operation_and_key", ["userId", "operation", "key"])
    .index("by_userId_and_operation", ["userId", "operation"]),
  usageCounters: defineTable({
    scope: v.union(v.literal("user"), v.literal("global")),
    userId: v.optional(v.id("users")),
    day: v.string(),
    articleStarts: v.number(),
    briefingStarts: v.number(),
    deliveryStarts: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId_and_day", ["userId", "day"])
    .index("by_scope_and_day", ["scope", "day"]),
});
