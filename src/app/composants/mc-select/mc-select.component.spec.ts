import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { LIBELLES } from '../../libelles';
import { McSelectComponent } from './mc-select.component';

const OPTIONS = [
  { valeur: 'CM1', libelle: 'CM1' },
  { valeur: 'CM2', libelle: 'CM2' },
];

describe('McSelectComponent', () => {
  let fixture: ComponentFixture<McSelectComponent>;
  let component: McSelectComponent;

  const selectEl = () =>
    fixture.debugElement.query(By.css('select')).nativeElement as HTMLSelectElement;
  const optionEls = () =>
    fixture.debugElement
      .queryAll(By.css('option'))
      .map((d) => d.nativeElement as HTMLOptionElement);

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
    it("callback appelé lors d'un changement", () => {
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
    it("avecOptionVide=false → pas d'option vide", () => {
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

  describe('valeurAffichee — cohérence quand la valeur ne correspond à aucune option', () => {
    it('valeur absente des options → option désactivée affichant la valeur inconnue', () => {
      component.writeValue('INEXISTANT');
      fixture.detectChanges();

      expect(selectEl().value).toBe('INEXISTANT');
      expect(selectEl().selectedOptions[0].disabled).toBe(true);
      expect(selectEl().selectedOptions[0].textContent?.trim()).toBe(
        `INEXISTANT (${LIBELLES.commun.valeurInconnue})`,
      );
      expect(optionEls()).toHaveLength(3);
    });

    it('valeur inconnue avec avecOptionVide=true → option vide + option inconnue sélectionnée', () => {
      fixture.componentRef.setInput('avecOptionVide', true);
      component.writeValue('INEXISTANT');
      fixture.detectChanges();

      expect(selectEl().value).toBe('INEXISTANT');
      expect(optionEls()).toHaveLength(4);
    });

    it('passage d’une valeur inconnue à une valeur valide → l’option inconnue disparaît', () => {
      component.writeValue('INEXISTANT');
      fixture.detectChanges();
      component.writeValue('CM2');
      fixture.detectChanges();

      expect(selectEl().value).toBe('CM2');
      expect(optionEls()).toHaveLength(2);
    });

    it('valeur vide sans option vide → première option affichée, pas d’option inconnue', () => {
      component.writeValue('');
      fixture.detectChanges();

      expect(selectEl().value).toBe('CM1');
      expect(optionEls()).toHaveLength(2);
    });

    it('avecOptionVide=true et valeur vide → le DOM affiche l’option vide', () => {
      fixture.componentRef.setInput('avecOptionVide', true);
      component.writeValue('');
      fixture.detectChanges();

      expect(selectEl().value).toBe('');
      expect((component as any).valeurAffichee()).toBe('');
    });

    it('valeur correspondant à une option → conservée telle quelle', () => {
      component.writeValue('CM2');
      fixture.detectChanges();

      expect((component as any).valeurAffichee()).toBe('CM2');
    });
  });

  describe('rendu', () => {
    it("autant d'options que de valeurs (sans option vide)", () => {
      expect(optionEls()).toHaveLength(2);
    });

    it('required=true → attribut required sur le select', () => {
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();

      expect(selectEl().required).toBe(true);
    });
  });
});
