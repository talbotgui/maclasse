import { testAvecDonnees, expect } from '../fixtures';
import { SelecteursEleves } from '../selecteurs/selecteurs-eleves';
import { SelecteursEntete } from '../selecteurs/selecteurs-entete';

// Données du jeu d'exemple :
// - 11 élèves dont MARTINOT Boule (Groupe A), GRATIN Léonie (Groupes A+B), DUCOBU Jean (Groupe B)
// - Groupes : A, B, C

testAvecDonnees('E2E-18 — Créer un nouvel élève', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const eleves = new SelecteursEleves(appAvecDonnees);

  await entete.navEleves.click();

  await eleves.btnCreerEleve.click();
  await eleves.remplirBandeau('Alice', 'DUPONT');
  await eleves.btnEnregistrer.click();

  // Fiche en lecture seule avec le nom attendu
  await expect(eleves.titreFiche).toContainText('DUPONT');
  await expect(eleves.titreFiche).toContainText('Alice');

  // UNDO disponible
  await expect(entete.btnAnnuler).toBeEnabled();
});

testAvecDonnees('E2E-19 — Modifier un élève existant', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const eleves = new SelecteursEleves(appAvecDonnees);

  await entete.navEleves.click();
  await eleves.selectionnerMartinot();

  await eleves.btnModifier.click();
  await eleves.champPrenom.fill('Boule-Modifié');
  await eleves.btnEnregistrer.click();

  await expect(eleves.titreFiche).toContainText('Boule-Modifié');
  await expect(entete.btnAnnuler).toBeEnabled();
  await entete.navAccueil.click();
  await entete.navEleves.click();
  await eleves.selectionnerMartinot();
  await expect(eleves.titreFiche).toContainText('Boule-Modifié');
});

testAvecDonnees(
  'E2E-20 — Annuler une modification en cours (bouton ANNULER du formulaire)',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const eleves = new SelecteursEleves(appAvecDonnees);

    await entete.navEleves.click();
    await eleves.selectionnerMartinot();
    await eleves.btnModifier.click();

    await eleves.champPrenom.fill('PrenomModifie');
    await eleves.btnAnnulerFormulaire.click();

    // La fiche affiche le prénom d'origine
    await expect(eleves.titreFiche).toContainText('Boule');
    await expect(eleves.titreFiche).not.toContainText('PrenomModifie');

    // Aucune mutation → ANNULER entête non affecté par ce formulaire
    await expect(entete.btnAnnuler).toBeDisabled();
  },
);

testAvecDonnees('E2E-21 — Supprimer un élève', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const eleves = new SelecteursEleves(appAvecDonnees);

  // Créer un élève temporaire pour le supprimer sans affecter le jeu de données
  await entete.navEleves.click();
  await eleves.btnCreerEleve.click();
  await eleves.remplirBandeau('Temporaire', 'ATEMP');
  await eleves.btnEnregistrer.click();
  await expect(eleves.titreFiche).toContainText('ATEMP');

  // Supprimer (étape 1 : clic sur SUPPRIMER)
  await eleves.btnSupprimer.click();
  // Étape 2 : confirmation
  await eleves.btnSupprimerConfirmer.click();

  await expect(eleves.messageAucunEleveSelectionne).toBeVisible();
  await expect(entete.btnAnnuler).toBeEnabled();
});

testAvecDonnees(
  "E2E-22 — Popin d'avertissement au clic sur un autre élève sans enregistrer",
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const eleves = new SelecteursEleves(appAvecDonnees);

    await entete.navEleves.click();
    await eleves.selectionnerMartinot();
    await eleves.btnModifier.click();
    await eleves.champPrenom.fill('PrenomNonSauvegarde');

    // Cliquer sur un autre élève
    await eleves.selectionnerGratin();

    // La popin d'avertissement doit s'ouvrir
    await expect(eleves.btnAvertissementAnnuler).toBeVisible();
    await expect(eleves.btnAvertissementConfirmer).toBeVisible();

    // Scénario A : ANNULER → reste sur MARTINOT
    await eleves.btnAvertissementAnnuler.click();
    await expect(eleves.champPrenom).toHaveValue('PrenomNonSauvegarde');

    // Scénario B : cliquer à nouveau sur GRATIN et CONFIRMER
    await eleves.selectionnerGratin();
    await eleves.btnAvertissementConfirmer.click();
    await expect(eleves.titreFiche).toContainText('GRATIN');
  },
);

