/**
 * Service sans état chargé de faire évoluer les données chargées vers le format
 * attendu par la version courante de l'application.
 */

import { Injectable } from '@angular/core';
import { DonneesApplication } from '../../modeles/donnees-application.modele';
import { CreneauEdt } from '../../modeles/emploi-du-temps.modele';
import { Eleve } from '../../modeles/eleve.modele';
import { CreneauEdtV1, EleveV1, EtapeMigration } from '../../modeles/migration.modele';
import { SourceEdtCalcule } from '../../modeles/emploi-du-temps-calcule.modele';

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
    {
      versionCible: '2026.09.4',
      appliquer: (donnees) => this.regrouperTempsHorsClasse(donnees),
    },
    {
      versionCible: '2026.09.5',
      appliquer: (donnees) => this.retirerManualiteEtDispositifsMedicaux(donnees),
    },
    {
      versionCible: '2026.09.6',
      appliquer: (donnees) => this.nettoyerAbsencesRecurrentes(donnees),
    },
  ];

  /**
   * Version la plus récente du format de données que cette application sait lire.
   * @returns Version cible de la dernière étape de migration.
   */
  public obtenirVersionCourante(): string {
    return this.etapes[this.etapes.length - 1].versionCible;
  }

  /**
   * Indique si un fichier de données peut être lu par cette version de l'application :
   * un fichier créé par une version plus récente du format est refusé.
   * @param version Version du format de données du fichier (ex. `"2026.09.1"`).
   * @returns `true` si la version est inférieure ou égale à la version courante.
   */
  public estVersionSupportee(version: string): boolean {
    return MigrationService.comparerVersions(version, this.obtenirVersionCourante()) <= 0;
  }

  /**
   * Compare deux versions `AAAA.MM.N` segment par segment, numériquement
   * (`2026.09.10` est postérieure à `2026.09.3`, ce qu'une comparaison de chaînes inverserait).
   * Si l'une des versions n'est pas numérique, elles sont considérées comme égales.
   * @param a Première version.
   * @param b Seconde version.
   * @returns Un nombre négatif si `a` < `b`, positif si `a` > `b`, `0` si égales ou incomparables.
   */
  private static comparerVersions(a: string, b: string): number {
    const segmentsA = a.split('.').map(Number);
    const segmentsB = b.split('.').map(Number);
    // Une version illisible n'est comparable à aucune autre : ni migrée, ni prise pour une version future
    if ([...segmentsA, ...segmentsB].some(Number.isNaN)) return 0;
    const longueur = Math.max(segmentsA.length, segmentsB.length);
    for (let i = 0; i < longueur; i++) {
      const ecart = (segmentsA[i] ?? 0) - (segmentsB[i] ?? 0);
      if (ecart !== 0) return ecart;
    }
    return 0;
  }

  /**
   * Applique en place toutes les étapes de migration dont la version cible est
   * postérieure à `donnees.version`, et met à jour `donnees.version` au fil de la chaîne.
   * Termine par une normalisation idempotente, appliquée à chaque chargement quelle
   * que soit la version (attribution des identifiants manquants).
   * @param donnees Données à faire évoluer (mutées en place).
   * @returns Les données passées en paramètre, pour chaînage.
   */
  public migrer(donnees: DonneesApplication): DonneesApplication {
    for (const etape of this.etapes) {
      if (MigrationService.comparerVersions(donnees.version, etape.versionCible) < 0) {
        etape.appliquer(donnees);
        donnees.version = etape.versionCible;
      }
    }
    this.attribuerIdentifiantsManquants(donnees);
    return donnees;
  }

  /**
   * Attribue un `id` aux périodes de projet et entrées de cursus élève qui en sont
   * dépourvues (fichiers créés avant l'introduction de ces champs). Idempotent.
   * @param donnees Données à muter (déjà clonées par l'appelant).
   */
  private attribuerIdentifiantsManquants(donnees: DonneesApplication): void {
    for (const projet of donnees.projets) {
      for (const periode of projet.periodes) {
        if (!periode.id) periode.id = crypto.randomUUID();
      }
    }
    for (const eleve of donnees.classe.eleves) {
      for (const annee of eleve.cursus) {
        if (!annee.id) annee.id = crypto.randomUUID();
      }
    }
  }

  /**
   * Rend valide la plage horaire des absences récurrentes, devenue obligatoire (heure de
   * fin strictement postérieure à l'heure de début) : des heures saisies à l'envers sont
   * inversées ; une absence sans heure de début ou de fin, ou aux heures égales, est
   * supprimée. Une absence valide est laissée inchangée. Idempotent.
   * @param donnees Données à muter (déjà clonées par l'appelant).
   */
  private nettoyerAbsencesRecurrentes(donnees: DonneesApplication): void {
    for (const eleve of donnees.classe.eleves) {
      eleve.absencesRecurrentes = eleve.absencesRecurrentes.flatMap((absence) => {
        const { heureDebut, heureFin } = absence;
        if (!heureDebut || !heureFin || heureDebut === heureFin) return [];
        return heureFin < heureDebut
          ? [{ ...absence, heureDebut: heureFin, heureFin: heureDebut }]
          : [absence];
      });
    }
  }

  /**
   * Retire des élèves les champs `manualite` et `dispositifsMedicaux`, abandonnés
   * faute d'être saisissables dans l'application. Idempotent.
   * @param donnees Données à muter (déjà clonées par l'appelant).
   */
  private retirerManualiteEtDispositifsMedicaux(donnees: DonneesApplication): void {
    for (const eleve of donnees.classe.eleves as (Eleve & Partial<EleveV1>)[]) {
      delete eleve.manualite;
      delete eleve.dispositifsMedicaux;
    }
  }

  /**
   * Regroupe les récréations et pauses déjeuner sous la notion de temps hors classe :
   * la source `recreation` des EDT calculés devient `tempsHorsClasse` (sans doublon), et les
   * temps des créneaux non pédagogiques perdent leurs champs pédagogiques. Idempotent.
   * @param donnees Données à muter (déjà clonées par l'appelant).
   */
  private regrouperTempsHorsClasse(donnees: DonneesApplication): void {
    for (const edtCalcule of donnees.emploisDuTempsCalcules) {
      const sources = edtCalcule.sources as string[];
      if (!sources.includes('recreation')) continue;
      edtCalcule.sources = [
        ...new Set(sources.map((s) => (s === 'recreation' ? 'tempsHorsClasse' : s))),
      ] as SourceEdtCalcule[];
    }
    for (const edt of donnees.emploisDuTemps) {
      for (const creneau of edt.creneaux) {
        if (creneau.type === 'pedagogique') continue;
        creneau.temps = creneau.temps.map(({ id, heureDebut, heureFin }) => ({
          id,
          heureDebut,
          heureFin,
        }));
      }
    }
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
