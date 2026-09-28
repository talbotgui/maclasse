import { testAvecDonnees, expect } from '../fixtures';
import { SelecteursParametrage } from '../selecteurs/selecteurs-parametrage';
import { SelecteursEntete } from '../selecteurs/selecteurs-entete';
import { SelecteursEmploiDuTemps } from '../selecteurs/selecteurs-emploi-du-temps';

// Données du jeu d'exemple :
// - Enseignant : Minerva McGonagall, année 2025-2026
// - Classe     : niveau CM1-CM2, année scolaire "Double niveau CM1-CM2"
// - Config EDT : lundi–vendredi, 08:30–16:30
// - 3 groupes (A/B/C), groupe A utilisé par des élèves
// - 4 statuts acquisition, 3 statuts élève (DC utilisé), 5 types contact
// - 0 période scolaire, 0 jour férié
// - 18 domaines de compétences, domaine APS (index 0) inactif dans domainesActifs

testAvecDonnees(
  'E2E-80 — Navigation entre les sections du paramétrage',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const param = new SelecteursParametrage(appAvecDonnees);

    await entete.navParametrage.click();
    await expect(appAvecDonnees).toHaveURL(/\/parametrage/);

    await param.btnSectionEnseignantClasse.click();
    await expect(param.champPrenomEnseignant).toBeVisible();

    await param.btnSectionPeriodes.click();
    await expect(param.btnAjouterPeriode).toBeVisible();

    await param.btnSectionSemaineHoraires.click();
    await expect(param.chipJourLundi).toBeVisible();

    await param.btnSectionGroupes.click();
    await expect(param.btnAjouterGroupe).toBeVisible();

    await param.btnSectionBareme.click();
    await expect(param.btnAjouterStatut).toBeVisible();

    await param.btnSectionStatutsEleve.click();
    await expect(param.btnAjouterStatutEleve).toBeVisible();

    await param.btnSectionTypesContact.click();
    await expect(param.btnAjouterTypeContact).toBeVisible();

    await param.btnSectionJoursFeries.click();
    await expect(param.btnAjouterJourFerie).toBeVisible();

    await param.btnSectionPreferences.click();
    await expect(param.champDelaiSauvegarde).toBeVisible();

    await param.btnSectionDomainesCompetences.click();
    await expect(param.checkDomaine0).toBeVisible();
  },
);

testAvecDonnees(
  'E2E-81 — Modifier les informations Enseignant & Classe',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const param = new SelecteursParametrage(appAvecDonnees);

    await entete.navParametrage.click();
    await param.btnSectionEnseignantClasse.click();

    await param.champPrenomEnseignant.fill('Albus');
    await param.champNomEnseignant.fill('Dumbledore');
    await param.btnEnregistrerEnseignantClasse.click();

    // Les valeurs sont persistées et UNDO disponible
    await expect(param.champPrenomEnseignant).toHaveValue('Albus');
    await expect(param.champNomEnseignant).toHaveValue('Dumbledore');
    await expect(entete.btnAnnuler).toBeEnabled();
  },
);

testAvecDonnees(
  'E2E-82 — Annuler des modifications dans Enseignant & Classe',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const param = new SelecteursParametrage(appAvecDonnees);

    await entete.navParametrage.click();
    await param.btnSectionEnseignantClasse.click();

    // Modifier sans enregistrer puis annuler
    await param.champPrenomEnseignant.fill('Severus');
    await param.btnAnnulerEnseignantClasse.click();

    // La valeur originale est restaurée, pas de mutation
    await expect(param.champPrenomEnseignant).toHaveValue('Minerva');
    await expect(entete.btnAnnuler).toBeDisabled();
  },
);

testAvecDonnees('E2E-83 — Ajouter une période scolaire', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const param = new SelecteursParametrage(appAvecDonnees);

  await entete.navParametrage.click();
  await param.btnSectionPeriodes.click();

  // 5 périodes existantes (Période 1–5, index 0–4) → nouvelle à l'index 5
  await param.btnAjouterPeriode.click();
  await param.champPeriodeNom5.fill('Trimestre test');
  await param.champPeriodeDebut5.fill('2025-09-01');
  await param.champPeriodeFin5.fill('2025-12-19');
  await param.btnEnregistrerPeriode5.click();

  // La nouvelle période est enregistrée
  await expect(param.champPeriodeNom5).toHaveValue('Trimestre test');
  await expect(entete.btnAnnuler).toBeEnabled();
  await entete.navAccueil.click();
  await entete.navParametrage.click();
  await param.btnSectionPeriodes.click();
  await expect(param.champPeriodeNom5).toHaveValue('Trimestre test');
});