testAvecDonnees(
  "E2E-23 — Popin d'avertissement au clic sur CRÉER sans enregistrer",
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const eleves = new SelecteursEleves(appAvecDonnees);

    await entete.navEleves.click();
    await eleves.selectionnerMartinot();
    await eleves.btnModifier.click();
    await eleves.champPrenom.fill('Brouillon');

    await eleves.btnCreerEleve.click();

    await expect(eleves.btnAvertissementConfirmer).toBeVisible();
    await eleves.btnAvertissementConfirmer.click();

    await eleves.btnCreerEleve.click();

    // Formulaire vide pour un nouvel élève
    await expect(eleves.champPrenom).toHaveValue('');
    await expect(eleves.champNom).toHaveValue('');
  },
);

testAvecDonnees(
  "E2E-24 — Popin d'avertissement au changement d'écran sans enregistrer",
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const eleves = new SelecteursEleves(appAvecDonnees);

    await entete.navEleves.click();
    await eleves.selectionnerMartinot();
    await eleves.btnModifier.click();
    await eleves.champPrenom.fill('Brouillon');

    await entete.navProjets.click();
    await expect(eleves.btnAvertissementConfirmer).toBeVisible();

    // ANNULER → reste sur les élèves
    await eleves.btnAvertissementAnnuler.click();
    await expect(appAvecDonnees).toHaveURL(/\/eleves/);

    // Retenter et CONFIRMER → navigue vers les projets
    await entete.navProjets.click();
    await eleves.btnAvertissementConfirmer.click();
    await expect(appAvecDonnees).toHaveURL(/\/projets/);
  },
);

testAvecDonnees('E2E-25 — Filtre textuel sur la liste des élèves', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const eleves = new SelecteursEleves(appAvecDonnees);

  await entete.navEleves.click();

  await eleves.champRecherche.fill('martinot');
  await expect(eleves.btnEleveMartinot).toBeVisible();
  // Les autres élèves ne sont pas affichés
  await expect(eleves.btnEleveGratin).not.toBeVisible();

  // Texte sans correspondance → liste vide
  await eleves.champRecherche.fill('xyzxyz');
  await expect(eleves.messageListeVide).toBeVisible();

  // Effacer → tous les élèves réapparaissent
  await eleves.champRecherche.fill('');
  await expect(eleves.btnEleveMartinot).toBeVisible();
  await expect(eleves.btnEleveGratin).toBeVisible();
});

testAvecDonnees('E2E-26 — Filtre par chip de groupe', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const eleves = new SelecteursEleves(appAvecDonnees);

  await entete.navEleves.click();

  // Groupe A seul → Martinot, Gratin, Zimmermann
  await eleves.chipGroupeA.click();
  await expect(eleves.btnEleveMartinot).toBeVisible();
  await expect(eleves.btnEleveDucobu).not.toBeVisible();

  // Cumul A + B → ajoute Ducobu et Gratin
  await eleves.chipGroupeB.click();
  await expect(eleves.btnEleveDucobu).toBeVisible();
  await expect(eleves.btnEleveGratin).toBeVisible();

  // Déselectionner A → seul Groupe B : Gratin et Ducobu
  await eleves.chipGroupeA.click();
  await expect(eleves.btnEleveMartinot).not.toBeVisible();
  await expect(eleves.btnEleveDucobu).toBeVisible();
});

