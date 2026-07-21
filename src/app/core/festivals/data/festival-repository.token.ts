import { InjectionToken } from '@angular/core';

import { FestivalRepository } from './festival.repository';

export const FESTIVAL_REPOSITORY = new InjectionToken<FestivalRepository>('FESTIVAL_REPOSITORY');
