export interface FestivalSet {
  id: string;
  artist: string;
  day: string;
  startTime: string;
  endTime: string;
  stage: string;
  isMustSee?: boolean;
  source?: FestivalSetSource;
}

export interface FestivalSetDraft {
  artist: string;
  day: string;
  startTime: string;
  endTime: string;
  stage: string;
}

export interface FestivalSetSource {
  provider: 'tomorrowland' | 'timetable-lol';
  performanceId: string;
  sourceUrl: string;
  importedAt: string;
}

export interface FestivalSetImport {
  artist: string;
  day: string;
  startTime: string;
  endTime: string;
  stage: string;
  source: FestivalSetSource;
}

export interface LineupImportSummary {
  added: number;
  updated: number;
  skipped: number;
}
