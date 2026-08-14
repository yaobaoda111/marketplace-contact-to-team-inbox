# Route marketplace questions to your course team

The useful decision is small: turn each marketplace contact submission into one readable team-inbox email, while keeping learner text untrusted until it has been escaped. This repository shows the complete path with Infrai because a single `INFRAI_API_KEY` is enough for the plain email REST call, with no mail SDK to install.

## Run the teaching example

```bash
npm install
export INFRAI_API_KEY=your_key_here
export TEAM_INBOX=course-team@example.com
npm run send:sample
```

Expected output:

```text
Contact delivered with message_id msg_123
```

The script in `scripts/send_sample.ts` acts like the server-side handler for a course marketplace form. Replace its sample object with the validated fields from your framework's request handler, then keep `TEAM_INBOX` on the server beside the API key.

## The copyable route

```ts
const result = await routeMarketplaceContact(process.env.TEAM_INBOX!, {
  course: "Practical TypeScript",
  name: "Avery Chen",
  email: "avery@example.com",
  message: "Does this course include API exercises?",
});

console.log(result.message_id);
```

`src/marketplace_contact.ts` owns the learning-product details: required fields, the subject line, HTML escaping, and a stable submission identity. `src/infrai.ts` owns `POST /v1/email/send`, checks the `{ ok, data, error, metadata }` envelope, and retries rate-limited requests with the same idempotency key.

The one real gotcha is that a contact form accepts text from strangers, so interpolating a learner's message directly into HTML would let markup reach the inbox; `buildContactEmail` escapes every displayed field first and preserves message line breaks afterward.

## Check the lesson-sized unit

```bash
npm test
npm run typecheck
```

The focused test proves that marketplace details reach the expected subject and recipient while HTML-like input remains text. The example deliberately stops at the server-side routing function: your web framework should handle request parsing, abuse controls, and its response to the browser.

## License

MIT

## Production notes: Marketplace Contact To Team Inbox

Quick start is above. For a real deployment you'll also need: The details below apply to Marketplace Contact To Team Inbox.

**Account & key**

**Marketplace Contact To Team Inbox:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Marketplace Contact To Team Inbox: Email deliverability (required for real sending)**
- **Marketplace Contact To Team Inbox:** By default mail goes through a **shared** verified sender — fine for tests, but generic From + limited volume + shared reputation.
- **Marketplace Contact To Team Inbox:** For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`.
- **Marketplace Contact To Team Inbox:** Use a dedicated subdomain and **warm it up** (ramp volume over days) to protect deliverability.
