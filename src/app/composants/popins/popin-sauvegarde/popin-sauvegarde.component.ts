import {
  ChangeDetectionStrategy, Component, ElementRef, effect,
  input, output, signal, viewChild,
} from '@angular/core';
import type { InputSignal, OutputEmitterRef } from '@angular/core';
import { ComposantBase } from '../../../composant-base';
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
export class PopinSauvegardeComponent extends ComposantBase {
  /** Contrôle la visibilité de la popin. */
  public readonly visible: InputSignal<boolean> = input(false);

  /** Émis avec le mot de passe saisi quand l'utilisateur valide. */
  protected readonly confirme: OutputEmitterRef<string> = output<string>();

  /** Émis quand l'utilisateur annule la sauvegarde. */
  protected readonly annule: OutputEmitterRef<void> = output<void>();

  /** Référence à l'élément `<dialog>` natif. */
  private readonly dialogEl = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  /** Valeur courante du champ mot de passe. */
  protected readonly motDePasse = signal('');

  /** Ouvre ou ferme la dialog native en réaction au signal `visible`. */
  public constructor() {
    super();
    effect(() => {
      const el = this.dialogEl().nativeElement;
      if (this.visible()) {
        this.motDePasse.set('');
        if (!el.open) el.showModal();
      } else if (el.open) {
        el.close();
      }
    });
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
