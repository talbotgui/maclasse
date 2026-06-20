import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { McSelectComponent } from './mc-select.component';

const OPTIONS = [
  { valeur: 'CM1', libelle: 'CM1' },
  { valeur: 'CM2', libelle: 'CM2' },
];

describe('McSelectComponent', () => {
  let fixture: ComponentFixture<McSelectComponent>;
  let component: McSelectComponent;

  const selectEl = () => fixture.debugElement.query(By.css('select')).nativeElement as HTMLSelectElement;
  const optionEls = () => fixture.debugElement.queryAll(By.css('option')).map(d => d.nativeElement as HTMLOptionElement);

  beforeEach(() => {
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(McSelectComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'niveau');
    fixture.componentRef.setInput('label', 'Niveau');
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.detectChanges();
  });

  describe('writeValue', () => {
    it('valeur existante → option sélectionnée dans le DOM', () => {
      component.writeValue('CM2');
      fixture.detectChanges();

      expect(selectEl().value).toBe('CM2');
    });

    it('null → valeur vide', () => {
      component.writeValue(null);
      fixture.detectChanges();

      expect((component as any).valeur()).toBe('');
    });
  });

  describe('registerOnChange', () => {
    it('callback appelé lors d\'un changement', () => {
      const cb = vi.fn();
      component.registerOnChange(cb);
      fixture.detectChanges();

      selectEl().value = 'CM2';
      selectEl().dispatchEvent(new Event('change'));
      fixture.detectChanges();

      expect(cb).toHaveBeenCalledWith('CM2');
    });
  });

  describe('registerOnTouched', () => {
    it('callback appelé au blur', () => {
      const cb = vi.fn();
      component.registerOnTouched(cb);

      selectEl().dispatchEvent(new Event('blur'));

      expect(cb).toHaveBeenCalled();
    });
  });

  describe('setDisabledState', () => {
    it('true → select désactivé', () => {
      component.setDisabledState(true);
      fixture.detectChanges();

      expect(selectEl().disabled).toBe(true);
    });

    it('false → select actif', () => {
      component.setDisabledState(true);
      component.setDisabledState(false);
      fixture.detectChanges();

      expect(selectEl().disabled).toBe(false);
    });
  });

  describe('option vide', () => {
    it('avecOptionVide=false → pas d\'option vide', () => {
      fixture.componentRef.setInput('avecOptionVide', false);
      fixture.detectChanges();

      expect(optionEls()).toHaveLength(2);
    });

    it('avecOptionVide=true → option vide présente en premier', () => {
      fixture.componentRef.setInput('avecOptionVide', true);
      fixture.detectChanges();

      const opts = optionEls();
      expect(opts.length).toBeGreaterThanOrEqual(3);
      expect(opts[0].value).toBe('');
    });
  });

  describe('rendu', () => {
    it('autant d\'options que de valeurs (sans option vide)', () => {
      expect(optionEls()).toHaveLength(2);
    });

    it('required=true → attribut required sur le select', () => {
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();

      expect(selectEl().required).toBe(true);
    });
  });
});
