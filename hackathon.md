# Hackathon log

- **Project:** Marginfield
- **Event:** Convex All Gas Hackathon
- **What it does:** A responsive reading workspace with a source-linked briefing flow.
- **Live app:** not deployed
- **Repo:** none
- **Frontend:** Codex Sites (planned public sample preview)
- **Convex deployment:** not deployed
- **Components:** @convex-dev/agent, @convex-dev/static-hosting
- **Convex features:** schema, indexes, queries, mutations, actions, HTTP actions, scheduled functions, crons, realtime queries
- **Auth:** Convex Auth (source implementation, not live verified)
- **AI models:** gpt-5-mini (configured default; no live call verified)
- **Started:** 2026-09-22T17:07:18.606468Z
- **Last updated:** 2026-09-22T18:59:58Z

## Build log — verified work only

### September 22, 2026 — Folune source project
The separate Folune TypeScript/React/Convex prototype was created after the event start date. It added a responsive reader, browser-local preview, Convex data model, and source integrations for Firecrawl, OpenAI/Convex Agent, and AgentMail. Local verification passed 20 tests, a production build, and 13 isolated Chrome checks. No Convex deployment or provider round trip was completed. Source commit: `dd3af3c` in a separate local repository. The source borrowed Twine's reading concept and visual direction, not its Kotlin code or Git history.

### September 23, 2026 — Marginfield rebrand in progress
Created a new folder and independent Git repository from the Folune source snapshot. Rebranded the product and prepared a public, no-sign-in **sample preview** for Codex Sites. A Codex Sites project was created, but no live deployment or public-host acceptance is claimed yet. Local Marginfield checks passed: 20 app tests, four Sites worker/artifact tests, production build, 13 isolated Chrome flows at five widths, and a zero-vulnerability npm audit. Until a live URL and completed public checks are recorded here, publication remains unverified. The sample preview uses browser-local data; it does not run Firecrawl, OpenAI, or AgentMail.

## Three-day process — plan, not completed history

| Day | Date (IST) | Process | Evidence/status |
| --- | --- | --- | --- |
| 1 | September 22 | Build the source reading app and local sponsor integration code. | Completed in Folune; see source commit and local evidence above. |
| 2 | September 23 | Rebrand as Marginfield, harden public-repo hygiene, test and publish a public sample preview. | In progress; update this row only after checks and links exist. |
| 3 | September 24 | Configure credentials securely, generate canonical Convex bindings, prove live provider flows, and review release gates. | Planned only. No account, credentials, or live flow claimed. |

The [official event page](https://www.convex.dev/hackathons/all-gas) lists September 22 at noon Pacific (September 23, 00:30 IST) as the submission deadline. A later public preview must not be described as an on-time or complete hackathon entry. No social post or form submission is authorized by this work.
