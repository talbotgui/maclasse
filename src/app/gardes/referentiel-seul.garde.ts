/**
 * Garde de route fonctionnelle : bloque l'accès aux écrans applicatifs autres que
 * `/competences` quand les données ont été chargées uniquement pour la consultation
 * du référentiel de compétences (bouton "Accéder aux programmes" de la popin de démarrage).
 */

import { inject } from '@angular/core';
import { CanActivateFn, RedirectCommand, Router } from '@angular/router';
import { ContexteService } from '../services/avecEtat/contexte.service';

/**
 * Autorise l'accès si le mode consultation référentiel seul n'est pas actif.
 * Redirige vers `/demarrage` dans le cas contraire.
 */
export const referentielSeulGarde: CanActivateFn = () => {
  const contexteService = inject(ContexteService);
  if (!contexteService.modeConsultationReferentiel()) {
    return true;
  }
  return new RedirectCommand(inject(Router).parseUrl('/demarrage'));
};
