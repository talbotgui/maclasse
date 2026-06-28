import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { FeFicheEleveComponent } from './fe-fiche-eleve.component';
import { EleveMother } from '../../../tests/eleve.mother';

describe('FeFicheEleveComponent', () => {
  let fixture: ComponentFixture<FeFicheEleveComponent>;
  let component: FeFicheEleveComponent;

  const groupes = [
    { id: 'GA', libelle: 'Groupe A' },
    { id: 'GB', libelle: 'Groupe B' },
  ];
  const statutsEleve = [{ id: 'DC', libelle: 'Dans la classe' }];
  const typesContact = [{ id: 'P', libelle: 'Père' }];
  const eleve = EleveMother.base('e1', 'MARTIN', 'Alice', {
    statut: 'DC',
    groupes: ['GA', 'GB'],
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(FeFicheEleveComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('eleve', eleve);
    fixture.componentRef.setInput('groupes', groupes);
    fixture.componentRef.setInput('statutsEleve', statutsEleve);
    fixture.componentRef.setInput('typesContact', typesContact);
    fixture.detectChanges();
  });

  describe('obtenirLibelleStatut', () => {
    it('retourne le libellé correspondant à l\'id', () => {
      expect((component as any).obtenirLibelleStatut('DC')).toBe('Dans la classe');
    });

    it('retourne l\'id brut si statut non trouvé', () => {
      expect((component as any).obtenirLibelleStatut('inconnu')).toBe('inconnu');
    });
  });

  describe('obtenirLibelleTypeContact', () => {
    it('retourne le libellé correspondant à l\'id', () => {
      expect((component as any).obtenirLibelleTypeContact('P')).toBe('Père');
    });

    it('retourne l\'id brut si type non trouvé', () => {
      expect((component as any).obtenirLibelleTypeContact('X')).toBe('X');
    });
  });

  describe('obtenirLibelleGroupe', () => {
    it('retourne le libellé du groupe', () => {
      expect((component as any).obtenirLibelleGroupe('GA')).toBe('Groupe A');
    });

    it('retourne l\'id brut si groupe non trouvé', () => {
      expect((component as any).obtenirLibelleGroupe('GZ')).toBe('GZ');
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
    it('affiche le nom en majuscules', () => {
      expect(fixture.nativeElement.textContent).toContain('MARTIN');
    });

    it('affiche le prénom', () => {
      expect(fixture.nativeElement.textContent).toContain('Alice');
    });
  });
});
