import { Directive, ElementRef, effect, inject, input } from '@angular/core';
import type { InputSignal } from '@angular/core';

/**
 * Directive d'attribut qui applique automatiquement le focus lorsque
 * l'input `mcAutoFocus` passe à `true`.
 *
 * Si l'élément hôte est nativement focusable (input, button…), le focus
 * lui est appliqué directement. Sinon, la directive cherche le premier
 * descendant focusable (ex. l'`<input>` interne d'un `<mc-input>`).
 *
 * L'implémentation via `effect()` garantit la réactivité même si la directive
 * est portée par un élément déjà présent dans le DOM.
 */
@Directive({
  selector: '[mcAutoFocus]',
})
export class McAutoFocusDirective {
  /** Sélecteur CSS des éléments nativement focusables non désactivés. */
  private static readonly SELECTEUR_FOCUSABLE =
    'input:not([disabled]), button:not([disabled]), select:not([disabled]), textarea:not([disabled])';

  /** Déclenche le focus quand la valeur est `true`. */
  public readonly mcAutoFocus: InputSignal<boolean> = input(false);

  /** Référence native à l'élément hôte. */
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  /** Crée l'effet réactif qui applique le focus à chaque passage à `true`. */
  public constructor() {
    effect(() => {
      if (this.mcAutoFocus()) {
        const el = this.elementRef.nativeElement;
        const cible = el.matches(McAutoFocusDirective.SELECTEUR_FOCUSABLE)
          ? el
          : ((el.querySelector(McAutoFocusDirective.SELECTEUR_FOCUSABLE) as HTMLElement | null) ?? el);
        cible.focus();
      }
    });
  }
}
