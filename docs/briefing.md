# Source-linked briefings

`briefings.request` saves the selected source-ID snapshot and schedules
`internal.briefingActions.generate({ briefingId })`. The internal action reads the
briefing snapshot, requires one to eight ready sources owned by the briefing user,
and sends a bounded JSON data frame to the Convex Agent component. Each selected
source ID is retained in that frame. If needed, source text is reduced evenly
before serialization; the completed JSON frame is never truncated.

The configured model is `OPENAI_MODEL`, with `gpt-5-mini` as the default. The
action uses the Agent component's structured `generateObject` call. It has no
static/demo-provider fallback: missing provider configuration or invalid model
output marks the briefing as failed with a generic error.

Output must pass the Zod schema and every returned citation ID must be in the
saved source snapshot. The Agent `instructions` contain the immutable task
rules. Source text is JSON-serialized untrusted reference data to prevent
delimiter forgery. This does not guarantee resistance to model prompt injection
or the factual accuracy of generated prose. The UI must render `excerpt` as
text, not raw HTML.

Local tests cover source ownership and bounds, malformed output, citation
membership, max-eight source framing, and malicious source-data serialization.
They do not prove a live OpenAI/Convex call. Configure the OpenAI API key and
Convex deployment environment, then request a briefing with real owned ready
sources for that acceptance check.

Each generation has an attempt number and deadline. Completion/failure mutations
are conditional on the current `generating` status and matching attempt; the
watchdog fails expired work. A late provider result cannot replace a failed or
newer attempt.
