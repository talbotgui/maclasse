import { test, expect, testAvecDonnees } from '../fixtures';
import { SelecteursBase } from '../selecteurs/selecteurs-base';
import { SelecteursDemarrage } from '../selecteurs/selecteurs-demarrage';
import { VerificateurAccessibilite } from '../utilitaires/verificateur-accessibilite';

test('RGAA-17 — Mobile : écran de démarrage sans débordement ni violation AXE', async ({
  page,
}) => {
  const demarrage = new SelecteursDemarrage(page);
  await page.goto('/maclasse/#/demarrage');

  await expect(demarrage.btnCreer).toBeVisible();
  await expect(demarrage.btnCharger).toBeVisible();
  expect(await VerificateurAccessibilite.mesurerDebordementHorizontal(page)).toBe(0);
  expect(await VerificateurAccessibilite.lister(page)).toEqual([]);
});

testAvecDonnees(
  'RGAA-18 — Mobile : chaque écran sans débordement horizontal ni violation AXE',
  async ({ appAvecDonnees }) => {
    const base = new SelecteursBase(appAvecDonnees);
    const ecrans = [
      base.navAccueil,
      base.navEleves,
      base.navProjets,
      base.navCompetences,
      base.navEmploiDuTemps,
      base.navCahierJournal,
      base.navParametrage,
    ];
    for (const [index, ecran] of ecrans.entries()) {
      await ecran.click();
      expect(
        await VerificateurAccessibilite.mesurerDebordementHorizontal(appAvecDonnees),
        `débordement écran ${index}`,
      ).toBe(0);
      expect(await VerificateurAccessibilite.lister(appAvecDonnees), `AXE écran ${index}`).toEqual(
        [],
      );
    }
  },
);
