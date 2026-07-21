import { Festival } from './models/festival';
import {
  calculateDaysRemaining,
  getNextFestival,
  getPastFestivals,
  getUpcomingFestivals,
  sortFestivalsByStartDate,
} from './festival-date.utils';

const referenceDate = new Date('2026-07-20T12:00:00.000Z');

const festivals: Festival[] = [
  {
    id: 'september',
    title: 'September Festival',
    startDate: '2026-09-04',
    endDate: '2026-09-06',
    location: 'Brighton',
    transportArranged: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'past',
    title: 'Past Festival',
    startDate: '2026-06-01',
    endDate: '2026-06-03',
    location: 'Bristol',
    transportArranged: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'august',
    title: 'August Festival',
    startDate: '2026-08-14',
    endDate: '2026-08-16',
    location: 'Manchester',
    transportArranged: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

describe('festival date utilities', () => {
  it('sorts festivals by start date without changing the original array', () => {
    const sortedFestivals = sortFestivalsByStartDate(festivals);

    expect(sortedFestivals.map((festival) => festival.id)).toEqual(['past', 'august', 'september']);
    expect(festivals.map((festival) => festival.id)).toEqual(['september', 'past', 'august']);
  });

  it('selects the nearest upcoming festival', () => {
    expect(getNextFestival(festivals, referenceDate)?.id).toBe('august');
  });

  it('separates upcoming and past festivals using the festival end date', () => {
    expect(getUpcomingFestivals(festivals, referenceDate).map((festival) => festival.id)).toEqual([
      'august',
      'september',
    ]);
    expect(getPastFestivals(festivals, referenceDate).map((festival) => festival.id)).toEqual(['past']);
  });

  it('calculates remaining days and does not return a negative value', () => {
    expect(calculateDaysRemaining('2026-08-14', referenceDate)).toBe(25);
    expect(calculateDaysRemaining('2026-07-20', referenceDate)).toBe(0);
    expect(calculateDaysRemaining('2026-07-01', referenceDate)).toBe(0);
  });
});
