import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/app-settings.page').then(({ AppSettingsPage }) => AppSettingsPage),
  },
  {
    path: 'festivals/add',
    loadComponent: () =>
      import('./features/festivals/festival-add/festival-add.page').then(
        ({ FestivalAddPage }) => FestivalAddPage,
      ),
  },
  {
    path: 'festivals/browse',
    loadComponent: () =>
      import('./features/festivals/festival-browse/festival-browse.page').then(
        ({ FestivalBrowsePage }) => FestivalBrowsePage,
      ),
  },
  {
    path: 'festivals/custom',
    loadComponent: () =>
      import('./features/festivals/festival-custom/festival-custom.page').then(
        ({ FestivalCustomPage }) => FestivalCustomPage,
      ),
  },
  {
    path: 'festivals/:festivalId/edit',
    loadComponent: () =>
      import('./features/festivals/festival-edit/festival-edit.page').then(
        ({ FestivalEditPage }) => FestivalEditPage,
      ),
  },
  {
    path: 'festivals/:festivalId/lineup',
    loadComponent: () =>
      import('./features/festivals/festival-lineup/festival-lineup.page').then(
        ({ FestivalLineupPage }) => FestivalLineupPage,
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
