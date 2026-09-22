# Provider safety

Marginfield uses Firecrawl only through `internal.ingestion.scrape`. The supplied source URL must be HTTP(S), has no credentials, and is rejected when it is a private IP literal. The application does not make direct arbitrary URL requests. Firecrawl provides the egress boundary for DNS-host targets.

Fetched text is bounded before it is stored. Provider failures become generic article failures; provider response details are not returned to users.

AgentMail inboxes are owned by one authenticated Marginfield user. Inbound delivery must enter only through the AgentMail component webhook handler, which requires its configured signature secret. The app handler accepts messages only for a registered inbox. In one mutation it stores an event/message dedupe key and creates one `newsletter` source for that inbox owner. Duplicate events and unknown inbox identifiers make no source. The signed
provider callback routes a registered inbox to its stored owner; it does not
accept an untrusted caller-supplied user identifier.

Briefings are sent only after an explicit authenticated UI request. The recipient must be in the server-controlled `ALLOWED_DIGEST_RECIPIENT` list; otherwise the request fails. Password accounts do not currently have an email-verification adapter. An account's email alone does not authorize delivery. No background digest timer is created by this integration.

`sendBriefing` records the AgentMail outbound identifier and starts as `queued`. The UI can read `mail.getDelivery` and call `mail.refreshDelivery` to synchronize a component status into `sent`, `delivered`, `failed`, or `bounced`. A retry requires a new explicit attempt ID and is permitted only after `failed` or `bounced`; it never starts automatically. The current provider packet has no independent verified-email provider, so delivery fails closed unless the recipient is on `ALLOWED_DIGEST_RECIPIENT`.
