/**
 * Service métier gérant les emplois du temps calculés.
 * Toute mutation transite par `DonneesService.executer()`.
 */

import { Injectable, inject } from '@angular/core';
import { EmploiDuTempsCalcule, CreneauCalcule } from '../../modeles/emploi-du-temps-calcule.modele';
import { EmploiDuTemps, TempsCreneau } from '../../modeles/emploi-du-temps.modele';
import { Eleve } from '../../modeles/eleve.modele';
import { CommandeCreation } from '../../commandes/commande-creation';
import { CommandeModification } from '../../commandes/commande-modification';
import { CommandeSuppression } from '../../commandes/commande-suppression';
import { DonneesService } from '../avecEtat/donnees.service';
import { EmploiDuTempsService } from './emploi-du-temps.service';
import { DateUtils } from '../../utilitaires/date.utils';
import { EleveUtils } from '../../utilitaires/eleve.utils';
import { LIBELLES } from '../../libelles';

/**
 * Service sans état exposant le CRUD des définitions d'emplois du temps calculés
 * et le calcul à la volée de leurs créneaux (jamais persistés).
 */
@Injectable({ providedIn: 'root' })
export class EmploiDuTempsCalculeService {
  /** Accès aux données de l'application et soumission des commandes. */
  private readonly donneesService = inject(DonneesService);

  /** Service des emplois du temps, pour la compatibilité de fréquences. */
  private readonly emploiDuTempsService = inject(EmploiDuTempsService);

  /**
   * Crée un emploi du temps calculé et l'ajoute à la liste.
   * @param edt Définition à créer (doit posséder un `id` unique).
   */
  public creerEdtCalcule(edt: EmploiDuTempsCalcule): void {
    this.donneesService.executer(
      new CommandeCreation(
        (d) => d.emploisDuTempsCalcules,
        edt,
        LIBELLES.commandes.ajoutEdtCalcule,
      ),
    );
  }

  /**
   * Modifie un emploi du temps calculé existant retrouvé par son `id`.
   * Sans effet si l'`id` n'existe pas ou si aucune donnée n'est chargée.
   * @param edt Nouvelle valeur de la définition (même `id`).
   */
  public modifierEdtCalcule(edt: EmploiDuTempsCalcule): void {
    const ancien = this.obtenirEdtCalcule(edt.id);
    if (!ancien) return;
    this.donneesService.executer(
      new CommandeModification(
        (d) => d.emploisDuTempsCalcules,
        ancien,
        edt,
        LIBELLES.commandes.modificationEdtCalcule,
      ),
    );
  }

  /**
   * Supprime un emploi du temps calculé par son identifiant.
   * Sans effet si l'`id` n'existe pas ou si aucune donnée n'est chargée.
   * @param id UUID de la définition à supprimer.
   */
  public supprimerEdtCalcule(id: string): void {
    const liste = this.donneesService.donnees()?.emploisDuTempsCalcules;
    const index = liste?.findIndex((e) => e.id === id) ?? -1;
    if (!liste || index === -1) return;
    this.donneesService.executer(
      new CommandeSuppression(
        (d) => d.emploisDuTempsCalcules,
        liste[index],
        index,
        LIBELLES.commandes.suppressionEdtCalcule,
      ),
    );
  }

  /**
   * Retourne un emploi du temps calculé par son identifiant, ou `undefined` s'il n'existe pas.
   * @param id UUID de la définition.
   */
  public obtenirEdtCalcule(id: string): EmploiDuTempsCalcule | undefined {
    return this.donneesService.donnees()?.emploisDuTempsCalcules.find((e) => e.id === id);
  }

  /**
   * Calcule les créneaux d'un emploi du temps calculé, au format hebdomadaire type.
   *
   * Les EDT sources retenus sont ceux dont la plage de dates chevauche celle de la définition
   * et dont la fréquence est compatible. Selon les sources cochées :
   * - `recreation` : un créneau par temps des créneaux de type récréation (« concernés » ignorés) ;
   * - `tempsClasse` : un créneau par temps des créneaux pédagogiques concernant au moins un des
   *   élèves choisis (aucun filtre si la définition concerne toute la classe) ;
   * - `absencesRegulieres` : une entrée par absence récurrente des élèves choisis, de parité compatible.
   * @param edtCalcule Définition à calculer.
   * @returns Créneaux triés par heure de début, vide si aucune donnée n'est chargée.
   */
  public calculerCreneaux(edtCalcule: EmploiDuTempsCalcule): CreneauCalcule[] {
    const donnees = this.donneesService.donnees();
    if (!donnees) return [];

    const eleves = donnees.classe.eleves;
    const creneaux: CreneauCalcule[] = [];
    const edtsRetenus = donnees.emploisDuTemps.filter((edt) =>
      this.verifierEdtSourceRetenu(edtCalcule, edt),
    );

    if (edtCalcule.sources.includes('recreation')) {
      creneaux.push(...this.calculerRecreations(edtsRetenus));
    }
    if (edtCalcule.sources.includes('tempsClasse')) {
      creneaux.push(...this.calculerTempsClasse(edtCalcule, edtsRetenus, eleves));
    }
    if (edtCalcule.sources.includes('absencesRegulieres')) {
      creneaux.push(...this.calculerAbsencesRegulieres(edtCalcule, eleves));
    }
    return creneaux.sort((a, b) => a.heureDebut.localeCompare(b.heureDebut));
  }

