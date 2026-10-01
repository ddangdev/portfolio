/* Cloudflare Turnstile for the lead form: lazy load, explicit render, token, reset, remove.
   - Loads only when the form tile comes within one viewport of the screen, or on the first focus inside
     it, whichever is first. This keeps it off the first view and off the LCP path.
   - Renders once into the slot (dark theme; compact when the slot is under 300px wide).
   - The token is captured by callback; tokens are single-use, so reset() runs after every failed send.
   - The widget is removed on unmount.
   status: 'idle' | 'loading' | 'ready' | 'solved' | 'error' */
import { useCallback, useEffect, useRef, useState } from 'react';
import { TURNSTILE_SITE_KEY } from '../../data/site';
import { hasIntersectionObserver } from '../../motion/useMediaQuery';
import { loadTurnstileScript } from './loadTurnstileScript';

/* keep in step with the container query in lead-form.css that reserves the compact height */
const NORMAL_WIDTH = 300;

export function useTurnstile({ slotRef, watchRef }) {
  const [status, setStatus] = useState('idle');
  const [scriptReady, setScriptReady] = useState(false);
  const startedRef = useRef(false);
  const widgetIdRef = useRef(null);
  const tokenRef = useRef('');

  const load = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    setStatus('loading');
    loadTurnstileScript().then(
      () => {
        setScriptReady(true);
        setStatus((s) => (s === 'loading' ? 'ready' : s));
      },
      () => setStatus('error'),
    );
  }, []);

  /* when to load: on first focus inside the form tile, or once the tile is within a viewport of the screen.
     The proximity check starts only after the window `load` event: on wide screens the form's top edge is
     already in the first view, and the widget must never compete with the first paint. */
  useEffect(() => {
    const el = watchRef.current;
    if (!el) return undefined;
    el.addEventListener('focusin', load);

    let io = null;
    let timer = 0;
    const watch = () => {
      if (!hasIntersectionObserver()) {
        load();
        return;
      }
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            io.disconnect();
            load();
          }
        },
        { rootMargin: '100% 0px' },
      );
      io.observe(el);
    };
    const afterLoad = () => { timer = setTimeout(watch, 0); };
    if (document.readyState === 'complete') afterLoad();
    else window.addEventListener('load', afterLoad, { once: true });

    return () => {
      el.removeEventListener('focusin', load);
      window.removeEventListener('load', afterLoad);
      clearTimeout(timer);
      if (io) io.disconnect();
    };
  }, [watchRef, load]);

  /* render once the script is ready; remove on unmount */
  useEffect(() => {
    if (!scriptReady) return undefined;
    const slot = slotRef.current;
    const ts = window.turnstile;
    if (!slot || !ts || widgetIdRef.current !== null) return undefined;

    try {
      widgetIdRef.current = ts.render(slot, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: 'dark',
        size: slot.clientWidth >= NORMAL_WIDTH ? 'normal' : 'compact',
        appearance: 'always',
        'refresh-expired': 'auto',
        callback: (token) => {
          tokenRef.current = token;
          setStatus('solved');
        },
        'expired-callback': () => {
          tokenRef.current = '';
          setStatus('ready');
        },
        'error-callback': () => {
          tokenRef.current = '';
          setStatus('error');
        },
      });
    } catch {
      widgetIdRef.current = null;
      queueMicrotask(() => setStatus('error'));
    }

    return () => {
      const id = widgetIdRef.current;
      widgetIdRef.current = null;
      tokenRef.current = '';
      if (id !== null) {
        try {
          window.turnstile.remove(id);
        } catch {
          /* already gone */
        }
      }
      slot.replaceChildren();
    };
  }, [scriptReady, slotRef]);

  const getToken = useCallback(() => {
    if (tokenRef.current) return tokenRef.current;
    const id = widgetIdRef.current;
    if (id === null || !window.turnstile) return '';
    try {
      return window.turnstile.getResponse(id) || '';
    } catch {
      return '';
    }
  }, []);

  const reset = useCallback(() => {
    tokenRef.current = '';
    const id = widgetIdRef.current;
    if (id === null || !window.turnstile) return;
    try {
      window.turnstile.reset(id);
    } catch {
      /* a reset that fails leaves the old (spent) token; the next send then fails the check */
    }
    setStatus((s) => (s === 'solved' ? 'ready' : s));
  }, []);

  return { status, load, getToken, reset };
}
