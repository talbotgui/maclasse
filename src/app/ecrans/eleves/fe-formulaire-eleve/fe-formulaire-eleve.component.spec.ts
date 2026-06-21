import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { FeFormulaireEleveComponent } from './fe-formulaire-eleve.component';
import { EleveMother } from '../../../tests/eleve.mother';
import type { Eleve } from '../../../modeles/eleve.modele';

describe('FeFormulaireEleveComponent', () => {
  let fixture: ComponentFixture<FeFormulaireEleveComponent>;
  let component: FeFormulaireEleveComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(FeFormulaireEleveComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('groupes', [{ id: 'GA', libelle: 'Groupe A' }]);
    fixture.componentRef.setInput('statutsEleve', [{ id: 'DC', libelle: 'Dans la classe' }]);
    fixture.componentRef.setInput('typesContact', [{ id: 'P', libelle: 'Père' }]);
    fixture.detectChanges();
  });

  describe('initialisation', () => {
    it('eleve=null → formEleve créé vide avec id UUID', () => {
      fixture.componentRef.setInput('eleve', null);
      fixture.detectChanges();

      expect((component as any).formEleve.id).toBeTruthy();
      expect((component as any).formEleve.nom).toBe('');
      expect((component as any).formEleve.prenom).toBe('');
    });

    it('eleve existant → formEleve est un clone avec les mêmes données', () => {
      const eleve = EleveMother.base('e1', 'MARTIN', 'Alice');
      fixture.componentRef.setInput('eleve', eleve);
      fixture.detectChanges();

      expect((component as any).formEleve.nom).toBe('MARTIN');
      expect((component as any).formEleve.prenom).toBe('Alice');
      expect((component as any).formEleve).not.toBe(eleve);
    });

    it('changement de l\'input eleve → formEleve rechargé', () => {
      const e1 = EleveMother.base('e1', 'MARTIN', 'Alice');
      const e2 = EleveMother.base('e2', 'DUPONT', 'Bob');
      fixture.componentRef.setInput('eleve', e1);
      fixture.detectChanges();
      fixture.componentRef.setInput('eleve', e2);
      fixture.detectChanges();

      expect((component as any).formEleve.nom).toBe('DUPONT');
    });
  });

  describe('optionsStatut / optionsTypeContact', () => {
    it('optionsStatut mappées depuis statutsEleve', () => {
      const opts = (component as any).optionsStatut;
      expect(opts).toEqual([{ valeur: 'DC', libelle: 'Dans la classe' }]);
    });

    it('optionsTypeContact mappées depuis typesContact', () => {
      const opts = (component as any).optionsTypeContact;
      expect(opts).toEqual([{ valeur: 'P', libelle: 'Père' }]);
    });
  });

  describe('basculerGroupe', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('eleve', EleveMother.base('e1', 'M', 'A'));
      fixture.detectChanges();
    });

    it('ajoute un groupe absent de la sélection', () => {
      (component as any).basculerGroupe('GA', true);

      expect((component as any).formEleve.groupes).toContain('GA');
    });

    it('retire un groupe présent', () => {
      (component as any).formEleve.groupes = ['GA'];

      (component as any).basculerGroupe('GA', false);

      expect((component as any).formEleve.groupes).not.toContain('GA');
    });

    it('n\'ajoute pas un groupe déjà présent', () => {
      (component as any).formEleve.groupes = ['GA'];

      (component as any).basculerGroupe('GA', true);

      expect((component as any).formEleve.groupes.filter((g: string) => g === 'GA')).toHaveLength(1);
    });
  });

  describe('ajouterContact / supprimerContact', () => {
    it('ajouterContact ajoute un contact vide', () => {
      (component as any).ajouterContact();

      expect((component as any).formEleve.contacts).toHaveLength(1);
    });

    it('supprimerContact(0) retire le premier contact', () => {
      (component as any).ajouterContact();
      (component as any).ajouterContact();

      (component as any).supprimerContact(0);

      expect((component as any).formEleve.contacts).toHaveLength(1);
    });
  });

  describe('ajouterAbsenceRecurrente / supprimerAbsenceRecurrente', () => {
    it('ajouterAbsenceRecurrente ajoute une absence avec id UUID', () => {
      (component as any).ajouterAbsenceRecurrente();

      const absences = (component as any).formEleve.absencesRecurrentes;
      expect(absences).toHaveLength(1);
      expect(absences[0].id).toBeTruthy();
    });

    it('supprimerAbsenceRecurrente(0) retire à l\'index 0', () => {
      (component as any).ajouterAbsenceRecurrente();
      (component as any).ajouterAbsenceRecurrente();

      (component as any).supprimerAbsenceRecurrente(0);

      expect((component as any).formEleve.absencesRecurrentes).toHaveLength(1);
    });
  });

  describe('ajouterAbsencePonctuelle / supprimerAbsencePonctuelle', () => {
    it('ajouterAbsencePonctuelle ajoute une absence avec id UUID', () => {
      (component as any).ajouterAbsencePonctuelle();

      const absences = (component as any).formEleve.absencesPonctuelles;
      expect(absences).toHaveLength(1);
      expect(absences[0].id).toBeTruthy();
    });

    it('supprimerAbsencePonctuelle(0) retire à l\'index 0', () => {
      (component as any).ajouterAbsencePonctuelle();
      (component as any).ajouterAbsencePonctuelle();

      (component as any).supprimerAbsencePonctuelle(0);

      expect((component as any).formEleve.absencesPonctuelles).toHaveLength(1);
    });
  });

  describe('ajouterCursus / supprimerCursus', () => {
    it('ajouterCursus ajoute avec l\'année courante', () => {
      (component as any).ajouterCursus();

      const cursus = (component as any).formEleve.cursus;
      expect(cursus).toHaveLength(1);
      expect(cursus[0].annee).toBe(new Date().getFullYear());
    });

    it('supprimerCursus(0) retire à l\'index 0', () => {
      (component as any).ajouterCursus();
      (component as any).ajouterCursus();

      (component as any).supprimerCursus(0);

      expect((component as any).formEleve.cursus).toHaveLength(1);
    });
  });

  describe('onEnregistrer', () => {
    it('émet un clone de formEleve', () => {
      const eleve = EleveMother.base('e1', 'MARTIN', 'Alice');
      fixture.componentRef.setInput('eleve', eleve);
      fixture.detectChanges();

      const spy = vi.spyOn((component as any).enregistrer, 'emit');

      (component as any).onEnregistrer();

      expect(spy).toHaveBeenCalledTimes(1);
      const emis = spy.mock.calls[0][0] as Eleve;
      expect(emis.nom).toBe('MARTIN');
      expect(emis).not.toBe((component as any).formEleve);
    });
  });

  describe('annuler', () => {
    it('onAnnuler émet l\'output annuler', () => {
      const spy = vi.spyOn((component as any).annuler, 'emit');

      (component as any).onAnnuler();

      expect(spy).toHaveBeenCalled();
    });
  });
});