testAvecDonnees(
  'E2E-84 — Supprimer une période scolaire non utilisée',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const param = new SelecteursParametrage(appAvecDonnees);

    await entete.navParametrage.click();
    await param.btnSectionPeriodes.click();

    // Créer une période à supprimer (index 5 — après les 5 existantes)
    await param.btnAjouterPeriode.click();
    await param.champPeriodeNom5.fill('À supprimer');
    await param.btnEnregistrerPeriode5.click();

    // Supprimer la nouvelle période
    await param.btnSupprimerPeriode5.click();
    await param.btnSupprimerPeriode5Confirmer.click();

    // La période index 5 n'existe plus (retour à 5 entrées)
    await expect(param.champPeriodeNom5).not.toBeVisible();
    await expect(entete.btnAnnuler).toBeEnabled();
  },
);

testAvecDonnees(
  'E2E-85 — Configurer les jours ouvrés dans Semaine & Horaires',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const param = new SelecteursParametrage(appAvecDonnees);
    const edt = new SelecteursEmploiDuTemps(appAvecDonnees);

    await entete.navParametrage.click();
    await param.btnSectionSemaineHoraires.click();

    // Désélectionner Mercredi (actif par défaut)
    await param.chipJourMercredi.click();
    await param.btnEnregistrerSemaineHoraires.click();
    await expect(entete.btnAnnuler).toBeEnabled();

    // Naviguer vers EDT : la colonne Mercredi ne doit plus apparaître dans la grille
    await entete.navEmploiDuTemps.click();
    await edt.btnEdtSemainePaire.click();
    await expect(edt.grilleEntete).not.toContainText('Mercredi');
    await expect(edt.grilleEntete).toContainText('Lundi');
  },
);

testAvecDonnees('E2E-86 — Modifier les horaires de la semaine', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const param = new SelecteursParametrage(appAvecDonnees);

  await entete.navParametrage.click();
  await param.btnSectionSemaineHoraires.click();

  // Modifier l'heure de début (valeur par défaut : 08:30)
  await param.champHeureDebutJournee.fill('08:45');
  await param.btnEnregistrerSemaineHoraires.click();

  await expect(param.champHeureDebutJournee).toHaveValue('08:45');
  await expect(entete.btnAnnuler).toBeEnabled();
});

testAvecDonnees('E2E-87 — Ajouter un groupe', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const param = new SelecteursParametrage(appAvecDonnees);

  await entete.navParametrage.click();
  await param.btnSectionGroupes.click();

  // 3 groupes existants (A/B/C) → nouveau groupe à l'index 3
  await param.btnAjouterGroupe.click();
  await param.champGroupeLibelle3.fill('Groupe D');
  await param.btnEnregistrerGroupe3.click();

  await expect(param.champGroupeLibelle3).toHaveValue('Groupe D');
  await expect(entete.btnAnnuler).toBeEnabled();
  await entete.navAccueil.click();
  await entete.navParametrage.click();
  await param.btnSectionGroupes.click();
  await expect(param.champGroupeLibelle3).toHaveValue('Groupe D');
});

testAvecDonnees('E2E-88 — Supprimer un groupe non utilisé', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const param = new SelecteursParametrage(appAvecDonnees);

  await entete.navParametrage.click();
  await param.btnSectionGroupes.click();

  // Créer un groupe à supprimer (index 3)
  await param.btnAjouterGroupe.click();
  await param.champGroupeLibelle3.fill('À supprimer');
  await param.btnEnregistrerGroupe3.click();

  // Supprimer le groupe
  await param.btnSupprimerGroupe3.click();
  await param.btnSupprimerGroupe3Confirmer.click();

  // Le groupe n'existe plus
  await expect(param.champGroupeLibelle3).not.toBeVisible();
});

testAvecDonnees(
  'E2E-89 — Bouton SUPPRIMER désactivé pour un groupe utilisé',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const param = new SelecteursParametrage(appAvecDonnees);

    await entete.navParametrage.click();
    await param.btnSectionGroupes.click();

    // Groupe A (index 0) est utilisé par des élèves → SUPPRIMER doit être désactivé
    await expect(param.btnSupprimerGroupe0).toBeDisabled();
  },
);

