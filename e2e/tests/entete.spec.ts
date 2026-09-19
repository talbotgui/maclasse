import { testAvecDonnees, expect } from '../fixtures';
import { SelecteursEntete } from '../selecteurs/selecteurs-entete';
import { SelecteursEleves } from '../selecteurs/selecteurs-eleves';
import { SelecteursDemarrage } from '../selecteurs/selecteurs-demarrage';
import { SelecteursParametrage } from '../selecteurs/selecteurs-parametrage';

// Données réelles du jeu de données d'exemple utilisées dans ces tests :
// - Élève recherché : "Martinot Boule" (nom "Martinot", id "f1a2b3c4-...")
// - Projet recherché : "Potager pédagogique"

testAvecDonnees(
  "E2E-08 — Navigation entre les écrans via les boutons de l'entête",
  async ({ appAvecDonnees }) => {
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
  },
);

testAvecDonnees('E2E-09 — Recherche globale : trouver un élève', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);

  await entete.rechercherEtAttendre('martinot');

  await expect(entete.listeResultatsRecherche).toBeVisible();
  await expect(entete.typeDuPremierResultat).toHaveText('eleve');
  await expect(entete.titreDuPremierResultat).toContainText('Martinot');
});

testAvecDonnees(
  'E2E-10 — Recherche globale : naviguer vers un élève au clic sur le résultat',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const eleves = new SelecteursEleves(appAvecDonnees);

    await entete.rechercherEtAttendre('martinot');
    await entete.premierResultatRecherche.click();

    await expect(appAvecDonnees).toHaveURL(/\/eleves/);
    // La fiche de Martinot Boule est affichée
    await expect(eleves.titreFiche).toContainText('MARTINOT');
  },
);

testAvecDonnees(
  'E2E-11 — Recherche globale : trouver et naviguer vers un projet',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);

    await entete.rechercherEtAttendre('potager');

    await expect(entete.typeDuResultatPotager).toHaveText('projet');
    await entete.resultatPotager.click();

    await expect(appAvecDonnees).toHaveURL(/\/projets/);
  },
);

testAvecDonnees(
  'E2E-12 — Première sauvegarde : popin de saisie du mot de passe',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const eleves = new SelecteursEleves(appAvecDonnees);

    // Faire une modification pour activer le bouton SAUVEGARDER
    await entete.navEleves.click();
    await eleves.btnCreerEleve.click();
    await eleves.remplirBandeau('Alice', 'DUPONT');
    await eleves.btnEnregistrer.click();

    // Maintenant SAUVEGARDER doit être actif
    await expect(entete.btnSauvegarder).toBeEnabled();

    await entete.btnSauvegarder.click();

    // La popin de sauvegarde s'ouvre (premier enregistrement : mot de passe demandé)
    await expect(entete.champMotDePasseSauvegarde).toBeVisible();
    await entete.champMotDePasseSauvegarde.fill('monmdptest');

    const [download] = await Promise.all([
      appAvecDonnees.waitForEvent('download'),
      entete.btnSauvegardeConfirmer.click(),
    ]);

    // Le téléchargement a eu lieu
    expect(download.suggestedFilename()).toMatch(/\.zip$/);
  },
);

testAvecDonnees(
  'E2E-13 — Sauvegarde ultérieure : sans popin si mot de passe mémorisé',
  async ({ appAvecDonnees }) => {
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
  },
);

testAvecDonnees(
  'E2E-14 — Boutons ANNULER et REFAIRE : état selon la pile UNDO',
  async ({ appAvecDonnees }) => {
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
  },
);

testAvecDonnees(
  'E2E-15 — Changement de thème : cycle entre les thèmes',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const html = appAvecDonnees.locator('html');

    let cycles = 0;
    const theme1 = await html.getAttribute('data-theme');

    await entete.btnTheme.click();
    cycles++;
    const theme2 = await html.getAttribute('data-theme');
    expect(theme2).not.toBe(theme1);

    await entete.btnTheme.click();
    cycles++;
    const theme3 = await html.getAttribute('data-theme');
    expect(theme3).not.toBe(theme2);

    // Après N clics, cycle revient au début
    while ((await html.getAttribute('data-theme')) !== theme1 && cycles < 10) {
      await entete.btnTheme.click();
      cycles++;
    }
    expect(cycles).toBe(5);
  },
);