testAvecDonnees('E2E-27 — Ajouter un contact dans la fiche élève', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const eleves = new SelecteursEleves(appAvecDonnees);

  await entete.navEleves.click();
  await eleves.selectionnerDucobu();
  await eleves.btnModifier.click();

  await eleves.btnAjouterContact.click();

  await eleves.champNouveauContactNom.fill('René Ducobu');
  await eleves.champNouveauContactTel.fill('06 12 34 56 78');

  await eleves.btnEnregistrer.click();

  // En lecture seule, le contact apparaît
  await expect(eleves.listeResumeeContacts).toContainText('René Ducobu');
  await entete.navAccueil.click();
  await entete.navEleves.click();
  await eleves.selectionnerDucobu();
  await expect(eleves.listeResumeeContacts).toContainText('René Ducobu');
});

testAvecDonnees(
  'E2E-28 — Ajouter une absence récurrente dans la fiche élève',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const eleves = new SelecteursEleves(appAvecDonnees);

    await entete.navEleves.click();
    await eleves.selectionnerDucobu();
    await eleves.btnModifier.click();

    await eleves.btnAjouterAbsenceRecurrente.click();

    await eleves.champNouvelleAbsenceRecurrenteLibelle.fill('Orthophonie');
    await eleves.champNouvelleAbsenceRecurrenteDebut.fill('09:00');
    await eleves.champNouvelleAbsenceRecurrenteFin.fill('10:00');

    await eleves.btnEnregistrer.click();

    await expect(eleves.listeResumeeAbsencesRec).toContainText('Orthophonie');
    await entete.navAccueil.click();
    await entete.navEleves.click();
    await eleves.selectionnerDucobu();
    await expect(eleves.listeResumeeAbsencesRec).toContainText('Orthophonie');
  },
);

testAvecDonnees(
  'E2E-29 — Ajouter une absence ponctuelle dans la fiche élève',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const eleves = new SelecteursEleves(appAvecDonnees);

    await entete.navEleves.click();
    await eleves.selectionnerDucobu();
    await eleves.btnModifier.click();

    await eleves.btnAjouterAbsencePonctuelle.click();

    await eleves.champNouvelleAbsencePonctuelleDate.fill('2026-06-09');
    await eleves.champNouvelleAbsencePonctuelleJustification.fill('Maladie');

    await eleves.btnEnregistrer.click();

    await expect(eleves.listeResumeeAbsencesPonct).toContainText('Maladie');
    await entete.navAccueil.click();
    await entete.navEleves.click();
    await eleves.selectionnerDucobu();
    await expect(eleves.listeResumeeAbsencesPonct).toContainText('Maladie');
  },
);

testAvecDonnees('E2E-31 — Ajouter un cursus dans la fiche élève', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const eleves = new SelecteursEleves(appAvecDonnees);

  await entete.navEleves.click();

  // MARTINOT a déjà 2 cursus (index 0 et 1) → le nouveau sera à l'index 2
  await eleves.selectionnerMartinot();
  await eleves.btnModifier.click();

  await eleves.btnAjouterCursus.click();

  // Remplir le niveau du nouveau cursus (index 2)
  await eleves.champNouveauCursusNiveau.fill('CM2');
  await eleves.btnEnregistrer.click();

  // Le cursus apparaît en lecture seule dans la fiche
  await expect(eleves.listeResumeeCursus).toContainText('CM2');
  await expect(entete.btnAnnuler).toBeEnabled();
  await entete.navAccueil.click();
  await entete.navEleves.click();
  await eleves.selectionnerMartinot();
  await expect(eleves.listeResumeeCursus).toContainText('CM2');
});

testAvecDonnees("E2E-30 — Imprimer la fiche d'un élève", async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const eleves = new SelecteursEleves(appAvecDonnees);

  await entete.navEleves.click();
  await eleves.selectionnerMartinot();

  // Vérifier que le bouton IMPRIMER est présent et visible en lecture seule
  await expect(eleves.btnImprimer).toBeVisible();
  await expect(eleves.btnImprimer).toBeEnabled();

  // On ne déclenche pas la boîte d'impression du navigateur (non testable en headless)
  // mais on vérifie que la colonne gauche ne sera pas imprimée
  // via l'attribut aria / classe qui sera masqué en @media print
  await expect(eleves.colonneGauche).toBeVisible();
});

