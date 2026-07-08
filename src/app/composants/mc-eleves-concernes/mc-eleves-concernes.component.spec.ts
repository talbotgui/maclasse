import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { McElevesConcernesComponent } from './mc-eleves-concernes.component';
import { DonneesService } from '../../services/avecEtat/donnees.service';
import { DonneesMother } from '../../tests/donnees.mother';
import { EleveMother } from '../../tests/eleve.mother';
import type { ElevesConcernes } from '../../modeles/emploi-du-temps.modele';

describe('McElevesConcernesComponent', () => {
  let fixture: ComponentFixture<McElevesConcernesComponent>;
  let component: McElevesConcernesComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    const donneesService = TestBed.inject(DonneesService);
    donneesService.charger(
      DonneesMother.base({
        referentiels: {
          ...DonneesMother.base().referentiels,
          groupes: [
            { id: 'GA', libelle: 'Groupe A' },
            { id: 'GB', libelle: 'Groupe B' },
          ],
        },
        classe: {
          niveau: 'CM2',
          annee: 'CM2',
          eleves: [
            EleveMother.base('e1', 'MARTIN', 'Alice'),
            EleveMother.base('e2', 'DUPONT', 'Bob'),
            EleveMother.base('e3', 'ADAM', 'Claire'),
          ],
        },
      }),
    );
    fixture = TestBed.createComponent(McElevesConcernesComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'elevesConcernes');
    fixture.detectChanges();
  });

  describe('computed groupes', () => {
    it('renvoie la liste des groupes du référentiel', () => {
      expect((component as any).groupes()).toEqual([
        { id: 'GA', libelle: 'Groupe A' },
        { id: 'GB', libelle: 'Groupe B' },
      ]);
    });
  });

  describe('computed eleves', () => {
    it('renvoie les élèves triés par NOM puis prénom', () => {
      const eleves = (component as any).eleves() as { nom: string; prenom: string }[];
      expect(eleves.map((e) => e.nom)).toEqual(['ADAM', 'DUPONT', 'MARTIN']);
    });
  });

  describe('writeValue', () => {
    it('null → valeur défaut { type: "classe", groupes: [], elevesIds: [] }', () => {
      component.writeValue(null);
      const v = (component as any).valeurInterne() as ElevesConcernes;

      expect(v.type).toBe('classe');
      expect(v.groupes).toEqual([]);
      expect(v.elevesIds).toEqual([]);
    });

    it('valeur existante → stockée dans valeurInterne', () => {
      const val: ElevesConcernes = { type: 'groupes', groupes: ['GA'], elevesIds: [] };
      component.writeValue(val);

      expect((component as any).valeurInterne()).toEqual(val);
    });
  });

  describe('surChangementMode', () => {
    it('bascule vers "groupes" → type=groupes, groupes=[], elevesIds=[]', () => {
      component['surChangementMode']('groupes');

      const v = (component as any).valeurInterne() as ElevesConcernes;
      expect(v.type).toBe('groupes');
      expect(v.groupes).toEqual([]);
      expect(v.elevesIds).toEqual([]);
    });

    it('bascule vers "eleves" → type=eleves', () => {
      component['surChangementMode']('eleves');

      expect((component as any).valeurInterne().type).toBe('eleves');
    });

    it('bascule vers "classe" → réinitialise tout', () => {
      component.writeValue({ type: 'groupes', groupes: ['GA'], elevesIds: [] });
      component['surChangementMode']('classe');

      const v = (component as any).valeurInterne() as ElevesConcernes;
      expect(v.type).toBe('classe');
      expect(v.groupes).toEqual([]);
    });

    it('appelle onChange et onTouched', () => {
      const onChange = vi.fn();
      const onTouched = vi.fn();
      component.registerOnChange(onChange);
      component.registerOnTouched(onTouched);

      component['surChangementMode']('groupes');

      expect(onChange).toHaveBeenCalled();
      expect(onTouched).toHaveBeenCalled();
    });
  });

  describe('basculerGroupe', () => {
    beforeEach(() => {
      component['surChangementMode']('groupes');
    });

    it('ajoute un groupe absent de la sélection', () => {
      component['basculerGroupe']('GA');

      expect((component as any).valeurInterne().groupes).toContain('GA');
    });

    it('retire un groupe déjà présent', () => {
      component['basculerGroupe']('GA');
      component['basculerGroupe']('GA');

      expect((component as any).valeurInterne().groupes).not.toContain('GA');
    });

    it('appelle onChange et onTouched', () => {
      const onChange = vi.fn();
      const onTouched = vi.fn();
      component.registerOnChange(onChange);
      component.registerOnTouched(onTouched);

      component['basculerGroupe']('GA');

      expect(onChange).toHaveBeenCalled();
      expect(onTouched).toHaveBeenCalled();
    });
  });

  describe('basculerEleve', () => {
    beforeEach(() => {
      component['surChangementMode']('eleves');
    });

    it('ajoute un élève absent de la sélection', () => {
      component['basculerEleve']('e1');

      expect((component as any).valeurInterne().elevesIds).toContain('e1');
    });

    it('retire un élève déjà présent', () => {
      component['basculerEleve']('e1');
      component['basculerEleve']('e1');

      expect((component as any).valeurInterne().elevesIds).not.toContain('e1');
    });

    it('appelle onChange et onTouched', () => {
      const onChange = vi.fn();
      const onTouched = vi.fn();
      component.registerOnChange(onChange);
      component.registerOnTouched(onTouched);

      component['basculerEleve']('e1');

      expect(onChange).toHaveBeenCalled();
      expect(onTouched).toHaveBeenCalled();
    });
  });
});
