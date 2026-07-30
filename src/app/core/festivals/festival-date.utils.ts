import { Festival } from './models/festival';

const millisecondsPerDay = 24 * 60 * 60 * 1000;
const festivalDayRolloverMinutes = 6 * 60;

export function sortFestivalsByStartDate(festivals: readonly Festival[]): Festival[] {
  return [...festivals].sort(
    (firstFestival, secondFestival) =>
      toUtcStartOfDay(firstFestival.startDate).getTime() -
      toUtcStartOfDay(secondFestival.startDate).getTime(),
  );
}

export function getUpcomingFestivals(
  festivals: readonly Festival[],
  referenceDate = new Date(),
): Festival[] {
  const today = toUtcStartOfDay(referenceDate);

  return sortFestivalsByStartDate(festivals).filter(
    (festival) => toUtcStartOfDay(festival.endDate).getTime() >= today.getTime(),
  );
}

export function getPastFestivals(
  festivals: readonly Festival[],
  referenceDate = new Date(),
): Festival[] {
  const today = toUtcStartOfDay(referenceDate);

  return sortFestivalsByStartDate(festivals).filter(
    (festival) => toUtcStartOfDay(festival.endDate).getTime() < today.getTime(),
  );
}

export function getNextFestival(
  festivals: readonly Festival[],
  referenceDate = new Date(),
): Festival | undefined {
  return getUpcomingFestivals(festivals, referenceDate)[0];
}

export function calculateDaysRemaining(startDate: string, referenceDate = new Date()): number {
  const start = toUtcStartOfDay(startDate).getTime();
  const today = toUtcStartOfDay(referenceDate).getTime();

  return Math.max(0, Math.ceil((start - today) / millisecondsPerDay));
}

export function getFestivalDays(festival: Festival): string[] {
  const days: string[] = [];
  const endDate = toUtcStartOfDay(festival.endDate);
  const currentDate = toUtcStartOfDay(festival.startDate);

  while (currentDate <= endDate) {
    days.push(currentDate.toISOString().slice(0, 10));
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return days;
}

export function getDefaultLineupDay(festival: Festival, referenceDate = new Date()): string {
  const today = toLocalDateKey(referenceDate);

  return today >= festival.startDate && today <= festival.endDate ? today : festival.startDate;
}

/**
 * Festival days commonly run through the following morning. Keep overnight sets
 * on their source day, but place anything before 06:00 after the evening schedule.
 */
export function getFestivalDayTimeSortValue(time: string): number {
  const [hourPart = '0', minutePart = '0'] = time.split(':');
  const minutes = Number(hourPart) * 60 + Number(minutePart);

  return minutes < festivalDayRolloverMinutes ? minutes + millisecondsPerDay / 60 : minutes;
}

function toLocalDateKey(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function toUtcStartOfDay(value: string | Date): Date {
  if (typeof value === 'string') {
    return new Date(`${value}T00:00:00.000Z`);
  }

  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}
