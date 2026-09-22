import { useState, type FormEvent } from "react";
import {
  CopyIcon,
  EnvelopeSimpleIcon,
  LinkIcon,
  NotePencilIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react";
import type { Workspace } from "../lib/model";
import { Dialog } from "./Dialog";
export function AddSource({
  workspace,
  onClose,
  onAdded,
}: {
  workspace: Workspace;
  onClose: () => void;
  onAdded: (id: string) => void;
}) {
  const [tab, setTab] = useState<"url" | "note" | "mail">("url");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const id =
        tab === "url"
          ? await workspace.addUrl(url)
          : await workspace.addNote(title, content);
      onAdded(id);
      onClose();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Unable to save this source. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog title="Add something worth reading" onClose={onClose}>
      <div className="form-tabs" role="group" aria-label="Source type">
        {(
          [
            { id: "url", name: "Article", icon: LinkIcon },
            { id: "note", name: "Note", icon: NotePencilIcon },
            { id: "mail", name: "Newsletter", icon: EnvelopeSimpleIcon },
          ] as const
        ).map(({ id, name, icon: Icon }) => (
          <button
            key={id}
            type="button"
            aria-pressed={tab === id}
            className={tab === id ? "active" : ""}
            onClick={() => {
              setTab(id);
              setError("");
            }}
          >
            <Icon size={18} />
            {name}
          </button>
        ))}
      </div>
      {tab === "mail" ? (
        <div className="form-body">
          <p className="form-description">
            Forward newsletters to your personal Marginfield inbox. They’ll appear
            alongside your saved articles.
          </p>
          {workspace.inbox ? (
            <>
              <label>Your forwarding address</label>
              <div className="copy-field">
                <code>{workspace.inbox.email}</code>
                <button
                  className="icon-button"
                  aria-label="Copy forwarding address"
                  onClick={() =>
                    navigator.clipboard
                      .writeText(workspace.inbox!.email)
                      .then(() => setCopied(true))
                      .catch(() =>
                        setError(
                          "Copy failed. Select and copy the address manually.",
                        ),
                      )
                  }
                >
                  <CopyIcon size={18} />
                </button>
              </div>
              {copied && <p role="status">Address copied.</p>}
            </>
          ) : (
            <>
              <p className="subtle-note">
                {workspace.mode === "preview"
                  ? "Connect Convex and AgentMail to create a real inbox. Preview mode does not receive email."
                  : "Create an inbox once. Inbound messages are private to your account."}
              </p>
              <button
                className="primary-button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await workspace.createInbox();
                  } catch (e) {
                    setError(
                      e instanceof Error
                        ? e.message
                        : "Unable to create inbox.",
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy ? "Creating inbox…" : "Create my inbox"}
                <ArrowRightIcon size={17} />
              </button>
            </>
          )}
        </div>
      ) : (
        <form className="form-body" onSubmit={submit}>
          {tab === "url" ? (
            <>
              <label htmlFor="article-url">Article URL</label>
              <input
                id="article-url"
                type="url"
                placeholder="https://…"
                required
                maxLength={2048}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <p className="form-description">
                Firecrawl extracts the readable content. Only public articles
                are supported.
              </p>
              {workspace.mode === "preview" && (
                <p className="subtle-note">
                  Article extraction needs a connected backend. To try saving
                  locally, choose Note.
                </p>
              )}
            </>
          ) : (
            <>
              <label htmlFor="note-title">Title</label>
              <input
                id="note-title"
                required
                maxLength={160}
                placeholder="A thought to come back to"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <label htmlFor="note-content">Your note</label>
              <textarea
                id="note-content"
                rows={7}
                required
                maxLength={20000}
                placeholder="Add an idea, a passage, or your own perspective…"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </>
          )}
          <button className="primary-button" disabled={busy}>
            {busy ? "Saving…" : tab === "url" ? "Save article" : "Save note"}
            <ArrowRightIcon size={17} />
          </button>
        </form>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </Dialog>
  );
}
export function EmailForm({
  workspace,
  briefingId,
  onClose,
  onSent,
}: {
  workspace: Workspace;
  briefingId: string;
  onClose: () => void;
  onSent: () => void;
}) {
  const [to, setTo] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <Dialog title="A little perspective, delivered" onClose={onClose}>
      <form
        className="form-body"
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy) return;
          setBusy(true);
          try {
            await workspace.send(briefingId, to);
            onSent();
            onClose();
          } catch (e) {
            setError(
              e instanceof Error ? e.message : "Could not queue this email.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <p className="form-description">
          Send this briefing with its source references. Nothing is sent until
          you choose Send briefing.
        </p>
        <label htmlFor="recipient">Your email address</label>
        <input
          id="recipient"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <p className="subtle-note">
          {workspace.mode === "preview"
            ? "Preview mode never sends email. Connect AgentMail to enable delivery."
            : "Delivery is limited to a server-approved recipient during this private beta. A personal inbox is required."}
        </p>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="primary-button" disabled={busy}>
          {busy ? "Queuing…" : "Send briefing"}
          <EnvelopeSimpleIcon size={17} />
        </button>
      </form>
    </Dialog>
  );
}
