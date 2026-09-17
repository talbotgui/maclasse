/**
 * Service métier gérant les emplois du temps et leurs créneaux.
 * Toute mutation transite par `DonneesService.executer()`.
 */

import { Injectable, inject } from '@angular/core';
import { EmploiDuTemps, CreneauEdt, FrequenceSemaine } from '../../modeles/emploi-du-temps.modele';
import { AbsencePertinente } from '../../modeles/eleve.modele';
import { CommandeCreation } from '../../commandes/commande-creation';
import { CommandeModification } from '../../commandes/commande-modification';
import { CommandeSuppression } from '../../commandes/commande-suppression';
import { DonneesService } from '../avecEtat/donnees.service';
import { DateUtils } from '../../utilitaires/date.utils';
import { LIBELLES } from '../../libelles';

/**
 * Service sans état exposant le CRUD des emplois du temps, de leurs créneaux,
 * ainsi que la détection de chevauchements et de conflits avec les absences récurrentes.
 */
@Injectable({ providedIn: 'root' })
export class EmploiDuTempsService {
  /** Accès aux données de l'application et soumission des commandes. */
  private readonly donneesService = inject(DonneesService);

  /**
   * Crée un emploi du temps et l'ajoute à la liste.
   * @param edt Emploi du temps à créer (doit posséder un `id` unique).
   */
  public creerEdt(edt: EmploiDuTemps): void {
    this.donneesService.executer(
      new CommandeCreation((d) => d.emploisDuTemps, edt, LIBELLES.commandes.ajoutEdt),
    );
  }

  /**
   * Modifie un emploi du temps existant retrouvé par son `id`.
   * Sans effet si l'`id` n'existe pas ou si aucune donnée n'est chargée.
   * @param edt Nouvelle valeur de l'EDT (même `id`).
   */
  public modifierEdt(edt: EmploiDuTemps): void {
    const donnees = this.donneesService.donnees();
    if (!donnees) return;
    const ancien = donnees.emploisDuTemps.find((e) => e.id === edt.id);
    if (!ancien) return;
    this.donneesService.executer(
      new CommandeModification(
        (d) => d.emploisDuTemps,
        ancien,
        edt,
        LIBELLES.commandes.modificationEdt,
      ),
    );
  }

  /**
   * Supprime un emploi du temps par son identifiant (avec tous ses créneaux).
   * Sans effet si l'`id` n'existe pas ou si aucune donnée n'est chargée.
   * @param id UUID de l'EDT à supprimer.
   */
  public supprimerEdt(id: string): void {
    const donnees = this.donneesService.donnees();
    if (!donnees) return;
    const index = donnees.emploisDuTemps.findIndex((e) => e.id === id);
    if (index === -1) return;
    this.donneesService.executer(
      new CommandeSuppression(
        (d) => d.emploisDuTemps,
        donnees.emploisDuTemps[index],
        index,
        LIBELLES.commandes.suppressionEdt,
      ),
    );
  }

  /**
   * Retourne un emploi du temps par son identifiant, ou `undefined` s'il n'existe pas.
   * @param id UUID de l'EDT.
   */
  public obtenirEdt(id: string): EmploiDuTemps | undefined {
    return this.donneesService.donnees()?.emploisDuTemps.find((e) => e.id === id);
  }

  /**
   * Ajoute un créneau à un EDT existant.
   * Le créneau est ajouté en fin de liste — la grille est triée à l'affichage par l'écran.
   * Sans effet si l'EDT n'existe pas ou si aucune donnée n'est chargée.
   * @param edtId UUID de l'EDT.
   * @param creneau Créneau à ajouter.
   */
  public ajouterCreneau(edtId: string, creneau: CreneauEdt): void {
    const donnees = this.donneesService.donnees();
    if (!donnees) return;
    const ancien = donnees.emploisDuTemps.find((e) => e.id === edtId);
    if (!ancien) return;
    const nouveau: EmploiDuTemps = { ...ancien, creneaux: [...ancien.creneaux, creneau] };
    this.donneesService.executer(
      new CommandeModification(
        (d) => d.emploisDuTemps,
        ancien,
        nouveau,
        LIBELLES.commandes.ajoutCreneau,
      ),
    );
  }

  /**
   * Modifie un créneau existant (retrouvé par son `id`) dans un EDT.
   * Sans effet si l'EDT ou le créneau n'existe pas.
   * @param edtId UUID de l'EDT.
   * @param creneau Nouvelle valeur du créneau (même `id`).
   */
  public modifierCreneau(edtId: string, creneau: CreneauEdt): void {
    const donnees = this.donneesService.donnees();
    if (!donnees) return;
    const ancien = donnees.emploisDuTemps.find((e) => e.id === edtId);
    if (!ancien) return;
    const creneaux = ancien.creneaux.map((c) => (c.id === creneau.id ? creneau : c));
    const nouveau: EmploiDuTemps = { ...ancien, creneaux };
    this.donneesService.executer(
      new CommandeModification(
        (d) => d.emploisDuTemps,
        ancien,
        nouveau,
        LIBELLES.commandes.modificationCreneau,
      ),
    );
  }

  /**
   * Supprime un créneau d'un EDT.
   * Sans effet si l'EDT ou le créneau n'existe pas.
   * @param edtId UUID de l'EDT.
   * @param creneauId UUID du créneau à supprimer.
   */
  public supprimerCreneau(edtId: string, creneauId: string): void {
    const donnees = this.donneesService.donnees();
    if (!donnees) return;
    const ancien = donnees.emploisDuTemps.find((e) => e.id === edtId);
    if (!ancien) return;
    const nouveau: EmploiDuTemps = {
      ...ancien,
      creneaux: ancien.creneaux.filter((c) => c.id !== creneauId),
    };
    this.donneesService.executer(
      new CommandeModification(
        (d) => d.emploisDuTemps,
        ancien,
        nouveau,
        LIBELLES.commandes.suppressionCreneau,
      ),
    );
  }

