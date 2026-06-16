/**
 * Modèles de données relatifs aux PPI (Projets Pédagogiques Individualisés)
 * et aux bulletins d'évaluation.
 * Ces domaines sont à construire dans une version ultérieure.
 */

/**
 * Entrée d'une compétence dans un PPI, avec suivi initial et mise à jour.
 */
export interface PpiCompetence {
  /** Identifiant de la compétence référencée. */
  competenceId: string;
  /** Date du constat initial au format ISO. */
  dateInitiale: string;
  /** Constat initial rédigé par l'enseignant. */
  constatInitial: string;
  /** Actions pédagogiques envisagées initialement. */
  actionsInitiales: string;
  /** Référence vers un `StatutAcquisition` pour l'évaluation courante. */
  evaluation: string;
  /** Date de la dernière mise à jour au format ISO. */
  dateMaj: string;
  /** Constat actualisé. */
  constatMaj: string;
  /** Actions actualisées. */
  actionsMaj: string;
}

/**
 * Projet Pédagogique Individualisé associé à un élève.
 */
export interface Ppi {
  /** UUID du PPI. */
  id: string;
  /** UUID de l'élève concerné. */
  eleveId: string;
  /** Compétences suivies dans ce PPI. */
  competencesEntrees: PpiCompetence[];
}

/**
 * Évaluation d'une compétence dans un bulletin.
 */
export interface BulletinCompetence {
  /** Identifiant de la compétence évaluée. */
  competenceId: string;
  /** Référence vers un `StatutAcquisition`. */
  evaluation: string;
  /** Appréciation destinée à l'élève et aux familles. */
  appreciationPublique: string;
  /** Note interne à l'enseignant (non imprimée). */
  appreciationPrivee: string;
}

/**
 * Bulletin d'évaluation d'un élève pour une période donnée.
 */
export interface Bulletin {
  /** UUID du bulletin. */
  id: string;
  /** UUID de l'élève concerné. */
  eleveId: string;
  /** Nom de la période (référence vers `Periode.nom`). */
  periode: string;
  /** Liste des compétences évaluées dans ce bulletin. */
  competencesEvaluees: BulletinCompetence[];
}