testAvecDonnees(
  'E2E-119 — Sauvegarde automatique : seulement si des données ont été modifiées',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const eleves = new SelecteursEleves(appAvecDonnees);
    const telechargements: string[] = [];
    appAvecDonnees.on('download', (telechargement) => {
      telechargements.push(telechargement.suggestedFilename());
    });
    // L'horloge est installée après le chargement : seul le timer créé ensuite (à la première
    // sauvegarde manuelle) est simulé, ce qui suffit ici.
    await appAvecDonnees.clock.install();

    // Première sauvegarde manuelle : mémorise le mot de passe et démarre le timer (5 min par défaut)
    await entete.navEleves.click();
    await eleves.btnCreerEleve.click();
    await eleves.remplirBandeau('Alice', 'ZEBULON');
    await eleves.btnEnregistrer.click();
    await entete.btnSauvegarder.click();
    await entete.champMotDePasseSauvegarde.fill('monmdptest');
    await entete.btnSauvegardeConfirmer.click();
    await expect.poll(() => telechargements.length).toBe(1);

    // Échéance du timer sans aucune modification : pas de nouveau fichier
    await appAvecDonnees.clock.fastForward('06:00');
    // Le chiffrement et le téléchargement sont asynchrones (temps réel) : on laisse à un éventuel
    // téléchargement parasite le temps de se produire avant de vérifier qu'il n'a pas eu lieu.
    await appAvecDonnees.waitForTimeout(1000);
    expect(telechargements).toHaveLength(1);
    await expect(entete.btnSauvegarder).toBeDisabled();

    // Après une modification, l'échéance suivante déclenche la sauvegarde
    await eleves.btnCreerEleve.click();
    await eleves.remplirBandeau('Bob', 'MARTIN');
    await eleves.btnEnregistrer.click();
    await expect(entete.btnSauvegarder).toBeEnabled();
    await appAvecDonnees.clock.fastForward('06:00');

    await expect.poll(() => telechargements.length).toBeGreaterThanOrEqual(2);
    await expect(entete.btnSauvegarder).toBeDisabled();
    // Exactement 2 fichiers : la première échéance, sans modification, n'a rien téléchargé
    expect(telechargements).toHaveLength(2);
  },
);

testAvecDonnees(
  'E2E-120 — Sauvegarde automatique : le délai modifié dans Préférences relance le timer',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const eleves = new SelecteursEleves(appAvecDonnees);
    const param = new SelecteursParametrage(appAvecDonnees);
    const telechargements: string[] = [];
    appAvecDonnees.on('download', (telechargement) => {
      telechargements.push(telechargement.suggestedFilename());
    });
    await appAvecDonnees.clock.install();

    await entete.navEleves.click();
    await eleves.btnCreerEleve.click();
    await eleves.remplirBandeau('Alice', 'ZEBULON');
    await eleves.btnEnregistrer.click();
    await entete.btnSauvegarder.click();
    await entete.champMotDePasseSauvegarde.fill('monmdptest');
    await entete.btnSauvegardeConfirmer.click();
    await expect.poll(() => telechargements.length).toBe(1);

    // Délai ramené à 1 minute : le timer déjà actif est relancé avec cette valeur
    await entete.navParametrage.click();
    await param.btnSectionPreferences.click();
    await param.champDelaiSauvegarde.fill('1');
    await param.btnEnregistrerPreferences.click();

    // Le changement de préférences est lui-même une modification à sauvegarder
    await appAvecDonnees.clock.fastForward('01:10');
    await expect.poll(() => telechargements.length).toBe(2);
  },
);

testAvecDonnees(
  'E2E-121 — Aller-retour : un fichier sauvegardé recharge les modifications',
  async ({ appAvecDonnees }, testInfo) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const eleves = new SelecteursEleves(appAvecDonnees);
    const demarrage = new SelecteursDemarrage(appAvecDonnees);
    const cheminFichier = testInfo.outputPath('sauvegarde.zip');

    await entete.navEleves.click();
    await eleves.btnCreerEleve.click();
    await eleves.remplirBandeau('Alice', 'ZEBULON');
    await eleves.btnEnregistrer.click();
    await expect(eleves.listeEleves).toContainText('ZEBULON');

    await entete.btnSauvegarder.click();
    await entete.champMotDePasseSauvegarde.fill('monmdptest');
    const [telechargement] = await Promise.all([
      appAvecDonnees.waitForEvent('download'),
      entete.btnSauvegardeConfirmer.click(),
    ]);
    await telechargement.saveAs(cheminFichier);

    // Nouvelle session : on repart de /demarrage puis on recharge la page pour perdre les données en mémoire
    // (le goto seul ne change que le hash, c'est le reload qui réinitialise l'application)
    await appAvecDonnees.goto('/maclasse/#/demarrage');
    await appAvecDonnees.reload();
    await demarrage.chargerZip(cheminFichier, 'monmdptest');
    await appAvecDonnees.waitForURL('**/accueil', { timeout: 15_000 });

    await entete.navEleves.click();
    await expect(eleves.listeEleves).toContainText('ZEBULON');
  },
);
