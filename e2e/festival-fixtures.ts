import { Page } from '@playwright/test';

export const testFestival = {
  id: 'e2e-test-festival',
  title: 'E2E Test Festival',
  startDate: '2027-07-10',
  endDate: '2027-07-11',
  location: 'Manchester, UK',
  ticketArranged: false,
  transportArranged: false,
  accommodationArranged: false,
  isCustom: true,
  packingList: [],
  lineupSets: [
    {
      id: 'e2e-set-1',
      artist: 'Test Headliner',
      day: '2027-07-10',
      startTime: '20:00',
      endTime: '21:00',
      stage: 'Main stage',
      isMustSee: false,
    },
  ],
  createdAt: '2026-10-04T12:00:00.000Z',
  updatedAt: '2026-10-04T12:00:00.000Z',
};

export async function seedFestival(page: Page): Promise<void> {
  await page.addInitScript((festival) => {
    localStorage.clear();
    localStorage.setItem('rave-route.festivals.v1', JSON.stringify([festival]));
  }, testFestival);
}
