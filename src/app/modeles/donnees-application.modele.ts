/**
 * Modèles de données racines de l'application MaClasse.
 * `DonneesApplication` est la structure sérialisée dans le fichier ZIP chiffré.
 */

import { Eleve } from './eleve.modele';
import { EmploiDuTemps } from './emploi-du-temps.modele';
import { JourneeJournal } from './cahier-journal.modele';
import { Projet } from './projet.modele';
import { Referentiels } from './referentiels.modele';
import { Bulletin, Ppi } from './ppi-bulletin.modele';

/**
 * Paramètres de configuration de l'application choisis par l'enseignant.
 */
export interface ConfigApplication {
  /** Délai entre deux sauvegardes automatiques, en minutes (défaut : 2). */
  delaiSauvegardeAutoMinutes: number;
  /**
   * Identifiants des domaines (N1) et sous-domaines (N2) actifs dans l'arbre des compétences.
   * Absent ou vide = tous les domaines sont affichés.
   */
  domainesActifs?: string[];
}

/**
 * Informations personnelles et professionnelles de l'enseignant.
 */
export interface Enseignant {
  /** Prénom de l'enseignant. */
  prenom: string;
  /** Nom de famille de l'enseignant. */
  nom: string;
  /** Année scolaire en cours (ex. : `"2025-2026"`). */
  annee: string;
}

/**
 * Classe gérée par l'enseignant pour l'année scolaire.
 */
export interface Classe {
  /** Niveau ou combinaison de niveaux de la classe (ex. : `"CM1"`, `"CM1-CM2"`). */
  niveau: string;
  /** Libellé descriptif de la classe (ex. : `"Double niveau CM1-CM2"`). */
  annee: string;
  /** Liste des élèves inscrits dans la classe. */
  eleves: Eleve[];
}

/**
 * Structure racine du fichier de données de l'application.
 * Correspond au contenu JSON sérialisé, compressé et chiffré dans le fichier ZIP.
 */
export interface DonneesApplication {
  /** Numéro de version du format de données (ex. : `"2026.09.1"`). */
  version: string;
  /** Paramètres de configuration de l'application. */
  configuration: ConfigApplication;
  /** Informations sur l'enseignant. */
  enseignant: Enseignant;
  /** Données de la classe (niveau, libellé, liste des élèves). */
  classe: Classe;
  /** Référentiels configurables (compétences, périodes, statuts…). */
  referentiels: Referentiels;
  /** Emplois du temps hebdomadaires ou bi-hebdomadaires. */
  emploisDuTemps: EmploiDuTemps[];
  /** Projets pédagogiques. */
  projets: Projet[];
  /** Entrées du cahier journal, une par journée scolaire. */
  cahierJournal: JourneeJournal[];
  /** Projets Pédagogiques Individualisés (domaine à construire). */
  ppi: Ppi[];
  /** Bulletins d'évaluation (domaine à construire). */
  bulletins: Bulletin[];
}
