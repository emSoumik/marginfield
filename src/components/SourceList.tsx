import {
  ArrowRightIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  ListIcon,
  SlidersHorizontalIcon,
  EnvelopeSimpleIcon,
  FileTextIcon,
  BookmarkSimpleIcon,
} from "@phosphor-icons/react";
import {
  sourceLabel,
  type Source,
  type Workspace,
  type View,
} from "../lib/model";
const names: Record<View, string> = {
  inbox: "Inbox",
  briefings: "Briefings",
  bookmarks: "Bookmarks",
  article: "Articles",
  newsletter: "Newsletters",
  note: "Notes",
};
export function SourceList({
  workspace,
  view,
  sources,
  search,
  setSearch,
  unread,
  setUnread,
  selection,
  toggleSelection,
  activeId,
  onSource,
  onBriefing,
  onMenu,
  onGenerate,
  generating,
  onAdd,
}: {
  workspace: Workspace;
  view: View;
  sources: Source[];
  search: string;
  setSearch: (x: string) => void;
  unread: boolean;
  setUnread: (x: boolean) => void;
  selection: string[];
  toggleSelection: (id: string) => void;
  activeId?: string;
  onSource: (s: Source) => void;
  onBriefing: (id: string) => void;
  onMenu: () => void;
  onGenerate: () => void;
  generating: boolean;
  onAdd: () => void;
}) {
  const matchingBriefings = workspace.briefings.filter((b) =>
    `${b.title} ${b.summary}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );
  return (
    <section
      id="library"
      tabIndex={-1}
      className="source-panel"
      aria-label={names[view]}
    >
      <header className="panel-head">
        <button
          className="icon-button mobile-only"
          aria-label="Open navigation"
          onClick={onMenu}
        >
          <ListIcon size={22} />
        </button>
        <h1>{names[view]}</h1>
        <span className="total-count">
          {view === "briefings" ? workspace.briefings.length : sources.length}
        </span>
        {view !== "briefings" && (
          <button
            className={`icon-button filter-button ${unread ? "selected" : ""}`}
            aria-label={unread ? "Show all sources" : "Show unread sources"}
            aria-pressed={unread}
            onClick={() => setUnread(!unread)}
          >
            <SlidersHorizontalIcon size={20} />
          </button>
        )}
      </header>
      <div className="search-field">
        <MagnifyingGlassIcon size={18} />
        <input
          aria-label="Search your library"
          placeholder={
            view === "briefings" ? "Search briefings…" : "Search your reading…"
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <kbd>/</kbd>
      </div>
      <div className="source-scroll" aria-busy={workspace.loading}>
        {workspace.loading ? (
          <div className="loading-state" role="status">
            Loading your library…
          </div>
        ) : view === "briefings" ? (
          matchingBriefings.map((b) => (
            <button
              className={`brief-row ${activeId === b._id ? "active" : ""}`}
              key={b._id}
              onClick={() => onBriefing(b._id)}
            >
              <span className="source-meta">
                {new Date(b.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}{" "}
                · {b.status === "ready" ? "Ready" : b.status}
              </span>
              <h2>{b.title || "Creating your briefing…"}</h2>
              <p>{b.summary || "Bringing your sources together."}</p>
              <ArrowRightIcon size={18} />
            </button>
          ))
        ) : (
          sources.map((s) => (
            <div
              className={`source-row ${activeId === s._id ? "active" : ""} ${s.read ? "is-read" : ""}`}
              key={s._id}
            >
              <label className="source-check">
                <input
                  type="checkbox"
                  aria-label={`Include ${s.title} in briefing`}
                  disabled={s.status !== "ready"}
                  checked={selection.includes(s._id)}
                  onChange={() => toggleSelection(s._id)}
                />
                <span>
                  <CheckIcon size={12} weight="bold" />
                </span>
              </label>
              <button className="source-open" onClick={() => onSource(s)}>
                <span className="source-meta">
                  <span>
                    {s.kind === "newsletter" ? (
                      <EnvelopeSimpleIcon size={12} />
                    ) : (
                      <FileTextIcon size={12} />
                    )}{" "}
                    {sourceLabel(s)}
                  </span>
                  <span>
                    {new Date(s.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </span>
                {s.imageUrl?.startsWith("/images/") && (
                  <img
                    className="source-thumbnail"
                    src={s.imageUrl}
                    alt=""
                    width="64"
                    height="64"
                    loading="lazy"
                  />
                )}
                <h2>{s.title}</h2>
                <p>
                  {s.status === "ready"
                    ? s.excerpt
                    : s.status === "failed"
                      ? "Could not process this source. Open for details."
                      : s.status === "processing"
                        ? "Extracting readable content…"
                        : "Waiting to process…"}
                </p>
                <span className="row-status">
                  {s.bookmarked && (
                    <BookmarkSimpleIcon size={12} weight="fill" />
                  )}
                  {!s.read && <span className="unread-dot" />}
                </span>
              </button>
            </div>
          ))
        )}
        {!workspace.loading &&
          ((view !== "briefings" && sources.length === 0) ||
            (view === "briefings" && matchingBriefings.length === 0)) && (
            <div className="empty-state">
              <FileTextIcon size={28} />
              <h2>
                {search || unread
                  ? "Nothing matches just yet"
                  : view === "briefings"
                    ? "Your next perspective starts here"
                    : "A little space for good reading"}
              </h2>
              <p>
                {search || unread
                  ? "Try a different search or show all sources."
                  : view === "briefings"
                    ? "Select a few sources from your inbox to create a briefing."
                    : "Save an article, forward a newsletter, or write a note."}
              </p>
              <button className="secondary-button" onClick={onAdd}>
                Add a source
              </button>
            </div>
          )}
      </div>
      <footer className="selection-footer">
        <button
          className="primary-button"
          disabled={!selection.length || generating}
          onClick={onGenerate}
        >
          {generating ? "Creating briefing…" : "Create briefing"}
          <ArrowRightIcon size={17} />
        </button>
        <span>
          {selection.length
            ? `${selection.length} source${selection.length === 1 ? "" : "s"} selected`
            : "Select sources to connect the dots"}
          {workspace.mode === "preview" ? " · Preview" : ""}
        </span>
      </footer>
    </section>
  );
}
