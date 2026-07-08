import { type Page, type Locator } from '@playwright/test';
import { SelecteursBase } from './selecteurs-base';

/**
 * Sélecteurs de l'écran Projets.
 * L'écran comporte trois colonnes : liste gauche, fiche centrale, formulaire droit (mode édition).
 *
 * Projets du jeu de données d'exemple :
 *   - "Journal de la classe"     (id : 11111111-aaaa-bbbb-cccc-journal00001)  — domaines : FR, EMC, QLM
 *   - "Potager pédagogique"      (id : 22222222-aaaa-bbbb-cccc-potager00002)  — domaines : MAT, QLM
 *   - "Spectacle de fin d'année" (id : 33333333-aaaa-bbbb-cccc-spectacle0003) — domaines : EMC, EPS
 */
export class SelecteursProjets extends SelecteursBase {
  // --- Colonne gauche : liste ---
  /** Bouton CRÉER un nouveau projet. */
  readonly btnCreerProjet: Locator;
  /** Champ de recherche dans la liste des projets. */
  readonly champRechercheProjet: Locator;

  // --- Chips de filtre par domaine ---
  /** Chip de filtre domaine Français (FR — présent dans Journal). */
  readonly chipDomaineFR: Locator;
  /** Chip de filtre domaine Mathématiques (MAT — présent dans Potager). */
  readonly chipDomaineMAT: Locator;

  // --- Boutons de sélection des projets du jeu de données ---
  /** Bouton de sélection du projet "Journal de la classe". */
  readonly btnProjetJournal: Locator;
  /** Bouton de sélection du projet "Potager pédagogique". */
  readonly btnProjetPotager: Locator;
  /** Bouton de sélection du projet "Spectacle de fin d'année". */
  readonly btnProjetSpectacle: Locator;

  // --- Fiche projet (lecture seule) ---
  /** Titre du projet (h2.fiche-projet__titre) en mode lecture seule. */
  readonly titreFiche: Locator;
  /** Description du projet en mode lecture seule. */
  readonly descriptionFiche: Locator;
  /** Liste des périodes en mode lecture seule. */
  readonly listePeriodesFiche: Locator;
  /** Message affiché quand aucun projet n'est sélectionné. */
  readonly messageAucunProjetSelectionne: Locator;
  /** Bouton MODIFIER sur la fiche projet. */
  readonly btnModifierProjet: Locator;
  /** Bouton IMPRIMER sur la fiche projet. */
  readonly btnImprimerProjet: Locator;
  /** Bouton SUPPRIMER (premier état du mc-bouton-destruction). */
  readonly btnSupprimerProjet: Locator;
  /** Bouton CONFIRMER la suppression du projet. */
  readonly btnSupprimerProjetConfirmer: Locator;

  // --- Formulaire projet ---
  /** Champ Nom du projet (mc-input). */
  readonly champFormNomProjet: Locator;
  /** Champ Description du projet (mc-textarea). */
  readonly champFormDescProjet: Locator;
  /** Bouton ENREGISTRER le projet. */
  readonly btnEnregistrerProjet: Locator;
  /** Bouton ANNULER la saisie projet. */
  readonly btnAnnulerProjet: Locator;

  // --- Section élèves concernés (mc-chip-filtre par élève — index dynamique) ---
  /** Premier chip d'élève dans le sélecteur "Élèves concernés" (index 0). */
  readonly premierChipEleveProjet: Locator;

  // --- Section périodes du projet ---
  /** Bouton AJOUTER PÉRIODE. */
  readonly btnAjouterPeriodeProjet: Locator;

  // --- Première période (index 0) ---
  /** Champ Nom de la première période (mc-input, index 0). */
  readonly champPeriodeNomProjet0: Locator;
  /** Champ Date de début de la première période (mc-input type date, index 0). */
  readonly champPeriodeDebutProjet0: Locator;
  /** Champ Date de fin de la première période (mc-input type date, index 0). */
  readonly champPeriodeFinProjet0: Locator;
  /** Champ Description de la première période (mc-textarea, index 0). */
  readonly champPeriodeDescProjet0: Locator;
  /** Bouton SUPPRIMER de la première période (premier état, index 0). */
  readonly btnSupprimerPeriodeProjet0: Locator;
  /** Bouton CONFIRMER la suppression de la première période (index 0). */
  readonly btnSupprimerPeriodeProjet0Confirmer: Locator;

  // --- Troisième période (index 2 — Spectacle a 2 périodes, la nouvelle ajoutée est en index 2) ---
  /** Champ Nom de la troisième période (mc-input, index 2). */
  readonly champPeriodeNomProjet2: Locator;

  constructor(page: Page) {
    super(page);

    this.btnCreerProjet = page.locator('#btnCreerProjet');
    this.champRechercheProjet = page.locator('#rechercheProjet input');

    this.chipDomaineFR = page.locator('#chipDomaineFR');
    this.chipDomaineMAT = page.locator('#chipDomaineMAT');

    this.btnProjetJournal = page.locator('#btnProjet11111111-aaaa-bbbb-cccc-journal00001');
    this.btnProjetPotager = page.locator('#btnProjet22222222-aaaa-bbbb-cccc-potager00002');
    this.btnProjetSpectacle = page.locator('#btnProjet33333333-aaaa-bbbb-cccc-spectacle0003');

    this.titreFiche = page.locator('.fiche-projet__titre');
    this.descriptionFiche = page.locator('.fiche-projet__description');
    this.listePeriodesFiche = page.locator('.fiche-projet__periodes');
    this.messageAucunProjetSelectionne = page.locator('.projets__vide');

    this.btnModifierProjet = page.locator('#btnModifierProjet');
    this.btnImprimerProjet = page.locator('#btnImprimerProjet');
    this.btnSupprimerProjet = page.locator('#btnSupprimerProjet');
    this.btnSupprimerProjetConfirmer = page.locator('#btnSupprimerProjet_confirmer');

    this.champFormNomProjet = page.locator('#champFormNomProjet-input');
    this.champFormDescProjet = page.locator('#champFormDescProjet textarea');
    this.btnEnregistrerProjet = page.locator('#btnEnregistrerProjet');
    this.btnAnnulerProjet = page.locator('#btnAnnulerProjet');

    this.premierChipEleveProjet = page.locator('[id^="chipProjetEleve"]').first();

    this.btnAjouterPeriodeProjet = page.locator('#btnAjouterPeriodeProjet');

    // [id] dynamique → l'id est sur le <input> interne, pas sur <mc-input> → pas de suffixe "input"
    this.champPeriodeNomProjet0 = page.locator('#champPeriodeNomProjet0-input');
    this.champPeriodeDebutProjet0 = page.locator('#champPeriodeDebutProjet0-input');
    this.champPeriodeFinProjet0 = page.locator('#champPeriodeFinProjet0-input');
    this.champPeriodeDescProjet0 = page.locator('#champPeriodeDescProjet0-input');
    this.btnSupprimerPeriodeProjet0 = page.locator('#btnSupprimerPeriodeProjet0');
    this.btnSupprimerPeriodeProjet0Confirmer = page.locator(
      '#btnSupprimerPeriodeProjet0_confirmer',
    );

    this.champPeriodeNomProjet2 = page.locator('#champPeriodeNomProjet2-input');
  }
}
