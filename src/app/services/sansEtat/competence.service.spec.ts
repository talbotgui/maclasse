import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CompetenceService } from './competence.service';
import { DonneesService } from '../avecEtat/donnees.service';
import { DonneesMother } from '../../tests/donnees.mother';
import { CompetenceMother } from '../../tests/competence.mother';

describe('CompetenceService', () => {
  let service: CompetenceService;
  let donneesService: DonneesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompetenceService);
    donneesService = TestBed.inject(DonneesService);
    const d = DonneesMother.base();
    d.referentiels.competences = CompetenceMother.arbreSimple();
    donneesService.charger(d);
  });

  /** Retourne les nœuds de niveau 1 (domaines) ou un tableau vide si aucune donnée. */
  describe('obtenirDomaines', () => {
    it('retourne les nœuds de niveau 1', () => {
      const domaines = service.obtenirDomaines();
      expect(domaines).toHaveLength(2);
      expect(domaines[0].id).toBe('FR');
      expect(domaines[1].id).toBe('MATH');
    });

    it('retourne tableau vide sans données', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const s = TestBed.inject(CompetenceService);
      expect(s.obtenirDomaines()).toEqual([]);
    });
  });

  /** Retourne le domaine de niveau 1 correspondant, undefined si id inconnu. */
  describe('obtenirDomaineParId', () => {
    it('retourne le domaine correspondant', () => {
      expect(service.obtenirDomaineParId('FR')?.libelle).toBe('Français');
    });

    it('retourne undefined pour un id inexistant', () => {
      expect(service.obtenirDomaineParId('INCONNU')).toBeUndefined();
    });
  });

  /** Parcourt tous les nœuds et retourne ceux dont le libellé contient le terme, insensible casse et accents. */
  describe('rechercherCompetences', () => {
    it('retourne tableau vide si terme vide', () => {
      expect(service.rechercherCompetences('')).toEqual([]);
    });

    it('retourne tableau vide si terme composé d\'espaces', () => {
      expect(service.rechercherCompetences('  ')).toEqual([]);
    });

    it('trouve un nœud par libellé exact', () => {
      const resultats = service.rechercherCompetences('Français');
      expect(resultats.some(c => c.id === 'FR')).toBe(true);
    });

    it('trouve des nœuds en profondeur', () => {
      const resultats = service.rechercherCompetences('texte');
      expect(resultats.some(c => c.id === 'FR-LECT-1')).toBe(true);
    });

    it('est insensible à la casse', () => {
      const resultats = service.rechercherCompetences('lecture');
      expect(resultats.some(c => c.id === 'FR-LECT')).toBe(true);
    });

    it('est insensible aux accents', () => {
      const resultats = service.rechercherCompetences('mathematiques');
      expect(resultats.some(c => c.id === 'MATH')).toBe(true);
    });

    it('retourne plusieurs nœuds correspondants', () => {
      const resultats = service.rechercherCompetences('lire');
      expect(resultats.length).toBeGreaterThan(0);
    });
  });

  /** Retourne le chemin de nœuds depuis la racine jusqu'au nœud cible inclus, tableau vide si id inconnu. */
  describe('obtenirChemin', () => {
    it('retourne le chemin vers un nœud en profondeur', () => {
      const chemin = service.obtenirChemin('FR-LECT-1');
      expect(chemin).toHaveLength(3);
      expect(chemin[0].id).toBe('FR');
      expect(chemin[1].id).toBe('FR-LECT');
      expect(chemin[2].id).toBe('FR-LECT-1');
    });

    it('retourne le chemin d\'un nœud racine', () => {
      const chemin = service.obtenirChemin('MATH');
      expect(chemin).toHaveLength(1);
      expect(chemin[0].id).toBe('MATH');
    });

    it('retourne tableau vide pour un id inexistant', () => {
      expect(service.obtenirChemin('INCONNU')).toEqual([]);
    });

    it('trouve dans le second domaine', () => {
      const chemin = service.obtenirChemin('MATH-NB');
      expect(chemin).toHaveLength(2);
      expect(chemin[0].id).toBe('MATH');
    });
  });

  /** Retourne le chemin breadcrumb séparé par ›, chaîne vide si id inconnu. */
  describe('resoudreLibelle', () => {
    it('retourne le chemin breadcrumb complet', () => {
      const libelle = service.resoudreLibelle('FR-LECT-1');
      expect(libelle).toBe('Français › Lecture › Comprendre un texte lu');
    });

    it('retourne le libellé seul pour un nœud racine', () => {
      expect(service.resoudreLibelle('MATH')).toBe('Mathématiques');
    });

    it('retourne chaîne vide pour un id inexistant', () => {
      expect(service.resoudreLibelle('INCONNU')).toBe('');
    });
  });
});
