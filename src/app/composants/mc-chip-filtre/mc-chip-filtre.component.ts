import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { InputSignal, OutputEmitterRef } from '@angular/core';
import { ComposantBase } from '../../composant-base';

/**
 * Composant chip cliquable pour le filtrage par catégorie.
 * Affiche un libellé et bascule entre un état actif et inactif à chaque clic.
 * Émet l'état résultant via `selectionChange`.
 */
@Component({
  selector: 'mc-chip-filtre',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mc-chip-filtre.component.html',
  styleUrl: './mc-chip-filtre.component.scss',
})
export class McChipFiltreComponent extends ComposantBase {
  /** Identifiant HTML du bouton chip. */
  public readonly id: InputSignal<string> = input.required<string>();

  /** Texte affiché dans le chip. */
  public readonly libelle: InputSignal<string> = input.required<string>();

  /** Indique si le chip est actuellement actif (sélectionné). */
  public readonly actif: InputSignal<boolean> = input(false);

  /** Émis à chaque clic avec le nouvel état actif (`true` = activé, `false` = désactivé). */
  protected readonly selectionChange: OutputEmitterRef<boolean> = output<boolean>();

  /** Bascule l'état actif et émet le nouvel état. */
  protected basculer(): void {
    this.selectionChange.emit(!this.actif());
  }
}
