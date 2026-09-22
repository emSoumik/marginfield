import { z } from "zod";

export const MAX_BRIEFING_SOURCES = 8;
export const MAX_SOURCE_CHARS = 12_000;
export const MAX_PROMPT_CHARS = 64_000;
export const MAX_OUTPUT_TOKENS = 900;

const nonEmptyText = (maximum: number) => z.string().trim().min(1).max(maximum);

export const briefingOutputSchema = z.object({
  title: nonEmptyText(160),
  summary: nonEmptyText(700),
  sections: z.array(z.object({
    title: nonEmptyText(160),
    body: nonEmptyText(2_000),
    sourceIds: z.array(z.string().min(1)).min(1).max(MAX_BRIEFING_SOURCES),
  })).min(1).max(6),
});

export type BriefingOutput = z.infer<typeof briefingOutputSchema>;

export type BriefingSource = {
  _id: string;
  userId: string;
  title: string;
  content: string;
  excerpt: string;
  url?: string;
  status?: string;
};

function bounded(value: string, maximum: number): string {
  return value.replace(/\u0000/g, "").trim().slice(0, maximum);
}

/** Validates the source snapshot before any provider request. */
export function selectOwnedSources(
  sources: readonly BriefingSource[],
  userId: string,
  selectedSourceIds: readonly string[],
): BriefingSource[] {
  if (selectedSourceIds.length < 1 || selectedSourceIds.length > MAX_BRIEFING_SOURCES) {
    throw new Error("A briefing needs between 1 and 8 sources.");
  }
  if (new Set(selectedSourceIds).size !== selectedSourceIds.length) {
    throw new Error("A briefing cannot include the same source twice.");
  }

  const byId = new Map(sources.map((source) => [source._id, source]));
  return selectedSourceIds.map((sourceId) => {
    const source = byId.get(sourceId);
    if (!source || source.userId !== userId || source.status !== "ready") {
      throw new Error("One or more selected sources are unavailable.");
    }
    if (!bounded(source.content || source.excerpt, 1)) {
      throw new Error("One or more selected sources have no readable text.");
    }
    return source;
  });
}

export function buildBriefingPrompt(sources: readonly BriefingSource[]): string {
  const records = sources.map((source) => ({
    id: source._id,
    title: bounded(source.title, 300) || "Untitled source",
    url: source.url ? bounded(source.url, 2_048) : undefined,
    text: bounded(source.content || source.excerpt, MAX_SOURCE_CHARS),
  }));
  const serialize = (textLimit: number) => JSON.stringify({
    sources: records.map((source) => ({ ...source, text: source.text.slice(0, textLimit) })),
  });

  const full = serialize(MAX_SOURCE_CHARS);
  if (full.length <= MAX_PROMPT_CHARS) return full;

  // JSON serialization happens before measuring so escape expansion is included.
  let low = 0;
  let high = MAX_SOURCE_CHARS;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (serialize(middle).length <= MAX_PROMPT_CHARS) low = middle;
    else high = middle - 1;
  }
  const prompt = serialize(low);
  if (prompt.length > MAX_PROMPT_CHARS) throw new Error("Selected source metadata is too large.");
  return prompt;
}

export function parseBriefingOutput(value: unknown, selectedSourceIds: readonly string[]): BriefingOutput {
  const parsed = briefingOutputSchema.safeParse(value);
  if (!parsed.success) throw new Error("The briefing response had an invalid format.");

  const allowed = new Set(selectedSourceIds);
  for (const section of parsed.data.sections) {
    for (const sourceId of section.sourceIds) {
      if (!allowed.has(sourceId)) throw new Error("The briefing response cited an unknown source.");
    }
  }
  return parsed.data;
}
