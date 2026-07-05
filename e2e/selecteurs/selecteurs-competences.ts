import { type Page, type Locator } from '@playwright/test';
import { SelecteursBase } from './selecteurs-base';

/**
 * Sélecteurs de l'écran Compétences.
 * L'écran comporte trois colonnes : filtres gauche (mc-arbre-competences), arbre central, panier droit.
 * La popin d'export est définie dans {@link SelecteursBase}.
 */
export class SelecteursCompetences extends SelecteursBase {

  // --- Arbre de compétences (colonne centrale) ---
  /** Champ de recherche dans l'arbre de compétences. */
  readonly rechercheArbreCompetences: Locator;

  // --- Chips de filtre par domaine (jeu de données : 18 domaines) ---
  /** Chip de filtre domaine Activités physiques. */
  readonly filtreDomaine_APS: Locator;
  /** Chip de filtre domaine Activités artistiques. */
  readonly filtreDomaine_AA: Locator;
  /** Chip de filtre domaine Explorer le monde. */
  readonly filtreDomaine_EXP: Locator;
  /** Chip de filtre domaine Mobiliser le langage. */
  readonly filtreDomaine_ML: Locator;
  /** Chip de filtre domaine Français. */
  readonly filtreDomaine_FR: Locator;
  /** Chip de filtre domaine Mathématiques. */
  readonly filtreDomaine_MAT: Locator;

  // --- Noeuds de l'arbre (premier nœud affiché) ---
  /** Bouton "toggle" (déplier/replier) du premier nœud affiché. */
  readonly btnTogglePremierNoeud: Locator;
  /** Bouton de sélection du premier nœud affiché. */
  readonly btnSelectionnerPremierNoeud: Locator;
  /** Bouton "Ajouter au panier" du premier nœud affiché. */
  readonly btnAjouterAuPanierPremierNoeud: Locator;

  // --- Panier (colonne droite) ---
  /** Bouton VIDER le panier. */
  readonly btnViderPanier: Locator;
  /** Bouton ENVOYER VERS PROJET. */
  readonly btnEnvoyerProjet: Locator;
  /** Bouton ENVOYER VERS SÉANCE. */
  readonly btnEnvoyerSeance: Locator;
  /** Bouton ✕ "Retirer" du premier élément du panier. */
  readonly btnRetirerPremierePanier: Locator;

  constructor(page: Page) {
    super(page);

    this.rechercheArbreCompetences = page.locator('#rechercheArbreCompetences');

    this.filtreDomaine_APS = page.locator('#filtreDomaine_APS');
    this.filtreDomaine_AA = page.locator('#filtreDomaine_AA');
    this.filtreDomaine_EXP = page.locator('#filtreDomaine_EXP');
    this.filtreDomaine_ML = page.locator('#filtreDomaine_ML');
    this.filtreDomaine_FR = page.locator('#filtreDomaine_FR');
    this.filtreDomaine_MAT = page.locator('#filtreDomaine_MAT');

    this.btnTogglePremierNoeud = page.locator('[id^="noeudToggle_"]').first();
    this.btnSelectionnerPremierNoeud = page.locator('[id^="noeudSel_"]').first();
    this.btnAjouterAuPanierPremierNoeud = page.locator('[id^="btnAjouterPanier_"]').first();

    this.btnViderPanier = page.locator('#btnViderPanier');
    this.btnEnvoyerProjet = page.locator('#btnEnvoyerProjet');
    this.btnEnvoyerSeance = page.locator('#btnEnvoyerSeance');
    this.btnRetirerPremierePanier = page.locator('[id^="btnRetirerCompetence"]').first();
  }
}
