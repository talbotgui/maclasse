import { testAvecDonnees, expect } from '../fixtures';
import { SelecteursProjets } from '../selecteurs/selecteurs-projets';
import { SelecteursEntete } from '../selecteurs/selecteurs-entete';

// Données du jeu d'exemple :
// - 3 projets : "Journal de la classe" (FR, EMC, QLM), "Potager pédagogique" (MAT, QLM), "Spectacle de fin d'année" (EMC, EPS)
// - "Journal" a 5 périodes, "Potager" a 5 périodes, "Spectacle" a 2 périodes (Période 4, Période 5)
// - 11 élèves disponibles pour les associer à un projet

testAvecDonnees('E2E-31 — Créer un nouveau projet', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const projets = new SelecteursProjets(appAvecDonnees);

  await entete.navProjets.click();
  await expect(appAvecDonnees).toHaveURL(/\/projets/);

  await projets.btnCreerProjet.click();
  await projets.champFormNomProjet.fill('Potager solidaire');
  await projets.btnEnregistrerProjet.click();

  // Fiche en lecture seule avec le nom saisi
  await expect(projets.titreFiche).toContainText('Potager solidaire');
  // UNDO disponible
  await expect(entete.btnAnnuler).toBeEnabled();
});

testAvecDonnees(
  "E2E-32 — Modifier les informations générales d'un projet",
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const projets = new SelecteursProjets(appAvecDonnees);

    await entete.navProjets.click();
    await projets.btnProjetJournal.click();
    await projets.btnModifierProjet.click();

    await projets.champFormDescProjet.fill('Une nouvelle description de test');
    // Basculer le premier chip élève
    await projets.premierChipEleveProjet.click();
    await projets.btnEnregistrerProjet.click();

    // La description mise à jour est affichée en lecture seule
    await expect(projets.descriptionFiche).toContainText('Une nouvelle description de test');
    await expect(entete.btnAnnuler).toBeEnabled();
  },
);

testAvecDonnees("E2E-33 — Annuler la modification d'un projet", async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const projets = new SelecteursProjets(appAvecDonnees);

  await entete.navProjets.click();
  await projets.btnProjetJournal.click();
  await projets.btnModifierProjet.click();

  // Modifier le nom sans enregistrer
  await projets.champFormNomProjet.fill('Nom modifié temporaire');
  await projets.btnAnnulerProjet.click();

  // Le nom original est restauré dans la fiche
  await expect(projets.titreFiche).toContainText('Journal de la classe');
  // Aucune mutation → ANNULER entête inactif
  await expect(entete.btnAnnuler).toBeDisabled();
});

testAvecDonnees('E2E-34 — Ajouter une période à un projet', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const projets = new SelecteursProjets(appAvecDonnees);

  // "Spectacle de fin d'année" a 2 périodes (index 0 et 1) — la nouvelle sera à l'index 2
  await entete.navProjets.click();
  await projets.btnProjetSpectacle.click();
  await projets.btnModifierProjet.click();

  await projets.btnAjouterPeriodeProjet.click();
  await projets.champPeriodeNomProjet2.fill('Période test');
  await projets.btnEnregistrerProjet.click();

  // La nouvelle période apparaît dans la liste des périodes en lecture seule
  await expect(projets.listePeriodesFiche).toContainText('Période test');
  await expect(entete.btnAnnuler).toBeEnabled();
});

testAvecDonnees("E2E-35 — Supprimer une période d'un projet", async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const projets = new SelecteursProjets(appAvecDonnees);

  // "Spectacle" a Période 4 (index 0) et Période 5 (index 1)
  await entete.navProjets.click();
  await projets.btnProjetSpectacle.click();
  await projets.btnModifierProjet.click();

  // Supprimer la période à l'index 0 (Période 4)
  await projets.btnSupprimerPeriodeProjet0.click();
  await projets.btnSupprimerPeriodeProjet0Confirmer.click();
  await projets.btnEnregistrerProjet.click();

  // La période supprimée n'apparaît plus, la période 5 reste
  await expect(projets.listePeriodesFiche).not.toContainText('Période 4');
  await expect(projets.listePeriodesFiche).toContainText('Période 5');
  await expect(entete.btnAnnuler).toBeEnabled();
});

testAvecDonnees('E2E-36 — Filtre textuel sur la liste des projets', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const projets = new SelecteursProjets(appAvecDonnees);

  await entete.navProjets.click();

  // Filtrer par "pot" → seul "Potager pédagogique" visible
  await projets.champRechercheProjet.fill('pot');
  await expect(projets.btnProjetPotager).toBeVisible();
  await expect(projets.btnProjetJournal).not.toBeVisible();
  await expect(projets.btnProjetSpectacle).not.toBeVisible();

  // Effacer → tous les projets réapparaissent
  await projets.champRechercheProjet.fill('');
  await expect(projets.btnProjetJournal).toBeVisible();
  await expect(projets.btnProjetPotager).toBeVisible();
  await expect(projets.btnProjetSpectacle).toBeVisible();
});

testAvecDonnees(
  'E2E-37 — Filtre par chip de domaine de compétences sur les projets',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const projets = new SelecteursProjets(appAvecDonnees);

    await entete.navProjets.click();

    // Filtre FR → seul "Journal de la classe" (domaine FR)
    await projets.chipDomaineFR.click();
    await expect(projets.btnProjetJournal).toBeVisible();
    await expect(projets.btnProjetPotager).not.toBeVisible();
    await expect(projets.btnProjetSpectacle).not.toBeVisible();

    // Cumul FR + MAT → Journal (FR) et Potager (MAT), Spectacle toujours masqué
    await projets.chipDomaineMAT.click();
    await expect(projets.btnProjetJournal).toBeVisible();
    await expect(projets.btnProjetPotager).toBeVisible();
    await expect(projets.btnProjetSpectacle).not.toBeVisible();

    // Déselectionner FR → seul Potager (MAT) visible
    await projets.chipDomaineFR.click();
    await expect(projets.btnProjetJournal).not.toBeVisible();
    await expect(projets.btnProjetPotager).toBeVisible();
    await expect(projets.btnProjetSpectacle).not.toBeVisible();
  },
);

testAvecDonnees('E2E-38 — Supprimer un projet', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const projets = new SelecteursProjets(appAvecDonnees);

  await entete.navProjets.click();

  // Créer un projet temporaire pour ne pas modifier les données existantes
  await projets.btnCreerProjet.click();
  await projets.champFormNomProjet.fill('À supprimer');
  await projets.btnEnregistrerProjet.click();
  await expect(projets.titreFiche).toContainText('À supprimer');

  // Supprimer depuis la fiche en lecture seule
  await projets.btnSupprimerProjet.click();
  await projets.btnSupprimerProjetConfirmer.click();

  // La colonne droite est vide (aucun projet sélectionné)
  await expect(projets.messageAucunProjetSelectionne).toBeVisible();
  await expect(entete.btnAnnuler).toBeEnabled();
});

testAvecDonnees("E2E-39 — Imprimer la fiche d'un projet", async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const projets = new SelecteursProjets(appAvecDonnees);

  await entete.navProjets.click();
  await projets.btnProjetPotager.click();

  // Le bouton IMPRIMER est visible et actif en mode lecture seule
  await expect(projets.btnImprimerProjet).toBeVisible();
  await expect(projets.btnImprimerProjet).toBeEnabled();

  // La boîte d'impression du navigateur n'est pas testable en headless.
  // On vérifie que la colonne gauche est visible (masquée en @media print).
  await expect(appAvecDonnees.locator('.projets__gauche')).toBeVisible();
});
