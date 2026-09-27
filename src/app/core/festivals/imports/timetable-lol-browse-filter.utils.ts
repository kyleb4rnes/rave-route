import { TimetableLolPreset } from './timetable-lol-lineup.service';

export type BrowseDateRange = 'all' | 'upcoming' | 'next-3-months' | 'next-6-months' | 'this-year';
export type BrowseDuration = 'all' | 'one-day' | 'multi-day';

export interface TimetableLolBrowseFilters {
  country: string;
  city: string;
  dateRange: BrowseDateRange;
  duration: BrowseDuration;
}

export const defaultTimetableLolBrowseFilters: TimetableLolBrowseFilters = {
  country: '',
  city: '',
  dateRange: 'all',
  duration: 'all',
};

export function filterTimetableLolPresets(
  presets: readonly TimetableLolPreset[],
  searchTerm: string,
  filters: TimetableLolBrowseFilters,
  today = new Date(),
): TimetableLolPreset[] {
  const query = searchTerm.trim().toLocaleLowerCase();
  const todayDate = toLocalIsoDate(today);
  const dateLimit = getDateLimit(filters.dateRange, today);

  return presets.filter((preset) => {
    const matchesSearch =
      !query || preset.label.toLocaleLowerCase().includes(query) || preset.startDate.includes(query);
    const matchesCountry = !filters.country || preset.location?.country === filters.country;
    const matchesCity = !filters.city || preset.location?.city === filters.city;
    const matchesDuration =
      filters.duration === 'all' ||
      (filters.duration === 'one-day' && preset.startDate === preset.endDate) ||
      (filters.duration === 'multi-day' && preset.startDate !== preset.endDate);
    const matchesDate =
      filters.dateRange === 'all' ||
      (filters.dateRange === 'upcoming' && preset.endDate >= todayDate) ||
      (filters.dateRange === 'this-year' &&
        preset.endDate >= todayDate &&
        preset.startDate.slice(0, 4) === todayDate.slice(0, 4)) ||
      (dateLimit !== null && preset.endDate >= todayDate && preset.startDate <= dateLimit);

    return matchesSearch && matchesCountry && matchesCity && matchesDuration && matchesDate;
  });
}

export function getCountries(presets: readonly TimetableLolPreset[]): string[] {
  return uniqueSorted(presets.map((preset) => preset.location?.country));
}

/** Keeps ISO country codes as filter values while presenting a friendly label in the UI. */
export function formatCountry(country: string): string {
  if (!/^[a-z]{2}$/i.test(country) || typeof Intl.DisplayNames !== 'function') {
    return country;
  }

  return new Intl.DisplayNames(['en-GB'], { type: 'region' }).of(country.toUpperCase()) ?? country;
}

export function getCities(presets: readonly TimetableLolPreset[], country: string): string[] {
  return uniqueSorted(
    presets
      .filter((preset) => !country || preset.location?.country === country)
      .map((preset) => preset.location?.city),
  );
}

export function countActiveBrowseFilters(filters: TimetableLolBrowseFilters): number {
  return [filters.country, filters.city, filters.dateRange !== 'all', filters.duration !== 'all'].filter(Boolean).length;
}

function getDateLimit(dateRange: BrowseDateRange, today: Date): string | null {
  const months = dateRange === 'next-3-months' ? 3 : dateRange === 'next-6-months' ? 6 : null;

  if (months === null) {
    return null;
  }

  const limit = new Date(today.getFullYear(), today.getMonth() + months, today.getDate());
  return toLocalIsoDate(limit);
}

function toLocalIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function uniqueSorted(values: readonly (string | undefined)[]): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))].sort((first, second) =>
    first.localeCompare(second),
  );
}
