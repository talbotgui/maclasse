import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { FpFicheProjetComponent } from './fp-fiche-projet.component';
import { DonneesService } from '../../../services/avecEtat/donnees.service';
import { DonneesMother } from '../../../tests/donnees.mother';
import { ProjetMother } from '../../../tests/projet.mother';
import { EleveMother } from '../../../tests/eleve.mother';

describe('FpFicheProjetComponent', () => {
  let fixture: ComponentFixture<FpFicheProjetComponent>;
  let component: FpFicheProjetComponent;

  const alice = EleveMother.base('e1', 'MARTIN', 'Alice');
  const bob = EleveMother.base('e2', 'DUPONT', 'Bob');

  beforeEach(() => {
    TestBed.configureTestingModule({});
    TestBed.inject(DonneesService).charger(DonneesMother.base({
      classe: { ...DonneesMother.base().classe, eleves: [alice, bob] },
    }));
    fixture = TestBed.createComponent(FpFicheProjetComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('projet', ProjetMother.base({ elevesIds: ['e1', 'e2'] }));
    fixture.detectChanges();
  });

  describe('nomEleves', () => {
    it('retourne les noms formatés des élèves associés', () => {
      const noms = (component as any).nomEleves;
      expect(noms).toContain('MARTIN Alice');
      expect(noms).toContain('DUPONT Bob');
    });

    it('retourne l\'id brut si élève non trouvé', () => {
      fixture.componentRef.setInput('projet', ProjetMother.base({ elevesIds: ['inconnu'] }));
      fixture.detectChanges();

      expect((component as any).nomEleves).toContain('inconnu');
    });

    it('retourne "—" si aucun élève associé', () => {
      fixture.componentRef.setInput('projet', ProjetMother.base({ elevesIds: [] }));
      fixture.detectChanges();

      expect((component as any).nomEleves).toBe('—');
    });
  });

  describe('obtenirLibellesCompetences', () => {
    it('retourne un tableau vide si ids vides', () => {
      expect((component as any).obtenirLibellesCompetences([])).toEqual([]);
    });

    it('filtre les ids non résolus (libellé vide)', () => {
      const result = (component as any).obtenirLibellesCompetences(['id-inexistant']);
      expect(result).toEqual([]);
    });
  });

  describe('outputs', () => {
    it('modifier émet quand onModifier() est appelée', () => {
      const spy = vi.spyOn((component as any).modifier, 'emit');
      component['onModifier']();
      expect(spy).toHaveBeenCalled();
    });

    it('supprimer émet quand onSupprimer() est appelée', () => {
      const spy = vi.spyOn((component as any).supprimer, 'emit');
      component['onSupprimer']();
      expect(spy).toHaveBeenCalled();
    });

    it('imprimer émet quand onImprimer() est appelée', () => {
      const spy = vi.spyOn((component as any).imprimer, 'emit');
      component['onImprimer']();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('affichage DOM', () => {
    it('affiche le nom du projet', () => {
      expect(fixture.nativeElement.textContent).toContain('Compostage');
    });
  });
});
