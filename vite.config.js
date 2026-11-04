import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative asset URLs, so the same build serves from a subpath (the tailnet snapshot, a mockups
// preview) or a domain root. The dev server answers on the tailnet too, by this machine's name only.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { host: true, port: 8814, strictPort: true, allowedHosts: ['beepie.tail1d892f.ts.net'] },
  // The dependency scan reads only the site's own entry. Left to itself it walks into public/embed,
  // where the live projects carry imports of their own (`three`, in aina-moana) that this project
  // does not install; the scan then fails, nothing is pre-bundled, and a real browser's first load
  // races a 503 on a source module and crashes to the fallback line (found 2026-11-04).
  optimizeDeps: { entries: ['index.html'] },
});
