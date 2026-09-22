# All Gas submission checklist

Verified against https://www.convex.dev/hackathons/all-gas and https://luma.com/convex-allgas-hackathon on 22 September 2026.

- [ ] Confirm eligibility and register on Luma. New app/code start alone is not an organizer decision.
- [x] Create a separate new Marginfield project and disclose inspiration/assets.
- [x] Install the official hackathon skill locally and maintain root hackathon.md.
- [x] Verify the existing curated Convex plugin is enabled and callable.
- [x] Install and verify CLI-managed Convex project guidance and skills.
- [x] Install and run official static-hosting setup; preserve auth/webhook routes.
- [x] Prepare submission, tooling, demo and secure-setup documentation locally.
- [ ] Complete live Convex, Firecrawl, OpenAI, and AgentMail proof.
- [x] Obtain approval for a public GitHub repository; secret-scan before push.
- [ ] Publish and verify the public GitHub repository.
- [x] Obtain approval for a public chatgpt.site sample preview.
- [ ] Publish and verify the signed-out sample preview.
- [ ] Record a video under three minutes using real integrations.
- [ ] Obtain approval and publish a social post tagging the four sponsors.
- [ ] Submit repo, live app, and video on vibeapps.dev before the deadline.

Deadline: 2026-09-22 19:00 UTC / 2026-09-23 00:30 IST (September 22 noon Pacific).

## Suggested demo, under three minutes
1. Explain the audience and problem in one sentence.
2. Save a permitted public article and show extraction status become ready.
3. Forward a test newsletter to the created inbox; show it appear without refresh.
4. Select the sources, generate a briefing, and open each citation.
5. Request delivery to the authorized recipient and show the actual received email.
6. Show the mobile layout and end on the useful outcome.

Do not use preview fixtures as evidence of live provider work. Do not claim sent/delivered from a queued status. Update every unchecked requirement only after completed evidence.

## Setup instructions: what applies here

| Event setup step | Marginfield evidence and boundary |
| --- | --- |
| Convex integration | Existing `convex@openai-curated-remote` v2.0.1 is enabled and callable. The alternate `get-convex` marketplace package was not installed in addition. |
| Project guidance | `npx convex ai-files status` reports guidelines, AGENTS/CLAUDE sections and agent skills up to date. |
| Hackathon skill | Official project-local skill and log-format reference are present in `.agents/skills/convex-hackathon-skill/`. Instructions were read directly. |
| Root build log | `hackathon.md` records implemented features separately from unknown live facts. |
| Hosting choice | `@convex-dev/static-hosting` is installed and registered. Official setup added `npm run deploy`. Selected public sample host: **chatgpt.site**. Convex static hosting remains installed but is not used for the sample preview. |
| Alternative Sites setup | Not needed for the selected path. `chatgpt.site` is also allowed; it is not configured here. |
| Sponsor functionality | Firecrawl, OpenAI/Agent and AgentMail have application call sites, not only dependencies. Live acceptance is still pending. |
| Optional resources | Auth v2 super alpha and AI Gateway are not mandatory and are not used. Do not replace the implemented auth just to check a resource-list box. |
| External deliverables | Registration, eligibility, public repository/host, real demo, social post and submission cannot be satisfied by installing packages. |

The owner authorized public GitHub and Sites preview publication, but not a live Convex deployment, social post, or hackathon submission. Credentials will be configured
securely by the owner. See [submission pack](submission.md) and
[launch runbook](launch-runbook.md).
