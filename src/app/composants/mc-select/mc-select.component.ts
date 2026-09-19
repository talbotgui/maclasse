import { ChangeDetectionStrategy, Component, computed, forwardRef, input } from '@angular/core';
import type { InputSignal, Signal } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ChampBase } from '../../champ-base';
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
export class McSelectComponent extends ChampBase {
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

  /**
   * Valeur courante non vide absente des options : elle est ajoutée en option désactivée
   * pour que le select affiche la vraie valeur du `FormControl` plutôt qu'une autre option.
   */
  protected readonly optionInconnue: Signal<OptionFormulaire | null> = computed(() => {
    const courante = this.valeur();
    if (courante === '' || this.options().some((o) => o.valeur === courante)) return null;
    return { valeur: courante, libelle: `${courante} (${this.LIBELLES.commun.valeurInconnue})` };
  });

  /**
   * Valeur effectivement affichée dans le `<select>` natif : la valeur courante si elle
   * correspond à une option, sinon la première option disponible (comportement du navigateur),
   * ou une chaîne vide sans option — évite toute désynchronisation entre l'option visuellement
   * sélectionnée et l'état interne du composant.
   */
  protected readonly valeurAffichee: Signal<string> = computed(() => {
    const courante = this.valeur();
    if (this.optionInconnue()) return courante;
    const valeursValides = this.avecOptionVide()
      ? ['', ...this.options().map((o) => o.valeur)]
      : this.options().map((o) => o.valeur);
    if (valeursValides.length === 0) return courante;
    return valeursValides.includes(courante) ? courante : valeursValides[0];
  });
}
