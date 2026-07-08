import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { FpFormulaireProjetComponent } from './fp-formulaire-projet.component';
import { DonneesService } from '../../../services/avecEtat/donnees.service';
import { DonneesMother } from '../../../tests/donnees.mother';
import { ProjetMother } from '../../../tests/projet.mother';
import { EleveMother } from '../../../tests/eleve.mother';
import type { Projet } from '../../../modeles/projet.modele';

describe('FpFormulaireProjetComponent', () => {
  let fixture: ComponentFixture<FpFormulaireProjetComponent>;
  let component: FpFormulaireProjetComponent;
  let donneesService: DonneesService;

  const alice = EleveMother.base('e1', 'MARTIN', 'Alice');
  const bob = EleveMother.base('e2', 'DUPONT', 'Bob');

  beforeEach(() => {
    TestBed.configureTestingModule({});
    donneesService = TestBed.inject(DonneesService);
    donneesService.charger(
      DonneesMother.base({
        classe: { ...DonneesMother.base().classe, eleves: [alice, bob] },
      }),
    );
    fixture = TestBed.createComponent(FpFormulaireProjetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialisation', () => {
    it('projet=null → formProjet créé vide avec id UUID', () => {
      fixture.componentRef.setInput('projet', null);
      fixture.detectChanges();

      expect((component as any).formProjet.id).toBeTruthy();
      expect((component as any).formProjet.nom).toBe('');
      expect((component as any).formProjet.periodes).toEqual([]);
    });

    it('projet existant → formProjet est un clone', () => {
      const projet = ProjetMother.base({ id: 'p1', nom: 'Compostage' });
      fixture.componentRef.setInput('projet', projet);
      fixture.detectChanges();

      expect((component as any).formProjet.nom).toBe('Compostage');
      expect((component as any).formProjet).not.toBe(projet);
    });

    it("changement de l'input projet → formProjet rechargé", () => {
      const p1 = ProjetMother.base({ id: 'p1', nom: 'Sciences' });
      const p2 = ProjetMother.base({ id: 'p2', nom: 'Arts' });
      fixture.componentRef.setInput('projet', p1);
      fixture.detectChanges();
      fixture.componentRef.setInput('projet', p2);
      fixture.detectChanges();

      expect((component as any).formProjet.nom).toBe('Arts');
    });
  });

  describe('eleves (computed depuis donneesService)', () => {
    it('retourne les élèves chargés', () => {
      const eleves = (component as any).eleves();
      expect(eleves).toHaveLength(2);
    });
  });

  describe('basculerEleve', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('projet', ProjetMother.base({ elevesIds: [] }));
      fixture.detectChanges();
    });

    it('ajoute un élève absent', () => {
      (component as any).basculerEleve('e1', true);

      expect((component as any).formProjet.elevesIds).toContain('e1');
    });

    it('retire un élève présent', () => {
      (component as any).formProjet.elevesIds = ['e1'];

      (component as any).basculerEleve('e1', false);

      expect((component as any).formProjet.elevesIds).not.toContain('e1');
    });

    it("n'ajoute pas un élève déjà présent", () => {
      (component as any).formProjet.elevesIds = ['e1'];

      (component as any).basculerEleve('e1', true);

      expect(
        (component as any).formProjet.elevesIds.filter((id: string) => id === 'e1'),
      ).toHaveLength(1);
    });
  });

  describe('ajouterPeriode / supprimerPeriode', () => {
    it('ajouterPeriode ajoute une période vide', () => {
      (component as any).ajouterPeriode();

      expect((component as any).formProjet.periodes).toHaveLength(1);
      expect((component as any).formProjet.periodes[0].periodeNom).toBe('');
    });

    it("supprimerPeriode(0) retire à l'index 0", () => {
      (component as any).ajouterPeriode();
      (component as any).ajouterPeriode();

      (component as any).supprimerPeriode(0);

      expect((component as any).formProjet.periodes).toHaveLength(1);
    });
  });

  describe('surSelectionCompetences', () => {
    it("met à jour les competencesIds de la période à l'index donné", () => {
      (component as any).ajouterPeriode();
      (component as any).ajouterPeriode();

      (component as any).surSelectionCompetences(1, ['c1', 'c2']);

      expect((component as any).formProjet.periodes[0].competencesIds).toEqual([]);
      expect((component as any).formProjet.periodes[1].competencesIds).toEqual(['c1', 'c2']);
    });
  });

  describe('onEnregistrer', () => {
    it('émet un clone de formProjet', () => {
      const projet = ProjetMother.base({ id: 'p1', nom: 'Sciences' });
      fixture.componentRef.setInput('projet', projet);
      fixture.detectChanges();

      const spy = vi.spyOn((component as any).enregistrer, 'emit');

      (component as any).onEnregistrer();

      expect(spy).toHaveBeenCalledTimes(1);
      const emis = spy.mock.calls[0][0] as Projet;
      expect(emis.nom).toBe('Sciences');
      expect(emis).not.toBe((component as any).formProjet);
    });
  });
});
