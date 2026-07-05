import { testAvecDonnees, expect } from '../fixtures';
import { SelecteursEmploiDuTemps } from '../selecteurs/selecteurs-emploi-du-temps';
import { SelecteursEntete } from '../selecteurs/selecteurs-entete';

// Données du jeu d'exemple :
// - 3 EDT : "Semaine paire" (id et000001..., freq=paire), "Semaine impaire" (et000002..., freq=impaire),
//           "Semaine complète" (id et000003..., freq=lesDeux)
// - Chaque EDT : 55 créneaux, toutes les cellules remplies (lundi–vendredi × 11 créneaux/jour)
// - Premier créneau de "Semaine paire" : id=cr000001-...-000001, lundi 08:30–09:15,
//   titre="Lecture – Compréhension de texte", type=pedagogique
// - Jours ouvrés : lundi–vendredi (joursOuvres par défaut), heureDebutJournee=08:30

testAvecDonnees('E2E-52 — Sélectionner un EDT existant dans la liste', async ({ appAvecDonnees }) => {
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
});

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

testAvecDonnees('E2E-54 — Renseigner et enregistrer les propriétés d\'un EDT', async ({ appAvecDonnees }) => {
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
});

testAvecDonnees('E2E-55 — Annuler les modifications des propriétés d\'un EDT', async ({ appAvecDonnees }) => {
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
});

testAvecDonnees('E2E-56 — Ajouter un créneau pédagogique via le bouton AJOUTER d\'une colonne', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const edt = new SelecteursEmploiDuTemps(appAvecDonnees);

  await entete.navEmploiDuTemps.click();
  await edt.btnEdtSemaineComplete.click();

  // Cliquer le bouton AJOUTER en bas de la colonne lundi
  await edt.btnNouveauCreneauLigne.click();

  // Le formulaire créneau s'ouvre (type pédagogique par défaut → inputTitreCreneau visible)
  await expect(edt.inputTitreCreneau).toBeVisible();

  // Saisir un titre reconnaissable
  await edt.inputTitreCreneau.fill('Titre test E2E-56');
  await edt.btnEnregistrerCreneau.click();

  // Le créneau apparaît dans la grille
  await expect(edt.conteneurGrille).toContainText('Titre test E2E-56');
  await expect(entete.btnAnnuler).toBeEnabled();
});

testAvecDonnees('E2E-57 — Ajouter un créneau via le bouton intercalaire "+" dans la grille', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const edt = new SelecteursEmploiDuTemps(appAvecDonnees);

  await entete.navEmploiDuTemps.click();

  // Créer un EDT vide pour avoir des cellules libres dans la grille
  await edt.btnCreerEdt.click();
  await edt.inputNomEdt.fill('EDT test E2E-57');
  await edt.btnEnregistrerEdt.click();

  // Ajouter un premier créneau sur lundi (heures par défaut 08:00-09:00)
  await edt.btnNouveauCreneauLigne.click();
  await edt.inputTitreCreneau.fill('Premier créneau lundi');
  await edt.btnEnregistrerCreneau.click();

  // La grille a maintenant une ligne 08:00-09:00 avec lundi rempli et les autres jours vides
  // btnAjouterCreneauCelluleVide = premier "+" dans une cellule vide (mardi 08:00)
  await edt.btnAjouterCreneauCelluleVide.click();

  // Le formulaire créneau s'ouvre pour le deuxième jour
  await expect(edt.inputTitreCreneau).toBeVisible();
  await edt.inputTitreCreneau.fill('Test intercalaire mardi');
  await edt.btnEnregistrerCreneau.click();

  // Le créneau apparaît dans la grille
  await expect(edt.conteneurGrille).toContainText('Test intercalaire mardi');
});

testAvecDonnees('E2E-58 — Modifier un créneau existant', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const edt = new SelecteursEmploiDuTemps(appAvecDonnees);

  await entete.navEmploiDuTemps.click();
  await edt.btnEdtSemainePaire.click();

  // Cliquer sur le premier créneau de "Semaine paire" (lundi 08:30 "Lecture – Compréhension de texte")
  await edt.premierCreneauSemainePaire.click();

  // Le formulaire créneau s'ouvre avec le titre existant
  await expect(edt.inputTitreCreneau).toBeVisible();

  // Modifier le titre
  await edt.inputTitreCreneau.fill('Titre modifié E2E-58');
  await edt.btnEnregistrerCreneau.click();

  // La grille reflète le nouveau titre
  await expect(edt.conteneurGrille).toContainText('Titre modifié E2E-58');
  await expect(entete.btnAnnuler).toBeEnabled();
});

testAvecDonnees('E2E-59 — Annuler la modification d\'un créneau', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const edt = new SelecteursEmploiDuTemps(appAvecDonnees);

  await entete.navEmploiDuTemps.click();
  await edt.btnEdtSemainePaire.click();

  // Cliquer sur le premier créneau et modifier le titre sans enregistrer
  await edt.premierCreneauSemainePaire.click();
  await edt.inputTitreCreneau.fill('Modifié temporaire');
  await edt.btnAnnulerCreneau.click();

  // Le titre d'origine est toujours dans la grille
  await expect(edt.conteneurGrille).toContainText('Lecture – Compréhension de texte');
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
  await expect(edt.inputTitreCreneau).toBeVisible();

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

testAvecDonnees('E2E-62 — Imprimer la grille de l\'EDT', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const edt = new SelecteursEmploiDuTemps(appAvecDonnees);

  await entete.navEmploiDuTemps.click();
  await edt.btnEdtSemainePaire.click();
  await expect(edt.premierCreneauGrille).toBeVisible();

  // Le bouton IMPRIMER est visible et actif
  await expect(edt.btnImprimerEdt).toBeVisible();
  await expect(edt.btnImprimerEdt).toBeEnabled();

  // La boîte d'impression du navigateur n'est pas testable en headless.
  // On vérifie que la zone de la grille reste visible (masquée uniquement en @media print).
  await expect(edt.conteneurGrille).toBeVisible();
});
