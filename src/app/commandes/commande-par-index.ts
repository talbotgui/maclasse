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
   * @param accesseur Fonction retournant le tableau cible.
   * @param element Élément supprimé — conservé pour l'annulation.
   * @param index Index de l'élément au moment de la suppression.
   * @param libelle Description courte affichée dans le tooltip UNDO/REDO.
   */
  public constructor(
    private readonly accesseur: (d: DonneesApplication) => T[],
    private readonly element: T,
    private readonly index: number,
    public readonly libelle: string,
  ) {}

  /**
   * Supprime l'élément situé à `index`.
   * @param donnees État courant des données.
   * @returns Nouvel état sans l'élément.
   */
  public executer(donnees: DonneesApplication): DonneesApplication {
    const clone = structuredClone(donnees);
    this.accesseur(clone).splice(this.index, 1);
    return clone;
  }

  /**
   * Réinsère l'élément à son index d'origine.
   * @param donnees État courant des données.
   * @returns Nouvel état avec l'élément restauré.
   */
  public annuler(donnees: DonneesApplication): DonneesApplication {
    const clone = structuredClone(donnees);
    this.accesseur(clone).splice(this.index, 0, structuredClone(this.element));
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
   * @param ecrire Fonction d'écriture dans le clone des données.
   * @param ancienneValeur Valeur à restaurer lors de l'annulation.
   * @param nouvelleValeur Valeur à écrire lors de l'exécution.
   * @param libelle Description courte affichée dans le tooltip UNDO/REDO.
   */
  public constructor(
    private readonly ecrire: (d: DonneesApplication, valeur: T) => void,
    private readonly ancienneValeur: T,
    private readonly nouvelleValeur: T,
    public readonly libelle: string,
  ) {}

  /**
   * Écrit `nouvelleValeur`.
   * @param donnees État courant des données.
   * @returns Nouvel état avec la valeur remplacée.
   */
  public executer(donnees: DonneesApplication): DonneesApplication {
    const clone = structuredClone(donnees);
    this.ecrire(clone, structuredClone(this.nouvelleValeur));
    return clone;
  }

  /**
   * Restaure `ancienneValeur`.
   * @param donnees État courant des données.
   * @returns Nouvel état avec la valeur d'origine.
   */
  public annuler(donnees: DonneesApplication): DonneesApplication {
    const clone = structuredClone(donnees);
    this.ecrire(clone, structuredClone(this.ancienneValeur));
    return clone;
  }
}
