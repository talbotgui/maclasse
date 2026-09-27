import { testAvecDonnees, expect } from '../fixtures';
import { SelecteursEmploiDuTemps } from '../selecteurs/selecteurs-emploi-du-temps';
import { SelecteursEntete } from '../selecteurs/selecteurs-entete';
import { SelecteursParametrage } from '../selecteurs/selecteurs-parametrage';

// Données du jeu d'exemple :
// - 3 EDT : "Semaine paire" (id et000001..., freq=paire), "Semaine impaire" (et000002..., freq=impaire),
//           "Semaine complète" (id et000003..., freq=lesDeux)
// - Chaque EDT : 55 créneaux, toutes les cellules remplies (lundi–vendredi × 11 créneaux/jour)
// - Premier créneau de "Semaine paire" : id=cr000001-...-000001, lundi 08:30–09:15,
//   titre="Lecture – Compréhension de texte", type=pedagogique
// - Jours ouvrés : lundi–vendredi (joursOuvres par défaut), heureDebutJournee=08:30

testAvecDonnees(
  'E2E-52 — Sélectionner un EDT existant dans la liste',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const edt = new SelecteursEmploiDuTemps(appAvecDonnees);

    await entete.navEmploiDuTemps.click();
    await expect(appAvecDonnees).toHaveURL(/\/emploi-du-temps/);

    // Sélectionner "Semaine paire"
    await edt.btnEdtSemainePaire.click();

    // La grille s'affiche avec des créneaux
    await expect(edt.premierCreneauGrille).toBeVisible();

    // Le formulaire EDT est ouvert dans la colonne droite
    await expect(edt.inputNomEdt).toBeVisible();
    await expect(edt.inputNomEdt).toHaveValue('Semaine paire — 1ère partie');
  },
);

testAvecDonnees('E2E-53 — Créer un nouvel EDT', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const edt = new SelecteursEmploiDuTemps(appAvecDonnees);

  await entete.navEmploiDuTemps.click();
  await edt.btnCreerEdt.click();

  // Le formulaire EDT vide s'affiche dans la colonne droite
  await expect(edt.inputNomEdt).toBeVisible();
  await expect(edt.inputNomEdt).toHaveValue('');

  // La grille est vide (aucun EDT sélectionné → edtSelectionne = null)
  await expect(edt.grilleVide).toBeVisible();
});

testAvecDonnees(
  "E2E-54 — Renseigner et enregistrer les propriétés d'un EDT",
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const edt = new SelecteursEmploiDuTemps(appAvecDonnees);

    await entete.navEmploiDuTemps.click();
    await edt.btnCreerEdt.click();

    // Saisir le nom et choisir la fréquence
    await edt.inputNomEdt.fill('EDT test');
    await edt.selectFrequenceEdt.selectOption('paire');
    await edt.btnEnregistrerEdt.click();

    // L'EDT "EDT test" apparaît dans la liste de gauche
    await expect(edt.listeEdts).toContainText('EDT test');
    await expect(entete.btnAnnuler).toBeEnabled();
  },
);

testAvecDonnees(
  "E2E-55 — Annuler les modifications des propriétés d'un EDT",
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const edt = new SelecteursEmploiDuTemps(appAvecDonnees);

    await entete.navEmploiDuTemps.click();
    await edt.btnEdtSemainePaire.click();

    // Modifier le nom, annule
    await edt.inputNomEdt.fill('Nom modifié temporaire');
    await edt.btnAnnulerEdt.click();

    // Le champ n'existe plus dans le DOM
    await expect(edt.inputNomEdt).toHaveCount(0);

    // Aucune mutation → ANNULER entête inactif
    await expect(entete.btnAnnuler).toBeDisabled();
    await expect(edt.listeEdts).not.toContainText('Nom modifié temporaire');
    await expect(edt.conteneurGrille).toBeVisible();
  },
);

