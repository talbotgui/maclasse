/**
 * Commande d'ajout d'un élément dans un tableau de `DonneesApplication`.
 * Implémente le pattern Commande pour supporter UNDO/REDO.
 */

import { Commande } from '../modeles/commande.modele';
import { DonneesApplication } from '../modeles/donnees-application.modele';

/**
 * Ajoute un élément à un tableau ciblé via un accesseur.
 * L'annulation retrouve l'élément par son champ `id` et le supprime.
 * @template T Type de l'élément — doit exposer un champ `id : string`.
 */
export class CommandeCreation<T extends { id: string }> implements Commande {
  /**
   * @param accesseur Fonction retournant le tableau cible depuis les données (par référence dans le clone).
   * @param element Élément à ajouter — cloné à l'exécution.
   */
  public constructor(
    private readonly accesseur: (d: DonneesApplication) => T[],
    private readonly element: T,
  ) {}

  /**
   * Ajoute l'élément en fin de tableau.
   * @param donnees État courant des données.
   * @returns Nouvel état avec l'élément ajouté.
   */
  public executer(donnees: DonneesApplication): DonneesApplication {
    const clone = structuredClone(donnees);
    this.accesseur(clone).push(structuredClone(this.element));
    return clone;
  }

  /**
   * Retire l'élément du tableau en le retrouvant par son `id`.
   * @param donnees État courant des données.
   * @returns Nouvel état sans l'élément.
   */
  public annuler(donnees: DonneesApplication): DonneesApplication {
    const clone = structuredClone(donnees);
    const tableau = this.accesseur(clone);
    const index = tableau.findIndex(e => e.id === this.element.id);
    if (index !== -1) {
      tableau.splice(index, 1);
    }
    return clone;
  }
}
