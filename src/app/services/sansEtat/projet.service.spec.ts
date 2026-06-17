import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ProjetService } from './projet.service';
import { DonneesService } from '../avecEtat/donnees.service';
import { DonneesApplication } from '../../modeles/donnees-application.modele';
import { Projet, ProjetPeriode } from '../../modeles/projet.modele';

function creerDonneesVides(): DonneesApplication {
  return {
    version: '1.0',
    configuration: { delaiSauvegardeAutoMinutes: 2 },
    enseignant: { prenom: 'Test', nom: 'ENS', annee: '2025-2026' },
    classe: { niveau: 'CM2', annee: 'CM2', eleves: [] },
    referentiels: {
      competences: [], periodes: [], statutsAcquisition: [], statutsEleve: [],
      typesContact: [], groupes: [], joursFeries: [], raisonsAbsence: [],
      frequencesAbsence: [],
      configEmploiDuTemps: { joursOuvres: ['lundi'], heureDebutJournee: '08:30', heureFinJournee: '16:30' },
    },
    emploisDuTemps: [], projets: [], cahierJournal: [], ppi: [], bulletins: [],
  };
}

const PROJET_1: Projet = {
  id: 'p1',
  nom: 'Compostage',
  description: 'Projet sur le compostage',
  elevesIds: [],
  periodes: [],
};

const PERIODE_1: ProjetPeriode = {
  periodeNom: 'Période 1',
  debut: '2025-09-01',
  fin: '2025-10-18',
  description: 'Phase 1',
  competencesIds: [],
};

describe('ProjetService', () => {
  let service: ProjetService;
  let donneesService: DonneesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjetService);
    donneesService = TestBed.inject(DonneesService);
    donneesService.charger(creerDonneesVides());
  });

  // ── creerProjet ───────────────────────────────────────────────────────────

  describe('creerProjet', () => {
    it('ajoute un projet', () => {
      service.creerProjet(PROJET_1);
      expect(donneesService.donnees()?.projets).toHaveLength(1);
    });

    it('supporte le UNDO', () => {
      service.creerProjet(PROJET_1);
      donneesService.annuler();
      expect(donneesService.donnees()?.projets).toHaveLength(0);
    });
  });

  // ── modifierProjet ────────────────────────────────────────────────────────

  describe('modifierProjet', () => {
    it('met à jour un projet existant', () => {
      service.creerProjet(PROJET_1);
      service.modifierProjet({ ...PROJET_1, nom: 'Jardinage' });
      expect(donneesService.donnees()?.projets[0].nom).toBe('Jardinage');
    });

    it('sans effet si id inexistant', () => {
      service.creerProjet(PROJET_1);
      service.modifierProjet({ ...PROJET_1, id: 'inconnu', nom: 'X' });
      expect(donneesService.donnees()?.projets[0].nom).toBe('Compostage');
    });

    it('sans effet si aucune donnée chargée', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const s = TestBed.inject(ProjetService);
      expect(() => s.modifierProjet(PROJET_1)).not.toThrow();
    });
  });

  // ── supprimerProjet ───────────────────────────────────────────────────────

  describe('supprimerProjet', () => {
    it('supprime un projet existant', () => {
      service.creerProjet(PROJET_1);
      service.supprimerProjet('p1');
      expect(donneesService.donnees()?.projets).toHaveLength(0);
    });

    it('sans effet si id inexistant', () => {
      service.creerProjet(PROJET_1);
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

  // ── obtenirProjet ─────────────────────────────────────────────────────────

  describe('obtenirProjet', () => {
    it('retourne le projet si l\'id existe', () => {
      service.creerProjet(PROJET_1);
      expect(service.obtenirProjet('p1')?.nom).toBe('Compostage');
    });

    it('retourne undefined si l\'id n\'existe pas', () => {
      expect(service.obtenirProjet('inconnu')).toBeUndefined();
    });
  });

  // ── rechercherProjets ─────────────────────────────────────────────────────

  describe('rechercherProjets', () => {
    beforeEach(() => {
      service.creerProjet(PROJET_1);
      service.creerProjet({ id: 'p2', nom: 'Élevage', description: 'Élever des escargots', elevesIds: [], periodes: [] });
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

  // ── gestion des périodes ──────────────────────────────────────────────────

  describe('ajouterPeriode', () => {
    it('ajoute une période au projet', () => {
      service.creerProjet(PROJET_1);
      service.ajouterPeriode('p1', PERIODE_1);
      expect(donneesService.donnees()?.projets[0].periodes).toHaveLength(1);
    });

    it('sans effet si projet inexistant', () => {
      service.creerProjet(PROJET_1);
      service.ajouterPeriode('inconnu', PERIODE_1);
      expect(donneesService.donnees()?.projets[0].periodes).toHaveLength(0);
    });

    it('sans effet si aucune donnée chargée', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const s = TestBed.inject(ProjetService);
      expect(() => s.ajouterPeriode('p1', PERIODE_1)).not.toThrow();
    });

    it('supporte le UNDO', () => {
      service.creerProjet(PROJET_1);
      service.ajouterPeriode('p1', PERIODE_1);
      donneesService.annuler();
      expect(donneesService.donnees()?.projets[0].periodes).toHaveLength(0);
    });
  });

  describe('modifierPeriode', () => {
    it('modifie une période existante', () => {
      service.creerProjet(PROJET_1);
      service.ajouterPeriode('p1', PERIODE_1);
      service.modifierPeriode('p1', PERIODE_1, { ...PERIODE_1, debut: '2025-09-02' });
      expect(donneesService.donnees()?.projets[0].periodes[0].debut).toBe('2025-09-02');
    });

    it('sans effet si projet inexistant', () => {
      service.creerProjet(PROJET_1);
      service.ajouterPeriode('p1', PERIODE_1);
      service.modifierPeriode('inconnu', PERIODE_1, { ...PERIODE_1, debut: '2025-09-02' });
      expect(donneesService.donnees()?.projets[0].periodes[0].debut).toBe('2025-09-01');
    });

    it('sans effet si aucune donnée chargée', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const s = TestBed.inject(ProjetService);
      expect(() => s.modifierPeriode('p1', PERIODE_1, PERIODE_1)).not.toThrow();
    });
  });

  describe('supprimerPeriode', () => {
    it('supprime une période existante', () => {
      service.creerProjet(PROJET_1);
      service.ajouterPeriode('p1', PERIODE_1);
      service.supprimerPeriode('p1', 'Période 1');
      expect(donneesService.donnees()?.projets[0].periodes).toHaveLength(0);
    });

    it('sans effet si projet inexistant', () => {
      service.creerProjet(PROJET_1);
      service.ajouterPeriode('p1', PERIODE_1);
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
