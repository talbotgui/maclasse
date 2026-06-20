import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { McEnteteComponent } from './mc-entete.component';
import { DonneesService } from '../../services/avecEtat/donnees.service';
import { ContexteService } from '../../services/avecEtat/contexte.service';
import { SauvegardeAutoService } from '../../services/sansEtat/sauvegarde-auto.service';
import { RechercheGlobaleService } from '../../services/sansEtat/recherche-globale.service';
import { DonneesMother } from '../../tests/donnees.mother';
import { EleveMother } from '../../tests/eleve.mother';
import { ResultatRechercheMother } from '../../tests/recherche.mother';

describe('McEnteteComponent', () => {
  let component: McEnteteComponent;
  let donneesService: DonneesService;
  let contexteService: ContexteService;
  let sauvegardeAutoService: SauvegardeAutoService;
  let rechercheGlobaleService: RechercheGlobaleService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    donneesService = TestBed.inject(DonneesService);
    contexteService = TestBed.inject(ContexteService);
    sauvegardeAutoService = TestBed.inject(SauvegardeAutoService);
    rechercheGlobaleService = TestBed.inject(RechercheGlobaleService);
    donneesService.charger(DonneesMother.base({
      classe: {
        niveau: 'CM2',
        annee: 'CM2',
        eleves: [EleveMother.base('e1', 'MARTIN', 'Alice')],
      },
    }));
    const fixture = TestBed.createComponent(McEnteteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('surSauvegarder', () => {
    it('sans mot de passe → ouvre la popin de sauvegarde', () => {
      contexteService.motDePasse = '';

      component['surSauvegarder']();

      expect((component as any).popinSauvegardeVisible()).toBe(true);
    });

    it('avec mot de passe mémorisé → appelle sauvegardeAutoService.sauvegarder()', () => {
      contexteService.motDePasse = 'secret';
      const spy = vi.spyOn(sauvegardeAutoService, 'sauvegarder').mockResolvedValue(undefined);

      component['surSauvegarder']();

      expect(spy).toHaveBeenCalled();
      expect((component as any).popinSauvegardeVisible()).toBe(false);
    });
  });

  describe('surConfirmationSauvegarde', () => {
    it('mémorise le mot de passe dans contexteService', async () => {
      vi.spyOn(sauvegardeAutoService, 'sauvegarder').mockResolvedValue(undefined);
      vi.spyOn(sauvegardeAutoService, 'demarrer').mockImplementation(() => {});

      await component['surConfirmationSauvegarde']('secret123');

      expect(contexteService.motDePasse).toBe('secret123');
    });

    it('ferme la popin', async () => {
      vi.spyOn(sauvegardeAutoService, 'sauvegarder').mockResolvedValue(undefined);
      vi.spyOn(sauvegardeAutoService, 'demarrer').mockImplementation(() => {});
      (component as any).popinSauvegardeVisible.set(true);

      await component['surConfirmationSauvegarde']('secret123');

      expect((component as any).popinSauvegardeVisible()).toBe(false);
    });

    it('appelle sauvegarder puis demarrer', async () => {
      const spySauvegarder = vi.spyOn(sauvegardeAutoService, 'sauvegarder').mockResolvedValue(undefined);
      const spyDemarrer = vi.spyOn(sauvegardeAutoService, 'demarrer').mockImplementation(() => {});

      await component['surConfirmationSauvegarde']('secret123');

      expect(spySauvegarder).toHaveBeenCalled();
      expect(spyDemarrer).toHaveBeenCalled();
    });
  });

  describe('surAnnulationSauvegarde', () => {
    it('ferme la popin', () => {
      (component as any).popinSauvegardeVisible.set(true);

      component['surAnnulationSauvegarde']();

      expect((component as any).popinSauvegardeVisible()).toBe(false);
    });
  });

  describe('surRecherche', () => {
    it('terme avec résultats → liste visible', () => {
      vi.spyOn(rechercheGlobaleService, 'rechercher').mockReturnValue([ResultatRechercheMother.eleve()]);

      component['surRecherche']('Martin');

      expect((component as any).listeResultatsVisible()).toBe(true);
      expect((component as any).resultatsRecherche()).toHaveLength(1);
    });

    it('terme sans résultats → liste masquée', () => {
      vi.spyOn(rechercheGlobaleService, 'rechercher').mockReturnValue([]);

      component['surRecherche']('zzz');

      expect((component as any).listeResultatsVisible()).toBe(false);
    });
  });

  describe('surSelectionResultat', () => {
    it('type eleve → eleveSelectionne.set(id)', async () => {
      const resultat = ResultatRechercheMother.eleve({ id: 'e1' });

      component['surSelectionResultat'](resultat);
      await Promise.resolve();

      expect(contexteService.eleveSelectionne()).toBe('e1');
      expect((component as any).listeResultatsVisible()).toBe(false);
    });

    it('type projet → projetSelectionne.set(id)', async () => {
      const resultat = ResultatRechercheMother.projet({ id: 'p1' });

      component['surSelectionResultat'](resultat);
      await Promise.resolve();

      expect(contexteService.projetSelectionne()).toBe('p1');
    });
  });

  describe('surAnnuler / surRefaire', () => {
    it('surAnnuler → appelle donneesService.annuler()', () => {
      const spy = vi.spyOn(donneesService, 'annuler');

      component['surAnnuler']();

      expect(spy).toHaveBeenCalled();
    });

    it('surRefaire → appelle donneesService.refaire()', () => {
      const spy = vi.spyOn(donneesService, 'refaire');

      component['surRefaire']();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('surBasculerTheme', () => {
    it('appelle contexteService.basculerTheme()', () => {
      const spy = vi.spyOn(contexteService, 'basculerTheme');

      component['surBasculerTheme']();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('tooltipSauvegarder', () => {
    it('sans sauvegarde → message absence', () => {
      sauvegardeAutoService.dateDerniereSauvegarde.set(null);

      expect((component as any).tooltipSauvegarder()).toContain('Aucune');
    });

    it('avec date → message contenant la date formatée', () => {
      sauvegardeAutoService.dateDerniereSauvegarde.set(new Date('2026-06-20T10:30:00'));

      const tooltip = (component as any).tooltipSauvegarder() as string;
      expect(tooltip).toContain('20');
      expect(tooltip).toContain('06');
    });
  });
});
