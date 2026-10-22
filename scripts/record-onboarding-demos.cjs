const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const outputDirectory = path.join(__dirname, '..', 'src', 'assets', 'onboarding');
const festival = {
  id: 'onboarding-demo-festival',
  title: 'Summer Rave 2027',
  startDate: '2027-07-10',
  endDate: '2027-07-11',
  location: 'Manchester, UK',
  ticketArranged: false,
  transportArranged: false,
  accommodationArranged: false,
  isCustom: true,
  packingList: [{ id: 'tent', label: 'Tent', packed: false }],
  budget: { total: 300, currency: 'GBP', expenses: [] },
  lineupSets: [{ id: 'headline-set', artist: 'Midnight Energy', day: '2027-07-10', startTime: '20:00', endTime: '21:00', stage: 'Main stage', isMustSee: false }],
  createdAt: '2026-10-22T12:00:00.000Z',
  updatedAt: '2026-10-22T12:00:00.000Z',
};

async function record(name, route, play) {
  const context = await browser.newContext({
    viewport: { width: 540, height: 960 },
    deviceScaleFactor: 2,
    recordVideo: { dir: temporaryDirectory, size: { width: 540, height: 960 } },
  });
  const page = await context.newPage();
  await page.addInitScript((demoFestival) => {
    localStorage.clear();
    localStorage.setItem('rave-route.festivals.v1', JSON.stringify([demoFestival]));
    localStorage.setItem('rave-route.onboarding.v1', 'complete');
  }, festival);
  await page.goto(`http://127.0.0.1:4200${route}?capture=1`);
  await page.locator('.launch-screen').waitFor({ state: 'detached', timeout: 5000 }).catch(() => undefined);
  await page.waitForTimeout(1200);
  const video = page.video();
  try {
    await play(page);
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(outputDirectory, `${name}.png`) });
  } finally {
    await context.close();
  }
  fs.renameSync(await video.path(), path.join(outputDirectory, `${name}.webm`));
}

async function smoothlyScroll(page, distance) {
  const steps = 7;

  for (let index = 0; index < steps; index += 1) {
    await page.mouse.wheel(0, distance / steps);
    await page.waitForTimeout(180);
  }
}

const temporaryDirectory = path.join(outputDirectory, '.recordings');
let browser;

(async () => {
  fs.mkdirSync(temporaryDirectory, { recursive: true });
  fs.mkdirSync(outputDirectory, { recursive: true });
  browser = await chromium.launch({ headless: true });

  await record('find-your-festival', '/home', async (page) => {
    await page.getByRole('button', { name: 'Add Festival' }).click();
    await page.waitForTimeout(1800);
    await page.locator('ion-searchbar input').pressSequentially('Tomorrowland', { delay: 160 });
    await page.waitForTimeout(1600);
  });
  await record('build-your-route', '/home', async (page) => {
    await page.getByRole('button', { name: 'View festival details' }).click();
    await page.waitForTimeout(1700);
    await smoothlyScroll(page, 1250);
    await page.waitForTimeout(700);
    await page.locator('ion-button[href$="/lineup"]').click();
    await page.waitForURL(/\/lineup$/);
    await page.waitForTimeout(1600);
    await page.getByRole('button', { name: 'Add Midnight Energy to must-see' }).click();
    await page.waitForTimeout(900);
  });
  await record('get-festival-ready', '/home', async (page) => {
    await page.getByRole('button', { name: 'View festival details' }).click();
    await page.waitForTimeout(1700);
    await page.getByText('Transport arranged', { exact: true }).click();
    await page.waitForTimeout(1100);
    await smoothlyScroll(page, 820);
    await page.waitForTimeout(650);
    await page.getByText('Tent', { exact: true }).click();
    await page.waitForTimeout(900);
  });
  await record('stay-on-top', '/home', async (page) => {
    await page.getByRole('button', { name: 'View festival details' }).click();
    await page.waitForTimeout(1700);
    await smoothlyScroll(page, 1250);
    await page.waitForTimeout(700);
    await page.locator('ion-button[href$="/budget"]').click();
    await page.waitForURL(/\/budget$/);
    await page.waitForTimeout(1600);
    await page.getByLabel('What is it?').pressSequentially('Train ticket', { delay: 150 });
    await page.waitForTimeout(850);
    await page.getByLabel('Amount').pressSequentially('45', { delay: 220 });
    await page.waitForTimeout(850);
    await page.getByRole('button', { name: 'Add expense' }).click();
    await page.waitForTimeout(900);
  });
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  if (browser) await browser.close();
  fs.rmSync(temporaryDirectory, { recursive: true, force: true, maxRetries: 3, retryDelay: 500 });
});
