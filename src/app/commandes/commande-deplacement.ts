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
   * @param accesseur Fonction retournant le tableau cible depuis les données.
   * @param indexSource Index d'origine de l'élément à déplacer.
   * @param indexCible Index de destination.
   * @param libelle Description courte affichée dans le tooltip UNDO/REDO.
   */
  public constructor(
    private readonly accesseur: (d: DonneesApplication) => T[],
    private readonly indexSource: number,
    private readonly indexCible: number,
    public readonly libelle: string,
  ) {}

  /**
   * Déplace l'élément de `indexSource` vers `indexCible`.
   * @param donnees État courant des données.
   * @returns Nouvel état avec l'élément déplacé.
   */
  public executer(donnees: DonneesApplication): DonneesApplication {
    const clone = structuredClone(donnees);
    const tableau = this.accesseur(clone);
    const [element] = tableau.splice(this.indexSource, 1);
    tableau.splice(this.indexCible, 0, element);
    return clone;
  }

  /**
   * Inverse le déplacement : ramène l'élément de `indexCible` vers `indexSource`.
   * @param donnees État courant des données.
   * @returns Nouvel état avec l'élément à sa position d'origine.
   */
  public annuler(donnees: DonneesApplication): DonneesApplication {
    const clone = structuredClone(donnees);
    const tableau = this.accesseur(clone);
    const [element] = tableau.splice(this.indexCible, 1);
    tableau.splice(this.indexSource, 0, element);
    return clone;
  }
}
