import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowRightIcon,
  CheckIcon,
  MoonIcon,
  SunIcon,
  XIcon,
  ArticleIcon,
  StackSimpleIcon,
  PlusIcon,
  BookmarkSimpleIcon,
  SlidersHorizontalIcon,
} from "@phosphor-icons/react";
import { Sidebar } from "./components/Sidebar";
import { SourceList } from "./components/SourceList";
import { Reader } from "./components/Reader";
import { Dialog } from "./components/Dialog";
import { AddSource, EmailForm } from "./components/Forms";
import {
  filterSources,
  type Source,
  type View,
  type Workspace,
} from "./lib/model";
export default function App({
  workspace,
  account,
  onAccount,
}: {
  workspace: Workspace;
  account?: ReactNode;
  onAccount: () => void;
}) {
  const [view, setView] = useState<View>("inbox");
  const [search, setSearch] = useState("");
  const [unread, setUnread] = useState(false);
  const [selection, setSelection] = useState<string[]>(
    workspace.mode === "preview" ? ["sample-1", "sample-2", "sample-3"] : [],
  );
  const [active, setActive] = useState<
    { kind: "source" | "briefing"; id: string } | undefined
  >(
    workspace.mode === "preview"
      ? { kind: "source", id: "sample-1" }
      : undefined,
  );
  const [drawer, setDrawer] = useState(false);
  const [mobileReader, setMobileReader] = useState(false);
  const [dialog, setDialog] = useState<
    "add" | "settings" | "email" | "delete" | null
  >(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("marginfield-theme") === "light"
        ? "light"
        : "dark";
    } catch {
      return "dark";
    }
  });
  const [textSize, setTextSize] = useState(21);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sources = useMemo(
    () => filterSources(workspace.sources, view, search, unread),
    [workspace.sources, view, search, unread],
  );
  const source =
    active?.kind === "source"
      ? workspace.sources.find((s) => s._id === active.id)
      : undefined;
  const briefing =
    active?.kind === "briefing"
      ? workspace.briefings.find((b) => b._id === active.id)
      : undefined;
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try {
      localStorage.setItem("marginfield-theme", theme);
    } catch {}
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#050505" : "#ffffff");
  }, [theme]);
  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );
  useEffect(() => {
    setSelection((ids) =>
      ids.filter((id) =>
        workspace.sources.some((s) => s._id === id && s.status === "ready"),
      ),
    );
  }, [workspace.sources]);
  useEffect(() => {
    document.title = active
      ? (source?.title ?? briefing?.title ?? "Marginfield") + " — Marginfield"
      : "Marginfield — Your reading, distilled";
  }, [active, source?.title, briefing?.title]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest('input,textarea,select,[contenteditable="true"],dialog'))
        return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "/") {
        e.preventDefault();
        document
          .querySelector<HTMLInputElement>('[aria-label="Search your library"]')
          ?.focus();
      }
      if (e.key === "n") {
        e.preventDefault();
        setDialog("add");
      }
      if (e.key === "Escape") {
        setDrawer(false);
        setMobileReader(false);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  useEffect(() => {
    if (!drawer) return;
    const desktop = window.matchMedia("(min-width: 781px)");
    const onResize = () => {
      if (desktop.matches) setDrawer(false);
    };
    desktop.addEventListener("change", onResize);
    const previous = document.activeElement as HTMLElement;
    const sidebar = document.querySelector<HTMLElement>(".sidebar")!;
    const background = [
      ...document.querySelectorAll<HTMLElement>(
        ".source-panel,.reader-panel,.mobile-nav",
      ),
    ];
    background.forEach((el) => (el.inert = true));
    const buttons = [...sidebar.querySelectorAll<HTMLElement>("button")];
    buttons[0]?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawer(false);
      if (e.key === "Tab") {
        const first = buttons[0],
          last = buttons.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      background.forEach((el) => (el.inert = false));
      document.removeEventListener("keydown", trap);
      desktop.removeEventListener("change", onResize);
      previous?.focus();
    };
  }, [drawer]);
  function notice(message: string) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 5000);
  }
  async function action(work: () => Promise<unknown>) {
    try {
      await work();
    } catch (e) {
      notice(
        e instanceof Error
          ? e.message
          : "Something went wrong. Please try again.",
      );
    }
  }
  function openSource(s: Source) {
    setActive({ kind: "source", id: s._id });
    setMobileReader(true);
    if (!s.read) void action(() => workspace.setState(s._id, { read: true }));
    document.querySelector(".reader-panel")?.scrollTo(0, 0);
  }
  function openBriefing(id: string) {
    setActive({ kind: "briefing", id });
    setMobileReader(true);
    document.querySelector(".reader-panel")?.scrollTo(0, 0);
  }
  async function generate() {
    if (busy) return;
    setBusy(true);
    try {
      const id = await workspace.generate(selection);
      openBriefing(id);
      notice(
        workspace.mode === "preview"
          ? "Preview created. No AI provider was called."
          : "Your briefing is being prepared.",
      );
    } catch (e) {
      notice(e instanceof Error ? e.message : "Could not create briefing.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div
      className={`app ${mobileReader ? "show-reader" : ""}`}
      style={{ "--reader-font-size": `${textSize}px` } as React.CSSProperties}
    >
      <a className="skip-link" href={mobileReader ? "#reading" : "#library"}>
        Skip to content
      </a>
      <Sidebar
        workspace={workspace}
        view={view}
        setView={(v) => {
          setView(v);
          setSearch("");
          setMobileReader(false);
        }}
        open={drawer}
        close={() => setDrawer(false)}
        onAdd={() => setDialog("add")}
        onSettings={() => setDialog("settings")}
        onAccount={onAccount}
      />
      <SourceList
        workspace={workspace}
        view={view}
        sources={sources}
        search={search}
        setSearch={setSearch}
        unread={unread}
        setUnread={setUnread}
        selection={selection}
        toggleSelection={(id) =>
          setSelection((s) =>
            s.includes(id)
              ? s.filter((x) => x !== id)
              : s.length < 8
                ? [...s, id]
                : (notice("Choose up to 8 sources for one briefing."), s),
          )
        }
        activeId={active?.id}
        onSource={openSource}
        onBriefing={openBriefing}
        onMenu={() => setDrawer(true)}
        onGenerate={generate}
        generating={busy}
        onAdd={() => setDialog("add")}
      />
      <Reader
        source={source}
        briefing={briefing}
        sources={workspace.sources}
        preview={workspace.mode === "preview"}
        onBack={() => setMobileReader(false)}
        onBookmark={(s) =>
          void action(() =>
            workspace.setState(s._id, { bookmarked: !s.bookmarked }),
          )
        }
        onRead={(s) =>
          void action(() => workspace.setState(s._id, { read: !s.read }))
        }
        onSource={openSource}
        onEmail={() => setDialog("email")}
        onRefreshEmail={() =>
          briefing
            ? action(() => workspace.refreshDelivery(briefing._id))
            : Promise.resolve()
        }
        onRemove={() => setDialog("delete")}
      />
      <nav className="mobile-nav" aria-label="Primary navigation">
        <button
          aria-current={view === "inbox" ? "page" : undefined}
          onClick={() => {
            setView("inbox");
            setSearch("");
          }}
        >
          <ArticleIcon size={23} />
          <span>Inbox</span>
        </button>
        <button
          aria-current={view === "briefings" ? "page" : undefined}
          onClick={() => {
            setView("briefings");
            setSearch("");
          }}
        >
          <StackSimpleIcon size={23} />
          <span>Briefings</span>
        </button>
        <button onClick={() => setDialog("add")}>
          <PlusIcon size={26} />
          <span>Add source</span>
        </button>
        <button
          aria-current={view === "bookmarks" ? "page" : undefined}
          onClick={() => {
            setView("bookmarks");
            setSearch("");
          }}
        >
          <BookmarkSimpleIcon size={23} />
          <span>Saved</span>
        </button>
        <button onClick={() => setDialog("settings")}>
          <SlidersHorizontalIcon size={23} />
          <span>Settings</span>
        </button>
      </nav>
      {workspace.error && (
        <div className="storage-warning" role="alert">
          {workspace.error}
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          <CheckIcon size={17} />
          <span>{toast}</span>
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <XIcon size={16} />
          </button>
        </div>
      )}
      {dialog === "add" && (
        <AddSource
          workspace={workspace}
          onClose={() => setDialog(null)}
          onAdded={(id) => {
            setActive({ kind: "source", id });
            setMobileReader(true);
            notice("Source saved.");
          }}
        />
      )}
      {dialog === "email" && briefing && (
        <EmailForm
          workspace={workspace}
          briefingId={briefing._id}
          onClose={() => setDialog(null)}
          onSent={() =>
            notice("Email queued. Delivery has not yet been confirmed.")
          }
        />
      )}
      {dialog === "delete" && source && (
        <Dialog title="Remove this source?" onClose={() => setDialog(null)}>
          <div className="form-body">
            <p className="form-description">
              “{source.title}” will leave your library. Existing briefings may
              retain references to it.
            </p>
            <button
              className="primary-button"
              onClick={() =>
                void action(async () => {
                  await workspace.remove(source._id);
                  setActive(undefined);
                  setMobileReader(false);
                  setDialog(null);
                  notice("Source removed.");
                })
              }
            >
              Remove source
            </button>
            <button
              className="secondary-button"
              onClick={() => setDialog(null)}
            >
              Keep reading
            </button>
          </div>
        </Dialog>
      )}
      {dialog === "settings" && (
        <Dialog
          title="Make room for your reading"
          onClose={() => setDialog(null)}
        >
          <div className="form-body">
            <label>Appearance</label>
            <div className="segmented">
              <button
                className={theme === "dark" ? "active" : ""}
                aria-pressed={theme === "dark"}
                onClick={() => setTheme("dark")}
              >
                <MoonIcon size={18} />
                Dark
              </button>
              <button
                className={theme === "light" ? "active" : ""}
                aria-pressed={theme === "light"}
                onClick={() => setTheme("light")}
              >
                <SunIcon size={18} />
                Light
              </button>
            </div>
            <label htmlFor="reader-size">
              Reader text <span>{textSize}px</span>
            </label>
            <input
              id="reader-size"
              type="range"
              min="16"
              max="26"
              step="1"
              value={textSize}
              onChange={(e) => setTextSize(Number(e.target.value))}
            />
            <div className="settings-block">
              <h3>
                {workspace.mode === "preview"
                  ? "A preview, not a connected account"
                  : "Your connected workspace"}
              </h3>
              <p>
                {workspace.mode === "preview"
                  ? "Sample reading and notes stay in this browser. No extraction, AI generation, or email is simulated as a live service."
                  : "Your sources and reading state are stored in Convex. Provider actions need server-side credentials."}
              </p>
              {account}
              <button
                className="secondary-button"
                onClick={() => {
                  setDialog(null);
                  onAccount();
                }}
              >
                {workspace.mode === "preview"
                  ? "Connect your workspace"
                  : "Manage account"}
                <ArrowRightIcon size={16} />
              </button>
            </div>
            <p className="subtle-note">
              Marginfield · A place for useful perspectives.
              <br />
              Press / to search. Press N to add a source.
            </p>
          </div>
        </Dialog>
      )}
    </div>
  );
}
