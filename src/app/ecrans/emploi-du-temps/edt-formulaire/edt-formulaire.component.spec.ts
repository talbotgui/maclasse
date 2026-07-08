import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { EdtFormulaireComponent } from './edt-formulaire.component';
import { DonneesService } from '../../../services/avecEtat/donnees.service';
import { DonneesMother } from '../../../tests/donnees.mother';
import { EdtMother, CreneauMother } from '../../../tests/emploi-du-temps.mother';
import type {
  EmploiDuTemps,
  CreneauEdt,
  ElevesConcernes,
} from '../../../modeles/emploi-du-temps.modele';

describe('EdtFormulaireComponent', () => {
  let fixture: ComponentFixture<EdtFormulaireComponent>;
  let component: EdtFormulaireComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    TestBed.inject(DonneesService).charger(DonneesMother.base());
    fixture = TestBed.createComponent(EdtFormulaireComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('domaines', [{ id: 'd1', libelle: 'Français', enfants: [] }]);
    fixture.detectChanges();
  });

  describe('initialisation EDT', () => {
    it('edt=null → formEdt=null', () => {
      fixture.componentRef.setInput('edt', null);
      fixture.detectChanges();

      expect((component as any).formEdt).toBeNull();
    });

    it('edt fourni → formEdt est un clone', () => {
      const edt = EdtMother.base({ nom: 'Mon EDT' });
      fixture.componentRef.setInput('edt', edt);
      fixture.detectChanges();

      expect((component as any).formEdt.nom).toBe('Mon EDT');
      expect((component as any).formEdt).not.toBe(edt);
    });

    it("changement d'edt → formEdt rechargé", () => {
      const e1 = EdtMother.base({ nom: 'EDT 1' });
      const e2 = EdtMother.base({ nom: 'EDT 2' });
      fixture.componentRef.setInput('edt', e1);
      fixture.detectChanges();
      fixture.componentRef.setInput('edt', e2);
      fixture.detectChanges();

      expect((component as any).formEdt.nom).toBe('EDT 2');
    });
  });

  describe('initialisation créneau', () => {
    it('creneau=null → formCreneau=null', () => {
      fixture.componentRef.setInput('creneau', null);
      fixture.detectChanges();

      expect((component as any).formCreneau).toBeNull();
    });

    it('creneau fourni → formCreneau est un clone', () => {
      const creneau = CreneauMother.lundi9h10({ heureDebut: '10:00' });
      fixture.componentRef.setInput('creneau', creneau);
      fixture.detectChanges();

      expect((component as any).formCreneau.heureDebut).toBe('10:00');
      expect((component as any).formCreneau).not.toBe(creneau);
    });

    it('changement de créneau → formCreneau rechargé', () => {
      const c1 = CreneauMother.lundi9h10({ heureDebut: '09:00' });
      const c2 = CreneauMother.lundi9h10({ heureDebut: '11:00' });
      fixture.componentRef.setInput('creneau', c1);
      fixture.detectChanges();
      fixture.componentRef.setInput('creneau', c2);
      fixture.detectChanges();

      expect((component as any).formCreneau.heureDebut).toBe('11:00');
    });
  });

  describe('estEditionCreneau', () => {
    it('false si creneau=null', () => {
      fixture.componentRef.setInput('creneau', null);
      fixture.detectChanges();

      expect((component as any).estEditionCreneau()).toBe(false);
    });

    it('true si creneau a un id', () => {
      fixture.componentRef.setInput('creneau', CreneauMother.lundi9h10({ id: 'c1' }));
      fixture.detectChanges();

      expect((component as any).estEditionCreneau()).toBe(true);
    });

    it('false si creneau sans id', () => {
      fixture.componentRef.setInput('creneau', CreneauMother.lundi9h10({ id: '' }));
      fixture.detectChanges();

      expect((component as any).estEditionCreneau()).toBe(false);
    });
  });

  describe('basculerDiscipline', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('creneau', CreneauMother.lundi9h10());
      fixture.detectChanges();
    });

    it('ajoute une discipline absente', () => {
      (component as any).basculerDiscipline('d1', true);

      expect((component as any).formCreneau.disciplinesIds).toContain('d1');
    });

    it('retire une discipline présente', () => {
      (component as any).formCreneau.disciplinesIds = ['d1'];

      (component as any).basculerDiscipline('d1', false);

      expect((component as any).formCreneau.disciplinesIds).not.toContain('d1');
    });

    it('ne fait rien si formCreneau=null', () => {
      fixture.componentRef.setInput('creneau', null);
      fixture.detectChanges();

      expect(() => (component as any).basculerDiscipline('d1', true)).not.toThrow();
    });
  });

  describe('surElevesConcernesChange', () => {
    it('met à jour elevesConcernes du formCreneau', () => {
      fixture.componentRef.setInput('creneau', CreneauMother.lundi9h10());
      fixture.detectChanges();
      const val: ElevesConcernes = { type: 'groupes', groupes: ['GA'], elevesIds: [] };

      (component as any).surElevesConcernesChange(val);

      expect((component as any).formCreneau.elevesConcernes).toEqual(val);
    });

    it('ne fait rien si formCreneau=null', () => {
      fixture.componentRef.setInput('creneau', null);
      fixture.detectChanges();

      expect(() =>
        (component as any).surElevesConcernesChange({ type: 'classe', groupes: [], elevesIds: [] }),
      ).not.toThrow();
    });
  });

  describe('onEnregistrerEdt', () => {
    it('émet un clone de formEdt', () => {
      const edt = EdtMother.base({ nom: 'Semaine A' });
      fixture.componentRef.setInput('edt', edt);
      fixture.detectChanges();

      const spy = vi.spyOn((component as any).edtEnregistre, 'emit');

      (component as any).onEnregistrerEdt();

      expect(spy).toHaveBeenCalledTimes(1);
      const emis = spy.mock.calls[0][0] as EmploiDuTemps;
      expect(emis.nom).toBe('Semaine A');
      expect(emis).not.toBe((component as any).formEdt);
    });

    it("n'émet pas si formEdt=null", () => {
      fixture.componentRef.setInput('edt', null);
      fixture.detectChanges();

      const spy = vi.spyOn((component as any).edtEnregistre, 'emit');

      (component as any).onEnregistrerEdt();

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('onEnregistrerCreneau', () => {
    it('émet un clone de formCreneau', () => {
      const creneau = CreneauMother.lundi9h10({ heureDebut: '09:00' });
      fixture.componentRef.setInput('creneau', creneau);
      fixture.detectChanges();

      const spy = vi.spyOn((component as any).creneauEnregistre, 'emit');

      (component as any).onEnregistrerCreneau();

      expect(spy).toHaveBeenCalledTimes(1);
      const emis = spy.mock.calls[0][0] as CreneauEdt;
      expect(emis.heureDebut).toBe('09:00');
      expect(emis).not.toBe((component as any).formCreneau);
    });

    it("n'émet pas si formCreneau=null", () => {
      fixture.componentRef.setInput('creneau', null);
      fixture.detectChanges();

      const spy = vi.spyOn((component as any).creneauEnregistre, 'emit');

      (component as any).onEnregistrerCreneau();

      expect(spy).not.toHaveBeenCalled();
    });
  });
});
