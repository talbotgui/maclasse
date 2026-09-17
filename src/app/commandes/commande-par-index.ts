/**
 * Commande de remplacement scalaire.
 * Utilisée pour modifier des propriétés scalaires non-tableau.
 */

import { Commande } from '../modeles/commande.modele';
import { DonneesApplication } from '../modeles/donnees-application.modele';

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
