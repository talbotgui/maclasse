/**
 * Service métier gérant les opérations sur les élèves.
 * Toute mutation transite par `DonneesService.executer()`.
 */

import { Injectable, inject } from '@angular/core';
import { Eleve } from '../../modeles/eleve.modele';
import { JourSemaine } from '../../modeles/emploi-du-temps.modele';
import { CommandeCreation } from '../../commandes/commande-creation';
import { CommandeModification } from '../../commandes/commande-modification';
import { CommandeSuppression } from '../../commandes/commande-suppression';
import { DonneesService } from '../avecEtat/donnees.service';
import { DateUtils } from '../../utilitaires/date.utils';

/**
 * Service sans état exposant le CRUD des élèves et le calcul des conflits d'absences.
 */
@Injectable({ providedIn: 'root' })
export class EleveService {
  /** Accès aux données de l'application et soumission des commandes. */
  private readonly _donneesService = inject(DonneesService);

  /**
   * Crée un élève et l'ajoute à la classe.
   * @param eleve Élève à ajouter (doit posséder un `id` unique).
   */
  public creerEleve(eleve: Eleve): void {
    this._donneesService.executer(new CommandeCreation(d => d.classe.eleves, eleve));
  }

  /**
   * Modifie un élève existant retrouvé par son `id`.
   * Sans effet si l'`id` n'existe pas ou si aucune donnée n'est chargée.
   * @param eleve Nouvelle valeur de l'élève (même `id`).
   */
  public modifierEleve(eleve: Eleve): void {
    const donnees = this._donneesService.donnees();
    if (!donnees) return;
    const ancien = donnees.classe.eleves.find(e => e.id === eleve.id);
    if (!ancien) return;
    this._donneesService.executer(
      new CommandeModification(d => d.classe.eleves, ancien, eleve),
    );
  }

  /**
   * Supprime un élève retrouvé par son identifiant.
   * Sans effet si l'`id` n'existe pas ou si aucune donnée n'est chargée.
   * @param id UUID de l'élève à supprimer.
   */
  public supprimerEleve(id: string): void {
    const donnees = this._donneesService.donnees();
    if (!donnees) return;
    const index = donnees.classe.eleves.findIndex(e => e.id === id);
    if (index === -1) return;
    this._donneesService.executer(
      new CommandeSuppression(d => d.classe.eleves, donnees.classe.eleves[index], index),
    );
  }

  /**
   * Retourne un élève par son identifiant, ou `undefined` s'il n'existe pas.
   * @param id UUID de l'élève.
   */
  public obtenirEleve(id: string): Eleve | undefined {
    return this._donneesService.donnees()?.classe.eleves.find(e => e.id === id);
  }

  /**
   * Retourne la liste des élèves triée NOM Prénom, filtrée si un terme est fourni.
   * La recherche est insensible à la casse et aux accents.
   * @param terme Terme de recherche (vide = liste complète triée).
   * @returns Élèves correspondants, triés alphabétiquement.
   */
  public rechercherEleves(terme: string): Eleve[] {
    const eleves = this._donneesService.donnees()?.classe.eleves ?? [];
    const tries = [...eleves].sort((a, b) =>
      `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`, 'fr'),
    );
    if (!terme.trim()) return tries;
    const t = this._normaliser(terme);
    return tries.filter(
      e =>
        this._normaliser(e.nom).includes(t) ||
        this._normaliser(e.prenom).includes(t) ||
        this._normaliser(`${e.nom} ${e.prenom}`).includes(t) ||
        this._normaliser(`${e.prenom} ${e.nom}`).includes(t),
    );
  }

  /**
   * Calcule les conflits entre un créneau horaire et les absences récurrentes d'un élève.
   * Retourne les libellés des absences récurrentes qui chevauchent le créneau sur le jour donné.
   * La parité de la semaine n'est pas vérifiée ici — c'est la responsabilité de l'appelant.
   * @param eleveId UUID de l'élève.
   * @param heureDebut Heure de début du créneau (`HH:MM`).
   * @param heureFin Heure de fin du créneau (`HH:MM`).
   * @param jour Jour de la semaine.
   * @returns Liste des libellés d'absences en conflit.
   */
  public calculerConflitsAbsences(
    eleveId: string,
    heureDebut: string,
    heureFin: string,
    jour: JourSemaine,
  ): string[] {
    const donnees = this._donneesService.donnees();
    if (!donnees) return [];
    const eleve = donnees.classe.eleves.find(e => e.id === eleveId);
    if (!eleve) return [];
    return eleve.absencesRecurrentes
      .filter(
        a =>
          a.jour === jour &&
          DateUtils.chevauchementHoraire(a.heureDebut, a.heureFin, heureDebut, heureFin),
      )
      .map(a => a.libelle);
  }

  /**
   * Normalise un texte pour la recherche insensible à la casse et aux accents.
   * @param texte Texte à normaliser.
   * @returns Texte en minuscules sans diacritiques.
   */
  private _normaliser(texte: string): string {
    return texte
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }
}
