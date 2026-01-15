import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import {
  lucideLayoutDashboard,
  lucideUsers,
  lucideSettings,
  lucideMenu,
  lucideSearch,
  lucideBell,
  lucideUser,
  lucideChevronDown,
} from '@ng-icons/lucide';
import { BrnNavigationMenuImports } from '@spartan-ng/brain/navigation-menu';
import { HlmNavigationMenuImports } from '@spartan-ng/helm/navigation-menu';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmButton } from '@spartan-ng/helm/button';
import { LanguageSwitcherComponent } from '../../../shared/ui/language-switcher/language-switcher.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    ...HlmNavigationMenuImports,
    ...BrnNavigationMenuImports,
    ...HlmIconImports,
    HlmButton,
    LanguageSwitcherComponent,
  ],
  providers: [
    provideIcons({
      lucideLayoutDashboard,
      lucideUsers,
      lucideSettings,
      lucideMenu,
      lucideSearch,
      lucideBell,
      lucideUser,
      lucideChevronDown,
    }),
  ],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent {}