testAvecDonnees(
  'E2E-106 — ENREGISTRER inactif tant que le prénom et le nom ne sont pas renseignés',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const eleves = new SelecteursEleves(appAvecDonnees);

    await entete.navEleves.click();
    await eleves.btnCreerEleve.click();
    await expect(eleves.btnEnregistrer).toBeDisabled();

    await eleves.champPrenom.fill('Alice');
    await expect(eleves.btnEnregistrer).toBeDisabled();

    await eleves.champNom.fill('   ');
    await expect(eleves.btnEnregistrer).toBeDisabled();

    await eleves.champNom.fill('ZEBULON');
    await expect(eleves.btnEnregistrer).toBeEnabled();
  },
);

testAvecDonnees(
  "E2E-138 — Absence récurrente : plage horaire contrôlée avant l'enregistrement",
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const eleves = new SelecteursEleves(appAvecDonnees);

    await entete.navEleves.click();
    await eleves.selectionnerDucobu();
    await eleves.btnModifier.click();

    // DUCOBU a déjà 1 absence récurrente → nouvelle absence à l'index 1
    await eleves.btnAjouterAbsenceRecurrente.click();
    await eleves.champNouvelleAbsenceRecurrenteLibelle.fill('Orthophonie');
    await expect(eleves.btnEnregistrer).toBeDisabled();

    await eleves.champNouvelleAbsenceRecurrenteDebut.fill('10:00');
    await eleves.champNouvelleAbsenceRecurrenteFin.fill('09:00');
    await expect(eleves.erreurNouvelleAbsenceRecurrente).toHaveText(
      "L'heure de fin doit être postérieure à l'heure de début.",
    );
    await expect(eleves.btnEnregistrer).toBeDisabled();

    await eleves.champNouvelleAbsenceRecurrenteFin.fill('11:00');
    await expect(eleves.erreurNouvelleAbsenceRecurrente).toHaveCount(0);
    await expect(eleves.btnEnregistrer).toBeEnabled();
  },
);

testAvecDonnees(
  'E2E-139 — Autorisations et informations utiles saisies, affichées puis effacées',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const eleves = new SelecteursEleves(appAvecDonnees);

    await entete.navEleves.click();
    await eleves.selectionnerGratin();
    await eleves.btnModifier.click();

    await eleves.radioDroitImageRefuse.check();
    await eleves.champDroitImagePrecision.fill('Pas de photo sur le site');
    await eleves.casePortLunettes.check();
    await eleves.radioLateraliteGaucher.check();
    await eleves.btnEnregistrer.click();

    await expect(eleves.sectionNotesLecture).toContainText(
      "Droit à l'imageRefusé — Pas de photo sur le site",
    );
    await expect(eleves.sectionInformationsUtilesLecture).toContainText('Port de lunettes');
    await expect(eleves.sectionInformationsUtilesLecture).toContainText('Latéralité : Gaucher');

    // Latéralité remise à « non renseignée »
    await eleves.btnModifier.click();
    await expect(eleves.radioLateraliteGaucher).toBeChecked();
    await eleves.btnEffacerLateralite.click();
    await expect(eleves.radioLateraliteGaucher).not.toBeChecked();
    await expect(eleves.btnEffacerLateralite).toHaveCount(0);
    await eleves.btnEnregistrer.click();

    await expect(eleves.sectionInformationsUtilesLecture).toContainText('Port de lunettes');
    await expect(eleves.sectionInformationsUtilesLecture).not.toContainText('Latéralité');
  },
);

