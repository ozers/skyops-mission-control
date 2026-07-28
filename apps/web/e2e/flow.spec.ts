import { expect, test, type Page } from '@playwright/test';

/* A unique serial so the test can run against a non-empty database. */
function uniqueSerial(): string {
  const tail = Date.now().toString(36).toUpperCase().slice(-4).padStart(4, '0');
  return `SKY-${tail}-0001`;
}

const inMissionCount = (page: Page) =>
  page.locator('.distribution li').filter({ hasText: 'IN_MISSION' }).locator('.dist-value');

test('an operator registers a drone, flies a mission, and the dashboard follows', async ({
  page,
}) => {
  const serial = uniqueSerial();
  const missionName = `E2E ${serial}`;

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'SkyOps Mission Control' })).toBeVisible();
  const dronesInMissionBefore = Number(await inMissionCount(page).innerText());

  /* Register an airframe. */
  await page.getByRole('link', { name: 'Drones' }).click();
  await page.getByLabel('serial number').fill(serial);
  await page.getByRole('button', { name: 'Register drone' }).click();
  await expect(page.getByRole('cell', { name: serial })).toBeVisible();

  /* Schedule a mission on it. */
  await page.getByRole('link', { name: 'Missions' }).click();
  await page.getByLabel('name').fill(missionName);
  await page.getByLabel('drone').selectOption({ label: serial });
  await page.getByLabel('pilot').fill('E2E Pilot');
  await page.getByLabel('site').fill('E2E Site');
  await page.getByLabel('start').fill('2030-05-01T10:00');
  await page.getByLabel('end').fill('2030-05-01T12:00');
  await page.getByRole('button', { name: 'Schedule mission' }).click();

  const row = page.getByRole('row', { name: missionName });
  await expect(row).toBeVisible();
  await expect(row.getByText('PLANNED')).toBeVisible();

  /* Walk the state machine through pre-flight and into the air. */
  await row.getByRole('button', { name: /Advance to PRE_FLIGHT_CHECK/ }).click();
  await expect(row.getByText('PRE_FLIGHT_CHECK')).toBeVisible();
  await row.getByRole('button', { name: /Advance to IN_PROGRESS/ }).click();
  await expect(row.getByText('IN_PROGRESS')).toBeVisible();

  /* The dashboard reflects that a drone is now flying. */
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await expect(inMissionCount(page)).toHaveText(String(dronesInMissionBefore + 1));

  /* Completing asks the operator for the flight hours actually flown. */
  await page.getByRole('link', { name: 'Missions' }).click();
  await row.getByRole('button', { name: /Advance to COMPLETED/ }).click();
  await row.getByLabel('flight hours').fill('2.5');
  await row.getByRole('button', { name: 'Confirm' }).click();
  await expect(row.getByText('COMPLETED')).toBeVisible();

  /* The drone is released and the logged hours are banked against it. */
  await page.getByRole('link', { name: 'Drones' }).click();
  await page.getByRole('link', { name: serial }).click();
  await expect(page.getByRole('heading', { name: serial })).toBeVisible();
  await expect(page.getByText('AVAILABLE')).toBeVisible();
  await expect(page.getByRole('definition').filter({ hasText: '2.5' })).toBeVisible();
  await expect(page.getByRole('cell', { name: missionName })).toBeVisible();
});
