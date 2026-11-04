# ddanghnl-site

The studio site, rebuilt. React 19 + Vite. It opens on the wheel: the dial fades in first, the nav after it, then the preview, then the clock and the counter.

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
| `src/features/wheel/` | the wheel that grows in after the line clears: drag, scroll or arrow keys to turn it, 24 stops (`Wheel.jsx`, `wheel.css`) |
| `src/styles/base.css` | tokens and base |
| `index.html` | head, fonts, and a no-JS fallback showing the last line |
