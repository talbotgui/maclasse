import {
  ChangeDetectionStrategy, Component, ElementRef, effect,
  inject, input, output, viewChild,
} from '@angular/core';
import type { InputSignal, OutputEmitterRef } from '@angular/core';
import { ComposantBase } from '../../../composant-base';
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
export class PopinAvertissementComponent extends ComposantBase {
  /** Contrôle la visibilité de la popin. */
  public readonly visible: InputSignal<boolean> = input(false);

  /** Message d'avertissement affiché dans le corps de la popin. */
  public readonly message: InputSignal<string> = input('');

  /** Émis quand l'utilisateur confirme l'action (bouton CONTINUER). */
  protected readonly confirme: OutputEmitterRef<void> = output<void>();

  /** Émis quand l'utilisateur annule (bouton ANNULER ou touche Échap). */
  protected readonly annule: OutputEmitterRef<void> = output<void>();

  /** Référence à l'élément `<dialog>` natif. */
  private readonly dialogEl = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  /** Ouvre ou ferme la dialog native en réaction au signal `visible`. */
  public constructor() {
    super();
    effect(() => {
      const el = this.dialogEl().nativeElement;
      if (this.visible()) {
        if (!el.open) el.showModal();
      } else if (el.open) {
        el.close();
      }
    });
  }

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
