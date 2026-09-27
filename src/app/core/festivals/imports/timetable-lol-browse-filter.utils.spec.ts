import { TimetableLolPreset } from './timetable-lol-lineup.service';
import {
  countActiveBrowseFilters,
  defaultTimetableLolBrowseFilters,
  filterTimetableLolPresets,
  formatCountry,
  getCities,
  getCountries,
} from './timetable-lol-browse-filter.utils';

const presets: TimetableLolPreset[] = [
  createPreset('one-day-nl', 'One Day NL', '2026-10-10', '2026-10-10', 'NL', 'Amsterdam'),
  createPreset('weekend-nl', 'Weekend NL', '2027-01-15', '2027-01-17', 'NL', 'Rotterdam'),
  createPreset('weekend-uk', 'Weekend UK', '2027-08-20', '2027-08-22', 'UK', 'London'),
];

describe('Timetable.lol browse filters', () => {
  it('returns every preset when no filters or search are applied', () => {
    expect(filterTimetableLolPresets(presets, '', defaultTimetableLolBrowseFilters, new Date(2026, 8, 27))).toEqual(
      presets,
    );
  });

  it('combines search, location, and duration filters', () => {
    const result = filterTimetableLolPresets(
      presets,
      'weekend',
      { country: 'NL', city: 'Rotterdam', dateRange: 'all', duration: 'multi-day' },
      new Date(2026, 8, 27),
    );

    expect(result.map((preset) => preset.eventSlug)).toEqual(['weekend-nl']);
  });

  it('supports broad upcoming date windows', () => {
    const result = filterTimetableLolPresets(
      presets,
      '',
      { ...defaultTimetableLolBrowseFilters, dateRange: 'next-6-months' },
      new Date(2026, 8, 27),
    );

    expect(result.map((preset) => preset.eventSlug)).toEqual(['one-day-nl', 'weekend-nl']);
  });

  it('derives sorted location options and counts active selections', () => {
    expect(getCountries(presets)).toEqual(['NL', 'UK']);
    expect(getCities(presets, 'NL')).toEqual(['Amsterdam', 'Rotterdam']);
    expect(
      countActiveBrowseFilters({ country: 'NL', city: '', dateRange: 'upcoming', duration: 'all' }),
    ).toBe(2);
  });

  it('formats ISO country codes for display while preserving unknown values', () => {
    expect(formatCountry('NL')).toBe('Netherlands');
    expect(formatCountry('GB')).toBe('United Kingdom');
    expect(formatCountry('Unknown country')).toBe('Unknown country');
  });
});

function createPreset(
  eventSlug: string,
  label: string,
  startDate: string,
  endDate: string,
  country: string,
  city: string,
): TimetableLolPreset {
  return {
    id: `timetable-lol:${eventSlug}`,
    provider: 'timetable-lol',
    eventSlug,
    label,
    detail: '1 published set',
    startDate,
    endDate,
    sourceLabel: 'Timetable.lol community timetable',
    sourceUrl: `https://example.com/${eventSlug}`,
    setCount: 1,
    location: {
      displayName: `${city}, ${country}`,
      city,
      country,
      precision: 'city',
      source: 'Timetable.lol API',
      verifiedAt: '2026-09-27T00:00:00.000Z',
    },
  };
}