testAvecDonnees(
  "E2E-56 — Ajouter un créneau pédagogique via le bouton AJOUTER d'une colonne",
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const edt = new SelecteursEmploiDuTemps(appAvecDonnees);

    await entete.navEmploiDuTemps.click();
    await edt.btnEdtSemaineComplete.click();

    // Cliquer le bouton AJOUTER en bas de la colonne lundi
    await edt.btnNouveauCreneauLigne.click();

    // Le formulaire créneau s'ouvre (type pédagogique par défaut → inputTitreTemps0 visible)
    await expect(edt.inputTitreTemps0).toBeVisible();

    // Saisir un titre reconnaissable
    await edt.inputTitreTemps0.fill('Titre test E2E-56');
    await edt.btnEnregistrerCreneau.click();

    // Le créneau apparaît dans la grille
    await expect(edt.conteneurGrille).toContainText('Titre test E2E-56');
    await expect(entete.btnAnnuler).toBeEnabled();
  },
);

testAvecDonnees(
  'E2E-57 — Ajouter un créneau via le bouton intercalaire "+" dans la grille',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const edt = new SelecteursEmploiDuTemps(appAvecDonnees);

    await entete.navEmploiDuTemps.click();

    // Créer un EDT vide pour avoir des cellules libres dans la grille
    await edt.btnCreerEdt.click();
    await edt.inputNomEdt.fill('EDT test E2E-57');
    await edt.btnEnregistrerEdt.click();

    // Ajouter un premier créneau sur lundi (heures par défaut 08:00-09:00)
    await edt.btnNouveauCreneauLigne.click();
    await edt.inputTitreTemps0.fill('Premier créneau lundi');
    await edt.btnEnregistrerCreneau.click();

    // La grille a maintenant une ligne 08:00-09:00 avec lundi rempli et les autres jours vides
    // btnAjouterCreneauCelluleVide = premier "+" dans une cellule vide (mardi 08:00)
    await edt.btnAjouterCreneauCelluleVide.click();

    // Le formulaire créneau s'ouvre pour le deuxième jour
    await expect(edt.inputTitreTemps0).toBeVisible();
    await edt.inputTitreTemps0.fill('Test intercalaire mardi');
    await edt.btnEnregistrerCreneau.click();

    // Le créneau apparaît dans la grille
    await expect(edt.conteneurGrille).toContainText('Test intercalaire mardi');
  },
);

testAvecDonnees('E2E-58 — Modifier un créneau existant', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const edt = new SelecteursEmploiDuTemps(appAvecDonnees);

  await entete.navEmploiDuTemps.click();
  await edt.btnEdtSemainePaire.click();

  // Cliquer sur le premier créneau de "Semaine paire" (lundi 08:30 "Lecture – Compréhension de texte")
  await edt.premierCreneauSemainePaire.click();

  // Le formulaire créneau s'ouvre avec le titre existant
  await expect(edt.inputTitreTemps0).toBeVisible();

  // Modifier le titre
  await edt.inputTitreTemps0.fill('Titre modifié E2E-58');
  await edt.btnEnregistrerCreneau.click();

  // La grille reflète le nouveau titre
  await expect(edt.conteneurGrille).toContainText('Titre modifié E2E-58');
  await expect(entete.btnAnnuler).toBeEnabled();
});

testAvecDonnees("E2E-59 — Annuler la modification d'un créneau", async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const edt = new SelecteursEmploiDuTemps(appAvecDonnees);

  await entete.navEmploiDuTemps.click();
  await edt.btnEdtSemainePaire.click();

  // Cliquer sur le premier créneau et modifier le titre sans enregistrer
  await edt.premierCreneauSemainePaire.click();
  await edt.inputTitreTemps0.fill('Modifié temporaire');
  await edt.btnAnnulerCreneau.click();

  // ANNULER ferme le formulaire mais l'EDT reste sélectionné et sa grille affichée
  await expect(edt.inputTitreTemps0).toHaveCount(0);
  await expect(edt.droiteVide).toHaveCount(0);
  await expect(edt.conteneurGrille).toContainText('Lecture – Compréhension de texte');
  // La saisie abandonnée n'a pas modifié le créneau
  await expect(edt.conteneurGrille).not.toContainText('Modifié temporaire');
  // Aucune mutation → ANNULER entête inactif
  await expect(entete.btnAnnuler).toBeDisabled();
});

