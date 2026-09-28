/**
 * Modèles de données relatifs aux élèves, leurs contacts,
 * leur cursus et leurs absences.
 */

import { FrequenceSemaine, JourSemaine } from './emploi-du-temps.modele';

/** Sexe déclaré de l'élève. */
export type Sexe = 'M' | 'F';

/** Réponse de la famille à une demande d'autorisation. */
export type ReponseAutorisation = 'accepte' | 'refuse' | 'sansReponse';

/** Latéralité de l'élève. */
export type Lateralite = 'gaucher' | 'droitier';

/**
 * Autorisation demandée à la famille (droit à l'image, baignade, sortie régulière…).
 */
export interface Autorisation {
  /**
   * Réponse de la famille, ou `null` si elle n'est pas renseignée
   * (distinct de `'sansReponse'` : la famille n'a pas répondu).
   */
  reponse: ReponseAutorisation | null;
  /** Précision libre sur une ligne (ex. : « sauf réseaux sociaux »). */
  precision: string;
}

/**
 * Absence récurrente d'un élève sur un créneau hebdomadaire fixe
 * (ex. : orthophonie tous les vendredis matin des semaines paires).
 */
export interface AbsenceRecurrente {
  /** Identifiant unique de l'absence récurrente. */
  id: string;
  /** Libellé descriptif (ex. : "Orthophonie"). */
  libelle: string;
  /** Jour de la semaine concerné. */
  jour: JourSemaine;
  /** Heure de début au format `HH:MM`. */
  heureDebut: string;
  /** Heure de fin au format `HH:MM`. */
  heureFin: string;
  /** Semaines (paires, impaires ou toutes) sur lesquelles l'absence se répète. */
  paritesSemaine: FrequenceSemaine;
}

/**
 * Absence ponctuelle d'un élève sur une date donnée.
 */
export interface AbsencePonctuelle {
  /** Identifiant unique de l'absence ponctuelle. */
  id: string;
  /** Date de l'absence au format ISO (ex. : `"2026-06-09"`). */
  date: string;
  /** Justification textuelle libre. */
  justification: string;
}

/**
 * Personne à contacter pour un élève (parent, tuteur, structure d'accueil…).
 */
export interface Contact {
  /** Référence vers un `TypeContact` (ex. : `"P"` pour père, `"M"` pour mère). */
  type: string;
  /** Nom complet du contact. */
  nom: string;
  /** Adresse électronique. */
  email: string;
  /** Numéro de téléphone. */
  telephone: string;
  /** Adresse postale complète. */
  adressePostale: string;
}

/**
 * Année de scolarité antérieure d'un élève.
 */
export interface CursusAnnee {
  /** Identifiant unique de l'entrée de cursus. */
  id: string;
  /** Année scolaire (ex. : `2024` pour l'année 2024-2025). */
  annee: number;
  /** Niveau de classe suivi cette année-là (ex. : `"CE2"`). */
  niveau: string;
  /** Établissement fréquenté. */
  etablissement: string;
  /** Dispositif ou accompagnement particulier cette année. */
  accompagnement: string;
}

/**
 * Élève inscrit dans la classe.
 * Regroupe l'état civil, les informations scolaires,
 * les contacts, les absences et le cursus.
 */
export interface Eleve {
  /** UUID de l'élève. */
  id: string;
  /** Prénom de l'élève. */
  prenom: string;
  /** Nom de famille de l'élève (affiché en majuscules dans l'UI). */
  nom: string;
  /** Sexe déclaré. */
  sexe: Sexe;
  /** Niveau scolaire actuel de l'élève (ex. : `"CM1"`). */
  niveau: string;
  /** Identifiants des groupes auxquels appartient l'élève. */
  groupes: string[];
  /** Date de naissance au format ISO. */
  dateNaissance: string;
  /** Date d'arrivée dans l'établissement au format ISO. */
  dateArrivee: string;
  /** Référence vers un `StatutEleve` (ex. : `"DC"` pour dans la classe). */
  statut: string;
  /** Notes de bilans scolaires ou psychologiques (texte libre). */
  bilans: string;
  /** Informations d'accueil de l'élève (texte libre). */
  accueil: string;
  /** Informations sur un dispositif d'inclusion, ou `null`. */
  inclusion: string | null;
  /** Liste des personnes à contacter. */
  contacts: Contact[];
  /** Absences régulières (orthophonie, RASED…). */
  absencesRecurrentes: AbsenceRecurrente[];
  /** Absences exceptionnelles datées. */
  absencesPonctuelles: AbsencePonctuelle[];
  /** Historique des années de scolarité précédentes. */
  cursus: CursusAnnee[];
  /** Autorisation de droit à l'image. */
  droitImage: Autorisation;
  /** Autorisation de baignade. */
  autorisationBaignade: Autorisation;
  /** Autorisation de sortie régulière. */
  autorisationSortieReguliere: Autorisation;
  /** Notes PPA (texte libre), ou `null`. */
  notesPPA: string | null;
  /** Notes ESS (texte libre), ou `null`. */
  notesESS: string | null;
  /** `true` si l'élève porte des lunettes. */
  portLunettes: boolean;
  /** `true` si l'élève bénéficie d'une notification AESH. */
  notificationAesh: boolean;
  /** Latéralité de l'élève, ou `null` si elle n'est pas renseignée. */
  lateralite: Lateralite | null;
}

/**
 * Absence récurrente d'un élève jugée pertinente pour un emploi du temps donné
 * (jour utilisé par un créneau de l'EDT et parité de semaine compatible).
 */
export interface AbsencePertinente {
  /** Élève concerné par l'absence. */
  eleve: Eleve;
  /** Absence récurrente jugée pertinente. */
  absence: AbsenceRecurrente;
}
