import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { RechercheGlobaleService } from './recherche-globale.service';
import { DonneesService } from '../avecEtat/donnees.service';
import { DonneesMother } from '../../tests/donnees.mother';
import { EleveMother } from '../../tests/eleve.mother';
import { ProjetMother } from '../../tests/projet.mother';

describe('RechercheGlobaleService', () => {
  let service: RechercheGlobaleService;
  let donneesService: DonneesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RechercheGlobaleService);
    donneesService = TestBed.inject(DonneesService);
    const d = DonneesMother.base();
    d.classe.eleves = [
      EleveMother.base('e1', 'MARTIN', 'Paul'),
      EleveMother.base('e2', 'DUPONT', 'Marie'),
      EleveMother.base('e3', 'ÉLIE', 'Élodie'),
    ];
    d.projets = [
      ProjetMother.base(),
      ProjetMother.base({ id: 'p2', nom: 'Élevage d\'escargots' }),
    ];
    donneesService.charger(d);
  });

  /** Retourne toujours un tableau vide si le terme est vide ou composé uniquement d'espaces. */
  describe('terme vide', () => {
    it('retourne tableau vide si terme vide', () => {
      expect(service.rechercher('')).toEqual([]);
    });

    it('retourne tableau vide si terme composé d\'espaces', () => {
      expect(service.rechercher('  ')).toEqual([]);
    });
  });

  /** Retourne un tableau vide si aucune donnée n'est encore chargée dans le service. */
  describe('sans données chargées', () => {
    it('retourne tableau vide', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const s = TestBed.inject(RechercheGlobaleService);
      expect(s.rechercher('martin')).toEqual([]);
    });
  });

  /** Trouve les élèves par nom ou prénom, insensible à la casse et aux accents, avec le bon type et la bonne route. */
  describe('recherche dans les élèves', () => {
    it('trouve un élève par nom', () => {
      const resultats = service.rechercher('martin');
      expect(resultats).toHaveLength(1);
      expect(resultats[0].id).toBe('e1');
      expect(resultats[0].type).toBe('eleve');
      expect(resultats[0].route).toBe('/eleves');
    });

    it('trouve un élève par prénom', () => {
      const resultats = service.rechercher('marie');
      expect(resultats).toHaveLength(1);
      expect(resultats[0].id).toBe('e2');
    });

    it('trouve un élève par partie du nom', () => {
      const resultats = service.rechercher('mar');
      expect(resultats.filter(r => r.type === 'eleve')).toHaveLength(2);
    });

    it('est insensible à la casse', () => {
      expect(service.rechercher('MARTIN')).toHaveLength(1);
      expect(service.rechercher('martin')).toHaveLength(1);
    });

    it('est insensible aux accents', () => {
      const resultats = service.rechercher('elie');
      expect(resultats).toHaveLength(1);
      expect(resultats[0].id).toBe('e3');
    });

    it('le titre contient NOM Prénom', () => {
      const resultats = service.rechercher('martin');
      expect(resultats[0].titre).toBe('MARTIN Paul');
    });
  });

  /** Trouve les projets par nom, insensible à la casse et aux accents, avec le bon type et la bonne route. */
  describe('recherche dans les projets', () => {
    it('trouve un projet par nom', () => {
      const resultats = service.rechercher('compostage');
      expect(resultats).toHaveLength(1);
      expect(resultats[0].id).toBe('p1');
      expect(resultats[0].type).toBe('projet');
      expect(resultats[0].route).toBe('/projets');
    });

    it('est insensible aux accents pour les projets', () => {
      const resultats = service.rechercher('elevage');
      expect(resultats).toHaveLength(1);
      expect(resultats[0].id).toBe('p2');
    });

    it('le titre du projet correspond au nom', () => {
      const resultats = service.rechercher('compostage');
      expect(resultats[0].titre).toBe('Compostage');
    });
  });

  /** Les élèves apparaissent avant les projets dans les résultats combinés. */
  describe('résultats mixtes', () => {
    it('retourne élèves avant projets', () => {
      const d = DonneesMother.base();
      d.classe.eleves = [EleveMother.base('e1', 'MAR', 'Test')];
      d.projets = [ProjetMother.base({ nom: 'MAR' })];
      donneesService.charger(d);
      const resultats = service.rechercher('mar');
      expect(resultats[0].type).toBe('eleve');
      expect(resultats[1].type).toBe('projet');
    });

    it('retourne tableau vide si aucun résultat', () => {
      expect(service.rechercher('xyz')).toEqual([]);
    });
  });
});
