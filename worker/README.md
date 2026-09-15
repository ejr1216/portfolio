# Demo request worker

"Email me the demos" on the portfolio posts to this Cloudflare Worker. The worker checks a Turnstile token, rate-limits (3 per IP, 2 per address, 100 per day), then sends one email from er@mavericklabs.dev through iCloud SMTP with the two demo PDFs attached and links to all three demos. Every send is BCC'd to er@mavericklabs.dev and logged in KV for 90 days, so each request is a lead.

The site only shows the form once `docs/data/demo-request.js` has the worker URL and Turnstile site key filled in.

## One-time setup (about 15 minutes)

1. **Apple app-specific password.** account.apple.com, Sign-In and Security, App-Specific Passwords, generate one named "portfolio demos". iCloud SMTP signs in with your Apple ID email plus this password and can send as er@mavericklabs.dev because that domain is attached to your iCloud Mail.
2. **Log in to Cloudflare from the terminal** (the DNS for mavericklabs.dev already lives in this account):
   ```bash
   npx wrangler login
   ```
3. **Create the KV namespace** and paste the id into `wrangler.toml`:
   ```bash
   npx wrangler kv namespace create LEADS
   ```
4. **Turnstile widget.** Cloudflare dashboard, Turnstile, Add site: domain `ejr1216.github.io`, mode Managed. Copy the site key into `docs/data/demo-request.js` and keep the secret for the next step.
5. **Secrets** (each command prompts for the value; nothing is stored in the repo):
   ```bash
   npx wrangler secret put SMTP_USER
   npx wrangler secret put SMTP_PASS
   npx wrangler secret put TURNSTILE_SECRET
   ```
6. **Deploy**:
   ```bash
   npx wrangler deploy
   ```
   Put the printed URL (`https://portfolio-demo-request.<account>.workers.dev`) into `docs/data/demo-request.js` as `endpoint`, commit, push.
7. **Test** from the site with your own address. The BCC copy lands in er@mavericklabs.dev.

## Operating notes
- Leads: `npx wrangler kv key list --binding LEADS --prefix lead:` then `npx wrangler kv key get --binding LEADS <key>`.
- Caps live at the top of `src/index.js`. iCloud allows about 1,000 messages a day; the worker's global cap is 100.
- Attachments are fetched from the live site at send time, so republishing the demo PDFs updates the email without redeploying.
- To pause the feature, blank `endpoint` in `docs/data/demo-request.js`; the form disappears.
