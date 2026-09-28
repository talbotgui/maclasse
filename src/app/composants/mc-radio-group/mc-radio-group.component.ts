import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  input,
  viewChildren,
} from '@angular/core';
import type { InputSignal, Signal } from '@angular/core';
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

  /**
   * Indique si la réponse peut être remise à « non renseignée » : un bouton EFFACER
   * est alors affiché tant qu'une option est cochée.
   */
  public readonly effacable: InputSignal<boolean> = input(false);

  /** Boutons radio du groupe, dans l'ordre des options. */
  private readonly radios: Signal<readonly ElementRef<HTMLInputElement>[]> =
    viewChildren<ElementRef<HTMLInputElement>>('radio');

  /**
   * Décoche toutes les options, notifie Angular Forms d'une valeur `null`
   * et rend le focus à la première option (le bouton EFFACER disparaît).
   */
  protected effacer(): void {
    this.writeValue(null);
    this.onChange(null);
    this.onTouched();
    this.radios()[0]?.nativeElement.focus();
  }
}
