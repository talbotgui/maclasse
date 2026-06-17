/**
 * Service métier gérant les emplois du temps et leurs créneaux.
 * Toute mutation transite par `DonneesService.executer()`.
 */

import { Injectable, inject } from '@angular/core';
import { EmploiDuTemps, CreneauEdt, FrequenceSemaine } from '../../modeles/emploi-du-temps.modele';
import { CommandeCreation } from '../../commandes/commande-creation';
import { CommandeModification } from '../../commandes/commande-modification';
import { CommandeSuppression } from '../../commandes/commande-suppression';
import { DonneesService } from '../avecEtat/donnees.service';
import { DateUtils } from '../../utilitaires/date.utils';

/**
 * Service sans état exposant le CRUD des emplois du temps, de leurs créneaux,
 * ainsi que la détection de chevauchements et de conflits avec les absences récurrentes.
 */
@Injectable({ providedIn: 'root' })
export class EmploiDuTempsService {
  /** Accès aux données de l'application et soumission des commandes. */
  private readonly _donneesService = inject(DonneesService);

  // ── CRUD EDT ──────────────────────────────────────────────────────────────

  /**
   * Crée un emploi du temps et l'ajoute à la liste.
   * @param edt Emploi du temps à créer (doit posséder un `id` unique).
   */
  public creerEdt(edt: EmploiDuTemps): void {
    this._donneesService.executer(new CommandeCreation(d => d.emploisDuTemps, edt));
  }

  /**
   * Modifie un emploi du temps existant retrouvé par son `id`.
   * Sans effet si l'`id` n'existe pas ou si aucune donnée n'est chargée.
   * @param edt Nouvelle valeur de l'EDT (même `id`).
   */
  public modifierEdt(edt: EmploiDuTemps): void {
    const donnees = this._donneesService.donnees();
    if (!donnees) return;
    const ancien = donnees.emploisDuTemps.find(e => e.id === edt.id);
    if (!ancien) return;
    this._donneesService.executer(new CommandeModification(d => d.emploisDuTemps, ancien, edt));
  }

  /**
   * Supprime un emploi du temps par son identifiant (avec tous ses créneaux).
   * Sans effet si l'`id` n'existe pas ou si aucune donnée n'est chargée.
   * @param id UUID de l'EDT à supprimer.
   */
  public supprimerEdt(id: string): void {
    const donnees = this._donneesService.donnees();
    if (!donnees) return;
    const index = donnees.emploisDuTemps.findIndex(e => e.id === id);
    if (index === -1) return;
    this._donneesService.executer(
      new CommandeSuppression(d => d.emploisDuTemps, donnees.emploisDuTemps[index], index),
    );
  }

  /**
   * Retourne un emploi du temps par son identifiant, ou `undefined` s'il n'existe pas.
   * @param id UUID de l'EDT.
   */
  public obtenirEdt(id: string): EmploiDuTemps | undefined {
    return this._donneesService.donnees()?.emploisDuTemps.find(e => e.id === id);
  }

  // ── CRUD créneaux ─────────────────────────────────────────────────────────

  /**
   * Ajoute un créneau à un EDT existant.
   * Le créneau est ajouté en fin de liste — la grille est triée à l'affichage par l'écran.
   * Sans effet si l'EDT n'existe pas ou si aucune donnée n'est chargée.
   * @param edtId UUID de l'EDT.
   * @param creneau Créneau à ajouter.
   */
  public ajouterCreneau(edtId: string, creneau: CreneauEdt): void {
    const donnees = this._donneesService.donnees();
    if (!donnees) return;
    const ancien = donnees.emploisDuTemps.find(e => e.id === edtId);
    if (!ancien) return;
    const nouveau: EmploiDuTemps = { ...ancien, creneaux: [...ancien.creneaux, creneau] };
    this._donneesService.executer(new CommandeModification(d => d.emploisDuTemps, ancien, nouveau));
  }

  /**
   * Modifie un créneau existant (retrouvé par son `id`) dans un EDT.
   * Sans effet si l'EDT ou le créneau n'existe pas.
   * @param edtId UUID de l'EDT.
   * @param creneau Nouvelle valeur du créneau (même `id`).
   */
  public modifierCreneau(edtId: string, creneau: CreneauEdt): void {
    const donnees = this._donneesService.donnees();
    if (!donnees) return;
    const ancien = donnees.emploisDuTemps.find(e => e.id === edtId);
    if (!ancien) return;
    const creneaux = ancien.creneaux.map(c => (c.id === creneau.id ? creneau : c));
    const nouveau: EmploiDuTemps = { ...ancien, creneaux };
    this._donneesService.executer(new CommandeModification(d => d.emploisDuTemps, ancien, nouveau));
  }

