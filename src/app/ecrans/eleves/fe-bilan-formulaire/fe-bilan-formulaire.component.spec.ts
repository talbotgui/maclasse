import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { FeBilanFormulaireComponent } from './fe-bilan-formulaire.component';
import { DonneesService } from '../../../services/avecEtat/donnees.service';
import { DonneesMother } from '../../../tests/donnees.mother';
import { CompetenceMother } from '../../../tests/competence.mother';
import { BilanMother, EvaluationBilanMother } from '../../../tests/bilan.mother';
import { StatutAcquisitionMother } from '../../../tests/referentiel.mother';
import { LIBELLES } from '../../../libelles';
import type { Bilan } from '../../../modeles/bilan.modele';

describe('FeBilanFormulaireComponent', () => {
  let fixture: ComponentFixture<FeBilanFormulaireComponent>;
  let component: FeBilanFormulaireComponent;

  /**
   * Crée le composant pour le bilan donné.
   * @param bilan Bilan à éditer.
   */
  const creer = async (bilan: Bilan): Promise<void> => {
    fixture = TestBed.createComponent(FeBilanFormulaireComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('bilan', bilan);
    fixture.componentRef.setInput('sousDomaineId', 'FR-C2-L');
    fixture.componentRef.setInput('statutsAcquisition', [
      StatutAcquisitionMother.acquis(),
      StatutAcquisitionMother.enCours(),
    ]);
    fixture.detectChanges();
    await fixture.whenStable();
  };

  /** Bouton VALIDER. */
  const btnValider = (): HTMLButtonElement =>
    fixture.nativeElement.querySelector('[id^="btnValiderBilan_"]');

  /** Formulaire du composant. */
  const form = (): any => (component as any).form;

  beforeEach(async () => {
    TestBed.configureTestingModule({});
    const donnees = DonneesMother.base();
    donnees.referentiels.competences = CompetenceMother.arbreQuatreNiveaux();
    TestBed.inject(DonneesService).charger(donnees);
    await creer(
      BilanMother.base('b1', {
        titre: 'Bilan initial',
        evaluations: [
          EvaluationBilanMother.base('ev1', { statutAcquisitionId: null, commentaire: 'Lent' }),
        ],
      }),
    );
  });

  describe('chargement', () => {
    it('charge le bilan et ses évaluations dans le formulaire', () => {
      expect(form().controls.titre.value).toBe('Bilan initial');
      expect(form().controls.date).toBeUndefined();
      expect(fixture.nativeElement.querySelector('input[type="date"]')).toBeNull();
      expect(form().controls.bilans.value).toBe('<p>Progrès réguliers</p>');
      expect((component as any).lignes).toHaveLength(1);
      expect((component as any).lignes[0].controls.statutAcquisitionId.value).toBe('');
      expect(btnValider().disabled).toBe(false);
    });

    it('propose les statuts avec leur glyphe', () => {
      expect((component as any).optionsStatut()).toEqual([
        { valeur: 'A', libelle: '✓ Acquis' },
        { valeur: 'EC', libelle: '~ En cours' },
      ]);
    });

    it('place le focus sur le titre à la demande', async () => {
      fixture.componentRef.setInput('focusDemande', true);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(document.activeElement?.id).toBe('champBilanTitre_b1-input');
    });
  });

  describe('validation', () => {
    it('désactive VALIDER sans titre et signale l’erreur une fois le champ touché', () => {
      form().controls.titre.setValue('   ');
      form().controls.titre.markAsDirty();
      fixture.detectChanges();
      expect(btnValider().disabled).toBe(true);
      expect((component as any).obtenirMessageErreur()).toBe(LIBELLES.bilans.erreurTitre);
    });

    it('ne signale pas le titre manquant d’un nouveau bilan non touché', async () => {
      await creer(BilanMother.base('b2', { titre: '' }));
      expect(btnValider().disabled).toBe(true);
      expect((component as any).obtenirMessageErreur()).toBeNull();
    });

    it('signale une évaluation sans compétence', () => {
      (component as any).ajouterEvaluation();
      fixture.detectChanges();
      expect(btnValider().disabled).toBe(true);
      expect((component as any).obtenirMessageErreur()).toBe(
        LIBELLES.bilans.erreurEvaluationSansCompetence,
      );
      expect(fixture.nativeElement.querySelector('#erreurBilan_b1').getAttribute('role')).toBe(
        'alert',
      );
    });

    it('signale une compétence évaluée deux fois', () => {
      (component as any).ajouterEvaluation();
      const ligne = (component as any).lignes[1];
      (component as any).choisirCompetence(ligne, ['FR-C2-L-1']);
      fixture.detectChanges();
      expect((component as any).obtenirMessageErreur()).toBe(
        LIBELLES.bilans.erreurCompetenceEnDouble,
      );

      (component as any).choisirCompetence(ligne, ['FR-C2-L-2-1']);
      fixture.detectChanges();
      expect((component as any).obtenirMessageErreur()).toBeNull();
      expect(btnValider().disabled).toBe(false);
    });
  });

  describe('lignes d’évaluation', () => {
    it('ajoute une ligne vide et la désigne pour le focus', () => {
      (component as any).ajouterEvaluation();
      expect((component as any).lignes).toHaveLength(2);
      expect((component as any).indexAFocaliser()).toBe(1);
      expect((component as any).obtenirSelectionLigne((component as any).lignes[1])).toEqual([]);
    });

    it('reporte la compétence choisie, ou la vide', () => {
      const ligne = (component as any).lignes[0];
      expect((component as any).obtenirSelectionLigne(ligne)).toEqual(['FR-C2-L-1']);
      (component as any).choisirCompetence(ligne, []);
      expect(ligne.controls.competenceId.value).toBe('');
    });

    it('supprime une ligne', () => {
      fixture.nativeElement.querySelector('#btnSupprimerEvaluation_b1_0').click();
      fixture.detectChanges();
      expect((component as any).lignes).toHaveLength(0);
      expect(fixture.nativeElement.querySelector('.mc-tableau-bilan__vide')).not.toBeNull();
    });
  });

  describe('sorties', () => {
    it('émet le bilan saisi : titre nettoyé, statut vide à null', () => {
      form().controls.titre.setValue('  Bilan revu  ');
      (component as any).lignes[0].controls.commentaire.setValue('Plus rapide');
      const spy = vi.spyOn((component as any).valider, 'emit');

      (component as any).onValider();

      expect(spy).toHaveBeenCalledTimes(1);
      const emis = spy.mock.calls[0][0] as Bilan;
      expect(emis.id).toBe('b1');
      expect(emis.titre).toBe('Bilan revu');
      expect(emis.evaluations).toEqual([
        EvaluationBilanMother.base('ev1', { statutAcquisitionId: null, commentaire: 'Plus rapide' }),
      ]);
    });

    it('émet le statut choisi', () => {
      (component as any).lignes[0].controls.statutAcquisitionId.setValue('EC');
      const spy = vi.spyOn((component as any).valider, 'emit');
      (component as any).onValider();
      expect((spy.mock.calls[0][0] as Bilan).evaluations[0].statutAcquisitionId).toBe('EC');
    });

    it('n’émet rien tant que le formulaire est invalide', () => {
      form().controls.titre.setValue('');
      const spy = vi.spyOn((component as any).valider, 'emit');
      (component as any).onValider();
      expect(spy).not.toHaveBeenCalled();
    });

    it('émet l’abandon', () => {
      const spy = vi.spyOn((component as any).annuler, 'emit');
      (component as any).onAnnuler();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