testAvecDonnees('E2E-60 — Supprimer un créneau', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const edt = new SelecteursEmploiDuTemps(appAvecDonnees);

  await entete.navEmploiDuTemps.click();
  await edt.btnEdtSemainePaire.click();

  // Ouvrir le premier créneau (lundi 08:30 "Lecture – Compréhension de texte")
  await edt.premierCreneauSemainePaire.click();
  await expect(edt.inputTitreTemps0).toBeVisible();

  // Supprimer le créneau
  await edt.btnSupprimerCreneau.click();
  await edt.btnSupprimerCreneauConfirmer.click();

  // Le bouton de ce créneau spécifique n'existe plus dans la grille
  await expect(edt.premierCreneauSemainePaire).not.toBeVisible();
  await expect(entete.btnAnnuler).toBeEnabled();
});

testAvecDonnees('E2E-61 — Supprimer un EDT (et tous ses créneaux)', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const edt = new SelecteursEmploiDuTemps(appAvecDonnees);

  await entete.navEmploiDuTemps.click();

  // Créer un EDT temporaire
  await edt.btnCreerEdt.click();
  await edt.inputNomEdt.fill('À supprimer E2E-61');
  await edt.btnEnregistrerEdt.click();
  await expect(edt.listeEdts).toContainText('À supprimer E2E-61');

  // Supprimer l'EDT
  await edt.btnSupprimerEdt.click();
  await edt.btnSupprimerEdtConfirmer.click();

  // L'EDT a disparu de la liste
  await expect(edt.listeEdts).not.toContainText('À supprimer E2E-61');

  // La zone droite affiche le message "aucun EDT sélectionné"
  await expect(edt.droiteVide).toBeVisible();
  await expect(entete.btnAnnuler).toBeEnabled();
});

testAvecDonnees("E2E-62 — Imprimer la grille de l'EDT", async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const edt = new SelecteursEmploiDuTemps(appAvecDonnees);

  await entete.navEmploiDuTemps.click();
  await edt.btnEdtSemainePaire.click();
  await expect(edt.premierCreneauGrille).toBeVisible();

  // Le bouton IMPRIMER est visible et actif
  await expect(edt.btnImprimerEdt).toBeVisible();
  await expect(edt.btnImprimerEdt).toBeEnabled();

  // La boîte d'impression du navigateur n'est pas testable en headless :
  // on émule le média print et les événements beforeprint/afterprint.
  await appAvecDonnees.emulateMedia({ media: 'print' });
  await expect(edt.colonneGauche).toBeHidden();
  await expect(edt.colonneDroite).toBeHidden();
  await expect(edt.conteneurGrille).toBeVisible();

  // Pendant l'impression, le titre du document porte les métadonnées de l'EDT
  const titreApplication = await appAvecDonnees.title();
  await appAvecDonnees.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
  await expect(appAvecDonnees).toHaveTitle(/^Semaine paire — 1ère partie \(.*Semaines paires\)$/);
  await appAvecDonnees.evaluate(() => window.dispatchEvent(new Event('afterprint')));
  await expect(appAvecDonnees).toHaveTitle(titreApplication);

  await appAvecDonnees.emulateMedia({ media: 'screen' });
  await expect(edt.colonneGauche).toBeVisible();
});

testAvecDonnees(
  'E2E-105 — Titre du formulaire de créneau : « Créer » pour un nouveau, « Modifier » pour un existant',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const edt = new SelecteursEmploiDuTemps(appAvecDonnees);

    await entete.navEmploiDuTemps.click();
    await edt.btnEdtSemainePaire.click();

    await edt.btnNouveauCreneauLigne.click();
    await expect(edt.titreFormulaireCreneau).toContainText('Créer');
    await expect(edt.btnSupprimerCreneau).toHaveCount(0);

    await edt.btnAnnulerCreneau.click();
    await edt.premierCreneauSemainePaire.click();
    await expect(edt.titreFormulaireCreneau).toContainText('Modifier');
    await expect(edt.btnSupprimerCreneau).toBeVisible();
  },
);

