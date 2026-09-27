import { test, expect, testAvecDonnees } from '../fixtures';
import { SelecteursBase } from '../selecteurs/selecteurs-base';
import { SelecteursCompetences } from '../selecteurs/selecteurs-competences';
import { SelecteursCahierJournal } from '../selecteurs/selecteurs-cahier-journal';
import { SelecteursDemarrage } from '../selecteurs/selecteurs-demarrage';
import { SelecteursEleves } from '../selecteurs/selecteurs-eleves';
import { SelecteursEmploiDuTemps } from '../selecteurs/selecteurs-emploi-du-temps';
import { SelecteursEntete } from '../selecteurs/selecteurs-entete';
import { SelecteursParametrage } from '../selecteurs/selecteurs-parametrage';
import { SelecteursProjets } from '../selecteurs/selecteurs-projets';
import { VerificateurAccessibilite } from '../utilitaires/verificateur-accessibilite';

test('RGAA-01 — AXE : écran de démarrage', async ({ page }) => {
  await page.goto('/maclasse/#/demarrage');
  expect(await VerificateurAccessibilite.lister(page)).toEqual([]);
});

testAvecDonnees('RGAA-02 — AXE : accueil', async ({ appAvecDonnees }) => {
  expect(await VerificateurAccessibilite.lister(appAvecDonnees)).toEqual([]);
});

testAvecDonnees(
  'RGAA-03 — AXE : élèves (liste, fiche, formulaire de création)',
  async ({ appAvecDonnees }) => {
    const base = new SelecteursBase(appAvecDonnees);
    const eleves = new SelecteursEleves(appAvecDonnees);
    await base.navEleves.click();
    expect(await VerificateurAccessibilite.lister(appAvecDonnees)).toEqual([]);

    await eleves.btnEleveMartinot.click();
    expect(await VerificateurAccessibilite.lister(appAvecDonnees)).toEqual([]);

    await eleves.btnCreerEleve.click();
    expect(await VerificateurAccessibilite.lister(appAvecDonnees)).toEqual([]);
  },
);

testAvecDonnees(
  'RGAA-04 — AXE : projets (liste, formulaire de création)',
  async ({ appAvecDonnees }) => {
    const base = new SelecteursBase(appAvecDonnees);
    const projets = new SelecteursProjets(appAvecDonnees);
    await base.navProjets.click();
    expect(await VerificateurAccessibilite.lister(appAvecDonnees)).toEqual([]);

    await projets.btnCreerProjet.click();
    expect(await VerificateurAccessibilite.lister(appAvecDonnees)).toEqual([]);
  },
);

testAvecDonnees('RGAA-05 — AXE : compétences', async ({ appAvecDonnees }) => {
  const base = new SelecteursBase(appAvecDonnees);
  await base.navCompetences.click();
  expect(await VerificateurAccessibilite.lister(appAvecDonnees)).toEqual([]);
});

testAvecDonnees(
  'RGAA-06 — AXE : emploi du temps (grille, formulaires EDT et créneau)',
  async ({ appAvecDonnees }) => {
    const base = new SelecteursBase(appAvecDonnees);
    const edt = new SelecteursEmploiDuTemps(appAvecDonnees);
    await base.navEmploiDuTemps.click();
    await edt.btnEdtSemaineComplete.click();
    expect(await VerificateurAccessibilite.lister(appAvecDonnees)).toEqual([]);

    await edt.btnNouveauCreneauLigne.click();
    expect(await VerificateurAccessibilite.lister(appAvecDonnees)).toEqual([]);

    await edt.btnCreerEdt.click();
    expect(await VerificateurAccessibilite.lister(appAvecDonnees)).toEqual([]);
  },
);

testAvecDonnees(
  'RGAA-07 — AXE : cahier journal (journée, formulaire de séance)',
  async ({ appAvecDonnees }) => {
    const base = new SelecteursBase(appAvecDonnees);
    const cj = new SelecteursCahierJournal(appAvecDonnees);
    await base.navCahierJournal.click();
    expect(await VerificateurAccessibilite.lister(appAvecDonnees)).toEqual([]);

    await cj.btnInitialiserVidePrincipal.click();
    expect(await VerificateurAccessibilite.lister(appAvecDonnees)).toEqual([]);

    await cj.btnAjouterSeanceDebut.click();
    expect(await VerificateurAccessibilite.lister(appAvecDonnees)).toEqual([]);

    // Une séance enregistrée rend la zone de notes (et son bouton de repli) affichable
    await cj.champHeureDebutSeance.fill('06:00');
    await cj.champHeureFinSeance.fill('07:00');
    await cj.btnEnregistrerSeance.click();
    await cj.btnBasculerNotes.click();
    await expect(cj.champNotesJournee).not.toBeVisible();
    expect(await VerificateurAccessibilite.lister(appAvecDonnees)).toEqual([]);
  },
);

