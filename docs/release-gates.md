# Release gates — not yet a production acceptance record

## Must verify against a configured development deployment
- Replace current `AnyApi` local scaffolding with canonical Convex code generation, then validate schema/components and password signup/signin/signout.
- Tenant isolation with two accounts, including every source, briefing, inbox and delivery API.
- Firecrawl extraction of a real permitted public URL, provider failures and quota exhaustion.
- AgentMail real signed webhook; invalid signatures rejected; duplicate deliveries produce one owned source; unknown inbox does not route to a guessed user.
- OpenAI briefing using all selected sources; no unknown citations, missing source frames, or silent truncation. Citation membership validation is not a guarantee that every prose claim is true.
- Explicit email send to the approved test recipient, source references present, delivery/bounce/failure status, and controlled retry.
- Per-user and global provider-cost limits, rate exhaustion, stale job cleanup and late completion handling.

## Interface and account acceptance
- Desktop + 390px phone browser, keyboard, screen reader, enlarged text, dark/light/reduced-motion, empty and error states.
- Real iPhone Safari/Android acceptance, not only resized desktop browser.
- Signup/inbox creation abuse controls, email verification, account recovery and full deletion/export policy. Do not advertise these until implemented and tested.
- Preview storage failures and separation from cloud identity; logout must not retain another account's visible source data.

## Operations and submission
- Approved production project, keys/regions/retention, spending budget and alerts, logs without source secrets.
- Backup/restore and rollback runbook. Smoke test the actual public host.
- Public Git repository approval and secret scan before publishing.
- Organizer eligibility, registration, public permitted host, social post, video and submission.

No production-grade availability, independent security certification, offline cloud-sync guarantee, or completed sponsor round trip is claimed by the local build.
