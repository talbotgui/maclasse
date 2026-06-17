import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CahierJournalService } from './cahier-journal.service';
import { DonneesService } from '../avecEtat/donnees.service';
import { DonneesApplication } from '../../modeles/donnees-application.modele';
import { JourneeJournal, Seance } from '../../modeles/cahier-journal.modele';
import { EmploiDuTemps } from '../../modeles/emploi-du-temps.modele';
import { Eleve } from '../../modeles/eleve.modele';

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

function creerEleve(
  id: string,
  nom: string,
  prenom: string,
  groupes: string[] = [],
  absences: Eleve['absencesRecurrentes'] = [],
): Eleve {
  return {
    id, prenom, nom, sexe: 'M', niveau: 'CM2', groupes,
    dateNaissance: '2015-01-01', dateArrivee: '2025-09-01',
    statut: 'DC', bilans: '', accueil: '', inclusion: null, contacts: [],
    absencesRecurrentes: absences, absencesPonctuelles: [], cursus: [],
    notesDroitImage: '', notesAutorisationBaignade: '', notesPPA: null, notesESS: null,
  };
}

/** Lundi 5 janvier 2026 — semaine 2 — paire. */
const DATE_LUNDI_PAIRE = '2026-01-05';
/** Lundi 12 janvier 2026 — semaine 3 — impaire. */
const DATE_LUNDI_IMPAIRE = '2026-01-12';
/** Samedi non ouvré. */
const DATE_SAMEDI = '2026-01-10';

const SEANCE_1: Seance = {
  id: 's1',
  heureDebut: '09:00',
  heureFin: '10:00',
  type: 'pedagogique',
};

const SEANCE_2: Seance = {
  id: 's2',
  heureDebut: '10:00',
  heureFin: '11:00',
  type: 'recreation',
};

