# Marginfield — hackathon submission pack

**Status: public sample preview preparation; not a completed hackathon submission.**

## Pitch

Marginfield turns the articles and newsletters you choose into a short, source-linked
briefing. It is built for independent designers and founders who want to keep up
with their field without opening every tab or losing the original sources.

## The product

- **Inbox:** save a public article URL, receive a forwarded newsletter, or write a note.
- **Briefings:** select one to eight ready sources and request a cited summary.
- **Reader:** read the source, search, bookmark, and track reading state.
- **Delivery:** explicitly request an email digest to an approved recipient.

Desktop has a three-pane reading layout. Mobile has a focused reader and bottom
navigation. Both include light and dark themes. The unconfigured app is clearly
labelled **local preview**; its excerpt-based briefings are not AI output.

## What is used

| Tool | Product responsibility | Current evidence |
| --- | --- | --- |
| React, TypeScript, Vite | Responsive interface and production build | Local build and browser checks |
| Convex | Owned data, realtime queries, mutations, scheduling and job state | Schema/source plus local tests |
| Convex Auth | Password accounts | Implemented; live acceptance pending |
| Firecrawl | Extract main article text from a public URL | Component and action wired; live extraction pending |
| OpenAI + Convex Agent | Structured briefings with source-ID validation | Framing/schema tests; live generation pending |
| AgentMail | Newsletter inbox and requested digest delivery | Inbound mutation tests; signed-webhook and delivery acceptance pending |
| Codex Sites | Serve the no-sign-in sample preview on chatgpt.site | Published sample preview; signed-out browser flow tested |
| Codex + Convex plugin | Build-time implementation and backend guidance | Curated plugin enabled; managed project guidance installed |

See [tool-by-tool implementation evidence](hackathon-tooling.md). Auth v2 and AI
Gateway are optional resources, not features used in this build. This independent repository is derived from the Folune React/Vite source, not an Astro project or a port of the Kotlin app. The provenance is disclosed.

## Submission fields

Do not submit this table until each pending field has a verified value.

| Field | Value |
| --- | --- |
| Name | Marginfield |
| Public GitHub repository | [Public repository](https://github.com/emSoumik/marginfield) — source visible |
| Public app | [Public sample preview](https://marginfield-reader.soumikhalder.chatgpt.site) — no sign-in |
| Demo video | Pending — target 2 minutes 30 seconds; must be under 3 minutes |
| Social post | Pending — social posting not authorized |
| Build log | [Root hackathon.md](../hackathon.md) |
| Eligibility and registration | User/organizer confirmation pending |

Both **convex.site and chatgpt.site** are accepted. Marginfield uses **chatgpt.site** for its public sample preview. The Convex static-hosting component remains in source for a later connected release; it is not the selected preview host. The repository and sample preview are public; the live provider demonstration, short video and social post remain absent.
[Official event requirements](https://www.convex.dev/hackathons/all-gas)

The listed deadline is September 22 at noon Pacific: **September 23, 00:30 IST**.
Register through [Luma](https://luma.com/convex-allgas-hackathon) and use the
[official submission form](https://vibeapps.dev/judging/convex-all-gas-hackathon-openai/submit).
Recheck the form and event status before any later submission.

## Local evidence and remaining gates

- [Verification record](evidence/local-verification.md)
- [Responsive screenshots and browser results](evidence/README.md)
- [Official-requirement checklist](submission-checklist.md)
- [Secure setup and release sequence](launch-runbook.md)
- [2:30 demo script](demo-script.md)
- [Production review](production-review.md) and [release gates](release-gates.md)
- [New-code and asset provenance](provenance.md)

No live provider call, sent email, public Convex backend deployment or successful hackathon submission is claimed. Canonical component-aware Convex code generation still
requires a configured development deployment. Citation validation checks source
membership, not the truth of every generated claim.
