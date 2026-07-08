import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  input,
  output,
  signal,
} from '@angular/core';
import type { InputSignal, OutputEmitterRef } from '@angular/core';
import { ComposantBase } from '../../composant-base';

/**
 * Composant de champ de recherche avec bouton de réinitialisation et debounce configurable.
 * Émet `rechercheChange` après le délai configuré via `delaiMs`.
 * Si `delaiMs` vaut `0`, l'émission est immédiate à chaque frappe.
 */
@Component({
  selector: 'mc-champ-recherche',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mc-champ-recherche.component.html',
  styleUrl: './mc-champ-recherche.component.scss',
})
export class McChampRechercheComponent extends ComposantBase implements OnDestroy {
  /** Identifiant HTML du champ de recherche. */
  public readonly id: InputSignal<string> = input.required<string>();

  /** Texte indicatif affiché dans le champ vide. */
  public readonly placeholder: InputSignal<string> = input('');

  /**
   * Délai en millisecondes avant émission après la dernière frappe.
   * `0` (défaut) = émission immédiate sans debounce.
   */
  public readonly delaiMs: InputSignal<number> = input(0);

  /** Émis avec la nouvelle valeur après le délai de debounce. */
  protected readonly rechercheChange: OutputEmitterRef<string> = output<string>();

  /** Valeur courante affichée dans le champ. */
  protected readonly valeurCourante = signal('');

  /** Référence au minuteur de debounce, `null` si inactif. */
  private timerDebounce: ReturnType<typeof setTimeout> | null = null;

  /**
   * Appelé à chaque frappe ; met à jour le signal et programme l'émission avec debounce.
   * @param valeur Nouvelle valeur saisie.
   */
  protected surSaisie(valeur: string): void {
    this.valeurCourante.set(valeur);
    this.emettreAvecDebounce(valeur);
  }

  /** Vide le champ et émet immédiatement une chaîne vide, en annulant tout debounce en cours. */
  protected reinitialiser(): void {
    this.valeurCourante.set('');
    if (this.timerDebounce !== null) {
      clearTimeout(this.timerDebounce);
      this.timerDebounce = null;
    }
    this.rechercheChange.emit('');
  }

  /**
   * Programme l'émission après le délai configuré, en annulant l'émission précédente si elle
   * n'a pas encore eu lieu. Si `delaiMs` vaut `0`, l'émission est synchrone.
   * @param valeur Valeur à émettre.
   */
  private emettreAvecDebounce(valeur: string): void {
    if (this.timerDebounce !== null) {
      clearTimeout(this.timerDebounce);
      this.timerDebounce = null;
    }
    const delai = this.delaiMs();
    if (delai === 0) {
      this.rechercheChange.emit(valeur);
    } else {
      this.timerDebounce = setTimeout(() => {
        this.rechercheChange.emit(valeur);
        this.timerDebounce = null;
      }, delai);
    }
  }

  /** Annule le minuteur de debounce en cours lors de la destruction du composant. */
  public ngOnDestroy(): void {
    if (this.timerDebounce !== null) {
      clearTimeout(this.timerDebounce);
    }
  }
}
