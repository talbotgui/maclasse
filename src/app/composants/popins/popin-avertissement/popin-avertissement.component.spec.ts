import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { PopinAvertissementComponent } from './popin-avertissement.component';

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

describe('PopinAvertissementComponent', () => {
  let fixture: ComponentFixture<PopinAvertissementComponent>;
  let component: PopinAvertissementComponent;

  const dialogEl = () => fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(PopinAvertissementComponent);
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
  });

  describe('message', () => {
    it('message renseigné → texte affiché dans le corps', () => {
      fixture.componentRef.setInput('message', 'Des données seront perdues.');
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Des données seront perdues.');
    });
  });

  describe('surConfirmation', () => {
    it("émet l'output confirme", () => {
      const spy = vi.spyOn((component as any).confirme, 'emit');

      component['surConfirmation']();

      expect(spy).toHaveBeenCalled();
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
