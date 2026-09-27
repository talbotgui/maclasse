import { test, expect, testAvecZip, testAvecDonnees } from '../fixtures';
import { SelecteursDemarrage } from '../selecteurs/selecteurs-demarrage';
import { SelecteursEmploiDuTemps } from '../selecteurs/selecteurs-emploi-du-temps';

test('E2E-01 — Accès direct à un écran sans données redirige vers /demarrage', async ({ page }) => {
  const demarrage = new SelecteursDemarrage(page);
  await page.goto('/maclasse/#/eleves');
  await expect(page).toHaveURL(/\/demarrage/);
  await expect(demarrage.btnCreer).toBeVisible();
  await expect(demarrage.navAccueil).not.toBeVisible();
  await expect(demarrage.btnSauvegarder).not.toBeVisible();
  await expect(demarrage.btnTheme).toBeVisible();
});

test("E2E-02 — Créer un nouveau fichier depuis les données d'exemple", async ({ page }) => {
  const demarrage = new SelecteursDemarrage(page);
  await page.goto('/maclasse/#/demarrage');

  await demarrage.btnCreer.click();
  await page.waitForURL('**/accueil');

  await expect(demarrage.navAccueil).toBeVisible();
  await expect(demarrage.btnSauvegarder).toBeVisible();
  await expect(demarrage.btnAnnuler).toBeVisible();
  await expect(demarrage.btnRefaire).toBeVisible();
});

testAvecZip(
  'E2E-03 — Charger un fichier ZIP valide avec le bon mot de passe',
  async ({ appVersDemanrage, cheminZip, motDePasseTest }) => {
    const demarrage = new SelecteursDemarrage(appVersDemanrage);

    await demarrage.chargerZip(cheminZip, motDePasseTest);
    await appVersDemanrage.waitForURL('**/accueil', { timeout: 15_000 });

    await expect(demarrage.navAccueil).toBeVisible();
    await expect(demarrage.messageErreur).not.toBeVisible();
  },
);

testAvecZip(
  'E2E-04 — Charger un fichier ZIP avec un mauvais mot de passe',
  async ({ appVersDemanrage, cheminZip }) => {
    const demarrage = new SelecteursDemarrage(appVersDemanrage);

    await demarrage.chargerZip(cheminZip, 'mauvaismdp');

    await expect(demarrage.messageErreur).toBeVisible();
    await expect(demarrage.btnCharger).toBeEnabled();
    await expect(appVersDemanrage).toHaveURL(/\/demarrage/);
  },
);

testAvecZip(
  'E2E-05 — Bouton CHARGER désactivé tant que les champs sont vides',
  async ({ appVersDemanrage, cheminZip }) => {
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
  },
);

// E2E-06 : bouton œil non présent dans l'implémentation actuelle (champ password sans toggle visible)

testAvecDonnees(
  "E2E-07 — Changement de thème depuis l'écran de démarrage",
  async ({ appAvecDonnees }) => {
    const demarrage = new SelecteursDemarrage(appAvecDonnees);
    const html = appAvecDonnees.locator('html');

    const themeInitial = await html.getAttribute('data-theme');
    await demarrage.btnTheme.click();
    const themeApres = await html.getAttribute('data-theme');
    expect(themeApres).not.toBe(themeInitial);

    // Après rechargement, le thème est conservé via localStorage
    await appAvecDonnees.reload();
    await expect(appAvecDonnees.locator('html')).toHaveAttribute('data-theme', themeApres ?? '');
  },
);

testAvecZip(
  'E2E-125 — Fichier d’une version antérieure : migration vers les temps multiples sans perte',
  async ({ appVersDemanrage, cheminZip, motDePasseTest }) => {
    const demarrage = new SelecteursDemarrage(appVersDemanrage);
    const edt = new SelecteursEmploiDuTemps(appVersDemanrage);

    // Le ZIP de test est au format 2026.09.1 : créneaux à plat (heureDebut/heureFin au niveau du créneau)
    // et aucun emploi du temps calculé.
    await demarrage.chargerZip(cheminZip, motDePasseTest);
    await appVersDemanrage.waitForURL('**/accueil', { timeout: 15_000 });
    await demarrage.navEmploiDuTemps.click();

    await edt.btnEdtSemainePaire.click();
    await expect(edt.conteneurGrille).toContainText('Lecture – Compréhension de texte');
    await expect(edt.lignesBandeauAbsences).toHaveCount(2);

    // Chaque ancien créneau est devenu un créneau à un seul temps, avec son horaire d'origine
    await edt.premierCreneauSemainePaire.click();
    await expect(edt.blocsTemps).toHaveCount(1);
    await expect(edt.inputTitreTemps0).toHaveValue('Lecture – Compréhension de texte');
    await expect(edt.inputHeureDebutTemps0).toHaveValue('08:30');
    await expect(edt.inputHeureFinTemps0).toHaveValue('09:15');

    // Le tableau des EDT calculés, absent des anciens fichiers, existe et est vide
    await edt.btnAnnulerCreneau.click();
    await expect(edt.listeEdtsCalcules).toHaveCount(0);
    await edt.btnCreerEdtCalcule.click();
    await edt.inputNomEdtCalcule.fill('Calcul après migration');
    await edt.chipSourceTempsHorsClasse.click();
    await edt.btnEnregistrerEdtCalcule.click();
    await expect(edt.listeEdtsCalcules).toContainText('Calcul après migration');
  },
);

testAvecZip(
  'E2E-126 — Fichier d’une version plus récente : erreur bloquante, puis chargement d’un fichier valide',
  async ({ appVersDemanrage, cheminZip, cheminZipVersionFuture, motDePasseTest }) => {
    const demarrage = new SelecteursDemarrage(appVersDemanrage);

    await demarrage.chargerZip(cheminZipVersionFuture, motDePasseTest);

    await expect(demarrage.messageErreur).toContainText('version plus récente');
    await expect(demarrage.btnCharger).toBeEnabled();
    await expect(appVersDemanrage).toHaveURL(/\/demarrage/);
    await expect(demarrage.navAccueil).not.toBeVisible();
    await expect(demarrage.btnSauvegarder).not.toBeVisible();

    // Le mot de passe du fichier refusé n'est pas retenu : un fichier valide se charge normalement
    await demarrage.chargerZip(cheminZip, motDePasseTest);
    await appVersDemanrage.waitForURL('**/accueil', { timeout: 15_000 });
    await expect(demarrage.navAccueil).toBeVisible();
    await expect(demarrage.messageErreur).not.toBeVisible();
  },
);
