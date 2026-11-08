import { getFestivalDayTimeSortValue } from './festival-date.utils';
import { Festival } from './models/festival';
import { FestivalSet } from './models/festival-set';

export interface MustSeeExportSet {
  artist: string;
  day: string;
  startTime: string;
  endTime: string;
  stage: string;
}

export interface MustSeeExport {
  festivalTitle: string;
  sets: readonly MustSeeExportSet[];
}

export function buildMustSeeExport(festival: Festival): MustSeeExport {
  const sets = (festival.lineupSets ?? [])
    .filter((set) => set.isMustSee === true)
    .map(toExportSet)
    .sort(compareExportSets);

  return { festivalTitle: festival.title, sets };
}

export function formatMustSeeText(exportData: MustSeeExport): string {
  const lines = [`My must-sees at ${exportData.festivalTitle}`];
  let previousDay = '';

  for (const set of exportData.sets) {
    if (set.day !== previousDay) {
      lines.push('', formatDay(set.day));
      previousDay = set.day;
    }
    lines.push(`${set.startTime}–${set.endTime}  ${set.artist} — ${set.stage || 'Unassigned stage'}`);
  }

  return lines.join('\n');
}

export function formatMustSeeIcs(exportData: MustSeeExport, exportedAt = new Date()): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Rave Route//Must-see export//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  for (const set of exportData.sets) {
    const uidSource = `${exportData.festivalTitle}|${set.day}|${set.startTime}|${set.endTime}|${set.artist}|${set.stage}`;
    lines.push(
      'BEGIN:VEVENT',
      `UID:${hashForUid(uidSource)}@raveroute`,
      `DTSTAMP:${formatUtcDateTime(exportedAt)}`,
      `DTSTART:${formatFloatingDateTime(set.day, set.startTime)}`,
      `DTEND:${formatFloatingDateTime(set.day, set.endTime, set.startTime)}`,
      `SUMMARY:${escapeIcsText(set.artist)}`,
      ...(set.stage ? [`LOCATION:${escapeIcsText(set.stage)}`] : []),
      `DESCRIPTION:${escapeIcsText(`Must-see at ${exportData.festivalTitle}`)}`,
      'END:VEVENT',
    );
  }

  lines.push('END:VCALENDAR');
  return `${lines.join('\r\n')}\r\n`;
}

function toExportSet(set: FestivalSet): MustSeeExportSet {
  return {
    artist: set.artist,
    day: set.day,
    startTime: set.startTime,
    endTime: set.endTime,
    stage: set.stage,
  };
}

function compareExportSets(first: MustSeeExportSet, second: MustSeeExportSet): number {
  return first.day.localeCompare(second.day)
    || getFestivalDayTimeSortValue(first.startTime) - getFestivalDayTimeSortValue(second.startTime)
    || first.artist.localeCompare(second.artist)
    || first.stage.localeCompare(second.stage);
}

function formatDay(day: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC',
  }).format(new Date(`${day}T00:00:00.000Z`));
}

function formatUtcDateTime(value: Date): string {
  return value.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function formatFloatingDateTime(day: string, time: string, startTime?: string): string {
  const [year, month, date] = day.split('-');
  const [hour, minute] = time.split(':');
  const nextDay = startTime && toMinutes(time) <= toMinutes(startTime);
  const dateValue = new Date(Date.UTC(Number(year), Number(month) - 1, Number(date) + (nextDay ? 1 : 0)));
  const datePart = dateValue.toISOString().slice(0, 10).replace(/-/g, '');
  return `${datePart}T${hour}${minute}00`;
}

function toMinutes(time: string): number {
  const [hour = '0', minute = '0'] = time.split(':');
  return Number(hour) * 60 + Number(minute);
}

function escapeIcsText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\r?\n/g, '\\n');
}

function hashForUid(value: string): string {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}
