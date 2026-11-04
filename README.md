# ddanghnl-site

The studio site, rebuilt. React 19 + Vite. It starts from the opening line: on black, "i make" holds
while the last word rolls - websites, brands, things people enjoy using - inside a white label that
resizes to each word, then the label wipes away and leaves the line in white. After the CLOU
Architects intro; first built as a plain page at `mockups.ddanghnl.com/portfolio-brand/`.

The live site, ddanghnl.com, since 2026-11-02. It deploys from the `portfolio` repo (Cloudflare
Pages, custom domain and secrets hang off it): `scripts/release.sh` copies this source there and
builds; commit and push there, and Pages deploys main. Edit here, release there. GA4's measurement
ID is in `.env.production`; the events are listed in `src/features/measure/measure.js` (named so no tracker-blocker list matches the path in development).

## Run it

```
npm install
npm run dev
```

The dev server listens on port 8814, on localhost and the tailnet.

| file | what it does |
| --- | --- |
| `src/App.jsx` | the page |
| `src/features/opening/` | the opening line: the sequence (`Opening.jsx`) and its styles |
| `src/features/wheel/` | the wheel that grows in after the line clears: drag, scroll or arrow keys to turn it, 24 stops (`Wheel.jsx`, `wheel.css`) |
| `src/styles/base.css` | tokens and base |
| `index.html` | head, fonts, and a no-JS fallback showing the last line |
