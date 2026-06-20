import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { McChampRechercheComponent } from './mc-champ-recherche.component';

describe('McChampRechercheComponent', () => {
  let fixture: ComponentFixture<McChampRechercheComponent>;
  let component: McChampRechercheComponent;

  const input = () => fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
  const btnReinitialiser = () => fixture.debugElement.query(By.css('button'))?.nativeElement as HTMLButtonElement | null;

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
      const emis: string[] = [];
      (component as any).rechercheChange.subscribe((v: string) => emis.push(v));

      saisir('maths');

      expect(emis).toEqual(['maths']);
    });

    it('reinitialiser → émet une chaîne vide', () => {
      const emis: string[] = [];
      (component as any).rechercheChange.subscribe((v: string) => emis.push(v));
      saisir('maths');
      emis.length = 0;

      component['reinitialiser']();
      fixture.detectChanges();

      expect(emis).toEqual(['']);
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

    it('saisie → n\'émet pas avant le délai', () => {
      const emis: string[] = [];
      (component as any).rechercheChange.subscribe((v: string) => emis.push(v));

      saisir('sc');

      expect(emis).toHaveLength(0);
    });

    it('après le délai → émet la valeur', () => {
      const emis: string[] = [];
      (component as any).rechercheChange.subscribe((v: string) => emis.push(v));

      saisir('sc');
      vi.advanceTimersByTime(300);

      expect(emis).toEqual(['sc']);
    });

    it('2e frappe avant délai → annule la 1re, émet seulement la 2e', () => {
      const emis: string[] = [];
      (component as any).rechercheChange.subscribe((v: string) => emis.push(v));

      saisir('s');
      vi.advanceTimersByTime(100);
      saisir('sc');
      vi.advanceTimersByTime(300);

      expect(emis).toEqual(['sc']);
    });
  });

  describe('reinitialiser avec debounce en cours', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      fixture.componentRef.setInput('delaiMs', 300);
      fixture.detectChanges();
    });

    it('reinitialiser → émet \'\' immédiatement et annule le timer', () => {
      const emis: string[] = [];
      (component as any).rechercheChange.subscribe((v: string) => emis.push(v));

      saisir('sc');
      component['reinitialiser']();
      vi.advanceTimersByTime(300);

      expect(emis).toEqual(['']);
    });
  });

  describe('ngOnDestroy', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      fixture.componentRef.setInput('delaiMs', 300);
      fixture.detectChanges();
    });

    it('détruire le composant avec timer actif → pas d\'émission tardive', () => {
      const emis: string[] = [];
      (component as any).rechercheChange.subscribe((v: string) => emis.push(v));

      saisir('sc');
      fixture.destroy();
      vi.advanceTimersByTime(300);

      expect(emis).toHaveLength(0);
    });
  });
});
