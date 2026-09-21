# Deployment — Azure Static Web Apps + Azure DNS

Same pattern as shahagro.com. Everything below was created on 2026-09-21 in
"Azure subscription 1".

| Thing | Value |
| --- | --- |
| Resource group | `rg-aktcl` (East Asia) |
| Static Web App | `aktcl-web`, Free tier |
| Default hostname | `thankful-meadow-0c4713600.5.azurestaticapps.net` |
| DNS zone | `aktcl.com` (in `rg-aktcl`) |
| GitHub repo | `asefameerador96-ctrl/AKTCL`, branch `main` |
| Repo secret | `AZURE_STATIC_WEB_APPS_API_TOKEN` (the SWA deployment token) |

## How a deploy works

Push to `main` → `.github/workflows/azure-static-web-apps.yml`:
`npm ci` → `npm run check` (typecheck, lint, tests) → `npm run build` (Vite build, then
Playwright prerenders every route and writes `sitemap.xml`, `robots.txt`, `404.html`) →
`npm run verify` (loads every page in Chromium; fails on console errors, overflow, missing
metadata or leftover placeholder text) → upload `dist/` and `api/` with
`skip_app_build: true`. Pull requests get a staging URL that is removed when the PR closes.

If the token is ever rotated:

```bash
az staticwebapp secrets list -n aktcl-web -g rg-aktcl --query properties.apiKey -o tsv | gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN -R asefameerador96-ctrl/AKTCL
```

## DNS

### 1. Nameservers (GoDaddy → Azure DNS) — done by Asef

GoDaddy → My Products → `aktcl.com` → DNS → Nameservers → Change → "I'll use my own
nameservers", enter all four, save:

```
ns1-03.azure-dns.com
ns2-03.azure-dns.net
ns3-03.azure-dns.org
ns4-03.azure-dns.info
```

Before the change the domain was parked on GoDaddy (`ns73/ns74.domaincontrol.com`) with no
MX or TXT records, so no email or verification records are lost. If email on `@aktcl.com`
is ever added, its MX/SPF/DKIM records must be created in the **Azure** zone.

Check propagation (can take from minutes up to 48 hours):

```bash
nslookup -type=NS aktcl.com 8.8.8.8
```

### 2. Records already in the Azure zone

| Name | Type | Value |
| --- | --- | --- |
| `@` | A (alias) | → Static Web App `aktcl-web` |
| `www` | CNAME | `thankful-meadow-0c4713600.5.azurestaticapps.net` |

### 3. Bind the custom domains — after the nameservers have propagated

```bash
az staticwebapp hostname set -n aktcl-web -g rg-aktcl --hostname www.aktcl.com
```

```bash
az staticwebapp hostname set -n aktcl-web -g rg-aktcl --hostname aktcl.com --validation-method dns-txt-token --no-wait
```

Read the apex validation token, add it as a TXT record on `@`, and Azure validates it
within a few minutes:

```bash
az staticwebapp hostname show -n aktcl-web -g rg-aktcl --hostname aktcl.com --query validationToken -o tsv
```

```bash
az network dns record-set txt add-record -g rg-aktcl -z aktcl.com -n "@" -v "<token>"
```

Then in the portal (Static Web App → Custom domains) set **`www.aktcl.com` as the default**
so the apex and the `azurestaticapps.net` host redirect to it — canonical URLs, the
sitemap and Open Graph tags all use `https://www.aktcl.com`. TLS certificates are issued
and renewed by Azure automatically.

## Application settings (enquiry form)

Set on the Static Web App, never in git — see `.env.example` and `docs/enquiry-api.md`:

```bash
az staticwebapp appsettings set -n aktcl-web -g rg-aktcl --setting-names KEY=value
```

## Analytics (optional)

The owner's cookieless tracker (`site-analytics`) only accepts site ids listed in its
`ANALYTICS_ALLOWED_SITES` setting. To enable it: add `aktcl` there, then add to
`index.html`:

```html
<script defer data-site="aktcl" src="https://gray-bay-028d04e00.7.azurestaticapps.net/t.js"></script>
```

and allow that origin in the `Content-Security-Policy` (`script-src`, `connect-src`) in
`public/staticwebapp.config.json`. Enquiry CTAs already carry `data-lead` attributes.
`npm run verify` enforces the policy locally, so a tracker the CSP does not allow fails the
build instead of failing silently in production. The Privacy Notice promises cookieless,
aggregate statistics with no stored IP addresses — anything added must keep that true.

## Headers and the Content-Security-Policy

`public/staticwebapp.config.json` sets the security headers, the long cache on `/assets/*`,
the enquiry API route and the 404 override. There is no `navigationFallback`: every real URL
is prerendered to its own file, so unknown URLs get `404.html` with a real 404 status.

`script-src` allows inline scripts by hash, not `'unsafe-inline'`. The only inline script is
the pre-paint one in `index.html` (saved theme, legal-age gate). The config in `public/`
carries the placeholder `'sha256-INLINE-SCRIPTS'`; `scripts/prerender.mjs` replaces it in
`dist/` with the hash of whatever `index.html` actually ships, and `npm run verify` checks
every built page against it. Editing that script therefore needs no manual step — but a
plain `npm run build:nopre` output is not deployable. JSON-LD blocks are data, not script,
and need no entry. `style-src` keeps `'unsafe-inline'` because the prerendered HTML carries
`style=""` attributes.

## Costs

Static Web App Free tier: $0. DNS zone: about $0.50/month plus negligible query charges.
Table Storage for enquiries (if enabled): cents per month.
