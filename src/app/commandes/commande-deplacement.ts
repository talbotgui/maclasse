/**
 * Commande de déplacement d'un élément d'un index vers un autre dans un tableau.
 * Implémente le pattern Commande pour supporter UNDO/REDO.
 */

import { Commande } from '../modeles/commande.modele';
import { DonneesApplication } from '../modeles/donnees-application.modele';

/**
 * Déplace l'élément à `indexSource` vers `indexCible`.
 * L'annulation inverse le déplacement.
 * @template T Type de l'élément — aucune contrainte d'identifiant nécessaire.
 */
export class CommandeDeplacement<T> implements Commande {
  /**
   * @param _accesseur Fonction retournant le tableau cible depuis les données.
   * @param _indexSource Index d'origine de l'élément à déplacer.
   * @param _indexCible Index de destination.
   */
  public constructor(
    private readonly _accesseur: (d: DonneesApplication) => T[],
    private readonly _indexSource: number,
    private readonly _indexCible: number,
  ) {}

  /**
   * Déplace l'élément de `_indexSource` vers `_indexCible`.
   * @param donnees État courant des données.
   * @returns Nouvel état avec l'élément déplacé.
   */
  public executer(donnees: DonneesApplication): DonneesApplication {
    const clone = structuredClone(donnees);
    const tableau = this._accesseur(clone);
    const [element] = tableau.splice(this._indexSource, 1);
    tableau.splice(this._indexCible, 0, element);
    return clone;
  }

  /**
   * Inverse le déplacement : ramène l'élément de `_indexCible` vers `_indexSource`.
   * @param donnees État courant des données.
   * @returns Nouvel état avec l'élément à sa position d'origine.
   */
  public annuler(donnees: DonneesApplication): DonneesApplication {
    const clone = structuredClone(donnees);
    const tableau = this._accesseur(clone);
    const [element] = tableau.splice(this._indexCible, 1);
    tableau.splice(this._indexSource, 0, element);
    return clone;
  }
}