testAvecDonnees('RGAA-08 — AXE : chaque section du paramétrage', async ({ appAvecDonnees }) => {
  const base = new SelecteursBase(appAvecDonnees);
  const param = new SelecteursParametrage(appAvecDonnees);
  await base.navParametrage.click();

  const sections = [
    param.btnSectionEnseignantClasse,
    param.btnSectionPeriodes,
    param.btnSectionSemaineHoraires,
    param.btnSectionGroupes,
    param.btnSectionBareme,
    param.btnSectionStatutsEleve,
    param.btnSectionTypesContact,
    param.btnSectionJoursFeries,
    param.btnSectionPreferences,
    param.btnSectionDomainesCompetences,
  ];
  for (const [index, section] of sections.entries()) {
    await section.click();
    expect(await VerificateurAccessibilite.lister(appAvecDonnees), `section ${index}`).toEqual([]);
  }
});

testAvecDonnees(
  'RGAA-09 — AXE : contraste des 5 thèmes (accueil, élèves, EDT)',
  async ({ appAvecDonnees }) => {
    const base = new SelecteursBase(appAvecDonnees);
    const nombreThemes = 5;
    for (let theme = 0; theme < nombreThemes; theme++) {
      await base.navAccueil.click();
      expect(
        await VerificateurAccessibilite.lister(appAvecDonnees),
        `accueil thème ${theme}`,
      ).toEqual([]);
      await base.navEleves.click();
      expect(
        await VerificateurAccessibilite.lister(appAvecDonnees),
        `élèves thème ${theme}`,
      ).toEqual([]);
      await base.navEmploiDuTemps.click();
      expect(await VerificateurAccessibilite.lister(appAvecDonnees), `EDT thème ${theme}`).toEqual(
        [],
      );
      await base.btnTheme.click();
    }
  },
);

testAvecDonnees(
  "RGAA-10 — AXE : popins de sauvegarde, d'avertissement et d'export",
  async ({ appAvecDonnees }) => {
    const base = new SelecteursBase(appAvecDonnees);
    const eleves = new SelecteursEleves(appAvecDonnees);
    const competences = new SelecteursCompetences(appAvecDonnees);

    await base.navCompetences.click();
    await competences.btnAjouterAuPanierPremierNoeud.click();
    await competences.btnEnvoyerProjet.click();
    expect(await VerificateurAccessibilite.lister(appAvecDonnees), 'popin export').toEqual([]);
    await base.btnExportAnnuler.click();

    await base.navEleves.click();
    await eleves.selectionnerMartinot();
    await eleves.btnModifier.click();
    await eleves.champPrenom.fill('PrenomNonSauvegarde');
    await eleves.selectionnerGratin();
    await expect(base.btnAvertissementAnnuler).toBeVisible();
    expect(await VerificateurAccessibilite.lister(appAvecDonnees), 'popin avertissement').toEqual(
      [],
    );
    await base.btnAvertissementConfirmer.click();

    await eleves.btnCreerEleve.click();
    await eleves.remplirBandeau('Alice', 'DUPONT');
    await eleves.btnEnregistrer.click();
    await base.btnSauvegarder.click();
    await expect(base.champMotDePasseSauvegarde).toBeVisible();
    expect(await VerificateurAccessibilite.lister(appAvecDonnees), 'popin sauvegarde').toEqual([]);
  },
);

test('RGAA-11 — Focus : la popin de démarrage prend le focus, le piège et ignore Échap', async ({
  page,
}) => {
  const base = new SelecteursBase(page);
  const demarrage = new SelecteursDemarrage(page);
  await page.goto('/maclasse/#/demarrage');

  await expect(demarrage.btnCreer).toBeFocused();

  const nombreTabulations = 12;
  for (let i = 0; i < nombreTabulations; i++) {
    await page.keyboard.press('Tab');
    expect(
      await base.dialogueOuvert.evaluate(
        (d) => d.contains(document.activeElement) || document.activeElement === document.body,
      ),
    ).toBe(true);
  }
  for (let i = 0; i < nombreTabulations; i++) {
    await page.keyboard.press('Shift+Tab');
    expect(
      await base.dialogueOuvert.evaluate(
        (d) => d.contains(document.activeElement) || document.activeElement === document.body,
      ),
    ).toBe(true);
  }

  await page.keyboard.press('Escape');
  await expect(base.dialogueOuvert).toBeVisible();
});

