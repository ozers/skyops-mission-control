import { expect, test } from '@playwright/test';

/* A unique serial so the test can run against a non-empty database. */
function uniqueSerial(): string {
  const tail = Date.now().toString(36).toUpperCase().slice(-4).padStart(4, '0');
  return `SKY-${tail}-0001`;
}

test('an operator registers a drone, schedules a mission, and advances it', async ({ page }) => {
  const serial = uniqueSerial();
  const missionName = `E2E ${serial}`;

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'SkyOps Mission Control' })).toBeVisible();

  await page.getByRole('link', { name: 'Drones' }).click();
  await page.getByLabel('serial number').fill(serial);
  await page.getByRole('button', { name: 'Register drone' }).click();
  await expect(page.getByRole('cell', { name: serial })).toBeVisible();

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

  await row.getByRole('button', { name: /Advance to PRE_FLIGHT_CHECK/ }).click();
  await expect(row.getByText('PRE_FLIGHT_CHECK')).toBeVisible();

  await page.getByRole('link', { name: 'Drones' }).click();
  await page.getByRole('link', { name: serial }).click();
  await expect(page.getByRole('heading', { name: serial })).toBeVisible();
  await expect(page.getByRole('cell', { name: missionName })).toBeVisible();
});