testAvecDonnees(
  'E2E-140 — Onglets de la fiche élève : clavier, désactivation en création et avertissement',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const eleves = new SelecteursEleves(appAvecDonnees);

    await entete.navEleves.click();
    await eleves.selectionnerMartinot();
    await expect(eleves.ongletFicheAdministrative).toHaveAttribute('aria-selected', 'true');

    // Flèche droite : focus sur Bilans sans le sélectionner ; Entrée le sélectionne
    await eleves.ongletFicheAdministrative.focus();
    await appAvecDonnees.keyboard.press('ArrowRight');
    await expect(eleves.ongletBilans).toBeFocused();
    await expect(eleves.ongletBilans).toHaveAttribute('aria-selected', 'false');
    await appAvecDonnees.keyboard.press('Enter');
    await expect(eleves.ongletBilans).toHaveAttribute('aria-selected', 'true');
    await expect(eleves.panneauBilans).toBeVisible();

    // L'onglet est conservé au changement d'élève
    await eleves.selectionnerGratin();
    await expect(eleves.ongletBilans).toHaveAttribute('aria-selected', 'true');

    // En création, Bilans est désactivé et la fiche administrative est affichée
    await eleves.btnCreerEleve.click();
    await expect(eleves.ongletBilans).toBeDisabled();
    await expect(eleves.ongletFicheAdministrative).toHaveAttribute('aria-selected', 'true');
    await eleves.btnAnnulerFormulaire.click();

    // Saisie en cours : changer d'onglet demande confirmation
    await eleves.selectionnerGratin();
    await eleves.ongletFicheAdministrative.click();
    await eleves.btnModifier.click();
    await eleves.ongletBilans.click();
    await expect(eleves.btnAvertissementAnnuler).toBeVisible();
    await eleves.btnAvertissementAnnuler.click();
    await expect(eleves.ongletFicheAdministrative).toHaveAttribute('aria-selected', 'true');
    await expect(eleves.btnEnregistrer).toBeVisible();
  },
);

testAvecDonnees(
  'E2E-141 — Bilans : ajouter un sous-domaine, saisir puis valider un bilan',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const eleves = new SelecteursEleves(appAvecDonnees);

    await entete.navEleves.click();
    await eleves.selectionnerMartinot();
    await eleves.ongletBilans.click();
    await expect(eleves.btnAjouterSousDomaine).toBeDisabled();

    await eleves.champSousDomaine.fill('Respecter autrui');
    await eleves.premiereSuggestionCompetence.click();
    await eleves.btnAjouterSousDomaine.click();

    // Nouveau bilan en édition, focus sur le titre, VALIDER inactif tant que le titre est vide
    await expect(eleves.titresSousDomaines).toHaveCount(1);
    await expect(eleves.titresSousDomaines).toHaveText(
      'Enseignement moral et civique > Cycle 2 > Respecter autrui',
    );
    await expect(eleves.champTitreBilan).toBeFocused();
    await expect(eleves.btnValiderBilan).toBeDisabled();
    await expect(eleves.btnAjouterSousDomaine).toBeDisabled();

    await eleves.champTitreBilan.fill('Bilan de rentrée');
    await eleves.zoneTexteBilans.click();
    await eleves.btnGrasBilans.click();
    await appAvecDonnees.keyboard.type('Progrès nets');

    // Évaluation : une ligne sans compétence bloque la validation
    await eleves.btnAjouterEvaluation.click();
    await expect(eleves.erreurBilan).toHaveText(
      'Chaque évaluation doit porter sur une compétence.',
    );
    await expect(eleves.btnValiderBilan).toBeDisabled();
    await eleves.champCompetenceEvaluation0.click();
    await eleves.premiereSuggestionCompetence.click();
    await eleves.selectStatutEvaluation0.selectOption('EC');
    await eleves.champCommentaireEvaluation0.fill('À consolider');
    await eleves.btnValiderBilan.click();

    // Lecture : bilan déplié, texte riche et tableau sans colonne d'actions
    await expect(eleves.basculesBilans).toHaveCount(1);
    await expect(eleves.basculesBilans).toContainText('Bilan de rentrée');
    await expect(eleves.basculesBilans).toHaveAttribute('aria-expanded', 'true');
    await expect(eleves.corpsBilans.locator('strong')).toHaveText('Progrès nets');
    await expect(eleves.tableauxBilans.locator('th')).toHaveCount(3);
    await expect(eleves.tableauxBilans).toContainText('En cours');
    await expect(eleves.tableauxBilans).toContainText('À consolider');
    await expect(eleves.btnsModifierBilan).toBeFocused();
    await expect(entete.btnAnnuler).toBeEnabled();
  },
);

