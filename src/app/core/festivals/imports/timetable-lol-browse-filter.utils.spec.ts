import { TimetableLolPreset } from './timetable-lol-lineup.service';
import {
  countActiveBrowseFilters,
  defaultTimetableLolBrowseFilters,
  filterTimetableLolPresets,
  formatBrowseLocation,
  formatCountry,
  getCities,
  getCountries,
  getCurrentAndFuturePresets,
  getGenres,
  getPastPresets,
} from './timetable-lol-browse-filter.utils';

const presets: TimetableLolPreset[] = [
  createPreset('older-past-nl', 'Older Past NL', '2026-06-12', '2026-06-14', 'NL', 'Amsterdam'),
  createPreset('past-uk', 'Past UK', '2026-08-20', '2026-08-22', 'UK', 'London'),
  createPreset('one-day-nl', 'One Day NL', '2026-10-10', '2026-10-10', 'NL', 'Amsterdam'),
  createPreset('weekend-nl', 'Weekend NL', '2027-01-15', '2027-01-17', 'NL', 'Rotterdam'),
  createPreset('weekend-uk', 'Weekend UK', '2027-08-20', '2027-08-22', 'UK', 'London'),
];

describe('Timetable.lol browse filters', () => {
  it('returns every matching preset before visibility is split by date', () => {
    expect(filterTimetableLolPresets(presets, '', defaultTimetableLolBrowseFilters, new Date(2026, 8, 27))).toEqual(
      presets,
    );
  });

  it('combines search, location, and duration filters', () => {
    const result = filterTimetableLolPresets(
      presets,
      'weekend',
      { country: 'NL', city: 'Rotterdam', genre: '', dateRange: 'all', duration: 'multi-day' },
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

  it('separates current and future festivals from past festivals', () => {
    const today = new Date(2026, 8, 27);

    expect(getCurrentAndFuturePresets(presets, today).map((preset) => preset.eventSlug)).toEqual([
      'one-day-nl',
      'weekend-nl',
      'weekend-uk',
    ]);
    expect(getPastPresets(presets, today).map((preset) => preset.eventSlug)).toEqual([
      'older-past-nl',
      'past-uk',
    ]);
  });

  it('derives sorted location options and counts active selections', () => {
    expect(getCountries(presets)).toEqual(['NL', 'UK']);
    expect(getCities(presets, 'NL')).toEqual(['Amsterdam', 'Rotterdam']);
    expect(
      countActiveBrowseFilters({ country: 'NL', city: '', genre: '', dateRange: 'upcoming', duration: 'all' }),
    ).toBe(2);
  });

  it('filters by a mapped genre and exposes only available genre options', () => {
    const genrePresets = presets.map((preset, index) => ({
      ...preset,
      genres: index === 2 ? ['Hardstyle' as const] : index === 3 ? ['Hardstyle' as const, 'Hardcore' as const] : [],
    }));

    const result = filterTimetableLolPresets(
      genrePresets,
      '',
      { ...defaultTimetableLolBrowseFilters, genre: 'Hardcore' },
      new Date(2026, 8, 27),
    );

    expect(result.map((preset) => preset.eventSlug)).toEqual(['weekend-nl']);
    expect(getGenres(genrePresets)).toEqual(['Hardstyle', 'Hardcore']);
  });

  it('formats ISO country codes for display while preserving unknown values', () => {
    expect(formatCountry('NL')).toBe('Netherlands');
    expect(formatCountry('GB')).toBe('United Kingdom');
    expect(formatCountry('Unknown country')).toBe('Unknown country');
  });

  it('formats browse locations as city and full country while retaining safe fallbacks', () => {
    expect(formatBrowseLocation(presets[0].location)).toBe('Amsterdam, Netherlands');
    expect(
      formatBrowseLocation({
        displayName: 'Mystery venue',
        precision: 'venue',
        source: 'Test',
        verifiedAt: '2026-10-01T00:00:00.000Z',
      }),
    ).toBe('Mystery venue');
    expect(formatBrowseLocation()).toBe('Location to be announced');
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
    lineupStatus: 'published',
    sourceGenres: [],
    genres: [],
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
