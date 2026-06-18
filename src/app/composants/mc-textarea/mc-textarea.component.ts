import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import type { InputSignal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ComposantBase } from '../../composant-base';

/**
 * Composant de saisie multi-lignes conforme RGAA.
 * Encapsule un `<label>` et un `<textarea>` liés par `id`.
 * Implémente `ControlValueAccessor` pour s'intégrer aux Reactive Forms.
 */
@Component({
  selector: 'mc-textarea',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => McTextareaComponent),
      multi: true,
    },
  ],
  templateUrl: './mc-textarea.component.html',
  styleUrl: './mc-textarea.component.scss',
})
export class McTextareaComponent extends ComposantBase implements ControlValueAccessor {
  /** Identifiant HTML du champ — lie le `<label>` au `<textarea>`. */
  public readonly id: InputSignal<string> = input.required<string>();

  /** Libellé visible du champ. */
  public readonly label: InputSignal<string> = input.required<string>();

  /** Texte indicatif affiché dans le champ vide. */
  public readonly placeholder: InputSignal<string> = input('');

  /** Indique si le champ est obligatoire. Ajoute `required` et un astérisque visuel. */
  public readonly required: InputSignal<boolean> = input(false);

  /** Nombre de lignes visibles du textarea. */
  public readonly lignes: InputSignal<number> = input(3);

  /** Valeur courante du champ. */
  protected readonly valeur = signal('');

  /** Indique si le champ est désactivé par le FormControl parent. */
  protected readonly estDesactive = signal(false);

  /** Callback de notification des changements, fourni par Angular Forms. */
  protected onChange: (valeur: string) => void = () => {};

  /** Callback de notification du touché, fourni par Angular Forms. */
  protected onTouched: () => void = () => {};

  /**
   * Reçoit la valeur depuis le FormControl et met à jour le signal interne.
   * @param valeur Valeur fournie par Angular Forms (peut être `null` à l'initialisation).
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
   * Notifie Angular Forms de la nouvelle valeur saisie.
   * @param valeur Nouvelle valeur du textarea.
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