testAvecDonnees(
  'RGAA-12 — Focus : CRÉER place le focus sur le premier champ du formulaire élève',
  async ({ appAvecDonnees }) => {
    const base = new SelecteursBase(appAvecDonnees);
    const eleves = new SelecteursEleves(appAvecDonnees);
    await base.navEleves.click();
    await eleves.btnCreerEleve.click();
    await expect(eleves.champPrenom).toBeFocused();
  },
);

testAvecDonnees(
  'RGAA-13 — Focus : CRÉER place le focus sur le premier champ du formulaire EDT',
  async ({ appAvecDonnees }) => {
    const base = new SelecteursBase(appAvecDonnees);
    const edt = new SelecteursEmploiDuTemps(appAvecDonnees);
    await base.navEmploiDuTemps.click();
    await edt.btnCreerEdt.click();
    await expect(edt.inputNomEdt).toBeFocused();
  },
);

testAvecDonnees(
  'RGAA-14 — Focus : CRÉER place le focus sur le premier champ du formulaire projet',
  async ({ appAvecDonnees }) => {
    const base = new SelecteursBase(appAvecDonnees);
    const projets = new SelecteursProjets(appAvecDonnees);
    await base.navProjets.click();
    await projets.btnCreerProjet.click();
    await expect(projets.champFormNomProjet).toBeFocused();
  },
);

testAvecDonnees(
  "RGAA-15 — Focus : popin d'avertissement piège le focus et Échap l'annule",
  async ({ appAvecDonnees }) => {
    const base = new SelecteursBase(appAvecDonnees);
    const eleves = new SelecteursEleves(appAvecDonnees);
    await base.navEleves.click();
    await eleves.selectionnerMartinot();
    await eleves.btnModifier.click();
    await eleves.champPrenom.fill('PrenomNonSauvegarde');
    await eleves.selectionnerGratin();

    await expect(base.btnAvertissementAnnuler).toBeVisible();
    const nombreTabulations = 8;
    for (let i = 0; i < nombreTabulations; i++) {
      await appAvecDonnees.keyboard.press('Tab');
      expect(
        await base.dialogueOuvert.evaluate(
          (d) => d.contains(document.activeElement) || document.activeElement === document.body,
        ),
      ).toBe(true);
    }

    await appAvecDonnees.keyboard.press('Escape');
    await expect(base.dialogueOuvert).toHaveCount(0);
    await expect(eleves.champPrenom).toHaveValue('PrenomNonSauvegarde');
  },
);

testAvecDonnees(
  'RGAA-16 — Chaque attribut id est unique sur tous les écrans',
  async ({ appAvecDonnees }) => {
    const base = new SelecteursBase(appAvecDonnees);
    const ecrans = [
      base.navAccueil,
      base.navEleves,
      base.navProjets,
      base.navCompetences,
      base.navEmploiDuTemps,
      base.navCahierJournal,
      base.navParametrage,
    ];
    for (const [index, ecran] of ecrans.entries()) {
      await ecran.click();
      expect(
        await VerificateurAccessibilite.listerIdentifiantsDupliques(appAvecDonnees),
        `écran ${index}`,
      ).toEqual([]);
    }
  },
);

testAvecDonnees(
  'RGAA-19 — Arbre des compétences : flèches haut/bas, Début et Fin',
  async ({ appAvecDonnees }) => {
    const base = new SelecteursBase(appAvecDonnees);
    const competences = new SelecteursCompetences(appAvecDonnees);
    await base.navCompetences.click();

    await competences.noeudSelEmc.focus();
    await appAvecDonnees.keyboard.press('ArrowDown');
    await expect(competences.noeudSelQlm).toBeFocused();

    await appAvecDonnees.keyboard.press('ArrowUp');
    await expect(competences.noeudSelEmc).toBeFocused();

    await appAvecDonnees.keyboard.press('End');
    await expect(competences.noeudSelMat).toBeFocused();

    await appAvecDonnees.keyboard.press('Home');
    await expect(competences.noeudSelEmc).toBeFocused();
  },
);

