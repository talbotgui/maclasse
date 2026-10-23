/**
 * Modèles de données relatifs aux bilans d'un élève, regroupés par sous-domaine
 * de compétences (nœud de niveau 3 de l'arbre des compétences).
 */

import type { StatutAcquisition } from './referentiels.modele';

/**
 * Évaluation d'une compétence évaluable (feuille du sous-domaine) dans un bilan.
 */
export interface EvaluationBilan {
  /** Identifiant unique de la ligne d'évaluation. */
  id: string;
  /** Identifiant de la compétence évaluée, ou `''` tant qu'elle n'est pas choisie. */
  competenceId: string;
  /** Référence vers un `StatutAcquisition`, ou `null` si l'évaluation n'est pas renseignée. */
  statutAcquisitionId: string | null;
  /** Commentaire libre de l'enseignant. */
  commentaire: string;
}

/**
 * Bilan d'un élève sur un sous-domaine de compétences.
 */
export interface Bilan {
  /** Identifiant unique du bilan. */
  id: string;
  /** Date du bilan au format ISO (ex. : `"2026-10-23"`). */
  date: string;
  /** Titre du bilan, saisi par l'enseignant. */
  titre: string;
  /** Texte riche (HTML) du bilan proprement dit. */
  bilans: string;
  /** Texte riche (HTML) des besoins spécifiques de l'élève. */
  besoinsSpecifiques: string;
  /** Texte riche (HTML) des moyens mis en œuvre. */
  moyens: string;
  /** Évaluations des compétences du sous-domaine. */
  evaluations: EvaluationBilan[];
}

/**
 * Ensemble des bilans d'un élève pour un sous-domaine de compétences.
 * Un suivi n'existe que tant qu'il contient au moins un bilan.
 */
export interface SuiviSousDomaine {
  /** Identifiant de la compétence de niveau 3 suivie. */
  sousDomaineId: string;
  /** Bilans du sous-domaine, dans l'ordre d'affichage. */
  bilans: Bilan[];
}

/**
 * Bilan en cours d'édition dans l'onglet Bilans de l'écran Élèves.
 */
export interface EditionBilan {
  /** Sous-domaine du bilan. */
  sousDomaineId: string;
  /** Valeur de départ du formulaire. */
  bilan: Bilan;
  /** `true` pour un nouveau bilan, pas encore enregistré. */
  nouveau: boolean;
}

/**
 * Sous-domaine affiché avec ses bilans dans l'onglet Bilans de l'écran Élèves.
 */
export interface SectionSousDomaine {
  /** Identifiant de la compétence de niveau 3. */
  sousDomaineId: string;
  /** Libellé complet `N1 > N2 > N3`, ou l'identifiant si le sous-domaine est introuvable. */
  libelle: string;
  /** Bilans dans l'ordre d'affichage, nouveau bilan en cours de saisie compris. */
  bilans: Bilan[];
  /** Nombre de bilans enregistrés (le nouveau bilan éventuel est placé après). */
  nombreEnregistres: number;
}

/**
 * Ligne du tableau des évaluations d'un bilan affiché en lecture.
 */
export interface LigneEvaluationLecture {
  /** Identifiant de la ligne. */
  id: string;
  /** Libellé de la compétence, relatif au sous-domaine (ou son identifiant si introuvable). */
  competence: string;
  /** Statut d'acquisition, ou `null` si non renseigné ou inconnu. */
  statut: StatutAcquisition | null;
  /** Commentaire libre. */
  commentaire: string;
}

/**
 * Sous-domaine de compétences proposé à la sélection, avec son libellé complet.
 */
export interface SousDomaineDisponible {
  /** Identifiant de la compétence de niveau 3. */
  id: string;
  /** Libellé complet `Domaine > Niveau 2 > Sous-domaine`. */
  libelle: string;
}
