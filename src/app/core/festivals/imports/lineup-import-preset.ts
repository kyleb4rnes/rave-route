export type LineupImportProvider = 'tomorrowland' | 'timetable-lol';

export interface LineupImportPreset {
  id: string;
  provider: LineupImportProvider;
  sourceLabel: string;
  label: string;
  detail: string;
  startDate: string;
  endDate: string;
  sourceUrl: string;
  setCount?: number;
}

export function isLineupImportPresetCompatible(
  preset: LineupImportPreset,
  festivalStartDate: string,
  festivalEndDate: string,
): boolean {
  return festivalStartDate <= preset.endDate && festivalEndDate >= preset.startDate;
}