testAvecDonnees(
  'RGAA-20 — Arbre des compétences : flèches droite/gauche déplient, replient et remontent',
  async ({ appAvecDonnees }) => {
    const base = new SelecteursBase(appAvecDonnees);
    const competences = new SelecteursCompetences(appAvecDonnees);
    await base.navCompetences.click();

    await competences.noeudSelEmc.focus();
    await expect(competences.noeudSelEmc).toHaveAttribute('aria-expanded', 'false');

    await appAvecDonnees.keyboard.press('ArrowRight');
    await expect(competences.noeudSelEmc).toHaveAttribute('aria-expanded', 'true');
    await expect(competences.premierEnfantArbreEmc).toBeVisible();

    await appAvecDonnees.keyboard.press('ArrowRight');
    await expect(competences.premierEnfantArbreEmc).toBeFocused();

    await appAvecDonnees.keyboard.press('ArrowLeft');
    await expect(competences.noeudSelEmc).toBeFocused();

    await appAvecDonnees.keyboard.press('ArrowLeft');
    await expect(competences.noeudSelEmc).toHaveAttribute('aria-expanded', 'false');
    await expect(competences.premierEnfantArbreEmc).not.toBeVisible();
  },
);

testAvecDonnees(
  'RGAA-21 — Arbre des compétences : Entrée ajoute la compétence au panier',
  async ({ appAvecDonnees }) => {
    const base = new SelecteursBase(appAvecDonnees);
    const competences = new SelecteursCompetences(appAvecDonnees);
    await base.navCompetences.click();

    await expect(competences.noeudSelEmc).toHaveAttribute('aria-selected', 'false');
    await competences.noeudSelEmc.focus();
    await appAvecDonnees.keyboard.press('Enter');

    await expect(competences.noeudSelEmc).toHaveAttribute('aria-selected', 'true');
    await expect(competences.elementsPanier).toHaveCount(1);
  },
);

testAvecDonnees(
  'RGAA-22 — AXE : popin de conflits d’absences de l’EDT',
  async ({ appAvecDonnees }) => {
    const base = new SelecteursBase(appAvecDonnees);
    const edt = new SelecteursEmploiDuTemps(appAvecDonnees);
    await base.navEmploiDuTemps.click();
    await edt.btnEdtSemaineComplete.click();
    await edt.iconesConflit.first().click();
    await expect(base.dialogueOuvert).toBeVisible();
    expect(await VerificateurAccessibilite.lister(appAvecDonnees)).toEqual([]);
  },
);

testAvecDonnees(
  'RGAA-23 — AXE : popin d’export avec une destination choisie',
  async ({ appAvecDonnees }) => {
    const base = new SelecteursBase(appAvecDonnees);
    const competences = new SelecteursCompetences(appAvecDonnees);
    await base.navCompetences.click();
    await competences.btnAjouterAuPanierPremierNoeud.click();
    await competences.btnEnvoyerProjet.click();
    await base.exportSelectPrimaire.selectOption('11111111-aaaa-bbbb-cccc-journal00001');
    await base.exportSelectSecondaire.selectOption('0');
    expect(await VerificateurAccessibilite.lister(appAvecDonnees)).toEqual([]);
  },
);

testAvecDonnees(
  'RGAA-24 — AXE : EDT calculé (formulaire et grille)',
  async ({ appAvecDonnees }) => {
    const base = new SelecteursBase(appAvecDonnees);
    const edt = new SelecteursEmploiDuTemps(appAvecDonnees);
    await base.navEmploiDuTemps.click();
    await edt.btnCreerEdtCalcule.click();
    expect(await VerificateurAccessibilite.lister(appAvecDonnees), 'formulaire').toEqual([]);

    await edt.inputNomEdtCalcule.fill('Calcul AXE');
    await edt.chipSourceTempsHorsClasse.click();
    await edt.chipSourceAbsencesRegulieres.click();
    await edt.btnEnregistrerEdtCalcule.click();
    await edt.btnPremierEdtCalcule.click();
    await expect(edt.cellulesCalculees.first()).toBeVisible();
    expect(await VerificateurAccessibilite.lister(appAvecDonnees), 'grille calculée').toEqual([]);
  },
);

testAvecDonnees(
  'RGAA-25 — Recherche globale : navigation clavier dans les résultats',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);

    // "le" : Martinot Boule, Gratin Léonie, Blanche-Oreille Ariol, Spectacle de fin d'année
    await entete.rechercherEtAttendre('le');
    await expect(entete.resultatsRecherche).toHaveCount(4);
    await expect(entete.dernierResultatRecherche).toContainText("Spectacle de fin d'année");

    await entete.premierResultatRecherche.focus();

    await appAvecDonnees.keyboard.press('End');
    await expect(entete.dernierResultatRecherche).toBeFocused();

    await appAvecDonnees.keyboard.press('Home');
    await expect(entete.premierResultatRecherche).toBeFocused();

    await appAvecDonnees.keyboard.press('ArrowDown');
    await expect(entete.deuxiemeResultatRecherche).toBeFocused();

    await appAvecDonnees.keyboard.press('ArrowUp');
    await expect(entete.premierResultatRecherche).toBeFocused();
  },
);