testAvecDonnees(
  'E2E-108 — Bandeau d’absences régulières : il suit la parité de l’EDT sélectionné',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const edt = new SelecteursEmploiDuTemps(appAvecDonnees);

    await entete.navEmploiDuTemps.click();
    await expect(edt.bandeauAbsences).toHaveCount(0);

    // Semaine paire : les absences « lesDeux » seulement (Ariol est en semaine impaire)
    await edt.btnEdtSemainePaire.click();
    await expect(edt.lignesBandeauAbsences).toHaveCount(2);
    await expect(edt.bandeauAbsences).toContainText('Ducobu');
    await expect(edt.bandeauAbsences).toContainText('Petit-Tonnerre');
    await expect(edt.bandeauAbsences).not.toContainText('Blanche-Oreille');

    // Semaine impaire : l'absence d'Ariol s'ajoute
    await edt.btnEdtSemaineImpaire.click();
    await expect(edt.lignesBandeauAbsences).toHaveCount(3);
    await expect(edt.bandeauAbsences).toContainText('Blanche-Oreille');
  },
);

testAvecDonnees(
  'E2E-109 — Icône ⚠ de conflit : détail de l’absence dans la popin',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const edt = new SelecteursEmploiDuTemps(appAvecDonnees);

    await entete.navEmploiDuTemps.click();
    await edt.btnEdtSemaineComplete.click();
    await expect(edt.iconesConflit.first()).toBeVisible();

    await edt.iconesConflit.first().click();
    await expect(entete.dialogueOuvert).toBeVisible();
    await expect(edt.listeConflitsPopin).toContainText(/Ducobu|Petit-Tonnerre|Blanche-Oreille/);

    await edt.btnWarningsFermer.click();
    await expect(entete.dialogueOuvert).toHaveCount(0);
  },
);

testAvecDonnees(
  'E2E-110 — Conflits d’absence : la parité de semaine est respectée',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const edt = new SelecteursEmploiDuTemps(appAvecDonnees);

    await entete.navEmploiDuTemps.click();
    await edt.btnEdtSemainePaire.click();
    // Le bandeau (2 absences en semaine paire) sert de point de synchronisation avec le rendu de l'EDT
    await expect(edt.lignesBandeauAbsences).toHaveCount(2);
    await expect(edt.iconesConflit.first()).toBeVisible();
    const conflitsSemainePaire = await edt.iconesConflit.count();

    // L'absence d'Ariol (semaine impaire) ne génère de conflit qu'en semaine impaire
    await edt.btnEdtSemaineImpaire.click();
    await expect(edt.lignesBandeauAbsences).toHaveCount(3);
    await expect(edt.iconesConflit.first()).toBeVisible();
    const conflitsSemaineImpaire = await edt.iconesConflit.count();

    expect(conflitsSemaineImpaire).toBeGreaterThan(conflitsSemainePaire);
  },
);

testAvecDonnees(
  'E2E-111 — Créneau à temps multiples : ajout jusqu’à 4 temps, suppression d’un temps',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const edt = new SelecteursEmploiDuTemps(appAvecDonnees);

    await entete.navEmploiDuTemps.click();
    await edt.btnCreerEdt.click();
    await edt.inputNomEdt.fill('EDT temps multiples');
    await edt.btnEnregistrerEdt.click();
    await edt.btnNouveauCreneauLigne.click();
    await expect(edt.blocsTemps).toHaveCount(1);

    await edt.inputTitreTemps0.fill('Premier temps');
    await edt.btnAjouterTemps.click();
    await expect(edt.blocsTemps).toHaveCount(2);
    await edt.inputTitreTemps1.fill('Deuxième temps');

    await edt.btnAjouterTemps.click();
    await edt.btnAjouterTemps.click();
    await expect(edt.blocsTemps).toHaveCount(4);
    await expect(edt.btnAjouterTemps).toBeDisabled();

    await edt.btnSupprimerTemps3.click();
    await edt.btnSupprimerTemps3Confirmer.click();
    await expect(edt.blocsTemps).toHaveCount(3);
    await expect(edt.btnAjouterTemps).toBeEnabled();

    await edt.btnEnregistrerCreneau.click();
    await expect(edt.conteneurGrille).toContainText('Premier temps');
    await expect(edt.conteneurGrille).toContainText('Deuxième temps');
  },
);

