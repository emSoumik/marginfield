import { describe, it, expect } from "vitest";
import { filterSources, safeUrl, readMinutes } from "../src/lib/model";
import { sampleSources } from "../src/lib/sample";
describe("reader boundaries", () => {
  it("combines search, source type, and unread filters", () => {
    expect(
      filterSources(sampleSources, "newsletter", "smaller", true).map(
        (s) => s._id,
      ),
    ).toEqual(["sample-2"]);
    expect(filterSources(sampleSources, "bookmarks", "", false)).toHaveLength(
      2,
    );
  });
  it("rejects executable links, credentials, and invalid URLs", () => {
    expect(safeUrl("javascript:alert(1)")).toBeUndefined();
    expect(safeUrl("https://user:pass@example.com")).toBeUndefined();
    expect(safeUrl("data:text/html,hello")).toBeUndefined();
    expect(safeUrl("https://example.com/article")).toBe(
      "https://example.com/article",
    );
  });
  it("never shows zero reading time", () => {
    expect(readMinutes("")).toBe(1);
    expect(readMinutes("word ".repeat(500))).toBe(3);
  });
});
