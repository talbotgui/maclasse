import {
  ChangeDetectionStrategy, Component, ElementRef, effect,
  input, output, viewChild,
} from '@angular/core';
import type { InputSignal, OutputEmitterRef } from '@angular/core';
import { ComposantBase } from '../../../composant-base';
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
export class PopinWarningsAbsencesComponent extends ComposantBase {
  /** Contrôle la visibilité de la popin. */
  public readonly visible: InputSignal<boolean> = input(false);

  /** Liste des messages de conflit à afficher. */
  public readonly conflits: InputSignal<string[]> = input<string[]>([]);

  /** Émis quand l'utilisateur ferme la popin (bouton FERMER ou Échap). */
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
