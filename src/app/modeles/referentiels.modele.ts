/**
 * Modèles de données relatifs aux référentiels de l'application.
 * Les référentiels sont configurables par l'enseignant via l'écran paramétrage.
 */

import { JourSemaine } from './emploi-du-temps.modele';

/**
 * Nœud de l'arbre des compétences.
 * Un nœud sans `enfants` est une feuille (compétence évaluable).
 */
export interface Competence {
  /** Identifiant unique de la compétence (ex. : `"FC2-27"`). */
  id: string;
  /** Libellé affiché dans l'arbre et dans les sélecteurs. */
  libelle: string;
  /** Compétences enfants, absentes si nœud feuille. */
  enfants?: Competence[];
}

/**
 * Statut d'acquisition d'une compétence (ex. : Acquis, En cours…).
 * L'`id` est libre : l'enseignant peut créer ses propres statuts.
 */
export interface StatutAcquisition {
  /** Identifiant textuel libre (ex. : `"A"`, `"EC"`, `"NA"`, `"NE"`). */
  id: string;
  /** Glyphe affiché dans les badges (ex. : `"✓"`, `"~"`, `"✗"`, `"?"`). */
  glyphe: string;
  /** Libellé long affiché dans les formulaires et légendes. */
  libelle: string;
  /** Couleur du texte du badge (valeur CSS). */
  couleur: string;
  /** Couleur de fond du badge (valeur CSS). */
  fond: string;
}

/**
 * Période de l'année scolaire (ex. : "Période 1").
 * Utilisée pour structurer les projets et les bulletins.
 */
export interface Periode {
  /** Identifiant unique de la période. */
  id: string;
  /** Nom affiché de la période. */
  nom: string;
  /** Date de début au format ISO. */
  debut: string;
  /** Date de fin au format ISO. */
  fin: string;
}

/**
 * Statut de présence d'un élève dans l'établissement.
 * Exemples : "Dans la classe", "Dans l'établissement", "Hors établissement".
 */
export interface StatutEleve {
  /** Identifiant court (ex. : `"DC"`, `"DE"`, `"HE"`). */
  id: string;
  /** Libellé affiché dans les formulaires. */
  libelle: string;
}

/**
 * Type de contact d'un élève (père, mère, famille d'accueil…).
 */
export interface TypeContact {
  /** Identifiant court (ex. : `"P"`, `"M"`, `"F"`). */
  id: string;
  /** Libellé affiché dans les formulaires. */
  libelle: string;
}

/**
 * Groupe d'élèves constitué par l'enseignant (ex. : Groupe A, Groupe B).
 */
export interface Groupe {
  /** Identifiant court (ex. : `"A"`, `"B"`). */
  id: string;
  /** Libellé affiché dans l'UI. */
  libelle: string;
}

/**
 * Jour férié ou période de vacances scolaires.
 */
export interface JourFerie {
  /** Identifiant unique du jour férié. */
  id: string;
  /** Nom du jour férié ou de la période (ex. : `"Toussaint"`). */
  nom: string;
  /** Date au format ISO (ex. : `"2025-11-01"`). */
  date: string;
}

/**
 * Raison d'absence d'un élève (ex. : "Inclusion", "Maladie").
 */
export interface RaisonAbsence {
  /** Identifiant court. */
  id: string;
  /** Libellé affiché dans les formulaires. */
  libelle: string;
}

/**
 * Fréquence de répétition d'une absence (ex. : semaine paire, chaque semaine).
 * Référentiel affiché dans le formulaire d'absence récurrente.
 */
export interface FrequenceAbsence {
  /** Identifiant court (ex. : `"SP"`, `"SI"`, `"CS"`). */
  id: string;
  /** Libellé affiché dans les formulaires. */
  libelle: string;
}

/**
 * Configuration globale de l'emploi du temps.
 * Définit les jours ouvrés et les bornes horaires de la journée scolaire.
 */
export interface ConfigEmploiDuTemps {
  /** Jours ouvrés affichés dans la grille hebdomadaire. */
  joursOuvres: JourSemaine[];
  /** Heure de début de la journée scolaire au format `HH:MM`. */
  heureDebutJournee: string;
  /** Heure de fin de la journée scolaire au format `HH:MM`. */
  heureFinJournee: string;
}

/**
 * Ensemble des référentiels configurables de l'application.
 * Toutes les listes sont modifiables via l'écran paramétrage.
 */
export interface Referentiels {
  /** Arbre hiérarchique des compétences du programme. */
  competences: Competence[];
  /** Périodes de l'année scolaire. */
  periodes: Periode[];
  /** Barème d'acquisition personnalisable (A/EC/NA/NE par défaut). */
  statutsAcquisition: StatutAcquisition[];
  /** Statuts de présence disponibles. */
  statutsEleve: StatutEleve[];
  /** Types de contact disponibles. */
  typesContact: TypeContact[];
  /** Groupes d'élèves définis par l'enseignant. */
  groupes: Groupe[];
  /** Jours fériés et périodes de vacances de l'année. */
  joursFeries: JourFerie[];
  /** Raisons d'absence disponibles dans les formulaires. */
  raisonsAbsence: RaisonAbsence[];
  /** Fréquences de répétition disponibles pour les absences récurrentes. */
  frequencesAbsence: FrequenceAbsence[];
  /** Paramètres de la grille hebdomadaire. */
  configEmploiDuTemps: ConfigEmploiDuTemps;
}
