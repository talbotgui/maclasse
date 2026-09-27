import { test as avecScreenshots } from './avec-screenshots.fixture';
import { CHEMIN_ZIP_TEST, CHEMIN_ZIP_VERSION_FUTURE, MOT_DE_PASSE_TEST } from './global-setup';
import type { Page } from '@playwright/test';

interface FixturesZip {
  cheminZip: string;
  cheminZipVersionFuture: string;
  motDePasseTest: string;
  appVersDemanrage: Page;
}

export const test = avecScreenshots.extend<FixturesZip>({
  cheminZip: async ({}, use) => {
    await use(CHEMIN_ZIP_TEST);
  },
  cheminZipVersionFuture: async ({}, use) => {
    await use(CHEMIN_ZIP_VERSION_FUTURE);
  },
  motDePasseTest: async ({}, use) => {
    await use(MOT_DE_PASSE_TEST);
  },
  appVersDemanrage: async ({ page }, use) => {
    await page.goto('/maclasse/#/demarrage');
    await use(page);
  },
});

export { expect } from '@playwright/test';
