/**
 * Modèles de données relatifs au cahier journal.
 * Une journée regroupe une liste ordonnée de séances.
 */

import { ElevesConcernes, TypeCreneau } from './emploi-du-temps.modele';

/**
 * Séance du cahier journal pour une journée donnée.
 * Les propriétés détaillées (objectifs, compétences, etc.) ne sont pertinentes
 * que si `type === 'pedagogique'`.
 */
export interface Seance {
  /** Identifiant unique de la séance. */
  id: string;
  /** Heure de début au format `HH:MM`. */
  heureDebut: string;
  /** Heure de fin au format `HH:MM`. */
  heureFin: string;
  /** Nature de la séance. */
  type: TypeCreneau;
  /** Identifiants des disciplines travaillées (type pédagogique uniquement). */
  disciplinesIds?: string[];
  /** Titre libre de la séance (type pédagogique uniquement). */
  titre?: string;
  /** Objectifs pédagogiques (texte libre, type pédagogique uniquement). */
  objectifs?: string;
  /** Identifiants des compétences travaillées (type pédagogique uniquement). */
  competencesIds?: string[];
  /** Description du déroulement (texte libre, type pédagogique uniquement). */
  deroulement?: string;
  /** Ressources et matériaux utilisés (texte libre, type pédagogique uniquement). */
  ressources?: string;
  /** Description synthétique de la séance (texte libre, type pédagogique uniquement). */
  description?: string;
  /** Périmètre des élèves concernés (type pédagogique uniquement). */
  elevesConcernes?: ElevesConcernes;
}

/**
 * Entrée du cahier journal pour une journée scolaire.
 * La liste des séances est ordonnée par heure de début croissante.
 */
export interface JourneeJournal {
  /** Identifiant unique de la journée. */
  id: string;
  /** Date de la journée au format ISO (ex. : `"2026-06-09"`). */
  date: string;
  /** Notes libres de la journée (rappels, événements, effectif…). Indépendantes des séances. */
  notes?: string;
  /** Séances de la journée, triées par heure de début. */
  seances: Seance[];
}