testAvecDonnees(
  "E2E-90 — Ajouter un statut d'acquisition dans le barème",
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const param = new SelecteursParametrage(appAvecDonnees);

    await entete.navParametrage.click();
    await param.btnSectionBareme.click();

    // 4 statuts existants → nouveau à l'index 4
    await param.btnAjouterStatut.click();
    await param.champStatutId4.fill('TST');
    await param.champStatutGlyphe4.fill('✓');
    await param.champStatutLibelle4.fill('Test');
    await param.btnEnregistrerStatut4.click();

    await expect(param.champStatutLibelle4).toHaveValue('Test');
    await expect(entete.btnAnnuler).toBeEnabled();
    await entete.navAccueil.click();
    await entete.navParametrage.click();
    await param.btnSectionBareme.click();
    await expect(param.champStatutLibelle4).toHaveValue('Test');
  },
);

testAvecDonnees("E2E-91 — Ajouter un statut d'élève", async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const param = new SelecteursParametrage(appAvecDonnees);

  await entete.navParametrage.click();
  await param.btnSectionStatutsEleve.click();

  // 3 statuts existants → nouveau à l'index 3
  await param.btnAjouterStatutEleve.click();
  await param.champStatutEleveId3.fill('ST');
  await param.champStatutEleveLibelle3.fill('Stagiaire');
  await param.btnEnregistrerStatutEleve3.click();

  await expect(param.champStatutEleveLibelle3).toHaveValue('Stagiaire');
  await expect(entete.btnAnnuler).toBeEnabled();
});

testAvecDonnees('E2E-92 — Ajouter un type de contact', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const param = new SelecteursParametrage(appAvecDonnees);

  await entete.navParametrage.click();
  await param.btnSectionTypesContact.click();

  // 5 types existants → nouveau à l'index 5
  await param.btnAjouterTypeContact.click();
  await param.champTypeContactId5.fill('T');
  await param.champTypeContactLibelle5.fill('Tuteur');
  await param.btnEnregistrerTypeContact5.click();

  await expect(param.champTypeContactLibelle5).toHaveValue('Tuteur');
  await expect(entete.btnAnnuler).toBeEnabled();
});

// E2E-93 (raison d'absence) et E2E-94 (fréquence d'absence) supprimés avec SOU-031 :
// les référentiels "Raisons d'absence" et "Fréquences d'absence" ont été retirés de
// l'écran paramétrage (jamais utilisés ailleurs dans l'application).

testAvecDonnees('E2E-95 — Ajouter un jour férié', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const param = new SelecteursParametrage(appAvecDonnees);

  await entete.navParametrage.click();
  await param.btnSectionJoursFeries.click();

  // 10 jours fériés par défaut (index 0 à 9) : le nouveau est ajouté à l'index 10.
  // La date postérieure à tous les jours existants le laisse à cet index après enregistrement.
  await param.btnAjouterJourFerie.click();
  await param.champJourFerieNom10.fill('Armistice');
  await param.champJourFerieDate10.fill('2026-12-31');
  await param.btnEnregistrerJourFerie10.click();

  await expect(param.champJourFerieNom10).toHaveValue('Armistice');
  await expect(param.champJourFerieNom0).toHaveValue('Toussaint');
  await expect(entete.btnAnnuler).toBeEnabled();
});

testAvecDonnees(
  'E2E-96 — Modifier le délai de sauvegarde automatique dans Préférences',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const param = new SelecteursParametrage(appAvecDonnees);

    await entete.navParametrage.click();
    await param.btnSectionPreferences.click();

    // Valeur par défaut : 5 minutes → le bouton ENREGISTRER reste inactif tant que la valeur n'a pas changé
    await expect(param.btnEnregistrerPreferences).toBeDisabled();
    await param.champDelaiSauvegarde.fill('10');
    await param.btnEnregistrerPreferences.click();

    await expect(param.champDelaiSauvegarde).toHaveValue('10');
    await expect(entete.btnAnnuler).toBeEnabled();
  },
);

testAvecDonnees(
  'E2E-97 — Activer/désactiver un domaine de compétences',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const param = new SelecteursParametrage(appAvecDonnees);

    await entete.navParametrage.click();
    await param.btnSectionDomainesCompetences.click();

    // Domaine APS (index 0) est inactif par défaut (absent de domainesActifs)
    // → le cocher pour l'activer
    await expect(param.checkDomaine0).not.toBeChecked();
    await param.checkDomaine0.click();
    await expect(param.checkDomaine0).toBeChecked();
    await param.btnEnregistrerDomaines.click();
    await expect(entete.btnAnnuler).toBeEnabled();

    // Remettre en état (décocher APS)
    await param.btnSectionDomainesCompetences.click();
    await param.checkDomaine0.click();
    await param.btnEnregistrerDomaines.click();
    await expect(param.checkDomaine0).not.toBeChecked();
  },
);

