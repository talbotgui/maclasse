import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { FeBilanComponent } from './fe-bilan.component';
import { DonneesService } from '../../../services/avecEtat/donnees.service';
import { DonneesMother } from '../../../tests/donnees.mother';
import { CompetenceMother } from '../../../tests/competence.mother';
import { BilanMother, EvaluationBilanMother } from '../../../tests/bilan.mother';
import { StatutAcquisitionMother } from '../../../tests/referentiel.mother';
import { DateUtils } from '../../../utilitaires/date.utils';
import { LIBELLES } from '../../../libelles';

describe('FeBilanComponent', () => {
  let fixture: ComponentFixture<FeBilanComponent>;
  let component: FeBilanComponent;

  /**
   * Élément du rendu par sélecteur CSS.
   * @param selecteur Sélecteur CSS.
   */
  const element = <T extends HTMLElement>(selecteur: string): T =>
    fixture.nativeElement.querySelector(selecteur) as T;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    const donnees = DonneesMother.base();
    donnees.referentiels.competences = CompetenceMother.arbreQuatreNiveaux();
    TestBed.inject(DonneesService).charger(donnees);
    fixture = TestBed.createComponent(FeBilanComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput(
      'bilan',
      BilanMother.base('b1', {
        titre: 'Premier bilan',
        moyens: '',
        evaluations: [
          EvaluationBilanMother.base('ev1', { competenceId: 'FR-C2-L-2-1', commentaire: 'Lent' }),
          EvaluationBilanMother.base('ev2', { competenceId: 'XX', statutAcquisitionId: null }),
        ],
      }),
    );
    fixture.componentRef.setInput('statutsAcquisition', [StatutAcquisitionMother.acquis()]);
    fixture.detectChanges();
  });

  describe('barre de titre', () => {
    it('affiche la date et le titre dans le bouton de bascule', () => {
      const bascule = element<HTMLButtonElement>('#btnBasculerBilan_b1');
      expect(bascule.textContent).toContain(DateUtils.formaterDateCourt('2026-10-01'));
      expect(bascule.textContent).toContain('Premier bilan');
    });

    it('affiche « (sans titre) » pour un bilan sans titre', () => {
      fixture.componentRef.setInput('bilan', BilanMother.base('b1', { titre: '', date: '' }));
      fixture.detectChanges();
      expect(element('#btnBasculerBilan_b1').textContent?.trim()).toContain(
        LIBELLES.bilans.sansTitre,
      );
    });

    it('replie le corps par défaut et le déplie à la demande', () => {
      expect(element('#btnBasculerBilan_b1').getAttribute('aria-expanded')).toBe('false');
      expect(element('#corpsBilan_b1').hidden).toBe(true);

      fixture.componentRef.setInput('deplie', true);
      fixture.detectChanges();

      expect(element('#btnBasculerBilan_b1').getAttribute('aria-expanded')).toBe('true');
      expect(element('#corpsBilan_b1').hidden).toBe(false);
    });

    it('désactive les actions quand un autre bilan est en édition', () => {
      fixture.componentRef.setInput('actionsDesactivees', true);
      fixture.componentRef.setInput('peutMonter', true);
      fixture.componentRef.setInput('peutDescendre', true);
      fixture.detectChanges();
      for (const id of ['Modifier', 'Dupliquer', 'Monter', 'Descendre', 'Supprimer']) {
        expect(element<HTMLButtonElement>(`#btn${id}Bilan_b1`).disabled).toBe(true);
      }
    });

    it('désactive MONTER et DESCENDRE aux extrémités', () => {
      expect(element<HTMLButtonElement>('#btnMonterBilan_b1').disabled).toBe(true);
      expect(element<HTMLButtonElement>('#btnDescendreBilan_b1').disabled).toBe(true);
      expect(element<HTMLButtonElement>('#btnModifierBilan_b1').disabled).toBe(false);
    });
  });

  describe('corps', () => {
    it('affiche les textes riches et un tiret pour un texte vide', () => {
      const cadres = fixture.nativeElement.querySelectorAll('.bilan__cadre');
      expect(cadres[0].querySelector('.mc-texte-riche').innerHTML).toBe('<p>Progrès réguliers</p>');
      expect(cadres[2].textContent).toContain(LIBELLES.bilans.texteVide);
    });

    it('résout les compétences relativement au sous-domaine et les statuts', () => {
      const lignes = (component as any).lignes();
      expect(lignes[0].competence).toBe('Comprendre > Comprendre un texte lu');
      expect(lignes[0].statut?.id).toBe('A');
      expect(lignes[0].commentaire).toBe('Lent');
      expect(lignes[1].competence).toBe('XX');
      expect(lignes[1].statut).toBeNull();
    });

    it('affiche un message quand le bilan n’a aucune évaluation', () => {
      fixture.componentRef.setInput('bilan', BilanMother.base('b1'));
      fixture.detectChanges();
      expect(element('.mc-tableau-bilan__vide').textContent?.trim()).toBe(
        LIBELLES.bilans.aucuneEvaluation,
      );
    });
  });

  describe('actions', () => {
    it.each([
      ['basculer', 'onBasculer'],
      ['modifier', 'onModifier'],
      ['dupliquer', 'onDupliquer'],
      ['monter', 'onMonter'],
      ['descendre', 'onDescendre'],
      ['supprimer', 'onSupprimer'],
    ])('émet %s via %s', (sortie, methode) => {
      const spy = vi.spyOn((component as any)[sortie], 'emit');
      (component as any)[methode]();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
