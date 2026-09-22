# Marginfield interface QA

This record covers the **no-sign-in sample preview**, not a connected backend or provider demo. Marginfield reuses the Folune source design direction and standalone two-page mark, but the screenshots in this repository were freshly captured after the Marginfield rebrand.

- Production-built local preview tested in isolated Chrome at 320, 390, 768, 1024 and 1488 CSS-pixel widths; no horizontal overflow.
- Thirteen checks passed: reader/search/briefing navigation, source citations, bookmark and note persistence, explicit preview-only email rejection, themes, mobile drawer focus, bottom navigation and browser error capture.
- Captured desktop reader/light/briefing and mobile inbox/reader/briefing states in [`docs/evidence/`](docs/evidence/README.md).
- Captured errors and console warnings: none. The browser and owned preview server were stopped and reaped.

The supplied Twine screenshots informed the dark editorial hierarchy; this is not a pixel clone. The source Folune screenshot comparison and its prior fixes remain in the separate Folune repository. Physical phones, screen readers, enlarged text, slow networks, live account states and provider flows are not accepted by these screenshots.
