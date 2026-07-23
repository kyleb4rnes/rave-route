import { Injectable } from '@angular/core';

import { Festival } from '../models/festival';
import { FestivalSetImport } from '../models/festival-set';
import { LineupImportPreset } from './lineup-import-preset';

const timetableLolSourceUrl = 'https://timetable.lol/data/artist-act-index.json?v=20260710-artist-bookings-refresh';
const timetableLolAssetUrl = 'assets/timetables/timetable-lol-artist-act-index.json';

export interface TimetableLolPreset extends LineupImportPreset {
  provider: 'timetable-lol';
  eventSlug: string;
}

interface TimetableLolAct {
  eventSlug: string;
  eventTitle: string;
  eventDate: string;
  label: string;
  start: string;
  end: string;
  stage: string;
}

interface TimetableLolIndex {
  actsBySetKey?: unknown;
}

@Injectable({ providedIn: 'root' })
export class TimetableLolLineupService {
  private index: Record<string, unknown> | null = null;

  async loadPresets(): Promise<TimetableLolPreset[]> {
    const index = await this.loadIndex();
    const events = new Map<string, { title: string; startDate: string; endDate: string; setCount: number }>();

    for (const value of Object.keys(index)) {
      const act = index[value];

      if (!isTimetableLolAct(act)) {
        continue;
      }

      const existing = events.get(act.eventSlug);

      events.set(act.eventSlug, {
        title: act.eventTitle,
        startDate: existing?.startDate && existing.startDate < act.eventDate ? existing.startDate : act.eventDate,
        endDate: existing?.endDate && existing.endDate > act.eventDate ? existing.endDate : act.eventDate,
        setCount: (existing?.setCount ?? 0) + 1,
      });
    }

    return [...events.entries()]
      .map(([eventSlug, event]) => ({
        id: `timetable-lol:${eventSlug}`,
        provider: 'timetable-lol' as const,
        sourceLabel: 'Timetable.lol community timetable',
        label: event.title,
        detail: `${event.setCount} published sets`,
        startDate: event.startDate,
        endDate: event.endDate,
        sourceUrl: timetableLolSourceUrl,
        setCount: event.setCount,
        eventSlug,
      }))
      .sort((firstPreset, secondPreset) =>
        firstPreset.startDate.localeCompare(secondPreset.startDate) || firstPreset.label.localeCompare(secondPreset.label),
      );
  }

  async loadSets(preset: TimetableLolPreset, festival: Festival): Promise<FestivalSetImport[]> {
    const index = await this.loadIndex();
    const festivalDays = getFestivalDays(festival);
    const importedAt = new Date().toISOString();
    const sets: FestivalSetImport[] = [];

    for (const [setKey, value] of Object.entries(index)) {
      if (!isTimetableLolAct(value) || value.eventSlug !== preset.eventSlug || !festivalDays.includes(value.eventDate)) {
        continue;
      }

      sets.push({
        artist: value.label.trim(),
        day: value.eventDate,
        startTime: value.start.slice(0, 5),
        endTime: value.end.slice(0, 5),
        stage: value.stage.trim(),
        source: {
          provider: 'timetable-lol',
          performanceId: setKey,
          sourceUrl: timetableLolSourceUrl,
          importedAt,
        },
      });
    }

    return sets;
  }

  private async loadIndex(): Promise<Record<string, unknown>> {
    if (this.index) {
      return this.index;
    }

    const response = await fetch(timetableLolAssetUrl);

    if (!response.ok) {
      throw new Error('The community timetable could not be reached.');
    }

    const data: unknown = await response.json();
    const actsBySetKey = (data as TimetableLolIndex).actsBySetKey;

    if (!actsBySetKey || typeof actsBySetKey !== 'object' || Array.isArray(actsBySetKey)) {
      throw new Error('The community timetable format was not recognised.');
    }

    this.index = actsBySetKey as Record<string, unknown>;

    return this.index;
  }
}

function isTimetableLolAct(value: unknown): value is Required<TimetableLolAct> {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const act = value as Partial<TimetableLolAct>;

  return (
    typeof act.eventSlug === 'string' &&
    typeof act.eventTitle === 'string' &&
    typeof act.eventDate === 'string' &&
    typeof act.label === 'string' &&
    typeof act.start === 'string' &&
    typeof act.end === 'string' &&
    typeof act.stage === 'string'
  );
}

function getFestivalDays(festival: Festival): string[] {
  const days: string[] = [];
  const endDate = new Date(`${festival.endDate}T00:00:00.000Z`);
  const currentDate = new Date(`${festival.startDate}T00:00:00.000Z`);

  while (currentDate <= endDate) {
    days.push(currentDate.toISOString().slice(0, 10));
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return days;
}
