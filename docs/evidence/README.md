# Marginfield preview evidence

These are screenshots of the **production-built local sample preview** captured after the Marginfield rebrand. They do not demonstrate a public deployment, live auth, article extraction, AI output or email delivery.

- [Browser checks](marginfield-browser-qa.json): 13 passed, no captured page errors or console warnings.
- [Desktop reader](marginfield-desktop.png)
- [Desktop briefing](marginfield-desktop-briefing.png)
- [Desktop light theme](marginfield-desktop-light.png)
- [Mobile inbox](marginfield-mobile-inbox.png)
- [Mobile reader](marginfield-mobile-reader.png)
- [Mobile briefing](marginfield-mobile-briefing.png)

The desktop capture is 1488 × 1058; mobile captures are 390 × 844. No horizontal overflow was detected at 320, 390, 768, 1024 or 1488 CSS pixels. This is Chrome viewport testing, not physical phone or assistive-technology acceptance. [Local verification](local-verification.md) records the other checks.

## Public signed-out preview

These captures are from the public `chatgpt.site` version after the font-preload fix. The run used a fresh isolated Chrome context with no account cookies. Thirteen interaction checks passed; the report contains no page errors or console warnings.

- [Public browser results](marginfield-public-browser-qa.json)
- [Public desktop reader](marginfield-public-desktop.png)
- [Public desktop briefing](marginfield-public-desktop-briefing.png)
- [Public desktop light theme](marginfield-public-desktop-light.png)
- [Public mobile inbox](marginfield-public-mobile-inbox.png)
- [Public mobile reader](marginfield-public-mobile-reader.png)
- [Public mobile briefing](marginfield-public-mobile-briefing.png)

Public URL: https://marginfield-reader.soumikhalder.chatgpt.site. No real provider flow was exercised.
