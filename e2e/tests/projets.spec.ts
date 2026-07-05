import { testAvecDonnees, expect } from '../fixtures';
import { SelecteursProjets } from '../selecteurs/selecteurs-projets';
import { SelecteursEntete } from '../selecteurs/selecteurs-entete';

// Données du jeu d'exemple :
// - 3 projets : "Journal de la classe" (APS), "Potager pédagogique" (APS+FR), "Spectacle de fin d'année" (APS+MAT)
// - 11 élèves disponibles pour les associer
// - Chaque projet a au moins une période avec des compétences

testAvecDonnees('E2E-31 — Créer un nouveau projet', async ({ appAvecDonnees }) => {
  // TODO: naviguer vers Projets, cliquer CRÉER, saisir le nom "Potager solidaire", enregistrer,
  // vérifier que le projet apparaît dans la liste et que la fiche s'affiche en lecture seule
});

testAvecDonnees('E2E-32 — Modifier les informations générales d\'un projet', async ({ appAvecDonnees }) => {
  // TODO: sélectionner "Journal de la classe", cliquer MODIFIER, modifier la description,
  // cocher un élève dans les chips, enregistrer, vérifier la description mise à jour en lecture seule
});

testAvecDonnees('E2E-33 — Annuler la modification d\'un projet', async ({ appAvecDonnees }) => {
  // TODO: sélectionner un projet, cliquer MODIFIER, changer le nom, cliquer ANNULER du formulaire,
  // vérifier que le nom original est restauré et qu'aucune mutation n'a été enregistrée (ANNULER entête inactif)
});

testAvecDonnees('E2E-34 — Ajouter une période à un projet', async ({ appAvecDonnees }) => {
  // TODO: sélectionner "Journal de la classe", cliquer MODIFIER, cliquer AJOUTER UNE PÉRIODE,
  // remplir nom "Période test", date début et fin, enregistrer, vérifier la période en lecture seule
});

testAvecDonnees('E2E-35 — Supprimer une période d\'un projet', async ({ appAvecDonnees }) => {
  // TODO: sélectionner un projet ayant au moins une période (index 0), cliquer MODIFIER,
  // cliquer SUPPRIMER sur la période 0, cliquer CONFIRMER, enregistrer,
  // vérifier que la période n'apparaît plus en lecture seule
});

testAvecDonnees('E2E-36 — Filtre textuel sur la liste des projets', async ({ appAvecDonnees }) => {
  // TODO: naviguer vers Projets, saisir "pot" dans champRechercheProjet,
  // vérifier que seul "Potager pédagogique" apparaît, effacer le filtre, vérifier les 3 projets
});

testAvecDonnees('E2E-37 — Filtre par chip de domaine de compétences sur les projets', async ({ appAvecDonnees }) => {
  // TODO: cliquer chipDomaineAPS, vérifier que les projets du domaine APS sont seuls affichés,
  // cliquer chipDomaineFR en plus (cumul), vérifier la liste étendue
});

testAvecDonnees('E2E-38 — Supprimer un projet', async ({ appAvecDonnees }) => {
  // TODO: créer un projet "À supprimer" et l'enregistrer, le sélectionner,
  // cliquer MODIFIER, cliquer SUPPRIMER puis CONFIRMER, vérifier qu'il disparaît de la liste
  // et que la colonne droite est vide
});

testAvecDonnees('E2E-39 — Imprimer la fiche d\'un projet', async ({ appAvecDonnees }) => {
  // TODO: sélectionner "Potager pédagogique", attendre la fiche en lecture seule,
  // cliquer btnImprimerProjet, vérifier que la boîte de dialogue d'impression s'ouvre
});
