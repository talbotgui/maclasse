import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { McChampRechercheComponent } from './mc-champ-recherche.component';

describe('McChampRechercheComponent', () => {
  let fixture: ComponentFixture<McChampRechercheComponent>;
  let component: McChampRechercheComponent;

  const input = () => fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
  const btnReinitialiser = () =>
    fixture.debugElement.query(By.css('button'))?.nativeElement as HTMLButtonElement | null;

  const saisir = (valeur: string) => {
    input().value = valeur;
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(McChampRechercheComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'recherche');
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('émission immédiate (delaiMs=0, défaut)', () => {
    it('saisie → émet immédiatement la valeur', () => {
      const spy = vi.spyOn((component as any).rechercheChange, 'emit');

      saisir('maths');

      expect(spy).toHaveBeenCalledWith('maths');
    });

    it('reinitialiser → émet une chaîne vide', () => {
      const spy = vi.spyOn((component as any).rechercheChange, 'emit');
      saisir('maths');

      component['reinitialiser']();
      fixture.detectChanges();

      expect(spy).toHaveBeenLastCalledWith('');
    });

    it('reinitialiser → valeurCourante vaut chaîne vide', () => {
      saisir('maths');

      component['reinitialiser']();
      fixture.detectChanges();

      expect((component as any).valeurCourante()).toBe('');
    });
  });

  describe('debounce (delaiMs=300)', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      fixture.componentRef.setInput('delaiMs', 300);
      fixture.detectChanges();
    });

    it("saisie → n'émet pas avant le délai", () => {
      const spy = vi.spyOn((component as any).rechercheChange, 'emit');

      saisir('sc');

      expect(spy).not.toHaveBeenCalled();
    });

    it('après le délai → émet la valeur', () => {
      const spy = vi.spyOn((component as any).rechercheChange, 'emit');

      saisir('sc');
      vi.advanceTimersByTime(300);

      expect(spy).toHaveBeenCalledWith('sc');
    });

    it('2e frappe avant délai → annule la 1re, émet seulement la 2e', () => {
      const spy = vi.spyOn((component as any).rechercheChange, 'emit');

      saisir('s');
      vi.advanceTimersByTime(100);
      saisir('sc');
      vi.advanceTimersByTime(300);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith('sc');
    });
  });

  describe('reinitialiser avec debounce en cours', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      fixture.componentRef.setInput('delaiMs', 300);
      fixture.detectChanges();
    });

    it("reinitialiser → émet '' immédiatement et annule le timer", () => {
      const spy = vi.spyOn((component as any).rechercheChange, 'emit');

      saisir('sc');
      component['reinitialiser']();
      vi.advanceTimersByTime(300);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith('');
    });
  });

  describe('ngOnDestroy', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      fixture.componentRef.setInput('delaiMs', 300);
      fixture.detectChanges();
    });

    it("détruire le composant avec timer actif → pas d'émission tardive", () => {
      const spy = vi.spyOn((component as any).rechercheChange, 'emit');

      saisir('sc');
      fixture.destroy();
      vi.advanceTimersByTime(300);

      expect(spy).not.toHaveBeenCalled();
    });
  });
});
