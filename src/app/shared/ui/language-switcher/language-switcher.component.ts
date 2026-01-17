import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageStore } from '../../../core/i18n/language.service';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { provideIcons } from '@ng-icons/core';
import { lucideLanguages, lucideCheck } from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, HlmButton, ...HlmDropdownMenuImports, ...HlmIconImports],
  providers: [provideIcons({ lucideLanguages, lucideCheck })],
  template: `
    <button hlmBtn variant="ghost" size="icon" [hlmDropdownMenuTrigger]="menu" class="rounded-full">
      <ng-icon hlm name="lucideLanguages" class="h-5 w-5"></ng-icon>
    </button>

    <ng-template #menu>
      <div hlmDropdownMenu class="w-40">
        <button hlmDropdownMenuItem (click)="switchLang('en')" class="w-full justify-between">
          <span>English</span>
          <ng-icon hlm *ngIf="currentLang === 'en'" name="lucideCheck" class="h-4 w-4"></ng-icon>
        </button>
        <button hlmDropdownMenuItem (click)="switchLang('th')" class="w-full justify-between">
          <span>ไทย (Thai)</span>
          <ng-icon hlm *ngIf="currentLang === 'th'" name="lucideCheck" class="h-4 w-4"></ng-icon>
        </button>
      </div>
    </ng-template>
  `,
})
export class LanguageSwitcherComponent {
  readonly store = inject(LanguageStore);

  get currentLang() {
    return this.store.currentLang();
  }

  switchLang(lang: string) {
    this.store.setLanguage(lang);
  }
}
