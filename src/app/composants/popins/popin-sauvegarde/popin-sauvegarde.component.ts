import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import type { OutputEmitterRef } from '@angular/core';
import { PopinBase } from '../../../popin-base';
import { McAutoFocusDirective } from '../../../directives/mc-auto-focus.directive';

/**
 * Popin de saisie du mot de passe lors de la première sauvegarde.
 * Émet `confirme` avec le mot de passe saisi ou `annule` si l'utilisateur renonce.
 */
@Component({
  selector: 'popin-sauvegarde',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [McAutoFocusDirective],
  templateUrl: './popin-sauvegarde.component.html',
  styleUrl: './popin-sauvegarde.component.scss',
})
export class PopinSauvegardeComponent extends PopinBase {
  /** Émis avec le mot de passe saisi quand l'utilisateur valide. */
  protected readonly confirme: OutputEmitterRef<string> = output<string>();

  /** Émis quand l'utilisateur annule la sauvegarde. */
  protected readonly annule: OutputEmitterRef<void> = output<void>();

  /** Valeur courante du champ mot de passe. */
  protected readonly motDePasse = signal('');

  /** Réinitialise les champs de saisie à chaque ouverture. */
  protected override reinitialiserALOuverture(): void {
    this.motDePasse.set('');
  }

  /** Valide la sauvegarde si le mot de passe est renseigné. */
  protected surConfirmation(): void {
    const mdp = this.motDePasse().trim();
    if (!mdp) return;
    this.confirme.emit(mdp);
  }

  /** Annule la sauvegarde. */
  protected surAnnulation(): void {
    this.annule.emit();
  }

  /** Intercepte Échap pour émettre `annule`. */
  protected surCancel(event: Event): void {
    event.preventDefault();
    this.annule.emit();
  }
}
