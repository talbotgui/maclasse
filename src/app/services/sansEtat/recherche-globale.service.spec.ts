import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { RechercheGlobaleService } from './recherche-globale.service';
import { DonneesService } from '../avecEtat/donnees.service';
import { DonneesApplication } from '../../modeles/donnees-application.modele';
import { Eleve } from '../../modeles/eleve.modele';
import { Projet } from '../../modeles/projet.modele';

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

function creerEleve(id: string, nom: string, prenom: string): Eleve {
  return {
    id, prenom, nom, sexe: 'M', niveau: 'CM2', groupes: [],
    dateNaissance: '2015-01-01', dateArrivee: '2025-09-01',
    statut: 'DC', bilans: '', accueil: '', inclusion: null, contacts: [],
    absencesRecurrentes: [], absencesPonctuelles: [], cursus: [],
    notesDroitImage: '', notesAutorisationBaignade: '', notesPPA: null, notesESS: null,
  };
}

function creerProjet(id: string, nom: string): Projet {
  return { id, nom, description: '', elevesIds: [], periodes: [] };
}

describe('RechercheGlobaleService', () => {
  let service: RechercheGlobaleService;
  let donneesService: DonneesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RechercheGlobaleService);
    donneesService = TestBed.inject(DonneesService);
    const d = creerDonneesVides();
    d.classe.eleves = [
      creerEleve('e1', 'MARTIN', 'Paul'),
      creerEleve('e2', 'DUPONT', 'Marie'),
      creerEleve('e3', 'ÉLIE', 'Élodie'),
    ];
    d.projets = [
      creerProjet('p1', 'Compostage'),
      creerProjet('p2', 'Élevage d\'escargots'),
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
      const d = creerDonneesVides();
      d.classe.eleves = [creerEleve('e1', 'MAR', 'Test')];
      d.projets = [creerProjet('p1', 'MAR')];
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
