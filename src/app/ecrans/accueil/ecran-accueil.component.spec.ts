import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { EcranAccueilComponent } from './ecran-accueil.component';
import { DonneesService } from '../../services/avecEtat/donnees.service';
import { DonneesMother } from '../../tests/donnees.mother';
import { SeanceMother } from '../../tests/cahier-journal.mother';
import { EleveMother } from '../../tests/eleve.mother';

describe('EcranAccueilComponent', () => {
  let fixture: ComponentFixture<EcranAccueilComponent>;
  let component: EcranAccueilComponent;
  let donneesService: DonneesService;

  const dateAujourdhui = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  beforeEach(() => {
    TestBed.configureTestingModule({});
    donneesService = TestBed.inject(DonneesService);
    fixture = TestBed.createComponent(EcranAccueilComponent);
    component = fixture.componentInstance;
  });

  describe('seancesResumees', () => {
    it('retourne [] si pas de données', () => {
      fixture.detectChanges();

      expect((component as any).seancesResumees()).toEqual([]);
    });

    it('retourne [] si pas de journée à la date du jour', () => {
      donneesService.charger(DonneesMother.base({
        cahierJournal: [{ id: 'j0', date: '2000-01-01', seances: [SeanceMother.pedagogique()] }],
      }));
      fixture.detectChanges();

      expect((component as any).seancesResumees()).toEqual([]);
    });

    it('filtre les récréations et pauses déjeuner', () => {
      donneesService.charger(DonneesMother.base({
        cahierJournal: [{
          id: 'j1',
          date: dateAujourdhui,
          seances: [
            SeanceMother.pedagogique({ id: 's1' }),
            SeanceMother.recreation({ id: 's2' }),
          ],
        }],
      }));
      fixture.detectChanges();

      const seances = (component as any).seancesResumees();
      expect(seances).toHaveLength(1);
    });

    it('calcule nbEleves = total de la classe si type=classe', () => {
      const alice = EleveMother.base('e1', 'M', 'A');
      const bob = EleveMother.base('e2', 'D', 'B');
      donneesService.charger(DonneesMother.base({
        classe: { ...DonneesMother.base().classe, eleves: [alice, bob] },
        cahierJournal: [{
          id: 'j1',
          date: dateAujourdhui,
          seances: [SeanceMother.pedagogique({
            elevesConcernes: { type: 'classe', groupes: [], elevesIds: [] },
          })],
        }],
      }));
      fixture.detectChanges();

      const seances = (component as any).seancesResumees();
      expect(seances[0].nbEleves).toBe(2);
    });

    it('calcule nbEleves selon les élèves explicites si type=eleves', () => {
      const alice = EleveMother.base('e1', 'M', 'A');
      const bob = EleveMother.base('e2', 'D', 'B');
      donneesService.charger(DonneesMother.base({
        classe: { ...DonneesMother.base().classe, eleves: [alice, bob] },
        cahierJournal: [{
          id: 'j1',
          date: dateAujourdhui,
          seances: [SeanceMother.pedagogique({
            elevesConcernes: { type: 'eleves', groupes: [], elevesIds: ['e1'] },
          })],
        }],
      }));
      fixture.detectChanges();

      const seances = (component as any).seancesResumees();
      expect(seances[0].nbEleves).toBe(1);
    });

    it('calcule nbEleves selon les groupes si type=groupes', () => {
      const alice = EleveMother.base('e1', 'M', 'A', { groupes: ['GA'] });
      const bob = EleveMother.base('e2', 'D', 'B', { groupes: ['GB'] });
      donneesService.charger(DonneesMother.base({
        classe: { ...DonneesMother.base().classe, eleves: [alice, bob] },
        cahierJournal: [{
          id: 'j1',
          date: dateAujourdhui,
          seances: [SeanceMother.pedagogique({
            elevesConcernes: { type: 'groupes', groupes: ['GA'], elevesIds: [] },
          })],
        }],
      }));
      fixture.detectChanges();

      const seances = (component as any).seancesResumees();
      expect(seances[0].nbEleves).toBe(1);
    });

    it('mappe heureDebut et heureFin correctement', () => {
      donneesService.charger(DonneesMother.base({
        cahierJournal: [{
          id: 'j1',
          date: dateAujourdhui,
          seances: [SeanceMother.pedagogique({ heureDebut: '09:00', heureFin: '10:30' })],
        }],
      }));
      fixture.detectChanges();

      const seances = (component as any).seancesResumees();
      expect(seances[0].heureDebut).toBe('09:00');
      expect(seances[0].heureFin).toBe('10:30');
    });
  });

  describe('dateFormatee', () => {
    it('est une chaîne non vide', () => {
      fixture.detectChanges();

      expect((component as any).dateFormatee).toBeTruthy();
      expect(typeof (component as any).dateFormatee).toBe('string');
    });
  });
});
