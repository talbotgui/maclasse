import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { McCheckboxComponent } from './mc-checkbox.component';

describe('McCheckboxComponent', () => {
  let fixture: ComponentFixture<McCheckboxComponent>;
  let component: McCheckboxComponent;

  const checkboxEl = () => fixture.debugElement.query(By.css('input[type="checkbox"]')).nativeElement as HTMLInputElement;
  const labelEl = () => fixture.debugElement.query(By.css('label')).nativeElement as HTMLLabelElement;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(McCheckboxComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'accepte');
    fixture.componentRef.setInput('label', 'J\'accepte');
    fixture.detectChanges();
  });

  describe('writeValue', () => {
    it('true → case cochée dans le DOM', () => {
      component.writeValue(true);
      fixture.detectChanges();

      expect(checkboxEl().checked).toBe(true);
    });

    it('false → case décochée', () => {
      component.writeValue(true);
      component.writeValue(false);
      fixture.detectChanges();

      expect(checkboxEl().checked).toBe(false);
    });

    it('null → case décochée', () => {
      component.writeValue(null);
      fixture.detectChanges();

      expect(checkboxEl().checked).toBe(false);
    });

    it('undefined → case décochée', () => {
      component.writeValue(undefined);
      fixture.detectChanges();

      expect(checkboxEl().checked).toBe(false);
    });
  });

  describe('registerOnChange', () => {
    it('callback appelé avec true quand la case est cochée', () => {
      const cb = vi.fn();
      component.registerOnChange(cb);
      fixture.detectChanges();

      checkboxEl().checked = true;
      checkboxEl().dispatchEvent(new Event('change'));
      fixture.detectChanges();

      expect(cb).toHaveBeenCalledWith(true);
    });

    it('callback appelé avec false quand la case est décochée', () => {
      const cb = vi.fn();
      component.registerOnChange(cb);
      component.writeValue(true);
      fixture.detectChanges();

      checkboxEl().checked = false;
      checkboxEl().dispatchEvent(new Event('change'));
      fixture.detectChanges();

      expect(cb).toHaveBeenCalledWith(false);
    });
  });

  describe('registerOnTouched', () => {
    it('callback appelé au blur', () => {
      const cb = vi.fn();
      component.registerOnTouched(cb);

      checkboxEl().dispatchEvent(new Event('blur'));

      expect(cb).toHaveBeenCalled();
    });
  });

  describe('setDisabledState', () => {
    it('true → case désactivée', () => {
      component.setDisabledState(true);
      fixture.detectChanges();

      expect(checkboxEl().disabled).toBe(true);
    });

    it('false → case active', () => {
      component.setDisabledState(true);
      component.setDisabledState(false);
      fixture.detectChanges();

      expect(checkboxEl().disabled).toBe(false);
    });
  });

  describe('rendu', () => {
    it('le label affiche le libellé', () => {
      expect(labelEl().textContent).toContain("J'accepte");
    });

    it('label for correspond à l\'id', () => {
      expect(labelEl().getAttribute('for')).toBe('accepte');
      expect(checkboxEl().id).toBe('accepte');
    });

    it('required=true ajoute l\'attribut required', () => {
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();

      expect(checkboxEl().required).toBe(true);
    });
  });
});
