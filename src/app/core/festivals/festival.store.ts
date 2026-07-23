import { computed, inject, Injectable, signal } from '@angular/core';

import {
  getNextFestival,
  getPastFestivals,
  getUpcomingFestivals,
  sortFestivalsByStartDate,
} from './festival-date.utils';
import { FestivalDraft } from './models/festival-draft';
import { Festival } from './models/festival';
import { FestivalSet, FestivalSetDraft, FestivalSetImport, LineupImportSummary } from './models/festival-set';
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
      accommodationArranged: draft.accommodationArranged,
      lineupSets: [],
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

  async addLineupSet(festivalId: string, draft: FestivalSetDraft): Promise<boolean> {
    const festival = this.getFestivalById(festivalId);

    if (!festival) {
      return false;
    }

    const updatedFestival: Festival = {
      ...festival,
      lineupSets: [
        ...(festival.lineupSets ?? []),
        {
          id: crypto.randomUUID(),
          artist: draft.artist.trim(),
          day: draft.day,
          startTime: draft.startTime,
          endTime: draft.endTime,
          stage: draft.stage.trim(),
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    try {
      await this.repository.update(updatedFestival);
      this.festivalsSignal.set(
        this.allFestivals().map((existingFestival) =>
          existingFestival.id === festivalId ? updatedFestival : existingFestival,
        ),
      );

      return true;
    } catch {
      this.setStorageError();

      return false;
    }
  }

  async deleteLineupSet(festivalId: string, setId: string): Promise<boolean> {
    const festival = this.getFestivalById(festivalId);

    if (!festival) {
      return false;
    }

    const updatedFestival: Festival = {
      ...festival,
      lineupSets: (festival.lineupSets ?? []).filter((set) => set.id !== setId),
      updatedAt: new Date().toISOString(),
    };

    try {
      await this.repository.update(updatedFestival);
      this.festivalsSignal.set(
        this.allFestivals().map((existingFestival) =>
          existingFestival.id === festivalId ? updatedFestival : existingFestival,
        ),
      );

      return true;
    } catch {
      this.setStorageError();

      return false;
    }
  }

  async setLineupSetMustSee(festivalId: string, setId: string, isMustSee: boolean): Promise<boolean> {
    const festival = this.getFestivalById(festivalId);

    if (!festival || !(festival.lineupSets ?? []).some((set) => set.id === setId)) {
      return false;
    }

    const updatedFestival: Festival = {
      ...festival,
      lineupSets: (festival.lineupSets ?? []).map((set) =>
        set.id === setId ? { ...set, isMustSee } : set,
      ),
      updatedAt: new Date().toISOString(),
    };

    try {
      await this.repository.update(updatedFestival);
      this.festivalsSignal.set(
        this.allFestivals().map((existingFestival) =>
          existingFestival.id === festivalId ? updatedFestival : existingFestival,
        ),
      );

      return true;
    } catch {
      this.setStorageError();

      return false;
    }
  }

  async updateLineupSet(
    festivalId: string,
    setId: string,
    draft: FestivalSetDraft,
  ): Promise<boolean> {
    const festival = this.getFestivalById(festivalId);

    if (!festival || !(festival.lineupSets ?? []).some((set) => set.id === setId)) {
      return false;
    }

    const updatedFestival: Festival = {
      ...festival,
      lineupSets: (festival.lineupSets ?? []).map((set) =>
        set.id === setId
          ? {
              ...set,
              artist: draft.artist.trim(),
              day: draft.day,
              startTime: draft.startTime,
              endTime: draft.endTime,
              stage: draft.stage.trim(),
            }
          : set,
      ),
      updatedAt: new Date().toISOString(),
    };

    try {
      await this.repository.update(updatedFestival);
      this.festivalsSignal.set(
        this.allFestivals().map((existingFestival) =>
          existingFestival.id === festivalId ? updatedFestival : existingFestival,
        ),
      );

      return true;
    } catch {
      this.setStorageError();

      return false;
    }
  }

  async importLineupSets(
    festivalId: string,
    importedSets: readonly FestivalSetImport[],
  ): Promise<LineupImportSummary | undefined> {
    const festival = this.getFestivalById(festivalId);

    if (!festival) {
      return undefined;
    }

    const currentSets = festival.lineupSets ?? [];
    const importedBySource = new Map(
      importedSets.map((set) => [getSourceKey(set.source.provider, set.source.performanceId), set]),
    );
    const existingSourceKeys = new Set<string>();

    for (const set of currentSets) {
      if (set.source) {
        existingSourceKeys.add(getSourceKey(set.source.provider, set.source.performanceId));
      }
    }
    const existingManualSignatures = new Set(
      currentSets.filter((set) => !set.source).map((set) => getSetSignature(set)),
    );
    let added = 0;
    let updated = 0;
    let skipped = 0;

    const refreshedSets = currentSets.map((set) => {
      if (!set.source) {
        return set;
      }

      const importedSet = importedBySource.get(
        getSourceKey(set.source.provider, set.source.performanceId),
      );

      if (!importedSet) {
        return set;
      }

      updated += 1;

      return toFestivalSet(importedSet, set.id);
    });

    for (const importedSet of importedSets) {
      const sourceKey = getSourceKey(importedSet.source.provider, importedSet.source.performanceId);

      if (existingSourceKeys.has(sourceKey)) {
        continue;
      }

      if (existingManualSignatures.has(getSetSignature(importedSet))) {
        skipped += 1;

        continue;
      }

      refreshedSets.push(toFestivalSet(importedSet));
      added += 1;
    }

    const updatedFestival: Festival = {
      ...festival,
      lineupSets: refreshedSets,
      updatedAt: new Date().toISOString(),
    };

    try {
      await this.repository.update(updatedFestival);
      this.festivalsSignal.set(
        this.allFestivals().map((existingFestival) =>
          existingFestival.id === festivalId ? updatedFestival : existingFestival,
        ),
      );

      return { added, updated, skipped };
    } catch {
      this.setStorageError();

      return undefined;
    }
  }

  private setStorageError(): void {
    this.errorSignal.set('We could not save your changes. Please try again.');
  }
}

function toFestivalSet(importedSet: FestivalSetImport, id: string = crypto.randomUUID()): FestivalSet {
  return {
    id,
    artist: importedSet.artist.trim(),
    day: importedSet.day,
    startTime: importedSet.startTime,
    endTime: importedSet.endTime,
    stage: importedSet.stage.trim(),
    source: importedSet.source,
  };
}

function getSourceKey(provider: string, performanceId: string): string {
  return `${provider}:${performanceId}`;
}

function getSetSignature(set: Pick<FestivalSet, 'artist' | 'day' | 'startTime' | 'endTime' | 'stage'>): string {
  return [set.artist.trim().toLocaleLowerCase(), set.day, set.startTime, set.endTime, set.stage.trim().toLocaleLowerCase()].join('|');
}
