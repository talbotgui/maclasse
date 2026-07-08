import { type Page, type Locator } from '@playwright/test';
import { SelecteursBase } from './selecteurs-base';

/** Sélecteurs de l'écran Cahier Journal. */
export class SelecteursCahierJournal extends SelecteursBase {
  // --- Mini-calendrier ---
  /** Bouton "Mois précédent" dans le mini-calendrier. */
  readonly btnMoisPrecedent: Locator;
  /** Bouton "Mois suivant" dans le mini-calendrier. */
  readonly btnMoisSuivant: Locator;

  // --- Navigation journée (flèches en haut de l'écran) ---
  /** Bouton « (−7 jours). */
  readonly btnMoins7Jours: Locator;
  /** Bouton ‹ (−1 jour). */
  readonly btnMoins1Jour: Locator;
  /** Bouton › (+1 jour). */
  readonly btnPlus1Jour: Locator;
  /** Bouton » (+7 jours). */
  readonly btnPlus7Jours: Locator;

  // --- Actions sur la journée affichée ---
  /** Bouton "Initialiser une journée vide" (bandeau haut, journée non initialisée). */
  readonly btnInitialiserVide: Locator;
  /** Bouton "Initialiser depuis l'EDT" (bandeau haut, journée non initialisée). */
  readonly btnInitialiserEdt: Locator;
  /** Bouton "Initialiser une journée vide" (zone centrale, journée vide). */
  readonly btnInitialiserVidePrincipal: Locator;
  /** Bouton DUPLIQUER JOURNÉE. */
  readonly btnDupliquerJournee: Locator;
  /** Bouton IMPRIMER dans le bandeau de la journée. */
  readonly btnImprimerCj: Locator;
  /** Bouton SUPPRIMER JOURNÉE. */
  readonly btnSupprimerJournee: Locator;

  // --- Mini-formulaire de duplication de journée ---
  /** Champ date cible dans le mini-formulaire de duplication. */
  readonly inputDateDuplication: Locator;
  /** Bouton DUPLIQUER (confirmer) dans le mini-formulaire. */
  readonly btnConfirmerDuplication: Locator;
  /** Bouton ANNULER dans le mini-formulaire de duplication. */
  readonly btnAnnulerDuplication: Locator;

  // --- Contrôles par séance (premier élément de la liste) ---
  /** Bouton ↑ "Monter" de la première séance. */
  readonly btnMonterPremierSeance: Locator;
  /** Bouton ↓ "Descendre" de la première séance. */
  readonly btnDescendrePremierSeance: Locator;
  /** Bouton ✎ "Modifier" de la première séance. */
  readonly btnModifierPremierSeance: Locator;
  /** Bouton ⎘ "Dupliquer" de la première séance. */
  readonly btnDupliquerPremierSeance: Locator;
  /** Bouton ✕ "Supprimer" de la première séance. */
  readonly btnSupprimerPremierSeance: Locator;

  // --- Bouton d'ajout ---
  /** Bouton AJOUTER UNE SÉANCE dans la journée courante. */
  readonly btnAjouterSeance: Locator;

  // --- Formulaire de séance ---
  /** Champ Heure de début de séance (mc-champ-heure). */
  readonly champHeureDebutSeance: Locator;
  /** Champ Heure de fin de séance (mc-champ-heure). */
  readonly champHeureFinSeance: Locator;
  /** Select Type de séance (pédagogique / récréation / pause). */
  readonly selectTypeSeance: Locator;
  /** Champ Titre de la séance (mc-input). */
  readonly champTitreSeance: Locator;
  /** Champ Objectifs de la séance (mc-textarea). */
  readonly textareaObjectifsSeance: Locator;
  /** Champ Déroulement de la séance (mc-textarea). */
  readonly textareaDeroulementSeance: Locator;
  /** Champ Ressources de la séance (mc-textarea). */
  readonly textareaRessourcesSeance: Locator;
  /** Champ Description de la séance (mc-textarea). */
  readonly textareaDescriptionSeance: Locator;
  /** Bouton ENREGISTRER dans le formulaire de séance. */
  readonly btnEnregistrerSeance: Locator;
  /** Bouton ANNULER dans le formulaire de séance. */
  readonly btnAnnulerSeance: Locator;

  // --- Popin d'avertissements d'absences ---
  /** Bouton FERMER de la popin d'avertissements d'absences récurrentes. */
  readonly btnWarningsFermer: Locator;

  constructor(page: Page) {
    super(page);

    this.btnMoisPrecedent = page.locator('#btnMoisPrecedent');
    this.btnMoisSuivant = page.locator('#btnMoisSuivant');

    this.btnMoins7Jours = page.locator('#btnMoins7Jours');
    this.btnMoins1Jour = page.locator('#btnMoins1Jour');
    this.btnPlus1Jour = page.locator('#btnPlus1Jour');
    this.btnPlus7Jours = page.locator('#btnPlus7Jours');

    this.btnInitialiserVide = page.locator('#btnInitialiserVide');
    this.btnInitialiserEdt = page.locator('#btnInitialiserEdt');
    this.btnInitialiserVidePrincipal = page.locator('#btnInitialiserVidePrincipal');
    this.btnDupliquerJournee = page.locator('#btnDupliquerJournee');
    this.btnImprimerCj = page.locator('#btnImprimerCj');
    this.btnSupprimerJournee = page.locator('#btnSupprimerJournee');

    this.inputDateDuplication = page.locator('#inputDateDuplication');
    this.btnConfirmerDuplication = page.locator('#btnConfirmerDuplication');
    this.btnAnnulerDuplication = page.locator('#btnAnnulerDuplication');

    this.btnMonterPremierSeance = page.locator('[id^="btnMonterSeance"]').first();
    this.btnDescendrePremierSeance = page.locator('[id^="btnDescendreSeance"]').first();
    this.btnModifierPremierSeance = page.locator('[id^="btnModifierSeance"]').first();
    this.btnDupliquerPremierSeance = page.locator('[id^="btnDupliquerSeance"]').first();
    this.btnSupprimerPremierSeance = page.locator('[id^="btnSupprimerSeance"]').first();

    this.btnAjouterSeance = page.locator('#btnAjouterSeance');

    this.champHeureDebutSeance = page.locator('[id*="HeureDebut"] input').first();
    this.champHeureFinSeance = page.locator('[id*="HeureFin"] input').first();
    this.selectTypeSeance = page.locator('#selectTypeSeance select');
    this.champTitreSeance = page.locator('[id*="Titre"] input').first();
    this.textareaObjectifsSeance = page.locator('#textareaObjectifsSeance textarea');
    this.textareaDeroulementSeance = page.locator('#textareaDeroulementSeance textarea');
    this.textareaRessourcesSeance = page.locator('#textareaRessourcesSeance textarea');
    this.textareaDescriptionSeance = page.locator('#textareaDescriptionSeance textarea');
    this.btnEnregistrerSeance = page.locator('#btnEnregistrerSeance');
    this.btnAnnulerSeance = page.locator('#btnAnnulerSeance');

    this.btnWarningsFermer = page.locator('#btnWarningsFermer');
  }
}
