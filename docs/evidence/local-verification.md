# Local verification — Marginfield, September 23, 2026 (IST)

| Check | Observed result |
| --- | --- |
| `npm ci --ignore-scripts` | Completed from the committed lockfile candidate; 0 vulnerabilities reported by npm. |
| `npm run validate` | 6 Vitest files, 20 tests passed; TypeScript check and production Vite build passed. |
| `npm run test:sites` | 4 Node worker/artifact-contract tests passed. |
| `npm audit --audit-level=high` | 0 reported vulnerabilities at this check. |
| Local Chrome preview | 13 checks passed; no captured page errors or console warnings. |
| Responsive widths | No horizontal overflow at 320, 390, 768, 1024 or 1488 CSS pixels. |
| Process cleanup | Owned preview and browser child groups were stopped and reaped. |

The app is built **without `VITE_CONVEX_URL`** for the sample preview. Visitors do not sign in. Browser-local notes, bookmarks and reading state stay on that browser. The preview briefing is derived from sample excerpts, not OpenAI. The email action rejects preview sends; no AgentMail message was sent. Live provider and deployment-aware Convex codegen remain unverified. Audit results are point-in-time checks, not a security certification.

The source Folune project had its own September 22 verification. This table records checks rerun in the separate Marginfield checkout. Public Sites and GitHub verification are reported only after completed publication.
