import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'org-chart',
        pathMatch: 'full',
      },

      {
        path: 'org-chart',
        loadChildren: () =>
          import('./features/org-chart/org-chart.routes').then((m) => m.ORG_CHART_ROUTES),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
    ],
  },
];
