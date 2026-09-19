import { ChangeDetectionStrategy, Component, forwardRef, input } from '@angular/core';
import type { InputSignal } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ChampBase } from '../../champ-base';
import type { OptionFormulaire } from '../../modeles/composants.modele';

/**
 * Composant de groupe de boutons radio conforme RGAA.
 * Utilise un `<fieldset>` avec `<legend>` pour associer le libellé au groupe.
 * Implémente `ControlValueAccessor` pour s'intégrer aux Reactive Forms.
 */
@Component({
  selector: 'mc-radio-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => McRadioGroupComponent),
      multi: true,
    },
  ],
  templateUrl: './mc-radio-group.component.html',
  styleUrl: './mc-radio-group.component.scss',
})
export class McRadioGroupComponent extends ChampBase {
  /**
   * Identifiant de base du groupe.
   * Sert de valeur `name` pour tous les radios et de préfixe pour leurs `id` individuels.
   */
  public readonly id: InputSignal<string> = input.required<string>();

  /** Libellé du groupe, affiché dans le `<legend>`. */
  public readonly label: InputSignal<string> = input.required<string>();

  /** Liste des options disponibles dans le groupe. */
  public readonly options: InputSignal<OptionFormulaire[]> = input<OptionFormulaire[]>([]);

  /** Indique si une sélection est obligatoire. */
  public readonly required: InputSignal<boolean> = input(false);
}
