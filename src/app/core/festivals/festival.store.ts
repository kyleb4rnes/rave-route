import { computed, inject, Injectable, signal } from '@angular/core';

import {
  getNextFestival,
  getPastFestivals,
  getUpcomingFestivals,
  sortFestivalsByStartDate,
} from './festival-date.utils';
import { FestivalDraft } from './models/festival-draft';
import { Festival } from './models/festival';
import { FESTIVAL_REPOSITORY } from './data/festival-repository.token';

@Injectable({ providedIn: 'root' })
export class FestivalStore {
  private readonly repository = inject(FESTIVAL_REPOSITORY);
  private readonly festivalsSignal = signal<readonly Festival[]>([]);
  private readonly loadingSignal = signal(true);
  private readonly errorSignal = signal<string | null>(null);

  readonly allFestivals = this.festivalsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly nextFestival = computed(() => getNextFestival(this.allFestivals()));
  readonly laterUpcomingFestivals = computed(() => {
    const nextFestival = this.nextFestival();

    return getUpcomingFestivals(this.allFestivals()).filter(
      (festival) => festival.id !== nextFestival?.id,
    );
  });
  readonly pastFestivals = computed(() => getPastFestivals(this.allFestivals()));

  constructor() {
    void this.loadFestivals();
  }

  async loadFestivals(): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const festivals = await this.repository.getAll();

      this.festivalsSignal.set(sortFestivalsByStartDate(festivals));
    } catch {
      this.festivalsSignal.set([]);
      this.errorSignal.set('We could not load your festivals. Please try again.');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  getFestivalById(id: string): Festival | undefined {
    return this.allFestivals().find((festival) => festival.id === id);
  }

  async addFestival(draft: FestivalDraft): Promise<Festival | undefined> {
    const timestamp = new Date().toISOString();
    const festival: Festival = {
      id: crypto.randomUUID(),
      title: draft.title,
      startDate: draft.startDate,
      endDate: draft.endDate,
      ...(draft.imageUrl ? { imageUrl: draft.imageUrl } : {}),
      location: draft.location,
      transportArranged: draft.transportArranged,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    try {
      await this.repository.create(festival);
      this.festivalsSignal.set(sortFestivalsByStartDate([...this.allFestivals(), festival]));

      return festival;
    } catch {
      this.setStorageError();

      return undefined;
    }
  }

  async updateFestival(id: string, draft: FestivalDraft): Promise<Festival | undefined> {
    const existingFestival = this.getFestivalById(id);

    if (!existingFestival) {
      return undefined;
    }

    const updatedFestival: Festival = {
      ...existingFestival,
      ...draft,
      updatedAt: new Date().toISOString(),
    };

    try {
      await this.repository.update(updatedFestival);
      this.festivalsSignal.set(
        sortFestivalsByStartDate(
          this.allFestivals().map((festival) =>
            festival.id === updatedFestival.id ? updatedFestival : festival,
          ),
        ),
      );

      return updatedFestival;
    } catch {
      this.setStorageError();

      return undefined;
    }
  }

  async deleteFestival(id: string): Promise<boolean> {
    try {
      await this.repository.delete(id);
      this.festivalsSignal.set(this.allFestivals().filter((festival) => festival.id !== id));

      return true;
    } catch {
      this.setStorageError();

      return false;
    }
  }

  private setStorageError(): void {
    this.errorSignal.set('We could not save your changes. Please try again.');
  }
}
