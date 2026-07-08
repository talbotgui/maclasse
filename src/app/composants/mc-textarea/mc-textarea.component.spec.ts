import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { McTextareaComponent } from './mc-textarea.component';

describe('McTextareaComponent', () => {
  let fixture: ComponentFixture<McTextareaComponent>;
  let component: McTextareaComponent;

  const textareaEl = () =>
    fixture.debugElement.query(By.css('textarea')).nativeElement as HTMLTextAreaElement;
  const labelEl = () =>
    fixture.debugElement.query(By.css('label')).nativeElement as HTMLLabelElement;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(McTextareaComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'remarques');
    fixture.componentRef.setInput('label', 'Remarques');
    fixture.detectChanges();
  });

  describe('writeValue', () => {
    it('valeur normale → signal interne mis à jour', () => {
      component.writeValue('Un texte');

      expect((component as any).valeur()).toBe('Un texte');
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
    it('callback appelé lors de la saisie', () => {
      const cb = vi.fn();
      component.registerOnChange(cb);
      fixture.detectChanges();

      textareaEl().value = 'Nouveau texte';
      textareaEl().dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(cb).toHaveBeenCalledWith('Nouveau texte');
    });
  });

  describe('registerOnTouched', () => {
    it('callback appelé au blur', () => {
      const cb = vi.fn();
      component.registerOnTouched(cb);

      textareaEl().dispatchEvent(new Event('blur'));

      expect(cb).toHaveBeenCalled();
    });
  });

  describe('setDisabledState', () => {
    it('true → textarea désactivé', () => {
      component.setDisabledState(true);
      fixture.detectChanges();

      expect(textareaEl().disabled).toBe(true);
    });

    it('false → textarea actif', () => {
      component.setDisabledState(true);
      component.setDisabledState(false);
      fixture.detectChanges();

      expect(textareaEl().disabled).toBe(false);
    });
  });

  describe('rendu', () => {
    it('le label affiche le libellé', () => {
      expect(labelEl().textContent).toContain('Remarques');
    });

    it("label for correspond à l'id", () => {
      expect(labelEl().getAttribute('for')).toBe('remarques');
      expect(textareaEl().id).toBe('remarques');
    });

    it('lignes=5 → attribut rows=5', () => {
      fixture.componentRef.setInput('lignes', 5);
      fixture.detectChanges();

      expect(textareaEl().rows).toBe(5);
    });

    it('placeholder est affiché', () => {
      fixture.componentRef.setInput('placeholder', 'Saisir des remarques');
      fixture.detectChanges();

      expect(textareaEl().placeholder).toBe('Saisir des remarques');
    });

    it("required=true ajoute l'attribut required", () => {
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();

      expect(textareaEl().required).toBe(true);
    });
  });
});
