import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { McRadioGroupComponent } from './mc-radio-group.component';
import { LIBELLES } from '../../libelles';

const OPTIONS = [
  { valeur: 'M', libelle: 'Masculin' },
  { valeur: 'F', libelle: 'Féminin' },
];

describe('McRadioGroupComponent', () => {
  let fixture: ComponentFixture<McRadioGroupComponent>;
  let component: McRadioGroupComponent;

  const radios = () =>
    fixture.debugElement
      .queryAll(By.css('input[type="radio"]'))
      .map((d) => d.nativeElement as HTMLInputElement);

  beforeEach(() => {
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(McRadioGroupComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'sexe');
    fixture.componentRef.setInput('label', 'Sexe');
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.detectChanges();
  });

  describe('writeValue', () => {
    it("'M' → radio Masculin coché dans le DOM", () => {
      component.writeValue('M');
      fixture.detectChanges();

      const checkedRadio = radios().find((r) => r.checked);
      expect(checkedRadio?.value).toBe('M');
    });

    it("'F' → radio Féminin coché", () => {
      component.writeValue('F');
      fixture.detectChanges();

      const checkedRadio = radios().find((r) => r.checked);
      expect(checkedRadio?.value).toBe('F');
    });

    it('null → aucun radio coché', () => {
      component.writeValue(null);
      fixture.detectChanges();

      expect(radios().every((r) => !r.checked)).toBe(true);
    });
  });

  describe('registerOnChange', () => {
    it('callback appelé avec la valeur sélectionnée', () => {
      const cb = vi.fn();
      component.registerOnChange(cb);
      fixture.detectChanges();

      radios()[1].click();
      fixture.detectChanges();

      expect(cb).toHaveBeenCalledWith('F');
    });
  });

  describe('registerOnTouched', () => {
    it("callback appelé au blur d'un radio", () => {
      const cb = vi.fn();
      component.registerOnTouched(cb);

      radios()[0].dispatchEvent(new Event('blur'));

      expect(cb).toHaveBeenCalled();
    });
  });

  describe('setDisabledState', () => {
    it('true → fieldset désactivé', () => {
      component.setDisabledState(true);
      fixture.detectChanges();

      const fieldset = fixture.debugElement.query(By.css('fieldset'))
        .nativeElement as HTMLFieldSetElement;
      expect(fieldset.disabled).toBe(true);
    });

    it('false → fieldset actif', () => {
      component.setDisabledState(true);
      component.setDisabledState(false);
      fixture.detectChanges();

      const fieldset = fixture.debugElement.query(By.css('fieldset'))
        .nativeElement as HTMLFieldSetElement;
      expect(fieldset.disabled).toBe(false);
    });
  });

  describe('effacement de la réponse', () => {
    const boutonEffacer = () =>
      fixture.debugElement.query(By.css('#btnEffacer_sexe'))?.nativeElement as
        | HTMLButtonElement
        | undefined;

    it('sans effacable → aucun bouton EFFACER, même avec une valeur', () => {
      component.writeValue('M');
      fixture.detectChanges();

      expect(boutonEffacer()).toBeUndefined();
    });

    it('effacable sans valeur → aucun bouton EFFACER', () => {
      fixture.componentRef.setInput('effacable', true);
      component.writeValue(null);
      fixture.detectChanges();

      expect(boutonEffacer()).toBeUndefined();
    });

    it('effacable avec une valeur → bouton EFFACER nommé avec le libellé du groupe', () => {
      fixture.componentRef.setInput('effacable', true);
      component.writeValue('M');
      fixture.detectChanges();

      expect(boutonEffacer()?.getAttribute('aria-label')).toBe(
        LIBELLES.commun.ariaEffacerReponse + 'Sexe',
      );
    });

    it('clic sur EFFACER → null émis, options décochées, focus sur la 1re option, bouton retiré', () => {
      const surChangement = vi.fn();
      const surTouche = vi.fn();
      component.registerOnChange(surChangement);
      component.registerOnTouched(surTouche);
      fixture.componentRef.setInput('effacable', true);
      component.writeValue('F');
      fixture.detectChanges();

      boutonEffacer()?.click();
      fixture.detectChanges();

      expect(surChangement).toHaveBeenCalledWith(null);
      expect(surTouche).toHaveBeenCalled();
      expect(radios().every((r) => !r.checked)).toBe(true);
      expect(document.activeElement).toBe(radios()[0]);
      expect(boutonEffacer()).toBeUndefined();
    });
  });

  describe('rendu', () => {
    it("autant de radios que d'options", () => {
      expect(radios()).toHaveLength(2);
    });

    it('legend affiche le libellé du groupe', () => {
      const legend = fixture.debugElement.query(By.css('legend')).nativeElement as HTMLElement;
      expect(legend.textContent).toContain('Sexe');
    });

    it('tous les radios partagent le même attribut name', () => {
      const noms = radios().map((r) => r.name);
      expect(new Set(noms).size).toBe(1);
    });

    it("required=true ajoute l'attribut required sur les radios", () => {
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();

      expect(radios().some((r) => r.required)).toBe(true);
    });
  });
});
