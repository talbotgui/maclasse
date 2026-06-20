import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { McChipFiltreComponent } from './mc-chip-filtre.component';

describe('McChipFiltreComponent', () => {
  let fixture: ComponentFixture<McChipFiltreComponent>;
  let component: McChipFiltreComponent;

  const bouton = () => fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(McChipFiltreComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'chip1');
    fixture.componentRef.setInput('libelle', 'Maths');
    fixture.componentRef.setInput('actif', false);
    fixture.detectChanges();
  });

  describe('état initial', () => {
    it('affiche le libellé "Maths"', () => {
      expect(bouton().textContent).toContain('Maths');
    });

    it('chip inactif par défaut (actif=false)', () => {
      expect(bouton().getAttribute('aria-pressed')).toBe('false');
    });

    it('chip actif quand actif=true', () => {
      fixture.componentRef.setInput('actif', true);
      fixture.detectChanges();

      expect(bouton().getAttribute('aria-pressed')).toBe('true');
    });
  });

  describe('interaction', () => {
    it('clic sur chip inactif émet selectionChange(true)', () => {
      const spy = vi.spyOn((component as any).selectionChange, 'emit');

      bouton().click();
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith(true);
    });

    it('clic sur chip actif émet selectionChange(false)', () => {
      fixture.componentRef.setInput('actif', true);
      fixture.detectChanges();
      const spy = vi.spyOn((component as any).selectionChange, 'emit');

      bouton().click();
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith(false);
    });

    it('plusieurs clics alternent les valeurs émises', () => {
      const spy = vi.spyOn((component as any).selectionChange, 'emit');

      bouton().click();
      expect(spy).toHaveBeenCalledWith(true);

      fixture.componentRef.setInput('actif', true);
      fixture.detectChanges();
      bouton().click();
      expect(spy).toHaveBeenCalledWith(false);
    });
  });
});
