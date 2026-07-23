import { mapTomorrowlandPerformances } from './tomorrowland-lineup.service';

describe('mapTomorrowlandPerformances', () => {
  const sourceUrl = 'https://example.com/timetable.json';
  const festivalDays = ['2026-07-17', '2026-07-18'];

  it('maps official performances to line-up sets on the saved festival days', () => {
    const sets = mapTomorrowlandPerformances(
      {
        performances: [
          {
            id: 'performance-1',
            name: 'DJ Example',
            stage: { name: 'MAINSTAGE' },
            date: '2026-07-18',
            startTime: '2026-07-18 23:50:00+02:00',
            endTime: '2026-07-19 00:50:01+02:00',
          },
          {
            id: 'performance-2',
            name: 'The Gathering artist',
            stage: { name: 'THE GATHERING' },
            date: '2026-07-16',
            startTime: '2026-07-16 20:00:00+02:00',
            endTime: '2026-07-16 21:00:01+02:00',
          },
        ],
      },
      sourceUrl,
      festivalDays,
      '2026-01-01T00:00:00.000Z',
    );

    expect(sets).toEqual([
      {
        artist: 'DJ Example',
        day: '2026-07-18',
        startTime: '23:50',
        endTime: '00:50',
        stage: 'MAINSTAGE',
        source: {
          provider: 'tomorrowland',
          performanceId: 'performance-1',
          sourceUrl,
          importedAt: '2026-01-01T00:00:00.000Z',
        },
      },
    ]);
  });

  it('rejects an unrecognised provider response', () => {
    expect(() => mapTomorrowlandPerformances({}, sourceUrl, festivalDays)).toThrowError(
      'The official timetable format was not recognised.',
    );
  });
});
