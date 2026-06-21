import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { PopinExportCompetencesComponent } from './popin-export-competences.component';
import { DonneesService } from '../../../services/avecEtat/donnees.service';
import { DonneesMother } from '../../../tests/donnees.mother';
import { ProjetMother } from '../../../tests/projet.mother';
import { SeanceMother } from '../../../tests/cahier-journal.mother';

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

describe('PopinExportCompetencesComponent', () => {
  let fixture: ComponentFixture<PopinExportCompetencesComponent>;
  let component: PopinExportCompetencesComponent;
  let donneesService: DonneesService;

  const dialogEl = () => fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({});
    donneesService = TestBed.inject(DonneesService);
    fixture = TestBed.createComponent(PopinExportCompetencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const chargerDonneesAvecProjet = () => {
    const projet = ProjetMother.base({
      id: 'p1',
      nom: 'Projet sciences',
      periodes: [
        { periodeNom: 'Période 1', debut: '', fin: '', description: '', competencesIds: [] },
        { periodeNom: 'Période 2', debut: '', fin: '', description: '', competencesIds: [] },
      ],
    });
    donneesService.charger(DonneesMother.base({ projets: [projet] }));
    fixture.detectChanges();
  };

  const chargerDonneesAvecSeance = () => {
    const seance = SeanceMother.pedagogique({ id: 's1' });
    donneesService.charger(DonneesMother.base({
      cahierJournal: [{ id: 'j1', date: '2026-06-20', seances: [seance] }],
    }));
    fixture.detectChanges();
  };

  describe('ouverture/fermeture', () => {
    it('visible=false → showModal non appelé', () => {
      expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
    });

    it('visible=true → showModal appelé', () => {
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();

      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
    });

    it('ouverture réinitialise les sélections', () => {
      (component as any).selectionPrimaire.set('p1');
      (component as any).selectionSecondaire.set('0');

      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();

      expect((component as any).selectionPrimaire()).toBe('');
      expect((component as any).selectionSecondaire()).toBe('');
    });
  });

  describe('mode "projet"', () => {
    beforeEach(() => {
      chargerDonneesAvecProjet();
      fixture.componentRef.setInput('mode', 'projet');
      fixture.detectChanges();
    });

    it('optionsPrimaires = liste des projets', () => {
      const options = (component as any).optionsPrimaires() as { valeur: string; libelle: string }[];
      expect(options).toHaveLength(1);
      expect(options[0].valeur).toBe('p1');
    });

    it('sélection d\'un projet → optionsSecondaires = périodes', () => {
      component['surChangementPrimaire']('p1');
      fixture.detectChanges();

      const options = (component as any).optionsSecondaires() as { valeur: string }[];
      expect(options).toHaveLength(2);
      expect(options[0].valeur).toBe('0');
      expect(options[1].valeur).toBe('1');
    });

    it('surChangementPrimaire → réinitialise selectionSecondaire', () => {
      (component as any).selectionSecondaire.set('1');
      component['surChangementPrimaire']('p1');

      expect((component as any).selectionSecondaire()).toBe('');
    });
  });

  describe('mode "seance"', () => {
    beforeEach(() => {
      chargerDonneesAvecSeance();
      fixture.componentRef.setInput('mode', 'seance');
      fixture.detectChanges();
    });

    it('optionsPrimaires = journées CJ avec séances pédago', () => {
      const options = (component as any).optionsPrimaires() as { valeur: string }[];
      expect(options).toHaveLength(1);
      expect(options[0].valeur).toBe('2026-06-20');
    });

    it('sélection d\'une journée → optionsSecondaires = séances pédago', () => {
      component['surChangementPrimaire']('2026-06-20');
      fixture.detectChanges();

      const options = (component as any).optionsSecondaires() as { valeur: string }[];
      expect(options).toHaveLength(1);
      expect(options[0].valeur).toBe('s1');
    });
  });

  describe('peutConfirmer', () => {
    it('false si selectionPrimaire manque', () => {
      (component as any).selectionPrimaire.set('');
      (component as any).selectionSecondaire.set('0');

      expect((component as any).peutConfirmer()).toBe(false);
    });

    it('false si selectionSecondaire manque', () => {
      (component as any).selectionPrimaire.set('p1');
      (component as any).selectionSecondaire.set('');

      expect((component as any).peutConfirmer()).toBe(false);
    });

    it('true si les deux sont renseignées', () => {
      (component as any).selectionPrimaire.set('p1');
      (component as any).selectionSecondaire.set('0');

      expect((component as any).peutConfirmer()).toBe(true);
    });
  });

  describe('surConfirmation', () => {
    it('si peutConfirmer → émet ResultatExportCompetences correct', () => {
      const spy = vi.spyOn((component as any).confirme, 'emit');
      fixture.componentRef.setInput('mode', 'projet');
      fixture.componentRef.setInput('competencesIds', ['c1']);
      (component as any).selectionPrimaire.set('p1');
      (component as any).selectionSecondaire.set('0');

      component['surConfirmation']();

      expect(spy).toHaveBeenCalledWith({ cibleType: 'projet', cibleId: 'p1', secondaireId: '0' });
    });

    it('si peutConfirmer=false → n\'émet pas', () => {
      const spy = vi.spyOn((component as any).confirme, 'emit');

      component['surConfirmation']();

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('surAnnulation / surCancel', () => {
    it('surAnnulation émet annule', () => {
      const spy = vi.spyOn((component as any).annule, 'emit');

      component['surAnnulation']();

      expect(spy).toHaveBeenCalled();
    });

    it('surCancel prévient le défaut et émet annule', () => {
      const spyAnnule = vi.spyOn((component as any).annule, 'emit');
      const event = new Event('cancel');
      const spyPrevent = vi.spyOn(event, 'preventDefault');

      component['surCancel'](event);

      expect(spyPrevent).toHaveBeenCalled();
      expect(spyAnnule).toHaveBeenCalled();
    });
  });
});
