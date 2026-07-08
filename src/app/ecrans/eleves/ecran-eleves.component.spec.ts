import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { EcranElevesComponent } from './ecran-eleves.component';
import { DonneesService } from '../../services/avecEtat/donnees.service';
import { ContexteService } from '../../services/avecEtat/contexte.service';
import { DonneesMother } from '../../tests/donnees.mother';
import { EleveMother } from '../../tests/eleve.mother';
import type { Eleve } from '../../modeles/eleve.modele';

describe('EcranElevesComponent', () => {
  let fixture: ComponentFixture<EcranElevesComponent>;
  let component: EcranElevesComponent;
  let donneesService: DonneesService;
  let contexteService: ContexteService;

  const alice = EleveMother.base('e1', 'MARTIN', 'Alice', { groupes: ['GA'] });
  const bob = EleveMother.base('e2', 'DUPONT', 'Bob', { groupes: ['GB'] });
  const claire = EleveMother.base('e3', 'ADAM', 'Claire', { groupes: ['GA'] });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    donneesService = TestBed.inject(DonneesService);
    contexteService = TestBed.inject(ContexteService);
    donneesService.charger(
      DonneesMother.base({
        classe: { ...DonneesMother.base().classe, eleves: [alice, bob, claire] },
        referentiels: {
          ...DonneesMother.base().referentiels,
          groupes: [
            { id: 'GA', libelle: 'Groupe A' },
            { id: 'GB', libelle: 'Groupe B' },
          ],
        },
      }),
    );
    fixture = TestBed.createComponent(EcranElevesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('elevesAffiches', () => {
    it('retourne tous les élèves sans filtre', () => {
      const eleves = (component as any).elevesAffiches() as Eleve[];
      expect(eleves).toHaveLength(3);
    });

    it('filtre par terme de recherche', () => {
      (component as any).termeRecherche.set('dupont');
      fixture.detectChanges();

      const eleves = (component as any).elevesAffiches() as Eleve[];
      expect(eleves).toHaveLength(1);
      expect(eleves[0].nom).toBe('DUPONT');
    });

    it('filtre par groupe actif', () => {
      (component as any).groupesFiltres.set(['GA']);
      fixture.detectChanges();

      const eleves = (component as any).elevesAffiches() as Eleve[];
      expect(eleves).toHaveLength(2);
      expect(eleves.every((e: Eleve) => e.groupes.includes('GA'))).toBe(true);
    });
  });

  describe('selectionnerEleve', () => {
    it('sans édition active → sélectionne directement', () => {
      (component as any).selectionnerEleve(alice);

      expect(contexteService.eleveSelectionne()).toBe('e1');
      expect((component as any).popinAvertissementVisible()).toBe(false);
    });

    it('avec édition active → affiche la popin', () => {
      (component as any).enModeEdition.set(true);

      (component as any).selectionnerEleve(bob);

      expect((component as any).popinAvertissementVisible()).toBe(true);
      expect(contexteService.eleveSelectionne()).not.toBe('e2');
    });
  });

  describe('creerEleve', () => {
    it('sans édition active → active la création (eleve null + enModeEdition)', () => {
      contexteService.eleveSelectionne.set('e1');

      (component as any).creerEleve();

      expect(contexteService.eleveSelectionne()).toBeNull();
      expect((component as any).enModeEdition()).toBe(true);
    });

    it('avec édition active → affiche la popin', () => {
      (component as any).enModeEdition.set(true);

      (component as any).creerEleve();

      expect((component as any).popinAvertissementVisible()).toBe(true);
    });
  });

  describe('confirmerAvertissement (sans garde)', () => {
    it("exécute l'action en attente et ferme la popin", () => {
      (component as any).enModeEdition.set(true);
      (component as any).selectionnerEleve(bob);

      (component as any).confirmerAvertissement();

      expect((component as any).popinAvertissementVisible()).toBe(false);
      expect(contexteService.eleveSelectionne()).toBe('e2');
      expect((component as any).enModeEdition()).toBe(false);
    });
  });

  describe('annulerAvertissement', () => {
    it("ferme la popin sans exécuter l'action en attente", () => {
      (component as any).enModeEdition.set(true);
      (component as any).selectionnerEleve(bob);

      (component as any).annulerAvertissement();

      expect((component as any).popinAvertissementVisible()).toBe(false);
      expect(contexteService.eleveSelectionne()).not.toBe('e2');
    });
  });

  describe('activerEdition', () => {
    it('passe enModeEdition à true', () => {
      (component as any).activerEdition();

      expect((component as any).enModeEdition()).toBe(true);
    });
  });

  describe('onEnregistrer', () => {
    it('crée un élève si aucun éléve sélectionné', () => {
      contexteService.eleveSelectionne.set(null);
      fixture.detectChanges();
      const nouvelEleve = EleveMother.base('e99', 'NOUVEAU', 'Élève');

      (component as any).onEnregistrer(nouvelEleve);

      const eleves = donneesService.donnees()?.classe.eleves ?? [];
      expect(eleves.some((e) => e.id === 'e99')).toBe(true);
      expect((component as any).enModeEdition()).toBe(false);
      expect(contexteService.eleveSelectionne()).toBe('e99');
    });

    it('modifie un élève existant si un élève est sélectionné', () => {
      contexteService.eleveSelectionne.set('e1');
      fixture.detectChanges();
      const modifie = EleveMother.base('e1', 'MARTIN', 'Alice-Modif');

      (component as any).onEnregistrer(modifie);

      const eleves = donneesService.donnees()?.classe.eleves ?? [];
      expect(eleves.find((e) => e.id === 'e1')?.prenom).toBe('Alice-Modif');
      expect((component as any).enModeEdition()).toBe(false);
    });
  });

  describe('onAnnulerEdition', () => {
    it('passe enModeEdition à false', () => {
      (component as any).enModeEdition.set(true);

      (component as any).onAnnulerEdition();

      expect((component as any).enModeEdition()).toBe(false);
    });

    it('remet eleveSelectionne à null si aucun élève sélectionné', () => {
      contexteService.eleveSelectionne.set(null);
      (component as any).enModeEdition.set(true);

      (component as any).onAnnulerEdition();

      expect(contexteService.eleveSelectionne()).toBeNull();
    });
  });

  describe('supprimerEleve', () => {
    it("supprime l'élève sélectionné et remet la sélection à null", () => {
      contexteService.eleveSelectionne.set('e1');
      fixture.detectChanges();

      (component as any).supprimerEleve();

      const eleves = donneesService.donnees()?.classe.eleves ?? [];
      expect(eleves.some((e) => e.id === 'e1')).toBe(false);
      expect(contexteService.eleveSelectionne()).toBeNull();
    });

    it('ne fait rien si aucun élève sélectionné', () => {
      contexteService.eleveSelectionne.set(null);
      fixture.detectChanges();

      expect(() => (component as any).supprimerEleve()).not.toThrow();
    });
  });

  describe('basculerFiltreGroupe', () => {
    it('ajoute un groupe aux filtres', () => {
      (component as any).basculerFiltreGroupe('GA', true);

      expect((component as any).groupesFiltres()).toContain('GA');
    });

    it('retire un groupe des filtres', () => {
      (component as any).groupesFiltres.set(['GA']);

      (component as any).basculerFiltreGroupe('GA', false);

      expect((component as any).groupesFiltres()).not.toContain('GA');
    });
  });

  describe('confirmerNavigation', () => {
    it('retourne true immédiatement si pas en édition', async () => {
      const result = await component.confirmerNavigation();

      expect(result).toBe(true);
    });

    it('retourne une promesse en attente si en édition, résolue par confirmerAvertissement', async () => {
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
