# Marginfield

A focused reading-and-briefing app for independent designers and founders. Save a public article, forward a newsletter, bring selected sources together in a concise briefing, and return to the originals.

## Status

Marginfield was rebranded into an independent Git repository on 23 September 2026 from the Folune source project started on 22 September. Not a Kotlin port. No Twine application source or Git history is included. The two-page mark and earlier reader direction informed this new UI; see [provenance](docs/provenance.md).

The default unconfigured app is an explicitly labelled **local preview**. It has sample reading, search, selection, bookmarks, saved notes, preview briefings, responsive reader views, and light/dark preferences. Preview mode does not call or impersonate Firecrawl, OpenAI, AgentMail, or a cloud account. Browser-local preview storage is separate from authenticated data.

The connected implementation uses:
- React, TypeScript, Vite for the responsive app.
- Convex tables, indexes, authenticated queries/mutations, scheduled actions, and live subscriptions.
- Convex Auth password accounts (live auth acceptance pending; email verification and recovery are not implemented).
- Firecrawl's Convex component for article extraction.
- OpenAI through the Convex Agent component for structured, citation-checked briefings.
- AgentMail's Convex component for personal inboxes, signed incoming mail, and explicitly requested digest delivery.
- Codex Sites for the public no-sign-in sample preview; Convex static hosting remains configured for a future connected release.

The public repository is [GitHub: emSoumik/marginfield](https://github.com/emSoumik/marginfield). The [public no-sign-in sample preview](https://marginfield-reader.soumikhalder.chatgpt.site) is hosted on Codex Sites. A GitHub Actions check workflow is included; inspect its actual run status before claiming remote CI success. Local tests are not live integration proof. See [release gates](docs/release-gates.md) and `hackathon.md` for current verification.

## Project map

- `src/` — responsive React interface and explicit local preview.
- `convex/` — schema, auth, provider integration, scheduling and quotas.
- `tests/` — local unit and Convex mutation tests.
- `public/` — runtime brand and editorial assets.
- `docs/` — submission pack, setup runbook, provenance and evidence.
- `.agents/`, `.claude/` — official project-local build guidance.
- `.github/workflows/` — checks only; no automatic deployment.

Start with the [submission pack](docs/submission.md), then the
[tool-by-tool implementation guide](docs/hackathon-tooling.md) and
[secure launch runbook](docs/launch-runbook.md).

## Run the local preview

Requires Node.js 22.12+ and npm. From this folder:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4337. No keys are required for preview mode. `/` focuses search and `N` opens Add source. Add a Note to exercise saved local content. The preview badge remains visible; generating there uses selected excerpts, not an AI model.

## Connect a new development backend

Do not reuse a production deployment. Provisioning or changing a cloud deployment is an external action and must be authorized separately from writing code.

1. Use the Convex CLI to create/select the intended development project: `npx convex dev --configure`.
2. Let it write the development link and `VITE_CONVEX_URL` to the ignored `.env.local` file. Keep keys out of every `VITE_*` variable.
3. Configure Convex Auth using the installed package setup tool and its current documentation. Set `SITE_URL` to the frontend origin; generate server-side `JWT_PRIVATE_KEY` and `JWKS`. See https://labs.convex.dev/auth/setup . Never commit generated secrets.
4. Configure Firecrawl, AgentMail, and OpenAI keys in the **Convex deployment environment**. Review [providers](docs/providers.md) and [briefing](docs/briefing.md) for exact settings.
5. Firecrawl's registered component requires its API key and webhook secret. AgentMail rejects webhook traffic unless its signing secret is configured. Do not replace missing secrets with fake values in a live deployment.
6. Regenerate API bindings: `npm run convex:codegen`. Generated scaffolding is present for local typechecking; it must be validated against the actual components/deployment.
7. Run `npm run convex:dev` and `npm run dev` in owned terminals. Create a test account, then test article extraction and inbox setup. Do not treat a logged-in shell as provider acceptance.

Public URLs and forwarded newsletters are sent to the configured providers. Do not use private/confidential material until the retention and privacy policy are approved. Imported text is rendered as text, never inserted as arbitrary HTML.

## Checks

```sh
npm run validate
```

`npm run build` produces `dist/client/`, `dist/server/index.js` and `dist/.openai/hosting.json` for Sites. No deploy command is run by install or build. The public sample preview runs without `VITE_CONVEX_URL` and requires no visitor sign-in.

## Hackathon submission

The official project-local skill is installed at `.agents/skills/convex-hackathon-skill/`. Run `/hackathon` or ask the agent to update the evidence-based root `hackathon.md` after a work session.

The official deadline was 22 September, noon Pacific (23 September, 00:30 IST); this publication is after that deadline and is **not** a claimed valid submission. Requirements include a public repository, root log, public `convex.site` or `chatgpt.site` app, social post, and video under three minutes. See [submission checklist](docs/submission-checklist.md). Writing code does not register, publish, or submit an entry.