  /**
   * Détermine si un EDT source alimente la définition : plages de dates qui se chevauchent
   * et fréquences compatibles.
   * @param edtCalcule Définition à calculer.
   * @param edt EDT candidat.
   * @returns `true` si l'EDT doit être pris en compte.
   */
  private verifierEdtSourceRetenu(edtCalcule: EmploiDuTempsCalcule, edt: EmploiDuTemps): boolean {
    return (
      DateUtils.chevauchementPlages(
        edtCalcule.dateDebut,
        edtCalcule.dateFin,
        edt.dateDebut,
        edt.dateFin,
      ) &&
      this.emploiDuTempsService.verifierCompatibiliteFrequences(edtCalcule.frequence, edt.frequence)
    );
  }

  /**
   * Produit un créneau calculé par temps des créneaux de type récréation.
   * @param edts EDT sources retenus.
   * @returns Créneaux calculés de source `recreation`.
   */
  private calculerRecreations(edts: EmploiDuTemps[]): CreneauCalcule[] {
    return edts.flatMap((edt) =>
      edt.creneaux
        .filter((c) => c.type === 'recreation')
        .flatMap((c) =>
          c.temps.map((t) => ({
            jour: c.jour,
            heureDebut: t.heureDebut,
            heureFin: t.heureFin,
            source: 'recreation' as const,
            libelle: LIBELLES.edt.libelleRecreation,
          })),
        ),
    );
  }

  /**
   * Produit un créneau calculé par temps pédagogique concernant les élèves choisis.
   * @param edtCalcule Définition à calculer.
   * @param edts EDT sources retenus.
   * @param eleves Élèves de la classe.
   * @returns Créneaux calculés de source `tempsClasse`.
   */
  private calculerTempsClasse(
    edtCalcule: EmploiDuTempsCalcule,
    edts: EmploiDuTemps[],
    eleves: Eleve[],
  ): CreneauCalcule[] {
    return edts.flatMap((edt) =>
      edt.creneaux
        .filter((c) => c.type === 'pedagogique')
        .flatMap((c) =>
          c.temps
            .filter((t) => this.verifierTempsConcerne(edtCalcule, t, eleves))
            .map((t) => ({
              jour: c.jour,
              heureDebut: t.heureDebut,
              heureFin: t.heureFin,
              source: 'tempsClasse' as const,
              libelle: t.titre || LIBELLES.edt.libelleTempsClasseSansTitre,
            })),
        ),
    );
  }

  /**
   * Détermine si un temps concerne au moins un des élèves choisis dans la définition.
   * Sans filtre si la définition concerne toute la classe.
   * @param edtCalcule Définition à calculer.
   * @param temps Temps à tester.
   * @param eleves Élèves de la classe.
   * @returns `true` si le temps doit figurer dans le calcul.
   */
  private verifierTempsConcerne(
    edtCalcule: EmploiDuTempsCalcule,
    temps: TempsCreneau,
    eleves: Eleve[],
  ): boolean {
    if (edtCalcule.elevesConcernes.type === 'classe') return true;
    const choisis = EleveUtils.resoudreElevesConcernes(edtCalcule.elevesConcernes, eleves);
    const duTemps = EleveUtils.resoudreElevesConcernes(temps.elevesConcernes, eleves);
    return duTemps.some((id) => choisis.includes(id));
  }

  /**
   * Produit une entrée par absence récurrente des élèves choisis, de parité compatible.
   * @param edtCalcule Définition à calculer.
   * @param eleves Élèves de la classe.
   * @returns Créneaux calculés de source `absenceReguliere`.
   */
  private calculerAbsencesRegulieres(
    edtCalcule: EmploiDuTempsCalcule,
    eleves: Eleve[],
  ): CreneauCalcule[] {
    const ids = EleveUtils.resoudreElevesConcernes(edtCalcule.elevesConcernes, eleves);
    return eleves
      .filter((e) => ids.includes(e.id))
      .flatMap((eleve) =>
        eleve.absencesRecurrentes
          .filter((abs) =>
            this.emploiDuTempsService.verifierCompatibiliteFrequences(
              edtCalcule.frequence,
              abs.paritesSemaine,
            ),
          )
          .map((abs) => ({
            jour: abs.jour,
            heureDebut: abs.heureDebut,
            heureFin: abs.heureFin,
            source: 'absenceReguliere' as const,
            libelle: `${eleve.nom} ${eleve.prenom} — ${abs.libelle}`,
            eleveConcerneId: eleve.id,
          })),
      );
  }
}
