import { create } from 'zustand';

export type Theme = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'box-theme';

const mql = window.matchMedia('(prefers-color-scheme: dark)');

function getStoredTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    /* storage indisponível */
  }
  return 'system';
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  return theme === 'system' ? (mql.matches ? 'dark' : 'light') : theme;
}

let transitionTimer: number | undefined;

function withTransition() {
  const root = document.documentElement;
  root.classList.add('theme-transition');
  if (transitionTimer) window.clearTimeout(transitionTimer);
  transitionTimer = window.setTimeout(() => {
    root.classList.remove('theme-transition');
  }, 350);
}

function applyDocumentTheme(theme: 'light' | 'dark') {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
}

const stored = getStoredTheme();
const initialResolved = resolveTheme(stored);
applyDocumentTheme(initialResolved);

interface ThemeState {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: stored,
  isDark: initialResolved === 'dark',
  setTheme: (theme) => {
    const resolved = resolveTheme(theme);
    withTransition();
    applyDocumentTheme(resolved);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
    set({ theme, isDark: resolved === 'dark' });
  },
  toggleTheme: () =>
    set((state) => {
      const next: Theme = state.isDark ? 'light' : 'dark';
      withTransition();
      applyDocumentTheme(next);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      return { theme: next, isDark: next === 'dark' };
    }),
}));

if (mql.addEventListener) {
  mql.addEventListener('change', (e) => {
    const state = useThemeStore.getState();
    if (state.theme === 'system') {
      const resolved = e.matches ? 'dark' : 'light';
      applyDocumentTheme(resolved);
      useThemeStore.setState({ isDark: resolved === 'dark' });
    }
  });
}
