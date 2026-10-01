# ddanghnl.com

the one-page site for **ddanghnl studio**, a web studio in Honolulu: websites people enjoy using.

**live at [ddanghnl.com](https://ddanghnl.com)**

## stack

react 19 · vite 8 · plain css (a token system, no css-in-js) · cloudflare pages + pages functions

## scripts

```bash
npm install
npm run dev       # localhost:5173
npm run build     # production build into dist/
npm run lint      # eslint
npm test          # node --test: the lead form contract against functions/api/lead.js
```

## how it is organised

```
src/
  data/        copy and records: services, client work, own projects, studio facts, contact, Turnstile site key
  styles/      tokens.css (every colour, size and timing), base.css (kit components), bento.css (tile shell + grid)
               index.css is the only stylesheet entry and fixes the cascade order
  motion/      one hook per behaviour: word reveal, scroll reveal, magnetic buttons, view pill, ticker, scrolled-past (the header hairline)
               all honour prefers-reduced-motion
  components/  shared pieces: Card, MagneticButton, DeviceStage, Ticker, Facts...
  features/    one folder per tile (hero, work, services, lead-form, studio, own-projects, mail) + header, footer
  analytics/   GA4 events through a safe gtag wrapper
functions/api/lead.js   the lead endpoint (Cloudflare Pages Function)
tests/contract/         the form-to-endpoint contract test
```

## the lead form

`src/features/lead-form/` validates in the browser (`validation.js`), builds the JSON body (`buildLeadPayload.js`) and
posts it to `/api/lead` (`sendLead.js`) with a Cloudflare Turnstile token. Turnstile loads only when the form comes near
the screen. `functions/api/lead.js` re-validates, checks the token, drops honeypot hits and emails the lead through
Resend. The endpoint can answer HTTP 200 with `{ ok: false }`, so the page counts a send as done only on `ok: true`;
every failure shows the email address as a fallback.

Secrets (`TURNSTILE_SECRET`, `RESEND_API_KEY`, `LEAD_TO`) live in the Pages project settings, never in the repo.
Turnstile tokens only validate on ddanghnl.com, www.ddanghnl.com, localhost and 127.0.0.1.

## license

[MIT](./LICENSE)
