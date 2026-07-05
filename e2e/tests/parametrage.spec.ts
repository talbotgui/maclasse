import { testAvecDonnees, expect } from '../fixtures';
import { SelecteursParametrage } from '../selecteurs/selecteurs-parametrage';
import { SelecteursEntete } from '../selecteurs/selecteurs-entete';

// Données du jeu d'exemple :
// - Enseignant : Minerva McGonagall, classe CM1-CM2
// - 5 périodes scolaires, jours ouvrés lundi–vendredi, 3 groupes (A/B/C)
// - 4 statuts d'acquisition, 3 statuts d'élève, 5 types de contact
// - 3 raisons d'absence, 3 fréquences d'absence, 18 domaines de compétences
// - Plusieurs référentiels sont déjà utilisés (statut "Dans la classe", groupe "A")

testAvecDonnees('E2E-80 — Navigation entre les sections du paramétrage', async ({ appAvecDonnees }) => {
  // TODO: naviguer vers Paramétrage, cliquer successivement sur chaque bouton de section
  // (btnSectionenseignantClasse, btnSectionperiodes, btnSectionsemaineHoraires, btnSectiongroupes,
  // btnSectionbareme, btnSectionstatutsEleve, btnSectiontypesContact, btnSectionraisonsAbsence,
  // btnSectionfrequencesAbsence, btnSectionjoursFeries, btnSectionpreferences, btnSectiondomainesCompetences),
  // vérifier que chaque clic charge le contenu de la section correspondante
});

testAvecDonnees('E2E-81 — Modifier les informations Enseignant & Classe', async ({ appAvecDonnees }) => {
  // TODO: naviguer vers Paramétrage, cliquer btnSectionenseignantClasse,
  // modifier le prénom dans champEnseignantPrenom, modifier le nom dans champEnseignantNom,
  // cliquer btnEnregistrerEnseignant, vérifier que ANNULER de l'entête est activé,
  // revenir sur la section et vérifier les nouvelles valeurs persistées
});

testAvecDonnees('E2E-82 — Annuler des modifications dans Enseignant & Classe', async ({ appAvecDonnees }) => {
  // TODO: modifier le prénom, cliquer btnAnnulerEnseignant,
  // vérifier que la valeur originale est restaurée et qu'ANNULER entête est inactif
});

testAvecDonnees('E2E-83 — Ajouter une période scolaire', async ({ appAvecDonnees }) => {
  // TODO: naviguer vers la section Périodes (btnSectionperiodes),
  // cliquer btnAjouterPeriode, remplir libellé "Période test", date début, date fin,
  // cliquer btnEnregistrerPeriode (nouvelle ligne, index = nombre de périodes existantes),
  // vérifier que la période apparaît dans la liste
});

testAvecDonnees('E2E-84 — Supprimer une période scolaire non utilisée', async ({ appAvecDonnees }) => {
  // TODO: ajouter une période "À supprimer" via btnAjouterPeriode et l'enregistrer,
  // cliquer son bouton SUPPRIMER puis CONFIRMER,
  // vérifier que la période n'apparaît plus dans la liste
});

testAvecDonnees('E2E-85 — Configurer les jours ouvrés dans Semaine & Horaires', async ({ appAvecDonnees }) => {
  // TODO: naviguer vers la section Semaine & Horaires (btnSectionsemaineHoraires),
  // décocher chipJourmercredi (si coché), cliquer btnEnregistrerSemaineHoraires,
  // naviguer vers l'écran Emploi du temps et vérifier que la colonne Mercredi disparaît de la grille
});

testAvecDonnees('E2E-86 — Modifier les horaires de la semaine', async ({ appAvecDonnees }) => {
  // TODO: dans la section Semaine & Horaires, modifier l'heure de début (champHeureDebutJournee),
  // cliquer btnEnregistrerSemaineHoraires, vérifier la valeur persistée
});

testAvecDonnees('E2E-87 — Ajouter un groupe', async ({ appAvecDonnees }) => {
  // TODO: naviguer vers la section Groupes (btnSectiongroupes),
  // cliquer btnAjouterGroupe, remplir le libellé "Groupe D" dans le nouveau champGroupeLibelle,
  // cliquer btnEnregistrerGroupe correspondant, vérifier que "Groupe D" apparaît dans la liste
});

