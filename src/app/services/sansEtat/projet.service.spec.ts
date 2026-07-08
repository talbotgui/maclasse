import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ProjetService } from './projet.service';
import { DonneesService } from '../avecEtat/donnees.service';
import { DonneesMother } from '../../tests/donnees.mother';
import { ProjetMother, PeriodeMother } from '../../tests/projet.mother';

describe('ProjetService', () => {
  let service: ProjetService;
  let donneesService: DonneesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjetService);
    donneesService = TestBed.inject(DonneesService);
    donneesService.charger(DonneesMother.base());
  });

  /** Le projet est ajouté à la liste et la création est réversible via UNDO. */
  describe('creerProjet', () => {
    it('ajoute un projet', () => {
      service.creerProjet(ProjetMother.base());
      expect(donneesService.donnees()?.projets).toHaveLength(1);
    });

    it('supporte le UNDO', () => {
      service.creerProjet(ProjetMother.base());
      donneesService.annuler();
      expect(donneesService.donnees()?.projets).toHaveLength(0);
    });
  });

  /** Met à jour le projet trouvé par son id ; sans effet si id inconnu ou données absentes. */
  describe('modifierProjet', () => {
    it('met à jour un projet existant', () => {
      service.creerProjet(ProjetMother.base());
      service.modifierProjet({ ...ProjetMother.base(), nom: 'Jardinage' });
      expect(donneesService.donnees()?.projets[0].nom).toBe('Jardinage');
    });

    it('sans effet si id inexistant', () => {
      service.creerProjet(ProjetMother.base());
      service.modifierProjet({ ...ProjetMother.base(), id: 'inconnu', nom: 'X' });
      expect(donneesService.donnees()?.projets[0].nom).toBe('Compostage');
    });

    it('sans effet si aucune donnée chargée', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const s = TestBed.inject(ProjetService);
      expect(() => s.modifierProjet(ProjetMother.base())).not.toThrow();
    });
  });

  /** Retire le projet par son id ; sans effet si id inconnu ou données absentes. */
  describe('supprimerProjet', () => {
    it('supprime un projet existant', () => {
      service.creerProjet(ProjetMother.base());
      service.supprimerProjet('p1');
      expect(donneesService.donnees()?.projets).toHaveLength(0);
    });

    it('sans effet si id inexistant', () => {
      service.creerProjet(ProjetMother.base());
      service.supprimerProjet('inconnu');
      expect(donneesService.donnees()?.projets).toHaveLength(1);
    });

    it('sans effet si aucune donnée chargée', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const s = TestBed.inject(ProjetService);
      expect(() => s.supprimerProjet('p1')).not.toThrow();
    });
  });

  /** Retourne le projet si l'id existe, undefined sinon. */
  describe('obtenirProjet', () => {
    it("retourne le projet si l'id existe", () => {
      service.creerProjet(ProjetMother.base());
      expect(service.obtenirProjet('p1')?.nom).toBe('Compostage');
    });

    it("retourne undefined si l'id n'existe pas", () => {
      expect(service.obtenirProjet('inconnu')).toBeUndefined();
    });
  });

  /** Filtre par nom et description, insensible à la casse et aux accents ; retourne tout si terme vide. */
  describe('rechercherProjets', () => {
    beforeEach(() => {
      service.creerProjet(ProjetMother.base());
      service.creerProjet(
        ProjetMother.base({ id: 'p2', nom: 'Élevage', description: 'Élever des escargots' }),
      );
    });

    it('retourne tous si terme vide', () => {
      expect(service.rechercherProjets('')).toHaveLength(2);
    });

    it('filtre par nom', () => {
      const resultats = service.rechercherProjets('compost');
      expect(resultats).toHaveLength(1);
      expect(resultats[0].id).toBe('p1');
    });

    it('filtre par description', () => {
      const resultats = service.rechercherProjets('escargot');
      expect(resultats).toHaveLength(1);
    });

    it('est insensible aux accents', () => {
      expect(service.rechercherProjets('elevage')).toHaveLength(1);
    });

    it('est insensible à la casse', () => {
      expect(service.rechercherProjets('COMPOSTAGE')).toHaveLength(1);
    });

    it('retourne tableau vide si aucun résultat', () => {
      expect(service.rechercherProjets('xyz')).toHaveLength(0);
    });
  });

  /** Vérifie l'ajout, la modification et la suppression de périodes dans un projet. */
  describe('ajouterPeriode', () => {
    it('ajoute une période au projet', () => {
      service.creerProjet(ProjetMother.base());
      service.ajouterPeriode('p1', PeriodeMother.base());
      expect(donneesService.donnees()?.projets[0].periodes).toHaveLength(1);
    });

    it('sans effet si projet inexistant', () => {
      service.creerProjet(ProjetMother.base());
      service.ajouterPeriode('inconnu', PeriodeMother.base());
      expect(donneesService.donnees()?.projets[0].periodes).toHaveLength(0);
    });

    it('sans effet si aucune donnée chargée', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const s = TestBed.inject(ProjetService);
      expect(() => s.ajouterPeriode('p1', PeriodeMother.base())).not.toThrow();
    });

    it('supporte le UNDO', () => {
      service.creerProjet(ProjetMother.base());
      service.ajouterPeriode('p1', PeriodeMother.base());
      donneesService.annuler();
      expect(donneesService.donnees()?.projets[0].periodes).toHaveLength(0);
    });
  });

  /** Modifie une période existante dans un projet ; sans effet si le projet est introuvable ou sans données. */
  describe('modifierPeriode', () => {
    it('modifie une période existante', () => {
      service.creerProjet(ProjetMother.base());
      service.ajouterPeriode('p1', PeriodeMother.base());
      service.modifierPeriode('p1', PeriodeMother.base(), {
        ...PeriodeMother.base(),
        debut: '2025-09-02',
      });
      expect(donneesService.donnees()?.projets[0].periodes[0].debut).toBe('2025-09-02');
    });

    it('sans effet si projet inexistant', () => {
      service.creerProjet(ProjetMother.base());
      service.ajouterPeriode('p1', PeriodeMother.base());
      service.modifierPeriode('inconnu', PeriodeMother.base(), {
        ...PeriodeMother.base(),
        debut: '2025-09-02',
      });
      expect(donneesService.donnees()?.projets[0].periodes[0].debut).toBe('2025-09-01');
    });

    it('sans effet si aucune donnée chargée', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const s = TestBed.inject(ProjetService);
      expect(() =>
        s.modifierPeriode('p1', PeriodeMother.base(), PeriodeMother.base()),
      ).not.toThrow();
    });
  });

  /** Supprime une période d'un projet par son nom ; sans effet si le projet ou la période est introuvable. */
  describe('supprimerPeriode', () => {
    it('supprime une période existante', () => {
      service.creerProjet(ProjetMother.base());
      service.ajouterPeriode('p1', PeriodeMother.base());
      service.supprimerPeriode('p1', 'Période 1');
      expect(donneesService.donnees()?.projets[0].periodes).toHaveLength(0);
    });

    it('sans effet si projet inexistant', () => {
      service.creerProjet(ProjetMother.base());
      service.ajouterPeriode('p1', PeriodeMother.base());
      service.supprimerPeriode('inconnu', 'Période 1');
      expect(donneesService.donnees()?.projets[0].periodes).toHaveLength(1);
    });

    it('sans effet si aucune donnée chargée', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const s = TestBed.inject(ProjetService);
      expect(() => s.supprimerPeriode('p1', 'Période 1')).not.toThrow();
    });
  });
});
