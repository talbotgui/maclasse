/**
 * Modèles de données relatifs aux emplois du temps calculés.
 * Seule la définition (`EmploiDuTempsCalcule`) est persistée ; les créneaux
 * (`CreneauCalcule`) sont recalculés à chaque affichage.
 */

import { ElevesConcernes, FrequenceSemaine, JourSemaine } from './emploi-du-temps.modele';

/** Source de données pouvant alimenter un emploi du temps calculé. */
export type SourceEdtCalcule = 'recreation' | 'tempsClasse' | 'absencesRegulieres';

/** Nature d'un créneau calculé, selon la source dont il provient. */
export type TypeSourceCalculee = 'recreation' | 'tempsClasse' | 'absenceReguliere';

/**
 * Définition persistée d'un emploi du temps calculé (lecture seule).
 */
export interface EmploiDuTempsCalcule {
  /** Identifiant unique de l'emploi du temps calculé. */
  id: string;
  /** Nom affiché dans la liste (obligatoire). */
  nom: string;
  /** Date de début de validité au format ISO, ou `null` si sans limite. */
  dateDebut: string | null;
  /** Date de fin de validité au format ISO, ou `null` si sans limite. */
  dateFin: string | null;
  /** Parité des semaines prises en compte. */
  frequence: FrequenceSemaine;
  /** Sources cochées (sélection multiple, non exclusive). */
  sources: SourceEdtCalcule[];
  /** Périmètre des élèves concernés. */
  elevesConcernes: ElevesConcernes;
}

/**
 * Créneau produit par le calcul d'un emploi du temps calculé. Jamais persisté.
 */
export interface CreneauCalcule {
  /** Jour de la semaine. */
  jour: JourSemaine;
  /** Heure de début au format `HH:MM`. */
  heureDebut: string;
  /** Heure de fin au format `HH:MM`. */
  heureFin: string;
  /** Source dont provient ce créneau. */
  source: TypeSourceCalculee;
  /** Titre du temps source, libellé de l'absence ou libellé de la récréation. */
  libelle: string;
  /** Élève concerné (uniquement pour `source === 'absenceReguliere'`). */
  eleveConcerneId?: string;
}
