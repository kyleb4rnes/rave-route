import { Injectable } from '@angular/core';

import { environment } from '../../../../environments/environment';
import {
  Festival,
  FestivalGenre,
  FestivalLineupStatus,
  FestivalLocation,
  FestivalTicketLinks,
} from '../models/festival';
import { FestivalSetImport } from '../models/festival-set';
import { LineupImportPreset } from './lineup-import-preset';

export interface TimetableLolPreset extends LineupImportPreset {
  provider: 'timetable-lol';
  eventSlug: string;
  location?: FestivalLocation;
  imageUrl?: string;
  ticketLinks?: FestivalTicketLinks;
  lineupStatus: FestivalLineupStatus;
  sourceGenres: readonly string[];
  genres: readonly FestivalGenre[];
}

interface TimetableLolCatalogue {
  generatedAt?: unknown;
  events?: readonly TimetableLolCatalogueEvent[];
}

interface RecognisedTimetableLolCatalogue extends TimetableLolCatalogue {
  events: readonly TimetableLolCatalogueEvent[];
}

interface TimetableLolCatalogueEvent {
  eventSlug: string;
  title: string;
  startDate: string;
  endDate: string;
  sourceUrl: string;
  location?: FestivalLocation;
  imageUrl?: string;
  tickets?: FestivalTicketLinks;
  lineupStatus?: FestivalLineupStatus;
  sourceGenres?: string[];
  genres?: FestivalGenre[];
  sets: TimetableLolCatalogueSet[];
}

interface TimetableLolCatalogueSet {
  performanceId: string;
  artist: string;
  day: string;
  startTime: string;
  endTime: string;
  stage: string;
}

@Injectable({ providedIn: 'root' })
export class TimetableLolLineupService {
  private catalogue: readonly TimetableLolCatalogueEvent[] | null = null;
  private catalogueGeneratedAt: string | null = null;

  async loadPresets(): Promise<TimetableLolPreset[]> {
    const events = await this.loadCatalogue();

    return events
      .map((event) => ({
        id: `timetable-lol:${event.eventSlug}`,
        provider: 'timetable-lol' as const,
        sourceLabel: 'Timetable.lol community timetable',
        label: event.title,
        detail: getLineupAvailabilityLabel(getLineupStatus(event), event.sets.length),
        startDate: event.startDate,
        endDate: event.endDate,
        sourceUrl: event.sourceUrl,
        setCount: event.sets.length,
        lineupStatus: getLineupStatus(event),
        sourceGenres: event.sourceGenres ?? [],
        genres: event.genres ?? [],
        eventSlug: event.eventSlug,
        ...(event.location ? { location: event.location } : {}),
        ...(event.imageUrl ? { imageUrl: event.imageUrl } : {}),
        ...(event.tickets ? { ticketLinks: event.tickets } : {}),
      }))
      .sort((firstPreset, secondPreset) =>
        firstPreset.startDate.localeCompare(secondPreset.startDate) || firstPreset.label.localeCompare(secondPreset.label),
      );
  }

  async getCatalogueGeneratedAt(): Promise<string | null> {
    await this.loadCatalogue();
    return this.catalogueGeneratedAt;
  }

  async loadSets(preset: TimetableLolPreset, festival: Festival): Promise<FestivalSetImport[]> {
    return this.loadPresetSets(preset, getFestivalDays(festival));
  }

  async loadAllSets(preset: TimetableLolPreset): Promise<FestivalSetImport[]> {
    return this.loadPresetSets(preset);
  }

