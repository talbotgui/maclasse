import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { McInputComponent } from './mc-input.component';

describe('McInputComponent', () => {
  let fixture: ComponentFixture<McInputComponent>;
  let component: McInputComponent;

  const inputEl = () => fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
  const labelEl = () => fixture.debugElement.query(By.css('label')).nativeElement as HTMLLabelElement;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(McInputComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'champTest');
    fixture.componentRef.setInput('label', 'Prénom');
    fixture.detectChanges();
  });

  describe('writeValue', () => {
    it('valeur normale → signal interne mis à jour', () => {
      component.writeValue('Marie');

      expect((component as any).valeur()).toBe('Marie');
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

      inputEl().value = 'Marie';
      inputEl().dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(cb).toHaveBeenCalledWith('Marie');
    });
  });

  describe('registerOnTouched', () => {
    it('callback appelé au blur', () => {
      const cb = vi.fn();
      component.registerOnTouched(cb);

      inputEl().dispatchEvent(new Event('blur'));
      fixture.detectChanges();

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
      expect(labelEl().textContent).toContain('Prénom');
    });

    it('label for correspond à l\'id de l\'input', () => {
      expect(labelEl().getAttribute('for')).toBe('champTest-input');
      expect(inputEl().id).toBe('champTest-input');
    });

    it('type par défaut est "text"', () => {
      expect(inputEl().type).toBe('text');
    });

    it('type=email applique le type email', () => {
      fixture.componentRef.setInput('type', 'email');
      fixture.detectChanges();

      expect(inputEl().type).toBe('email');
    });

    it('placeholder est affiché', () => {
      fixture.componentRef.setInput('placeholder', 'Saisir un prénom');
      fixture.detectChanges();

      expect(inputEl().placeholder).toBe('Saisir un prénom');
    });

    it('required=true ajoute l\'attribut required', () => {
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();

      expect(inputEl().required).toBe(true);
    });
  });
});
