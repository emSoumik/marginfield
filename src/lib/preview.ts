import { useEffect, useState } from "react";
import { sampleBriefing, sampleSources } from "./sample";
import type { Briefing, Source, Workspace } from "./model";
const key = "marginfield-preview-v1";
interface State {
  sources: Source[];
  briefings: Briefing[];
}
function initial(): State {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? "null");
    if (
      value &&
      Array.isArray(value.sources) &&
      Array.isArray(value.briefings) &&
      value.sources.every(
        (x: Source) =>
          typeof x._id === "string" &&
          typeof x.title === "string" &&
          typeof x.content === "string",
      )
    )
      return value;
  } catch {}
  return { sources: sampleSources, briefings: [sampleBriefing] };
}
export function usePreviewWorkspace(): Workspace {
  const [state, setState] = useState<State>(initial);
  const [error, setError] = useState<string>();
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      setError(
        "Browser storage is unavailable. Changes will last only for this session.",
      );
    }
  }, [state]);
  return {
    mode: "preview",
    ...state,
    loading: false,
    error,
    async addUrl() {
      throw new Error(
        "Connect Convex and Firecrawl to extract an article. You can add a note in preview mode.",
      );
    },
    async addNote(title, content) {
      title = title.trim();
      content = content.trim();
      if (!title || !content)
        throw new Error("Add a title and a note before saving.");
      const id = crypto.randomUUID();
      setState((s) => ({
        ...s,
        sources: [
          {
            _id: id,
            title,
            content,
            excerpt: content.slice(0, 180),
            kind: "note",
            status: "ready",
            read: false,
            bookmarked: false,
            createdAt: Date.now(),
          },
          ...s.sources,
        ],
      }));
      return id;
    },
    async setState(id, patch) {
      setState((s) => ({
        ...s,
        sources: s.sources.map((x) => (x._id === id ? { ...x, ...patch } : x)),
      }));
    },
    async remove(id) {
      setState((s) => ({
        ...s,
        sources: s.sources.filter((x) => x._id !== id),
      }));
    },
    async generate(ids) {
      const selected = state.sources.filter(
        (x) => ids.includes(x._id) && x.status === "ready",
      );
      if (!selected.length)
        throw new Error("Select at least one ready source.");
      const id = crypto.randomUUID();
      const briefing: Briefing = {
        _id: id,
        title: "Your selected reading",
        summary:
          "This is a local preview, not an AI-generated briefing. Connect the backend to group overlapping coverage with OpenAI.",
        sections: selected.map((s) => ({
          title: s.title,
          body: s.excerpt,
          sourceIds: [s._id],
        })),
        status: "ready",
        createdAt: Date.now(),
      };
      setState((s) => ({ ...s, briefings: [briefing, ...s.briefings] }));
      return id;
    },
    async createInbox() {
      throw new Error(
        "A connected Convex deployment and AgentMail key are needed to create your inbox.",
      );
    },
    async refreshDelivery() {
      throw new Error("Preview mode has no email delivery to check.");
    },
    async send() {
      throw new Error(
        "Preview mode never sends email. Connect AgentMail to enable delivery.",
      );
    },
  };
}
