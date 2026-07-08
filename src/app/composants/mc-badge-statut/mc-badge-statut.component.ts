import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { InputSignal } from '@angular/core';
import { ComposantBase } from '../../composant-base';
import type { StatutAcquisition } from '../../modeles/referentiels.modele';

/**
 * Composant d'affichage d'un statut d'acquisition.
 * Affiche le glyphe du statut dans un badge coloré dont les couleurs proviennent des données.
 * Si `statut` est `null`, affiche un tiret neutre.
 */
@Component({
  selector: 'mc-badge-statut',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mc-badge-statut.component.html',
  styleUrl: './mc-badge-statut.component.scss',
})
export class McBadgeStatutComponent extends ComposantBase {
  /**
   * Statut d'acquisition à afficher.
   * Quand `null`, le badge affiche un tiret neutre sans couleur.
   */
  public readonly statut: InputSignal<StatutAcquisition | null> = input<StatutAcquisition | null>(
    null,
  );
}
