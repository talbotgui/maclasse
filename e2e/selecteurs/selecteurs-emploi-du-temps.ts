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
  public readonly btnCreerEdt: Locator;
  /** Liste `<ul>` des EDT (pour vérifier qu'un nouvel EDT y apparaît). */
  public readonly listeEdts: Locator;
  /** Bouton de sélection de l'EDT "Semaine paire" (jeu de données). */
  public readonly btnEdtSemainePaire: Locator;
  /** Bouton de sélection de l'EDT "Semaine impaire" (jeu de données). */
  public readonly btnEdtSemaineImpaire: Locator;
  /** Bouton de sélection de l'EDT "Semaine complète" (jeu de données). */
  public readonly btnEdtSemaineComplete: Locator;

  // --- Grille hebdomadaire ---
  /** En-tête de la grille hebdomadaire (contient les noms des colonnes jour). */
  public readonly grilleEntete: Locator;
  /** Tableau complet de la grille (pour vérifier le texte des créneaux). */
  public readonly conteneurGrille: Locator;
  /** Message affiché dans la zone grille quand aucun EDT n'est sélectionné. */
  public readonly grilleVide: Locator;
  /** Message affiché dans la zone droite quand aucun formulaire n'est ouvert. */
  public readonly droiteVide: Locator;
  /** Bouton IMPRIMER l'EDT sélectionné. */
  public readonly btnImprimerEdt: Locator;
  /** Colonne gauche (listes des EDT), masquée à l'impression. */
  public readonly colonneGauche: Locator;
  /** Colonne droite (formulaire contextuel), masquée à l'impression. */
  public readonly colonneDroite: Locator;
  /** Premier créneau existant dans la grille (index 0 — tout EDT confondu). */
  public readonly premierCreneauGrille: Locator;
  /**
   * Premier créneau de l'EDT "Semaine paire" dans la grille.
   * id=cr000001-0000-4000-8000-000000000001 (lundi 08:30-09:15).
   */
  public readonly premierCreneauSemainePaire: Locator;
  /** Premier bouton "+" d'ajout de créneau dans une cellule vide de la grille. */
  public readonly btnAjouterCreneauCelluleVide: Locator;
  /** Premier bouton "AJOUTER" en ligne basse de la grille (par jour). */
  public readonly btnNouveauCreneauLigne: Locator;

  // --- Formulaire EDT (colonne droite, onglet EDT) ---
  /** Champ Nom de l'EDT (mc-input). */
  public readonly inputNomEdt: Locator;
  /** Champ Date de début de l'EDT (mc-input type date). */
  public readonly inputDateDebutEdt: Locator;
  /** Champ Date de fin de l'EDT (mc-input type date). */
  public readonly inputDateFinEdt: Locator;
  /** Select Fréquence de l'EDT (mc-select). */
  public readonly selectFrequenceEdt: Locator;
  /** Bouton ENREGISTRER le formulaire EDT. */
  public readonly btnEnregistrerEdt: Locator;
  /** Bouton ANNULER la saisie EDT. */
  public readonly btnAnnulerEdt: Locator;
  /** Bouton SUPPRIMER l'EDT (premier état du mc-bouton-destruction). */
  public readonly btnSupprimerEdt: Locator;
  /** Bouton CONFIRMER la suppression de l'EDT. */
  public readonly btnSupprimerEdtConfirmer: Locator;

  // --- Formulaire créneau (colonne droite, onglet créneau) ---
  /** Champ Heure de début du premier temps du créneau (mc-champ-heure). */
  public readonly inputHeureDebutTemps0: Locator;
  /** Champ Heure de fin du premier temps du créneau (mc-champ-heure). */
  public readonly inputHeureFinTemps0: Locator;
  /** Select Type du créneau (pédagogique / récréation / pause). */
  public readonly selectTypeCreneau: Locator;
  /** Champ Titre du premier temps du créneau (input interne de mc-input, id suffixé `-input`, visible pour le type pédagogique). */
  public readonly inputTitreTemps0: Locator;
  /** Libellés du type de créneau affichés dans les cellules de la grille. */
  public readonly typesCreneauGrille: Locator;
  /** Titre (h2) du formulaire de créneau : « Créer créneau » ou « Modifier créneau ». */
  public readonly titreFormulaireCreneau: Locator;
  /** Bouton de la liste sélectionnant l'EDT nommé « EDT pastilles » (créé par les tests). */
  public readonly btnEdtPastilles: Locator;
  /** Pastilles d'élèves concernés affichées dans la grille. */
  public readonly pastillesGrille: Locator;
  /** Bouton radio « Groupes » du périmètre du premier temps. */
  public readonly radioGroupesTemps0: Locator;
  /** Chip du groupe A dans le périmètre du premier temps. */
  public readonly chipGroupeATemps0: Locator;
  /** Select Jour du formulaire créneau. */
  public readonly selectJourCreneau: Locator;
  /** Cellule du lundi de la première ligne de la grille. */
  public readonly celluleLundiPremiereLigne: Locator;
  /** Cellule du mardi de la première ligne de la grille. */
  public readonly celluleMardiPremiereLigne: Locator;
  /** Bouton AJOUTER UN TEMPS au créneau en cours d'édition. */
  public readonly btnAjouterTemps: Locator;
  /** Blocs « Temps n » du formulaire créneau. */
  public readonly blocsTemps: Locator;
  /** Bouton SUPPRIMER (premier état) du quatrième temps (index 3). */
  public readonly btnSupprimerTemps3: Locator;
  /** Bouton CONFIRMER la suppression du quatrième temps (index 3). */
  public readonly btnSupprimerTemps3Confirmer: Locator;
  /** Champ Titre du deuxième temps du créneau (index 1). */
  public readonly inputTitreTemps1: Locator;
  /** Bandeau des absences régulières pertinentes pour l'EDT sélectionné. */
  public readonly bandeauAbsences: Locator;
  /** Lignes du bandeau d'absences régulières. */
  public readonly lignesBandeauAbsences: Locator;
  /** Bouton de repli/dépli de la liste du bandeau d'absences régulières. */
  public readonly btnBasculerAbsences: Locator;
  /** Nombre d'absences affiché dans le bouton de bascule quand la liste est repliée. */
  public readonly nombreAbsencesReplie: Locator;
  /** Icônes ⚠ de conflit d'absence présentes dans la grille. */
  public readonly iconesConflit: Locator;
  /** Liste des conflits détaillés dans la popin d'avertissement d'absences. */
  public readonly listeConflitsPopin: Locator;
  /** Bouton FERMER de la popin d'avertissement d'absences. */
  public readonly btnWarningsFermer: Locator;

  // --- EDT calculés ---
  /** Bouton CRÉER UN EMPLOI DU TEMPS CALCULÉ. */
  public readonly btnCreerEdtCalcule: Locator;
  /** Liste des EDT calculés (colonne gauche). */
  public readonly listeEdtsCalcules: Locator;
  /** Bouton de sélection du premier EDT calculé de la liste. */
  public readonly btnPremierEdtCalcule: Locator;
  /** Champ Nom du formulaire d'EDT calculé (input interne de mc-input). */
  public readonly inputNomEdtCalcule: Locator;
  /** Chip source « Temps hors classe » (récréations et pauses déjeuner). */
  public readonly chipSourceTempsHorsClasse: Locator;
  /** Chip source « Temps de classe ». */
  public readonly chipSourceTempsClasse: Locator;
  /** Chip source « Absences régulières ». */
  public readonly chipSourceAbsencesRegulieres: Locator;
  /** Message d'erreur du formulaire d'EDT calculé. */
  public readonly erreurEdtCalcule: Locator;
  /** Message d'erreur « nom obligatoire » du formulaire des propriétés d'un EDT. */
  public readonly erreurFormulaireEdt: Locator;
  /** Message d'erreur des horaires du premier temps du formulaire créneau. */
  public readonly erreurHeuresTemps0: Locator;
  /** Bouton ENREGISTRER l'EDT calculé. */
  public readonly btnEnregistrerEdtCalcule: Locator;
  /** Bouton ANNULER le formulaire d'EDT calculé. */
  public readonly btnAnnulerEdtCalcule: Locator;
  /** Bouton SUPPRIMER (premier état) l'EDT calculé. */
  public readonly btnSupprimerEdtCalcule: Locator;
  /** Bouton CONFIRMER la suppression de l'EDT calculé. */
  public readonly btnSupprimerEdtCalculeConfirmer: Locator;
  /** Cellules de la grille issues d'un calcul. */
  public readonly cellulesCalculees: Locator;
  /** Boutons de créneau éditable de la grille (absents en lecture seule). */
  public readonly boutonsCreneauEditable: Locator;
  /** Boutons d'ajout de créneau de la grille (absents en lecture seule). */
  public readonly boutonsAjoutCreneau: Locator;

  /** Bouton ENREGISTRER le créneau. */
  public readonly btnEnregistrerCreneau: Locator;
  /** Bouton ANNULER la saisie créneau. */
  public readonly btnAnnulerCreneau: Locator;
  /** Bouton SUPPRIMER le créneau (premier état du mc-bouton-destruction). */
  public readonly btnSupprimerCreneau: Locator;
  /** Bouton CONFIRMER la suppression du créneau. */
  public readonly btnSupprimerCreneauConfirmer: Locator;

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
    this.colonneGauche = page.locator('.edt__gauche');
    this.colonneDroite = page.locator('.edt__droite');
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
    this.typesCreneauGrille = page.locator('.edt__creneau-type');
    this.inputTitreTemps0 = page.locator('#inputTitreTemps0-input');
    this.btnEdtPastilles = this.listeEdts.getByRole('button', {
      name: /^EDT pastilles\b/,
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
    this.btnBasculerAbsences = page.locator('#btnBasculerAbsences');
    this.nombreAbsencesReplie = page.locator('#btnBasculerAbsences .edt__absences-nombre');
    this.iconesConflit = page.locator('[id^="btnConflitCreneau"]');
    this.listeConflitsPopin = page.locator('.mc-popin__liste-conflits');
    this.btnWarningsFermer = page.locator('#btnWarningsFermerAbsences');
    this.btnCreerEdtCalcule = page.locator('#btnCreerEdtCalcule');
    this.listeEdtsCalcules = page.locator(
      '.edt__liste[aria-label="Liste des emplois du temps calculés"]',
    );
    this.btnPremierEdtCalcule = page.locator('[id^="btnSelectionnerEdtCalcule"]').first();
    this.inputNomEdtCalcule = page.locator('#inputNomEdtCalcule-input');
    this.chipSourceTempsHorsClasse = page.locator('#chipSourceEdtCalculetempsHorsClasse');
    this.chipSourceTempsClasse = page.locator('#chipSourceEdtCalculetempsClasse');
    this.chipSourceAbsencesRegulieres = page.locator('#chipSourceEdtCalculeabsencesRegulieres');
    this.erreurEdtCalcule = page.locator('#erreurFormulaireEdtCalcule');
    this.erreurFormulaireEdt = page.locator('#erreurFormulaireEdt');
    this.erreurHeuresTemps0 = page.locator('#erreurHeuresTemps0');
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