describe('CahierJournalService', () => {
  let service: CahierJournalService;
  let donneesService: DonneesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CahierJournalService);
    donneesService = TestBed.inject(DonneesService);
    donneesService.charger(creerDonneesVides());
  });

  // ── initialiserJourneeVide ────────────────────────────────────────────────

  describe('initialiserJourneeVide', () => {
    it('crée une journée vide', () => {
      service.initialiserJourneeVide(DATE_LUNDI_PAIRE);
      expect(donneesService.donnees()?.cahierJournal).toHaveLength(1);
      expect(donneesService.donnees()?.cahierJournal[0].seances).toHaveLength(0);
    });

    it('sans effet si la journée existe déjà', () => {
      service.initialiserJourneeVide(DATE_LUNDI_PAIRE);
      service.initialiserJourneeVide(DATE_LUNDI_PAIRE);
      expect(donneesService.donnees()?.cahierJournal).toHaveLength(1);
    });

    it('sans effet si aucune donnée chargée', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const s = TestBed.inject(CahierJournalService);
      expect(() => s.initialiserJourneeVide(DATE_LUNDI_PAIRE)).not.toThrow();
    });

    it('supporte le UNDO', () => {
      service.initialiserJourneeVide(DATE_LUNDI_PAIRE);
      donneesService.annuler();
      expect(donneesService.donnees()?.cahierJournal).toHaveLength(0);
    });
  });

  // ── initialiserDepuisEdt ──────────────────────────────────────────────────

  describe('initialiserDepuisEdt', () => {
    const EDT_LUNDI: EmploiDuTemps = {
      id: 'edt1', nom: 'Semaine', dateDebut: null, dateFin: null, frequence: 'lesDeux',
      creneaux: [
        { id: 'c1', jour: 'lundi', heureDebut: '09:00', heureFin: '10:00', type: 'pedagogique', titre: 'Maths' },
        { id: 'c2', jour: 'lundi', heureDebut: '08:00', heureFin: '09:00', type: 'recreation' },
      ],
    };

    it('importe les créneaux du jour depuis les EDTs', () => {
      const d = creerDonneesVides();
      d.emploisDuTemps = [EDT_LUNDI];
      donneesService.charger(d);
      service.initialiserDepuisEdt(DATE_LUNDI_PAIRE);
      const journee = donneesService.donnees()?.cahierJournal[0];
      expect(journee?.seances).toHaveLength(2);
    });

    it('trie les séances par heure de début', () => {
      const d = creerDonneesVides();
      d.emploisDuTemps = [EDT_LUNDI];
      donneesService.charger(d);
      service.initialiserDepuisEdt(DATE_LUNDI_PAIRE);
      const seances = donneesService.donnees()?.cahierJournal[0].seances ?? [];
      expect(seances[0].heureDebut).toBe('08:00');
      expect(seances[1].heureDebut).toBe('09:00');
    });

    it('ne prend que les créneaux du bon jour', () => {
      const d = creerDonneesVides();
      d.emploisDuTemps = [{
        id: 'edt1', nom: 'EDT', dateDebut: null, dateFin: null, frequence: 'lesDeux',
        creneaux: [
          { id: 'c1', jour: 'lundi', heureDebut: '09:00', heureFin: '10:00', type: 'pedagogique' },
          { id: 'c2', jour: 'mardi', heureDebut: '09:00', heureFin: '10:00', type: 'pedagogique' },
        ],
      }];
      donneesService.charger(d);
      service.initialiserDepuisEdt(DATE_LUNDI_PAIRE);
      expect(donneesService.donnees()?.cahierJournal[0].seances).toHaveLength(1);
    });

    it('filtre les EDTs selon la fréquence paire', () => {
      const d = creerDonneesVides();
      d.emploisDuTemps = [
        { id: 'paire', nom: 'Paire', dateDebut: null, dateFin: null, frequence: 'paire', creneaux: [{ id: 'c1', jour: 'lundi', heureDebut: '09:00', heureFin: '10:00', type: 'pedagogique' }] },
        { id: 'impaire', nom: 'Impaire', dateDebut: null, dateFin: null, frequence: 'impaire', creneaux: [{ id: 'c2', jour: 'lundi', heureDebut: '10:00', heureFin: '11:00', type: 'pedagogique' }] },
      ];
      donneesService.charger(d);
      service.initialiserDepuisEdt(DATE_LUNDI_PAIRE); // semaine paire
      expect(donneesService.donnees()?.cahierJournal[0].seances).toHaveLength(1);
      expect(donneesService.donnees()?.cahierJournal[0].seances[0].heureDebut).toBe('09:00');
    });

    it('filtre les EDTs selon la fréquence impaire', () => {
      const d = creerDonneesVides();
      d.emploisDuTemps = [
        { id: 'paire', nom: 'Paire', dateDebut: null, dateFin: null, frequence: 'paire', creneaux: [{ id: 'c1', jour: 'lundi', heureDebut: '09:00', heureFin: '10:00', type: 'pedagogique' }] },
        { id: 'impaire', nom: 'Impaire', dateDebut: null, dateFin: null, frequence: 'impaire', creneaux: [{ id: 'c2', jour: 'lundi', heureDebut: '10:00', heureFin: '11:00', type: 'pedagogique' }] },
      ];
      donneesService.charger(d);
      service.initialiserDepuisEdt(DATE_LUNDI_IMPAIRE); // semaine impaire
      expect(donneesService.donnees()?.cahierJournal[0].seances).toHaveLength(1);
      expect(donneesService.donnees()?.cahierJournal[0].seances[0].heureDebut).toBe('10:00');
    });

    it('respecte la plage de dates de l\'EDT', () => {
      const d = creerDonneesVides();
      d.emploisDuTemps = [{
        id: 'edt1', nom: 'EDT', dateDebut: '2026-02-01', dateFin: '2026-06-30', frequence: 'lesDeux',
        creneaux: [{ id: 'c1', jour: 'lundi', heureDebut: '09:00', heureFin: '10:00', type: 'pedagogique' }],
      }];
      donneesService.charger(d);
      service.initialiserDepuisEdt(DATE_LUNDI_PAIRE); // 2026-01-05 hors plage
      expect(donneesService.donnees()?.cahierJournal[0].seances).toHaveLength(0);
    });

    it('sans effet si la journée existe déjà', () => {
      service.initialiserJourneeVide(DATE_LUNDI_PAIRE);
      service.initialiserDepuisEdt(DATE_LUNDI_PAIRE);
      expect(donneesService.donnees()?.cahierJournal).toHaveLength(1);
    });

    it('sans effet si la date tombe un samedi', () => {
      service.initialiserDepuisEdt(DATE_SAMEDI);
      expect(donneesService.donnees()?.cahierJournal).toHaveLength(0);
    });

    it('sans effet si aucune donnée chargée', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const s = TestBed.inject(CahierJournalService);
      expect(() => s.initialiserDepuisEdt(DATE_LUNDI_PAIRE)).not.toThrow();
    });

    it('génère un nouvel UUID pour chaque séance', () => {
      const d = creerDonneesVides();
      d.emploisDuTemps = [EDT_LUNDI];
      donneesService.charger(d);
      service.initialiserDepuisEdt(DATE_LUNDI_PAIRE);
      const seances = donneesService.donnees()?.cahierJournal[0].seances ?? [];
      const ids = seances.map(s => s.id);
      expect(ids[0]).not.toBe('c1');
      expect(ids[1]).not.toBe('c2');
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  // ── ajouterSeance ─────────────────────────────────────────────────────────

  describe('ajouterSeance', () => {
    it('ajoute une séance à la journée', () => {
      service.initialiserJourneeVide(DATE_LUNDI_PAIRE);
      service.ajouterSeance(DATE_LUNDI_PAIRE, SEANCE_1);
      expect(donneesService.donnees()?.cahierJournal[0].seances).toHaveLength(1);
    });

    it('sans effet si la journée n\'existe pas', () => {
      service.ajouterSeance(DATE_LUNDI_PAIRE, SEANCE_1);
      expect(donneesService.donnees()?.cahierJournal).toHaveLength(0);
    });

    it('supporte le UNDO', () => {
      service.initialiserJourneeVide(DATE_LUNDI_PAIRE);
      service.ajouterSeance(DATE_LUNDI_PAIRE, SEANCE_1);
      donneesService.annuler();
      expect(donneesService.donnees()?.cahierJournal[0].seances).toHaveLength(0);
    });
  });

  // ── modifierSeance ────────────────────────────────────────────────────────

  describe('modifierSeance', () => {
    it('met à jour une séance existante', () => {
      service.initialiserJourneeVide(DATE_LUNDI_PAIRE);
      service.ajouterSeance(DATE_LUNDI_PAIRE, SEANCE_1);
      service.modifierSeance(DATE_LUNDI_PAIRE, { ...SEANCE_1, heureFin: '11:00' });
      expect(donneesService.donnees()?.cahierJournal[0].seances[0].heureFin).toBe('11:00');
    });

    it('sans effet si la journée n\'existe pas', () => {
      expect(() => service.modifierSeance(DATE_LUNDI_PAIRE, SEANCE_1)).not.toThrow();
    });

    it('supporte le UNDO', () => {
      service.initialiserJourneeVide(DATE_LUNDI_PAIRE);
      service.ajouterSeance(DATE_LUNDI_PAIRE, SEANCE_1);
      service.modifierSeance(DATE_LUNDI_PAIRE, { ...SEANCE_1, heureFin: '11:00' });
      donneesService.annuler();
      expect(donneesService.donnees()?.cahierJournal[0].seances[0].heureFin).toBe('10:00');
    });
  });

  // ── supprimerSeance ───────────────────────────────────────────────────────

  describe('supprimerSeance', () => {
    it('supprime une séance existante', () => {
      service.initialiserJourneeVide(DATE_LUNDI_PAIRE);
      service.ajouterSeance(DATE_LUNDI_PAIRE, SEANCE_1);
      service.supprimerSeance(DATE_LUNDI_PAIRE, 's1');
      expect(donneesService.donnees()?.cahierJournal[0].seances).toHaveLength(0);
    });

    it('sans effet si la journée n\'existe pas', () => {
      expect(() => service.supprimerSeance(DATE_LUNDI_PAIRE, 's1')).not.toThrow();
    });
  });

  // ── deplacerSeance ────────────────────────────────────────────────────────

  describe('deplacerSeance', () => {
    it('inverse l\'ordre de deux séances', () => {
      service.initialiserJourneeVide(DATE_LUNDI_PAIRE);
      service.ajouterSeance(DATE_LUNDI_PAIRE, SEANCE_1);
      service.ajouterSeance(DATE_LUNDI_PAIRE, SEANCE_2);
      service.deplacerSeance(DATE_LUNDI_PAIRE, 0, 1);
      const seances = donneesService.donnees()?.cahierJournal[0].seances ?? [];
      expect(seances[0].id).toBe('s2');
      expect(seances[1].id).toBe('s1');
    });

    it('sans effet si la journée n\'existe pas', () => {
      expect(() => service.deplacerSeance(DATE_LUNDI_PAIRE, 0, 1)).not.toThrow();
    });

    it('sans effet si index source hors limites', () => {
      service.initialiserJourneeVide(DATE_LUNDI_PAIRE);
      service.ajouterSeance(DATE_LUNDI_PAIRE, SEANCE_1);
      expect(() => service.deplacerSeance(DATE_LUNDI_PAIRE, 5, 0)).not.toThrow();
      expect(donneesService.donnees()?.cahierJournal[0].seances[0].id).toBe('s1');
    });

    it('sans effet si index cible hors limites', () => {
      service.initialiserJourneeVide(DATE_LUNDI_PAIRE);
      service.ajouterSeance(DATE_LUNDI_PAIRE, SEANCE_1);
      expect(() => service.deplacerSeance(DATE_LUNDI_PAIRE, 0, 5)).not.toThrow();
      expect(donneesService.donnees()?.cahierJournal[0].seances[0].id).toBe('s1');
    });

    it('supporte le UNDO', () => {
      service.initialiserJourneeVide(DATE_LUNDI_PAIRE);
      service.ajouterSeance(DATE_LUNDI_PAIRE, SEANCE_1);
      service.ajouterSeance(DATE_LUNDI_PAIRE, SEANCE_2);
      service.deplacerSeance(DATE_LUNDI_PAIRE, 0, 1);
      donneesService.annuler();
      expect(donneesService.donnees()?.cahierJournal[0].seances[0].id).toBe('s1');
    });
  });

  // ── supprimerJournee ──────────────────────────────────────────────────────

  describe('supprimerJournee', () => {
    it('supprime une journée existante', () => {
      service.initialiserJourneeVide(DATE_LUNDI_PAIRE);
      service.supprimerJournee(DATE_LUNDI_PAIRE);
      expect(donneesService.donnees()?.cahierJournal).toHaveLength(0);
    });

    it('sans effet si la date n\'existe pas', () => {
      service.supprimerJournee(DATE_LUNDI_PAIRE);
      expect(donneesService.donnees()?.cahierJournal).toHaveLength(0);
    });

    it('sans effet si aucune donnée chargée', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const s = TestBed.inject(CahierJournalService);
      expect(() => s.supprimerJournee(DATE_LUNDI_PAIRE)).not.toThrow();
    });

    it('supporte le UNDO', () => {
      service.initialiserJourneeVide(DATE_LUNDI_PAIRE);
      service.supprimerJournee(DATE_LUNDI_PAIRE);
      donneesService.annuler();
      expect(donneesService.donnees()?.cahierJournal).toHaveLength(1);
    });
  });

  // ── dupliquerSeance ───────────────────────────────────────────────────────

  describe('dupliquerSeance', () => {
    it('duplique dans une journée existante', () => {
      service.initialiserJourneeVide(DATE_LUNDI_PAIRE);
      service.ajouterSeance(DATE_LUNDI_PAIRE, SEANCE_1);
      service.initialiserJourneeVide(DATE_LUNDI_IMPAIRE);
      service.dupliquerSeance('s1', DATE_LUNDI_PAIRE, DATE_LUNDI_IMPAIRE);
      expect(donneesService.donnees()?.cahierJournal[1].seances).toHaveLength(1);
    });

    it('crée la journée cible si elle n\'existe pas', () => {
      service.initialiserJourneeVide(DATE_LUNDI_PAIRE);
      service.ajouterSeance(DATE_LUNDI_PAIRE, SEANCE_1);
      service.dupliquerSeance('s1', DATE_LUNDI_PAIRE, DATE_LUNDI_IMPAIRE);
      expect(donneesService.donnees()?.cahierJournal).toHaveLength(2);
      expect(donneesService.donnees()?.cahierJournal[1].date).toBe(DATE_LUNDI_IMPAIRE);
    });

    it('génère un nouvel UUID pour la séance dupliquée', () => {
      service.initialiserJourneeVide(DATE_LUNDI_PAIRE);
      service.ajouterSeance(DATE_LUNDI_PAIRE, SEANCE_1);
      service.dupliquerSeance('s1', DATE_LUNDI_PAIRE, DATE_LUNDI_IMPAIRE);
      const nouvelleSeanceId = donneesService.donnees()?.cahierJournal[1].seances[0].id;
      expect(nouvelleSeanceId).not.toBe('s1');
    });

    it('sans effet si la journée source n\'existe pas', () => {
      service.dupliquerSeance('s1', DATE_LUNDI_PAIRE, DATE_LUNDI_IMPAIRE);
      expect(donneesService.donnees()?.cahierJournal).toHaveLength(0);
    });

    it('sans effet si la séance source n\'existe pas', () => {
      service.initialiserJourneeVide(DATE_LUNDI_PAIRE);
      service.dupliquerSeance('inconnu', DATE_LUNDI_PAIRE, DATE_LUNDI_IMPAIRE);
      expect(donneesService.donnees()?.cahierJournal).toHaveLength(1);
    });

    it('sans effet si aucune donnée chargée', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const s = TestBed.inject(CahierJournalService);
      expect(() => s.dupliquerSeance('s1', DATE_LUNDI_PAIRE, DATE_LUNDI_IMPAIRE)).not.toThrow();
    });
  });

  // ── dupliquerJournee ──────────────────────────────────────────────────────

  describe('dupliquerJournee', () => {
    it('duplique vers une nouvelle journée', () => {
      service.initialiserJourneeVide(DATE_LUNDI_PAIRE);
      service.ajouterSeance(DATE_LUNDI_PAIRE, SEANCE_1);
      service.dupliquerJournee(DATE_LUNDI_PAIRE, DATE_LUNDI_IMPAIRE);
      const journeeCible = donneesService.donnees()?.cahierJournal.find(j => j.date === DATE_LUNDI_IMPAIRE);
      expect(journeeCible?.seances).toHaveLength(1);
    });

    it('remplace une journée existante à la date cible', () => {
      service.initialiserJourneeVide(DATE_LUNDI_PAIRE);
      service.ajouterSeance(DATE_LUNDI_PAIRE, SEANCE_1);
      service.ajouterSeance(DATE_LUNDI_PAIRE, SEANCE_2);
      service.initialiserJourneeVide(DATE_LUNDI_IMPAIRE); // journée cible vide
      service.dupliquerJournee(DATE_LUNDI_PAIRE, DATE_LUNDI_IMPAIRE);
      expect(donneesService.donnees()?.cahierJournal.find(j => j.date === DATE_LUNDI_IMPAIRE)?.seances).toHaveLength(2);
    });

    it('génère de nouveaux UUIDs pour chaque séance', () => {
      service.initialiserJourneeVide(DATE_LUNDI_PAIRE);
      service.ajouterSeance(DATE_LUNDI_PAIRE, SEANCE_1);
      service.dupliquerJournee(DATE_LUNDI_PAIRE, DATE_LUNDI_IMPAIRE);
      const seanceId = donneesService.donnees()?.cahierJournal.find(j => j.date === DATE_LUNDI_IMPAIRE)?.seances[0].id;
      expect(seanceId).not.toBe('s1');
    });

    it('sans effet si la journée source n\'existe pas', () => {
      service.dupliquerJournee(DATE_LUNDI_PAIRE, DATE_LUNDI_IMPAIRE);
      expect(donneesService.donnees()?.cahierJournal).toHaveLength(0);
    });

    it('sans effet si aucune donnée chargée', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const s = TestBed.inject(CahierJournalService);
      expect(() => s.dupliquerJournee(DATE_LUNDI_PAIRE, DATE_LUNDI_IMPAIRE)).not.toThrow();
    });
  });

  // ── calculerConflitsAbsences ──────────────────────────────────────────────

  describe('calculerConflitsAbsences', () => {
    it('retourne tableau vide si aucune donnée chargée', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const s = TestBed.inject(CahierJournalService);
      expect(s.calculerConflitsAbsences(DATE_LUNDI_PAIRE, 's1')).toEqual([]);
    });

    it('retourne tableau vide si la journée n\'existe pas', () => {
      expect(service.calculerConflitsAbsences(DATE_LUNDI_PAIRE, 's1')).toEqual([]);
    });

    it('retourne tableau vide si la séance n\'existe pas', () => {
      service.initialiserJourneeVide(DATE_LUNDI_PAIRE);
      expect(service.calculerConflitsAbsences(DATE_LUNDI_PAIRE, 'inconnu')).toEqual([]);
    });

    it('retourne tableau vide pour un samedi', () => {
      const d = creerDonneesVides();
      d.cahierJournal = [{ id: 'j-samedi', date: DATE_SAMEDI, seances: [SEANCE_1] }];
      donneesService.charger(d);
      expect(service.calculerConflitsAbsences(DATE_SAMEDI, 's1')).toEqual([]);
    });

    it('détecte un conflit pour un élève de la classe entière', () => {
      const d = creerDonneesVides();
      d.classe.eleves = [
        creerEleve('e1', 'MARTIN', 'Paul', [], [
          { id: 'a1', libelle: 'Orthophonie', jour: 'lundi', heureDebut: '09:30', heureFin: '10:30', paritesSemaine: 'lesDeux' },
        ]),
      ];
      d.cahierJournal = [{ id: 'j1', date: DATE_LUNDI_PAIRE, seances: [SEANCE_1] }];
      donneesService.charger(d);
      const conflits = service.calculerConflitsAbsences(DATE_LUNDI_PAIRE, 's1');
      expect(conflits).toHaveLength(1);
      expect(conflits[0]).toBe('MARTIN Paul — Orthophonie');
    });

    it("ne détecte pas de conflit si l'absence est un autre jour", () => {
      const d = creerDonneesVides();
      d.classe.eleves = [
        creerEleve('e1', 'MARTIN', 'Paul', [], [
          { id: 'a1', libelle: 'Orthophonie', jour: 'mardi', heureDebut: '09:00', heureFin: '10:00', paritesSemaine: 'lesDeux' },
        ]),
      ];
      d.cahierJournal = [{ id: 'j1', date: DATE_LUNDI_PAIRE, seances: [SEANCE_1] }];
      donneesService.charger(d);
      expect(service.calculerConflitsAbsences(DATE_LUNDI_PAIRE, 's1')).toEqual([]);
    });

    it('filtre les élèves par groupe', () => {
      const d = creerDonneesVides();
      d.classe.eleves = [
        creerEleve('e1', 'MARTIN', 'Paul', ['GA'], [
          { id: 'a1', libelle: 'Ortho', jour: 'lundi', heureDebut: '09:00', heureFin: '10:00', paritesSemaine: 'lesDeux' },
        ]),
        creerEleve('e2', 'DUPONT', 'Marie', ['GB'], [
          { id: 'a2', libelle: 'RASED', jour: 'lundi', heureDebut: '09:00', heureFin: '10:00', paritesSemaine: 'lesDeux' },
        ]),
      ];
      const seanceGroupe: Seance = {
        id: 'sg', heureDebut: '09:00', heureFin: '10:00', type: 'pedagogique',
        elevesConcernes: { type: 'groupes', groupes: ['GA'], elevesIds: [] },
      };
      d.cahierJournal = [{ id: 'j1', date: DATE_LUNDI_PAIRE, seances: [seanceGroupe] }];
      donneesService.charger(d);
      const conflits = service.calculerConflitsAbsences(DATE_LUNDI_PAIRE, 'sg');
      expect(conflits).toHaveLength(1);
      expect(conflits[0]).toContain('MARTIN');
    });

    it('filtre les élèves par ID explicite', () => {
      const d = creerDonneesVides();
      d.classe.eleves = [
        creerEleve('e1', 'MARTIN', 'Paul', [], [
          { id: 'a1', libelle: 'Ortho', jour: 'lundi', heureDebut: '09:00', heureFin: '10:00', paritesSemaine: 'lesDeux' },
        ]),
        creerEleve('e2', 'DUPONT', 'Marie', [], [
          { id: 'a2', libelle: 'RASED', jour: 'lundi', heureDebut: '09:00', heureFin: '10:00', paritesSemaine: 'lesDeux' },
        ]),
      ];
      const seanceEleves: Seance = {
        id: 'se', heureDebut: '09:00', heureFin: '10:00', type: 'pedagogique',
        elevesConcernes: { type: 'eleves', groupes: [], elevesIds: ['e1'] },
      };
      d.cahierJournal = [{ id: 'j1', date: DATE_LUNDI_PAIRE, seances: [seanceEleves] }];
      donneesService.charger(d);
      const conflits = service.calculerConflitsAbsences(DATE_LUNDI_PAIRE, 'se');
      expect(conflits).toHaveLength(1);
      expect(conflits[0]).toContain('MARTIN');
    });
  });
});
