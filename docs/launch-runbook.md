# Secure setup and release runbook

## Boundary

The owner authorized a public GitHub repository and Codex Sites **sample preview**. **Do not provision a Convex project, send mail, post socially, or submit the hackathon form.** The
owner will configure credentials securely. This runbook describes future steps;
their presence does not grant authorization to execute them.

## 1. Reproduce the local package

Use Node.js 22.12+ and npm. Node 22 is the CI target.

```sh
npm ci
npx convex ai-files status
npm run validate
npm run dev
```

Open `http://127.0.0.1:4337`. Stop the server with Ctrl-C when done. Preview uses
browser-local data, does not require keys, and is not integration acceptance.
Keep long-running servers in owned terminals; do not detach workers.

## 2. Configure a new development deployment — after approval

1. Confirm the intended Convex team/project and spending budget. Do not connect
   this app to an unrelated production project.
2. Run `npx convex dev --configure`. Keep the CLI development link in ignored
   `.env.local`; only the public deployment URL belongs in `VITE_CONVEX_URL`.
3. Configure the deployment secrets through secure Convex/provider settings.
   Never paste keys into chat, commit them, expose them in `VITE_*`, or include
   them in screenshots, build logs or shell command history.

| Server setting | Purpose |
| --- | --- |
| `SITE_URL` | Exact frontend origin for the environment |
| `JWT_PRIVATE_KEY`, `JWKS` | Generated using the installed Convex Auth setup procedure |
| `FIRECRAWL_API_KEY`, `FIRECRAWL_WEBHOOK_SECRET` | Firecrawl component configuration |
| `OPENAI_API_KEY` | OpenAI generation |
| `OPENAI_MODEL` | Optional override; code default is `gpt-5-mini` |
| `AGENTMAIL_API_KEY`, `AGENTMAIL_WEBHOOK_SECRET` | Inbox, outbound messages and signed webhook validation |
| `ALLOWED_DIGEST_RECIPIENT` | Explicitly approved test recipient; required for this app to send |

Follow [Convex Auth setup](https://labs.convex.dev/auth/setup) for the installed
Auth package, not the optional Auth v2 alpha guide. Confirm the provider account
can use the configured OpenAI model. Register the AgentMail callback at the
deployment's `/agentmail/webhook` route and confirm its signing secret matches.
Firecrawl is mounted under `/firecrawl/`; follow the installed component's
webhook configuration, not a guessed endpoint.

Run `npm run convex:codegen` against this authorized development deployment.
Replace the current `AnyApi` scaffolding with the canonical generated bindings,
resolve any revealed component/type errors, then rerun `npm run validate`.
The local compiler currently cannot prove those component contracts.

## 3. Prove connected behavior

Record pass/fail evidence without keys, real inbox addresses or private content:

- Sign up, sign in, reload and sign out. Use two accounts to test isolation.
- Save a permitted public URL. Observe queued, processing and ready; inspect
  the extracted text. Exercise a provider failure and explicit retry.
- Create an inbox and forward a non-sensitive test newsletter. Confirm one
  owned source appears without refresh. Test duplicate callbacks and rejection
  of an invalid signature and unregistered inbox.
- Select one to eight ready sources, generate a real briefing, then open its
  citations and check claim accuracy. Exercise generation failure and retry.
- Send only to the approved allowlisted test recipient. Verify the actual
  received email and source references. **Queued is not delivered.** Test
  delivery failure/bounce and a new explicit retry; check old status results do
  not overwrite the new attempt.
- Test cost caps, stale-job recovery, loading/empty/error states and logout data
  separation. Review [all release gates](release-gates.md).

## 4. Publish only after separate authorization

The future connected hosting path in this section is **convex.site**. The current public sample preview is published separately on **chatgpt.site** without a Convex URL. The installed package supports
app-owned root routing: auth and mail routes remain intact and static content is
the fallback. Do not move these routes under a new prefix during deployment.

After backend development acceptance, an authorized hosted development smoke
test can use `npx @convex-dev/static-hosting upload --build`. This uploads public
assets and is an external publication, not a local build.

For the separately approved production environment, configure its secrets and
correct `SITE_URL`, confirm the target, and use:

```sh
npm run deploy
```

This invokes the installed official static-hosting CLI: it builds with the
production Convex URL, deploys the backend, and uploads `dist/`. It is **not** a
preview command. Confirm the resulting `https://<deployment>.convex.site` URL
from the CLI; do not invent one. The installed package README documents the
[hosting component](https://www.convex.dev/components/static-hosting).

Open the actual URL in a clean browser. Check account access without an invite,
signup, article import, newsletter arrival, briefing, allowed email delivery,
desktop/mobile layout, fonts/images, reload and auth/webhook routing. Check
with GET requests rather than relying on HEAD support. Test physical phone and
assistive-technology behavior separately from desktop viewport emulation.

Before public GitHub publication, repeat a secret/privacy scan, confirm a code
license with the owner, and review new-code and visual reuse disclosure. Never
reuse Twine's history or represent local CI as a successful GitHub run.

## 5. Release controls and submission

Resolve retention/privacy, account recovery and deletion, abuse controls,
budgets/alerts and backups before advertising general production readiness.
Rehearse restoration in development. Keep a known-good commit and environment
record. If a release fails, stop new provider work, preserve diagnostics without
secrets, and redeploy the known-good compatible code only after approval. A
frontend rollback does not roll back database/schema changes; restore data only
with an approved, tested plan.

Fill the public evidence fields in [submission.md](submission.md). Record the
real flow with [demo-script.md](demo-script.md). After separate publication
approval, post with the required sponsor tags and verify every link while
signed out. Submit through the official form only on explicit owner approval.
No script in this repository automatically posts or submits the entry.
