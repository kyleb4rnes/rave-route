import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { FESTIVAL_REPOSITORY } from './app/core/festivals/data/festival-repository.token';
import { LocalStorageFestivalRepository } from './app/core/festivals/data/local-storage-festival.repository';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: FESTIVAL_REPOSITORY, useClass: LocalStorageFestivalRepository },
    provideIonicAngular({ animated: false }),
    provideRouter(routes),
  ],
}).catch((error: unknown) => console.error(error));
