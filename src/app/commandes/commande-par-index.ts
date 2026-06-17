/**
 * Commandes indexées pour suppression positionnelle et remplacement scalaire.
 * Utilisées pour les éléments sans contrainte d'`id` structurel
 * et pour modifier des propriétés scalaires non-tableau.
 */

import { Commande } from '../modeles/commande.modele';
import { DonneesApplication } from '../modeles/donnees-application.modele';

/**
 * Supprime un élément à un index connu, sans contrainte de champ `id`.
 * @template T Type de l'élément.
 */
export class CommandeSuppressionParIndex<T> implements Commande {
  /**
   * @param _accesseur Fonction retournant le tableau cible.
   * @param _element Élément supprimé — conservé pour l'annulation.
   * @param _index Index de l'élément au moment de la suppression.
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

/**
 * Remplace une valeur scalaire (non tableau) dans les données.
 * Utilisé pour modifier des objets uniques : `enseignant`, `configEmploiDuTemps`, `configuration`…
 * @template T Type de la valeur remplacée.
 */
export class CommandeRemplacement<T> implements Commande {
  /**
   * @param _ecrire Fonction d'écriture dans le clone des données.
   * @param _ancienneValeur Valeur à restaurer lors de l'annulation.
   * @param _nouvelleValeur Valeur à écrire lors de l'exécution.
   */
  public constructor(
    private readonly _ecrire: (d: DonneesApplication, valeur: T) => void,
    private readonly _ancienneValeur: T,
    private readonly _nouvelleValeur: T,
  ) {}

  /**
   * Écrit `_nouvelleValeur`.
   * @param donnees État courant des données.
   * @returns Nouvel état avec la valeur remplacée.
   */
  public executer(donnees: DonneesApplication): DonneesApplication {
    const clone = structuredClone(donnees);
    this._ecrire(clone, structuredClone(this._nouvelleValeur));
    return clone;
  }

  /**
   * Restaure `_ancienneValeur`.
   * @param donnees État courant des données.
   * @returns Nouvel état avec la valeur d'origine.
   */
  public annuler(donnees: DonneesApplication): DonneesApplication {
    const clone = structuredClone(donnees);
    this._ecrire(clone, structuredClone(this._ancienneValeur));
    return clone;
  }
}
