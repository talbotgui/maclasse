import { testAvecDonnees, expect } from '../fixtures';
import { SelecteursEmploiDuTemps } from '../selecteurs/selecteurs-emploi-du-temps';
import { SelecteursEntete } from '../selecteurs/selecteurs-entete';

// Données du jeu d'exemple :
// - 3 EDT : "Semaine paire" (id et000001...), "Semaine impaire" (et000002...), "Semaine complète" (et000003...)
// - Chaque EDT contient 55 créneaux (lundi–vendredi × plusieurs tranches horaires)
// - Jours ouvrés : lundi–vendredi (mercredi inclus par défaut)

testAvecDonnees('E2E-52 — Sélectionner un EDT existant dans la liste', async ({ appAvecDonnees }) => {
  // TODO: naviguer vers Emploi du temps, cliquer btnEdtSemainePaire,
  // vérifier que la grille s'affiche (premierCreneauGrille visible) et que le formulaire EDT est ouvert
});

testAvecDonnees('E2E-53 — Créer un nouvel EDT', async ({ appAvecDonnees }) => {
  // TODO: cliquer btnCreerEdt, vérifier qu'un formulaire vide s'affiche (inputNomEdt visible),
  // vérifier que la grille est vide
});

testAvecDonnees('E2E-54 — Renseigner et enregistrer les propriétés d\'un EDT', async ({ appAvecDonnees }) => {
  // TODO: cliquer btnCreerEdt, saisir "EDT test" dans inputNomEdt,
  // choisir une fréquence dans selectFrequenceEdt, cliquer btnEnregistrerEdt,
  // vérifier que "EDT test" apparaît dans la liste de gauche
});

testAvecDonnees('E2E-55 — Annuler les modifications des propriétés d\'un EDT', async ({ appAvecDonnees }) => {
  // TODO: sélectionner un EDT existant, modifier le nom dans inputNomEdt, cliquer btnAnnulerEdt,
  // vérifier que le nom d'origine est restauré dans la liste et le formulaire
});

testAvecDonnees('E2E-56 — Ajouter un créneau pédagogique via le bouton AJOUTER d\'une colonne', async ({ appAvecDonnees }) => {
  // TODO: sélectionner btnEdtSemaineComplete, cliquer btnNouveauCreneauLigne (bouton du bas d'une colonne),
  // remplir heure début "09:00" (inputHeureDebutCreneau), heure fin "10:00" (inputHeureFinCreneau),
  // sélectionner type "Pédagogique" (selectTypeCreneau), saisir titre "Lecture" (inputTitreCreneau),
  // cliquer btnEnregistrerCreneau, vérifier que le créneau apparaît dans la grille
});

testAvecDonnees('E2E-57 — Ajouter un créneau via le bouton intercalaire "+" dans la grille', async ({ appAvecDonnees }) => {
  // TODO: sélectionner un EDT, cliquer btnAjouterCreneauCelluleVide (bouton "+" intercalaire),
  // remplir les champs et enregistrer, vérifier que le créneau est inséré dans la grille
});

testAvecDonnees('E2E-58 — Modifier un créneau existant', async ({ appAvecDonnees }) => {
  // TODO: sélectionner btnEdtSemainePaire, cliquer premierCreneauGrille,
  // modifier le titre dans inputTitreCreneau, cliquer btnEnregistrerCreneau,
  // vérifier que la grille reflète le nouveau titre
});

testAvecDonnees('E2E-59 — Annuler la modification d\'un créneau', async ({ appAvecDonnees }) => {
  // TODO: sélectionner un EDT, cliquer un créneau dans la grille, modifier le titre,
  // cliquer btnAnnulerCreneau, vérifier que le titre d'origine est conservé dans la grille
});

testAvecDonnees('E2E-60 — Supprimer un créneau', async ({ appAvecDonnees }) => {
  // TODO: sélectionner un EDT, cliquer premierCreneauGrille pour ouvrir le formulaire,
  // cliquer btnSupprimerCreneau, cliquer btnSupprimerCreneauConfirmer,
  // vérifier que le créneau n'apparaît plus dans la grille
});

testAvecDonnees('E2E-61 — Supprimer un EDT (et tous ses créneaux)', async ({ appAvecDonnees }) => {
  // TODO: créer un EDT "À supprimer" via btnCreerEdt et l'enregistrer,
  // cliquer btnSupprimerEdt, cliquer btnSupprimerEdtConfirmer,
  // vérifier que l'EDT n'apparaît plus dans la liste, grille et formulaire sont vides
});

testAvecDonnees('E2E-62 — Imprimer la grille de l\'EDT', async ({ appAvecDonnees }) => {
  // TODO: sélectionner btnEdtSemainePaire, attendre la grille,
  // cliquer btnImprimerEdt, vérifier que la boîte d'impression du navigateur s'ouvre
});