testAvecDonnees('E2E-88 — Supprimer un groupe non utilisé', async ({ appAvecDonnees }) => {
  // TODO: créer un groupe "À supprimer" et l'enregistrer,
  // cliquer son btnSupprimerGroupe puis btnSupprimerGroupe_confirmer,
  // vérifier que le groupe disparaît de la liste
});

testAvecDonnees('E2E-89 — Bouton SUPPRIMER désactivé pour un groupe utilisé', async ({ appAvecDonnees }) => {
  // TODO: naviguer vers la section Groupes, repérer le groupe "A" (utilisé par des élèves),
  // vérifier que son bouton SUPPRIMER est disabled et qu'un tooltip décrit la raison
});

testAvecDonnees('E2E-90 — Ajouter un statut d\'acquisition dans le barème', async ({ appAvecDonnees }) => {
  // TODO: naviguer vers la section Barème (btnSectionbareme),
  // cliquer btnAjouterBareme, remplir identifiant "TST", glyphe "✓", libellé "Test",
  // cliquer btnEnregistrerBareme correspondant,
  // vérifier que le statut apparaît dans la liste avec l'aperçu visuel
});

testAvecDonnees('E2E-91 — Ajouter un statut d\'élève', async ({ appAvecDonnees }) => {
  // TODO: naviguer vers la section Statuts d'élève (btnSectionstatutsEleve),
  // cliquer btnAjouterStatutEleve, remplir le libellé "Stagiaire",
  // cliquer btnEnregistrerStatutEleve correspondant,
  // vérifier que le statut apparaît dans la liste
});

testAvecDonnees('E2E-92 — Ajouter un type de contact', async ({ appAvecDonnees }) => {
  // TODO: naviguer vers la section Types de contact (btnSectiontypesContact),
  // cliquer btnAjouterTypeContact, remplir identifiant "T" et libellé "Tuteur",
  // enregistrer, vérifier la présence dans la liste
});

testAvecDonnees('E2E-93 — Ajouter une raison d\'absence', async ({ appAvecDonnees }) => {
  // TODO: naviguer vers la section Raisons d'absence (btnSectionraisonsAbsence),
  // cliquer btnAjouterRaisonAbsence, remplir le libellé "Rendez-vous médical",
  // enregistrer, vérifier la présence dans la liste
});

testAvecDonnees('E2E-94 — Ajouter une fréquence d\'absence', async ({ appAvecDonnees }) => {
  // TODO: naviguer vers la section Fréquences d'absence (btnSectionfrequencesAbsence),
  // cliquer btnAjouterFrequenceAbsence, remplir le libellé "1 semaine sur 3",
  // enregistrer, vérifier la présence dans la liste
});

testAvecDonnees('E2E-95 — Ajouter un jour férié', async ({ appAvecDonnees }) => {
  // TODO: naviguer vers la section Jours fériés (btnSectionjoursFeries),
  // cliquer btnAjouterJourFerie, remplir la date et le libellé "Armistice",
  // enregistrer, vérifier la présence dans la liste
});

testAvecDonnees('E2E-96 — Modifier le délai de sauvegarde automatique dans Préférences', async ({ appAvecDonnees }) => {
  // TODO: naviguer vers la section Préférences (btnSectionpreferences),
  // modifier le délai dans champDelaiSauvegardeAuto, cliquer btnEnregistrerPreferences,
  // vérifier que la valeur est persistée (ANNULER entête activé)
});

testAvecDonnees('E2E-97 — Activer/désactiver un domaine de compétences', async ({ appAvecDonnees }) => {
  // TODO: naviguer vers la section Domaines de compétences (btnSectiondomainesCompetences),
  // décocher checkDomaine0, enregistrer,
  // naviguer vers l'écran Compétences, vérifier que le domaine désactivé n'apparaît plus dans l'arbre,
  // revenir dans Paramétrage, recocher checkDomaine0 et enregistrer (remise en état)
});
