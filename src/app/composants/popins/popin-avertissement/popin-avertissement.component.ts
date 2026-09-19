import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { InputSignal, OutputEmitterRef } from '@angular/core';
import { PopinBase } from '../../../popin-base';
import { McAutoFocusDirective } from '../../../directives/mc-auto-focus.directive';

/**
 * Popin d'avertissement avant une perte de données potentielle.
 * Affiche un message configurable et deux boutons ANNULER / CONFIRMER.
 * Le focus est placé sur ANNULER (action la moins destructive) à l'ouverture.
 */
@Component({
  selector: 'popin-avertissement',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [McAutoFocusDirective],
  templateUrl: './popin-avertissement.component.html',
  styleUrl: './popin-avertissement.component.scss',
})
export class PopinAvertissementComponent extends PopinBase {
  /** Suffixe ajouté aux `id` internes quand plusieurs popins d'avertissement coexistent dans une page. */
  public readonly contexteId: InputSignal<string> = input('');

  /** Message d'avertissement affiché dans le corps de la popin. */
  public readonly message: InputSignal<string> = input('');

  /** Émis quand l'utilisateur confirme l'action (bouton CONTINUER). */
  protected readonly confirme: OutputEmitterRef<void> = output<void>();

  /** Émis quand l'utilisateur annule (bouton ANNULER ou touche Échap). */
  protected readonly annule: OutputEmitterRef<void> = output<void>();

  /** Émet `confirme` et laisse le parent fermer la popin via `visible`. */
  protected surConfirmation(): void {
    this.confirme.emit();
  }

  /** Émet `annule` et laisse le parent fermer la popin via `visible`. */
  protected surAnnulation(): void {
    this.annule.emit();
  }

  /** Intercepte la fermeture native par Échap pour émettre `annule`. */
  protected surCancel(event: Event): void {
    event.preventDefault();
    this.annule.emit();
  }
}
