import { testAvecDonnees, expect } from '../fixtures';
import { SelecteursCompetences } from '../selecteurs/selecteurs-competences';
import { SelecteursEntete } from '../selecteurs/selecteurs-entete';

// Données du jeu d'exemple :
// - 7 domaines actifs : EMC, QLM, EPS, EART, LV, FR, MAT (APS et autres inactifs)
// - Premier domaine : EMC, avec sous-domaines EMC-C2 et EMC-CM1
// - 3 projets : Journal (5 périodes), Potager (5 périodes), Spectacle (2 périodes)
// - 4 journées CJ : 2025-09-08, 2025-09-09, 2025-09-11, 2025-09-12

testAvecDonnees(
  "E2E-40 — Naviguer dans l'arbre : déplier et replier un nœud",
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const comp = new SelecteursCompetences(appAvecDonnees);

    await entete.navCompetences.click();
    await expect(appAvecDonnees).toHaveURL(/\/competences/);

    // EMC est le premier domaine — son enfant EMC-C2 est masqué au départ
    await expect(comp.premierEnfantArbreEmc).not.toBeVisible();

    // Déplier EMC
    await comp.btnTogglePremierNoeud.click();
    await expect(comp.premierEnfantArbreEmc).toBeVisible();

    // Replier EMC
    await comp.btnTogglePremierNoeud.click();
    await expect(comp.premierEnfantArbreEmc).not.toBeVisible();
  },
);

testAvecDonnees(
  "E2E-41 — Filtre textuel dans l'arbre des compétences",
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const comp = new SelecteursCompetences(appAvecDonnees);

    await entete.navCompetences.click();

    // Saisir "respecter" → présent dans EMC (EMC-C2-1, EMC-CM1-1), absent dans MAT
    await comp.rechercheArbreCompetences.fill('respecter');
    await expect(comp.noeudSelEmc).toBeVisible();
    await expect(comp.noeudSelMat).not.toBeVisible();

    // Effacer → tous les domaines réapparaissent (état replié restauré)
    await comp.rechercheArbreCompetences.fill('');
    await expect(comp.noeudSelMat).toBeVisible();
    await expect(comp.noeudSelEmc).toBeVisible();
    // Enfants de EMC sont repliés après effacement
    await expect(comp.premierEnfantArbreEmc).not.toBeVisible();
  },
);

testAvecDonnees(
  "E2E-42 — Chip de domaine : filtrer l'arbre par domaine",
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const comp = new SelecteursCompetences(appAvecDonnees);

    await entete.navCompetences.click();

    // Activer FR → seul FR visible
    await comp.filtreDomaine_FR.click();
    await expect(comp.noeudSelFr).toBeVisible();
    await expect(comp.noeudSelMat).not.toBeVisible();
    await expect(comp.noeudSelEmc).not.toBeVisible();

    // Cumul FR + MAT → FR et MAT visibles, EMC toujours masqué
    await comp.filtreDomaine_MAT.click();
    await expect(comp.noeudSelFr).toBeVisible();
    await expect(comp.noeudSelMat).toBeVisible();
    await expect(comp.noeudSelEmc).not.toBeVisible();

    // Désactiver FR → seul MAT visible
    await comp.filtreDomaine_FR.click();
    await expect(comp.noeudSelFr).not.toBeVisible();
    await expect(comp.noeudSelMat).toBeVisible();
  },
);

testAvecDonnees('E2E-43 — Ajouter une compétence au panier', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const comp = new SelecteursCompetences(appAvecDonnees);

  await entete.navCompetences.click();

  // Déplier EMC pour accéder à ses enfants
  await comp.btnTogglePremierNoeud.click();

  // Ajouter EMC au panier (premier nœud visible)
  await comp.btnAjouterAuPanierPremierNoeud.click();

  // La compétence apparaît dans le panier
  await expect(comp.btnRetirerPremierePanier).toBeVisible();

  // Les boutons du panier passent en actif
  await expect(comp.btnViderPanier).toBeEnabled();
  await expect(comp.btnEnvoyerProjet).toBeEnabled();
  await expect(comp.btnEnvoyerSeance).toBeEnabled();
});

testAvecDonnees(
  'E2E-44 — Ne pas pouvoir ajouter deux fois la même compétence',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const comp = new SelecteursCompetences(appAvecDonnees);

    await entete.navCompetences.click();

    // Déplier EMC puis l'ajouter au panier
    await comp.btnTogglePremierNoeud.click();
    await comp.btnAjouterAuPanierPremierNoeud.click();

    // Le bouton "+" d'EMC est désactivé (déjà dans le panier)
    await expect(comp.btnAjouterAuPanierPremierNoeud).toBeDisabled();
  },
);

