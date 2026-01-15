import { Injectable, Inject, Renderer2, RendererFactory2, PLATFORM_ID } from '@angular/core';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { TranslateService } from '@ngx-translate/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private renderer: Renderer2;
  private currentLang = 'en';

  constructor(
    private translate: TranslateService,
    rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.initLanguage();
  }

  private initLanguage() {
    let savedLang = 'en';
    if (isPlatformBrowser(this.platformId)) {
      savedLang = localStorage.getItem('app-language') || 'en';
    }
    this.setLanguage(savedLang);
  }

  setLanguage(lang: string) {
    this.currentLang = lang;
    this.translate.use(lang);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('app-language', lang);
    }
    this.updateBodyClass(lang);
  }

  getCurrentLang(): string {
    return this.currentLang;
  }

  private updateBodyClass(lang: string) {
    this.renderer.removeClass(this.document.body, 'lang-en');
    this.renderer.removeClass(this.document.body, 'lang-th');
    this.renderer.addClass(this.document.body, `lang-${lang}`);
  }
}
