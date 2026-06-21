import { test as avecScreenshots } from './avec-screenshots.fixture';
import type { Page } from '@playwright/test';

export const test = avecScreenshots.extend<{ appAvecDonnees: Page }>({
  appAvecDonnees: async ({ page }, use) => {
    await page.goto('/demarrage');
    await page.locator('#btnCreer').click();
    await page.waitForURL('**/accueil');
    await use(page);
  },
});

export { expect } from '@playwright/test';