testAvecDonnees(
  'E2E-112 — EDT calculé : créer une définition et afficher la grille en lecture seule',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const edt = new SelecteursEmploiDuTemps(appAvecDonnees);

    await entete.navEmploiDuTemps.click();
    // Contrôle : sur un EDT ordinaire, les boutons d'édition existent
    await edt.btnEdtSemainePaire.click();
    await expect(edt.boutonsCreneauEditable.first()).toBeVisible();
    await expect(edt.boutonsAjoutCreneau.first()).toBeVisible();

    await edt.btnCreerEdtCalcule.click();
    await edt.inputNomEdtCalcule.fill('Récréations et classe');
    await edt.chipSourceRecreation.click();
    await edt.chipSourceTempsClasse.click();
    await edt.btnEnregistrerEdtCalcule.click();

    await expect(edt.listeEdtsCalcules).toContainText('Récréations et classe');
    await edt.btnPremierEdtCalcule.click();
    await expect(edt.cellulesCalculees.first()).toBeVisible();
    await expect(edt.boutonsCreneauEditable).toHaveCount(0);
    await expect(edt.boutonsAjoutCreneau).toHaveCount(0);
    await expect(entete.btnAnnuler).toBeEnabled();
  },
);

testAvecDonnees(
  'E2E-113 — EDT calculé : nom et source obligatoires',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const edt = new SelecteursEmploiDuTemps(appAvecDonnees);

    await entete.navEmploiDuTemps.click();
    await edt.btnCreerEdtCalcule.click();
    await expect(edt.erreurEdtCalcule).toHaveCount(0);

    await edt.btnEnregistrerEdtCalcule.click();
    await expect(edt.erreurEdtCalcule).toBeVisible();

    await edt.inputNomEdtCalcule.fill('Sans source');
    await edt.btnEnregistrerEdtCalcule.click();
    await expect(edt.erreurEdtCalcule).toBeVisible();

    await edt.chipSourceRecreation.click();
    await edt.btnEnregistrerEdtCalcule.click();
    await expect(edt.listeEdtsCalcules).toContainText('Sans source');
  },
);

testAvecDonnees(
  'E2E-114 — EDT calculé : la source « absences régulières » affiche les absences des élèves',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const edt = new SelecteursEmploiDuTemps(appAvecDonnees);

    await entete.navEmploiDuTemps.click();
    await edt.btnCreerEdtCalcule.click();
    await edt.inputNomEdtCalcule.fill('Absences');
    await edt.chipSourceAbsencesRegulieres.click();
    await edt.btnEnregistrerEdtCalcule.click();
    await edt.btnPremierEdtCalcule.click();

    await expect(edt.cellulesCalculees.filter({ hasText: 'Inclusion' })).not.toHaveCount(0);
    await expect(edt.cellulesCalculees.filter({ hasText: 'Orthophoniste' })).not.toHaveCount(0);
  },
);

testAvecDonnees('E2E-115 — EDT calculé : modifier puis supprimer', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const edt = new SelecteursEmploiDuTemps(appAvecDonnees);

  await entete.navEmploiDuTemps.click();
  await edt.btnCreerEdtCalcule.click();
  await edt.inputNomEdtCalcule.fill('Calcul initial');
  await edt.chipSourceRecreation.click();
  await edt.btnEnregistrerEdtCalcule.click();

  await edt.btnPremierEdtCalcule.click();
  await edt.inputNomEdtCalcule.fill('Calcul renommé');
  await edt.btnEnregistrerEdtCalcule.click();
  await expect(edt.listeEdtsCalcules).toContainText('Calcul renommé');
  await expect(edt.listeEdtsCalcules).not.toContainText('Calcul initial');

  await edt.btnPremierEdtCalcule.click();
  await edt.btnSupprimerEdtCalcule.click();
  await edt.btnSupprimerEdtCalculeConfirmer.click();
  await expect(edt.listeEdtsCalcules).toHaveCount(0);
});

