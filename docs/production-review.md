> The nine-lane pre-release sweep below was conducted on the Folune source design on September 22, 2026. Marginfield reran its own local browser checks after rebranding; see [evidence](evidence/local-verification.md). No live provider acceptance is implied.

# Pre-release review

**Verdict: Not yet.** The responsive local product works in tested Chrome flows. Live auth, provider round trips, canonical Convex code generation, publication, physical-device acceptance and operational safeguards remain gates.

## Sweep

| Lane | Result |
|---|---|
| A — Accessibility | Named icon controls, visible focus, native dialogs, labelled inputs, inert/focus-contained drawer. Keyboard drawer tested. VoiceOver and zoom acceptance pending. |
| B — Performance | Reserved image dimensions, local/preloaded variable fonts, no layout-property animation, bounded cloud list reads. Production JS 301.24 kB / 90.19 kB gzip at verification. Large generated photo needs responsive optimization; no field-performance claim. |
| C — Mobile | 390px reading/list screenshots; no horizontal overflow at five widths. `dvh`, safe-area padding, zoom-preserving viewport, 16px inputs, no forced form autofocus. Real hardware pending. |
| D — Forms | Submit states, native validation, retained values and announced errors. Preview note/save and mail-rejection exercised. Cloud signup, recovery, provider failure/retry pending. |
| E — Stability/states | Loading, empty, failed and preview states; React error boundary. Fixed briefing search empty state. Backend attempts/watchdog reject late work. |
| F — Motion | Small transform-only drawer movement; reduced-motion removes movement; no scroll animation or autoplay. |
| G — Theme | Dark/light rendered. Stored theme applied before paint; browser color scheme follows selection. Fixed transient low-contrast color interpolation. |
| H — Content/leftovers | Original sample copy explicitly labelled. No secret values in browser configuration, no fabricated live sponsor success, no dev panels. Canonical generated API types are still a blocker. |
| I — Marketing/SEO | Skipped: no marketing routes. Product title/description/favicon exist; no search-indexing or social-card claim. |

## Important fixes

- Mobile focus containment and closed-drawer visibility: `src/App.tsx:130`, `src/styles/app.css`.
- Briefing zero-result recovery: `src/components/SourceList.tsx:60`.
- First-paint theme and font preload: `index.html:17`.
- Forms expose source selection as labelled toggle buttons rather than incomplete ARIA tabs: `src/components/Forms.tsx:51`.
- Convex partial read/bookmark update no longer removes the untouched required field: `convex/library.ts` (covered by a regression test).
- Added provider quotas, separate delivery budget, failed-job retry, attempt guards and stale-job watchdog. Independent backend re-review found no remaining runtime bug in the scoped mail/quota/retry fixes.

## Needs a device or person

- iPhone/Android: type into Add source with the keyboard open; check final action visibility and home-indicator clearance. Scroll reader and open/close drawer.
- VoiceOver: traverse navigation, article, citations, form error and modal close/return sequence.
- Approve/provision a new Convex development project, add provider credentials securely, then regenerate component-aware bindings. Current `AnyApi` scaffolding makes local typechecking insufficient to prove backend API contracts.
- Delivery is allowlist-only. Email verification, password recovery, account export/deletion, inbox/signup abuse controls, retention/privacy policy, budgets/alerts, backup/restore and rollback need release decisions and tests.
- Confirm eligibility and visual reuse disclosure with the organizer. Publishing, social/video and submission have not occurred.

## Verification

- `npm run typecheck` — passed, subject to the generated-API limitation above.
- `npm test` — 6 test files, 20 tests passed.
- `npm run build` — passed.
- Production preview browser script — 13 checks passed; no captured page/console errors or warnings.
- Two consecutive owned preview start/stop cycles — passed; listener closed and child reaped. Final verification server and isolated browser were also stopped.
- GitHub Actions workflow added; **not run remotely**.
