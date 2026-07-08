import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { EcranProjetsComponent } from './ecran-projets.component';
import { DonneesService } from '../../services/avecEtat/donnees.service';
import { ContexteService } from '../../services/avecEtat/contexte.service';
import { DonneesMother } from '../../tests/donnees.mother';
import { ProjetMother } from '../../tests/projet.mother';
import type { Projet } from '../../modeles/projet.modele';

describe('EcranProjetsComponent', () => {
  let fixture: ComponentFixture<EcranProjetsComponent>;
  let component: EcranProjetsComponent;
  let donneesService: DonneesService;
  let contexteService: ContexteService;

  const p1 = ProjetMother.base({ id: 'p1', nom: 'Sciences' });
  const p2 = ProjetMother.base({ id: 'p2', nom: 'Arts plastiques' });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    donneesService = TestBed.inject(DonneesService);
    contexteService = TestBed.inject(ContexteService);
    donneesService.charger(DonneesMother.base({ projets: [p1, p2] }));
    fixture = TestBed.createComponent(EcranProjetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('projetsAffiches', () => {
    it('retourne tous les projets sans filtre', () => {
      const projets = (component as any).projetsAffiches() as Projet[];
      expect(projets).toHaveLength(2);
    });

    it('filtre par terme de recherche', () => {
      (component as any).termeRecherche.set('sciences');
      fixture.detectChanges();

      const projets = (component as any).projetsAffiches() as Projet[];
      expect(projets).toHaveLength(1);
      expect(projets[0].nom).toBe('Sciences');
    });
  });

  describe('selectionnerProjet', () => {
    it('sans édition active → sélectionne directement', () => {
      (component as any).selectionnerProjet(p1);

      expect(contexteService.projetSelectionne()).toBe('p1');
      expect((component as any).popinAvertissementVisible()).toBe(false);
    });

    it('avec édition active → affiche la popin', () => {
      (component as any).enModeEdition.set(true);

      (component as any).selectionnerProjet(p2);

      expect((component as any).popinAvertissementVisible()).toBe(true);
    });
  });

  describe('creerProjet', () => {
    it('sans édition active → active la création', () => {
      contexteService.projetSelectionne.set('p1');

      (component as any).creerProjet();

      expect(contexteService.projetSelectionne()).toBeNull();
      expect((component as any).enModeEdition()).toBe(true);
    });

    it('avec édition active → affiche la popin', () => {
      (component as any).enModeEdition.set(true);

      (component as any).creerProjet();

      expect((component as any).popinAvertissementVisible()).toBe(true);
    });
  });

  describe('confirmerAvertissement (sans garde)', () => {
    it("exécute l'action en attente et ferme la popin", () => {
      (component as any).enModeEdition.set(true);
      (component as any).selectionnerProjet(p2);

      (component as any).confirmerAvertissement();

      expect((component as any).popinAvertissementVisible()).toBe(false);
      expect(contexteService.projetSelectionne()).toBe('p2');
      expect((component as any).enModeEdition()).toBe(false);
    });
  });

  describe('annulerAvertissement', () => {
    it("ferme la popin sans exécuter l'action", () => {
      (component as any).enModeEdition.set(true);
      (component as any).selectionnerProjet(p2);

      (component as any).annulerAvertissement();

      expect((component as any).popinAvertissementVisible()).toBe(false);
      expect(contexteService.projetSelectionne()).not.toBe('p2');
    });
  });

  describe('onEnregistrer', () => {
    it('crée un projet si aucun projet sélectionné', () => {
      contexteService.projetSelectionne.set(null);
      fixture.detectChanges();
      const nouveau = ProjetMother.base({ id: 'p99', nom: 'Nouveau' });

      (component as any).onEnregistrer(nouveau);

      const projets = donneesService.donnees()?.projets ?? [];
      expect(projets.some((p) => p.id === 'p99')).toBe(true);
      expect(contexteService.projetSelectionne()).toBe('p99');
      expect((component as any).enModeEdition()).toBe(false);
    });

    it('modifie un projet existant si sélectionné', () => {
      contexteService.projetSelectionne.set('p1');
      fixture.detectChanges();
      const modifie = ProjetMother.base({ id: 'p1', nom: 'Sciences-Modif' });

      (component as any).onEnregistrer(modifie);

      const projets = donneesService.donnees()?.projets ?? [];
      expect(projets.find((p) => p.id === 'p1')?.nom).toBe('Sciences-Modif');
      expect((component as any).enModeEdition()).toBe(false);
    });
  });

  describe('onAnnulerEdition', () => {
    it('passe enModeEdition à false', () => {
      (component as any).enModeEdition.set(true);

      (component as any).onAnnulerEdition();

      expect((component as any).enModeEdition()).toBe(false);
    });
  });

  describe('supprimerProjet', () => {
    it('supprime le projet sélectionné', () => {
      contexteService.projetSelectionne.set('p1');
      fixture.detectChanges();

      (component as any).supprimerProjet();

      const projets = donneesService.donnees()?.projets ?? [];
      expect(projets.some((p) => p.id === 'p1')).toBe(false);
      expect(contexteService.projetSelectionne()).toBeNull();
    });

    it('ne fait rien si aucun projet sélectionné', () => {
      contexteService.projetSelectionne.set(null);
      fixture.detectChanges();

      expect(() => (component as any).supprimerProjet()).not.toThrow();
    });
  });

  describe('basculerFiltreDomaine', () => {
    it('ajoute un domaine aux filtres', () => {
      (component as any).basculerFiltreDomaine('d1', true);

      expect((component as any).domainesFiltres()).toContain('d1');
    });

    it('retire un domaine des filtres', () => {
      (component as any).domainesFiltres.set(['d1']);

      (component as any).basculerFiltreDomaine('d1', false);

      expect((component as any).domainesFiltres()).not.toContain('d1');
    });
  });

  describe('confirmerNavigation', () => {
    it('retourne true immédiatement si pas en édition', async () => {
      const result = await component.confirmerNavigation();

      expect(result).toBe(true);
    });

    it('promesse résolue à true par confirmerAvertissement', async () => {
      (component as any).enModeEdition.set(true);

      const promesse = component.confirmerNavigation();
      (component as any).confirmerAvertissement();

      expect(await promesse).toBe(true);
    });

    it('promesse résolue à false par annulerAvertissement', async () => {
      (component as any).enModeEdition.set(true);

      const promesse = component.confirmerNavigation();
      (component as any).annulerAvertissement();

      expect(await promesse).toBe(false);
    });
  });
});
