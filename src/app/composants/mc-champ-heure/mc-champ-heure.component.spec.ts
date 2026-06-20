import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { McChampHeureComponent } from './mc-champ-heure.component';

describe('McChampHeureComponent', () => {
  let fixture: ComponentFixture<McChampHeureComponent>;
  let component: McChampHeureComponent;

  const inputEl = () => fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
  const labelEl = () => fixture.debugElement.query(By.css('label')).nativeElement as HTMLLabelElement;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(McChampHeureComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'heureDebut');
    fixture.componentRef.setInput('label', 'Heure de début');
    fixture.detectChanges();
  });

  describe('writeValue', () => {
    it('valeur HH:MM → signal interne mis à jour', () => {
      component.writeValue('08:30');

      expect((component as any).valeur()).toBe('08:30');
    });

    it('null → signal vaut chaîne vide', () => {
      component.writeValue(null);

      expect((component as any).valeur()).toBe('');
    });

    it('undefined → signal vaut chaîne vide', () => {
      component.writeValue(undefined);

      expect((component as any).valeur()).toBe('');
    });
  });

  describe('registerOnChange', () => {
    it('callback appelé quand l\'utilisateur saisit', () => {
      const cb = vi.fn();
      component.registerOnChange(cb);
      fixture.detectChanges();

      inputEl().value = '09:00';
      inputEl().dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(cb).toHaveBeenCalledWith('09:00');
    });
  });

  describe('registerOnTouched', () => {
    it('callback appelé au blur', () => {
      const cb = vi.fn();
      component.registerOnTouched(cb);

      inputEl().dispatchEvent(new Event('blur'));

      expect(cb).toHaveBeenCalled();
    });
  });

  describe('setDisabledState', () => {
    it('true → champ désactivé', () => {
      component.setDisabledState(true);
      fixture.detectChanges();

      expect(inputEl().disabled).toBe(true);
    });

    it('false → champ actif', () => {
      component.setDisabledState(true);
      component.setDisabledState(false);
      fixture.detectChanges();

      expect(inputEl().disabled).toBe(false);
    });
  });

  describe('rendu', () => {
    it('le label affiche le libellé', () => {
      expect(labelEl().textContent).toContain('Heure de début');
    });

    it('le type de l\'input est "time"', () => {
      expect(inputEl().type).toBe('time');
    });

    it('required=true ajoute l\'attribut required', () => {
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();

      expect(inputEl().required).toBe(true);
    });
  });
});
