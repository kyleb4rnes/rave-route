import { Injectable } from '@angular/core';

import { Festival } from '../models/festival';
import { FestivalSetImport } from '../models/festival-set';
import { LineupImportPreset, isLineupImportPresetCompatible } from './lineup-import-preset';

export type TomorrowlandPresetId =
  | 'tomorrowland-belgium-2026-weekend-1'
  | 'tomorrowland-belgium-2026-weekend-2';

export interface TomorrowlandPreset extends LineupImportPreset {
  id: TomorrowlandPresetId;
  provider: 'tomorrowland';
  weekend: string;
}

interface TomorrowlandPerformance {
  id: string;
  name: string;
  stage: { name: string };
  date: string;
  startTime: string;
  endTime: string;
}

interface TomorrowlandResponse {
  performances?: unknown;
}

export const TOMORROWLAND_PRESETS: readonly TomorrowlandPreset[] = [
  {
    id: 'tomorrowland-belgium-2026-weekend-1',
    provider: 'tomorrowland',
    sourceLabel: 'Official Tomorrowland timetable',
    label: 'Tomorrowland Belgium 2026',
    weekend: 'Weekend 1',
    detail: 'Weekend 1',
    startDate: '2026-07-16',
    endDate: '2026-07-19',
    sourceUrl: 'https://artist-lineup-cdn.tomorrowland.com/TL26BE-W1-9205196e-3eef-45c0-a82e-72aa1bb3cf8f.json',
  },
  {
    id: 'tomorrowland-belgium-2026-weekend-2',
    provider: 'tomorrowland',
    sourceLabel: 'Official Tomorrowland timetable',
    label: 'Tomorrowland Belgium 2026',
    weekend: 'Weekend 2',
    detail: 'Weekend 2',
    startDate: '2026-07-23',
    endDate: '2026-07-26',
    sourceUrl: 'https://artist-lineup-cdn.tomorrowland.com/TL26BE-W2-9205196e-3eef-45c0-a82e-72aa1bb3cf8f.json',
  },
];

@Injectable({ providedIn: 'root' })
export class TomorrowlandLineupService {
  async loadSets(preset: TomorrowlandPreset, festival: Festival): Promise<FestivalSetImport[]> {
    const response = await fetch(preset.sourceUrl);

    if (!response.ok) {
      throw new Error('The official timetable could not be reached.');
    }

    const data: unknown = await response.json();
    const festivalDays = getFestivalDays(festival);

    return mapTomorrowlandPerformances(data, preset.sourceUrl, festivalDays);
  }
}

export function isTomorrowlandPresetCompatible(
  preset: TomorrowlandPreset,
  festival: Festival,
): boolean {
  return isLineupImportPresetCompatible(preset, festival.startDate, festival.endDate);
}

export function mapTomorrowlandPerformances(
  data: unknown,
  sourceUrl: string,
  festivalDays: readonly string[],
  importedAt = new Date().toISOString(),
): FestivalSetImport[] {
  const performances = (data as TomorrowlandResponse).performances;

  if (!Array.isArray(performances)) {
    throw new Error('The official timetable format was not recognised.');
  }

  const sets: FestivalSetImport[] = [];

  for (const performance of performances) {
    if (!isValidPerformance(performance) || !festivalDays.includes(performance.date)) {
      continue;
    }

    sets.push({
      artist: performance.name.trim(),
      day: performance.date,
      startTime: performance.startTime.slice(11, 16),
      endTime: performance.endTime.slice(11, 16),
      stage: performance.stage.name.trim(),
      source: {
        provider: 'tomorrowland',
        performanceId: performance.id,
        sourceUrl,
        importedAt,
      },
    });
  }

  return sets;
}

function isValidPerformance(performance: unknown): performance is TomorrowlandPerformance {
  if (!performance || typeof performance !== 'object') {
    return false;
  }

  const value = performance as TomorrowlandPerformance;

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.date === 'string' &&
    typeof value.startTime === 'string' &&
    typeof value.endTime === 'string' &&
    typeof value.stage?.name === 'string'
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
