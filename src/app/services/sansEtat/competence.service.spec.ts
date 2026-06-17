import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CompetenceService } from './competence.service';
import { DonneesService } from '../avecEtat/donnees.service';
import { DonneesApplication } from '../../modeles/donnees-application.modele';
import { Competence } from '../../modeles/referentiels.modele';

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

/** Arbre de compétences pour les tests. */
const ARBRE_COMPETENCES: Competence[] = [
  {
    id: 'FR',
    libelle: 'Français',
    enfants: [
      {
        id: 'FR-LECT',
        libelle: 'Lecture',
        enfants: [
          { id: 'FR-LECT-1', libelle: 'Comprendre un texte lu' },
          { id: 'FR-LECT-2', libelle: 'Lire à voix haute' },
        ],
      },
      { id: 'FR-ECRIT', libelle: 'Écriture', enfants: [] },
    ],
  },
  {
    id: 'MATH',
    libelle: 'Mathématiques',
    enfants: [
      { id: 'MATH-NB', libelle: 'Nombres et calculs' },
    ],
  },
];

describe('CompetenceService', () => {
  let service: CompetenceService;
  let donneesService: DonneesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompetenceService);
    donneesService = TestBed.inject(DonneesService);
    const d = creerDonneesVides();
    d.referentiels.competences = ARBRE_COMPETENCES;
    donneesService.charger(d);
  });

  // ── obtenirDomaines ───────────────────────────────────────────────────────

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

  // ── obtenirDomaineParId ───────────────────────────────────────────────────

  describe('obtenirDomaineParId', () => {
    it('retourne le domaine correspondant', () => {
      expect(service.obtenirDomaineParId('FR')?.libelle).toBe('Français');
    });

    it('retourne undefined pour un id inexistant', () => {
      expect(service.obtenirDomaineParId('INCONNU')).toBeUndefined();
    });
  });

  // ── rechercherCompetences ─────────────────────────────────────────────────

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

  // ── obtenirChemin ─────────────────────────────────────────────────────────

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

  // ── resoudreLibelle ───────────────────────────────────────────────────────

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
