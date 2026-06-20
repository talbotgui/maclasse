import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { CjFormulaireSeanceComponent } from './cj-formulaire-seance.component';
import { DonneesService } from '../../../services/avecEtat/donnees.service';
import { DonneesMother } from '../../../tests/donnees.mother';
import { SeanceMother } from '../../../tests/cahier-journal.mother';
import type { Seance } from '../../../modeles/cahier-journal.modele';
import type { ElevesConcernes } from '../../../modeles/emploi-du-temps.modele';

describe('CjFormulaireSeanceComponent', () => {
  let fixture: ComponentFixture<CjFormulaireSeanceComponent>;
  let component: CjFormulaireSeanceComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    TestBed.inject(DonneesService).charger(DonneesMother.base());
    fixture = TestBed.createComponent(CjFormulaireSeanceComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('domaines', [
      { id: 'd1', libelle: 'Français', enfants: [] },
    ]);
    fixture.detectChanges();
  });

  describe('initialisation', () => {
    it('seance=null → formSeance vide avec valeurs par défaut', () => {
      fixture.componentRef.setInput('seance', null);
      fixture.detectChanges();

      expect((component as any).formSeance.id).toBeTruthy();
      expect((component as any).formSeance.heureDebut).toBe('08:00');
      expect((component as any).formSeance.heureFin).toBe('09:00');
      expect((component as any).formSeance.type).toBe('pedagogique');
    });

    it('seance existante → formSeance est un clone', () => {
      const seance = SeanceMother.pedagogique({ id: 's1', heureDebut: '10:00' });
      fixture.componentRef.setInput('seance', seance);
      fixture.detectChanges();

      expect((component as any).formSeance.heureDebut).toBe('10:00');
      expect((component as any).formSeance).not.toBe(seance);
    });

    it('changement de seance → formSeance rechargé', () => {
      const s1 = SeanceMother.pedagogique({ heureDebut: '09:00' });
      const s2 = SeanceMother.pedagogique({ heureDebut: '11:00' });
      fixture.componentRef.setInput('seance', s1);
      fixture.detectChanges();
      fixture.componentRef.setInput('seance', s2);
      fixture.detectChanges();

      expect((component as any).formSeance.heureDebut).toBe('11:00');
    });
  });

  describe('basculerDiscipline', () => {
    it('ajoute une discipline absente', () => {
      (component as any).basculerDiscipline('d1', true);

      expect((component as any).formSeance.disciplinesIds).toContain('d1');
    });

    it('retire une discipline présente', () => {
      (component as any).formSeance.disciplinesIds = ['d1'];

      (component as any).basculerDiscipline('d1', false);

      expect((component as any).formSeance.disciplinesIds).not.toContain('d1');
    });


  });

  describe('surSelectionCompetences', () => {
    it('remplace les competencesIds du formSeance', () => {
      (component as any).surSelectionCompetences(['c1', 'c2']);

      expect((component as any).formSeance.competencesIds).toEqual(['c1', 'c2']);
    });
  });

  describe('surElevesConcernesChange', () => {
    it('met à jour elevesConcernes du formSeance', () => {
      const val: ElevesConcernes = { type: 'groupes', groupes: ['GA'], elevesIds: [] };

      (component as any).surElevesConcernesChange(val);

      expect((component as any).formSeance.elevesConcernes).toEqual(val);
    });
  });

  describe('onEnregistrer', () => {
    it('émet la séance clonée avec les champs string vides convertis en undefined', () => {
      const seance = SeanceMother.pedagogique({
        id: 's1',
        titre: '',
        objectifs: '',
        deroulement: 'déroulement',
      });
      fixture.componentRef.setInput('seance', seance);
      fixture.detectChanges();

      const emis: Seance[] = [];
      (component as any).enregistrer.subscribe((v: Seance) => emis.push(v));

      (component as any).onEnregistrer();

      expect(emis).toHaveLength(1);
      expect(emis[0].titre).toBeUndefined();
      expect(emis[0].objectifs).toBeUndefined();
      expect(emis[0].deroulement).toBe('déroulement');
      expect(emis[0]).not.toBe((component as any).formSeance);
    });

    it('émet une séance avec toutes les chaînes présentes conservées', () => {
      const seance = SeanceMother.pedagogique({
        titre: 'Titre',
        objectifs: 'Objectifs',
      });
      fixture.componentRef.setInput('seance', seance);
      fixture.detectChanges();

      const emis: Seance[] = [];
      (component as any).enregistrer.subscribe((v: Seance) => emis.push(v));

      (component as any).onEnregistrer();

      expect(emis[0].titre).toBe('Titre');
      expect(emis[0].objectifs).toBe('Objectifs');
    });
  });
});
