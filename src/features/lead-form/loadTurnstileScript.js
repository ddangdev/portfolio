/* Injects Cloudflare Turnstile's api.js (explicit render) once, on first call. Every later call gets the
   same promise. Resolves with window.turnstile; rejects if the script fails or is not ready in 15 s. */

const SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const TIMEOUT_MS = 15000;

let pending = null;

export function loadTurnstileScript() {
  if (pending) return pending;
  pending = new Promise((resolve, reject) => {
    if (window.turnstile) {
      resolve(window.turnstile);
      return;
    }
    const timer = setTimeout(() => reject(new Error('turnstile: load timed out')), TIMEOUT_MS);
    const script = document.createElement('script');
    script.src = SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      clearTimeout(timer);
      if (window.turnstile) resolve(window.turnstile);
      else reject(new Error('turnstile: script ran without defining window.turnstile'));
    };
    script.onerror = () => {
      clearTimeout(timer);
      reject(new Error('turnstile: script failed to load'));
    };
    document.head.appendChild(script);
  });
  return pending;
}
