import { Directive, ElementRef, effect, input, viewChild } from '@angular/core';
import type { InputSignal } from '@angular/core';
import { ComposantBase } from './composant-base';

/**
 * Classe de base abstraite des popins modales pilotées par un signal `visible`.
 * Synchronise l'élément `<dialog>` natif (référencé par `#dialog` dans le template)
 * avec `visible`. Décorée `@Directive()` car elle déclare un `input()` et une requête de vue.
 */
@Directive()
export abstract class PopinBase extends ComposantBase {
  /** Contrôle la visibilité de la popin. */
  public readonly visible: InputSignal<boolean> = input(false);

  /** Référence à l'élément `<dialog>` natif. */
  private readonly dialogEl = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  /** Ouvre ou ferme la dialog native en réaction au signal `visible`. */
  public constructor() {
    super();
    effect(() => {
      const el = this.dialogEl().nativeElement;
      if (this.visible()) {
        this.reinitialiserALOuverture();
        if (!el.open) el.showModal();
      } else if (el.open) {
        el.close();
      }
    });
  }

  /** Point d'extension : remet à zéro l'état de la popin à chaque affichage. Sans effet par défaut. */
  protected reinitialiserALOuverture(): void {}
}
