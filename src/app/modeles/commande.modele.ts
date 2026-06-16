/**
 * Modèle du pattern Commande utilisé pour UNDO/REDO.
 * Chaque commande est immutable et retourne une nouvelle copie des données.
 */

import { DonneesApplication } from './donnees-application.modele';

/**
 * Contrat du pattern Commande.
 * Toute implémentation doit produire une copie indépendante des données
 * (via `structuredClone`) sans muter l'argument reçu.
 */
export interface Commande {
  /**
   * Applique la commande et retourne le nouvel état des données.
   * @param donnees État courant des données de l'application.
   * @returns Nouvel état après exécution de la commande.
   */
  executer(donnees: DonneesApplication): DonneesApplication;

  /**
   * Annule la commande et retourne l'état précédant son exécution.
   * @param donnees État courant des données de l'application.
   * @returns Nouvel état après annulation de la commande.
   */
  annuler(donnees: DonneesApplication): DonneesApplication;
}
