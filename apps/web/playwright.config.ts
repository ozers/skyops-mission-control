import { defineConfig } from '@playwright/test';

/*
 * Drives the real UI against the real API. Start the API (and its Docker stack)
 * separately on :3000; Playwright starts the Vite dev server on :5173.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:5173',
  },
  webServer: {
    command: 'pnpm dev',
    port: 5173,
    reuseExistingServer: true,
  },
});
