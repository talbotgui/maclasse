/**
 * Garde de route fonctionnelle : protège les écrans nécessitant des données chargées.
 * Reportée de l'étape 1 — dépend de `DonneesService`.
 */

import { inject } from '@angular/core';
import { CanActivateFn, RedirectCommand, Router } from '@angular/router';
import { DonneesService } from '../services/avecEtat/donnees.service';

/**
 * Autorise l'accès si `DonneesService.donnees()` est non nul.
 * Redirige vers `/demarrage` dans le cas contraire.
 */
export const donneesChargeesGarde: CanActivateFn = () => {
  const donneesService = inject(DonneesService);
  if (donneesService.donnees() !== null) {
    return true;
  }
  return new RedirectCommand(inject(Router).parseUrl('/demarrage'));
};
