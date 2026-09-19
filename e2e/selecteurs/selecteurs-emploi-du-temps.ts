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
  /** Liste `<ul>` des EDT (pour vérifier qu'un nouvel EDT y apparaît). */
  readonly listeEdts: Locator;
  /** Bouton de sélection de l'EDT "Semaine paire" (jeu de données). */
  readonly btnEdtSemainePaire: Locator;
  /** Bouton de sélection de l'EDT "Semaine impaire" (jeu de données). */
  readonly btnEdtSemaineImpaire: Locator;
  /** Bouton de sélection de l'EDT "Semaine complète" (jeu de données). */
  readonly btnEdtSemaineComplete: Locator;

  // --- Grille hebdomadaire ---
  /** En-tête de la grille hebdomadaire (contient les noms des colonnes jour). */
  readonly grilleEntete: Locator;
  /** Tableau complet de la grille (pour vérifier le texte des créneaux). */
  readonly conteneurGrille: Locator;
  /** Message affiché dans la zone grille quand aucun EDT n'est sélectionné. */
  readonly grilleVide: Locator;
  /** Message affiché dans la zone droite quand aucun formulaire n'est ouvert. */
  readonly droiteVide: Locator;
  /** Bouton IMPRIMER l'EDT sélectionné. */
  readonly btnImprimerEdt: Locator;
  /** Premier créneau existant dans la grille (index 0 — tout EDT confondu). */
  readonly premierCreneauGrille: Locator;
  /**
   * Premier créneau de l'EDT "Semaine paire" dans la grille.
   * id=cr000001-0000-4000-8000-000000000001 (lundi 08:30-09:15).
   */
  readonly premierCreneauSemainePaire: Locator;
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
  /** Champ Heure de début du premier temps du créneau (mc-champ-heure). */
  readonly inputHeureDebutTemps0: Locator;
  /** Champ Heure de fin du premier temps du créneau (mc-champ-heure). */
  readonly inputHeureFinTemps0: Locator;
  /** Select Type du créneau (pédagogique / récréation / pause). */
  readonly selectTypeCreneau: Locator;
  /** Champ Titre du premier temps du créneau (input interne de mc-input, id suffixé `-input`, visible pour le type pédagogique). */
  readonly inputTitreTemps0: Locator;
  /** Titre (h2) du formulaire de créneau : « Créer créneau » ou « Modifier créneau ». */
  readonly titreFormulaireCreneau: Locator;
  /** Bouton de la liste sélectionnant l'EDT nommé « EDT pastilles » (créé par les tests). */
  readonly btnEdtPastilles: Locator;
  /** Pastilles d'élèves concernés affichées dans la grille. */
  readonly pastillesGrille: Locator;
  /** Bouton radio « Groupes » du périmètre du premier temps. */
  readonly radioGroupesTemps0: Locator;
  /** Chip du groupe A dans le périmètre du premier temps. */
  readonly chipGroupeATemps0: Locator;
  /** Select Jour du formulaire créneau. */
  readonly selectJourCreneau: Locator;
  /** Cellule du lundi de la première ligne de la grille. */
  readonly celluleLundiPremiereLigne: Locator;
  /** Cellule du mardi de la première ligne de la grille. */
  readonly celluleMardiPremiereLigne: Locator;
  /** Bouton AJOUTER UN TEMPS au créneau en cours d'édition. */
  readonly btnAjouterTemps: Locator;
  /** Blocs « Temps n » du formulaire créneau. */
  readonly blocsTemps: Locator;
  /** Bouton SUPPRIMER (premier état) du quatrième temps (index 3). */
  readonly btnSupprimerTemps3: Locator;
  /** Bouton CONFIRMER la suppression du quatrième temps (index 3). */
  readonly btnSupprimerTemps3Confirmer: Locator;
  /** Champ Titre du deuxième temps du créneau (index 1). */
  readonly inputTitreTemps1: Locator;
  /** Bandeau des absences régulières pertinentes pour l'EDT sélectionné. */
  readonly bandeauAbsences: Locator;
  /** Lignes du bandeau d'absences régulières. */
  readonly lignesBandeauAbsences: Locator;
  /** Icônes ⚠ de conflit d'absence présentes dans la grille. */
  readonly iconesConflit: Locator;
  /** Liste des conflits détaillés dans la popin d'avertissement d'absences. */
  readonly listeConflitsPopin: Locator;
  /** Bouton FERMER de la popin d'avertissement d'absences. */
  readonly btnWarningsFermer: Locator;

  // --- EDT calculés ---
  /** Bouton CRÉER UN EMPLOI DU TEMPS CALCULÉ. */
  readonly btnCreerEdtCalcule: Locator;
  /** Liste des EDT calculés (colonne gauche). */
  readonly listeEdtsCalcules: Locator;
  /** Bouton de sélection du premier EDT calculé de la liste. */
  readonly btnPremierEdtCalcule: Locator;
  /** Champ Nom du formulaire d'EDT calculé (input interne de mc-input). */
  readonly inputNomEdtCalcule: Locator;
  /** Chip source « Récréations ». */
  readonly chipSourceRecreation: Locator;
  /** Chip source « Temps de classe ». */
  readonly chipSourceTempsClasse: Locator;
  /** Chip source « Absences régulières ». */
  readonly chipSourceAbsencesRegulieres: Locator;
  /** Message d'erreur du formulaire d'EDT calculé. */
  readonly erreurEdtCalcule: Locator;
  /** Bouton ENREGISTRER l'EDT calculé. */
  readonly btnEnregistrerEdtCalcule: Locator;
  /** Bouton ANNULER le formulaire d'EDT calculé. */
  readonly btnAnnulerEdtCalcule: Locator;
  /** Bouton SUPPRIMER (premier état) l'EDT calculé. */
  readonly btnSupprimerEdtCalcule: Locator;
  /** Bouton CONFIRMER la suppression de l'EDT calculé. */
  readonly btnSupprimerEdtCalculeConfirmer: Locator;
  /** Cellules de la grille issues d'un calcul. */
  readonly cellulesCalculees: Locator;
  /** Boutons de créneau éditable de la grille (absents en lecture seule). */
  readonly boutonsCreneauEditable: Locator;
  /** Boutons d'ajout de créneau de la grille (absents en lecture seule). */
  readonly boutonsAjoutCreneau: Locator;

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
    this.listeEdts = page.locator('.edt__liste[aria-label="Liste des emplois du temps"]');
    this.btnEdtSemainePaire = page.locator(
      '#btnSelectionnerEdtet000001-0000-4000-8000-000000000001',
    );
    this.btnEdtSemaineImpaire = page.locator(
      '#btnSelectionnerEdtet000002-0000-4000-8000-000000000001',
    );
    this.btnEdtSemaineComplete = page.locator(
      '#btnSelectionnerEdtet000003-0000-4000-8000-000000000001',
    );

    this.grilleEntete = page.locator('.edt__grille thead');
    this.conteneurGrille = page.locator('.edt__grille');
    this.grilleVide = page.locator('.edt__grille-vide');
    this.droiteVide = page.locator('.edt__droite-vide');
    this.btnImprimerEdt = page.locator('#btnImprimerEdt');
    this.premierCreneauGrille = page.locator('[id^="btnCreneau"]').first();
    this.premierCreneauSemainePaire = page
      .locator('[id^="btnCreneaucr000001-0000-4000-8000-000000000001"]')
      .first();
    this.btnAjouterCreneauCelluleVide = page.locator('[id^="btnAjouterCreneau"]').first();
    this.btnNouveauCreneauLigne = page.locator('[id^="btnNouveauCreneauJour"]').first();

    this.inputNomEdt = page.locator('#inputNomEdt-input');
    this.inputDateDebutEdt = page.locator('#inputDateDebutEdt-input');
    this.inputDateFinEdt = page.locator('#inputDateFinEdt-input');
    this.selectFrequenceEdt = page.locator('#selectFrequenceEdt select');
    this.btnEnregistrerEdt = page.locator('#btnEnregistrerEdt');
    this.btnAnnulerEdt = page.locator('#btnAnnulerEdt');
    this.btnSupprimerEdt = page.locator('#btnSupprimerEdt');
    this.btnSupprimerEdtConfirmer = page.locator('#btnSupprimerEdt_confirmer');

    this.inputHeureDebutTemps0 = page.locator('#inputHeureDebutTemps0');
    this.inputHeureFinTemps0 = page.locator('#inputHeureFinTemps0');
    this.selectTypeCreneau = page.locator('#selectTypeCreneau select');
    this.inputTitreTemps0 = page.locator('#inputTitreTemps0-input');
    this.btnEdtPastilles = this.listeEdts.getByRole('button', {
      name: 'EDT pastilles',
      exact: true,
    });
    this.pastillesGrille = page.locator(
      '.edt__grille .mc-pastilles-eleves-concernes .mc-disc-pill',
    );
    this.radioGroupesTemps0 = page.locator('#elevesConcernesTemps0_groupes');
    this.chipGroupeATemps0 = page.locator('#elevesConcernesTemps0_groupe_A');
    this.selectJourCreneau = page.locator('#selectJourCreneau select');
    this.celluleLundiPremiereLigne = page.locator('.edt__grille tbody tr:first-child td').nth(1);
    this.celluleMardiPremiereLigne = page.locator('.edt__grille tbody tr:first-child td').nth(2);
    this.btnAjouterTemps = page.locator('#btnAjouterTemps');
    this.blocsTemps = page.locator('.edt-formulaire__temps');
    this.btnSupprimerTemps3 = page.locator('#btnSupprimerTemps3');
    this.btnSupprimerTemps3Confirmer = page.locator('#btnSupprimerTemps3_confirmer');
    this.inputTitreTemps1 = page.locator('#inputTitreTemps1-input');
    this.bandeauAbsences = page.locator('.edt__bandeau-absences');
    this.lignesBandeauAbsences = page.locator('.edt__bandeau-absences li');
    this.iconesConflit = page.locator('[id^="btnConflitCreneau"]');
    this.listeConflitsPopin = page.locator('.mc-popin__liste-conflits');
    this.btnWarningsFermer = page.locator('#btnWarningsFermerAbsences');
    this.btnCreerEdtCalcule = page.locator('#btnCreerEdtCalcule');
    this.listeEdtsCalcules = page.locator(
      '.edt__liste[aria-label="Liste des emplois du temps calculés"]',
    );
    this.btnPremierEdtCalcule = page.locator('[id^="btnSelectionnerEdtCalcule"]').first();
    this.inputNomEdtCalcule = page.locator('#inputNomEdtCalcule-input');
    this.chipSourceRecreation = page.locator('#chipSourceEdtCalculerecreation');
    this.chipSourceTempsClasse = page.locator('#chipSourceEdtCalculetempsClasse');
    this.chipSourceAbsencesRegulieres = page.locator('#chipSourceEdtCalculeabsencesRegulieres');
    this.erreurEdtCalcule = page.locator('#erreurFormulaireEdtCalcule');
    this.btnEnregistrerEdtCalcule = page.locator('#btnEnregistrerEdtCalcule');
    this.btnAnnulerEdtCalcule = page.locator('#btnAnnulerEdtCalcule');
    this.btnSupprimerEdtCalcule = page.locator('#btnSupprimerEdtCalcule');
    this.btnSupprimerEdtCalculeConfirmer = page.locator('#btnSupprimerEdtCalcule_confirmer');
    this.cellulesCalculees = page.locator('.edt__creneau-calcule');
    this.boutonsCreneauEditable = page.locator('.edt__btn-creneau');
    this.boutonsAjoutCreneau = page.locator('.edt__btn-ajouter-creneau, .edt__btn-nouveau-creneau');
    this.titreFormulaireCreneau = page.locator('#formCreneau h2');
    this.btnEnregistrerCreneau = page.locator('#btnEnregistrerCreneau');
    this.btnAnnulerCreneau = page.locator('#btnAnnulerCreneau');
    this.btnSupprimerCreneau = page.locator('#btnSupprimerCreneau');
    this.btnSupprimerCreneauConfirmer = page.locator('#btnSupprimerCreneau_confirmer');
  }
}
