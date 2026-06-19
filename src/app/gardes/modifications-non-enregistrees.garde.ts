/**
 * Garde fonctionnelle protégeant la navigation sortante quand un composant
 * signale des modifications non enregistrées.
 */

import { CanDeactivateFn } from '@angular/router';

/**
 * Interface que doivent implémenter les composants protégés par cette garde.
 * Le composant gère lui-même l'affichage d'une popin de confirmation
 * et résout la promesse selon le choix de l'utilisateur.
 */
export interface AvecNavigationGardee {
  /** Demande confirmation avant navigation si des modifications non enregistrées existent. */
  confirmerNavigation(): Promise<boolean>;
}

/**
 * Garde fonctionnelle `CanDeactivateFn` : délègue la décision au composant via `confirmerNavigation()`.
 * Retourne `true` immédiatement si le composant n'a pas de modifications en attente.
 */
export const modificationsNonEnregistreesGarde: CanDeactivateFn<AvecNavigationGardee> =
  (composant) => composant.confirmerNavigation();
