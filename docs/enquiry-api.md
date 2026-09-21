# Enquiry API — `POST /api/enquiry`

The trade enquiry form on `/contact` is the one server-side piece of aktcl.com. It is an
Azure Static Web Apps **managed function** (Node 20, Functions v4 programming model, plain
ES modules) in `api/`, laid out like the owner's `site-analytics` API.

```
Browser  src/components/EnquiryForm.tsx   react-hook-form + zod (src/lib/enquiry.ts)
   │  POST /api/enquiry  (JSON, same origin)
   ▼
api/src/functions/enquiry.js
   1. JSON content type, body ≤ 16 KB
   2. honeypot / filled-too-fast      → 200 {ok:true}, silently dropped
   3. server-side validation          → 400 {error:"validation", fields:[…]}
   4. per-IP rate limit (5 / 10 min)  → 429 {error:"rate_limited"}
   5. deliver to every configured sink, in parallel
        ├─ Azure Table Storage, table "enquiries"   (the durable record)
        └─ SMTP email to ENQUIRY_TO, Reply-To = enquirer   (the notification)
   ▼
200 {ok:true}               at least one sink succeeded
503 {error:"not_configured"} no sink is configured
502 {error:"delivery_failed"} every configured sink failed
```

| File | Purpose |
| --- | --- |
| `api/src/index.js` | Entry point (`main` in `api/package.json`); imports each function |
| `api/src/functions/enquiry.js` | The HTTP handler and the flow above |
| `api/src/lib/validate.js` | Cleaning, limits, honeypot/timing check, header sanitising |
| `api/src/lib/rateLimit.js` | In-memory per-IP limiter, client IP extraction |
| `api/src/lib/storage.js` | Table Storage sink |
| `api/src/lib/mail.js` | SMTP sink (nodemailer), plain-text + HTML body |
| `api/test/enquiry.test.js` | `cd api && npm test` (Node's built-in test runner) |
| `src/lib/enquiry.ts` | Client schema, product options, `submitEnquiry()` |

The field limits exist twice — `ENQUIRY_LIMITS` in `src/lib/enquiry.ts` and `LIMITS` in
`api/src/lib/validate.js` — because the API is plain JavaScript with no build step.
**Change both together.** The server never trusts the client: every field is re-validated
and cleaned, and anything that goes into a mail header (subject, reply-to) has CR/LF and
other control characters removed.

## Settings

Application settings on the Static Web App (Portal → `aktcl-web` → Environment variables,
or the CLI below). They are never committed; `.env.example` lists them with comments.

```bash
az staticwebapp appsettings set -n aktcl-web -g rg-aktcl --setting-names SMTP_HOST=... SMTP_PORT=587
```

| Setting | Required | Notes |
| --- | --- | --- |
| `ENQUIRY_STORAGE_CONNECTION_STRING` | for the table sink | Any storage account; the `enquiries` table is created on first use. The account used by `site-analytics` can be reused |
| `SMTP_HOST` | for the email sink | Provider's SMTP submission host |
| `SMTP_PORT` | for the email sink | `587` (STARTTLS, enforced) or `465` (implicit TLS). Azure blocks outbound port 25 |
| `SMTP_USER` | for the email sink | Authenticating mailbox / SMTP user |
| `SMTP_PASS` | for the email sink | Password or app password |
| `ENQUIRY_TO` | for the email sink | Recipient(s), comma-separated |
| `ENQUIRY_FROM` | optional | Bare sender address; defaults to `SMTP_USER` |

Email counts as configured only when all five required mail settings are present; if some
are missing the function logs which **names** are empty (never values). Configure both
sinks: the table is the record that survives a mail outage, the email is what gets an
enquiry answered quickly.

Subject line: `[aktcl.com] Enquiry — <product> — <company>, <country>`. Pressing Reply in
the mail client answers the enquirer directly.

## Reading enquiries in Table Storage

- **Portal:** Storage account → Storage browser → Tables → `enquiries`.
- **Desktop:** Azure Storage Explorer → the account → Tables → `enquiries` (can export CSV).
- **CLI:**

```bash
az storage entity query --table-name enquiries --connection-string "<connection string>" --filter "PartitionKey eq '2026-09'" --num-results 50
```

`PartitionKey` is the month (`yyyy-mm`), so one filter returns a month. `RowKey` is a
reversed timestamp plus a random suffix, so rows list **newest first**. Columns:
`submittedAt`, `name`, `company`, `country`, `email`, `phone`, `product`, `volume`,
`message`, `page` (path the form was sent from), `consent`, and `emailStatus`:

| `emailStatus` | Meaning |
| --- | --- |
| `sent` | Also delivered to the mailbox |
| `failed` | **Email did not go out — follow up from the table** |
| `pending` | The function stopped before the mail result was recorded; treat as `failed` |
| `not_configured` | Email sink was not set up at the time |

Rows stay until someone deletes them. The Privacy Notice says enquiry information is kept
only as long as needed, so agree a retention period and clear old partitions on a schedule.

## Spam controls

| Control | Behaviour |
| --- | --- |
| Honeypot | Hidden `website` field (off-screen, `tabindex="-1"`, `aria-hidden`). Anything in it → dropped |
| Timing | The form sends the visitor's clock at render and at submit; under 3 s between them → dropped. Only the difference is used, so a wrong clock cannot reject a real enquiry |
| Silent drop | Both of the above answer `200 {ok:true}` so a bot learns nothing. The log line is `enquiry: dropped { reason }` |
| Rate limit | 5 accepted enquiries per IP per 10 minutes, then `429` with `Retry-After` |
| JSON only | Non-JSON content types get `415`. A JSON POST from another origin needs a CORS preflight, which this endpoint never grants |
| Size cap | Bodies over 16 KB get `413` |

The rate limit lives in the function's memory. Static Web Apps managed functions are
**ephemeral** — instances are recycled when idle and there can be more than one — so it is a
best-effort brake, not a guarantee. If spam gets through in practice, the next step is
Cloudflare Turnstile (free, no puzzle for most people): a widget in `EnquiryForm.tsx` and one
token-verification call at the top of the handler.

## Logging and privacy

Logs contain sink results, country and product only — never names, addresses, phone
numbers or message text. Errors are logged as a code and status, not the provider's
message, because those can quote addresses. The visitor's IP is used in memory for the rate
limit and is neither stored nor logged.

The analytics tracker records `enquiry-form` for each submit attempt and
`enquiry-submitted` (`window.sa('lead', …)`) for each delivered enquiry. The form is
identified by its `name` attribute rather than `data-lead`, because the tracker counts every
click inside a `[data-lead]` element and would otherwise log a lead per field touched.

## Testing locally

Unit tests (no Azure needed):

```bash
cd api && npm install && npm test
```

End to end with the Static Web Apps CLI, which serves the site and the API on one origin
exactly as Azure does:

1. `cd api && npm install`, then copy `local.settings.example.json` to `local.settings.json`
   (git-ignored) and fill in the sinks you want to try.
2. For the table sink without touching Azure, keep `UseDevelopmentStorage=true` and run the
   emulator in a separate terminal: `npx azurite --inMemoryPersistence` (keeps everything in
   memory, so nothing is written into the repo)
3. Terminal A: `npm run dev` (Vite on port 8080).
4. Terminal B: `npx @azure/static-web-apps-cli start http://localhost:8080 --api-location api`
5. Open `http://localhost:4280/contact` — **4280**, not 8080. On 8080 there is no API and the
   form correctly reports that the enquiry could not be sent.

The CLI needs Azure Functions Core Tools v4 (it offers to install them). If Core Tools
rejects the local Node version, use Node 20 or 22.

Direct request against the emulator:

```bash
curl -i -X POST http://localhost:4280/api/enquiry -H "Content-Type: application/json" -d '{"name":"Test Buyer","company":"Test Trading LLC","country":"United Arab Emirates","email":"buyer@example.com","phone":"","product":"Virginia Flue-Cured","volume":"","message":"Test enquiry, please ignore.","consent":true,"website":"","renderedAt":1000,"submittedAt":9000,"page":"/contact"}'
```

Expected: `503 not_configured` with empty settings, `200 {"ok":true}` once a sink works. Set
`"website":"x"` to see the silent drop (200, nothing delivered, `dropped` in the log).

## Deployment requirements

- The workflow must pass `api_location: "api"` to `Azure/static-web-apps-deploy`, and must
  **not** set `skip_api_build: true`: the action installs the API's production dependencies
  (`api/node_modules` is not committed). `api/package-lock.json` is committed.
- `staticwebapp.config.json` needs `"platform": { "apiRuntime": "node:20" }` and `/api/*`
  in `navigationFallback.exclude`. Any `Content-Security-Policy` needs `connect-src 'self'`.
- After the first deploy the function appears under Static Web App → APIs; its logs are under
  Application Insights if one is linked.

## Still needed from AKTCL

1. **Recipient mailbox** for enquiries (`ENQUIRY_TO`), e.g. the export desk's shared inbox.
2. **SMTP credentials** for a mailbox allowed to send to it (`SMTP_HOST`, `SMTP_PORT`,
   `SMTP_USER`, `SMTP_PASS`, optionally `ENQUIRY_FROM`). On Microsoft 365 the mailbox needs
   "Authenticated SMTP" enabled; with Google Workspace use an app password. `aktcl.com` had no
   MX records when the DNS zone was created, so the mailbox will be on another domain until
   email is set up for `aktcl.com`.
3. **Storage account** connection string (`ENQUIRY_STORAGE_CONNECTION_STRING`) — a new account
   in `rg-aktcl` or the existing analytics one.
4. A **retention period** for stored enquiries, and legal sign-off on the consent wording in
   the form ("I confirm I am a tobacco trade professional of legal age…").
5. The public contact details in `src/content/site.ts` (`contact.email`, `phone`, `whatsapp`,
   `addressLines`). Until they are filled in the form is the only contact route, and its error
   state cannot offer an email address as a fallback.
