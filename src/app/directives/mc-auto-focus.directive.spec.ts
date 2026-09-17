import { describe, it, expect, beforeEach } from 'vitest';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { McAutoFocusDirective } from './mc-auto-focus.directive';

/** Composant hôte minimal pour tester la directive dans un contexte Angular réel. */
@Component({
  template: `<button [mcAutoFocus]="actif()" id="btnTest">Bouton</button>`,
  imports: [McAutoFocusDirective],
})
class ComposantTestDirective {
  public readonly actif = signal(false);
}

/**
 * Composant hôte dont l'élément portant `mcAutoFocus` n'est pas nativement focusable
 * et dont l'unique descendant potentiellement focusable est désactivé — reproduit
 * le champ "conditionnellement désactivé" décrit par SOU-017.
 */
@Component({
  template: `
    <div [mcAutoFocus]="actif()" id="conteneurDesactive">
      <input id="champInterneDesactive" disabled />
    </div>
  `,
  imports: [McAutoFocusDirective],
})
class ComposantTestDescendantDesactive {
  public readonly actif = signal(false);
}

/** Composant hôte dont l'élément portant `mcAutoFocus` n'est pas focusable, mais dont un descendant l'est. */
@Component({
  template: `
    <div [mcAutoFocus]="actif()" id="conteneurValide">
      <input id="champInterneValide" />
    </div>
  `,
  imports: [McAutoFocusDirective],
})
class ComposantTestDescendantFocusable {
  public readonly actif = signal(false);
}

describe('McAutoFocusDirective', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  describe('comportement du focus', () => {
    it("applique le focus sur l'élément quand mcAutoFocus est true dès la création", () => {
      const fixture = TestBed.createComponent(ComposantTestDirective);
      fixture.componentInstance.actif.set(true);
      fixture.detectChanges();

      const bouton = fixture.debugElement.query(By.css('button')).nativeElement;
      expect(document.activeElement).toBe(bouton);
    });

    it("n'applique pas le focus quand mcAutoFocus est false", () => {
      const fixture = TestBed.createComponent(ComposantTestDirective);
      fixture.componentInstance.actif.set(false);
      fixture.detectChanges();

      const bouton = fixture.debugElement.query(By.css('button')).nativeElement;
      expect(document.activeElement).not.toBe(bouton);
    });

    it('applique le focus quand mcAutoFocus passe de false à true', () => {
      const fixture = TestBed.createComponent(ComposantTestDirective);
      fixture.componentInstance.actif.set(false);
      fixture.detectChanges();

      fixture.componentInstance.actif.set(true);
      fixture.detectChanges();

      const bouton = fixture.debugElement.query(By.css('button')).nativeElement;
      expect(document.activeElement).toBe(bouton);
    });
  });

  describe('recherche du descendant focusable', () => {
    it("porte le focus sur le descendant focusable quand l'hôte lui-même ne l'est pas", () => {
      const fixture = TestBed.createComponent(ComposantTestDescendantFocusable);
      fixture.componentInstance.actif.set(true);
      fixture.detectChanges();

      const champ = fixture.debugElement.query(By.css('#champInterneValide')).nativeElement;
      expect(document.activeElement).toBe(champ);
    });

    it("se replie sur l'hôte (non focusable, no-op silencieux) si le seul descendant candidat est désactivé", () => {
      const fixture = TestBed.createComponent(ComposantTestDescendantDesactive);
      fixture.componentInstance.actif.set(true);
      fixture.detectChanges();

      const conteneur = fixture.debugElement.query(By.css('#conteneurDesactive')).nativeElement;
      const champDesactive = fixture.debugElement.query(
        By.css('#champInterneDesactive'),
      ).nativeElement;
      expect(document.activeElement).not.toBe(champDesactive);
      expect(document.activeElement).not.toBe(conteneur);
    });
  });
});
