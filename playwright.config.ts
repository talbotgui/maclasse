import { defineConfig, devices } from '@playwright/test';

/** Active lorsque `npm run e2e:couverture` est utilisé — ajoute le reporter de couverture V8. */
const couvertureActivee = process.env['COUVERTURE_E2E'] === '1';

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: false,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  workers: 1,
  outputDir: '.e2e/test-results',
  reporter: [
    ['html', { open: 'never', outputFolder: '.e2e/playwright-report' }],
    ['list'],
    ...(couvertureActivee
      ? ([
          [
            'monocart-reporter',
            {
              name: 'Couverture E2E - Ma classe',
              outputFile: '.e2e/coverage-e2e/index.html',
              coverage: {
                reports: [['v8'], ['lcovonly'], ['console-summary']],
                // Ne garder que le bundle Angular servi par `ng serve`.
                entryFilter: (entry: { url: string }) => entry.url.includes('localhost:4200'),
                // Exclure les DTOs (src/app/modeles/) : aucune logique testable, et les templates
                // HTML compilés (déjà hors périmètre, comme pour la couverture Vitest).
                sourceFilter: (sourcePath: string) =>
                  sourcePath.startsWith('src/app/') &&
                  !sourcePath.endsWith('.html') &&
                  !sourcePath.includes('/modeles/'),
              },
            },
          ],
        ] as const)
      : []),
  ],

  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    locale: 'fr-FR',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  globalSetup: './e2e/fixtures/global-setup.ts',

  webServer: {
    command: 'npm start',
    url: 'http://localhost:4200',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
