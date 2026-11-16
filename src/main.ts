import { provideZoneChangeDetection, isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { FESTIVAL_REPOSITORY } from './app/core/festivals/data/festival-repository.token';
import { LocalStorageFestivalRepository } from './app/core/festivals/data/local-storage-festival.repository';
import { provideServiceWorker } from '@angular/service-worker';
import { overlayMotion, routeMotion } from './app/core/motion/ionic-motion';
import { reducedMotionQuery } from './app/core/motion/motion-preference';

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: FESTIVAL_REPOSITORY, useClass: LocalStorageFestivalRepository },
    provideIonicAngular({
      animated: !window.matchMedia(reducedMotionQuery).matches,
      navAnimation: routeMotion,
      focusManagerPriority: ['heading', 'content'],
      alertEnter: overlayMotion('.alert-wrapper', 0, true),
      alertLeave: overlayMotion('.alert-wrapper', 0, false),
      modalEnter: overlayMotion('.modal-wrapper', 8, true),
      modalLeave: overlayMotion('.modal-wrapper', 8, false),
      actionSheetEnter: overlayMotion('.action-sheet-wrapper', 8, true),
      actionSheetLeave: overlayMotion('.action-sheet-wrapper', 8, false),
    }),
    provideRouter(routes),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
}).catch((error: unknown) => console.error(error));
