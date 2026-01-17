import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID, RendererFactory2 } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';

interface LanguageState {
  currentLang: string;
}

const initialState: LanguageState = {
  currentLang: 'en',
};

export const LanguageStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const translate = inject(TranslateService);
    const renderer = inject(RendererFactory2).createRenderer(null, null);
    const document = inject(DOCUMENT);
    const platformId = inject(PLATFORM_ID);

    const updateBodyClass = (lang: string) => {
      renderer.removeClass(document.body, 'lang-en');
      renderer.removeClass(document.body, 'lang-th');
      renderer.addClass(document.body, `lang-${lang}`);
    };

    return {
      setLanguage: (lang: string) => {
        patchState(store, { currentLang: lang });
        translate.use(lang);
        if (isPlatformBrowser(platformId)) {
          localStorage.setItem('app-language', lang);
        }
        updateBodyClass(lang);
      },
      initLanguage: () => {
        let savedLang = 'en';
        if (isPlatformBrowser(platformId)) {
          savedLang = localStorage.getItem('app-language') || 'en';
        }
        patchState(store, { currentLang: savedLang });
        translate.use(savedLang);
        updateBodyClass(savedLang);
      },
    };
  }),
  withHooks({
    onInit: (store) => {
      store.initLanguage();
    },
  }),
);
