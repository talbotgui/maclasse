import { testAvecDonnees, expect } from '../fixtures';
import { SelecteursEntete } from '../selecteurs/selecteurs-entete';
import { SelecteursEleves } from '../selecteurs/selecteurs-eleves';

// Données réelles du jeu de données d'exemple utilisées dans ces tests :
// - Élève recherché : "Martinot Boule" (nom "Martinot", id "f1a2b3c4-...")
// - Projet recherché : "Potager pédagogique"

testAvecDonnees('E2E-08 — Navigation entre les écrans via les boutons de l\'entête', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);

  await entete.navEleves.click();
  await expect(appAvecDonnees).toHaveURL(/\/eleves/);
  await expect(entete.navEleves).toHaveClass(/actif/);

  await entete.navProjets.click();
  await expect(appAvecDonnees).toHaveURL(/\/projets/);
  await expect(entete.navProjets).toHaveClass(/actif/);

  await entete.navCompetences.click();
  await expect(appAvecDonnees).toHaveURL(/\/competences/);

  await entete.navEmploiDuTemps.click();
  await expect(appAvecDonnees).toHaveURL(/\/emploi-du-temps/);

  await entete.navCahierJournal.click();
  await expect(appAvecDonnees).toHaveURL(/\/cahier-journal/);

  await entete.navParametrage.click();
  await expect(appAvecDonnees).toHaveURL(/\/parametrage/);

  await entete.navAccueil.click();
  await expect(appAvecDonnees).toHaveURL(/\/accueil/);
  // Aucune redirection vers /demarrage
  await expect(appAvecDonnees).not.toHaveURL(/\/demarrage/);
});

testAvecDonnees('E2E-09 — Recherche globale : trouver un élève', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);

  await entete.rechercherEtAttendre('martinot');

  await expect(entete.listeResultatsRecherche).toBeVisible();
  const premierResultat = entete.listeResultatsRecherche.locator('[role="option"]').first();
  await expect(premierResultat.locator('.mc-entete__resultat-type')).toHaveText('eleve');
  await expect(premierResultat.locator('.mc-entete__resultat-titre')).toContainText('Martinot');
});

testAvecDonnees('E2E-10 — Recherche globale : naviguer vers un élève au clic sur le résultat', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const eleves = new SelecteursEleves(appAvecDonnees);

  await entete.rechercherEtAttendre('martinot');
  await entete.premierResultatRecherche.click();

  await expect(appAvecDonnees).toHaveURL(/\/eleves/);
  // La fiche de Martinot Boule est affichée
  await expect(eleves.titreFiche).toContainText('MARTINOT');
});

testAvecDonnees('E2E-11 — Recherche globale : trouver et naviguer vers un projet', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);

  await entete.rechercherEtAttendre('potager');

  const projetResultat = entete.listeResultatsRecherche
    .locator('[role="option"]')
    .filter({ hasText: 'Potager' })
    .first();
  await expect(projetResultat.locator('.mc-entete__resultat-type')).toHaveText('projet');
  await projetResultat.click();

  await expect(appAvecDonnees).toHaveURL(/\/projets/);
});

testAvecDonnees('E2E-12 — Première sauvegarde : popin de saisie du mot de passe', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const eleves = new SelecteursEleves(appAvecDonnees);

  // Faire une modification pour activer le bouton SAUVEGARDER
  await entete.navEleves.click();
  await eleves.btnCreerEleve.click();
  await eleves.remplirBandeau('Alice', 'DUPONT');
  await eleves.btnEnregistrer.click();

  // Maintenant SAUVEGARDER doit être actif
  await expect(entete.btnSauvegarder).toBeEnabled();

  const [download] = await Promise.all([
    appAvecDonnees.waitForEvent('download'),
    entete.btnSauvegarder.click(),
  ]);

  // La popin de sauvegarde s'ouvre (premier enregistrement : mot de passe demandé)
  await expect(entete.champMotDePasseSauvegarde).toBeVisible();
  await entete.champMotDePasseSauvegarde.fill('monmdptest');
  await entete.btnSauvegardeConfirmer.click();

  // Le téléchargement a eu lieu
  expect(download.suggestedFilename()).toMatch(/\.zip$/);
});

testAvecDonnees('E2E-13 — Sauvegarde ultérieure : sans popin si mot de passe mémorisé', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const eleves = new SelecteursEleves(appAvecDonnees);

  // Première sauvegarde pour mémoriser le mot de passe
  await entete.navEleves.click();
  await eleves.btnCreerEleve.click();
  await eleves.remplirBandeau('Alice', 'DUPONT');
  await eleves.btnEnregistrer.click();

  await entete.btnSauvegarder.click();
  await expect(entete.champMotDePasseSauvegarde).toBeVisible();
  await entete.champMotDePasseSauvegarde.fill('monmdptest');
  await entete.btnSauvegardeConfirmer.click();

  // Deuxième modification + sauvegarde : aucune popin attendue
  await eleves.btnCreerEleve.click();
  await eleves.remplirBandeau('Bob', 'MARTIN');
  await eleves.btnEnregistrer.click();

  const [download] = await Promise.all([
    appAvecDonnees.waitForEvent('download'),
    entete.btnSauvegarder.click(),
  ]);

  await expect(entete.champMotDePasseSauvegarde).not.toBeVisible();
  expect(download.suggestedFilename()).toMatch(/\.zip$/);
});

testAvecDonnees('E2E-14 — Boutons ANNULER et REFAIRE : état selon la pile UNDO', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const eleves = new SelecteursEleves(appAvecDonnees);

  await entete.navEleves.click();

  // État initial : pile vide
  await expect(entete.btnAnnuler).toBeDisabled();
  await expect(entete.btnRefaire).toBeDisabled();

  // Créer un élève
  await eleves.btnCreerEleve.click();
  await eleves.remplirBandeau('Alice', 'DUPONT');
  await eleves.btnEnregistrer.click();
  await expect(entete.btnAnnuler).toBeEnabled();
  await expect(entete.btnRefaire).toBeDisabled();

  // Annuler
  await entete.btnAnnuler.click();
  await expect(eleves.messageAucunEleveSelectionne).toBeVisible();
  await expect(entete.btnAnnuler).toBeDisabled();
  await expect(entete.btnRefaire).toBeEnabled();

  // Refaire
  await entete.btnRefaire.click();
  await expect(eleves.titreFiche).toContainText('DUPONT');
  await expect(entete.btnAnnuler).toBeEnabled();
  await expect(entete.btnRefaire).toBeDisabled();
});

testAvecDonnees('E2E-15 — Changement de thème : cycle entre les thèmes', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const html = appAvecDonnees.locator('html');

  const theme1 = await html.getAttribute('data-theme');
  await entete.btnTheme.click();
  const theme2 = await html.getAttribute('data-theme');
  expect(theme2).not.toBe(theme1);

  await entete.btnTheme.click();
  const theme3 = await html.getAttribute('data-theme');
  expect(theme3).not.toBe(theme2);

  // Après N clics, cycle revient au début
  let cycles = 0;
  while (await html.getAttribute('data-theme') !== theme1 && cycles < 10) {
    await entete.btnTheme.click();
    cycles++;
  }
  await expect(html).toHaveAttribute('data-theme', theme1 ?? '');
});
