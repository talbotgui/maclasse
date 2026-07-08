import { testAvecDonnees, expect } from '../fixtures';
import { SelecteursParametrage } from '../selecteurs/selecteurs-parametrage';
import { SelecteursEntete } from '../selecteurs/selecteurs-entete';
import { SelecteursEmploiDuTemps } from '../selecteurs/selecteurs-emploi-du-temps';

// Données du jeu d'exemple :
// - Enseignant : Minerva McGonagall, année 2025-2026
// - Classe     : niveau CM1-CM2, année scolaire "Double niveau CM1-CM2"
// - Config EDT : lundi–vendredi, 08:30–16:30
// - 3 groupes (A/B/C), groupe A utilisé par des élèves
// - 4 statuts acquisition, 3 statuts élève (DC utilisé), 5 types contact, 5 raisons absence
// - 3 fréquences absence, 0 période scolaire, 0 jour férié
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

    await param.btnSectionRaisonsAbsence.click();
    await expect(param.btnAjouterRaison).toBeVisible();

    await param.btnSectionFrequencesAbsence.click();
    await expect(param.btnAjouterFrequence).toBeVisible();

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

testAvecDonnees("E2E-93 — Ajouter une raison d'absence", async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const param = new SelecteursParametrage(appAvecDonnees);

  await entete.navParametrage.click();
  await param.btnSectionRaisonsAbsence.click();

  // 5 raisons existantes → nouvelle à l'index 5
  await param.btnAjouterRaison.click();
  await param.champRaisonLibelle5.fill('Rendez-vous médical');
  await param.btnEnregistrerRaison5.click();

  await expect(param.champRaisonLibelle5).toHaveValue('Rendez-vous médical');
  await expect(entete.btnAnnuler).toBeEnabled();
});

testAvecDonnees("E2E-94 — Ajouter une fréquence d'absence", async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const param = new SelecteursParametrage(appAvecDonnees);

  await entete.navParametrage.click();
  await param.btnSectionFrequencesAbsence.click();

  // 3 fréquences existantes → nouvelle à l'index 3
  await param.btnAjouterFrequence.click();
  await param.champFrequenceLibelle3.fill('1 semaine sur 3');
  await param.btnEnregistrerFrequence3.click();

  await expect(param.champFrequenceLibelle3).toHaveValue('1 semaine sur 3');
  await expect(entete.btnAnnuler).toBeEnabled();
});

testAvecDonnees('E2E-95 — Ajouter un jour férié', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const param = new SelecteursParametrage(appAvecDonnees);

  await entete.navParametrage.click();
  await param.btnSectionJoursFeries.click();

  // 0 jours fériés existants → nouveau à l'index 0
  await param.btnAjouterJourFerie.click();
  await param.champJourFerieNom0.fill('Armistice');
  await param.champJourFerieDate0.fill('2025-11-11');
  await param.btnEnregistrerJourFerie0.click();

  await expect(param.champJourFerieNom0).toHaveValue('Armistice');
  await expect(entete.btnAnnuler).toBeEnabled();
});

testAvecDonnees(
  'E2E-96 — Modifier le délai de sauvegarde automatique dans Préférences',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const param = new SelecteursParametrage(appAvecDonnees);

    await entete.navParametrage.click();
    await param.btnSectionPreferences.click();

    // Valeur par défaut : 2 minutes
    await param.champDelaiSauvegarde.fill('5');
    await param.btnEnregistrerPreferences.click();

    await expect(param.champDelaiSauvegarde).toHaveValue('5');
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
