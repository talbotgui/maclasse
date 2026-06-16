/**
 * Modèles de données relatifs à l'emploi du temps.
 * Définit également les types partagés `JourSemaine` et `FrequenceSemaine`,
 * utilisés dans d'autres domaines (élèves, cahier journal).
 */

/** Jour de la semaine scolaire (lundi à vendredi). */
export type JourSemaine = 'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi';

/**
 * Fréquence de répétition sur la parité des semaines ISO.
 * Utilisé dans les emplois du temps et les absences récurrentes.
 */
export type FrequenceSemaine = 'paire' | 'impaire' | 'lesDeux';

/** Type d'un créneau : pédagogique, récréation ou pause déjeuner. */
export type TypeCreneau = 'pedagogique' | 'recreation' | 'pauseDejeuner';

/**
 * Groupe d'élèves concernés par une séance ou un créneau.
 * Réutilisé dans le cahier journal (`Seance.elevesConcernes`).
 */
export interface ElevesConcernes {
  /** Granularité de la sélection : toute la classe, par groupes ou élèves nommés. */
  type: 'classe' | 'groupes' | 'eleves';
  /** Identifiants des groupes sélectionnés (vide si `type` ≠ `'groupes'`). */
  groupes: string[];
  /** UUIDs des élèves sélectionnés (vide si `type` ≠ `'eleves'`). */
  elevesIds: string[];
}

/**
 * Créneau unitaire d'un emploi du temps.
 * Les propriétés `disciplinesIds`, `titre` et `elevesConcernes` ne sont
 * pertinentes que si `type === 'pedagogique'`.
 */
export interface CreneauEdt {
  /** Identifiant unique du créneau. */
  id: string;
  /** Jour de la semaine auquel ce créneau a lieu. */
  jour: JourSemaine;
  /** Heure de début au format `HH:MM`. */
  heureDebut: string;
  /** Heure de fin au format `HH:MM`. */
  heureFin: string;
  /** Nature du créneau. */
  type: TypeCreneau;
  /** Identifiants des disciplines traitées (type pédagogique uniquement). */
  disciplinesIds?: string[];
  /** Titre libre du créneau (type pédagogique uniquement). */
  titre?: string;
  /** Périmètre des élèves concernés (type pédagogique uniquement). */
  elevesConcernes?: ElevesConcernes;
}

/**
 * Emploi du temps hebdomadaire ou bi-hebdomadaire.
 * Un EDT peut être limité dans le temps via `dateDebut` / `dateFin`.
 */
export interface EmploiDuTemps {
  /** Identifiant unique de l'emploi du temps. */
  id: string;
  /** Nom affiché dans la liste (obligatoire). */
  nom: string;
  /** Date de début de validité au format ISO, ou `null` si sans limite. */
  dateDebut: string | null;
  /** Date de fin de validité au format ISO, ou `null` si sans limite. */
  dateFin: string | null;
  /** Semaines sur lesquelles cet EDT s'applique. */
  frequence: FrequenceSemaine;
  /** Liste des créneaux composant cet EDT. */
  creneaux: CreneauEdt[];
}
