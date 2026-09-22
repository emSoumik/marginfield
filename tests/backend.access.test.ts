import { describe, expect, it } from "vitest";
import {
  MAX_BRIEFING_SOURCES,
  MAX_SOURCE_CONTENT_LENGTH,
  requireBoundedText,
} from "../convex/access";

describe("backend access boundaries", () => {
  it("trims valid bounded text", () => {
    expect(requireBoundedText("  A note  ", 20, "Title")).toBe("A note");
  });

  it("rejects empty and oversized text", () => {
    expect(() => requireBoundedText("   ", 20, "Title")).toThrow("Title");
    expect(() => requireBoundedText("x".repeat(MAX_SOURCE_CONTENT_LENGTH + 1), MAX_SOURCE_CONTENT_LENGTH, "Content")).toThrow("Content");
  });

  it("keeps the briefing source cap intentionally small", () => {
    expect(MAX_BRIEFING_SOURCES).toBe(8);
  });
});

import { quotas, utcDay } from "../convex/quota";

describe("backend quota policy", () => {
  it("uses stable UTC daily buckets and positive safe defaults", () => {
    expect(utcDay(Date.UTC(2026, 8, 22, 23, 59, 59))).toBe("2026-09-22");
    expect(utcDay(Date.UTC(2026, 8, 23, 0, 0, 0))).toBe("2026-09-23");
    expect(quotas.userArticlesPerDay).toBeGreaterThan(0);
    expect(quotas.globalBriefingsPerDay).toBeGreaterThan(0);
  });
});
