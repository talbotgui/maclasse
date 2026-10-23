/**
 * Modèles de données relatifs aux bilans d'un élève, regroupés par sous-domaine
 * de compétences (nœud de niveau 3 de l'arbre des compétences).
 */

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
 * Sous-domaine de compétences proposé à la sélection, avec son libellé complet.
 */
export interface SousDomaineDisponible {
  /** Identifiant de la compétence de niveau 3. */
  id: string;
  /** Libellé complet `Domaine > Niveau 2 > Sous-domaine`. */
  libelle: string;
}
