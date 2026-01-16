import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe } from '@angular/common';
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
  lucideSun,
  lucideMoon,
} from '@ng-icons/lucide';
import { BrnNavigationMenuImports } from '@spartan-ng/brain/navigation-menu';
import { HlmNavigationMenuImports } from '@spartan-ng/helm/navigation-menu';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmButton } from '@spartan-ng/helm/button';
import { ThemeService } from '../../theme/theme.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    AsyncPipe,
    ...HlmNavigationMenuImports,
    ...BrnNavigationMenuImports,
    ...HlmIconImports,
    HlmButton,
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
      lucideSun,
      lucideMoon,
    }),
  ],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent {
  private _themeService = inject(ThemeService);
  public theme$ = this._themeService.theme$;

  public toggleTheme(): void {
    this._themeService.toggleDarkMode();
  }
}
