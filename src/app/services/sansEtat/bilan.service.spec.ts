import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { BilanService } from './bilan.service';
import { DonneesService } from '../avecEtat/donnees.service';
import { DonneesMother } from '../../tests/donnees.mother';
import { EleveMother } from '../../tests/eleve.mother';
import { CompetenceMother } from '../../tests/competence.mother';
import {
  BilanMother,
  EvaluationBilanMother,
  SuiviSousDomaineMother,
} from '../../tests/bilan.mother';
import { SuiviSousDomaine } from '../../modeles/bilan.modele';
import { DateUtils } from '../../utilitaires/date.utils';
import { LIBELLES } from '../../libelles';

describe('BilanService', () => {
  let service: BilanService;
  let donneesService: DonneesService;

  /**
   * Charge un élève `e1` portant les suivis fournis, dans un référentiel à 4 niveaux.
   * @param suivis Suivis de l'élève.
   * @param domainesActifs Domaines actifs de la configuration.
   */
  const charger = (suivis: SuiviSousDomaine[] = [], domainesActifs?: string[]): void => {
    const donnees = DonneesMother.avecEleves([
      EleveMother.base('e1', 'MARTIN', 'Paul', { suivisSousDomaines: suivis }),
    ]);
    donnees.referentiels.competences = CompetenceMother.arbreQuatreNiveaux();
    donnees.configuration.domainesActifs = domainesActifs;
    donneesService.charger(donnees);
  };

  /** Suivis de l'élève `e1` dans les données courantes. */
  const suivis = (): SuiviSousDomaine[] =>
    donneesService.donnees()?.classe.eleves[0].suivisSousDomaines ?? [];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BilanService);
    donneesService = TestBed.inject(DonneesService);
    charger();
  });

  describe('sous-domaines et compétences évaluables', () => {
    it('liste les nœuds de niveau 3 avec leur libellé complet', () => {
      expect(service.obtenirSousDomaines()).toEqual([
        { id: 'FR-C2-L', libelle: 'Français > Cycle 2 > Lire' },
        { id: 'FR-C2-E', libelle: 'Français > Cycle 2 > Écrire' },
        { id: 'MA-C2-N', libelle: 'Mathématiques > Cycle 2 > Nombres' },
      ]);
    });

    it('ne liste que les sous-domaines des domaines actifs', () => {
      charger([], ['MA']);
      expect(service.obtenirSousDomaines().map((s) => s.id)).toEqual(['MA-C2-N']);
    });

    it("résout le libellé complet d'un sous-domaine, vide s'il est inconnu", () => {
      expect(service.obtenirLibelleSousDomaine('FR-C2-E')).toBe('Français > Cycle 2 > Écrire');
      expect(service.obtenirLibelleSousDomaine('inconnu')).toBe('');
    });

    it("liste les feuilles d'un sous-domaine, y compris sous un nœud intermédiaire", () => {
      expect(service.obtenirCompetencesEvaluables('FR-C2-L').map((c) => c.id)).toEqual([
        'FR-C2-L-1',
        'FR-C2-L-2-1',
      ]);
    });

    it('retourne une liste vide pour un sous-domaine inconnu ou sans enfant', () => {
      expect(service.obtenirCompetencesEvaluables('inconnu')).toEqual([]);
      expect(service.obtenirCompetencesEvaluables('FR-C2-E-1')).toEqual([]);
    });
  });

  describe('création de valeurs vierges', () => {
    it('crée un bilan daté du jour, sans titre ni contenu', () => {
      const bilan = service.creerBilanVierge();
      expect(bilan.id).not.toBe('');
      expect(bilan.date).toBe(DateUtils.dateAujourdhui());
      expect(bilan).toMatchObject({
        titre: '',
        bilans: '',
        besoinsSpecifiques: '',
        moyens: '',
        evaluations: [],
      });
    });

    it('crée une évaluation sans compétence ni statut', () => {
      const evaluation = service.creerEvaluationVierge();
      expect(evaluation.id).not.toBe('');
      expect(evaluation).toMatchObject({
        competenceId: '',
        statutAcquisitionId: null,
        commentaire: '',
      });
    });
  });

  describe('enregistrement', () => {
    it("crée le suivi du sous-domaine au premier bilan, avec le libellé d'UNDO dédié", () => {
      service.enregistrerBilan('e1', 'FR-C2-L', BilanMother.base('b1'));
      expect(suivis()).toEqual([
        SuiviSousDomaineMother.avecBilans('FR-C2-L', [BilanMother.base('b1')]),
      ]);
      expect(donneesService.libelleSommetUndo()).toBe(LIBELLES.commandes.enregistrementBilan);
    });

    it('ajoute un nouveau bilan en dernière position du sous-domaine', () => {
      charger([SuiviSousDomaineMother.avecBilans('FR-C2-L', [BilanMother.base('b1')])]);
      service.enregistrerBilan('e1', 'FR-C2-L', BilanMother.base('b2'));
      expect(suivis()[0].bilans.map((b) => b.id)).toEqual(['b1', 'b2']);
    });

    it('remplace un bilan existant sans changer sa position', () => {
      charger([
        SuiviSousDomaineMother.avecBilans('FR-C2-L', [
          BilanMother.base('b1'),
          BilanMother.base('b2'),
        ]),
      ]);
      service.enregistrerBilan('e1', 'FR-C2-L', BilanMother.base('b1', { titre: 'Modifié' }));
      expect(suivis()[0].bilans.map((b) => b.titre)).toEqual(['Modifié', 'Bilan b2']);
    });

    it("est annulable : l'UNDO retire le suivi créé", () => {
      service.enregistrerBilan('e1', 'FR-C2-L', BilanMother.base('b1'));
      donneesService.annuler();
      expect(suivis()).toEqual([]);
    });

    it("est sans effet si l'élève est introuvable", () => {
      service.enregistrerBilan('inconnu', 'FR-C2-L', BilanMother.base('b1'));
      expect(donneesService.peutAnnuler()).toBe(false);
    });
  });

  describe('suppression', () => {
    it('retire le bilan et conserve le suivi qui contient encore des bilans', () => {
      charger([
        SuiviSousDomaineMother.avecBilans('FR-C2-L', [
          BilanMother.base('b1'),
          BilanMother.base('b2'),
        ]),
      ]);
      service.supprimerBilan('e1', 'FR-C2-L', 'b1');
      expect(suivis()[0].bilans.map((b) => b.id)).toEqual(['b2']);
      expect(donneesService.libelleSommetUndo()).toBe(LIBELLES.commandes.suppressionBilan);
    });

    it('retire le suivi quand son dernier bilan est supprimé', () => {
      charger([
        SuiviSousDomaineMother.avecBilans('FR-C2-L', [BilanMother.base('b1')]),
        SuiviSousDomaineMother.avecBilans('MA-C2-N', [BilanMother.base('b2')]),
      ]);
      service.supprimerBilan('e1', 'FR-C2-L', 'b1');
      expect(suivis().map((s) => s.sousDomaineId)).toEqual(['MA-C2-N']);
    });

    it('est sans effet si le sous-domaine ou le bilan est introuvable', () => {
      charger([SuiviSousDomaineMother.avecBilans('FR-C2-L', [BilanMother.base('b1')])]);
      service.supprimerBilan('e1', 'MA-C2-N', 'b1');
      service.supprimerBilan('e1', 'FR-C2-L', 'inconnu');
      expect(donneesService.peutAnnuler()).toBe(false);
    });
  });

  describe('duplication', () => {
    it('ajoute une copie en dernière position avec de nouveaux identifiants', () => {
      const source = BilanMother.base('b1', {
        evaluations: [EvaluationBilanMother.base('ev1', { commentaire: 'Fluide' })],
      });
      charger([
        SuiviSousDomaineMother.avecBilans('FR-C2-L', [source, BilanMother.base('b2')]),
      ]);
      service.dupliquerBilan('e1', 'FR-C2-L', 'b1');

      const bilans = suivis()[0].bilans;
      expect(bilans).toHaveLength(3);
      const copie = bilans[2];
      expect(copie.id).not.toBe('b1');
      expect(copie.titre).toBe(source.titre);
      expect(copie.evaluations).toHaveLength(1);
      expect(copie.evaluations[0].id).not.toBe('ev1');
      expect(copie.evaluations[0].commentaire).toBe('Fluide');
      expect(donneesService.libelleSommetUndo()).toBe(LIBELLES.commandes.duplicationBilan);
    });

    it('est sans effet si le sous-domaine ou le bilan est introuvable', () => {
      charger([SuiviSousDomaineMother.avecBilans('FR-C2-L', [BilanMother.base('b1')])]);
      service.dupliquerBilan('e1', 'MA-C2-N', 'b1');
      service.dupliquerBilan('e1', 'FR-C2-L', 'inconnu');
      expect(donneesService.peutAnnuler()).toBe(false);
    });
  });

  describe('déplacement', () => {
    beforeEach(() => {
      charger([
        SuiviSousDomaineMother.avecBilans('FR-C2-L', [
          BilanMother.base('b1'),
          BilanMother.base('b2'),
          BilanMother.base('b3'),
        ]),
      ]);
    });

    /** Ordre courant des bilans du sous-domaine `FR-C2-L`. */
    const ordre = (): string[] => suivis()[0].bilans.map((b) => b.id);

    it("monte un bilan d'une position", () => {
      service.deplacerBilan('e1', 'FR-C2-L', 'b2', -1);
      expect(ordre()).toEqual(['b2', 'b1', 'b3']);
      expect(donneesService.libelleSommetUndo()).toBe(LIBELLES.commandes.deplacementBilan);
    });

    it("descend un bilan d'une position", () => {
      service.deplacerBilan('e1', 'FR-C2-L', 'b2', 1);
      expect(ordre()).toEqual(['b1', 'b3', 'b2']);
    });

    it('est sans effet aux extrémités, pour un bilan ou un sous-domaine inconnu', () => {
      service.deplacerBilan('e1', 'FR-C2-L', 'b1', -1);
      service.deplacerBilan('e1', 'FR-C2-L', 'b3', 1);
      service.deplacerBilan('e1', 'FR-C2-L', 'inconnu', 1);
      service.deplacerBilan('e1', 'MA-C2-N', 'b1', 1);
      expect(ordre()).toEqual(['b1', 'b2', 'b3']);
      expect(donneesService.peutAnnuler()).toBe(false);
    });
  });
});
