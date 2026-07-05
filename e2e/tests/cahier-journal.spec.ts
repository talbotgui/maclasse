import { testAvecDonnees, expect } from '../fixtures';
import { SelecteursCahierJournal } from '../selecteurs/selecteurs-cahier-journal';
import { SelecteursEntete } from '../selecteurs/selecteurs-entete';

// Données du jeu d'exemple :
// - Le jeu de données par défaut positionne les journées CJ sur la semaine suivant le jour courant
//   (voir commit a06defe) — naviguer avec btnPlus7Jours pour atteindre des journées existantes
// - Des journées existent avec séances pédagogiques + récréations
// - Élèves avec absences récurrentes (déclenche le warning d'absences)

testAvecDonnees('E2E-63 — Navigation temporelle J−1 / J+1 / J−7 / J+7', async ({ appAvecDonnees }) => {
  // TODO: naviguer vers Cahier journal, relever la date affichée,
  // cliquer btnMoins1Jour, vérifier que la date a reculé d'un jour,
  // cliquer btnPlus1Jour, vérifier retour à la date initiale,
  // cliquer btnMoins7Jours, vérifier recul de 7 jours,
  // cliquer btnPlus7Jours, vérifier retour
});

testAvecDonnees('E2E-64 — Navigation via le mini-calendrier (mois précédent / clic sur un jour)', async ({ appAvecDonnees }) => {
  // TODO: naviguer vers Cahier journal, cliquer btnMoisPrecedent,
  // vérifier que le mois du calendrier change, cliquer sur un jour cliquable,
  // vérifier que la zone centrale charge la journée correspondante
});

testAvecDonnees('E2E-65 — Mémorisation du dernier jour consulté', async ({ appAvecDonnees }) => {
  // TODO: naviguer vers CJ, naviguer vers un jour via btnPlus7Jours, relever la date affichée,
  // naviguer vers Élèves via entete.navEleves,
  // revenir vers CJ via entete.navCahierJournal,
  // vérifier que la même date est rechargée automatiquement
});

testAvecDonnees('E2E-66 — Initialiser une journée vide', async ({ appAvecDonnees }) => {
  // TODO: naviguer vers un jour sans journée CJ (naviguer jusqu'à un jour sans données),
  // vérifier que btnInitialiserVide est visible, cliquer dessus,
  // vérifier que la zone centrale affiche une journée vide avec btnAjouterSeance
  // et que btnSupprimerJournee est visible
});

testAvecDonnees('E2E-67 — Initialiser une journée depuis l\'EDT', async ({ appAvecDonnees }) => {
  // TODO: naviguer vers un jour sans journée CJ correspondant à un jour couvert par un EDT existant,
  // vérifier que btnInitialiserEdt est visible, cliquer dessus,
  // vérifier que des séances issues de l'EDT apparaissent dans la liste, dans l'ordre chronologique
});

testAvecDonnees('E2E-68 — Boutons d\'initialisation désactivés si la journée existe déjà', async ({ appAvecDonnees }) => {
  // TODO: naviguer vers un jour qui a déjà une journée CJ (btnPlus7Jours),
  // vérifier que btnInitialiserVide et btnInitialiserEdt sont disabled
});

testAvecDonnees('E2E-69 — Créer une séance via le bouton AJOUTER UNE SÉANCE', async ({ appAvecDonnees }) => {
  // TODO: naviguer vers une journée existante, cliquer btnAjouterSeance,
  // remplir champHeureDebutSeance "09:00", champHeureFinSeance "10:00",
  // sélectionner type Pédagogique dans selectTypeSeance, saisir "Dictée" dans champTitreSeance,
  // cliquer btnEnregistrerSeance, vérifier que la séance apparaît dans la liste
});

