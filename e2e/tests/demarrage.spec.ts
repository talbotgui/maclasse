import { test, expect, testAvecZip, testAvecDonnees } from '../fixtures';
import { SelecteursDemarrage } from '../selecteurs/selecteurs-demarrage';

test('E2E-01 — Accès direct à un écran sans données redirige vers /demarrage', async ({ page }) => {
  await page.goto('/eleves');
  await expect(page).toHaveURL(/\/demarrage/);
  await expect(page.locator('#btnCreer')).toBeVisible();
  await expect(page.locator('#navAccueil')).not.toBeVisible();
  await expect(page.locator('#btnSauvegarder')).not.toBeVisible();
  await expect(page.locator('#btnTheme')).toBeVisible();
});

test('E2E-02 — Créer un nouveau fichier depuis les données d\'exemple', async ({ page }) => {
  const demarrage = new SelecteursDemarrage(page);
  await page.goto('/demarrage');

  await demarrage.btnCreer.click();
  await page.waitForURL('**/accueil');

  await expect(demarrage.navAccueil).toBeVisible();
  await expect(demarrage.btnSauvegarder).toBeVisible();
  await expect(demarrage.btnAnnuler).toBeVisible();
  await expect(demarrage.btnRefaire).toBeVisible();
});

testAvecZip('E2E-03 — Charger un fichier ZIP valide avec le bon mot de passe', async ({ appVersDemanrage, cheminZip, motDePasseTest }) => {
  const demarrage = new SelecteursDemarrage(appVersDemanrage);

  await demarrage.chargerZip(cheminZip, motDePasseTest);
  await appVersDemanrage.waitForURL('**/accueil', { timeout: 15_000 });

  await expect(demarrage.navAccueil).toBeVisible();
  await expect(demarrage.messageErreur).not.toBeVisible();
});

testAvecZip('E2E-04 — Charger un fichier ZIP avec un mauvais mot de passe', async ({ appVersDemanrage, cheminZip }) => {
  const demarrage = new SelecteursDemarrage(appVersDemanrage);

  await demarrage.chargerZip(cheminZip, 'mauvaismdp');

  await expect(demarrage.messageErreur).toBeVisible();
  await expect(demarrage.btnCharger).toBeEnabled();
  await expect(appVersDemanrage).toHaveURL(/\/demarrage/);
});

testAvecZip('E2E-05 — Bouton CHARGER désactivé tant que les champs sont vides', async ({ appVersDemanrage, cheminZip }) => {
  const demarrage = new SelecteursDemarrage(appVersDemanrage);

  // Aucun champ renseigné
  await expect(demarrage.btnCharger).toBeDisabled();

  // Fichier seul, sans mot de passe
  await demarrage.inputFichierZip.setInputFiles(cheminZip);
  await expect(demarrage.btnCharger).toBeDisabled();

  // Mot de passe seul, sans fichier — on vide le file input via JS
  await appVersDemanrage.evaluate(() => {
    const input = document.querySelector('#fichierZip') as HTMLInputElement;
    const dt = new DataTransfer();
    input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await demarrage.champMotDePasse.fill('unmdp');
  await expect(demarrage.btnCharger).toBeDisabled();

  // Les deux renseignés → bouton actif
  await demarrage.inputFichierZip.setInputFiles(cheminZip);
  await expect(demarrage.btnCharger).toBeEnabled();
});

// E2E-06 : bouton œil non présent dans l'implémentation actuelle (champ password sans toggle visible)

testAvecDonnees('E2E-07 — Changement de thème depuis l\'écran de démarrage', async ({ appAvecDonnees }) => {
  const demarrage = new SelecteursDemarrage(appAvecDonnees);
  const html = appAvecDonnees.locator('html');

  const themeInitial = await html.getAttribute('data-theme');
  await demarrage.btnTheme.click();
  const themeApres = await html.getAttribute('data-theme');
  expect(themeApres).not.toBe(themeInitial);

  // Après rechargement, le thème est conservé via localStorage
  await appAvecDonnees.reload();
  await expect(appAvecDonnees.locator('html')).toHaveAttribute('data-theme', themeApres ?? '');
});
