import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  importProvidersFrom,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch } from '@angular/common/http';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { TranslateModule } from '@ngx-translate/core';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideIcons } from '@ng-icons/core';
import {
  lucidePlus,
  lucideLayoutGrid,
  lucideMinus,
  lucideMaximize,
  lucideMinimize,
  lucideMap,
  lucideArrowRightLeft,
  lucideChevronsDown,
  lucideChevronsUp,
  lucideRotateCcw,
  lucideMove,
  lucideX,
  lucideUser,
  lucideAlertTriangle,
} from '@ng-icons/lucide';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    provideTranslateHttpLoader({
      prefix: './assets/i18n/',
      suffix: '.json',
    }),
    importProvidersFrom(TranslateModule.forRoot()),
    provideIcons({
      lucidePlus,
      lucideLayoutGrid,
      lucideMinus,
      lucideMaximize,
      lucideMinimize,
      lucideMap,
      lucideArrowRightLeft,
      lucideChevronsDown,
      lucideChevronsUp,
      lucideRotateCcw,
      lucideMove,
      lucideX,
      lucideUser,
      lucideAlertTriangle,
    }),
  ],
};
