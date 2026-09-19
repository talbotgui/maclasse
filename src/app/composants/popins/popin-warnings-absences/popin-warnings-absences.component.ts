import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { InputSignal, OutputEmitterRef } from '@angular/core';
import { PopinBase } from '../../../popin-base';
import { McAutoFocusDirective } from '../../../directives/mc-auto-focus.directive';

/**
 * Popin d'affichage des conflits d'absences détectés sur une séance ou un créneau.
 * Non bloquante : affiche la liste en lecture seule avec un unique bouton FERMER.
 */
@Component({
  selector: 'popin-warnings-absences',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [McAutoFocusDirective],
  templateUrl: './popin-warnings-absences.component.html',
  styleUrl: './popin-warnings-absences.component.scss',
})
export class PopinWarningsAbsencesComponent extends PopinBase {
  /** Liste des messages de conflit à afficher. */
  public readonly conflits: InputSignal<string[]> = input<string[]>([]);

  /**
   * Suffixe d'identifiant, requis quand plusieurs instances de cette popin
   * coexistent simultanément dans le même écran (ex. : conflits EDT et conflits
   * créneau/absence sur l'écran emploi du temps).
   */
  public readonly contexteId: InputSignal<string> = input('');

  /** Émis quand l'utilisateur ferme la popin (bouton FERMER ou Échap). */
  protected readonly annule: OutputEmitterRef<void> = output<void>();

  /** Ferme la popin. */
  protected fermer(): void {
    this.annule.emit();
  }

  /** Intercepte Échap pour émettre `annule`. */
  protected surCancel(event: Event): void {
    event.preventDefault();
    this.annule.emit();
  }
}
