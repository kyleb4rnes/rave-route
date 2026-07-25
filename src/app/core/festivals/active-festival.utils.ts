import { Festival } from './models/festival';
import { FestivalSet } from './models/festival-set';

export type ActiveFestivalSchedule = {
  currentSets: readonly FestivalSet[];
  nextSets: readonly FestivalSet[];
};

export function getActiveFestival(
  festivals: readonly Festival[],
  referenceDate = new Date(),
): Festival | undefined {
  const today = toLocalDateKey(referenceDate);

  return [...festivals]
    .filter((festival) => festival.startDate <= today && festival.endDate >= today)
    .sort((firstFestival, secondFestival) => firstFestival.startDate.localeCompare(secondFestival.startDate))[0];
}

export function getActiveFestivalSchedule(
  festival: Festival,
  referenceDate = new Date(),
): ActiveFestivalSchedule {
  const allSets = festival.lineupSets ?? [];
  const currentSets = allSets.filter((set) => isSetPlaying(set, referenceDate));
  const upcomingSets = allSets
    .map((set) => ({ set, startsAt: getSetStart(set) }))
    .filter(({ startsAt }) => startsAt > referenceDate)
    .sort((first, second) => first.startsAt.getTime() - second.startsAt.getTime());
  const nextStart = upcomingSets[0]?.startsAt.getTime();

  return {
    currentSets: sortSetsByPreference(currentSets),
    nextSets: sortSetsByPreference(
      upcomingSets
        .filter(({ startsAt }) => startsAt.getTime() === nextStart)
        .map(({ set }) => set),
    ),
  };
}

function isSetPlaying(set: FestivalSet, referenceDate: Date): boolean {
  const startsAt = getSetStart(set);
  const endsAt = getSetEnd(set, startsAt);

  return startsAt <= referenceDate && referenceDate < endsAt;
}

function getSetStart(set: FestivalSet): Date {
  return new Date(`${set.day}T${set.startTime}:00`);
}

function getSetEnd(set: FestivalSet, startsAt: Date): Date {
  const endsAt = new Date(`${set.day}T${set.endTime}:00`);

  if (endsAt <= startsAt) {
    endsAt.setDate(endsAt.getDate() + 1);
  }

  return endsAt;
}

function sortSetsByPreference(sets: readonly FestivalSet[]): FestivalSet[] {
  return [...sets].sort(
    (firstSet, secondSet) =>
      Number(Boolean(secondSet.isMustSee)) - Number(Boolean(firstSet.isMustSee)) ||
      firstSet.startTime.localeCompare(secondSet.startTime) ||
      firstSet.artist.localeCompare(secondSet.artist),
  );
}

function toLocalDateKey(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
