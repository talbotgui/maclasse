/**
 * Modèles partagés pour les composants de formulaire génériques et les composants riches.
 */


/**
 * Option d'un sélecteur ou d'un groupe de boutons radio.
 * Utilisée par `mc-select`, `mc-radio-group` et les popins de sélection.
 */
export interface OptionFormulaire {
  /** Valeur technique transmise au FormControl parent. */
  valeur: string;
  /** Libellé affiché dans l'interface utilisateur. */
  libelle: string;
}

/**
 * Case de la grille du calendrier mensuel miniature (`mc-mini-calendrier`).
 * Une case est soit vide (avant le 1er du mois) soit associée à un jour précis.
 */
export interface CaseCalendrier {
  /** Date ISO (YYYY-MM-DD) du jour, ou `null` pour les cases vides avant le 1er. */
  date: string | null;
  /** `true` si le jour est grisé : weekend, jour férié ou jour non ouvré. */
  grise: boolean;
  /** `true` si la date possède au moins une entrée dans le cahier journal. */
  avecEntree: boolean;
  /** `true` si cette date est actuellement sélectionnée. */
  estSelectionnee: boolean;
  /** `true` si cette date correspond à aujourd'hui. */
  estAujourdhui: boolean;
}


import type { Competence } from './referentiels.modele';

/**
 * Nœud aplati de l'arbre des compétences, prêt à l'affichage dans `mc-arbre-competences`.
 * Issu du calcul de l'arbre hiérarchique avec les états de filtrage et de sélection appliqués.
 */
export interface NoeudAffiche {
  /** Compétence représentée par ce nœud. */
  competence: Competence;
  /** Profondeur dans l'arbre (0 = domaine racine). Pilote l'indentation visuelle. */
  niveau: number;
  /** `true` si le nœud n'a pas d'enfants (compétence évaluable). */
  estFeuille: boolean;
  /** `true` si le nœud est actuellement déplié (ses enfants sont visibles). */
  estDeplie: boolean;
  /** `true` si cette compétence fait partie de la sélection courante. */
  estSelectionne: boolean;
}

/**
 * Option proposée dans la liste d'autocomplétion du sélecteur de compétences.
 * Le libellé affiche le chemin complet depuis le domaine jusqu'à la compétence.
 */
export interface OptionAutoComplete {
  /** Identifiant de la compétence. */
  id: string;
  /** Chemin complet, ex. `"Français › Lecture › Comprendre un texte"`. */
  libelle: string;
}

/**
 * Résultat émis par `popin-export-competences` lors de la confirmation de l'export.
 * Identifie la cible (projet/période ou journée/séance) vers laquelle exporter les compétences.
 */
export interface ResultatExportCompetences {
  /** Type de la cible d'export. */
  cibleType: 'projet' | 'seance';
  /** Identifiant de la cible principale : projet ID (mode projet) ou date ISO (mode séance). */
  cibleId: string;
  /** Identifiant secondaire : index de période en string (mode projet) ou ID de séance (mode séance). */
  secondaireId: string;
}
