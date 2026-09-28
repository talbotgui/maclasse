import { test as base } from './avec-couverture.fixture';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { Frame } from '@playwright/test';

// Horodatage calculé une seule fois au démarrage de la suite (ex. "20260621-1646").
const now = new Date();
const pad2 = (n: number): string => String(n).padStart(2, '0');
const HORODATAGE = `${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}-${pad2(now.getHours())}${pad2(now.getMinutes())}`;

/** Durée maximale d'une capture : au-delà, elle est abandonnée plutôt que de bloquer le test. */
const DELAI_MAX_CAPTURE_MS = 5_000;

/** Répertoire racine de l'exécution courante. */
export const REP_EXECUTION = resolve(join('.e2e', 'screenshotsMetiers', `execution-${HORODATAGE}`));

interface FixtureScreenshots {
  /** Fixture interne — active automatiquement la capture de screenshots pour chaque test. */
  _screenshots: void;
}

/**
 * Fixture de base enrichie : capture automatiquement un screenshot après chaque
 * navigation SPA (événement `framenavigated` sur le frame principal) et en fin de test.
 * Active pour tous les tests sans déclaration explicite (`auto: true`).
 */
export const test = base.extend<FixtureScreenshots>({
  _screenshots: [
    async ({ page }, use, testInfo) => {
      // Dossier du test : ex. ".e2e/screenshots/execution-20260621-1646/E2E-01_Acces_direct/"
      const nomSanitise = testInfo.title
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-zA-Z0-9-]/g, '_')
        .replace(/_+/g, '_')
        .slice(0, 80);
      const repTest = join(REP_EXECUTION, nomSanitise);
      mkdirSync(repTest, { recursive: true });

      let compteur = 0;
      // Captures enchaînées : deux `page.screenshot` concurrents (ex. navigation déclenchée par
      // un rechargement puis capture de fin) peuvent se bloquer jusqu'au timeout du test.
      let captures: Promise<void> = Promise.resolve();
      const capturer = (label: string): Promise<void> => {
        captures = captures.then(async () => {
          try {
            const num = String(++compteur).padStart(3, '0');
            await page.screenshot({
              path: join(repTest, `${num}-${label}.png`),
              fullPage: true,
              timeout: DELAI_MAX_CAPTURE_MS,
            });
          } catch {
            // Ignore si la page est fermée, en cours de transition ou si la capture expire.
          }
        });
        return captures;
      };

      // Capture après chaque navigation SPA (Angular Router utilise l'API History).
      const surNavigation = (frame: Frame): void => {
        if (frame === page.mainFrame()) {
          void capturer('navigation');
        }
      };
      page.on('framenavigated', surNavigation);

      await use();

      page.off('framenavigated', surNavigation);
      // Screenshot final de l'état de fin de test.
      await capturer('fin');
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
