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
});