  /**
   * Retourne `true` si l'EDT fourni a au moins un créneau en conflit avec un autre EDT.
   * @param edt EDT à vérifier (peut ne pas encore être persisté).
   * @returns `true` si un chevauchement est détecté avec un autre EDT.
   */
  public validerChevauchement(edt: EmploiDuTemps): boolean {
    return this.obtenirEdtsEnConflit(edt).length > 0;
  }

  /**
   * Retourne les EDT dont au moins un créneau est en conflit avec l'EDT fourni.
   * Un conflit nécessite trois conditions simultanées :
   * 1. Fréquences compatibles (peuvent s'appliquer la même semaine).
   * 2. Plages de dates qui se chevauchent (null = sans limite).
   * 3. Au moins un créneau sur le même jour et le même horaire.
   * @param edt EDT à vérifier (peut ne pas encore être persisté).
   * @returns Liste des EDT en conflit, dans leur ordre d'apparition dans les données.
   */
  public obtenirEdtsEnConflit(edt: EmploiDuTemps): EmploiDuTemps[] {
    const autresEdts =
      this.donneesService.donnees()?.emploisDuTemps.filter((e) => e.id !== edt.id) ?? [];
    const conflits: EmploiDuTemps[] = [];
    for (const autre of autresEdts) {
      if (!this.verifierCompatibiliteFrequences(edt.frequence, autre.frequence)) continue;
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
            conflits.push(autre);
            break;
          }
        }
        if (conflits.at(-1) === autre) break;
      }
    }
    return conflits;
  }

  /**
   * Calcule les conflits entre un créneau et les absences récurrentes des élèves concernés.
   * Un conflit n'est retenu que si la parité de semaine de l'EDT et celle de l'absence
   * sont compatibles (`verifierCompatibiliteFrequences`).
   * @param creneauId UUID du créneau à analyser (cherché dans tous les EDTs).
   * @returns Liste de libellés au format `"NOM Prénom — libellé d'absence"`.
   */
  public calculerConflitsAbsences(creneauId: string): string[] {
    const donnees = this.donneesService.donnees();
    if (!donnees) return [];

    let creneau: CreneauEdt | undefined;
    let edtTrouve: EmploiDuTemps | undefined;
    for (const edt of donnees.emploisDuTemps) {
      creneau = edt.creneaux.find((c) => c.id === creneauId);
      if (creneau) {
        edtTrouve = edt;
        break;
      }
    }
    if (!creneau || !edtTrouve) return [];

    const creneauTrouve = creneau;
    const tousEleves = donnees.classe.eleves;
    let elevesIds: string[];

    if (!creneauTrouve.elevesConcernes || creneauTrouve.elevesConcernes.type === 'classe') {
      elevesIds = tousEleves.map((e) => e.id);
    } else if (creneauTrouve.elevesConcernes.type === 'groupes') {
      const groupes = creneauTrouve.elevesConcernes.groupes;
      elevesIds = tousEleves
        .filter((e) => e.groupes.some((g) => groupes.includes(g)))
        .map((e) => e.id);
    } else {
      elevesIds = creneauTrouve.elevesConcernes.elevesIds;
    }

    const conflits: string[] = [];
    for (const eleveId of elevesIds) {
      const eleve = tousEleves.find((e) => e.id === eleveId);
      if (!eleve) continue;
      for (const abs of eleve.absencesRecurrentes) {
        if (
          abs.jour === creneauTrouve.jour &&
          this.verifierCompatibiliteFrequences(edtTrouve.frequence, abs.paritesSemaine) &&
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
   * Retourne les absences récurrentes des élèves pertinentes pour l'EDT fourni :
   * absences dont le jour est utilisé par au moins un créneau de l'EDT et dont la parité
   * de semaine est compatible avec la fréquence de l'EDT.
   * @param edt EDT pour lequel calculer les absences pertinentes.
   * @returns Paires élève/absence, triées NOM Prénom, vide si aucune donnée chargée.
   */
  public obtenirAbsencesPertinentes(edt: EmploiDuTemps): AbsencePertinente[] {
    const donnees = this.donneesService.donnees();
    if (!donnees) return [];

    const joursUtilises = new Set(edt.creneaux.map((c) => c.jour));
    const eleves = [...donnees.classe.eleves].sort((a, b) =>
      `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`, 'fr'),
    );

    const resultats: AbsencePertinente[] = [];
    for (const eleve of eleves) {
      for (const absence of eleve.absencesRecurrentes) {
        if (
          joursUtilises.has(absence.jour) &&
          this.verifierCompatibiliteFrequences(edt.frequence, absence.paritesSemaine)
        ) {
          resultats.push({ eleve, absence });
        }
      }
    }
    return resultats;
  }

  /**
   * Détermine si deux fréquences peuvent s'appliquer sur la même semaine.
   * `paire` et `impaire` ne se chevauchent jamais.
   * @param f1 Fréquence du premier EDT.
   * @param f2 Fréquence du second EDT.
   * @returns `true` si les deux fréquences peuvent coïncider sur une même semaine.
   */
  private verifierCompatibiliteFrequences(f1: FrequenceSemaine, f2: FrequenceSemaine): boolean {
    if (f1 === 'lesDeux' || f2 === 'lesDeux') return true;
    return f1 === f2;
  }
}
