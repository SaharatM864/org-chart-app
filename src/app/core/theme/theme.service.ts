import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, OnDestroy, PLATFORM_ID, RendererFactory2, inject } from '@angular/core';
import { ReplaySubject, Subject, takeUntil } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService implements OnDestroy {
  private _platformId = inject(PLATFORM_ID);
  private _renderer = inject(RendererFactory2).createRenderer(null, null);
  private _document = inject(DOCUMENT);

  private _theme$ = new ReplaySubject<'light' | 'dark'>(1);
  public theme$ = this._theme$.asObservable();
  private _destroyed$ = new Subject<void>();

  constructor() {
    this.syncThemeFromLocalStorage();
    this.toggleClassOnThemeChanges();
  }

  private syncThemeFromLocalStorage(): void {
    if (isPlatformBrowser(this._platformId)) {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme === 'dark' || storedTheme === 'light') {
        this._theme$.next(storedTheme);
      } else {
        // Default to system preference if not set, or handle logic from index.html
        // The index.html script already sets localStorage, so we should trust it.
        // If for some reason it's missing, we check the class
        if (this._document.documentElement.classList.contains('dark')) {
          this._theme$.next('dark');
        } else {
          this._theme$.next('light');
        }
      }
    }
  }

  private toggleClassOnThemeChanges(): void {
    this.theme$.pipe(takeUntil(this._destroyed$)).subscribe((theme) => {
      if (theme === 'dark') {
        this._renderer.addClass(this._document.documentElement, 'dark');
      } else {
        if (this._document.documentElement.classList.contains('dark')) {
          this._renderer.removeClass(this._document.documentElement, 'dark');
        }
      }
    });
  }

  public toggleDarkMode(): void {
    const newTheme = localStorage.getItem('theme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    this._theme$.next(newTheme);
  }

  public ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }
}
