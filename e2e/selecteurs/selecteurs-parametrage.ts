import { type Page, type Locator } from '@playwright/test';
import { SelecteursBase } from './selecteurs-base';

/**
 * Sélecteurs de l'écran Paramétrage.
 * L'écran comporte une colonne de navigation gauche (12 sections) et un panneau de contenu droit.
 *
 * Référentiels du jeu de données d'exemple :
 *   - Groupes           : A (index 0), B (index 1), C (index 2) — groupe A UTILISÉ
 *   - Statuts acquisition : A (0), EC (1), NA (2), NE (3) — 4 entrées
 *   - Statuts élève     : HE (0), DE (1), DC (2) — DC UTILISÉ
 *   - Types de contact  : P (0), M (1), S (2), F (3), A (4) — 5 entrées
 *   - Raisons absence   : I (0), O (1), PM (2), P (3), A (4) — 5 entrées
 *   - Fréquences absence: SP (0), SI (1), CS (2) — 3 entrées
 *   - Périodes          : 0 entrée (à créer → index 0)
 *   - Jours fériés      : 0 entrée (à créer → index 0)
 *   - Config EDT        : lundi–vendredi, 08:30–16:30
 *   - Domaines actifs   : 10 sous-domaines N2, domaine APS (index 0) inactif
 *
 * Règle de sélecteurs dynamiques : les champs mc-input avec [id]="..." dynamique
 * reçoivent l'id uniquement sur le <input> interne — donc #idChamp sans suffixe "input".
 * Les champs avec id="..." statique reçoivent l'id sur l'hôte ET l'interne → #idChamp input fonctionne.
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

  // --- Section : Enseignant & classe (id statiques → suffixe "input" correct) ---
  /** Champ Prénom de l'enseignant (mc-input, id statique). */
  readonly champPrenomEnseignant: Locator;
  /** Champ Nom de l'enseignant (mc-input, id statique). */
  readonly champNomEnseignant: Locator;
  /** Champ Année scolaire (mc-input, id statique). */
  readonly champAnneeEnseignant: Locator;
  /** Champ Niveau de classe (mc-input, id statique). */
  readonly champNiveauClasse: Locator;
  /** Bouton ENREGISTRER les informations enseignant & classe. */
  readonly btnEnregistrerEnseignantClasse: Locator;
  /** Bouton ANNULER les modifications enseignant & classe. */
  readonly btnAnnulerEnseignantClasse: Locator;

  // --- Section : Périodes scolaires (5 dans le jeu de données — la nouvelle créée = index 5) ---
  /** Bouton AJOUTER une nouvelle période. */
  readonly btnAjouterPeriode: Locator;
  /** Champ Nom de la première période existante (mc-input, [id] dynamique → pas de suffixe). */
  readonly champPeriodeNom0: Locator;
  /** Champ Nom de la sixième période (index 5 — après AJOUTER sur 5 existantes). */
  readonly champPeriodeNom5: Locator;
  /** Champ Date de début de la sixième période (mc-input type date, [id] dynamique). */
  readonly champPeriodeDebut5: Locator;
  /** Champ Date de fin de la sixième période (mc-input type date, [id] dynamique). */
  readonly champPeriodeFin5: Locator;
  /** Bouton ENREGISTRER la sixième période (index 5). */
  readonly btnEnregistrerPeriode5: Locator;
  /** Bouton SUPPRIMER la sixième période (premier état, index 5). */
  readonly btnSupprimerPeriode5: Locator;
  /** Bouton CONFIRMER la suppression de la sixième période (index 5). */
  readonly btnSupprimerPeriode5Confirmer: Locator;

  // --- Section : Semaine & horaires (id statiques sur mc-champ-heure) ---
  /** Champ Heure de début de journée (mc-champ-heure, id statique). */
  readonly champHeureDebutJournee: Locator;
  /** Champ Heure de fin de journée (mc-champ-heure, id statique). */
  readonly champHeureFinJournee: Locator;
  /** Chip "Lundi" dans la sélection des jours ouvrés ([id] dynamique → pas de suffixe). */
  readonly chipJourLundi: Locator;
  /** Chip "Mardi" dans la sélection des jours ouvrés ([id] dynamique → pas de suffixe). */
  readonly chipJourMardi: Locator;
  /** Chip "Mercredi" dans la sélection des jours ouvrés ([id] dynamique → pas de suffixe). */
  readonly chipJourMercredi: Locator;
  /** Chip "Jeudi" dans la sélection des jours ouvrés ([id] dynamique → pas de suffixe). */
  readonly chipJourJeudi: Locator;
  /** Chip "Vendredi" dans la sélection des jours ouvrés ([id] dynamique → pas de suffixe). */
  readonly chipJourVendredi: Locator;
  /** Bouton ENREGISTRER la configuration semaine & horaires. */
  readonly btnEnregistrerSemaineHoraires: Locator;
  /** Bouton ANNULER les modifications semaine & horaires. */
  readonly btnAnnulerSemaineHoraires: Locator;

  // --- Section : Groupes (3 dans le jeu de données : A (0), B (1), C (2)) ---
  /** Bouton AJOUTER un nouveau groupe. */
  readonly btnAjouterGroupe: Locator;
  /** Champ Libellé du premier groupe (mc-input, [id] dynamique → pas de suffixe). */
  readonly champGroupeLibelle0: Locator;
  /** Bouton ENREGISTRER le premier groupe (index 0). */
  readonly btnEnregistrerGroupe0: Locator;
  /** Bouton SUPPRIMER le premier groupe (premier état, index 0). */
  readonly btnSupprimerGroupe0: Locator;
  /** Bouton CONFIRMER la suppression du premier groupe (index 0). */
  readonly btnSupprimerGroupe0Confirmer: Locator;
  /** Champ Libellé du quatrième groupe (index 3 — après AJOUTER sur 3 existants). */
  readonly champGroupeLibelle3: Locator;
  /** Bouton ENREGISTRER le quatrième groupe (index 3). */
  readonly btnEnregistrerGroupe3: Locator;
  /** Bouton SUPPRIMER le quatrième groupe (premier état, index 3). */
  readonly btnSupprimerGroupe3: Locator;
  /** Bouton CONFIRMER la suppression du quatrième groupe (index 3). */
  readonly btnSupprimerGroupe3Confirmer: Locator;

  // --- Section : Barème d'acquisition (4 dans le jeu de données — index 0 à 3) ---
  /** Bouton AJOUTER un nouveau statut d'acquisition. */
  readonly btnAjouterStatut: Locator;
  /** Champ Identifiant du premier statut ([id] dynamique). */
  readonly champStatutId0: Locator;
  /** Champ Glyphe du premier statut ([id] dynamique). */
  readonly champStatutGlyphe0: Locator;
  /** Champ Libellé du premier statut ([id] dynamique). */
  readonly champStatutLibelle0: Locator;
  /** Champ Couleur du premier statut ([id] dynamique). */
  readonly champStatutCouleur0: Locator;
  /** Champ Fond du premier statut ([id] dynamique). */
  readonly champStatutFond0: Locator;
  /** Bouton ENREGISTRER le premier statut d'acquisition (index 0). */
  readonly btnEnregistrerStatut0: Locator;
  /** Bouton SUPPRIMER le premier statut d'acquisition (premier état, index 0). */
  readonly btnSupprimerStatut0: Locator;
  /** Bouton CONFIRMER la suppression du premier statut (index 0). */
  readonly btnSupprimerStatut0Confirmer: Locator;
  /** Champ Identifiant du cinquième statut (index 4 — après AJOUTER sur 4 existants). */
  readonly champStatutId4: Locator;
  /** Champ Glyphe du cinquième statut (index 4). */
  readonly champStatutGlyphe4: Locator;
  /** Champ Libellé du cinquième statut (index 4). */
  readonly champStatutLibelle4: Locator;
  /** Bouton ENREGISTRER le cinquième statut (index 4). */
  readonly btnEnregistrerStatut4: Locator;
  /** Bouton SUPPRIMER le cinquième statut (index 4). */
  readonly btnSupprimerStatut4: Locator;
  /** Bouton CONFIRMER la suppression du cinquième statut (index 4). */
  readonly btnSupprimerStatut4Confirmer: Locator;

  // --- Section : Statuts élève (3 dans le jeu de données — index 0 à 2) ---
  /** Bouton AJOUTER un nouveau statut élève. */
  readonly btnAjouterStatutEleve: Locator;
  /** Champ Identifiant du premier statut élève ([id] dynamique). */
  readonly champStatutEleveId0: Locator;
  /** Champ Libellé du premier statut élève ([id] dynamique). */
  readonly champStatutEleveLibelle0: Locator;
  /** Bouton ENREGISTRER le premier statut élève (index 0). */
  readonly btnEnregistrerStatutEleve0: Locator;
  /** Bouton SUPPRIMER le premier statut élève (premier état, index 0). */
  readonly btnSupprimerStatutEleve0: Locator;
  /** Bouton CONFIRMER la suppression du premier statut élève (index 0). */
  readonly btnSupprimerStatutEleve0Confirmer: Locator;
  /** Champ Identifiant du quatrième statut élève (index 3 — après AJOUTER sur 3 existants). */
  readonly champStatutEleveId3: Locator;
  /** Champ Libellé du quatrième statut élève (index 3). */
  readonly champStatutEleveLibelle3: Locator;
  /** Bouton ENREGISTRER le quatrième statut élève (index 3). */
  readonly btnEnregistrerStatutEleve3: Locator;
  /** Bouton SUPPRIMER le quatrième statut élève (index 3). */
  readonly btnSupprimerStatutEleve3: Locator;
  /** Bouton CONFIRMER la suppression du quatrième statut élève (index 3). */
  readonly btnSupprimerStatutEleve3Confirmer: Locator;

  // --- Section : Types de contact (5 dans le jeu de données — index 0 à 4) ---
  /** Bouton AJOUTER un nouveau type de contact. */
  readonly btnAjouterTypeContact: Locator;
  /** Champ Identifiant du premier type de contact ([id] dynamique). */
  readonly champTypeContactId0: Locator;
  /** Champ Libellé du premier type de contact ([id] dynamique). */
  readonly champTypeContactLibelle0: Locator;
  /** Bouton ENREGISTRER le premier type de contact (index 0). */
  readonly btnEnregistrerTypeContact0: Locator;
  /** Bouton SUPPRIMER le premier type de contact (premier état, index 0). */
  readonly btnSupprimerTypeContact0: Locator;
  /** Bouton CONFIRMER la suppression du premier type de contact (index 0). */
  readonly btnSupprimerTypeContact0Confirmer: Locator;
  /** Champ Identifiant du sixième type de contact (index 5 — après AJOUTER sur 5 existants). */
  readonly champTypeContactId5: Locator;
  /** Champ Libellé du sixième type de contact (index 5). */
  readonly champTypeContactLibelle5: Locator;
  /** Bouton ENREGISTRER le sixième type de contact (index 5). */
  readonly btnEnregistrerTypeContact5: Locator;

  // --- Section : Raisons d'absence (5 dans le jeu de données — index 0 à 4) ---
  /** Bouton AJOUTER une nouvelle raison d'absence. */
  readonly btnAjouterRaison: Locator;
  /** Champ Libellé de la première raison d'absence ([id] dynamique). */
  readonly champRaisonLibelle0: Locator;
  /** Bouton ENREGISTRER la première raison d'absence (index 0). */
  readonly btnEnregistrerRaison0: Locator;
  /** Bouton SUPPRIMER la première raison d'absence (premier état, index 0). */
  readonly btnSupprimerRaison0: Locator;
  /** Bouton CONFIRMER la suppression de la première raison (index 0). */
  readonly btnSupprimerRaison0Confirmer: Locator;
  /** Champ Libellé de la sixième raison d'absence (index 5 — après AJOUTER sur 5 existants). */
  readonly champRaisonLibelle5: Locator;
  /** Bouton ENREGISTRER la sixième raison d'absence (index 5). */
  readonly btnEnregistrerRaison5: Locator;

  // --- Section : Fréquences d'absence (3 dans le jeu de données — index 0 à 2) ---
  /** Bouton AJOUTER une nouvelle fréquence d'absence. */
  readonly btnAjouterFrequence: Locator;
  /** Champ Libellé de la première fréquence d'absence ([id] dynamique). */
  readonly champFrequenceLibelle0: Locator;
  /** Bouton ENREGISTRER la première fréquence d'absence (index 0). */
  readonly btnEnregistrerFrequence0: Locator;
  /** Bouton SUPPRIMER la première fréquence d'absence (premier état, index 0). */
  readonly btnSupprimerFrequence0: Locator;
  /** Bouton CONFIRMER la suppression de la première fréquence (index 0). */
  readonly btnSupprimerFrequence0Confirmer: Locator;
  /** Champ Libellé de la quatrième fréquence (index 3 — après AJOUTER sur 3 existants). */
  readonly champFrequenceLibelle3: Locator;
  /** Bouton ENREGISTRER la quatrième fréquence (index 3). */
  readonly btnEnregistrerFrequence3: Locator;

  // --- Section : Jours fériés (0 dans le jeu de données — le premier créé = index 0) ---
  /** Bouton AJOUTER un nouveau jour férié. */
  readonly btnAjouterJourFerie: Locator;
  /** Champ Nom du premier jour férié ([id] dynamique → pas de suffixe). */
  readonly champJourFerieNom0: Locator;
  /** Champ Date du premier jour férié ([id] dynamique → pas de suffixe). */
  readonly champJourFerieDate0: Locator;
  /** Bouton ENREGISTRER le premier jour férié (index 0). */
  readonly btnEnregistrerJourFerie0: Locator;
  /** Bouton SUPPRIMER le premier jour férié (premier état, index 0). */
  readonly btnSupprimerJourFerie0: Locator;
  /** Bouton CONFIRMER la suppression du premier jour férié (index 0). */
  readonly btnSupprimerJourFerie0Confirmer: Locator;

  // --- Section : Préférences (id statique sur mc-input) ---
  /** Champ Délai de sauvegarde automatique en minutes (mc-input, id statique). */
  readonly champDelaiSauvegarde: Locator;
  /** Bouton ENREGISTRER les préférences. */
  readonly btnEnregistrerPreferences: Locator;
  /** Bouton ANNULER les modifications de préférences. */
  readonly btnAnnulerPreferences: Locator;

  // --- Section : Domaines de compétences (18 domaines, APS = index 0, actuellement inactif) ---
  /** Case à cocher du premier domaine de compétences (APS, index 0, [id] dynamique sur <input> natif). */
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

    // id statiques → suffixe "input" correct
    this.champPrenomEnseignant = page.locator('#champPrenomEnseignant-input');
    this.champNomEnseignant = page.locator('#champNomEnseignant-input');
    this.champAnneeEnseignant = page.locator('#champAnneeEnseignant-input');
    this.champNiveauClasse = page.locator('#champNiveauClasse-input');
    this.btnEnregistrerEnseignantClasse = page.locator('#btnEnregistrerEnseignantClasse');
    this.btnAnnulerEnseignantClasse = page.locator('#btnAnnulerEnseignantClasse');

    // [id] dynamiques → l'id est sur le <input> interne uniquement → pas de suffixe
    this.btnAjouterPeriode = page.locator('#btnAjouterPeriode');
    this.champPeriodeNom0 = page.locator('#champPeriodeNom0-input');
    this.champPeriodeNom5 = page.locator('#champPeriodeNom5-input');
    this.champPeriodeDebut5 = page.locator('#champPeriodeDebut5-input');
    this.champPeriodeFin5 = page.locator('#champPeriodeFin5-input');
    this.btnEnregistrerPeriode5 = page.locator('#btnEnregistrerPeriode5');
    this.btnSupprimerPeriode5 = page.locator('#btnSupprimerPeriode5');
    this.btnSupprimerPeriode5Confirmer = page.locator('#btnSupprimerPeriode5_confirmer');

    // id statiques sur mc-champ-heure → suffixe "input" correct
    this.champHeureDebutJournee = page.locator('#champHeureDebutJournee input');
    this.champHeureFinJournee = page.locator('#champHeureFinJournee input');
    // [id] dynamiques sur mc-chip-filtre → l'id est sur le <button> interne
    this.chipJourLundi = page.locator('#chipJourlundi');
    this.chipJourMardi = page.locator('#chipJourmardi');
    this.chipJourMercredi = page.locator('#chipJourmercredi');
    this.chipJourJeudi = page.locator('#chipJourjeudi');
    this.chipJourVendredi = page.locator('#chipJourvendredi');
    this.btnEnregistrerSemaineHoraires = page.locator('#btnEnregistrerSemaineHoraires');
    this.btnAnnulerSemaineHoraires = page.locator('#btnAnnulerSemaineHoraires');

    this.btnAjouterGroupe = page.locator('#btnAjouterGroupe');
    this.champGroupeLibelle0 = page.locator('#champGroupeLibelle0');
    this.btnEnregistrerGroupe0 = page.locator('#btnEnregistrerGroupe0');
    this.btnSupprimerGroupe0 = page.locator('#btnSupprimerGroupe0');
    this.btnSupprimerGroupe0Confirmer = page.locator('#btnSupprimerGroupe0_confirmer');
    this.champGroupeLibelle3 = page.locator('#champGroupeLibelle3-input');
    this.btnEnregistrerGroupe3 = page.locator('#btnEnregistrerGroupe3');
    this.btnSupprimerGroupe3 = page.locator('#btnSupprimerGroupe3');
    this.btnSupprimerGroupe3Confirmer = page.locator('#btnSupprimerGroupe3_confirmer');

    this.btnAjouterStatut = page.locator('#btnAjouterStatut');
    this.champStatutId0 = page.locator('#champStatutId0');
    this.champStatutGlyphe0 = page.locator('#champStatutGlyphe0');
    this.champStatutLibelle0 = page.locator('#champStatutLibelle0');
    this.champStatutCouleur0 = page.locator('#champStatutCouleur0');
    this.champStatutFond0 = page.locator('#champStatutFond0');
    this.btnEnregistrerStatut0 = page.locator('#btnEnregistrerStatut0');
    this.btnSupprimerStatut0 = page.locator('#btnSupprimerStatut0');
    this.btnSupprimerStatut0Confirmer = page.locator('#btnSupprimerStatut0_confirmer');
    this.champStatutId4 = page.locator('#champStatutId4-input');
    this.champStatutGlyphe4 = page.locator('#champStatutGlyphe4-input');
    this.champStatutLibelle4 = page.locator('#champStatutLibelle4-input');
    this.btnEnregistrerStatut4 = page.locator('#btnEnregistrerStatut4');
    this.btnSupprimerStatut4 = page.locator('#btnSupprimerStatut4');
    this.btnSupprimerStatut4Confirmer = page.locator('#btnSupprimerStatut4_confirmer');

    this.btnAjouterStatutEleve = page.locator('#btnAjouterStatutEleve');
    this.champStatutEleveId0 = page.locator('#champStatutEleveId0');
    this.champStatutEleveLibelle0 = page.locator('#champStatutEleveLibelle0');
    this.btnEnregistrerStatutEleve0 = page.locator('#btnEnregistrerStatutEleve0');
    this.btnSupprimerStatutEleve0 = page.locator('#btnSupprimerStatutEleve0');
    this.btnSupprimerStatutEleve0Confirmer = page.locator('#btnSupprimerStatutEleve0_confirmer');
    this.champStatutEleveId3 = page.locator('#champStatutEleveId3-input');
    this.champStatutEleveLibelle3 = page.locator('#champStatutEleveLibelle3-input');
    this.btnEnregistrerStatutEleve3 = page.locator('#btnEnregistrerStatutEleve3');
    this.btnSupprimerStatutEleve3 = page.locator('#btnSupprimerStatutEleve3');
    this.btnSupprimerStatutEleve3Confirmer = page.locator('#btnSupprimerStatutEleve3_confirmer');

    this.btnAjouterTypeContact = page.locator('#btnAjouterTypeContact');
    this.champTypeContactId0 = page.locator('#champTypeContactId0-input');
    this.champTypeContactLibelle0 = page.locator('#champTypeContactLibelle0-input');
    this.btnEnregistrerTypeContact0 = page.locator('#btnEnregistrerTypeContact0');
    this.btnSupprimerTypeContact0 = page.locator('#btnSupprimerTypeContact0');
    this.btnSupprimerTypeContact0Confirmer = page.locator('#btnSupprimerTypeContact0_confirmer');
    this.champTypeContactId5 = page.locator('#champTypeContactId5-input');
    this.champTypeContactLibelle5 = page.locator('#champTypeContactLibelle5-input');
    this.btnEnregistrerTypeContact5 = page.locator('#btnEnregistrerTypeContact5');

    this.btnAjouterRaison = page.locator('#btnAjouterRaison');
    this.champRaisonLibelle0 = page.locator('#champRaisonLibelle0-input');
    this.btnEnregistrerRaison0 = page.locator('#btnEnregistrerRaison0');
    this.btnSupprimerRaison0 = page.locator('#btnSupprimerRaison0');
    this.btnSupprimerRaison0Confirmer = page.locator('#btnSupprimerRaison0_confirmer');
    this.champRaisonLibelle5 = page.locator('#champRaisonLibelle5-input');
    this.btnEnregistrerRaison5 = page.locator('#btnEnregistrerRaison5');

    this.btnAjouterFrequence = page.locator('#btnAjouterFrequence');
    this.champFrequenceLibelle0 = page.locator('#champFrequenceLibelle0-input');
    this.btnEnregistrerFrequence0 = page.locator('#btnEnregistrerFrequence0');
    this.btnSupprimerFrequence0 = page.locator('#btnSupprimerFrequence0');
    this.btnSupprimerFrequence0Confirmer = page.locator('#btnSupprimerFrequence0_confirmer');
    this.champFrequenceLibelle3 = page.locator('#champFrequenceLibelle3-input');
    this.btnEnregistrerFrequence3 = page.locator('#btnEnregistrerFrequence3');

    this.btnAjouterJourFerie = page.locator('#btnAjouterJourFerie');
    this.champJourFerieNom0 = page.locator('#champJourFerieNom0-input');
    this.champJourFerieDate0 = page.locator('#champJourFerieDate0-input');
    this.btnEnregistrerJourFerie0 = page.locator('#btnEnregistrerJourFerie0');
    this.btnSupprimerJourFerie0 = page.locator('#btnSupprimerJourFerie0');
    this.btnSupprimerJourFerie0Confirmer = page.locator('#btnSupprimerJourFerie0_confirmer');

    // id statique sur mc-input → suffixe "input" correct
    this.champDelaiSauvegarde = page.locator('#champDelaiSauvegarde input');
    this.btnEnregistrerPreferences = page.locator('#btnEnregistrerPreferences');
    this.btnAnnulerPreferences = page.locator('#btnAnnulerPreferences');

    // [id] dynamique sur <input> natif → #id sélectionne directement le checkbox
    this.checkDomaine0 = page.locator('#checkDomaine0');
    this.btnEnregistrerDomaines = page.locator('#btnEnregistrerDomaines');
    this.btnAnnulerDomaines = page.locator('#btnAnnulerDomaines');
  }
}
