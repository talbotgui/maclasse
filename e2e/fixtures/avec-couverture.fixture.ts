import { test as base } from '@playwright/test';
import { addCoverageReport } from 'monocart-reporter';

/** Active lorsque `npm run e2e:couverture` est utilisé — voir playwright.config.ts. */
const couvertureActivee = process.env['COUVERTURE_E2E'] === '1';

type FixtureCouverture = {
  /** Fixture interne — collecte la couverture V8 de chaque test quand `COUVERTURE_E2E=1`. */
  _couverture: void;
};

/**
 * Fixture de base : démarre la couverture JS (V8/Chromium) au début de chaque test
 * et l'ajoute au rapport global de `monocart-reporter` à la fin. Sans effet si la
 * variable d'environnement `COUVERTURE_E2E` n'est pas positionnée, pour ne pas
 * ralentir les exécutions E2E courantes.
 */
export const test = base.extend<FixtureCouverture>({
  _couverture: [
    async ({ page }, use, testInfo) => {
      if (!couvertureActivee) {
        await use();
        return;
      }

      await page.coverage.startJSCoverage({ resetOnNavigation: false });
      await use();
      const couverture = await page.coverage.stopJSCoverage();
      await addCoverageReport(couverture, testInfo);
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