  /**
   * Supprime un créneau d'un EDT.
   * Sans effet si l'EDT ou le créneau n'existe pas.
   * @param edtId UUID de l'EDT.
   * @param creneauId UUID du créneau à supprimer.
   */
  public supprimerCreneau(edtId: string, creneauId: string): void {
    const donnees = this._donneesService.donnees();
    if (!donnees) return;
    const ancien = donnees.emploisDuTemps.find(e => e.id === edtId);
    if (!ancien) return;
    const nouveau: EmploiDuTemps = {
      ...ancien,
      creneaux: ancien.creneaux.filter(c => c.id !== creneauId),
    };
    this._donneesService.executer(new CommandeModification(d => d.emploisDuTemps, ancien, nouveau));
  }

  // ── Détection de chevauchements ───────────────────────────────────────────

  /**
   * Retourne `true` si l'EDT fourni a au moins un créneau en conflit avec un autre EDT.
   * Un conflit nécessite trois conditions simultanées :
   * 1. Fréquences compatibles (peuvent s'appliquer la même semaine).
   * 2. Plages de dates qui se chevauchent (null = sans limite).
   * 3. Au moins un créneau sur le même jour et le même horaire.
   * @param edt EDT à vérifier (peut ne pas encore être persisté).
   * @returns `true` si un chevauchement est détecté avec un autre EDT.
   */
  public validerChevauchement(edt: EmploiDuTemps): boolean {
    const autresEdts = this._donneesService.donnees()?.emploisDuTemps.filter(e => e.id !== edt.id) ?? [];
    for (const autre of autresEdts) {
      if (!this._frequencesCompatibles(edt.frequence, autre.frequence)) continue;
      const debut1 = edt.dateDebut ?? '0000-01-01';
      const fin1 = edt.dateFin ?? '9999-12-31';
      const debut2 = autre.dateDebut ?? '0000-01-01';
      const fin2 = autre.dateFin ?? '9999-12-31';
      if (debut1 > fin2 || debut2 > fin1) continue;
      for (const c1 of edt.creneaux) {
        for (const c2 of autre.creneaux) {
          if (
            c1.jour === c2.jour &&
            DateUtils.chevauchementHoraire(c1.heureDebut, c1.heureFin, c2.heureDebut, c2.heureFin)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // ── Conflits avec absences récurrentes ────────────────────────────────────

  /**
   * Calcule les conflits entre un créneau et les absences récurrentes des élèves concernés.
   * La parité de semaine n'est pas prise en compte — tout chevauchement horaire sur le même
   * jour est signalé, quelle que soit la parité de l'absence.
   * @param creneauId UUID du créneau à analyser (cherché dans tous les EDTs).
   * @returns Liste de libellés au format `"NOM Prénom — libellé d'absence"`.
   */
  public calculerConflitsAbsences(creneauId: string): string[] {
    const donnees = this._donneesService.donnees();
    if (!donnees) return [];

    let creneau: CreneauEdt | undefined;
    for (const edt of donnees.emploisDuTemps) {
      creneau = edt.creneaux.find(c => c.id === creneauId);
      if (creneau) break;
    }
    if (!creneau) return [];

    const creneauTrouve = creneau;
    const tousEleves = donnees.classe.eleves;
    let elevesIds: string[];

    if (!creneauTrouve.elevesConcernes || creneauTrouve.elevesConcernes.type === 'classe') {
      elevesIds = tousEleves.map(e => e.id);
    } else if (creneauTrouve.elevesConcernes.type === 'groupes') {
      const groupes = creneauTrouve.elevesConcernes.groupes;
      elevesIds = tousEleves
        .filter(e => e.groupes.some(g => groupes.includes(g)))
        .map(e => e.id);
    } else {
      elevesIds = creneauTrouve.elevesConcernes.elevesIds;
    }

    const conflits: string[] = [];
    for (const eleveId of elevesIds) {
      const eleve = tousEleves.find(e => e.id === eleveId);
      if (!eleve) continue;
      for (const abs of eleve.absencesRecurrentes) {
        if (
          abs.jour === creneauTrouve.jour &&
          DateUtils.chevauchementHoraire(
            abs.heureDebut,
            abs.heureFin,
            creneauTrouve.heureDebut,
            creneauTrouve.heureFin,
          )
        ) {
          conflits.push(`${eleve.nom} ${eleve.prenom} — ${abs.libelle}`);
        }
      }
    }
    return conflits;
  }

  /**
   * Détermine si deux fréquences peuvent s'appliquer sur la même semaine.
   * `paire` et `impaire` ne se chevauchent jamais.
   * @param f1 Fréquence du premier EDT.
   * @param f2 Fréquence du second EDT.
   * @returns `true` si les deux fréquences peuvent coïncider sur une même semaine.
   */
  private _frequencesCompatibles(f1: FrequenceSemaine, f2: FrequenceSemaine): boolean {
    if (f1 === 'lesDeux' || f2 === 'lesDeux') return true;
    return f1 === f2;
  }
}
