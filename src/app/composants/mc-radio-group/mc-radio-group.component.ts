import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import type { InputSignal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ComposantBase } from '../../composant-base';
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
export class McRadioGroupComponent extends ComposantBase implements ControlValueAccessor {
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

  /** Valeur de l'option sélectionnée. */
  protected readonly valeur = signal('');

  /** Indique si le groupe est désactivé par le FormControl parent. */
  protected readonly estDesactive = signal(false);

  /** Callback de notification des changements, fourni par Angular Forms. */
  protected onChange: (valeur: string) => void = () => {};

  /** Callback de notification du touché, fourni par Angular Forms. */
  protected onTouched: () => void = () => {};

  /**
   * Reçoit la valeur depuis le FormControl et met à jour le signal interne.
   * @param valeur Valeur fournie par Angular Forms (peut être `null`).
   */
  public writeValue(valeur: string | null | undefined): void {
    this.valeur.set(valeur ?? '');
  }

  /**
   * Enregistre le callback appelé lors de chaque changement de sélection.
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
   * Active ou désactive le groupe selon l'état du FormControl parent.
   * @param estDesactive `true` pour désactiver tous les radios du groupe.
   */
  public setDisabledState(estDesactive: boolean): void {
    this.estDesactive.set(estDesactive);
  }

  /**
   * Notifie Angular Forms de l'option sélectionnée.
   * @param valeur Valeur de l'option choisie.
   */
  protected surChangement(valeur: string): void {
    this.valeur.set(valeur);
    this.onChange(valeur);
  }

  /** Notifie Angular Forms que le groupe a été touché (perte de focus). */
  protected surBlur(): void {
    this.onTouched();
  }
}
