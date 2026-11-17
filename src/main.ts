import { provideZonelessChangeDetection, isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withDisabledInitialNavigation,
} from '@angular/router';
import { IonicRouteStrategy } from '@ionic/angular/ionic-route-strategy';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { FESTIVAL_REPOSITORY } from './app/core/festivals/data/festival-repository.token';
import { LocalStorageFestivalRepository } from './app/core/festivals/data/local-storage-festival.repository';
import { provideServiceWorker } from '@angular/service-worker';

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: FESTIVAL_REPOSITORY, useClass: LocalStorageFestivalRepository },
    provideRouter(routes, withDisabledInitialNavigation()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
}).catch((error: unknown) => console.error(error));
