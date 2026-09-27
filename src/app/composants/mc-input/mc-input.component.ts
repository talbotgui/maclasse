import { ChangeDetectionStrategy, Component, forwardRef, input } from '@angular/core';
import type { InputSignal } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ChampBase } from '../../champ-base';

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
export class McInputComponent extends ChampBase {
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

  /**
   * Indique si le champ est en lecture seule (attribut `readonly` natif) : contrairement à
   * un champ désactivé, il reste focalisable et lisible par les lecteurs d'écran.
   */
  public readonly lectureSeule: InputSignal<boolean> = input(false);

  /** Infobulle du champ (attribut `title` natif), vide pour ne pas en afficher. */
  public readonly infobulle: InputSignal<string> = input('');

  /**
   * Identifiants, séparés par des espaces, des éléments décrivant le champ (attribut
   * `aria-describedby` du champ natif : message d'erreur, explication), `null` si aucun.
   */
  public readonly descriptionIds: InputSignal<string | null> = input<string | null>(null);

  /**
   * Notifie Angular Forms de la nouvelle valeur saisie.
   * Pour un champ `type="number"`, la valeur transmise au modèle est convertie en nombre,
   * afin qu'une comparaison `!==` avec la valeur enregistrée reste cohérente.
   * @param valeur Nouvelle valeur brute de l'input (toujours une chaîne côté DOM).
   */
  protected override surChangement(valeur: string): void {
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
}