testAvecDonnees(
  'E2E-116 — EDT calculé : ANNULER, ANNULER/REFAIRE de l’entête',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const edt = new SelecteursEmploiDuTemps(appAvecDonnees);

    await entete.navEmploiDuTemps.click();
    await edt.btnCreerEdtCalcule.click();
    await edt.inputNomEdtCalcule.fill('Abandonné');
    await edt.btnAnnulerEdtCalcule.click();
    await expect(edt.listeEdtsCalcules).toHaveCount(0);
    await expect(entete.btnAnnuler).toBeDisabled();

    await edt.btnCreerEdtCalcule.click();
    await edt.inputNomEdtCalcule.fill('Conservé');
    await edt.chipSourceRecreation.click();
    await edt.btnEnregistrerEdtCalcule.click();
    await expect(edt.listeEdtsCalcules).toContainText('Conservé');

    await entete.btnAnnuler.click();
    await expect(edt.listeEdtsCalcules).toHaveCount(0);
    await entete.btnRefaire.click();
    await expect(edt.listeEdtsCalcules).toContainText('Conservé');
  },
);

testAvecDonnees(
  'E2E-118 — Pastilles : un temps destiné à un groupe l’affiche dans la grille, et le libellé suit le renommage du groupe',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const edt = new SelecteursEmploiDuTemps(appAvecDonnees);
    const param = new SelecteursParametrage(appAvecDonnees);

    await entete.navEmploiDuTemps.click();
    await edt.btnCreerEdt.click();
    await edt.inputNomEdt.fill('EDT pastilles');
    await edt.btnEnregistrerEdt.click();
    await edt.btnNouveauCreneauLigne.click();
    await edt.inputTitreTemps0.fill('Atelier');
    await edt.radioGroupesTemps0.check();
    await edt.chipGroupeATemps0.click();
    await edt.btnEnregistrerCreneau.click();
    await expect(edt.pastillesGrille.filter({ hasText: 'Groupe A' })).toHaveCount(1);

    await entete.navParametrage.click();
    await param.btnSectionGroupes.click();
    await param.champGroupeLibelle0.fill('Groupe Alpha');
    await param.btnEnregistrerGroupe0.click();

    await entete.navEmploiDuTemps.click();
    await edt.btnEdtPastilles.click();
    await expect(edt.pastillesGrille.filter({ hasText: 'Groupe Alpha' })).toHaveCount(1);
    await expect(edt.pastillesGrille.filter({ hasText: /^Groupe A$/ })).toHaveCount(0);
  },
);

testAvecDonnees(
  'E2E-122 — Créneau : changer le jour déplace le créneau dans la grille',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const edt = new SelecteursEmploiDuTemps(appAvecDonnees);

    await entete.navEmploiDuTemps.click();
    await edt.btnCreerEdt.click();
    await edt.inputNomEdt.fill('EDT déplacement');
    await edt.btnEnregistrerEdt.click();
    await edt.btnNouveauCreneauLigne.click();
    await edt.inputTitreTemps0.fill('Créneau mobile');
    await edt.btnEnregistrerCreneau.click();
    await expect(edt.celluleLundiPremiereLigne).toContainText('Créneau mobile');
    await expect(edt.celluleMardiPremiereLigne).not.toContainText('Créneau mobile');

    await edt.premierCreneauGrille.click();
    await edt.selectJourCreneau.selectOption('mardi');
    await edt.btnEnregistrerCreneau.click();

    await expect(edt.celluleMardiPremiereLigne).toContainText('Créneau mobile');
    await expect(edt.celluleLundiPremiereLigne).not.toContainText('Créneau mobile');
  },
);
