import type { JourFerie } from '../modeles/referentiels.modele';
import type { JourSemaine } from '../modeles/emploi-du-temps.modele';

/**
 * Object Mother pour les données de test du composant mc-mini-calendrier.
 * Fournit des jours ouvrés et des jours fériés prêts à l'emploi.
 */
export class CalendrierMother {
  /** Retourne les cinq jours ouvrés standards (lundi à vendredi). */
  static joursOuvresComplets(): JourSemaine[] {
    return ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'];
  }

  /**
   * Construit un {@link JourFerie} pour la date ISO donnée.
   * @param date Date ISO du jour férié (ex. : '2026-06-03').
   * @param nom Libellé du jour férié (défaut : 'Jour férié').
   * @returns Un JourFerie utilisable comme entrée du composant.
   */
  static jourFerie(date: string, nom = 'Jour férié'): JourFerie {
    return { id: `ferie-${date}`, nom, date };
  }
}
