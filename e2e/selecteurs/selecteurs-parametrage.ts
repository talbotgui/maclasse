import { type Page, type Locator } from '@playwright/test';
import { SelecteursBase } from './selecteurs-base';

/**
 * Sélecteurs de l'écran Paramétrage.
 * L'écran comporte une colonne de navigation gauche (12 sections) et un panneau de contenu droit.
 *
 * Référentiels du jeu de données d'exemple :
 *   - Groupes           : A, B, C
 *   - Statuts acquisition : A (Acquis), EC (En cours), NA (Non acquis), NE (Non évalué)
 *   - Statuts élève     : HE (Hors effectif), DE (Démissionné), DC (Dans la classe)
 *   - Types de contact  : P (Père), M (Mère), S (Sœur/Frère), F (Famille), A (Autre)
 *   - Raisons absence   : I (Injustifiée), O (Orthophonie), PM (Piscine/Musée), P (Présent), A (Autre)
 *   - Fréquences absence: SP (Semaine paire), SI (Semaine impaire), CS (Chaque semaine)
 *   - Périodes          : 5 entrées (pp000001-... à pp000005-...)
 *   - Jours fériés      : plusieurs entrées (Toussaint, Armistice, Noël, …)
 */
export class SelecteursParametrage extends SelecteursBase {

  // --- Navigation par section (colonne gauche) ---
  /** Bouton de navigation vers la section "Enseignant & classe". */
  readonly btnSectionEnseignantClasse: Locator;
  /** Bouton de navigation vers la section "Périodes". */
  readonly btnSectionPeriodes: Locator;
  /** Bouton de navigation vers la section "Semaine & horaires". */
  readonly btnSectionSemaineHoraires: Locator;
  /** Bouton de navigation vers la section "Groupes". */
  readonly btnSectionGroupes: Locator;
  /** Bouton de navigation vers la section "Barème d'acquisition". */
  readonly btnSectionBareme: Locator;
  /** Bouton de navigation vers la section "Statuts élève". */
  readonly btnSectionStatutsEleve: Locator;
  /** Bouton de navigation vers la section "Types de contact". */
  readonly btnSectionTypesContact: Locator;
  /** Bouton de navigation vers la section "Raisons d'absence". */
  readonly btnSectionRaisonsAbsence: Locator;
  /** Bouton de navigation vers la section "Fréquences d'absence". */
  readonly btnSectionFrequencesAbsence: Locator;
  /** Bouton de navigation vers la section "Jours fériés". */
  readonly btnSectionJoursFeries: Locator;
  /** Bouton de navigation vers la section "Préférences". */
  readonly btnSectionPreferences: Locator;
  /** Bouton de navigation vers la section "Domaines de compétences". */
  readonly btnSectionDomainesCompetences: Locator;

  // --- Section : Enseignant & classe ---
  /** Champ Prénom de l'enseignant (mc-input). */
  readonly champPrenomEnseignant: Locator;
  /** Champ Nom de l'enseignant (mc-input). */
  readonly champNomEnseignant: Locator;
  /** Champ Année scolaire (mc-input). */
  readonly champAnneeEnseignant: Locator;
  /** Champ Niveau de classe (mc-input). */
  readonly champNiveauClasse: Locator;
  /** Bouton ENREGISTRER les informations enseignant & classe. */
  readonly btnEnregistrerEnseignantClasse: Locator;
  /** Bouton ANNULER les modifications enseignant & classe. */
  readonly btnAnnulerEnseignantClasse: Locator;

  // --- Section : Périodes (5 dans le jeu de données — index 0 à 4) ---
  /** Bouton AJOUTER une nouvelle période. */
  readonly btnAjouterPeriode: Locator;
  /** Champ Nom de la première période (mc-input, index 0). */
  readonly champPeriodeNom0: Locator;
  /** Champ Date de début de la première période (mc-input type date, index 0). */
  readonly champPeriodeDebut0: Locator;
  /** Champ Date de fin de la première période (mc-input type date, index 0). */
  readonly champPeriodeFin0: Locator;
  /** Bouton ENREGISTRER la première période (index 0). */
  readonly btnEnregistrerPeriode0: Locator;
  /** Bouton SUPPRIMER la première période (premier état, index 0). */
  readonly btnSupprimerPeriode0: Locator;
  /** Bouton CONFIRMER la suppression de la première période (index 0). */
  readonly btnSupprimerPeriode0Confirmer: Locator;

