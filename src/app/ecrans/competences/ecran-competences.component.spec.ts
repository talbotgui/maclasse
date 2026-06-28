import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { EcranCompetencesComponent } from './ecran-competences.component';
import { DonneesService } from '../../services/avecEtat/donnees.service';
import { ContexteService } from '../../services/avecEtat/contexte.service';
import { DonneesMother } from '../../tests/donnees.mother';
import { ProjetMother } from '../../tests/projet.mother';
import { SeanceMother } from '../../tests/cahier-journal.mother';
import type { ResultatExportCompetences } from '../../composants/popins/popin-export-competences/popin-export-competences.component';
import { DateUtils } from '../../utilitaires/date.utils';

describe('EcranCompetencesComponent', () => {
  let fixture: ComponentFixture<EcranCompetencesComponent>;
  let component: EcranCompetencesComponent;
  let contexteService: ContexteService;
  let donneesService: DonneesService;

  const dateCJ = DateUtils.ajouterJours(DateUtils.lundiDeLaSemaine(DateUtils.dateAujourdhui()), 7);

  beforeEach(() => {
    TestBed.configureTestingModule({});
    donneesService = TestBed.inject(DonneesService);
    contexteService = TestBed.inject(ContexteService);
    donneesService.charger(DonneesMother.base({
      projets: [ProjetMother.base({ id: 'p1', periodes: [{ periodeNom: 'P1', debut: '', fin: '', description: '', competencesIds: [] }] })],
      cahierJournal: [{ id: 'j1', date: dateCJ, seances: [SeanceMother.pedagogique({ id: 's1', competencesIds: [] })] }],
    }));
    fixture = TestBed.createComponent(EcranCompetencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('panier / panierNonVide', () => {
    it('panierNonVide = false si panier vide', () => {
      contexteService.panierCompetences.set([]);
      fixture.detectChanges();

      expect((component as any).panierNonVide()).toBe(false);
    });

    it('panierNonVide = true si panier contient des ids', () => {
      contexteService.panierCompetences.set(['c1']);
      fixture.detectChanges();

      expect((component as any).panierNonVide()).toBe(true);
    });
  });

  describe('surSelectionChange', () => {
    it('met à jour le panier', () => {
      (component as any).surSelectionChange(['c1', 'c2']);

      expect(contexteService.panierCompetences()).toEqual(['c1', 'c2']);
    });
  });

  describe('viderPanier', () => {
    it('vide le panier', () => {
      contexteService.panierCompetences.set(['c1', 'c2']);

      (component as any).viderPanier();

      expect(contexteService.panierCompetences()).toEqual([]);
    });
  });

  describe('retirerDuPanier', () => {
    it('retire un id du panier', () => {
      contexteService.panierCompetences.set(['c1', 'c2']);

      (component as any).retirerDuPanier('c1');

      expect(contexteService.panierCompetences()).toEqual(['c2']);
    });

    it('ne modifie pas le panier si l\'id est absent', () => {
      contexteService.panierCompetences.set(['c2']);

      (component as any).retirerDuPanier('c1');

      expect(contexteService.panierCompetences()).toEqual(['c2']);
    });
  });

  describe('exporterVersProjet / exporterVersSeance / annulerExport', () => {
    it('exporterVersProjet ouvre la popin en mode projet', () => {
      (component as any).exporterVersProjet();

      expect((component as any).modeExport()).toBe('projet');
      expect((component as any).popinExportVisible()).toBe(true);
    });

    it('exporterVersSeance ouvre la popin en mode seance', () => {
      (component as any).exporterVersSeance();

      expect((component as any).modeExport()).toBe('seance');
      expect((component as any).popinExportVisible()).toBe(true);
    });

    it('annulerExport ferme la popin', () => {
      (component as any).popinExportVisible.set(true);

      (component as any).annulerExport();

      expect((component as any).popinExportVisible()).toBe(false);
    });
  });

  describe('confirmerExport vers projet', () => {
    it('ajoute les compétences à la période et vide le panier', () => {
      contexteService.panierCompetences.set(['c1', 'c2']);

      const resultat: ResultatExportCompetences = { cibleType: 'projet', cibleId: 'p1', secondaireId: '0' };

      (component as any).confirmerExport(resultat);

      const projet = donneesService.donnees()?.projets.find(p => p.id === 'p1');
      expect(projet?.periodes[0].competencesIds).toContain('c1');
      expect(projet?.periodes[0].competencesIds).toContain('c2');
      expect(contexteService.panierCompetences()).toEqual([]);
      expect((component as any).popinExportVisible()).toBe(false);
    });
  });

  describe('confirmerExport vers séance', () => {
    it('ajoute les compétences à la séance et vide le panier', () => {
      contexteService.panierCompetences.set(['c3']);

      const resultat: ResultatExportCompetences = { cibleType: 'seance', cibleId: dateCJ, secondaireId: 's1' };

      (component as any).confirmerExport(resultat);

      const journee = donneesService.donnees()?.cahierJournal.find(j => j.date === dateCJ);
      expect(journee?.seances.find(s => s.id === 's1')?.competencesIds).toContain('c3');
      expect(contexteService.panierCompetences()).toEqual([]);
    });
  });
});
