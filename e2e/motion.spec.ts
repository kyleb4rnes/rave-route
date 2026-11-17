import { expect, test } from '@playwright/test';
import { seedFestival, testFestival } from './festival-fixtures';

for (const [width, reducedMotion] of [[390, 'reduce'], [1280, 'no-preference']] as const) {
  test.describe(`Motion at ${width}px (${reducedMotion})`, () => {
    test.use({ viewport: { width, height: 844 }, reducedMotion });
    test.beforeEach(async ({ page }) => seedFestival(page));

    test('a completed Settings exit cannot take over the next navigation', async ({ page }) => {
      await page.clock.install();
      await page.goto('/settings?capture');
      const openMenu = page.getByRole('button', { name: 'Open app menu' });
      await openMenu.press('Enter');
      await page.getByRole('menuitem', { name: 'Close settings' }).press('Enter');
      await expect(page).toHaveURL(/\/home$/);
      await expect(openMenu).toHaveCount(1);
      await openMenu.press('Enter');
      await page.getByRole('menuitem', { name: 'Help', exact: true }).press('Enter');
      await expect(page).toHaveURL(/\/help$/);
      await page.clock.fastForward(750);
      await expect(page).toHaveURL(/\/help$/);
    });

    test('the welcome tour owns focus and restores it on dismissal', async ({ page }) => {
      await page.goto('/help?capture');
      const replay = page.getByRole('button', { name: 'Watch the welcome tour again' });
      await replay.press('Enter');
      const tour = page.getByRole('dialog', { name: 'Find your festival' });
      await expect(tour.getByRole('heading')).toBeFocused();
      await expect(page.locator('ion-router-outlet')).toHaveJSProperty('inert', true);
      await expect(tour.locator('video')).toHaveJSProperty('autoplay', reducedMotion !== 'reduce');
      await expect(tour.locator('video')).toHaveJSProperty('loop', false);
      await tour.getByRole('button', { name: 'Next' }).press('Enter');
      await expect(page.getByRole('heading', { name: 'Build your route' })).toBeFocused();
      await page.getByRole('button', { name: 'Skip intro' }).press('Enter');
      await expect(replay).toBeFocused();
      await expect(page.locator('app-onboarding')).toHaveCount(0);
    });

    test('removing an expense moves focus to Add expense', async ({ page }) => {
      await page.goto(`/festivals/${testFestival.id}/budget?capture`);
      await page.getByLabel('What is it?').fill('Train ticket');
      await page.getByLabel('Amount', { exact: true }).fill('45');
      const add = page.getByRole('button', { name: 'Add expense' });
      await add.press('Enter');
      await page.getByRole('button', { name: 'Remove Train ticket' }).press('Enter');
      await expect(add).toBeFocused();
      await expect(page.getByText('No expenses added yet.')).toBeVisible();
    });
  });
}