  // --- Section : Semaine & horaires ---
  /** Champ Heure de début de journée (mc-champ-heure). */
  readonly champHeureDebutJournee: Locator;
  /** Champ Heure de fin de journée (mc-champ-heure). */
  readonly champHeureFinJournee: Locator;
  /** Chip "Lundi" dans la sélection des jours ouvrés. */
  readonly chipJourLundi: Locator;
  /** Chip "Mardi" dans la sélection des jours ouvrés. */
  readonly chipJourMardi: Locator;
  /** Chip "Mercredi" dans la sélection des jours ouvrés. */
  readonly chipJourMercredi: Locator;
  /** Chip "Jeudi" dans la sélection des jours ouvrés. */
  readonly chipJourJeudi: Locator;
  /** Chip "Vendredi" dans la sélection des jours ouvrés. */
  readonly chipJourVendredi: Locator;
  /** Bouton ENREGISTRER la configuration semaine & horaires. */
  readonly btnEnregistrerSemaineHoraires: Locator;
  /** Bouton ANNULER les modifications semaine & horaires. */
  readonly btnAnnulerSemaineHoraires: Locator;

  // --- Section : Groupes (3 dans le jeu de données : A, B, C — index 0, 1, 2) ---
  /** Bouton AJOUTER un nouveau groupe. */
  readonly btnAjouterGroupe: Locator;
  /** Champ Libellé du premier groupe (mc-input, index 0). */
  readonly champGroupeLibelle0: Locator;
  /** Bouton ENREGISTRER le premier groupe (index 0). */
  readonly btnEnregistrerGroupe0: Locator;
  /** Bouton SUPPRIMER le premier groupe (premier état, index 0). */
  readonly btnSupprimerGroupe0: Locator;
  /** Bouton CONFIRMER la suppression du premier groupe (index 0). */
  readonly btnSupprimerGroupe0Confirmer: Locator;

  // --- Section : Barème d'acquisition (4 dans le jeu de données — index 0 à 3) ---
  /** Bouton AJOUTER un nouveau statut d'acquisition. */
  readonly btnAjouterStatut: Locator;
  /** Champ Identifiant du premier statut (mc-input, index 0). */
  readonly champStatutId0: Locator;
  /** Champ Glyphe du premier statut (mc-input, index 0). */
  readonly champStatutGlyphe0: Locator;
  /** Champ Libellé du premier statut (mc-input, index 0). */
  readonly champStatutLibelle0: Locator;
  /** Champ Couleur du premier statut (mc-input type color, index 0). */
  readonly champStatutCouleur0: Locator;
  /** Champ Fond du premier statut (mc-input type color, index 0). */
  readonly champStatutFond0: Locator;
  /** Bouton ENREGISTRER le premier statut d'acquisition (index 0). */
  readonly btnEnregistrerStatut0: Locator;
  /** Bouton SUPPRIMER le premier statut d'acquisition (premier état, index 0). */
  readonly btnSupprimerStatut0: Locator;
  /** Bouton CONFIRMER la suppression du premier statut (index 0). */
  readonly btnSupprimerStatut0Confirmer: Locator;