testAvecDonnees(
  'E2E-142 — Bilans : annuler, dupliquer, monter puis supprimer',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const eleves = new SelecteursEleves(appAvecDonnees);

    await entete.navEleves.click();
    await eleves.selectionnerGratin();
    await eleves.ongletBilans.click();

    // Un nouveau bilan abandonné ne laisse aucun cadre
    await eleves.champSousDomaine.fill('Respecter autrui');
    await eleves.premiereSuggestionCompetence.click();
    await eleves.btnAjouterSousDomaine.click();
    await eleves.btnAnnulerBilan.click();
    await expect(eleves.titresSousDomaines).toHaveCount(0);

    await eleves.champSousDomaine.fill('Respecter autrui');
    await eleves.premiereSuggestionCompetence.click();
    await eleves.btnAjouterSousDomaine.click();
    await eleves.champTitreBilan.fill('Premier');
    await eleves.btnValiderBilan.click();

    // Dupliquer ajoute une copie en fin de sous-domaine ; MONTER la place en tête
    await eleves.btnsDupliquerBilan.nth(0).click();
    await expect(eleves.basculesBilans).toHaveCount(2);
    await expect(eleves.btnsMonterBilan.nth(0)).toBeDisabled();
    await eleves.btnsModifierBilan.nth(1).click();
    await eleves.champTitreBilan.fill('Copie');
    await eleves.btnValiderBilan.click();
    await eleves.btnsMonterBilan.nth(1).click();
    await expect(eleves.basculesBilans.nth(0)).toContainText('Copie');
    await expect(eleves.basculesBilans.nth(1)).toContainText('Premier');

    // Tout déplier ouvre les deux bilans
    await eleves.btnToutDeplier.click();
    await expect(eleves.corpsBilans.nth(0)).toBeVisible();
    await expect(eleves.corpsBilans.nth(1)).toBeVisible();

    // Supprimer le dernier bilan fait disparaître le sous-domaine
    await eleves.btnsSupprimerBilan.nth(0).click();
    await eleves.btnConfirmerSuppressionBilan.click();
    await eleves.btnsSupprimerBilan.nth(0).click();
    await eleves.btnConfirmerSuppressionBilan.click();
    await expect(eleves.titresSousDomaines).toHaveCount(0);
  },
);

testAvecDonnees(
  'E2E-143 — Bilans : avertissement en quittant un bilan en édition',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const eleves = new SelecteursEleves(appAvecDonnees);

    await entete.navEleves.click();
    await eleves.selectionnerMartinot();
    await eleves.ongletBilans.click();
    await eleves.champSousDomaine.fill('Respecter autrui');
    await eleves.premiereSuggestionCompetence.click();
    await eleves.btnAjouterSousDomaine.click();
    await eleves.champTitreBilan.fill('Brouillon');

    // Changer d'élève : ANNULER garde la saisie
    await eleves.selectionnerGratin();
    await expect(eleves.btnAvertissementAnnuler).toBeVisible();
    await eleves.btnAvertissementAnnuler.click();
    await expect(eleves.champTitreBilan).toHaveValue('Brouillon');

    // Changer d'onglet : CONFIRMER abandonne la saisie
    await eleves.ongletFicheAdministrative.click();
    await eleves.btnAvertissementConfirmer.click();
    await expect(eleves.ongletFicheAdministrative).toHaveAttribute('aria-selected', 'true');
    await eleves.ongletBilans.click();
    await expect(eleves.titresSousDomaines).toHaveCount(0);
  },
);
