import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PopinWarningsAbsencesComponent } from './popin-warnings-absences.component';

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

describe('PopinWarningsAbsencesComponent', () => {
  let fixture: ComponentFixture<PopinWarningsAbsencesComponent>;
  let component: PopinWarningsAbsencesComponent;

  const dialogEl = () => fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(PopinWarningsAbsencesComponent);
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

  describe('affichage des conflits', () => {
    it('liste affichée dans le DOM', () => {
      fixture.componentRef.setInput('conflits', ['Conflit A', 'Conflit B', 'Conflit C']);
      fixture.detectChanges();

      const items = fixture.debugElement.queryAll(By.css('li'));
      expect(items).toHaveLength(3);
    });

    it('liste vide → aucun item li', () => {
      fixture.componentRef.setInput('conflits', []);
      fixture.detectChanges();

      const items = fixture.debugElement.queryAll(By.css('li'));
      expect(items).toHaveLength(0);
    });

    it('contenu des conflits affiché', () => {
      fixture.componentRef.setInput('conflits', ['Alice MARTIN absente']);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Alice MARTIN absente');
    });
  });

  describe('fermer', () => {
    it("émet l'output annule", () => {
      const spy = vi.spyOn((component as any).annule, 'emit');

      component['fermer']();

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
