import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeModeContext = createContext({ mode: 'light', toggle: () => {}, setMode: () => {} });

const STORAGE_KEY = 'portfolio-theme';

function readInitialMode() {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {}
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

export function ThemeModeProvider({ children }) {
  const [mode, setModeState] = useState(readInitialMode);

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, mode); } catch {}
    // For CSS hooks (e.g., native form controls) — expose mode on <html>
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  const setMode = useCallback((m) => setModeState(m === 'dark' ? 'dark' : 'light'), []);
  const toggle = useCallback(() => setModeState((m) => (m === 'dark' ? 'light' : 'dark')), []);

  return (
    <ThemeModeContext.Provider value={{ mode, toggle, setMode }}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  return useContext(ThemeModeContext);
}
