import { Directive, ElementRef, effect, inject, input } from '@angular/core';
import type { InputSignal } from '@angular/core';

/**
 * Directive d'attribut qui applique automatiquement le focus sur l'élément hôte
 * lorsque l'input `mcAutoFocus` passe à `true`.
 *
 * Utilisation type dans les popins : `<button [mcAutoFocus]="estVisible">`.
 * L'implémentation via `effect()` garantit la réactivité même si la directive
 * est portée par un élément déjà présent dans le DOM (cas `[hidden]`).
 */
@Directive({
  selector: '[mcAutoFocus]',
})
export class McAutoFocusDirective {
  /** Déclenche le focus sur l'élément hôte quand la valeur est `true`. */
  public readonly mcAutoFocus: InputSignal<boolean> = input(false);

  /** Référence native à l'élément hôte sur lequel le focus sera appliqué. */
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  /** Crée l'effet réactif qui applique le focus à chaque passage à `true`. */
  public constructor() {
    effect(() => {
      if (this.mcAutoFocus()) {
        this.elementRef.nativeElement.focus();
      }
    });
  }
}
