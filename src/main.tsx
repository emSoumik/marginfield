import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ConvexReactClient,
  useQuery,
  useMutation,
  useAction,
  useConvexAuth,
} from "convex/react";
import { ConvexAuthProvider, useAuthActions } from "@convex-dev/auth/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { SignIn, Setup } from "./components/Account";
import { Dialog } from "./components/Dialog";
import { usePreviewWorkspace } from "./lib/preview";
import type { Workspace } from "./lib/model";
import "@fontsource-variable/dm-sans";
import "@fontsource-variable/newsreader";
import "./styles/app.css";
function Preview({ onConnect }: { onConnect?: () => void }) {
  const workspace = usePreviewWorkspace();
  const [setup, setSetup] = useState(false);
  return (
    <>
      <App
        workspace={workspace}
        onAccount={() => (onConnect ? onConnect() : setSetup(true))}
      />
      {setup && <Setup onClose={() => setSetup(false)} />}
    </>
  );
}
function CloudWorkspace() {
  const sources = useQuery(api.library.list, {});
  const briefings = useQuery(api.briefings.list, {});
  const inbox = useQuery(api.mail.getInbox, {});
  const addUrl = useMutation(api.library.queueArticle);
  const addNote = useMutation(api.library.addNote);
  const setState = useMutation(api.library.setState);
  const remove = useMutation(api.library.remove);
  const generate = useMutation(api.briefings.request);
  const createInbox = useAction(api.mail.createInbox);
  const send = useMutation(api.mail.sendBriefing);
  const refreshDelivery = useAction(api.mail.refreshDelivery);
  const { signOut } = useAuthActions();
  const [account, setAccount] = useState(false);
  const workspace: Workspace = {
    mode: "cloud",
    sources: sources ?? [],
    briefings: briefings ?? [],
    inbox: inbox ?? undefined,
    loading: sources === undefined || briefings === undefined,
    addUrl: (url) => addUrl({ url }),
    addNote: (title, content) => addNote({ title, content }),
    setState: async (id, state) => {
      await setState({ id: id as Id<"sources">, ...state });
    },
    remove: async (id) => {
      await remove({ id: id as Id<"sources"> });
    },
    generate: (ids) => generate({ sourceIds: ids as Id<"sources">[] }),
    createInbox: async () => {
      await createInbox({});
    },
    refreshDelivery: async (id) => {
      await refreshDelivery({ briefingId: id as Id<"briefings"> });
    },
    send: async (briefingId, to) => {
      await send({
        briefingId: briefingId as Id<"briefings">,
        to,
        attemptId: crypto.randomUUID(),
      });
    },
  };
  return (
    <>
      <App workspace={workspace} onAccount={() => setAccount(true)} />
      {account && (
        <Dialog title="Your workspace" onClose={() => setAccount(false)}>
          <div className="form-body">
            <p className="form-description">
              Your library belongs to this account. Sign out before using a
              shared device.
            </p>
            <button className="primary-button" onClick={() => void signOut()}>
              Sign out
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}
function Connected() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [preview, setPreview] = useState(false);
  if (preview) return <Preview onConnect={() => setPreview(false)} />;
  if (isLoading)
    return (
      <div className="auth-screen" role="status">
        Opening your workspace…
      </div>
    );
  return isAuthenticated ? (
    <CloudWorkspace />
  ) : (
    <SignIn onPreview={() => setPreview(true)} />
  );
}
const url = import.meta.env.VITE_CONVEX_URL;
const client = url ? new ConvexReactClient(url) : null;
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      {client ? (
        <ConvexAuthProvider client={client}>
          <Connected />
        </ConvexAuthProvider>
      ) : (
        <Preview />
      )}
    </ErrorBoundary>
  </StrictMode>,
);
