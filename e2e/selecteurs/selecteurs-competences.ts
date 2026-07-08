import { type Page, type Locator } from '@playwright/test';
import { SelecteursBase } from './selecteurs-base';

/**
 * Sélecteurs de l'écran Compétences.
 * L'écran comporte deux zones : arbre de sélection (gauche) et panier (droite).
 * La popin d'export est définie dans {@link SelecteursBase}.
 *
 * Domaines actifs dans le jeu de données (domainesActifs filtre les sous-domaines) :
 *   EMC, QLM, EPS, EART, LV, FR, MAT — dans cet ordre dans l'arbre.
 * Premier domaine visible : EMC, avec sous-domaines EMC-C2 et EMC-CM1.
 */
export class SelecteursCompetences extends SelecteursBase {
  // --- Champ de recherche dans l'arbre ---
  /**
   * Champ de recherche textuel dans l'arbre de compétences.
   * L'id statique sur <mc-champ-recherche> se propage à l'<input> interne → suffixe "input".
   */
  readonly rechercheArbreCompetences: Locator;

  // --- Chips de filtre par domaine (domaines actifs dans le jeu de données) ---
  /** Chip de filtre domaine Enseignement moral et civique (EMC). */
  readonly filtreDomaine_EMC: Locator;
  /** Chip de filtre domaine Questionner le monde (QLM). */
  readonly filtreDomaine_QLM: Locator;
  /** Chip de filtre domaine Éducation physique et sportive (EPS). */
  readonly filtreDomaine_EPS: Locator;
  /** Chip de filtre domaine Enseignements artistiques (EART). */
  readonly filtreDomaine_EART: Locator;
  /** Chip de filtre domaine Français (FR). */
  readonly filtreDomaine_FR: Locator;
  /** Chip de filtre domaine Mathématiques (MAT). */
  readonly filtreDomaine_MAT: Locator;

  // --- Nœuds de l'arbre ---
  /** Bouton "toggle" (déplier/replier) du premier nœud affiché (EMC). */
  readonly btnTogglePremierNoeud: Locator;
  /** Bouton de sélection du premier nœud affiché (EMC). */
  readonly btnSelectionnerPremierNoeud: Locator;
  /** Bouton "Ajouter au panier" du premier nœud affiché (EMC). */
  readonly btnAjouterAuPanierPremierNoeud: Locator;
  /** Bouton "Ajouter au panier" du deuxième nœud affiché (QLM). */
  readonly btnAjouterAuPanierDeuxiemeNoeud: Locator;
  /** Nœud de sélection du domaine EMC. */
  readonly noeudSelEmc: Locator;
  /** Premier enfant visible de EMC après déplier (EMC-C2). */
  readonly premierEnfantArbreEmc: Locator;
  /** Nœud de sélection du domaine FR. */
  readonly noeudSelFr: Locator;
  /** Nœud de sélection du domaine MAT. */
  readonly noeudSelMat: Locator;

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

    // [id] statique sur <mc-champ-recherche> → propage aux deux niveaux → utiliser le suffixe "input"
    this.rechercheArbreCompetences = page.locator('#rechercheArbreCompetences input');

    // <mc-chip-filtre [id]="'filtreDomaine_' + domaine.id"> → [id] dynamique → id sur le <button> interne
    this.filtreDomaine_EMC = page.locator('#filtreDomaine_EMC');
    this.filtreDomaine_QLM = page.locator('#filtreDomaine_QLM');
    this.filtreDomaine_EPS = page.locator('#filtreDomaine_EPS');
    this.filtreDomaine_EART = page.locator('#filtreDomaine_EART');
    this.filtreDomaine_FR = page.locator('#filtreDomaine_FR');
    this.filtreDomaine_MAT = page.locator('#filtreDomaine_MAT');

    this.btnTogglePremierNoeud = page.locator('[id^="noeudToggle_"]').first();
    this.btnSelectionnerPremierNoeud = page.locator('[id^="noeudSel_"]').first();
    this.btnAjouterAuPanierPremierNoeud = page.locator('[id^="btnAjouterPanier_"]').first();
    this.btnAjouterAuPanierDeuxiemeNoeud = page.locator('[id^="btnAjouterPanier_"]').nth(1);

    this.noeudSelEmc = page.locator('#noeudSel_EMC');
    this.premierEnfantArbreEmc = page.locator('#noeudSel_EMC-C2');
    this.noeudSelFr = page.locator('#noeudSel_FR');
    this.noeudSelMat = page.locator('#noeudSel_MAT');

    this.btnViderPanier = page.locator('#btnViderPanier');
    this.btnEnvoyerProjet = page.locator('#btnEnvoyerProjet');
    this.btnEnvoyerSeance = page.locator('#btnEnvoyerSeance');
    this.btnRetirerPremierePanier = page.locator('[id^="btnRetirerCompetence"]').first();
  }
}
