import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { PopinSauvegardeComponent } from './popin-sauvegarde.component';

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

describe('PopinSauvegardeComponent', () => {
  let fixture: ComponentFixture<PopinSauvegardeComponent>;
  let component: PopinSauvegardeComponent;

  const dialogEl = () => fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(PopinSauvegardeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('ouverture/fermeture', () => {
    it('visible=false (défaut) → showModal non appelé', () => {
      expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
    });

    it('visible=true → showModal appelé', () => {
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();

      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
    });

    it('visible=true puis false → close appelé', () => {
      (dialogEl() as any).open = true;
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();
      fixture.componentRef.setInput('visible', false);
      fixture.detectChanges();

      expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();
    });

    it("ouverture réinitialise motDePasse à ''", () => {
      (component as any).motDePasse.set('ancien');

      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();

      expect((component as any).motDePasse()).toBe('');
    });
  });

  describe('surConfirmation', () => {
    it("sans mot de passe → n'émet pas confirme", () => {
      const spy = vi.spyOn((component as any).confirme, 'emit');
      (component as any).motDePasse.set('');

      component['surConfirmation']();

      expect(spy).not.toHaveBeenCalled();
    });

    it('avec mot de passe → émet confirme(mdp trimé)', () => {
      const spy = vi.spyOn((component as any).confirme, 'emit');
      (component as any).motDePasse.set('  monSecret  ');

      component['surConfirmation']();

      expect(spy).toHaveBeenCalledWith('monSecret');
    });
  });

  describe('surAnnulation', () => {
    it("émet l'output annule", () => {
      const spy = vi.spyOn((component as any).annule, 'emit');

      component['surAnnulation']();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('surCancel (Échap)', () => {
    it('appelle event.preventDefault()', () => {
      const event = new Event('cancel');
      const spy = vi.spyOn(event, 'preventDefault');

      component['surCancel'](event);

      expect(spy).toHaveBeenCalled();
    });

    it("émet l'output annule", () => {
      const spy = vi.spyOn((component as any).annule, 'emit');

      component['surCancel'](new Event('cancel'));

      expect(spy).toHaveBeenCalled();
    });
  });
});
