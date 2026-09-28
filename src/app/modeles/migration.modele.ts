/**
 * Modèles de données propres aux migrations de format : anciennes formes de données
 * et description des étapes de la chaîne de migration.
 */

import { DonneesApplication } from './donnees-application.modele';
import { ElevesConcernes, TypeCreneau } from './emploi-du-temps.modele';

/**
 * Forme d'un créneau EDT antérieure à l'introduction des temps multiples (`temps[]`) :
 * horaire et champs pédagogiques portés directement par le créneau.
 */
export interface CreneauEdtV1 {
  /** Identifiant unique du créneau. */
  id: string;
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
 * Champs d'un élève antérieurs à la version `2026.09.5`, retirés du modèle faute
 * d'être saisissables dans l'application.
 */
export interface EleveV1 {
  /** Latéralité de l'élève : Droitier, Gaucher ou Ambidextre. */
  manualite?: 'D' | 'G' | 'A';
  /** Dispositifs médicaux ou traitements en cours (texte libre). */
  dispositifsMedicaux?: string;
}

/**
 * Champs d'un élève antérieurs à la version `2026.09.7`, remplacés par les autorisations
 * structurées (`Eleve.droitImage`, `Eleve.autorisationBaignade`).
 */
export interface EleveV2 {
  /** Notes relatives au droit à l'image (texte libre). */
  notesDroitImage?: string;
  /** Notes relatives à l'autorisation de baignade (texte libre). */
  notesAutorisationBaignade?: string;
}

/**
 * Étape de migration versionnée : amène les données à `versionCible` si leur
 * version courante est antérieure.
 */
export interface EtapeMigration {
  /** Version du format de données obtenue une fois cette étape appliquée. */
  versionCible: string;
  /** Applique la transformation aux données, en place. */
  appliquer: (donnees: DonneesApplication) => void;
}