testAvecDonnees(
  'E2E-103 — Délai de sauvegarde automatique hors bornes : erreur et ENREGISTRER inactif',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const param = new SelecteursParametrage(appAvecDonnees);

    await entete.navParametrage.click();
    await param.btnSectionPreferences.click();
    await expect(param.erreurDelaiSauvegarde).toHaveCount(0);

    await param.champDelaiSauvegarde.fill('0');
    await expect(param.erreurDelaiSauvegarde).toBeVisible();
    await expect(param.btnEnregistrerPreferences).toBeDisabled();

    await param.champDelaiSauvegarde.fill('61');
    await expect(param.erreurDelaiSauvegarde).toBeVisible();
    await expect(param.btnEnregistrerPreferences).toBeDisabled();

    await param.champDelaiSauvegarde.fill('60');
    await expect(param.erreurDelaiSauvegarde).toHaveCount(0);
    await expect(param.btnEnregistrerPreferences).toBeEnabled();
  },
);

testAvecDonnees(
  'E2E-135 — Identifiant saisi au clavier dans une nouvelle ligne : aucune perte de focus',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const param = new SelecteursParametrage(appAvecDonnees);

    await entete.navParametrage.click();

    // Barème : 4 statuts existants → nouvelle ligne à l'index 4
    await param.btnSectionBareme.click();
    await param.btnAjouterStatut.click();
    await param.champStatutId4.pressSequentially('ABCD');
    await expect(param.champStatutId4).toHaveValue('ABCD');
    await expect(param.champStatutId4).toBeFocused();

    // Types de contact : 5 types existants → nouvelle ligne à l'index 5
    // (la ligne du barème non enregistrée déclenche l'avertissement de changement de section)
    await param.btnSectionTypesContact.click();
    await param.btnAvertissementConfirmer.click();
    await param.btnAjouterTypeContact.click();
    await param.champTypeContactId5.pressSequentially('TUT');
    await expect(param.champTypeContactId5).toHaveValue('TUT');
    await expect(param.champTypeContactId5).toBeFocused();
  },
);

testAvecDonnees(
  'E2E-136 — Identifiant de statut élève : figé une fois enregistré, unique pour une nouvelle ligne',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const param = new SelecteursParametrage(appAvecDonnees);

    await entete.navParametrage.click();
    await param.btnSectionStatutsEleve.click();

    // Statut enregistré : identifiant en lecture seule
    await expect(param.champStatutEleveId0Natif).toHaveAttribute('readonly', '');

    // 3 statuts existants → nouvelle ligne à l'index 3, identifiant « dc » déjà utilisé (DC)
    await param.btnAjouterStatutEleve.click();
    await param.champStatutEleveId3.fill('dc');
    await param.champStatutEleveLibelle3.fill('Doublon');
    await expect(param.erreurStatutEleveId3).toHaveText('Cet identifiant est déjà utilisé.');
    await expect(param.btnEnregistrerStatutEleve3).toBeDisabled();

    await param.champStatutEleveId3.fill('ST');
    await expect(param.erreurStatutEleveId3).toHaveCount(0);
    await expect(param.btnEnregistrerStatutEleve3).toBeEnabled();
  },
);

testAvecDonnees(
  "E2E-137 — Saisie non enregistrée : avertissement au changement de section et à la sortie de l'écran",
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const param = new SelecteursParametrage(appAvecDonnees);

    await entete.navParametrage.click();
    await param.champPrenomEnseignant.fill('Albus');

    // Changement de section : ANNULER reste sur la section, saisie conservée
    await param.btnSectionGroupes.click();
    await expect(param.btnAvertissementConfirmer).toBeVisible();
    await param.btnAvertissementAnnuler.click();
    await expect(param.champPrenomEnseignant).toHaveValue('Albus');

    // Sortie de l'écran : ANNULER reste sur le paramétrage
    await entete.navEleves.click();
    await expect(param.btnAvertissementConfirmer).toBeVisible();
    await param.btnAvertissementAnnuler.click();
    await expect(appAvecDonnees).toHaveURL(/\/parametrage/);
    await expect(param.champPrenomEnseignant).toHaveValue('Albus');

    // Changement de section : CONFIRMER change de section
    await param.btnSectionGroupes.click();
    await param.btnAvertissementConfirmer.click();
    await expect(param.btnAjouterGroupe).toBeVisible();

    // Section Groupes : ligne ajoutée non enregistrée, sortie de l'écran confirmée
    await param.btnAjouterGroupe.click();
    await entete.navEleves.click();
    await param.btnAvertissementConfirmer.click();
    await expect(appAvecDonnees).toHaveURL(/\/eleves/);
  },
);
