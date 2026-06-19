import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import type { InputSignal, OutputEmitterRef } from '@angular/core';
import { ComposantBase } from '../../composant-base';

/**
 * Composant bouton de suppression à double confirmation.
 * En état normal, affiche SUPPRIMER. Au clic, bascule en état de confirmation
 * et affiche ANNULER + CONFIRMER sans popin. L'événement `confirme` n'est émis
 * que si l'utilisateur clique CONFIRMER.
 *
 * Quand `desactive` est vrai et que `tooltipDesactive` est renseigné,
 * un `<span class="sr-only">` fournit la description accessible via `aria-describedby`.
 */
@Component({
  selector: 'mc-bouton-destruction',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mc-bouton-destruction.component.html',
  styleUrl: './mc-bouton-destruction.component.scss',
})
export class McBoutonDestructionComponent extends ComposantBase {
  /** Identifiant de base du composant. Préfixe les IDs des boutons internes. */
  public readonly id: InputSignal<string> = input.required<string>();

  /** Si `true`, le bouton SUPPRIMER est désactivé (non cliquable). */
  public readonly desactive: InputSignal<boolean> = input(false);

  /** Si `true`, applique la taille réduite `mc-btn-sm` (usage dans les formulaires/listes). */
  public readonly petit: InputSignal<boolean> = input(false);

  /**
   * Texte d'explication affiché aux lecteurs d'écran quand le bouton est désactivé.
   * Vide par défaut. Si renseigné, un `<span class="sr-only">` est rendu et lié via `aria-describedby`.
   */
  public readonly tooltipDesactive: InputSignal<string> = input('');

  /** Émis sans valeur quand l'utilisateur a validé la suppression (clic CONFIRMER). */
  protected readonly confirme: OutputEmitterRef<void> = output<void>();

  /** `true` quand le composant attend la confirmation de l'utilisateur. */
  protected readonly etatConfirmation = signal(false);

  /** Passe en état de confirmation (affiche ANNULER + CONFIRMER). */
  protected demanderConfirmation(): void {
    this.etatConfirmation.set(true);
  }

  /** Annule la demande de confirmation et revient à l'état normal. */
  protected annuler(): void {
    this.etatConfirmation.set(false);
  }

  /** Valide la suppression : émet `confirme` et revient à l'état normal. */
  protected confirmer(): void {
    this.etatConfirmation.set(false);
    this.confirme.emit();
  }
}
