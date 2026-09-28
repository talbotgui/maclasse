import { ChangeDetectionStrategy, Component, forwardRef, input } from '@angular/core';
import type { InputSignal } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ChampBase } from '../../champ-base';

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
export class McChampHeureComponent extends ChampBase {
  /** Identifiant HTML du champ — lie le `<label>` au `<input>`. */
  public readonly id: InputSignal<string> = input.required<string>();

  /** Libellé visible du champ. */
  public readonly label: InputSignal<string> = input.required<string>();

  /** Indique si le champ est obligatoire. Ajoute `required` et un astérisque visuel. */
  public readonly required: InputSignal<boolean> = input(false);

  /**
   * Identifiants, séparés par des espaces, des éléments décrivant le champ (attribut
   * `aria-describedby` du champ natif, ex. message d'erreur), `null` si aucun.
   */
  public readonly descriptionIds: InputSignal<string | null> = input<string | null>(null);
}
