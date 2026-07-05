import { type Page, type Locator } from '@playwright/test';
import { SelecteursBase } from './selecteurs-base';

/**
 * Sélecteurs de l'écran Emploi du Temps.
 * L'écran comporte trois colonnes : liste EDT gauche, grille hebdo centrale, formulaire droit.
 *
 * IDs des EDT du jeu de données d'exemple :
 *   - et000001-0000-4000-8000-000000000001 → "Semaine paire — 1ère partie"
 *   - et000002-0000-4000-8000-000000000001 → "Semaine impaire — 1ère partie"
 *   - et000003-0000-4000-8000-000000000001 → "Semaine complète — 2ème partie"
 */
export class SelecteursEmploiDuTemps extends SelecteursBase {

  // --- Colonne gauche : liste des EDT ---
  /** Bouton CRÉER un nouvel EDT. */
  readonly btnCreerEdt: Locator;
  /** Bouton de sélection de l'EDT "Semaine paire" (jeu de données). */
  readonly btnEdtSemainePaire: Locator;
  /** Bouton de sélection de l'EDT "Semaine impaire" (jeu de données). */
  readonly btnEdtSemaineImpaire: Locator;
  /** Bouton de sélection de l'EDT "Semaine complète" (jeu de données). */
  readonly btnEdtSemaineComplete: Locator;

  // --- Grille hebdomadaire ---
  /** Bouton IMPRIMER l'EDT sélectionné. */
  readonly btnImprimerEdt: Locator;
  /** Premier créneau existant dans la grille (index 0). */
  readonly premierCreneauGrille: Locator;
  /** Premier bouton "+" d'ajout de créneau dans une cellule vide de la grille. */
  readonly btnAjouterCreneauCelluleVide: Locator;
  /** Premier bouton "AJOUTER" en ligne basse de la grille (par jour). */
  readonly btnNouveauCreneauLigne: Locator;

  // --- Formulaire EDT (colonne droite, onglet EDT) ---
  /** Champ Nom de l'EDT (mc-input). */
  readonly inputNomEdt: Locator;
  /** Champ Date de début de l'EDT (mc-input type date). */
  readonly inputDateDebutEdt: Locator;
  /** Champ Date de fin de l'EDT (mc-input type date). */
  readonly inputDateFinEdt: Locator;
  /** Select Fréquence de l'EDT (mc-select). */
  readonly selectFrequenceEdt: Locator;
  /** Bouton ENREGISTRER le formulaire EDT. */
  readonly btnEnregistrerEdt: Locator;
  /** Bouton ANNULER la saisie EDT. */
  readonly btnAnnulerEdt: Locator;
  /** Bouton SUPPRIMER l'EDT (premier état du mc-bouton-destruction). */
  readonly btnSupprimerEdt: Locator;
  /** Bouton CONFIRMER la suppression de l'EDT. */
  readonly btnSupprimerEdtConfirmer: Locator;

  // --- Formulaire créneau (colonne droite, onglet créneau) ---
  /** Champ Heure de début du créneau (mc-champ-heure). */
  readonly inputHeureDebutCreneau: Locator;
  /** Champ Heure de fin du créneau (mc-champ-heure). */
  readonly inputHeureFinCreneau: Locator;
  /** Select Type du créneau (pédagogique / récréation / pause). */
  readonly selectTypeCreneau: Locator;
  /** Champ Titre du créneau (mc-input, visible pour le type pédagogique). */
  readonly inputTitreCreneau: Locator;
  /** Bouton ENREGISTRER le créneau. */
  readonly btnEnregistrerCreneau: Locator;
  /** Bouton ANNULER la saisie créneau. */
  readonly btnAnnulerCreneau: Locator;
  /** Bouton SUPPRIMER le créneau (premier état du mc-bouton-destruction). */
  readonly btnSupprimerCreneau: Locator;
  /** Bouton CONFIRMER la suppression du créneau. */
  readonly btnSupprimerCreneauConfirmer: Locator;

  constructor(page: Page) {
    super(page);

    this.btnCreerEdt = page.locator('#btnCreerEdt');
    this.btnEdtSemainePaire = page.locator('#btnSelectionnerEdtet000001-0000-4000-8000-000000000001');
    this.btnEdtSemaineImpaire = page.locator('#btnSelectionnerEdtet000002-0000-4000-8000-000000000001');
    this.btnEdtSemaineComplete = page.locator('#btnSelectionnerEdtet000003-0000-4000-8000-000000000001');

    this.btnImprimerEdt = page.locator('#btnImprimerEdt');
    this.premierCreneauGrille = page.locator('[id^="btnCreneau"]').first();
    this.btnAjouterCreneauCelluleVide = page.locator('[id^="btnAjouterCreneau"]').first();
    this.btnNouveauCreneauLigne = page.locator('[id^="btnNouveauCreneauJour"]').first();

    this.inputNomEdt = page.locator('#inputNomEdt input');
    this.inputDateDebutEdt = page.locator('#inputDateDebutEdt input');
    this.inputDateFinEdt = page.locator('#inputDateFinEdt input');
    this.selectFrequenceEdt = page.locator('#selectFrequenceEdt select');
    this.btnEnregistrerEdt = page.locator('#btnEnregistrerEdt');
    this.btnAnnulerEdt = page.locator('#btnAnnulerEdt');
    this.btnSupprimerEdt = page.locator('#btnSupprimerEdt');
    this.btnSupprimerEdtConfirmer = page.locator('#btnSupprimerEdt_confirmer');

    this.inputHeureDebutCreneau = page.locator('#inputHeureDebutCreneau input');
    this.inputHeureFinCreneau = page.locator('#inputHeureFinCreneau input');
    this.selectTypeCreneau = page.locator('#selectTypeCreneau select');
    this.inputTitreCreneau = page.locator('#inputTitreCreneau input');
    this.btnEnregistrerCreneau = page.locator('#btnEnregistrerCreneau');
    this.btnAnnulerCreneau = page.locator('#btnAnnulerCreneau');
    this.btnSupprimerCreneau = page.locator('#btnSupprimerCreneau');
    this.btnSupprimerCreneauConfirmer = page.locator('#btnSupprimerCreneau_confirmer');
  }
}
