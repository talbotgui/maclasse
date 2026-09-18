import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { McPastillesElevesConcernesComponent } from './mc-pastilles-eleves-concernes.component';
import { DonneesService } from '../../services/avecEtat/donnees.service';
import { DonneesMother } from '../../tests/donnees.mother';
import { EleveMother } from '../../tests/eleve.mother';
import type { ElevesConcernes } from '../../modeles/emploi-du-temps.modele';

describe('McPastillesElevesConcernesComponent', () => {
  let fixture: ComponentFixture<McPastillesElevesConcernesComponent>;
  let component: McPastillesElevesConcernesComponent;

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
          ],
        },
      }),
    );
    fixture = TestBed.createComponent(McPastillesElevesConcernesComponent);
    component = fixture.componentInstance;
  });

  describe('computed pastilles', () => {
    it('undefined → aucune pastille', () => {
      fixture.detectChanges();

      expect((component as any).pastilles()).toEqual([]);
      expect(fixture.nativeElement.querySelectorAll('.mc-disc-pill')).toHaveLength(0);
    });

    it('type "classe" → une pastille "Toute la classe"', () => {
      const valeur: ElevesConcernes = { type: 'classe', groupes: [], elevesIds: [] };
      fixture.componentRef.setInput('elevesConcernes', valeur);
      fixture.detectChanges();

      expect((component as any).pastilles()).toEqual([
        { id: 'classe', libelle: 'Toute la classe' },
      ]);
      const pills = fixture.nativeElement.querySelectorAll('.mc-disc-pill');
      expect(pills).toHaveLength(1);
      expect(pills[0].textContent).toContain('Toute la classe');
    });

    it('type "groupes" → une pastille par groupe résolu, triées par libellé, id inconnu ignoré', () => {
      const valeur: ElevesConcernes = {
        type: 'groupes',
        groupes: ['GB', 'GA', 'inconnu'],
        elevesIds: [],
      };
      fixture.componentRef.setInput('elevesConcernes', valeur);
      fixture.detectChanges();

      expect((component as any).pastilles()).toEqual([
        { id: 'GA', libelle: 'Groupe A' },
        { id: 'GB', libelle: 'Groupe B' },
      ]);
      expect(fixture.nativeElement.querySelectorAll('.mc-disc-pill')).toHaveLength(2);
    });

    it('type "eleves" → une pastille par élève résolu au format NOM Prénom, triées, id inconnu ignoré', () => {
      const valeur: ElevesConcernes = {
        type: 'eleves',
        groupes: [],
        elevesIds: ['e1', 'e2', 'inconnu'],
      };
      fixture.componentRef.setInput('elevesConcernes', valeur);
      fixture.detectChanges();

      expect((component as any).pastilles()).toEqual([
        { id: 'e2', libelle: 'DUPONT Bob' },
        { id: 'e1', libelle: 'MARTIN Alice' },
      ]);
      expect(fixture.nativeElement.querySelectorAll('.mc-disc-pill')).toHaveLength(2);
    });
  });
});
