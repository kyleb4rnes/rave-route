import { expect, test } from '@playwright/test';

import { seedFestival, testFestival } from './festival-fixtures';

test.describe('Rave Route journeys', () => {
  test.beforeEach(async ({ page }) => {
    await seedFestival(page);
  });

  test('shows the saved festival on Home and opens its details', async ({ page }) => {
    await page.goto('/home');

    await expect(page.getByRole('heading', { name: 'Make room for your next adventure.' })).toBeVisible();
    await expect(page.getByText(testFestival.title, { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Details' }).click();

    await expect(page).toHaveURL(new RegExp(`/festivals/${testFestival.id}$`));
    await expect(page.locator('#festival-title')).toHaveText(testFestival.title);
  });

  test('browses the catalogue, searches, and opens the add confirmation', async ({ page }) => {
    await page.goto('/festivals/browse');

    await expect(page.getByRole('heading', { name: 'Find your next route' })).toBeVisible();
    await page.locator('ion-searchbar input').fill('Vroeger Was Alles Beter');
    const festival = page.getByRole('button', { name: /Vroeger Was Alles Beter 2026/ });
    await expect(festival).toBeVisible();
    await festival.click();

    await expect(page).toHaveURL(/\/festivals\/add\?event=vroeger_was_alles_beter_2026_timetable/);
    await expect(page.getByRole('heading', { name: 'Vroeger Was Alles Beter 2026' })).toBeVisible();
  });

  test('opens the custom festival form', async ({ page }) => {
    await page.goto('/festivals/custom');

    await expect(page.getByText('Festival name', { exact: true })).toBeVisible();
    await expect(page.getByText('Location', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add custom festival' })).toBeVisible();
  });

  test('updates packing and arrangement progress on Festival Details', async ({ page }) => {
    await page.goto(`/festivals/${testFestival.id}`);

    await page.getByLabel('Add packing item').fill('Earplugs');
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await expect(page.getByText('Earplugs', { exact: true })).toBeVisible();
    await page.getByText('Transport arranged', { exact: true }).click();
    await expect(page.getByText('Arranged', { exact: true })).toBeVisible();
  });

  test('edits a custom festival', async ({ page }) => {
    await page.goto(`/festivals/${testFestival.id}/edit`);

    const title = page.getByLabel('Festival name');
    await title.fill('Edited E2E Festival');
    await page.getByRole('button', { name: 'Save changes' }).click();

    await expect(page).toHaveURL(new RegExp(`/festivals/${testFestival.id}$`));
    await expect(page.locator('#festival-title')).toHaveText('Edited E2E Festival');
  });

  test('sets a budget and adds an expense', async ({ page }) => {
    await page.goto(`/festivals/${testFestival.id}/budget`);

    await expect(page.getByRole('heading', { name: testFestival.title })).toBeVisible();
    await page.getByLabel('Total budget').fill('250');
    await page.getByLabel('What is it?').fill('Train ticket');
    await page.getByLabel('Amount').fill('45');
    await page.getByRole('button', { name: 'Add expense' }).click();

    await expect(page.getByText('Train ticket', { exact: true })).toBeVisible();
    await expect(page.getByText('£205.00', { exact: true })).toBeVisible();
  });

  test('views the line-up and saves a must-see set', async ({ page }) => {
    await page.goto(`/festivals/${testFestival.id}/lineup`);

    await expect(page.getByRole('heading', { name: testFestival.title })).toBeVisible();
    await expect(page.getByText('Test Headliner', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Add Test Headliner to must-see' }).click();
    await expect(page.getByRole('button', { name: 'Remove Test Headliner from must-see' })).toBeVisible();
  });

  test('saves an appearance choice in Settings', async ({ page }) => {
    await page.goto('/settings');

    await expect(page.getByRole('heading', { name: 'App settings' })).toBeVisible();
    await page.getByRole('radio', { name: 'Dark' }).click();
    await page.getByRole('button', { name: 'Save settings' }).click();
    await expect(page).toHaveURL(/\/home$/);
  });

  test('opens Help guidance', async ({ page }) => {
    await page.goto('/help');

    await expect(page.getByRole('heading', { name: 'Make every festival day count.' })).toBeVisible();
    await page.getByRole('button', { name: /Getting started/ }).click();
    await expect(page.getByRole('heading', { name: 'Choose a festival' })).toBeVisible();
  });
});
