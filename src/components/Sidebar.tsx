import {
  ArticleIcon,
  BookmarkSimpleIcon,
  EnvelopeSimpleIcon,
  FileTextIcon,
  PlusIcon,
  SlidersHorizontalIcon,
  StackSimpleIcon,
  XIcon,
} from "@phosphor-icons/react";
import type { View, Workspace } from "../lib/model";
export function Sidebar({
  workspace,
  view,
  setView,
  open,
  close,
  onAdd,
  onSettings,
  onAccount,
}: {
  workspace: Workspace;
  view: View;
  setView: (view: View) => void;
  open: boolean;
  close: () => void;
  onAdd: () => void;
  onSettings: () => void;
  onAccount: () => void;
}) {
  const items = [
    {
      id: "inbox",
      label: "Inbox",
      icon: ArticleIcon,
      count: workspace.sources.filter((x) => !x.read).length,
    },
    {
      id: "briefings",
      label: "Briefings",
      icon: StackSimpleIcon,
      count: workspace.briefings.length,
    },
    {
      id: "bookmarks",
      label: "Bookmarks",
      icon: BookmarkSimpleIcon,
      count: workspace.sources.filter((x) => x.bookmarked).length,
    },
  ] as const;
  return (
    <>
      <button
        className={`drawer-backdrop ${open ? "visible" : ""}`}
        aria-label="Close navigation"
        tabIndex={open ? 0 : -1}
        onClick={close}
      />
      <aside
        className={`sidebar ${open ? "is-open" : ""}`}
        aria-label="Main navigation"
        role={open ? "dialog" : undefined}
        aria-modal={open ? true : undefined}
      >
        <div className="brand">
          <img src="/brand/mark.png" width="40" height="40" alt="" />
          <span>marginfield</span>
          <button
            className="icon-button mobile-only"
            onClick={close}
            aria-label="Close navigation"
          >
            <XIcon size={20} />
          </button>
        </div>
        <nav>
          {items.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              className={`nav-item ${view === id ? "active" : ""}`}
              aria-current={view === id ? "page" : undefined}
              onClick={() => {
                setView(id);
                close();
              }}
            >
              <Icon size={21} />
              <span>{label}</span>
              <span className="count">{count}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-section">
          <p className="eyebrow">Sources</p>
          {(
            [
              { id: "article", label: "Articles", icon: FileTextIcon },
              {
                id: "newsletter",
                label: "Newsletters",
                icon: EnvelopeSimpleIcon,
              },
              { id: "note", label: "Notes", icon: ArticleIcon },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${view === id ? "active" : ""}`}
              onClick={() => {
                setView(id);
                close();
              }}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </div>
        <div className="sidebar-bottom">
          <button
            className="nav-item"
            onClick={() => {
              onAdd();
              close();
            }}
          >
            <PlusIcon size={21} />
            <span>Add source</span>
            <kbd>N</kbd>
          </button>
          <button
            className="nav-item"
            onClick={() => {
              onSettings();
              close();
            }}
          >
            <SlidersHorizontalIcon size={20} />
            <span>Settings</span>
          </button>
          <button
            className="account-button"
            onClick={() => {
              onAccount();
              close();
            }}
          >
            <span className="account-dot" />
            <span>
              {workspace.mode === "preview" ? "Preview mode" : "Your workspace"}
              <small>
                {workspace.mode === "preview"
                  ? "Sample library · on this device"
                  : "Connected to Convex"}
              </small>
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
