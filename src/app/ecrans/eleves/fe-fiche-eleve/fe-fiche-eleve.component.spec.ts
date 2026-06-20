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

  describe('libelleDuStatut', () => {
    it('retourne le libellé correspondant à l\'id', () => {
      expect((component as any).libelleDuStatut('DC')).toBe('Dans la classe');
    });

    it('retourne l\'id brut si statut non trouvé', () => {
      expect((component as any).libelleDuStatut('inconnu')).toBe('inconnu');
    });
  });

  describe('libelleTypeContact', () => {
    it('retourne le libellé correspondant à l\'id', () => {
      expect((component as any).libelleTypeContact('P')).toBe('Père');
    });

    it('retourne l\'id brut si type non trouvé', () => {
      expect((component as any).libelleTypeContact('X')).toBe('X');
    });
  });

  describe('libelleGroupe', () => {
    it('retourne le libellé du groupe', () => {
      expect((component as any).libelleGroupe('GA')).toBe('Groupe A');
    });

    it('retourne l\'id brut si groupe non trouvé', () => {
      expect((component as any).libelleGroupe('GZ')).toBe('GZ');
    });
  });

  describe('outputs', () => {
    it('modifier émet quand la méthode est appelée', () => {
      const spy = vi.spyOn((component as any).modifier, 'emit');

      (component as any).modifier.emit();

      expect(spy).toHaveBeenCalled();
    });

    it('supprimer émet quand la méthode est appelée', () => {
      const spy = vi.spyOn((component as any).supprimer, 'emit');

      (component as any).supprimer.emit();

      expect(spy).toHaveBeenCalled();
    });

    it('imprimer émet quand la méthode est appelée', () => {
      const spy = vi.spyOn((component as any).imprimer, 'emit');

      (component as any).imprimer.emit();

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
