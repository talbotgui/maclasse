import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import type { InputSignal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ComposantBase } from '../../composant-base';

/**
 * Composant de case à cocher conforme RGAA.
 * Encapsule un `<input type="checkbox">` et son `<label>` associé.
 * Implémente `ControlValueAccessor` pour s'intégrer aux Reactive Forms.
 */
@Component({
  selector: 'mc-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => McCheckboxComponent),
      multi: true,
    },
  ],
  templateUrl: './mc-checkbox.component.html',
  styleUrl: './mc-checkbox.component.scss',
})
export class McCheckboxComponent extends ComposantBase implements ControlValueAccessor {
  /** Identifiant HTML de la case — lie le `<label>` à l'`<input>`. */
  public readonly id: InputSignal<string> = input.required<string>();

  /** Libellé visible de la case à cocher. */
  public readonly label: InputSignal<string> = input.required<string>();

  /** Indique si la case est obligatoire. */
  public readonly required: InputSignal<boolean> = input(false);

  /** État coché courant de la case. */
  protected readonly valeur = signal(false);

  /** Indique si la case est désactivée par le FormControl parent. */
  protected readonly estDesactive = signal(false);

  /** Callback de notification des changements, fourni par Angular Forms. */
  protected onChange: (valeur: boolean) => void = () => {};

  /** Callback de notification du touché, fourni par Angular Forms. */
  protected onTouched: () => void = () => {};

  /**
   * Reçoit la valeur depuis le FormControl et met à jour le signal interne.
   * @param valeur Valeur booléenne fournie par Angular Forms (peut être `null`).
   */
  public writeValue(valeur: boolean | null | undefined): void {
    this.valeur.set(valeur ?? false);
  }

  /**
   * Enregistre le callback appelé lors de chaque changement d'état.
   * @param fn Fonction fournie par Angular Forms.
   */
  public registerOnChange(fn: (valeur: boolean) => void): void {
    this.onChange = fn;
  }

  /**
   * Enregistre le callback appelé lors de la perte de focus.
   * @param fn Fonction fournie par Angular Forms.
   */
  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Active ou désactive la case selon l'état du FormControl parent.
   * @param estDesactive `true` pour désactiver la case.
   */
  public setDisabledState(estDesactive: boolean): void {
    this.estDesactive.set(estDesactive);
  }

  /**
   * Notifie Angular Forms du nouvel état coché.
   * @param coche `true` si la case vient d'être cochée.
   */
  protected surChangement(coche: boolean): void {
    this.valeur.set(coche);
    this.onChange(coche);
  }

  /** Notifie Angular Forms que la case a été touchée (perte de focus). */
  protected surBlur(): void {
    this.onTouched();
  }
}
