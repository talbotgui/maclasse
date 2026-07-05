import { testAvecDonnees, expect } from '../fixtures';
import { SelecteursCompetences } from '../selecteurs/selecteurs-competences';
import { SelecteursBase } from '../selecteurs/selecteurs-base';
import { SelecteursEntete } from '../selecteurs/selecteurs-entete';

// Données du jeu d'exemple :
// - 18 domaines de compétences (APS, AA, EXP, ML, APOM, EMC, QLM, EPS, EART, LV, FR, MAT, ARTP, EDMU, HG, SCT, HDA, CN)
// - Arbre hiérarchique : domaine → sous-domaine → compétence feuille
// - 3 projets avec périodes disponibles pour l'export
// - Journées CJ disponibles pour l'export vers séance

testAvecDonnees('E2E-40 — Naviguer dans l\'arbre : déplier et replier un nœud', async ({ appAvecDonnees }) => {
  // TODO: naviguer vers Compétences, cliquer btnTogglePremierNoeud,
  // vérifier que des enfants apparaissent, cliquer à nouveau,
  // vérifier que les enfants sont repliés
});

testAvecDonnees('E2E-41 — Filtre textuel dans l\'arbre des compétences', async ({ appAvecDonnees }) => {
  // TODO: saisir un terme dans rechercheArbreCompetences, vérifier que seuls les nœuds correspondants
  // apparaissent avec leurs ascendants, effacer le filtre, vérifier retour à l'état replié
});

testAvecDonnees('E2E-42 — Chip de domaine : filtrer l\'arbre par domaine', async ({ appAvecDonnees }) => {
  // TODO: cliquer filtreDomaine_FR, vérifier que seules les compétences du domaine Français sont visibles,
  // cliquer filtreDomaine_MAT en cumul, vérifier que les deux domaines sont visibles
});

testAvecDonnees('E2E-43 — Ajouter une compétence au panier', async ({ appAvecDonnees }) => {
  // TODO: déplier un nœud via btnTogglePremierNoeud, cliquer btnAjouterAuPanierPremierNoeud,
  // vérifier que la compétence apparaît dans le panier (btnRetirerPremierePanier visible),
  // vérifier que btnViderPanier est activé et les boutons d'export aussi
});

testAvecDonnees('E2E-44 — Ne pas pouvoir ajouter deux fois la même compétence', async ({ appAvecDonnees }) => {
  // TODO: ajouter une compétence au panier, vérifier que le btnAjouterAuPanierPremierNoeud
  // de cette compétence est désactivé (aria-disabled ou disabled)
});

testAvecDonnees('E2E-45 — Retirer une compétence du panier', async ({ appAvecDonnees }) => {
  // TODO: ajouter une compétence au panier, cliquer btnRetirerPremierePanier,
  // vérifier que le panier est vide (btnViderPanier désactivé),
  // vérifier que btnAjouterAuPanierPremierNoeud redevient actif
});

testAvecDonnees('E2E-46 — Vider le panier', async ({ appAvecDonnees }) => {
  // TODO: ajouter plusieurs compétences, cliquer btnViderPanier,
  // vérifier que le panier est vide, btnViderPanier désactivé, btnEnvoyerProjet désactivé
});

testAvecDonnees('E2E-47 — Boutons d\'export désactivés si panier vide', async ({ appAvecDonnees }) => {
  // TODO: naviguer vers Compétences (panier vide), vérifier que btnViderPanier,
  // btnEnvoyerProjet et btnEnvoyerSeance sont tous dans l'état disabled
});

testAvecDonnees('E2E-48 — Export du panier vers un projet (popin de sélection)', async ({ appAvecDonnees }) => {
  // TODO: ajouter une compétence au panier, cliquer btnEnvoyerProjet,
  // dans la popin sélectionner un projet dans exportSelectPrimaire,
  // sélectionner une période dans exportSelectSecondaire (cascade),
  // cliquer btnExportConfirmer, vérifier que la popin se ferme et le panier est vidé
});

testAvecDonnees('E2E-49 — Annuler l\'export vers un projet', async ({ appAvecDonnees }) => {
  // TODO: ajouter une compétence, cliquer btnEnvoyerProjet, dans la popin cliquer btnExportAnnuler,
  // vérifier que la popin se ferme et que le panier est toujours non vide
});

testAvecDonnees('E2E-50 — Export du panier vers une séance du cahier journal', async ({ appAvecDonnees }) => {
  // TODO: ajouter une compétence, cliquer btnEnvoyerSeance,
  // dans la popin saisir une date existante dans le CJ, sélectionner une séance,
  // cliquer btnExportConfirmer, vérifier que le panier est vidé
});

testAvecDonnees('E2E-51 — Panier persisté après navigation', async ({ appAvecDonnees }) => {
  // TODO: ajouter une compétence, naviguer vers Élèves via entete.navEleves,
  // revenir vers Compétences via entete.navCompetences,
  // vérifier que la compétence est toujours présente dans le panier
});
