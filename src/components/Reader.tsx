import { useState } from "react";
import {
  ArrowLeftIcon,
  ArrowSquareOutIcon,
  BookmarkSimpleIcon,
  CheckCircleIcon,
  EnvelopeSimpleIcon,
  FileTextIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import {
  readMinutes,
  safeUrl,
  sourceLabel,
  type Briefing,
  type Source,
} from "../lib/model";
export function Reader({
  source,
  briefing,
  sources,
  preview,
  onBack,
  onBookmark,
  onRead,
  onSource,
  onEmail,
  onRefreshEmail,
  onRemove,
}: {
  source?: Source;
  briefing?: Briefing;
  sources: Source[];
  preview: boolean;
  onBack: () => void;
  onBookmark: (s: Source) => void;
  onRead: (s: Source) => void;
  onSource: (s: Source) => void;
  onEmail: () => void;
  onRefreshEmail: () => Promise<void>;
  onRemove: (s: Source) => void;
}) {
  const [checkingDelivery, setCheckingDelivery] = useState(false);
  const entry = source ?? briefing;
  const ids = briefing
    ? [...new Set(briefing.sections.flatMap((s) => s.sourceIds))]
    : [];
  const refs = ids
    .map((id) => sources.find((s) => s._id === id))
    .filter((x): x is Source => Boolean(x));
  return (
    <main className="reader-panel" id="reading" tabIndex={-1}>
      <header className="reader-toolbar">
        <button
          className="icon-button mobile-only"
          onClick={onBack}
          aria-label="Back to inbox"
        >
          <ArrowLeftIcon size={22} />
        </button>
        <span className="eyebrow">
          {source ? source.kind : "Briefing"}
          {entry && (
            <>
              {" "}
              <span className="slash">/</span>{" "}
              {new Date(entry.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </>
          )}
        </span>
        <div className="toolbar-actions">
          {source && (
            <>
              <button
                className={`icon-button ${source.bookmarked ? "selected" : ""}`}
                aria-label={
                  source.bookmarked ? "Remove bookmark" : "Bookmark article"
                }
                aria-pressed={source.bookmarked}
                onClick={() => onBookmark(source)}
              >
                <BookmarkSimpleIcon
                  size={21}
                  weight={source.bookmarked ? "fill" : "regular"}
                />
              </button>
              <button
                className="icon-button"
                aria-label={source.read ? "Mark unread" : "Mark read"}
                onClick={() => onRead(source)}
              >
                <CheckCircleIcon
                  size={21}
                  weight={source.read ? "fill" : "regular"}
                />
              </button>
              {safeUrl(source.url) && (
                <a
                  className="icon-button"
                  href={safeUrl(source.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open original article"
                >
                  <ArrowSquareOutIcon size={21} />
                </a>
              )}
              <button
                className="icon-button muted-action"
                aria-label="Delete source"
                onClick={() => onRemove(source)}
              >
                <TrashIcon size={19} />
              </button>
            </>
          )}
          {briefing?.status === "ready" && (
            <button className="secondary-button email-button" onClick={onEmail}>
              <EnvelopeSimpleIcon size={17} />
              <span>Email briefing</span>
            </button>
          )}
        </div>
      </header>
      {!entry ? (
        <div className="reader-empty">
          <img src="/brand/mark.png" alt="" width="70" height="70" />
          <h2>A little perspective.</h2>
          <p>
            Open something worth reading, or bring a few sources together in a
            briefing.
          </p>
        </div>
      ) : (
        <article
          className={`reading-body ${source ? "article-reading" : "briefing-reading"}`}
          key={entry._id}
        >
          {source && (
            <p className="article-publication">{sourceLabel(source)}</p>
          )}
          <h1>{entry.title || "Bringing your sources together…"}</h1>
          <p className="reading-meta">
            {source
              ? `${readMinutes(source.content)} min read`
              : `${refs.length} sources · ${readMinutes((briefing?.summary ?? "") + (briefing?.sections.map((s) => s.body).join(" ") ?? ""))} min read`}
            {preview && <span className="preview-label">Sample / preview</span>}
          </p>
          {entry.status === "failed" ? (
            <div className="inline-error" role="alert">
              <h2>We couldn’t finish this one.</h2>
              <p>
                {entry.error ||
                  "Check the provider setup, then try with another source."}
              </p>
            </div>
          ) : entry.status === "queued" ||
            entry.status === "processing" ||
            entry.status === "generating" ? (
            <div className="processing" role="status">
              <span className="pulse-dot" />
              <h2>
                {source ? "Preparing your article" : "Finding the connections"}
              </h2>
              <p>You can keep reading. This view updates when it is ready.</p>
            </div>
          ) : (
            <>
              {source?.imageUrl?.startsWith("/images/") && (
                <img
                  className="article-hero"
                  src={source.imageUrl}
                  width="1536"
                  height="1024"
                  alt="An open book and a cup beside a sunlit window"
                />
              )}
              {briefing?.emailStatus && (
                <div className="delivery-status" role="status">
                  Email {briefing.emailStatus}.{" "}
                  {briefing.emailStatus === "queued"
                    ? "Delivery is not yet confirmed."
                    : ""}
                  {["queued", "sent"].includes(briefing.emailStatus) && (
                    <button
                      className="secondary-button"
                      disabled={checkingDelivery}
                      onClick={async () => {
                        setCheckingDelivery(true);
                        try {
                          await onRefreshEmail();
                        } finally {
                          setCheckingDelivery(false);
                        }
                      }}
                    >
                      {checkingDelivery ? "Checking…" : "Check delivery"}
                    </button>
                  )}
                </div>
              )}
              {briefing ? (
                <>
                  <p className="briefing-intro">{briefing.summary}</p>
                  <div className="takeaways">
                    {briefing.sections.map((section, i) => (
                      <section className="takeaway" key={i}>
                        <span className="takeaway-number">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <h2>{section.title}</h2>
                          <p>{section.body}</p>
                          <div className="citation-list">
                            {section.sourceIds.map((id) => {
                              const s = sources.find((x) => x._id === id);
                              return s ? (
                                <button
                                  className="citation"
                                  key={id}
                                  onClick={() => onSource(s)}
                                >
                                  <span>{ids.indexOf(id) + 1}</span>
                                  {sourceLabel(s)}
                                </button>
                              ) : (
                                <span className="citation missing" key={id}>
                                  Source removed
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </section>
                    ))}
                  </div>
                  <section className="references">
                    <h2 className="eyebrow">Sources</h2>
                    {refs.map((s, i) => (
                      <button key={s._id} onClick={() => onSource(s)}>
                        <span>{i + 1}</span>
                        <span>
                          {s.title}
                          <small>{sourceLabel(s)}</small>
                        </span>
                        <ArrowSquareOutIcon size={16} />
                      </button>
                    ))}
                  </section>
                </>
              ) : (
                <div className="article-copy">
                  {source?.content
                    .split(/\n\s*\n/)
                    .filter(Boolean)
                    .map((paragraph, i) => (
                      <p key={i}>{paragraph.replace(/^#{1,6}\s+/, "")}</p>
                    ))}
                </div>
              )}
              {preview && (
                <p className="content-disclosure">
                  <FileTextIcon size={14} /> Original sample content for
                  exploring Marginfield. Live extraction and AI require a connected
                  backend.
                </p>
              )}
            </>
          )}
        </article>
      )}
    </main>
  );
}
