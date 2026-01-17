import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID, RendererFactory2 } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
}

const initialState: ThemeState = {
  theme: 'light',
};

export const ThemeStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const platformId = inject(PLATFORM_ID);
    const renderer = inject(RendererFactory2).createRenderer(null, null);
    const document = inject(DOCUMENT);

    const syncTheme = (theme: Theme) => {
      if (isPlatformBrowser(platformId)) {
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
          renderer.addClass(document.documentElement, 'dark');
        } else {
          renderer.removeClass(document.documentElement, 'dark');
        }
      }
    };

    return {
      toggleTheme: () => {
        const newTheme = store.theme() === 'dark' ? 'light' : 'dark';
        patchState(store, { theme: newTheme });
        syncTheme(newTheme);
      },
      setTheme: (theme: Theme) => {
        patchState(store, { theme });
        syncTheme(theme);
      },
      initTheme: () => {
        if (isPlatformBrowser(platformId)) {
          const storedTheme = localStorage.getItem('theme') as Theme | null;
          if (storedTheme === 'dark' || storedTheme === 'light') {
            patchState(store, { theme: storedTheme });
            syncTheme(storedTheme);
          } else if (document.documentElement.classList.contains('dark')) {
            patchState(store, { theme: 'dark' });
          }
        }
      },
    };
  }),
  withHooks({
    onInit: (store) => {
      store.initTheme();
    },
  }),
);
