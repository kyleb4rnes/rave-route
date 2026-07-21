import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/app-settings.page').then(({ AppSettingsPage }) => AppSettingsPage),
  },
  {
    path: 'festivals/:festivalId/edit',
    loadComponent: () =>
      import('./features/festivals/festival-edit/festival-edit.page').then(
        ({ FestivalEditPage }) => FestivalEditPage,
      ),
  },
  {
    path: 'festivals/:festivalId',
    loadComponent: () =>
      import('./features/festivals/festival-details/festival-details.page').then(
        ({ FestivalDetailsPage }) => FestivalDetailsPage,
      ),
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then(({ HomePage }) => HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
