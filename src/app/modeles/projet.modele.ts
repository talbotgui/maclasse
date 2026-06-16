/**
 * Modèles de données relatifs aux projets pédagogiques.
 * Un projet est découpé en périodes, chacune associée à des compétences.
 */

/**
 * Période d'un projet pédagogique.
 * Les périodes sont triées par date de début croissante.
 */
export interface ProjetPeriode {
  /** Nom de la période (ex. : `"Période 1"`). */
  periodeNom: string;
  /** Date de début au format ISO. */
  debut: string;
  /** Date de fin au format ISO. */
  fin: string;
  /** Description des activités menées sur cette période (texte libre). */
  description: string;
  /** Identifiants des compétences travaillées sur cette période. */
  competencesIds: string[];
}

/**
 * Projet pédagogique associant des élèves et des compétences sur plusieurs périodes.
 */
export interface Projet {
  /** UUID du projet. */
  id: string;
  /** Nom affiché du projet. */
  nom: string;
  /** Description générale du projet (texte libre). */
  description: string;
  /** UUIDs des élèves participant au projet. */
  elevesIds: string[];
  /** Découpage du projet en périodes chronologiques. */
  periodes: ProjetPeriode[];
}
