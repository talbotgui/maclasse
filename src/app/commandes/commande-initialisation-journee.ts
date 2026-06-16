/**
 * Commande d'ajout d'une journée dans le cahier journal.
 * Commande non générique — spécifique au domaine cahier journal.
 */

import { Commande } from '../modeles/commande.modele';
import { JourneeJournal } from '../modeles/cahier-journal.modele';
import { DonneesApplication } from '../modeles/donnees-application.modele';

/**
 * Ajoute une `JourneeJournal` dans `cahierJournal`.
 * L'annulation retire la journée en la retrouvant par sa date ISO.
 */
export class CommandeInitialisationJournee implements Commande {
  /**
   * @param _journee Journée à ajouter — clonée à l'exécution.
   */
  public constructor(private readonly _journee: JourneeJournal) {}

  /**
   * Ajoute la journée en fin de cahier journal.
   * @param donnees État courant des données.
   * @returns Nouvel état avec la journée ajoutée.
   */
  public executer(donnees: DonneesApplication): DonneesApplication {
    const clone = structuredClone(donnees);
    clone.cahierJournal.push(structuredClone(this._journee));
    return clone;
  }

  /**
   * Retire la journée du cahier journal en la retrouvant par sa date ISO.
   * @param donnees État courant des données.
   * @returns Nouvel état sans la journée.
   */
  public annuler(donnees: DonneesApplication): DonneesApplication {
    const clone = structuredClone(donnees);
    const index = clone.cahierJournal.findIndex(j => j.date === this._journee.date);
    if (index !== -1) {
      clone.cahierJournal.splice(index, 1);
    }
    return clone;
  }
}