  // --- Section : Statuts élève (3 dans le jeu de données — index 0 à 2) ---
  /** Bouton AJOUTER un nouveau statut élève. */
  readonly btnAjouterStatutEleve: Locator;
  /** Champ Identifiant du premier statut élève (mc-input, index 0). */
  readonly champStatutEleveId0: Locator;
  /** Champ Libellé du premier statut élève (mc-input, index 0). */
  readonly champStatutEleveLibelle0: Locator;
  /** Bouton ENREGISTRER le premier statut élève (index 0). */
  readonly btnEnregistrerStatutEleve0: Locator;
  /** Bouton SUPPRIMER le premier statut élève (premier état, index 0). */
  readonly btnSupprimerStatutEleve0: Locator;
  /** Bouton CONFIRMER la suppression du premier statut élève (index 0). */
  readonly btnSupprimerStatutEleve0Confirmer: Locator;

  // --- Section : Types de contact (5 dans le jeu de données — index 0 à 4) ---
  /** Bouton AJOUTER un nouveau type de contact. */
  readonly btnAjouterTypeContact: Locator;
  /** Champ Identifiant du premier type de contact (mc-input, index 0). */
  readonly champTypeContactId0: Locator;
  /** Champ Libellé du premier type de contact (mc-input, index 0). */
  readonly champTypeContactLibelle0: Locator;
  /** Bouton ENREGISTRER le premier type de contact (index 0). */
  readonly btnEnregistrerTypeContact0: Locator;
  /** Bouton SUPPRIMER le premier type de contact (premier état, index 0). */
  readonly btnSupprimerTypeContact0: Locator;
  /** Bouton CONFIRMER la suppression du premier type de contact (index 0). */
  readonly btnSupprimerTypeContact0Confirmer: Locator;

  // --- Section : Raisons d'absence (5 dans le jeu de données — index 0 à 4) ---
  /** Bouton AJOUTER une nouvelle raison d'absence. */
  readonly btnAjouterRaison: Locator;
  /** Champ Libellé de la première raison d'absence (mc-input, index 0). */
  readonly champRaisonLibelle0: Locator;
  /** Bouton ENREGISTRER la première raison d'absence (index 0). */
  readonly btnEnregistrerRaison0: Locator;
  /** Bouton SUPPRIMER la première raison d'absence (premier état, index 0). */
  readonly btnSupprimerRaison0: Locator;
  /** Bouton CONFIRMER la suppression de la première raison (index 0). */
  readonly btnSupprimerRaison0Confirmer: Locator;

  // --- Section : Fréquences d'absence (3 dans le jeu de données — index 0 à 2) ---
  /** Bouton AJOUTER une nouvelle fréquence d'absence. */
  readonly btnAjouterFrequence: Locator;
  /** Champ Libellé de la première fréquence d'absence (mc-input, index 0). */
  readonly champFrequenceLibelle0: Locator;
  /** Bouton ENREGISTRER la première fréquence d'absence (index 0). */
  readonly btnEnregistrerFrequence0: Locator;
  /** Bouton SUPPRIMER la première fréquence d'absence (premier état, index 0). */
  readonly btnSupprimerFrequence0: Locator;
  /** Bouton CONFIRMER la suppression de la première fréquence (index 0). */
  readonly btnSupprimerFrequence0Confirmer: Locator;

  // --- Section : Jours fériés ---
  /** Bouton AJOUTER un nouveau jour férié. */
  readonly btnAjouterJourFerie: Locator;
  /** Champ Nom du premier jour férié (mc-input, index 0). */
  readonly champJourFerieNom0: Locator;
  /** Champ Date du premier jour férié (mc-input type date, index 0). */
  readonly champJourFerieDate0: Locator;
  /** Bouton ENREGISTRER le premier jour férié (index 0). */
  readonly btnEnregistrerJourFerie0: Locator;
  /** Bouton SUPPRIMER le premier jour férié (premier état, index 0). */
  readonly btnSupprimerJourFerie0: Locator;
  /** Bouton CONFIRMER la suppression du premier jour férié (index 0). */
  readonly btnSupprimerJourFerie0Confirmer: Locator;

  // --- Section : Préférences ---
  /** Champ Délai de sauvegarde automatique en minutes (mc-input type number). */
  readonly champDelaiSauvegarde: Locator;
  /** Bouton ENREGISTRER les préférences. */
  readonly btnEnregistrerPreferences: Locator;
  /** Bouton ANNULER les modifications de préférences. */
  readonly btnAnnulerPreferences: Locator;

