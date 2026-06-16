/**
 * Commande de suppression d'un élément à un index connu dans un tableau.
 * Implémente le pattern Commande pour supporter UNDO/REDO.
 */

import { Commande } from '../modeles/commande.modele';
import { DonneesApplication } from '../modeles/donnees-application.modele';

/**
 * Supprime un élément à l'index donné.
 * L'annulation réinsère l'élément à ce même index.
 * @template T Type de l'élément — doit exposer un champ `id : string`.
 */
export class CommandeSuppression<T extends { id: string }> implements Commande {
  /**
   * @param _accesseur Fonction retournant le tableau cible depuis les données.
   * @param _element Élément à supprimer — conservé pour l'annulation.
   * @param _index Index de l'élément dans le tableau au moment de la suppression.
   */
  public constructor(
    private readonly _accesseur: (d: DonneesApplication) => T[],
    private readonly _element: T,
    private readonly _index: number,
  ) {}

  /**
   * Supprime l'élément situé à `_index`.
   * @param donnees État courant des données.
   * @returns Nouvel état sans l'élément.
   */
  public executer(donnees: DonneesApplication): DonneesApplication {
    const clone = structuredClone(donnees);
    this._accesseur(clone).splice(this._index, 1);
    return clone;
  }

  /**
   * Réinsère l'élément à son index d'origine.
   * @param donnees État courant des données.
   * @returns Nouvel état avec l'élément restauré.
   */
  public annuler(donnees: DonneesApplication): DonneesApplication {
    const clone = structuredClone(donnees);
    this._accesseur(clone).splice(this._index, 0, structuredClone(this._element));
    return clone;
  }
}
