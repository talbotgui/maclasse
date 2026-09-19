import { ChangeDetectionStrategy, Component, forwardRef, input } from '@angular/core';
import type { InputSignal } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ChampBase } from '../../champ-base';

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
export class McTextareaComponent extends ChampBase {
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
}
