import { Injectable } from '@angular/core';

import { Festival, FestivalLocation, FestivalTicketLinks } from '../models/festival';
import { FestivalSetImport } from '../models/festival-set';
import { LineupImportPreset } from './lineup-import-preset';

const timetableLolAssetUrl = 'assets/timetables/timetable-lol-catalogue.json';

export interface TimetableLolPreset extends LineupImportPreset {
  provider: 'timetable-lol';
  eventSlug: string;
  location?: FestivalLocation;
  imageUrl?: string;
  ticketLinks?: FestivalTicketLinks;
}

interface TimetableLolCatalogue {
  events?: unknown;
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

  async loadPresets(): Promise<TimetableLolPreset[]> {
    const events = await this.loadCatalogue();

    return events
      .map((event) => ({
        id: `timetable-lol:${event.eventSlug}`,
        provider: 'timetable-lol' as const,
        sourceLabel: 'Timetable.lol community timetable',
        label: event.title,
        detail: `${event.sets.length} published sets`,
        startDate: event.startDate,
        endDate: event.endDate,
        sourceUrl: event.sourceUrl,
        setCount: event.sets.length,
        eventSlug: event.eventSlug,
        ...(event.location ? { location: event.location } : {}),
        ...(event.imageUrl ? { imageUrl: event.imageUrl } : {}),
        ...(event.tickets ? { ticketLinks: event.tickets } : {}),
      }))
      .sort((firstPreset, secondPreset) =>
        firstPreset.startDate.localeCompare(secondPreset.startDate) || firstPreset.label.localeCompare(secondPreset.label),
      );
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

    const response = await fetch(timetableLolAssetUrl);

    if (!response.ok) {
      throw new Error('The community timetable could not be reached.');
    }

    const data: unknown = await response.json();
    const events = (data as TimetableLolCatalogue).events;

    if (!Array.isArray(events) || !events.every(isTimetableLolCatalogueEvent)) {
      throw new Error('The community timetable format was not recognised.');
    }

    this.catalogue = events;

    return this.catalogue;
  }
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
