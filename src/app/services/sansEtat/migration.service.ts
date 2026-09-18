/**
 * Service sans état chargé de faire évoluer les données chargées vers le format
 * attendu par la version courante de l'application.
 */

import { Injectable } from '@angular/core';
import { DonneesApplication } from '../../modeles/donnees-application.modele';
import { CreneauEdt, ElevesConcernes, TypeCreneau } from '../../modeles/emploi-du-temps.modele';

/**
 * Forme d'un créneau EDT antérieure à l'introduction des temps multiples (`temps[]`) :
 * horaire et champs pédagogiques portés directement par le créneau.
 */
interface CreneauEdtV1 {
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
 * Étape de migration versionnée : amène les données à `versionCible` si leur
 * version courante est antérieure.
 */
interface EtapeMigration {
  /** Version du format de données obtenue une fois cette étape appliquée. */
  versionCible: string;
  /** Applique la transformation aux données, en place. */
  appliquer: (donnees: DonneesApplication) => void;
}

/**
 * Fait progresser les données chargées d'une version de format à l'autre via une
 * chaîne d'étapes ordonnées, appliquée selon `DonneesApplication.version`.
 */
@Injectable({ providedIn: 'root' })
export class MigrationService {
  /**
   * Chaîne ordonnée des étapes de migration, appliquées si `donnees.version`
   * est antérieure à leur `versionCible`.
   */
  private readonly etapes: EtapeMigration[] = [
    {
      versionCible: '2026.09.2',
      appliquer: (donnees) => this.migrerCreneauxVersTemps(donnees),
    },
    {
      versionCible: '2026.09.3',
      appliquer: (donnees) => this.ajouterEmploisDuTempsCalcules(donnees),
    },
  ];

  /**
   * Applique en place toutes les étapes de migration dont la version cible est
   * postérieure à `donnees.version`, et met à jour `donnees.version` au fil de la chaîne.
   * @param donnees Données à faire évoluer (mutées en place).
   * @returns Les données passées en paramètre, pour chaînage.
   */
  public migrer(donnees: DonneesApplication): DonneesApplication {
    for (const etape of this.etapes) {
      if (donnees.version < etape.versionCible) {
        etape.appliquer(donnees);
        donnees.version = etape.versionCible;
      }
    }
    return donnees;
  }

  /**
   * Ajoute le tableau `emploisDuTempsCalcules` s'il est absent. Idempotent.
   * @param donnees Données à muter (déjà clonées par l'appelant).
   */
  private ajouterEmploisDuTempsCalcules(donnees: DonneesApplication): void {
    donnees.emploisDuTempsCalcules ??= [];
  }

  /**
   * Convertit les créneaux au format à plat (`heureDebut`/`heureFin`/`titre`/…)
   * en un unique `TempsCreneau` dans `creneau.temps`. Idempotent : ignore les
   * créneaux possédant déjà `temps`.
   * @param donnees Données à muter (déjà clonées par l'appelant).
   */
  private migrerCreneauxVersTemps(donnees: DonneesApplication): void {
    for (const edt of donnees.emploisDuTemps) {
      for (const creneau of edt.creneaux as unknown as (CreneauEdt & Partial<CreneauEdtV1>)[]) {
        if (creneau.temps) continue;
        const ancien = creneau as unknown as CreneauEdtV1;
        creneau.temps = [
          {
            id: crypto.randomUUID(),
            heureDebut: ancien.heureDebut,
            heureFin: ancien.heureFin,
            ...(ancien.disciplinesIds ? { disciplinesIds: ancien.disciplinesIds } : {}),
            ...(ancien.titre !== undefined ? { titre: ancien.titre } : {}),
            ...(ancien.elevesConcernes ? { elevesConcernes: ancien.elevesConcernes } : {}),
          },
        ];
        delete (creneau as Partial<CreneauEdtV1>).heureDebut;
        delete (creneau as Partial<CreneauEdtV1>).heureFin;
        delete (creneau as Partial<CreneauEdtV1>).disciplinesIds;
        delete (creneau as Partial<CreneauEdtV1>).titre;
        delete (creneau as Partial<CreneauEdtV1>).elevesConcernes;
      }
    }
  }
}
