import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import type { InputSignal, Signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ComposantBase } from '../../composant-base';
import type { OptionFormulaire } from '../../modeles/composants.modele';

/**
 * Composant de liste déroulante conforme RGAA.
 * Encapsule un `<label>` et un `<select>` liés par `id`.
 * Implémente `ControlValueAccessor` pour s'intégrer aux Reactive Forms.
 */
@Component({
  selector: 'mc-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => McSelectComponent),
      multi: true,
    },
  ],
  templateUrl: './mc-select.component.html',
  styleUrl: './mc-select.component.scss',
})
export class McSelectComponent extends ComposantBase implements ControlValueAccessor {
  /** Identifiant HTML du champ — lie le `<label>` au `<select>`. */
  public readonly id: InputSignal<string> = input.required<string>();

  /** Libellé visible du champ. */
  public readonly label: InputSignal<string> = input.required<string>();

  /** Liste des options affichées dans le sélecteur. */
  public readonly options: InputSignal<OptionFormulaire[]> = input<OptionFormulaire[]>([]);

  /** Indique si le champ est obligatoire. Ajoute `required` et un astérisque visuel. */
  public readonly required: InputSignal<boolean> = input(false);

  /**
   * Si `true`, ajoute une option vide `—` en tête de liste.
   * À utiliser pour les champs non obligatoires pour permettre la désélection.
   */
  public readonly avecOptionVide: InputSignal<boolean> = input(false);

  /** Valeur sélectionnée courante, telle que reçue du `FormControl` (peut ne correspondre à aucune option). */
  protected readonly valeur = signal('');

  /**
   * Valeur effectivement affichée dans le `<select>` natif : la valeur courante si elle
   * correspond à une option, sinon la première option disponible (comportement du navigateur),
   * ou une chaîne vide sans option — évite toute désynchronisation entre l'option visuellement
   * sélectionnée et l'état interne du composant.
   */
  protected readonly valeurAffichee: Signal<string> = computed(() => {
    const courante = this.valeur();
    const valeursValides = this.avecOptionVide()
      ? ['', ...this.options().map((o) => o.valeur)]
      : this.options().map((o) => o.valeur);
    if (valeursValides.length === 0) return courante;
    return valeursValides.includes(courante) ? courante : valeursValides[0];
  });

  /** Indique si le sélecteur est désactivé par le FormControl parent. */
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
   * Active ou désactive le sélecteur selon l'état du FormControl parent.
   * @param estDesactive `true` pour désactiver le sélecteur.
   */
  public setDisabledState(estDesactive: boolean): void {
    this.estDesactive.set(estDesactive);
  }

  /**
   * Notifie Angular Forms de la nouvelle option sélectionnée.
   * @param valeur Valeur de l'option sélectionnée.
   */
  protected surChangement(valeur: string): void {
    this.valeur.set(valeur);
    this.onChange(valeur);
  }

  /** Notifie Angular Forms que le sélecteur a été touché (perte de focus). */
  protected surBlur(): void {
    this.onTouched();
  }
}
