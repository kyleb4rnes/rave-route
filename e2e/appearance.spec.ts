import { expect, test } from '@playwright/test';

import { seedFestival, testFestival } from './festival-fixtures';

const darkSurface = 'rgb(26, 34, 41)';
const darkText = 'rgb(242, 245, 247)';
const darkAccent = 'rgb(255, 156, 162)';

for (const width of [1280, 390]) {
  test.describe(`Appearance at ${width}px`, () => {
    test.use({ viewport: { width, height: 844 }, reducedMotion: 'reduce' });
    test.beforeEach(async ({ page }) => seedFestival(page));

    test('applies the saved appearance independently of the device and themes the settings popover', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/settings?capture');
      const root = page.locator('html');
      const languageSelect = page.locator('ion-select');
      const popover = page.locator('ion-popover:not(.overlay-hidden)');
      const english = popover.getByRole('radio', { name: 'English', exact: true });

      await expect(root).toHaveCSS('color-scheme', 'light');
      await languageSelect.click();
      await expect(english).toBeVisible();
      await expect(popover.locator('.popover-content')).toHaveCSS('background-color', 'rgb(244, 246, 248)');
      await english.click();
      await expect(popover).toBeHidden();

      await page.emulateMedia({ colorScheme: 'light' });
      const darkChoice = page.getByRole('radio', { name: 'Dark', exact: true });
      await darkChoice.click();
      await expect(darkChoice).toHaveCSS('color', darkAccent);
      await page.getByRole('radio', { name: 'Blue', exact: true }).click();
      await page.reload();
      await expect(darkChoice).toHaveAttribute('aria-checked', 'true');
      await expect(darkChoice).toHaveCSS('color', 'rgb(155, 186, 255)');
      await expect(root).toHaveCSS('color-scheme', 'dark');

      await languageSelect.click();
      await expect(english).toBeVisible();
      await expect(popover.locator('.popover-content')).toHaveCSS('background-color', darkSurface);
      await expect(popover.locator('ion-radio').first()).toHaveCSS('color', darkText);
      await english.click();
      await expect(popover).toBeHidden();

      await page.getByRole('radio', { name: 'Light', exact: true }).click();
      await page.reload();
      await expect(root).toHaveCSS('color-scheme', 'light');
    });

    test('keeps the date picker and validation readable and supports keyboard access', async ({ page }) => {
      await page.goto('/settings?capture');
      await page.getByRole('radio', { name: 'Dark', exact: true }).click();
      await page.goto('/festivals/custom?capture');
      await page.getByRole('button', { name: 'Add custom festival' }).click();

      const validation = page.getByText('Enter a festival name.');
      await expect(validation).toBeVisible();
      await expect(validation).toHaveCSS('color', 'rgb(255, 146, 155)');

      const dates = page.getByRole('button', { name: /Festival dates/ });
      await dates.press('Enter');
      const dialog = page.getByRole('dialog', { name: 'Festival dates' });
      const modal = page.locator('ion-modal.festival-date-range-modal');
      const calendar = modal.locator('ion-datetime');
      await expect(dialog).toBeVisible();
      await expect(calendar).toBeVisible();
      await expect(calendar).toHaveCSS('background-color', darkSurface);
      await expect(calendar.locator('.calendar-day:not(:disabled, .calendar-day-today, .calendar-day-adjacent-day)').first()).toHaveCSS('color', darkText);
      await modal.getByRole('button', { name: 'Cancel', exact: true }).click();
      await expect(dialog).toBeHidden();
      await expect(dates).toBeFocused();
    });

    test('keeps menu, confirmation, select alert and action sheet controls usable in Dark', async ({ page }) => {
      await page.goto('/settings');
      await page.getByRole('radio', { name: 'Dark', exact: true }).click();

      const trigger = page.getByRole('button', { name: 'Open app menu' });
      await trigger.press('Enter');
      const menu = page.getByRole('menu', { name: 'App menu' });
      await expect(menu).toHaveCSS('background-color', darkSurface);
      await expect(menu.getByRole('menuitem', { name: 'Help' })).toBeFocused();
      await page.keyboard.press('ArrowDown');
      await expect(menu.getByRole('menuitem', { name: 'Close settings' })).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(menu).toBeHidden();
      await expect(trigger).toBeFocused();
      await trigger.click();
      await expect(menu).toBeVisible();
      await trigger.click();
      await expect(menu).toBeHidden();

      const festivalPath = `/festivals/${testFestival.id}`;
      await page.goto(`${festivalPath}?capture`);
      await page.getByRole('button', { name: 'Delete festival' }).click();
      const confirmation = page.locator('ion-alert:not(.overlay-hidden)');
      await expect(confirmation.locator('.alert-wrapper')).toHaveCSS('background-color', darkSurface);
      await expect(confirmation.locator('.alert-message')).toHaveCSS('color', 'rgb(184, 194, 203)');
      await confirmation.getByRole('button', { name: 'Cancel', exact: true }).click();
      await expect(confirmation).toBeHidden();

      await page.getByRole('link', { name: 'BUDGET' }).click();
      const currency = page.locator('ion-select[label="Currency"]');
      await currency.click();
      const currencyAlert = page.locator('ion-alert:not(.overlay-hidden)');
      await expect(currencyAlert.locator('.alert-wrapper')).toHaveCSS('background-color', darkSurface);
      const euros = currencyAlert.getByRole('radio', { name: 'EUR (€)' });
      await expect(euros.locator('.alert-radio-label')).toHaveCSS('color', 'rgb(219, 219, 219)');
      await euros.click();
      await currencyAlert.getByRole('button', { name: 'OK', exact: true }).click();
      await expect(currency).toHaveJSProperty('value', 'EUR');

      await page.getByRole('link', { name: 'Back to festival' }).click();
      await page.getByRole('link', { name: 'LINE UP' }).click();
      await page.getByRole('button', { name: 'Add Test Headliner to must-see' }).click();
      await page.getByRole('button', { name: 'Share must-sees' }).click();
      const sheet = page.locator('ion-action-sheet');
      await expect(sheet.locator('.action-sheet-group').first()).toHaveCSS('background-color', darkSurface);
      await expect(sheet.getByRole('button', { name: 'Add to calendar' })).toBeVisible();
      await sheet.getByRole('button', { name: 'Cancel', exact: true }).click();
      await expect(sheet).toBeHidden();
    });
  });
}
