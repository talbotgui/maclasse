import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import type { InputSignal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ComposantBase } from '../../composant-base';

/**
 * Composant de saisie d'heure conforme RGAA.
 * Encapsule un `<label>` et un `<input type="time">` liés par `id`.
 * La valeur est une chaîne au format `HH:MM`.
 * Implémente `ControlValueAccessor` pour s'intégrer aux Reactive Forms.
 */
@Component({
  selector: 'mc-champ-heure',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => McChampHeureComponent),
      multi: true,
    },
  ],
  templateUrl: './mc-champ-heure.component.html',
  styleUrl: './mc-champ-heure.component.scss',
})
export class McChampHeureComponent extends ComposantBase implements ControlValueAccessor {
  /** Identifiant HTML du champ — lie le `<label>` au `<input>`. */
  public readonly id: InputSignal<string> = input.required<string>();

  /** Libellé visible du champ. */
  public readonly label: InputSignal<string> = input.required<string>();

  /** Indique si le champ est obligatoire. Ajoute `required` et un astérisque visuel. */
  public readonly required: InputSignal<boolean> = input(false);

  /** Valeur courante au format `HH:MM`, chaîne vide si non renseignée. */
  protected readonly valeur = signal('');

  /** Indique si le champ est désactivé par le FormControl parent. */
  protected readonly estDesactive = signal(false);

  /** Callback de notification des changements, fourni par Angular Forms. */
  protected onChange: (valeur: string) => void = () => {};

  /** Callback de notification du touché, fourni par Angular Forms. */
  protected onTouched: () => void = () => {};

  /**
   * Reçoit la valeur depuis le FormControl et met à jour le signal interne.
   * @param valeur Valeur `HH:MM` fournie par Angular Forms (peut être `null`).
   */
  public writeValue(valeur: string | null | undefined): void {
    this.valeur.set(valeur ?? '');
  }

  /**
   * Enregistre le callback appelé lors de chaque changement de valeur.
   * @param fn Fonction fournie par Angular Forms.
   */
  public registerOnChange(fn: (valeur: string) => void): void {
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
   * Active ou désactive le champ selon l'état du FormControl parent.
   * @param estDesactive `true` pour désactiver le champ.
   */
  public setDisabledState(estDesactive: boolean): void {
    this.estDesactive.set(estDesactive);
  }

  /**
   * Notifie Angular Forms de la nouvelle heure sélectionnée.
   * @param valeur Nouvelle valeur `HH:MM`.
   */
  protected surChangement(valeur: string): void {
    this.valeur.set(valeur);
    this.onChange(valeur);
  }

  /** Notifie Angular Forms que le champ a été touché (perte de focus). */
  protected surBlur(): void {
    this.onTouched();
  }
}
