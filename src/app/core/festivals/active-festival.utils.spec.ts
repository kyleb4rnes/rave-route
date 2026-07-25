import { getActiveFestival, getActiveFestivalSchedule } from './active-festival.utils';
import { Festival } from './models/festival';

const festival: Festival = {
  id: 'festival-id',
  title: 'Summer Fields',
  startDate: '2026-07-26',
  endDate: '2026-07-28',
  location: 'Bristol',
  transportArranged: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  lineupSets: [
    { id: 'current', artist: 'Current artist', day: '2026-07-26', startTime: '14:00', endTime: '15:00', stage: 'Main' },
    { id: 'must-see-clash', artist: 'Must-see clash', day: '2026-07-26', startTime: '14:30', endTime: '15:30', stage: 'Second', isMustSee: true },
    { id: 'next', artist: 'Next artist', day: '2026-07-26', startTime: '16:00', endTime: '17:00', stage: 'Main' },
    { id: 'tomorrow', artist: 'Tomorrow artist', day: '2026-07-27', startTime: '12:00', endTime: '13:00', stage: 'Main' },
  ],
};

describe('active festival utilities', () => {
  it('finds a festival that is happening today', () => {
    expect(getActiveFestival([festival], new Date('2026-07-26T14:45:00'))).toBe(festival);
    expect(getActiveFestival([festival], new Date('2026-07-29T12:00:00'))).toBeUndefined();
  });

  it('returns current and next sets, prioritising a must-see clash', () => {
    const schedule = getActiveFestivalSchedule(festival, new Date('2026-07-26T14:45:00'));

    expect(schedule.currentSets.map((set) => set.id)).toEqual(['must-see-clash', 'current']);
    expect(schedule.nextSets.map((set) => set.id)).toEqual(['next']);
  });

  it('finds the next set on a later festival day when today has finished', () => {
    const schedule = getActiveFestivalSchedule(festival, new Date('2026-07-26T18:00:00'));

    expect(schedule.currentSets).toEqual([]);
    expect(schedule.nextSets.map((set) => set.id)).toEqual(['tomorrow']);
  });
});