  private async loadPresetSets(
    preset: TimetableLolPreset,
    festivalDays?: readonly string[],
  ): Promise<FestivalSetImport[]> {
    const event = (await this.loadCatalogue()).find((catalogueEvent) => catalogueEvent.eventSlug === preset.eventSlug);

    if (!event) {
      throw new Error('The selected community timetable could not be found.');
    }

    const importedAt = new Date().toISOString();

    return event.sets
      .filter((set) => !festivalDays || festivalDays.includes(set.day))
      .map((set) => ({
        artist: set.artist,
        day: set.day,
        startTime: set.startTime,
        endTime: set.endTime,
        stage: set.stage,
        source: {
          provider: 'timetable-lol' as const,
          performanceId: set.performanceId,
          sourceUrl: event.sourceUrl,
          importedAt,
        },
      }));
  }

  private async loadCatalogue(): Promise<readonly TimetableLolCatalogueEvent[]> {
    if (this.catalogue) {
      return this.catalogue;
    }

    const catalogue = await fetchFirstRecognisedCatalogue(getCatalogueSourceUrls());
    const events = catalogue.events;

    this.catalogue = events;
    this.catalogueGeneratedAt = typeof catalogue.generatedAt === 'string' ? catalogue.generatedAt : null;

    return this.catalogue;
  }
}

async function fetchFirstRecognisedCatalogue(sourceUrls: readonly string[]): Promise<RecognisedTimetableLolCatalogue> {
  for (const sourceUrl of sourceUrls) {
    try {
      const response = await fetch(sourceUrl);

      if (!response.ok) {
        continue;
      }

      const data: unknown = await response.json();
      const catalogue = data as TimetableLolCatalogue;
      const events = catalogue.events;

      if (Array.isArray(events) && events.every(isTimetableLolCatalogueEvent)) {
        return { ...catalogue, events };
      }
    } catch {
      continue;
    }
  }

  throw new Error('The community timetable could not be reached.');
}

function getCatalogueSourceUrls(): string[] {
  const configuredUrls = [
    environment.timetableLolCatalogue.remoteUrl,
    environment.timetableLolCatalogue.bundledUrl,
  ].filter((sourceUrl): sourceUrl is string => typeof sourceUrl === 'string' && sourceUrl.length > 0);

  return [...new Set(configuredUrls)];
}

export function getLineupAvailabilityLabel(
  status: FestivalLineupStatus,
  setCount: number,
): string {
  if (status === 'lineup-announced') {
    return 'Line-up announced · set times coming soon';
  }

  if (status === 'not-released' || setCount === 0) {
    return 'Set times not released yet';
  }

  return `${setCount} published ${setCount === 1 ? 'set' : 'sets'}`;
}

function getLineupStatus(event: TimetableLolCatalogueEvent): FestivalLineupStatus {
  if (event.lineupStatus === 'lineup-announced' || event.lineupStatus === 'not-released') {
    return event.lineupStatus;
  }

  return event.sets.length > 0 ? 'published' : 'not-released';
}

function isTimetableLolCatalogueEvent(value: unknown): value is TimetableLolCatalogueEvent {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const event = value as Partial<TimetableLolCatalogueEvent>;

  return (
    typeof event.eventSlug === 'string' &&
    typeof event.title === 'string' &&
    typeof event.startDate === 'string' &&
    typeof event.endDate === 'string' &&
    typeof event.sourceUrl === 'string' &&
    Array.isArray(event.sets) &&
    event.sets.every(isTimetableLolCatalogueSet)
  );
}

function isTimetableLolCatalogueSet(value: unknown): value is TimetableLolCatalogueSet {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const set = value as Partial<TimetableLolCatalogueSet>;

  return (
    typeof set.performanceId === 'string' &&
    typeof set.artist === 'string' &&
    typeof set.day === 'string' &&
    typeof set.startTime === 'string' &&
    typeof set.endTime === 'string' &&
    typeof set.stage === 'string'
  );
}

function getFestivalDays(festival: Festival): string[] {
  const days: string[] = [];
  const finalDate = new Date(`${festival.endDate}T00:00:00.000Z`);
  const currentDate = new Date(`${festival.startDate}T00:00:00.000Z`);

  while (currentDate <= finalDate) {
    days.push(currentDate.toISOString().slice(0, 10));
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return days;
}
