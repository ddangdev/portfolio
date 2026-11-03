import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative asset URLs, so the same build serves from a subpath (the tailnet snapshot, a mockups
// preview) or a domain root. The dev server answers on the tailnet too, by this machine's name only.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { host: true, port: 8814, strictPort: true, allowedHosts: ['beepie.tail1d892f.ts.net'] },
});