  // --- Section : Domaines de compétences ---
  /** Case à cocher du premier domaine de compétences (index 0). */
  readonly checkDomaine0: Locator;
  /** Bouton ENREGISTRER les domaines de compétences. */
  readonly btnEnregistrerDomaines: Locator;
  /** Bouton ANNULER les modifications des domaines. */
  readonly btnAnnulerDomaines: Locator;

  constructor(page: Page) {
    super(page);

    this.btnSectionEnseignantClasse = page.locator('#btnSectionenseignantClasse');
    this.btnSectionPeriodes = page.locator('#btnSectionperiodes');
    this.btnSectionSemaineHoraires = page.locator('#btnSectionsemaineHoraires');
    this.btnSectionGroupes = page.locator('#btnSectiongroupes');
    this.btnSectionBareme = page.locator('#btnSectionbareme');
    this.btnSectionStatutsEleve = page.locator('#btnSectionstatutsEleve');
    this.btnSectionTypesContact = page.locator('#btnSectiontypesContact');
    this.btnSectionRaisonsAbsence = page.locator('#btnSectionraisonsAbsence');
    this.btnSectionFrequencesAbsence = page.locator('#btnSectionfrequencesAbsence');
    this.btnSectionJoursFeries = page.locator('#btnSectionjoursFeries');
    this.btnSectionPreferences = page.locator('#btnSectionpreferences');
    this.btnSectionDomainesCompetences = page.locator('#btnSectiondomainesCompetences');

    this.champPrenomEnseignant = page.locator('#champPrenomEnseignant input');
    this.champNomEnseignant = page.locator('#champNomEnseignant input');
    this.champAnneeEnseignant = page.locator('#champAnneeEnseignant input');
    this.champNiveauClasse = page.locator('#champNiveauClasse input');
    this.btnEnregistrerEnseignantClasse = page.locator('#btnEnregistrerEnseignantClasse');
    this.btnAnnulerEnseignantClasse = page.locator('#btnAnnulerEnseignantClasse');

    this.btnAjouterPeriode = page.locator('#btnAjouterPeriode');
    this.champPeriodeNom0 = page.locator('#champPeriodeNom0 input');
    this.champPeriodeDebut0 = page.locator('#champPeriodeDebut0 input');
    this.champPeriodeFin0 = page.locator('#champPeriodeFin0 input');
    this.btnEnregistrerPeriode0 = page.locator('#btnEnregistrerPeriode0');
    this.btnSupprimerPeriode0 = page.locator('#btnSupprimerPeriode0');
    this.btnSupprimerPeriode0Confirmer = page.locator('#btnSupprimerPeriode0_confirmer');

    this.champHeureDebutJournee = page.locator('#champHeureDebutJournee input');
    this.champHeureFinJournee = page.locator('#champHeureFinJournee input');
    this.chipJourLundi = page.locator('#chipJourlundi');
    this.chipJourMardi = page.locator('#chipJourmardi');
    this.chipJourMercredi = page.locator('#chipJourmercredi');
    this.chipJourJeudi = page.locator('#chipJourjeudi');
    this.chipJourVendredi = page.locator('#chipJourvendredi');
    this.btnEnregistrerSemaineHoraires = page.locator('#btnEnregistrerSemaineHoraires');
    this.btnAnnulerSemaineHoraires = page.locator('#btnAnnulerSemaineHoraires');

    this.btnAjouterGroupe = page.locator('#btnAjouterGroupe');
    this.champGroupeLibelle0 = page.locator('#champGroupeLibelle0 input');
    this.btnEnregistrerGroupe0 = page.locator('#btnEnregistrerGroupe0');
    this.btnSupprimerGroupe0 = page.locator('#btnSupprimerGroupe0');
    this.btnSupprimerGroupe0Confirmer = page.locator('#btnSupprimerGroupe0_confirmer');

    this.btnAjouterStatut = page.locator('#btnAjouterStatut');
    this.champStatutId0 = page.locator('#champStatutId0 input');
    this.champStatutGlyphe0 = page.locator('#champStatutGlyphe0 input');
    this.champStatutLibelle0 = page.locator('#champStatutLibelle0 input');
    this.champStatutCouleur0 = page.locator('#champStatutCouleur0 input');
    this.champStatutFond0 = page.locator('#champStatutFond0 input');
    this.btnEnregistrerStatut0 = page.locator('#btnEnregistrerStatut0');
    this.btnSupprimerStatut0 = page.locator('#btnSupprimerStatut0');
    this.btnSupprimerStatut0Confirmer = page.locator('#btnSupprimerStatut0_confirmer');

    this.btnAjouterStatutEleve = page.locator('#btnAjouterStatutEleve');
    this.champStatutEleveId0 = page.locator('#champStatutEleveId0 input');
    this.champStatutEleveLibelle0 = page.locator('#champStatutEleveLibelle0 input');
    this.btnEnregistrerStatutEleve0 = page.locator('#btnEnregistrerStatutEleve0');
    this.btnSupprimerStatutEleve0 = page.locator('#btnSupprimerStatutEleve0');
    this.btnSupprimerStatutEleve0Confirmer = page.locator('#btnSupprimerStatutEleve0_confirmer');

    this.btnAjouterTypeContact = page.locator('#btnAjouterTypeContact');
    this.champTypeContactId0 = page.locator('#champTypeContactId0 input');
    this.champTypeContactLibelle0 = page.locator('#champTypeContactLibelle0 input');
    this.btnEnregistrerTypeContact0 = page.locator('#btnEnregistrerTypeContact0');
    this.btnSupprimerTypeContact0 = page.locator('#btnSupprimerTypeContact0');
    this.btnSupprimerTypeContact0Confirmer = page.locator('#btnSupprimerTypeContact0_confirmer');

    this.btnAjouterRaison = page.locator('#btnAjouterRaison');
    this.champRaisonLibelle0 = page.locator('#champRaisonLibelle0 input');
    this.btnEnregistrerRaison0 = page.locator('#btnEnregistrerRaison0');
    this.btnSupprimerRaison0 = page.locator('#btnSupprimerRaison0');
    this.btnSupprimerRaison0Confirmer = page.locator('#btnSupprimerRaison0_confirmer');

    this.btnAjouterFrequence = page.locator('#btnAjouterFrequence');
    this.champFrequenceLibelle0 = page.locator('#champFrequenceLibelle0 input');
    this.btnEnregistrerFrequence0 = page.locator('#btnEnregistrerFrequence0');
    this.btnSupprimerFrequence0 = page.locator('#btnSupprimerFrequence0');
    this.btnSupprimerFrequence0Confirmer = page.locator('#btnSupprimerFrequence0_confirmer');

    this.btnAjouterJourFerie = page.locator('#btnAjouterJourFerie');
    this.champJourFerieNom0 = page.locator('#champJourFerieNom0 input');
    this.champJourFerieDate0 = page.locator('#champJourFerieDate0 input');
    this.btnEnregistrerJourFerie0 = page.locator('#btnEnregistrerJourFerie0');
    this.btnSupprimerJourFerie0 = page.locator('#btnSupprimerJourFerie0');
    this.btnSupprimerJourFerie0Confirmer = page.locator('#btnSupprimerJourFerie0_confirmer');

    this.champDelaiSauvegarde = page.locator('#champDelaiSauvegarde input');
    this.btnEnregistrerPreferences = page.locator('#btnEnregistrerPreferences');
    this.btnAnnulerPreferences = page.locator('#btnAnnulerPreferences');

    this.checkDomaine0 = page.locator('#checkDomaine0');
    this.btnEnregistrerDomaines = page.locator('#btnEnregistrerDomaines');
    this.btnAnnulerDomaines = page.locator('#btnAnnulerDomaines');
  }
}
