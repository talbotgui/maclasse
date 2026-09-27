import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { FpFormulaireProjetComponent } from './fp-formulaire-projet.component';
import { DonneesService } from '../../../services/avecEtat/donnees.service';
import { DonneesMother } from '../../../tests/donnees.mother';
import { ProjetMother, PeriodeMother } from '../../../tests/projet.mother';
import { EleveMother } from '../../../tests/eleve.mother';
import type { Projet } from '../../../modeles/projet.modele';

describe('FpFormulaireProjetComponent', () => {
  let fixture: ComponentFixture<FpFormulaireProjetComponent>;
  let component: FpFormulaireProjetComponent;
  let donneesService: DonneesService;

  const alice = EleveMother.base('e1', 'MARTIN', 'Alice');
  const bob = EleveMother.base('e2', 'DUPONT', 'Bob');

  beforeEach(() => {
    TestBed.configureTestingModule({});
    donneesService = TestBed.inject(DonneesService);
    donneesService.charger(
      DonneesMother.base({
        classe: { ...DonneesMother.base().classe, eleves: [alice, bob] },
      }),
    );
    fixture = TestBed.createComponent(FpFormulaireProjetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialisation', () => {
    it('projet=null → formulaire vide, projet émis avec un nouvel id', () => {
      fixture.componentRef.setInput('projet', null);
      fixture.detectChanges();

      expect((component as any).form.getRawValue()).toEqual({
        nom: '',
        description: '',
        elevesIds: [],
        periodes: [],
      });
      expect((component as any).idProjet).toBeTruthy();
    });

    it('projet existant → formulaire chargé avec ses valeurs et ses périodes', () => {
      const periode = PeriodeMother.base({ competencesIds: ['c1'] });
      const projet = ProjetMother.base({ elevesIds: ['e1'], periodes: [periode] });
      fixture.componentRef.setInput('projet', projet);
      fixture.detectChanges();

      expect((component as any).form.getRawValue()).toEqual({
        nom: projet.nom,
        description: projet.description,
        elevesIds: ['e1'],
        periodes: [periode],
      });
    });

    it("changement d'identité de l'input projet → formulaire rechargé", () => {
      fixture.componentRef.setInput(
        'projet',
        ProjetMother.base({ id: 'p1', nom: 'Sciences', periodes: [PeriodeMother.base()] }),
      );
      fixture.detectChanges();
      fixture.componentRef.setInput('projet', ProjetMother.base({ id: 'p2', nom: 'Arts' }));
      fixture.detectChanges();

      expect((component as any).form.controls.nom.value).toBe('Arts');
      expect((component as any).periodesFormArray.length).toBe(0);
    });

    it('régression SOU-020 : même identité de projet avec contenu différent (UNDO/REDO) → saisie conservée', () => {
      fixture.componentRef.setInput('projet', ProjetMother.base({ id: 'p1', nom: 'Sciences' }));
      fixture.detectChanges();
      (component as any).form.controls.nom.setValue('Saisie en cours');

      fixture.componentRef.setInput(
        'projet',
        ProjetMother.base({ id: 'p1', nom: 'Sciences (modifié ailleurs)' }),
      );
      fixture.detectChanges();

      expect((component as any).form.controls.nom.value).toBe('Saisie en cours');
    });
  });

  describe('eleves (computed depuis donneesService)', () => {
    it('retourne les élèves chargés', () => {
      const eleves = (component as any).eleves();
      expect(eleves).toHaveLength(2);
    });
  });

  describe('ajouterEleve / retirerEleve', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('projet', ProjetMother.base({ elevesIds: [] }));
      fixture.detectChanges();
    });

    it('ajoute un élève absent', () => {
      (component as any).ajouterEleve('e1');

      expect((component as any).form.controls.elevesIds.value).toEqual(['e1']);
      expect((component as any).estEleveSelectionne('e1')).toBe(true);
    });

    it('retire un élève présent', () => {
      (component as any).form.controls.elevesIds.setValue(['e1', 'e2']);

      (component as any).retirerEleve('e1');

      expect((component as any).form.controls.elevesIds.value).toEqual(['e2']);
      expect((component as any).estEleveSelectionne('e1')).toBe(false);
    });

    it("n'ajoute pas un élève déjà présent", () => {
      (component as any).form.controls.elevesIds.setValue(['e1']);

      (component as any).ajouterEleve('e1');

      expect((component as any).form.controls.elevesIds.value).toEqual(['e1']);
    });
  });

  describe('ajouterPeriode / supprimerPeriode', () => {
    it('ajouterPeriode ajoute une période vide et demande le focus sur elle', () => {
      (component as any).ajouterPeriode();
      (component as any).ajouterPeriode();

      const periodes = (component as any).form.getRawValue().periodes;
      expect(periodes).toHaveLength(2);
      expect(periodes[1].periodeNom).toBe('');
      expect(periodes[1].id).not.toBe(periodes[0].id);
      expect((component as any).indexAFocaliserPeriode()).toBe(1);
    });

    it("supprimerPeriode(0) retire à l'index 0 et remet le focus demandé à null", () => {
      (component as any).ajouterPeriode();
      (component as any).ajouterPeriode();

      (component as any).supprimerPeriode(0);

      expect((component as any).periodesFormArray.length).toBe(1);
      expect((component as any).indexAFocaliserPeriode()).toBeNull();
    });

    it('suppression de la période du milieu parmi trois → les deux restantes gardent leurs valeurs et compétences', () => {
      fixture.componentRef.setInput(
        'projet',
        ProjetMother.base({
          periodes: [
            PeriodeMother.base({ id: 'pa', periodeNom: 'A', competencesIds: ['c1'] }),
            PeriodeMother.base({ id: 'pb', periodeNom: 'B', competencesIds: ['c2'] }),
            PeriodeMother.base({ id: 'pc', periodeNom: 'C', competencesIds: ['c3'] }),
          ],
        }),
      );
      fixture.detectChanges();
      const selecteurDernier = fixture.nativeElement.querySelector('#selecteurCompetences2');

      (component as any).supprimerPeriode(1);
      (component as any).cdr.markForCheck();
      fixture.detectChanges();

      const periodes = (component as any).form.getRawValue().periodes;
      expect(periodes.map((p: { periodeNom: string }) => p.periodeNom)).toEqual(['A', 'C']);
      expect(periodes.map((p: { competencesIds: string[] }) => p.competencesIds)).toEqual([
        ['c1'],
        ['c3'],
      ]);
      expect(fixture.nativeElement.querySelector('#selecteurCompetences1')).toBe(selecteurDernier);
    });
  });

  describe('surSelectionCompetences', () => {
    it("met à jour les competencesIds de la période à l'index donné", () => {
      (component as any).ajouterPeriode();
      (component as any).ajouterPeriode();

      (component as any).surSelectionCompetences(1, ['c1', 'c2']);

      const periodes = (component as any).form.getRawValue().periodes;
      expect(periodes[0].competencesIds).toEqual([]);
      expect(periodes[1].competencesIds).toEqual(['c1', 'c2']);
    });

    it('ne fait rien pour un index inexistant', () => {
      expect(() => (component as any).surSelectionCompetences(3, ['c1'])).not.toThrow();
    });
  });

  describe('onEnregistrer', () => {
    it('émet le projet saisi avec son id', () => {
      const periode = PeriodeMother.base({ competencesIds: ['c1'] });
      fixture.componentRef.setInput(
        'projet',
        ProjetMother.base({ id: 'p1', nom: 'Sciences', periodes: [periode] }),
      );
      fixture.detectChanges();
      (component as any).ajouterEleve('e2');
      const spy = vi.spyOn((component as any).enregistrer, 'emit');

      (component as any).onEnregistrer();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0]).toEqual(
        ProjetMother.base({ id: 'p1', nom: 'Sciences', elevesIds: ['e2'], periodes: [periode] }),
      );
    });

    it('émet un projet créé avec un identifiant stable', () => {
      fixture.componentRef.setInput('projet', null);
      fixture.detectChanges();
      (component as any).form.controls.nom.setValue('Nouveau');
      const spy = vi.spyOn((component as any).enregistrer, 'emit');

      (component as any).onEnregistrer();

      expect((spy.mock.calls[0][0] as Projet).id).toBe((component as any).idProjet);
    });

    it('n’émet rien si le nom est vide ou blanc', () => {
      fixture.componentRef.setInput('projet', ProjetMother.base({ id: 'p1', nom: '   ' }));
      fixture.detectChanges();
      const spy = vi.spyOn((component as any).enregistrer, 'emit');

      (component as any).onEnregistrer();

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('estFormulaireValide', () => {
    it('vrai avec un nom renseigné', () => {
      fixture.componentRef.setInput('projet', ProjetMother.base({ id: 'p1', nom: 'Sciences' }));
      fixture.detectChanges();

      expect((component as any).estFormulaireValide()).toBe(true);
    });

    it('faux pour une création vide et bouton ENREGISTRER désactivé', () => {
      fixture.componentRef.setInput('projet', null);
      fixture.detectChanges();

      expect((component as any).estFormulaireValide()).toBe(false);
      const bouton = fixture.nativeElement.querySelector(
        '#btnEnregistrerProjet',
      ) as HTMLButtonElement;
      expect(bouton.disabled).toBe(true);
    });

    it("faux avec un nom fait d'espaces, bouton désactivé ; vrai dès qu'un nom est saisi", () => {
      fixture.componentRef.setInput('projet', ProjetMother.base({ id: 'p1', nom: '   ' }));
      fixture.detectChanges();
      const bouton = fixture.nativeElement.querySelector(
        '#btnEnregistrerProjet',
      ) as HTMLButtonElement;
      expect(bouton.disabled).toBe(true);

      (component as any).form.controls.nom.setValue('Sciences');
      fixture.detectChanges();

      expect((component as any).estFormulaireValide()).toBe(true);
      expect(bouton.disabled).toBe(false);
    });
  });

  describe('onAnnuler', () => {
    it('émet annuler', () => {
      const spy = vi.spyOn((component as any).annuler, 'emit');

      (component as any).onAnnuler();

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
