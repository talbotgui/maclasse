/**
 * Commande de remplacement d'un élément existant dans un tableau.
 * Implémente le pattern Commande pour supporter UNDO/REDO.
 */

import { Commande } from '../modeles/commande.modele';
import { DonneesApplication } from '../modeles/donnees-application.modele';

/**
 * Remplace `ancienneValeur` par `nouvelleValeur` dans un tableau ciblé.
 * Les deux valeurs partagent le même `id` (l'identifiant ne change jamais).
 * @template T Type de l'élément — doit exposer un champ `id : string`.
 */
export class CommandeModification<T extends { id: string }> implements Commande {
  /**
   * @param _accesseur Fonction retournant le tableau cible depuis les données.
   * @param _ancienneValeur Valeur à remplacer — clonée à l'annulation.
   * @param _nouvelleValeur Valeur de remplacement — clonée à l'exécution.
   */
  public constructor(
    private readonly _accesseur: (d: DonneesApplication) => T[],
    private readonly _ancienneValeur: T,
    private readonly _nouvelleValeur: T,
  ) {}

  /**
   * Remplace l'ancienne valeur par la nouvelle dans le tableau.
   * @param donnees État courant des données.
   * @returns Nouvel état avec l'élément modifié.
   */
  public executer(donnees: DonneesApplication): DonneesApplication {
    const clone = structuredClone(donnees);
    const tableau = this._accesseur(clone);
    const index = tableau.findIndex(e => e.id === this._ancienneValeur.id);
    if (index !== -1) {
      tableau[index] = structuredClone(this._nouvelleValeur);
    }
    return clone;
  }

  /**
   * Restaure l'ancienne valeur à la place de la nouvelle.
   * @param donnees État courant des données.
   * @returns Nouvel état avec l'élément restauré.
   */
  public annuler(donnees: DonneesApplication): DonneesApplication {
    const clone = structuredClone(donnees);
    const tableau = this._accesseur(clone);
    const index = tableau.findIndex(e => e.id === this._ancienneValeur.id);
    if (index !== -1) {
      tableau[index] = structuredClone(this._ancienneValeur);
    }
    return clone;
  }
}