testAvecDonnees('E2E-70 — Modifier une séance existante', async ({ appAvecDonnees }) => {
  // TODO: naviguer vers une journée avec séances, cliquer btnModifierPremierSeance,
  // modifier le titre dans champTitreSeance, ajouter du texte dans textareaObjectifsSeance,
  // cliquer btnEnregistrerSeance, vérifier la mise à jour dans la liste
});

testAvecDonnees('E2E-71 — Annuler la modification d\'une séance', async ({ appAvecDonnees }) => {
  // TODO: naviguer vers une journée avec séances, cliquer btnModifierPremierSeance,
  // modifier le titre, cliquer btnAnnulerSeance,
  // vérifier que le titre d'origine est restauré et le formulaire fermé
});

testAvecDonnees('E2E-72 — Réorganiser les séances avec les flèches haut/bas', async ({ appAvecDonnees }) => {
  // TODO: naviguer vers une journée avec au moins 2 séances,
  // noter le titre de la première séance, cliquer btnDescendrePremierSeance,
  // vérifier que la séance est passée en 2e position dans la liste
});

testAvecDonnees('E2E-73 — Champs absents pour les séances de type récréation', async ({ appAvecDonnees }) => {
  // TODO: naviguer vers une journée existante, cliquer btnAjouterSeance,
  // sélectionner "Récréation" dans selectTypeSeance,
  // vérifier que champTitreSeance, textareaObjectifsSeance et textareaDeroulementSeance ne sont pas visibles
});

testAvecDonnees('E2E-74 — Supprimer une séance', async ({ appAvecDonnees }) => {
  // TODO: naviguer vers une journée avec plusieurs séances,
  // cliquer btnModifierPremierSeance pour ouvrir le formulaire,
  // cliquer btnSupprimerPremierSeance puis CONFIRMER,
  // vérifier que la séance a disparu de la liste
});

testAvecDonnees('E2E-75 — Dupliquer une séance vers un autre jour', async ({ appAvecDonnees }) => {
  // TODO: naviguer vers une journée avec séances, cliquer btnDupliquerPremierSeance,
  // saisir une date cible dans inputDateDuplication, cliquer btnConfirmerDuplication,
  // naviguer vers la date cible, vérifier que la séance dupliquée apparaît
});

testAvecDonnees('E2E-76 — Warning d\'absence récurrente après enregistrement d\'une séance', async ({ appAvecDonnees }) => {
  // TODO: naviguer vers un mardi (jour d'absence récurrente d'un élève dans les données),
  // initialiser la journée si vide, créer une séance 10:00–11:00 pédagogique avec l'élève concerné,
  // enregistrer, vérifier qu'une icône d'avertissement apparaît sur la séance,
  // cliquer sur l'icône, vérifier que la popin d'avertissements s'ouvre,
  // cliquer btnWarningsFermer, vérifier que la popin se ferme
});

testAvecDonnees('E2E-77 — Supprimer la journée entière', async ({ appAvecDonnees }) => {
  // TODO: naviguer vers une journée CJ existante avec séances,
  // cliquer btnSupprimerJournee puis CONFIRMER,
  // vérifier que les séances ont disparu et que btnInitialiserVide est de nouveau visible,
  // vérifier que le jour n'est plus mis en évidence dans le mini-calendrier
});

testAvecDonnees('E2E-78 — Dupliquer la journée entière vers un autre jour', async ({ appAvecDonnees }) => {
  // TODO: naviguer vers une journée CJ avec plusieurs séances, noter le nombre de séances,
  // cliquer btnDupliquerJournee, saisir une date cible dans inputDateDuplication,
  // cliquer btnConfirmerDuplication,
  // naviguer vers la date cible, vérifier que le même nombre de séances s'y trouve
});

testAvecDonnees('E2E-79 — Imprimer la journée du cahier journal', async ({ appAvecDonnees }) => {
  // TODO: naviguer vers une journée CJ existante, cliquer btnImprimerCj,
  // vérifier que la boîte de dialogue d'impression du navigateur s'ouvre
});
