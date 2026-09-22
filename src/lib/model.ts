export type SourceKind = "article" | "newsletter" | "note";
export interface Source {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  kind: SourceKind;
  status: "queued" | "processing" | "ready" | "failed";
  url?: string;
  author?: string;
  imageUrl?: string;
  read: boolean;
  bookmarked: boolean;
  createdAt: number;
  error?: string;
}
export interface Briefing {
  _id: string;
  title: string;
  summary: string;
  sections: { title: string; body: string; sourceIds: string[] }[];
  status: "generating" | "ready" | "failed";
  error?: string;
  createdAt: number;
  emailStatus?: string;
}
export interface Workspace {
  mode: "preview" | "cloud";
  sources: Source[];
  briefings: Briefing[];
  loading: boolean;
  inbox?: { email: string };
  error?: string;
  addUrl(url: string): Promise<string>;
  addNote(title: string, content: string): Promise<string>;
  setState(
    id: string,
    state: { read?: boolean; bookmarked?: boolean },
  ): Promise<void>;
  remove(id: string): Promise<void>;
  generate(ids: string[]): Promise<string>;
  createInbox(): Promise<void>;
  send(id: string, to: string): Promise<void>;
  refreshDelivery(id: string): Promise<void>;
}
export type View = "inbox" | "briefings" | "bookmarks" | SourceKind;
export function filterSources(
  sources: Source[],
  view: View,
  search: string,
  unread: boolean,
) {
  const q = search.trim().toLocaleLowerCase();
  return sources.filter(
    (source) =>
      (!unread || !source.read) &&
      (view !== "bookmarks" || source.bookmarked) &&
      (!["article", "newsletter", "note"].includes(view) ||
        source.kind === view) &&
      (!q ||
        [source.title, source.excerpt, source.author]
          .join(" ")
          .toLocaleLowerCase()
          .includes(q)),
  );
}
export function readMinutes(content: string) {
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 220));
}
export function safeUrl(value?: string) {
  try {
    const url = new URL(value ?? "");
    return ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}
export function sourceLabel(source: Source) {
  if (source.author) return source.author;
  try {
    return new URL(source.url ?? "").hostname.replace(/^www\./, "");
  } catch {
    return source.kind === "note"
      ? "Your notes"
      : source.kind === "newsletter"
        ? "Newsletter"
        : "Article";
  }
}
