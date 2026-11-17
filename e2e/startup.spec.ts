import { expect, test } from '@playwright/test';

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test.describe(`PWA startup (${reducedMotion})`, () => {
    test.use({ viewport: { width: 440, height: 956 }, reducedMotion });

    test('keeps the launch geometry stable until the routed page is ready', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('rave-route.onboarding.v1', 'complete');
        localStorage.setItem('rave-route.settings.v1', JSON.stringify({ themeColour: 'pink' }));
        Object.defineProperty(navigator, 'standalone', { value: true });
        const samples: { height: number; top: number; logoTop: number }[] = [];
        Object.assign(window, { launchSamples: samples });
        const sample = () => {
          const launch = document.querySelector('.launch-screen');
          const logo = launch?.querySelector('.launch-screen__content');
          if (launch && logo) {
            const bounds = launch.getBoundingClientRect();
            samples.push({ height: bounds.height, top: bounds.top, logoTop: logo.getBoundingClientRect().top });
          }
          requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      });
      await page.goto('/home');
      await expect(page.locator('app-header .logo__mark')).toBeVisible();
      await expect(page.locator('.launch-screen')).toHaveCount(0);
      await expect(page.locator('body')).toHaveCSS('transform', 'none');
      const samples = await page.evaluate(() =>
        (window as Window & { launchSamples?: { height: number; top: number; logoTop: number }[] }).launchSamples ?? [],
      );
      expect(samples.length).toBeGreaterThan(1);
      expect(new Set(samples.map(sample => sample.height))).toEqual(new Set([956]));
      expect(new Set(samples.map(sample => sample.top))).toEqual(new Set([0]));
      expect(new Set(samples.map(sample => sample.logoTop)).size).toBe(1);
    });
  });
}
