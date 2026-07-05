import { test as avecScreenshots } from './avec-screenshots.fixture';
import { CHEMIN_ZIP_TEST, MOT_DE_PASSE_TEST } from './global-setup';
import type { Page } from '@playwright/test';

type FixturesZip = {
  cheminZip: string;
  motDePasseTest: string;
  appVersDemanrage: Page;
};

export const test = avecScreenshots.extend<FixturesZip>({
  cheminZip: async ({}, use) => {
    await use(CHEMIN_ZIP_TEST);
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