testAvecDonnees('E2E-45 — Retirer une compétence du panier', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const comp = new SelecteursCompetences(appAvecDonnees);

  await entete.navCompetences.click();

  // Ajouter EMC au panier
  await comp.btnTogglePremierNoeud.click();
  await comp.btnAjouterAuPanierPremierNoeud.click();
  await expect(comp.btnRetirerPremierePanier).toBeVisible();

  // Retirer du panier
  await comp.btnRetirerPremierePanier.click();

  // Panier vide → boutons désactivés
  await expect(comp.btnViderPanier).toBeDisabled();
  await expect(comp.btnEnvoyerProjet).toBeDisabled();

  // Le bouton "+" d'EMC est réactivé
  await expect(comp.btnAjouterAuPanierPremierNoeud).toBeEnabled();
});

testAvecDonnees('E2E-46 — Vider le panier', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const comp = new SelecteursCompetences(appAvecDonnees);

  await entete.navCompetences.click();

  // Ajouter deux compétences : EMC (index 0) et QLM (index 1)
  await comp.btnAjouterAuPanierPremierNoeud.click();
  await comp.btnAjouterAuPanierDeuxiemeNoeud.click();
  await expect(comp.btnViderPanier).toBeEnabled();

  // Vider le panier
  await comp.btnViderPanier.click();

  // Panier entièrement vidé
  await expect(comp.btnViderPanier).toBeDisabled();
  await expect(comp.btnEnvoyerProjet).toBeDisabled();
  await expect(comp.btnEnvoyerSeance).toBeDisabled();
});

testAvecDonnees(
  "E2E-47 — Boutons d'export désactivés si panier vide",
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const comp = new SelecteursCompetences(appAvecDonnees);

    await entete.navCompetences.click();

    // Panier vide au démarrage → tous les boutons désactivés
    await expect(comp.btnViderPanier).toBeDisabled();
    await expect(comp.btnEnvoyerProjet).toBeDisabled();
    await expect(comp.btnEnvoyerSeance).toBeDisabled();
  },
);

testAvecDonnees(
  'E2E-48 — Export du panier vers un projet (popin de sélection)',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const comp = new SelecteursCompetences(appAvecDonnees);

    await entete.navCompetences.click();

    // Ajouter EMC au panier, puis ouvrir la popin d'export vers projet
    await comp.btnAjouterAuPanierPremierNoeud.click();
    await comp.btnEnvoyerProjet.click();

    // Sélectionner "Journal de la classe" puis "Période 1" (index 0)
    await entete.exportSelectPrimaire.selectOption('11111111-aaaa-bbbb-cccc-journal00001');
    await entete.exportSelectSecondaire.selectOption('0');

    // Confirmer → popin fermée, panier vidé
    await entete.btnExportConfirmer.click();
    await expect(comp.btnViderPanier).toBeDisabled();
    await expect(entete.btnAnnuler).toBeEnabled();
  },
);

testAvecDonnees("E2E-49 — Annuler l'export vers un projet", async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const comp = new SelecteursCompetences(appAvecDonnees);

  await entete.navCompetences.click();

  // Ajouter au panier, ouvrir la popin, puis annuler
  await comp.btnAjouterAuPanierPremierNoeud.click();
  await comp.btnEnvoyerProjet.click();
  await entete.btnExportAnnuler.click();

  // Popin fermée mais panier conservé
  await expect(comp.btnViderPanier).toBeEnabled();
  await expect(comp.btnRetirerPremierePanier).toBeVisible();
});

testAvecDonnees(
  'E2E-50 — Export du panier vers une séance du cahier journal',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const comp = new SelecteursCompetences(appAvecDonnees);

    await entete.navCompetences.click();

    // Ajouter EMC au panier, puis ouvrir la popin d'export vers séance
    await comp.btnAjouterAuPanierPremierNoeud.click();
    await comp.btnEnvoyerSeance.click();

    // Sélectionner la première journée disponible puis sa première séance pédagogique
    await entete.exportSelectPrimaire.selectOption({ index: 1 });
    await entete.exportSelectSecondaire.selectOption({ index: 1 });

    // Confirmer → popin fermée, panier vidé
    await entete.btnExportConfirmer.click();
    await expect(comp.btnViderPanier).toBeDisabled();
    await expect(entete.btnAnnuler).toBeEnabled();
  },
);

testAvecDonnees('E2E-51 — Panier persisté après navigation', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const comp = new SelecteursCompetences(appAvecDonnees);

  await entete.navCompetences.click();

  // Ajouter une compétence au panier
  await comp.btnAjouterAuPanierPremierNoeud.click();
  await expect(comp.btnRetirerPremierePanier).toBeVisible();

  // Naviguer vers un autre écran (SPA navigation — données conservées en mémoire)
  await entete.navEleves.click();
  await expect(appAvecDonnees).toHaveURL(/\/eleves/);

  // Revenir vers Compétences
  await entete.navCompetences.click();

  // Le panier est toujours présent
  await expect(comp.btnRetirerPremierePanier).toBeVisible();
  await expect(comp.btnViderPanier).toBeEnabled();
});
