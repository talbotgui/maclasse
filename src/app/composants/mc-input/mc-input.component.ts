import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import type { InputSignal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ComposantBase } from '../../composant-base';

/**
 * Composant de saisie textuelle conforme RGAA.
 * Encapsule un `<label>` et un `<input>` liés par `id`.
 * Implémente `ControlValueAccessor` pour s'intégrer aux Reactive Forms.
 */
@Component({
  selector: 'mc-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => McInputComponent),
      multi: true,
    },
  ],
  templateUrl: './mc-input.component.html',
  styleUrl: './mc-input.component.scss',
})
export class McInputComponent extends ComposantBase implements ControlValueAccessor {
  /** Identifiant HTML du champ — lie le `<label>` au `<input>`. */
  public readonly id: InputSignal<string> = input.required<string>();

  /** Libellé visible du champ. */
  public readonly label: InputSignal<string> = input.required<string>();

  /** Type HTML du champ (`text`, `email`, `password`, `number`, `date`…). */
  public readonly type: InputSignal<string> = input('text');

  /** Texte indicatif affiché dans le champ vide. */
  public readonly placeholder: InputSignal<string> = input('');

  /** Indique si le champ est obligatoire. Ajoute `required` et un astérisque visuel. */
  public readonly required: InputSignal<boolean> = input(false);

  /** Valeur minimale acceptée (attribut `min` natif), `null` pour ne pas la contraindre. */
  public readonly min: InputSignal<number | null> = input<number | null>(null);

  /** Valeur maximale acceptée (attribut `max` natif), `null` pour ne pas la contraindre. */
  public readonly max: InputSignal<number | null> = input<number | null>(null);

  /** Valeur courante du champ. */
  protected readonly valeur = signal('');

  /** Indique si le champ est désactivé par le FormControl parent. */
  protected readonly estDesactive = signal(false);

  /** Callback de notification des changements, fourni par Angular Forms. */
  protected onChange: (valeur: string | number) => void = () => {};

  /** Callback de notification du touché, fourni par Angular Forms. */
  protected onTouched: () => void = () => {};

  /**
   * Reçoit la valeur depuis le FormControl et met à jour le signal interne.
   * @param valeur Valeur fournie par Angular Forms (peut être `null` à l'initialisation,
   * ou un `number` pour un champ `type="number"`).
   */
  public writeValue(valeur: string | number | null | undefined): void {
    this.valeur.set(valeur === null || valeur === undefined ? '' : String(valeur));
  }

  /**
   * Enregistre le callback appelé lors de chaque changement de valeur.
   * @param fn Fonction fournie par Angular Forms.
   */
  public registerOnChange(fn: (valeur: string | number) => void): void {
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
   * Pour un champ `type="number"`, la valeur transmise au modèle est convertie en nombre,
   * afin qu'une comparaison `!==` avec la valeur enregistrée reste cohérente.
   * @param valeur Nouvelle valeur brute de l'input (toujours une chaîne côté DOM).
   */
  protected surChangement(valeur: string): void {
    this.valeur.set(valeur);
    this.onChange(this.type() === 'number' ? this.versValeurNumerique(valeur) : valeur);
  }

  /**
   * Convertit une saisie textuelle en nombre pour les champs `type="number"`.
   * @param valeur Valeur brute saisie dans le champ.
   * @returns Nombre converti, ou la chaîne d'origine si elle est vide ou non numérique.
   */
  private versValeurNumerique(valeur: string): string | number {
    if (valeur === '') return valeur;
    const nombre = Number(valeur);
    return Number.isNaN(nombre) ? valeur : nombre;
  }

  /** Notifie Angular Forms que le champ a été touché (perte de focus). */
  protected surBlur(): void {
    this.onTouched();
  }
}
