import { Festival } from './models/festival';
import {
  buildMustSeeExport,
  formatMustSeeIcs,
  formatMustSeeText,
} from './must-see-export.utils';

describe('must-see export utilities', () => {
  const festival: Festival = {
    id: 'festival-1',
    title: 'Rave Route Festival',
    startDate: '2026-07-18',
    endDate: '2026-07-19',
    location: 'London',
    transportArranged: false,
    lineupSets: [
      { id: 'later', artist: 'Artist B', day: '2026-07-19', startTime: '18:30', endTime: '19:30', stage: 'Arena', isMustSee: true },
      { id: 'not-selected', artist: 'Artist X', day: '2026-07-18', startTime: '12:00', endTime: '13:00', stage: 'Main', isMustSee: false },
      { id: 'first', artist: 'Artist A', day: '2026-07-18', startTime: '14:00', endTime: '15:00', stage: 'Main', isMustSee: true },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  it('exports only must-see sets in chronological order', () => {
    const result = buildMustSeeExport(festival);

    expect(result.sets.map((set) => set.artist)).toEqual(['Artist A', 'Artist B']);
  });

  it('groups plain text by day and includes stage fallback', () => {
    const result = formatMustSeeText(buildMustSeeExport({
      ...festival,
      lineupSets: [{ id: 'unassigned', artist: 'Artist C', day: '2026-07-18', startTime: '20:00', endTime: '21:00', stage: '', isMustSee: true }],
    }));

    expect(result).toContain('Saturday 18 July');
    expect(result).toContain('20:00–21:00  Artist C — Unassigned stage');
  });

  it('escapes calendar text and moves an overnight end time to the next day', () => {
    const result = formatMustSeeIcs({
      festivalTitle: 'Rave; Route',
      sets: [{ artist: 'A, B', day: '2026-07-18', startTime: '23:30', endTime: '01:00', stage: 'Main; Stage' }],
    }, new Date('2026-07-01T12:00:00.000Z'));

    expect(result).toContain('SUMMARY:A\\, B');
    expect(result).toContain('LOCATION:Main\\; Stage');
    expect(result).toContain('DTSTART:20260718T233000');
    expect(result).toContain('DTEND:20260719T010000');
    expect(result.endsWith('END:VCALENDAR\r\n')).toBeTrue();
  });
});
