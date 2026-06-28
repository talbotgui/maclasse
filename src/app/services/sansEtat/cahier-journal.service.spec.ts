import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CahierJournalService } from './cahier-journal.service';
import { DonneesService } from '../avecEtat/donnees.service';
import { Seance } from '../../modeles/cahier-journal.modele';
import { EmploiDuTemps } from '../../modeles/emploi-du-temps.modele';
import { DonneesMother } from '../../tests/donnees.mother';
import { EleveMother } from '../../tests/eleve.mother';
import { DATES_TEST, SeanceMother } from '../../tests/cahier-journal.mother';
import { DateUtils } from '../../utilitaires/date.utils';

describe('CahierJournalService', () => {
  let service: CahierJournalService;
  let donneesService: DonneesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CahierJournalService);
    donneesService = TestBed.inject(DonneesService);
    donneesService.charger(DonneesMother.base());
  });

  /** Crée une journée sans séances si elle n'existe pas ; sans effet si la date est déjà présente. */
  describe('initialiserJourneeVide', () => {
    it('crée une journée vide', () => {
      service.initialiserJourneeVide(DATES_TEST.lundiPaire);
      expect(donneesService.donnees()?.cahierJournal).toHaveLength(1);
      expect(donneesService.donnees()?.cahierJournal[0].seances).toHaveLength(0);
    });

    it('sans effet si la journée existe déjà', () => {
      service.initialiserJourneeVide(DATES_TEST.lundiPaire);
      service.initialiserJourneeVide(DATES_TEST.lundiPaire);
      expect(donneesService.donnees()?.cahierJournal).toHaveLength(1);
    });

    it('sans effet si aucune donnée chargée', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const s = TestBed.inject(CahierJournalService);
      expect(() => s.initialiserJourneeVide(DATES_TEST.lundiPaire)).not.toThrow();
    });

    it('supporte le UNDO', () => {
      service.initialiserJourneeVide(DATES_TEST.lundiPaire);
      donneesService.annuler();
      expect(donneesService.donnees()?.cahierJournal).toHaveLength(0);
    });
  });

  /** Importe les créneaux de l'EDT applicable (fréquence + plage de dates) et les trie par heure. */
  describe('initialiserDepuisEdt', () => {
    const EDT_LUNDI: EmploiDuTemps = {
      id: 'edt1', nom: 'Semaine', dateDebut: null, dateFin: null, frequence: 'lesDeux',
      creneaux: [
        { id: 'c1', jour: 'lundi', heureDebut: '09:00', heureFin: '10:00', type: 'pedagogique', titre: 'Maths' },
        { id: 'c2', jour: 'lundi', heureDebut: '08:00', heureFin: '09:00', type: 'recreation' },
      ],
    };

    it('importe les créneaux du jour depuis les EDTs', () => {
      const d = DonneesMother.base();
      d.emploisDuTemps = [EDT_LUNDI];
      donneesService.charger(d);
      service.initialiserDepuisEdt(DATES_TEST.lundiPaire);
      const journee = donneesService.donnees()?.cahierJournal[0];
      expect(journee?.seances).toHaveLength(2);
    });

    it('trie les séances par heure de début', () => {
      const d = DonneesMother.base();
      d.emploisDuTemps = [EDT_LUNDI];
      donneesService.charger(d);
      service.initialiserDepuisEdt(DATES_TEST.lundiPaire);
      const seances = donneesService.donnees()?.cahierJournal[0].seances ?? [];
      expect(seances[0].heureDebut).toBe('08:00');
      expect(seances[1].heureDebut).toBe('09:00');
    });

    it('ne prend que les créneaux du bon jour', () => {
      const d = DonneesMother.base();
      d.emploisDuTemps = [{
        id: 'edt1', nom: 'EDT', dateDebut: null, dateFin: null, frequence: 'lesDeux',
        creneaux: [
          { id: 'c1', jour: 'lundi', heureDebut: '09:00', heureFin: '10:00', type: 'pedagogique' },
          { id: 'c2', jour: 'mardi', heureDebut: '09:00', heureFin: '10:00', type: 'pedagogique' },
        ],
      }];
      donneesService.charger(d);
      service.initialiserDepuisEdt(DATES_TEST.lundiPaire);
      expect(donneesService.donnees()?.cahierJournal[0].seances).toHaveLength(1);
    });

    it('filtre les EDTs selon la fréquence paire', () => {
      const d = DonneesMother.base();
      d.emploisDuTemps = [
        { id: 'paire', nom: 'Paire', dateDebut: null, dateFin: null, frequence: 'paire', creneaux: [{ id: 'c1', jour: 'lundi', heureDebut: '09:00', heureFin: '10:00', type: 'pedagogique' }] },
        { id: 'impaire', nom: 'Impaire', dateDebut: null, dateFin: null, frequence: 'impaire', creneaux: [{ id: 'c2', jour: 'lundi', heureDebut: '10:00', heureFin: '11:00', type: 'pedagogique' }] },
      ];
      donneesService.charger(d);
      service.initialiserDepuisEdt(DATES_TEST.lundiPaire); // semaine paire
      expect(donneesService.donnees()?.cahierJournal[0].seances).toHaveLength(1);
      expect(donneesService.donnees()?.cahierJournal[0].seances[0].heureDebut).toBe('09:00');
    });

    it('filtre les EDTs selon la fréquence impaire', () => {
      const d = DonneesMother.base();
      d.emploisDuTemps = [
        { id: 'paire', nom: 'Paire', dateDebut: null, dateFin: null, frequence: 'paire', creneaux: [{ id: 'c1', jour: 'lundi', heureDebut: '09:00', heureFin: '10:00', type: 'pedagogique' }] },
        { id: 'impaire', nom: 'Impaire', dateDebut: null, dateFin: null, frequence: 'impaire', creneaux: [{ id: 'c2', jour: 'lundi', heureDebut: '10:00', heureFin: '11:00', type: 'pedagogique' }] },
      ];
      donneesService.charger(d);
      service.initialiserDepuisEdt(DATES_TEST.lundiImpaire); // semaine impaire
      expect(donneesService.donnees()?.cahierJournal[0].seances).toHaveLength(1);
      expect(donneesService.donnees()?.cahierJournal[0].seances[0].heureDebut).toBe('10:00');
    });

    it('respecte la plage de dates de l\'EDT', () => {
      const d = DonneesMother.base();
      d.emploisDuTemps = [{
        id: 'edt1', nom: 'EDT', dateDebut: '2026-02-01', dateFin: '2026-06-30', frequence: 'lesDeux',
        creneaux: [{ id: 'c1', jour: 'lundi', heureDebut: '09:00', heureFin: '10:00', type: 'pedagogique' }],
      }];
      donneesService.charger(d);
      service.initialiserDepuisEdt(DATES_TEST.lundiPaire); // 2026-01-05 hors plage
      expect(donneesService.donnees()?.cahierJournal[0].seances).toHaveLength(0);
    });

    it('sans effet si la journée existe déjà', () => {
      service.initialiserJourneeVide(DATES_TEST.lundiPaire);
      service.initialiserDepuisEdt(DATES_TEST.lundiPaire);
      expect(donneesService.donnees()?.cahierJournal).toHaveLength(1);
    });

    it('sans effet si la date tombe un samedi', () => {
      service.initialiserDepuisEdt(DATES_TEST.samedi);
      expect(donneesService.donnees()?.cahierJournal).toHaveLength(0);
    });

    it('sans effet si aucune donnée chargée', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const s = TestBed.inject(CahierJournalService);
      expect(() => s.initialiserDepuisEdt(DATES_TEST.lundiPaire)).not.toThrow();
    });

    it('génère un nouvel UUID pour chaque séance', () => {
      const d = DonneesMother.base();
      d.emploisDuTemps = [EDT_LUNDI];
      donneesService.charger(d);
      service.initialiserDepuisEdt(DATES_TEST.lundiPaire);
      const seances = donneesService.donnees()?.cahierJournal[0].seances ?? [];
      const ids = seances.map(s => s.id);
      expect(ids[0]).not.toBe('c1');
      expect(ids[1]).not.toBe('c2');
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  /** Ajoute une séance en fin de liste dans la journée ciblée ; sans effet si journée absente. */
  describe('ajouterSeance', () => {
    it('ajoute une séance à la journée', () => {
      service.initialiserJourneeVide(DATES_TEST.lundiPaire);
      service.ajouterSeance(DATES_TEST.lundiPaire, SeanceMother.pedagogique());
      expect(donneesService.donnees()?.cahierJournal[0].seances).toHaveLength(1);
    });

    it('sans effet si la journée n\'existe pas', () => {
      service.ajouterSeance(DATES_TEST.lundiPaire, SeanceMother.pedagogique());
      expect(donneesService.donnees()?.cahierJournal).toHaveLength(0);
    });

    it('supporte le UNDO', () => {
      service.initialiserJourneeVide(DATES_TEST.lundiPaire);
      service.ajouterSeance(DATES_TEST.lundiPaire, SeanceMother.pedagogique());
      donneesService.annuler();
      expect(donneesService.donnees()?.cahierJournal[0].seances).toHaveLength(0);
    });
  });

  /** Remplace la séance par son id dans la journée ciblée ; sans effet si journée ou séance absente. */
  describe('modifierSeance', () => {
    it('met à jour une séance existante', () => {
      service.initialiserJourneeVide(DATES_TEST.lundiPaire);
      service.ajouterSeance(DATES_TEST.lundiPaire, SeanceMother.pedagogique());
      service.modifierSeance(DATES_TEST.lundiPaire, { ...SeanceMother.pedagogique(), heureFin: '11:00' });
      expect(donneesService.donnees()?.cahierJournal[0].seances[0].heureFin).toBe('11:00');
    });

    it('sans effet si la journée n\'existe pas', () => {
      expect(() => service.modifierSeance(DATES_TEST.lundiPaire, SeanceMother.pedagogique())).not.toThrow();
    });

    it('supporte le UNDO', () => {
      service.initialiserJourneeVide(DATES_TEST.lundiPaire);
      service.ajouterSeance(DATES_TEST.lundiPaire, SeanceMother.pedagogique());
      service.modifierSeance(DATES_TEST.lundiPaire, { ...SeanceMother.pedagogique(), heureFin: '11:00' });
      donneesService.annuler();
      expect(donneesService.donnees()?.cahierJournal[0].seances[0].heureFin).toBe('10:00');
    });
  });

  /** Retire la séance de la journée ciblée ; sans effet si journée ou séance absente. */
  describe('supprimerSeance', () => {
    it('supprime une séance existante', () => {
      service.initialiserJourneeVide(DATES_TEST.lundiPaire);
      service.ajouterSeance(DATES_TEST.lundiPaire, SeanceMother.pedagogique());
      service.supprimerSeance(DATES_TEST.lundiPaire, 's1');
      expect(donneesService.donnees()?.cahierJournal[0].seances).toHaveLength(0);
    });

    it('sans effet si la journée n\'existe pas', () => {
      expect(() => service.supprimerSeance(DATES_TEST.lundiPaire, 's1')).not.toThrow();
    });
  });

  /** Échange heureDebut/heureFin entre deux séances ; sans effet si ID introuvable ou journée absente. */
  describe('echangerHeuresSeances', () => {
    it('échange les heures sans modifier l\'ordre du tableau', () => {
      service.initialiserJourneeVide(DATES_TEST.lundiPaire);
      service.ajouterSeance(DATES_TEST.lundiPaire, SeanceMother.pedagogique());
      service.ajouterSeance(DATES_TEST.lundiPaire, SeanceMother.recreation());
      service.echangerHeuresSeances(DATES_TEST.lundiPaire, 's1', 's2');
      const seances = donneesService.donnees()?.cahierJournal[0].seances ?? [];
      expect(seances[0].id).toBe('s1');
      expect(seances[0].heureDebut).toBe('10:00');
      expect(seances[0].heureFin).toBe('11:00');
      expect(seances[1].id).toBe('s2');
      expect(seances[1].heureDebut).toBe('09:00');
      expect(seances[1].heureFin).toBe('10:00');
    });

    it('sans effet si la journée n\'existe pas', () => {
      expect(() => service.echangerHeuresSeances(DATES_TEST.lundiPaire, 's1', 's2')).not.toThrow();
    });

    it('sans effet si l\'ID source est introuvable', () => {
      service.initialiserJourneeVide(DATES_TEST.lundiPaire);
      service.ajouterSeance(DATES_TEST.lundiPaire, SeanceMother.pedagogique());
      expect(() => service.echangerHeuresSeances(DATES_TEST.lundiPaire, 'inconnu', 's1')).not.toThrow();
      expect(donneesService.donnees()?.cahierJournal[0].seances[0].heureDebut).toBe('09:00');
    });

    it('sans effet si l\'ID cible est introuvable', () => {
      service.initialiserJourneeVide(DATES_TEST.lundiPaire);
      service.ajouterSeance(DATES_TEST.lundiPaire, SeanceMother.pedagogique());
      expect(() => service.echangerHeuresSeances(DATES_TEST.lundiPaire, 's1', 'inconnu')).not.toThrow();
      expect(donneesService.donnees()?.cahierJournal[0].seances[0].heureDebut).toBe('09:00');
    });

    it('supporte le UNDO', () => {
      service.initialiserJourneeVide(DATES_TEST.lundiPaire);
      service.ajouterSeance(DATES_TEST.lundiPaire, SeanceMother.pedagogique());
      service.ajouterSeance(DATES_TEST.lundiPaire, SeanceMother.recreation());
      service.echangerHeuresSeances(DATES_TEST.lundiPaire, 's1', 's2');
      donneesService.annuler();
      const seances = donneesService.donnees()?.cahierJournal[0].seances ?? [];
      expect(seances[0].heureDebut).toBe('09:00');
      expect(seances[1].heureDebut).toBe('10:00');
    });
  });

  /** Retire entièrement la journée du cahier journal ; sans effet si la date est absente. */
  describe('supprimerJournee', () => {
    it('supprime une journée existante', () => {
      service.initialiserJourneeVide(DATES_TEST.lundiPaire);
      service.supprimerJournee(DATES_TEST.lundiPaire);
      expect(donneesService.donnees()?.cahierJournal).toHaveLength(0);
    });

    it('sans effet si la date n\'existe pas', () => {
      service.supprimerJournee(DATES_TEST.lundiPaire);
      expect(donneesService.donnees()?.cahierJournal).toHaveLength(0);
    });

    it('sans effet si aucune donnée chargée', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const s = TestBed.inject(CahierJournalService);
      expect(() => s.supprimerJournee(DATES_TEST.lundiPaire)).not.toThrow();
    });

    it('supporte le UNDO', () => {
      service.initialiserJourneeVide(DATES_TEST.lundiPaire);
      service.supprimerJournee(DATES_TEST.lundiPaire);
      donneesService.annuler();
      expect(donneesService.donnees()?.cahierJournal).toHaveLength(1);
    });
  });

  /** Copie une séance vers une autre journée (existante ou créée) avec un nouvel UUID. */
  describe('dupliquerSeance', () => {
    it('duplique dans une journée existante', () => {
      service.initialiserJourneeVide(DATES_TEST.lundiPaire);
      service.ajouterSeance(DATES_TEST.lundiPaire, SeanceMother.pedagogique());
      service.initialiserJourneeVide(DATES_TEST.lundiImpaire);
      service.dupliquerSeance('s1', DATES_TEST.lundiPaire, DATES_TEST.lundiImpaire);
      expect(donneesService.donnees()?.cahierJournal[1].seances).toHaveLength(1);
    });

    it('crée la journée cible si elle n\'existe pas', () => {
      service.initialiserJourneeVide(DATES_TEST.lundiPaire);
      service.ajouterSeance(DATES_TEST.lundiPaire, SeanceMother.pedagogique());
      service.dupliquerSeance('s1', DATES_TEST.lundiPaire, DATES_TEST.lundiImpaire);
      expect(donneesService.donnees()?.cahierJournal).toHaveLength(2);
      expect(donneesService.donnees()?.cahierJournal[1].date).toBe(DATES_TEST.lundiImpaire);
    });

    it('génère un nouvel UUID pour la séance dupliquée', () => {
      service.initialiserJourneeVide(DATES_TEST.lundiPaire);
      service.ajouterSeance(DATES_TEST.lundiPaire, SeanceMother.pedagogique());
      service.dupliquerSeance('s1', DATES_TEST.lundiPaire, DATES_TEST.lundiImpaire);
      const nouvelleSeanceId = donneesService.donnees()?.cahierJournal[1].seances[0].id;
      expect(nouvelleSeanceId).not.toBe('s1');
    });

    it('sans effet si la journée source n\'existe pas', () => {
      service.dupliquerSeance('s1', DATES_TEST.lundiPaire, DATES_TEST.lundiImpaire);
      expect(donneesService.donnees()?.cahierJournal).toHaveLength(0);
    });

    it('sans effet si la séance source n\'existe pas', () => {
      service.initialiserJourneeVide(DATES_TEST.lundiPaire);
      service.dupliquerSeance('inconnu', DATES_TEST.lundiPaire, DATES_TEST.lundiImpaire);
      expect(donneesService.donnees()?.cahierJournal).toHaveLength(1);
    });

    it('sans effet si aucune donnée chargée', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const s = TestBed.inject(CahierJournalService);
      expect(() => s.dupliquerSeance('s1', DATES_TEST.lundiPaire, DATES_TEST.lundiImpaire)).not.toThrow();
    });
  });

  /** Copie toutes les séances d'une journée vers une autre, remplaçant son contenu si elle existe déjà. */
  describe('dupliquerJournee', () => {
    it('duplique vers une nouvelle journée', () => {
      service.initialiserJourneeVide(DATES_TEST.lundiPaire);
      service.ajouterSeance(DATES_TEST.lundiPaire, SeanceMother.pedagogique());
      service.dupliquerJournee(DATES_TEST.lundiPaire, DATES_TEST.lundiImpaire);
      const journeeCible = donneesService.donnees()?.cahierJournal.find(j => j.date === DATES_TEST.lundiImpaire);
      expect(journeeCible?.seances).toHaveLength(1);
    });

    it('remplace une journée existante à la date cible', () => {
      service.initialiserJourneeVide(DATES_TEST.lundiPaire);
      service.ajouterSeance(DATES_TEST.lundiPaire, SeanceMother.pedagogique());
      service.ajouterSeance(DATES_TEST.lundiPaire, SeanceMother.recreation());
      service.initialiserJourneeVide(DATES_TEST.lundiImpaire); // journée cible vide
      service.dupliquerJournee(DATES_TEST.lundiPaire, DATES_TEST.lundiImpaire);
      expect(donneesService.donnees()?.cahierJournal.find(j => j.date === DATES_TEST.lundiImpaire)?.seances).toHaveLength(2);
    });

    it('génère de nouveaux UUIDs pour chaque séance', () => {
      service.initialiserJourneeVide(DATES_TEST.lundiPaire);
      service.ajouterSeance(DATES_TEST.lundiPaire, SeanceMother.pedagogique());
      service.dupliquerJournee(DATES_TEST.lundiPaire, DATES_TEST.lundiImpaire);
      const seanceId = donneesService.donnees()?.cahierJournal.find(j => j.date === DATES_TEST.lundiImpaire)?.seances[0].id;
      expect(seanceId).not.toBe('s1');
    });

    it('sans effet si la journée source n\'existe pas', () => {
      service.dupliquerJournee(DATES_TEST.lundiPaire, DATES_TEST.lundiImpaire);
      expect(donneesService.donnees()?.cahierJournal).toHaveLength(0);
    });

    it('sans effet si aucune donnée chargée', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const s = TestBed.inject(CahierJournalService);
      expect(() => s.dupliquerJournee(DATES_TEST.lundiPaire, DATES_TEST.lundiImpaire)).not.toThrow();
    });
  });

  /** Retourne les conflits entre les séances du jour et les absences récurrentes des élèves concernés. */
  describe('calculerConflitsAbsences', () => {
    it('retourne tableau vide si aucune donnée chargée', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const s = TestBed.inject(CahierJournalService);
      expect(s.calculerConflitsAbsences(DATES_TEST.lundiPaire, 's1')).toEqual([]);
    });

    it('retourne tableau vide si la journée n\'existe pas', () => {
      expect(service.calculerConflitsAbsences(DATES_TEST.lundiPaire, 's1')).toEqual([]);
    });

    it('retourne tableau vide si la séance n\'existe pas', () => {
      service.initialiserJourneeVide(DATES_TEST.lundiPaire);
      expect(service.calculerConflitsAbsences(DATES_TEST.lundiPaire, 'inconnu')).toEqual([]);
    });

    it('retourne tableau vide pour un samedi', () => {
      const d = DonneesMother.base();
      d.cahierJournal = [{ id: 'j-samedi', date: DATES_TEST.samedi, seances: [SeanceMother.pedagogique()] }];
      donneesService.charger(d);
      expect(service.calculerConflitsAbsences(DATES_TEST.samedi, 's1')).toEqual([]);
    });

    it('détecte un conflit pour un élève de la classe entière', () => {
      const lundiTest = DateUtils.ajouterJours(DateUtils.lundiDeLaSemaine(DateUtils.dateAujourdhui()), 7);
      const d = DonneesMother.base();
      d.classe.eleves = [
        EleveMother.base('e1', 'MARTIN', 'Paul', {
          absencesRecurrentes: [{ id: 'a1', libelle: 'Orthophonie', jour: 'lundi', heureDebut: '09:30', heureFin: '10:30', paritesSemaine: 'lesDeux' }],
        }),
      ];
      d.cahierJournal = [{ id: 'j1', date: lundiTest, seances: [SeanceMother.pedagogique()] }];
      donneesService.charger(d);
      const conflits = service.calculerConflitsAbsences(lundiTest, 's1');
      expect(conflits).toHaveLength(1);
      expect(conflits[0]).toBe('MARTIN Paul — Orthophonie');
    });

    it("ne détecte pas de conflit si l'absence est un autre jour", () => {
      const d = DonneesMother.base();
      d.classe.eleves = [
        EleveMother.base('e1', 'MARTIN', 'Paul', {
          absencesRecurrentes: [{ id: 'a1', libelle: 'Orthophonie', jour: 'mardi', heureDebut: '09:00', heureFin: '10:00', paritesSemaine: 'lesDeux' }],
        }),
      ];
      d.cahierJournal = [{ id: 'j1', date: DATES_TEST.lundiPaire, seances: [SeanceMother.pedagogique()] }];
      donneesService.charger(d);
      expect(service.calculerConflitsAbsences(DATES_TEST.lundiPaire, 's1')).toEqual([]);
    });

    it('filtre les élèves par groupe', () => {
      const lundiTest = DateUtils.ajouterJours(DateUtils.lundiDeLaSemaine(DateUtils.dateAujourdhui()), 7);
      const d = DonneesMother.base();
      d.classe.eleves = [
        EleveMother.base('e1', 'MARTIN', 'Paul', {
          groupes: ['GA'],
          absencesRecurrentes: [{ id: 'a1', libelle: 'Ortho', jour: 'lundi', heureDebut: '09:00', heureFin: '10:00', paritesSemaine: 'lesDeux' }],
        }),
        EleveMother.base('e2', 'DUPONT', 'Marie', {
          groupes: ['GB'],
          absencesRecurrentes: [{ id: 'a2', libelle: 'RASED', jour: 'lundi', heureDebut: '09:00', heureFin: '10:00', paritesSemaine: 'lesDeux' }],
        }),
      ];
      const seanceGroupe: Seance = {
        id: 'sg', heureDebut: '09:00', heureFin: '10:00', type: 'pedagogique',
        elevesConcernes: { type: 'groupes', groupes: ['GA'], elevesIds: [] },
      };
      d.cahierJournal = [{ id: 'j1', date: lundiTest, seances: [seanceGroupe] }];
      donneesService.charger(d);
      const conflits = service.calculerConflitsAbsences(lundiTest, 'sg');
      expect(conflits).toHaveLength(1);
      expect(conflits[0]).toContain('MARTIN');
    });

    it('filtre les élèves par ID explicite', () => {
      const lundiTest = DateUtils.ajouterJours(DateUtils.lundiDeLaSemaine(DateUtils.dateAujourdhui()), 7);
      const d = DonneesMother.base();
      d.classe.eleves = [
        EleveMother.base('e1', 'MARTIN', 'Paul', {
          absencesRecurrentes: [{ id: 'a1', libelle: 'Ortho', jour: 'lundi', heureDebut: '09:00', heureFin: '10:00', paritesSemaine: 'lesDeux' }],
        }),
        EleveMother.base('e2', 'DUPONT', 'Marie', {
          absencesRecurrentes: [{ id: 'a2', libelle: 'RASED', jour: 'lundi', heureDebut: '09:00', heureFin: '10:00', paritesSemaine: 'lesDeux' }],
        }),
      ];
      const seanceEleves: Seance = {
        id: 'se', heureDebut: '09:00', heureFin: '10:00', type: 'pedagogique',
        elevesConcernes: { type: 'eleves', groupes: [], elevesIds: ['e1'] },
      };
      d.cahierJournal = [{ id: 'j1', date: lundiTest, seances: [seanceEleves] }];
      donneesService.charger(d);
      const conflits = service.calculerConflitsAbsences(lundiTest, 'se');
      expect(conflits).toHaveLength(1);
      expect(conflits[0]).toContain('MARTIN');
    });
  });
});
