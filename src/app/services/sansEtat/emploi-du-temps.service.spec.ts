import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { EmploiDuTempsService } from './emploi-du-temps.service';
import { DonneesService } from '../avecEtat/donnees.service';
import { EmploiDuTemps, CreneauEdt } from '../../modeles/emploi-du-temps.modele';
import { DonneesMother } from '../../tests/donnees.mother';
import { EleveMother, AbsenceRecurrenteMother } from '../../tests/eleve.mother';
import { EdtMother, CreneauMother, TempsCreneauMother } from '../../tests/emploi-du-temps.mother';

describe('EmploiDuTempsService', () => {
  let service: EmploiDuTempsService;
  let donneesService: DonneesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmploiDuTempsService);
    donneesService = TestBed.inject(DonneesService);
    donneesService.charger(DonneesMother.base());
  });

  /** L'EDT est ajouté à la liste et la création est réversible via UNDO. */
  describe('creerEdt', () => {
    it('ajoute un EDT', () => {
      service.creerEdt(EdtMother.base());
      expect(donneesService.donnees()?.emploisDuTemps).toHaveLength(1);
    });

    it('supporte le UNDO', () => {
      service.creerEdt(EdtMother.base());
      donneesService.annuler();
      expect(donneesService.donnees()?.emploisDuTemps).toHaveLength(0);
    });
  });

  /** Met à jour l'EDT trouvé par son id ; sans effet si id inconnu ou données absentes. */
  describe('modifierEdt', () => {
    it('met à jour un EDT existant', () => {
      service.creerEdt(EdtMother.base());
      service.modifierEdt({ ...EdtMother.base(), nom: 'Nouveau nom' });
      expect(donneesService.donnees()?.emploisDuTemps[0].nom).toBe('Nouveau nom');
    });

    it('sans effet si id inexistant', () => {
      service.creerEdt(EdtMother.base());
      service.modifierEdt({ ...EdtMother.base(), id: 'inconnu', nom: 'X' });
      expect(donneesService.donnees()?.emploisDuTemps[0].nom).toBe('Semaine complète');
    });

    it('sans effet si aucune donnée chargée', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const s = TestBed.inject(EmploiDuTempsService);
      expect(() => s.modifierEdt(EdtMother.base())).not.toThrow();
    });

    it('supporte le UNDO', () => {
      service.creerEdt(EdtMother.base());
      service.modifierEdt({ ...EdtMother.base(), nom: 'Nouveau nom' });
      donneesService.annuler();
      expect(donneesService.donnees()?.emploisDuTemps[0].nom).toBe('Semaine complète');
    });
  });

  /** Retire l'EDT et tous ses créneaux ; sans effet si id inconnu ou données absentes. */
  describe('supprimerEdt', () => {
    it('supprime un EDT existant', () => {
      service.creerEdt(EdtMother.base());
      service.supprimerEdt('edt1');
      expect(donneesService.donnees()?.emploisDuTemps).toHaveLength(0);
    });

    it('sans effet si id inexistant', () => {
      service.creerEdt(EdtMother.base());
      service.supprimerEdt('inconnu');
      expect(donneesService.donnees()?.emploisDuTemps).toHaveLength(1);
    });

    it('sans effet si aucune donnée chargée', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const s = TestBed.inject(EmploiDuTempsService);
      expect(() => s.supprimerEdt('edt1')).not.toThrow();
    });

    it('supporte le UNDO', () => {
      service.creerEdt(EdtMother.base());
      service.supprimerEdt('edt1');
      donneesService.annuler();
      expect(donneesService.donnees()?.emploisDuTemps).toHaveLength(1);
    });
  });

  /** Retourne l'EDT si l'id existe, undefined sinon. */
  describe('obtenirEdt', () => {
    it("retourne l'EDT si l'id existe", () => {
      service.creerEdt(EdtMother.base());
      expect(service.obtenirEdt('edt1')?.nom).toBe('Semaine complète');
    });

    it("retourne undefined si l'id n'existe pas", () => {
      expect(service.obtenirEdt('inconnu')).toBeUndefined();
    });
  });

  /** Ajoute un créneau en fin de liste dans l'EDT ciblé ; sans effet si EDT inconnu. */
  describe('ajouterCreneau', () => {
    it("ajoute un créneau à l'EDT", () => {
      service.creerEdt(EdtMother.base());
      service.ajouterCreneau('edt1', CreneauMother.lundi9h10());
      expect(donneesService.donnees()?.emploisDuTemps[0].creneaux).toHaveLength(1);
    });

    it('sans effet si EDT inexistant', () => {
      service.creerEdt(EdtMother.base());
      service.ajouterCreneau('inconnu', CreneauMother.lundi9h10());
      expect(donneesService.donnees()?.emploisDuTemps[0].creneaux).toHaveLength(0);
    });

    it('sans effet si aucune donnée chargée', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const s = TestBed.inject(EmploiDuTempsService);
      expect(() => s.ajouterCreneau('edt1', CreneauMother.lundi9h10())).not.toThrow();
    });

    it('supporte le UNDO', () => {
      service.creerEdt(EdtMother.base());
      service.ajouterCreneau('edt1', CreneauMother.lundi9h10());
      donneesService.annuler();
      expect(donneesService.donnees()?.emploisDuTemps[0].creneaux).toHaveLength(0);
    });
  });

  /** Remplace le créneau par son id dans l'EDT ciblé ; sans effet si EDT ou créneau inconnu. */
  describe('modifierCreneau', () => {
    it('met à jour un créneau existant', () => {
      service.creerEdt(EdtMother.base());
      service.ajouterCreneau('edt1', CreneauMother.lundi9h10());
      service.modifierCreneau('edt1', CreneauMother.avecHoraire('09:00', '11:00'));
      expect(donneesService.donnees()?.emploisDuTemps[0].creneaux[0].temps[0].heureFin).toBe(
        '11:00',
      );
    });

    it('sans effet si EDT inexistant', () => {
      service.creerEdt(EdtMother.base());
      service.ajouterCreneau('edt1', CreneauMother.lundi9h10());
      service.modifierCreneau('inconnu', CreneauMother.avecHoraire('09:00', '11:00'));
      expect(donneesService.donnees()?.emploisDuTemps[0].creneaux[0].temps[0].heureFin).toBe(
        '10:00',
      );
    });

    it('sans effet si aucune donnée chargée', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const s = TestBed.inject(EmploiDuTempsService);
      expect(() => s.modifierCreneau('edt1', CreneauMother.lundi9h10())).not.toThrow();
    });
  });

  /** Retire le créneau de l'EDT ciblé ; sans effet si EDT ou créneau inconnu. */
  describe('supprimerCreneau', () => {
    it('supprime un créneau existant', () => {
      service.creerEdt(EdtMother.base());
      service.ajouterCreneau('edt1', CreneauMother.lundi9h10());
      service.supprimerCreneau('edt1', 'c1');
      expect(donneesService.donnees()?.emploisDuTemps[0].creneaux).toHaveLength(0);
    });

    it('sans effet si EDT inexistant', () => {
      service.creerEdt(EdtMother.base());
      service.ajouterCreneau('edt1', CreneauMother.lundi9h10());
      service.supprimerCreneau('inconnu', 'c1');
      expect(donneesService.donnees()?.emploisDuTemps[0].creneaux).toHaveLength(1);
    });

    it('sans effet si aucune donnée chargée', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const s = TestBed.inject(EmploiDuTempsService);
      expect(() => s.supprimerCreneau('edt1', 'c1')).not.toThrow();
    });
  });

  /** Détecte tout créneau en conflit horaire sur le même jour avec un autre EDT de fréquence compatible. */
  describe('validerChevauchement', () => {
    it('détecte un chevauchement entre deux créneaux du même EDT (seule la branche interne)', () => {
      const edt = EdtMother.base({
        creneaux: [CreneauMother.lundi9h10(), CreneauMother.lundi9h10({ id: 'c2' })],
      });
      expect(service.validerChevauchement(edt)).toBe(true);
    });

    it('ne détecte pas de conflit interne pour des horaires adjacents', () => {
      const edt = EdtMother.base({
        creneaux: [
          CreneauMother.lundi9h10(),
          CreneauMother.lundi9h10({
            id: 'c2',
            temps: [TempsCreneauMother.base({ id: 't2', heureDebut: '10:00', heureFin: '11:00' })],
          }),
        ],
      });
      expect(service.validerChevauchement(edt)).toBe(false);
    });

    it('ne détecte pas de conflit interne pour des jours différents', () => {
      const edt = EdtMother.base({
        creneaux: [CreneauMother.lundi9h10(), CreneauMother.lundi9h10({ id: 'c2', jour: 'mardi' })],
      });
      expect(service.validerChevauchement(edt)).toBe(false);
    });

    it("retourne false si aucun autre EDT n'existe", () => {
      const edt = { ...EdtMother.base(), creneaux: [CreneauMother.lundi9h10()] };
      expect(service.validerChevauchement(edt)).toBe(false);
    });

    it('détecte un chevauchement entre deux EDTs lesDeux sans plage de dates', () => {
      service.creerEdt({ ...EdtMother.base(), id: 'edt1', creneaux: [CreneauMother.lundi9h10()] });
      const edt2: EmploiDuTemps = {
        id: 'edt2',
        nom: 'EDT2',
        dateDebut: null,
        dateFin: null,
        frequence: 'lesDeux',
        creneaux: [CreneauMother.lundi9h10()],
      };
      expect(service.validerChevauchement(edt2)).toBe(true);
    });

    it('retourne false si fréquences incompatibles (paire vs impaire)', () => {
      service.creerEdt({
        ...EdtMother.base(),
        id: 'edt1',
        frequence: 'paire',
        creneaux: [CreneauMother.lundi9h10()],
      });
      const edt2: EmploiDuTemps = {
        id: 'edt2',
        nom: 'EDT2',
        dateDebut: null,
        dateFin: null,
        frequence: 'impaire',
        creneaux: [CreneauMother.lundi9h10()],
      };
      expect(service.validerChevauchement(edt2)).toBe(false);
    });

    it('détecte un chevauchement entre EDT paire et EDT lesDeux', () => {
      service.creerEdt({
        ...EdtMother.base(),
        id: 'edt1',
        frequence: 'paire',
        creneaux: [CreneauMother.lundi9h10()],
      });
      const edt2: EmploiDuTemps = {
        id: 'edt2',
        nom: 'EDT2',
        dateDebut: null,
        dateFin: null,
        frequence: 'lesDeux',
        creneaux: [CreneauMother.lundi9h10()],
      };
      expect(service.validerChevauchement(edt2)).toBe(true);
    });

    it('détecte un chevauchement entre deux EDTs impaire', () => {
      service.creerEdt({
        ...EdtMother.base(),
        id: 'edt1',
        frequence: 'impaire',
        creneaux: [CreneauMother.lundi9h10()],
      });
      const edt2: EmploiDuTemps = {
        id: 'edt2',
        nom: 'EDT2',
        dateDebut: null,
        dateFin: null,
        frequence: 'impaire',
        creneaux: [CreneauMother.lundi9h10()],
      };
      expect(service.validerChevauchement(edt2)).toBe(true);
    });

    it('retourne false si les plages de dates ne se chevauchent pas', () => {
      service.creerEdt({
        ...EdtMother.base(),
        id: 'edt1',
        dateDebut: '2025-09-01',
        dateFin: '2025-10-31',
        creneaux: [CreneauMother.lundi9h10()],
      });
      const edt2: EmploiDuTemps = {
        id: 'edt2',
        nom: 'EDT2',
        dateDebut: '2025-11-01',
        dateFin: '2025-12-31',
        frequence: 'lesDeux',
        creneaux: [CreneauMother.lundi9h10()],
      };
      expect(service.validerChevauchement(edt2)).toBe(false);
    });

    it('retourne false si les créneaux ne se chevauchent pas horaire (adjacents)', () => {
      service.creerEdt({ ...EdtMother.base(), id: 'edt1', creneaux: [CreneauMother.lundi9h10()] });
      const CRENEAU_10_11: CreneauEdt = {
        id: 'c2',
        jour: 'lundi',
        type: 'pedagogique',
        temps: [{ id: 'c2-t1', heureDebut: '10:00', heureFin: '11:00' }],
      };
      const edt2: EmploiDuTemps = {
        id: 'edt2',
        nom: 'EDT2',
        dateDebut: null,
        dateFin: null,
        frequence: 'lesDeux',
        creneaux: [CRENEAU_10_11],
      };
      expect(service.validerChevauchement(edt2)).toBe(false);
    });

    it('retourne false si les créneaux ne sont pas le même jour', () => {
      service.creerEdt({ ...EdtMother.base(), id: 'edt1', creneaux: [CreneauMother.lundi9h10()] });
      const CRENEAU_MARDI: CreneauEdt = {
        id: 'c2',
        jour: 'mardi',
        type: 'pedagogique',
        temps: [{ id: 'c2-t1', heureDebut: '09:00', heureFin: '10:00' }],
      };
      const edt2: EmploiDuTemps = {
        id: 'edt2',
        nom: 'EDT2',
        dateDebut: null,
        dateFin: null,
        frequence: 'lesDeux',
        creneaux: [CRENEAU_MARDI],
      };
      expect(service.validerChevauchement(edt2)).toBe(false);
    });

    it('retourne false si aucune donnée chargée', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const s = TestBed.inject(EmploiDuTempsService);
      expect(s.validerChevauchement(EdtMother.base())).toBe(false);
    });

    it('détecte un chevauchement partiel (un créneau sur plusieurs)', () => {
      const C_MARDI: CreneauEdt = {
        id: 'cm',
        jour: 'mardi',
        type: 'recreation',
        temps: [{ id: 'cm-t1', heureDebut: '08:00', heureFin: '09:00' }],
      };
      service.creerEdt({
        ...EdtMother.base(),
        id: 'edt1',
        creneaux: [C_MARDI, CreneauMother.lundi9h10()],
      });
      const edt2: EmploiDuTemps = {
        id: 'edt2',
        nom: 'EDT2',
        dateDebut: null,
        dateFin: null,
        frequence: 'lesDeux',
        creneaux: [CreneauMother.lundi9h10()],
      };
      expect(service.validerChevauchement(edt2)).toBe(true);
    });
  });

  /** Retourne les conflits entre un créneau et les absences récurrentes des élèves concernés. */
  describe('calculerConflitsAbsences', () => {
    it('retourne tableau vide si aucune donnée chargée', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const s = TestBed.inject(EmploiDuTempsService);
      expect(s.calculerConflitsAbsences('c1')).toEqual([]);
    });

    it('retourne tableau vide si créneau inexistant', () => {
      service.creerEdt(EdtMother.base());
      expect(service.calculerConflitsAbsences('inconnu')).toEqual([]);
    });

    it('retourne tableau vide si aucun élève dans la classe', () => {
      service.creerEdt({ ...EdtMother.base(), creneaux: [CreneauMother.lundi9h10()] });
      expect(service.calculerConflitsAbsences('c1')).toEqual([]);
    });

    it('retourne tableau vide si élève sans absence récurrente', () => {
      const d = DonneesMother.base();
      d.classe.eleves = [EleveMother.base('e1', 'MARTIN', 'Paul')];
      donneesService.charger(d);
      service.creerEdt({ ...EdtMother.base(), creneaux: [CreneauMother.lundi9h10()] });
      expect(service.calculerConflitsAbsences('c1')).toEqual([]);
    });

    it('détecte un conflit pour un élève de la classe entière', () => {
      const d = DonneesMother.base();
      d.classe.eleves = [
        EleveMother.base('e1', 'MARTIN', 'Paul', {
          absencesRecurrentes: [
            {
              id: 'a1',
              libelle: 'Orthophonie',
              jour: 'lundi',
              paritesSemaine: 'lesDeux',
              heureDebut: '09:30',
              heureFin: '10:30',
            },
          ],
        }),
      ];
      donneesService.charger(d);
      service.creerEdt({ ...EdtMother.base(), creneaux: [CreneauMother.lundi9h10()] });
      const conflits = service.calculerConflitsAbsences('c1');
      expect(conflits).toHaveLength(1);
      expect(conflits[0]).toBe('MARTIN Paul — Orthophonie');
    });

    it("ne détecte pas de conflit si l'absence est sur un autre jour", () => {
      const d = DonneesMother.base();
      d.classe.eleves = [
        EleveMother.base('e1', 'MARTIN', 'Paul', {
          absencesRecurrentes: [
            {
              id: 'a1',
              libelle: 'Orthophonie',
              jour: 'mardi',
              paritesSemaine: 'lesDeux',
              heureDebut: '09:00',
              heureFin: '10:00',
            },
          ],
        }),
      ];
      donneesService.charger(d);
      service.creerEdt({ ...EdtMother.base(), creneaux: [CreneauMother.lundi9h10()] });
      expect(service.calculerConflitsAbsences('c1')).toEqual([]);
    });

    it("ne détecte pas de conflit si l'absence est non chevauchante (adjacent)", () => {
      const d = DonneesMother.base();
      d.classe.eleves = [
        EleveMother.base('e1', 'MARTIN', 'Paul', {
          absencesRecurrentes: [
            {
              id: 'a1',
              libelle: 'Orthophonie',
              jour: 'lundi',
              paritesSemaine: 'lesDeux',
              heureDebut: '10:00',
              heureFin: '11:00',
            },
          ],
        }),
      ];
      donneesService.charger(d);
      service.creerEdt({ ...EdtMother.base(), creneaux: [CreneauMother.lundi9h10()] });
      expect(service.calculerConflitsAbsences('c1')).toEqual([]);
    });

    it('filtre les élèves par groupe si elevesConcernes.type = groupes', () => {
      const d = DonneesMother.base();
      d.classe.eleves = [
        EleveMother.base('e1', 'MARTIN', 'Paul', {
          groupes: ['GA'],
          absencesRecurrentes: [
            {
              id: 'a1',
              libelle: 'Ortho',
              jour: 'lundi',
              paritesSemaine: 'lesDeux',
              heureDebut: '09:00',
              heureFin: '10:00',
            },
          ],
        }),
        EleveMother.base('e2', 'DUPONT', 'Marie', {
          groupes: ['GB'],
          absencesRecurrentes: [
            {
              id: 'a2',
              libelle: 'RASED',
              jour: 'lundi',
              paritesSemaine: 'lesDeux',
              heureDebut: '09:00',
              heureFin: '10:00',
            },
          ],
        }),
      ];
      donneesService.charger(d);
      const CRENEAU_GROUPE: CreneauEdt = {
        id: 'cg',
        jour: 'lundi',
        type: 'pedagogique',
        temps: [
          {
            id: 'cg-t1',
            heureDebut: '09:00',
            heureFin: '10:00',
            elevesConcernes: { type: 'groupes', groupes: ['GA'], elevesIds: [] },
          },
        ],
      };
      service.creerEdt({ ...EdtMother.base(), creneaux: [CRENEAU_GROUPE] });
      const conflits = service.calculerConflitsAbsences('cg');
      expect(conflits).toHaveLength(1);
      expect(conflits[0]).toContain('MARTIN');
    });

    it('filtre les élèves par ID si elevesConcernes.type = eleves', () => {
      const d = DonneesMother.base();
      d.classe.eleves = [
        EleveMother.base('e1', 'MARTIN', 'Paul', {
          absencesRecurrentes: [
            {
              id: 'a1',
              libelle: 'Ortho',
              jour: 'lundi',
              paritesSemaine: 'lesDeux',
              heureDebut: '09:00',
              heureFin: '10:00',
            },
          ],
        }),
        EleveMother.base('e2', 'DUPONT', 'Marie', {
          absencesRecurrentes: [
            {
              id: 'a2',
              libelle: 'RASED',
              jour: 'lundi',
              paritesSemaine: 'lesDeux',
              heureDebut: '09:00',
              heureFin: '10:00',
            },
          ],
        }),
      ];
      donneesService.charger(d);
      const CRENEAU_ELEVES: CreneauEdt = {
        id: 'ce',
        jour: 'lundi',
        type: 'pedagogique',
        temps: [
          {
            id: 'ce-t1',
            heureDebut: '09:00',
            heureFin: '10:00',
            elevesConcernes: { type: 'eleves', groupes: [], elevesIds: ['e2'] },
          },
        ],
      };
      service.creerEdt({ ...EdtMother.base(), creneaux: [CRENEAU_ELEVES] });
      const conflits = service.calculerConflitsAbsences('ce');
      expect(conflits).toHaveLength(1);
      expect(conflits[0]).toContain('DUPONT');
    });

    it('retourne plusieurs conflits pour le même créneau', () => {
      const d = DonneesMother.base();
      d.classe.eleves = [
        EleveMother.base('e1', 'MARTIN', 'Paul', {
          absencesRecurrentes: [
            {
              id: 'a1',
              libelle: 'Ortho',
              jour: 'lundi',
              paritesSemaine: 'lesDeux',
              heureDebut: '09:00',
              heureFin: '10:00',
            },
          ],
        }),
        EleveMother.base('e2', 'DUPONT', 'Marie', {
          absencesRecurrentes: [
            {
              id: 'a2',
              libelle: 'RASED',
              jour: 'lundi',
              paritesSemaine: 'lesDeux',
              heureDebut: '09:00',
              heureFin: '10:00',
            },
          ],
        }),
      ];
      donneesService.charger(d);
      service.creerEdt({ ...EdtMother.base(), creneaux: [CreneauMother.lundi9h10()] });
      const conflits = service.calculerConflitsAbsences('c1');
      expect(conflits).toHaveLength(2);
    });

    it("ignore les élèves inconnus dans la liste d'IDs explicites", () => {
      const d = DonneesMother.base();
      d.classe.eleves = [EleveMother.base('e1', 'MARTIN', 'Paul')];
      donneesService.charger(d);
      const CRENEAU_INCONNU: CreneauEdt = {
        id: 'ci',
        jour: 'lundi',
        type: 'pedagogique',
        temps: [
          {
            id: 'ci-t1',
            heureDebut: '09:00',
            heureFin: '10:00',
            elevesConcernes: { type: 'eleves', groupes: [], elevesIds: ['inconnu'] },
          },
        ],
      };
      service.creerEdt({ ...EdtMother.base(), creneaux: [CRENEAU_INCONNU] });
      expect(service.calculerConflitsAbsences('ci')).toEqual([]);
    });

    it("ne détecte pas de conflit si l'EDT est en semaine paire et l'absence en semaine impaire", () => {
      const d = DonneesMother.base();
      d.classe.eleves = [
        EleveMother.base('e1', 'MARTIN', 'Paul', {
          absencesRecurrentes: [AbsenceRecurrenteMother.base({ paritesSemaine: 'impaire' })],
        }),
      ];
      donneesService.charger(d);
      service.creerEdt({
        ...EdtMother.base(),
        frequence: 'paire',
        creneaux: [CreneauMother.lundi9h10()],
      });
      expect(service.calculerConflitsAbsences('c1')).toEqual([]);
    });

    it("détecte un conflit si l'EDT et l'absence sont sur la même parité", () => {
      const d = DonneesMother.base();
      d.classe.eleves = [
        EleveMother.base('e1', 'MARTIN', 'Paul', {
          absencesRecurrentes: [AbsenceRecurrenteMother.base({ paritesSemaine: 'paire' })],
        }),
      ];
      donneesService.charger(d);
      service.creerEdt({
        ...EdtMother.base(),
        frequence: 'paire',
        creneaux: [CreneauMother.lundi9h10()],
      });
      const conflits = service.calculerConflitsAbsences('c1');
      expect(conflits).toHaveLength(1);
      expect(conflits[0]).toBe('MARTIN Paul — Orthophonie');
    });

    it("détecte un conflit si l'absence est en 'lesDeux', compatible avec toute fréquence d'EDT", () => {
      const d = DonneesMother.base();
      d.classe.eleves = [
        EleveMother.base('e1', 'MARTIN', 'Paul', {
          absencesRecurrentes: [AbsenceRecurrenteMother.base({ paritesSemaine: 'lesDeux' })],
        }),
      ];
      donneesService.charger(d);
      service.creerEdt({
        ...EdtMother.base(),
        frequence: 'impaire',
        creneaux: [CreneauMother.lundi9h10()],
      });
      const conflits = service.calculerConflitsAbsences('c1');
      expect(conflits).toHaveLength(1);
      expect(conflits[0]).toBe('MARTIN Paul — Orthophonie');
    });
  });

  describe('obtenirAbsencesPertinentes', () => {
    it('retourne [] si aucune donnée chargée', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const serviceSansDonnees = TestBed.inject(EmploiDuTempsService);
      expect(serviceSansDonnees.obtenirAbsencesPertinentes(EdtMother.base())).toEqual([]);
    });

    it('retourne [] pour un EDT sans créneau (aucun jour utilisé)', () => {
      const d = DonneesMother.base();
      d.classe.eleves = [
        EleveMother.base('e1', 'MARTIN', 'Paul', {
          absencesRecurrentes: [AbsenceRecurrenteMother.base()],
        }),
      ];
      donneesService.charger(d);
      expect(service.obtenirAbsencesPertinentes(EdtMother.base({ creneaux: [] }))).toEqual([]);
    });

    it("exclut une absence dont le jour n'est utilisé par aucun créneau de l'EDT", () => {
      const d = DonneesMother.base();
      d.classe.eleves = [
        EleveMother.base('e1', 'MARTIN', 'Paul', {
          absencesRecurrentes: [AbsenceRecurrenteMother.base({ jour: 'vendredi' })],
        }),
      ];
      donneesService.charger(d);
      const edt = EdtMother.base({ creneaux: [CreneauMother.lundi9h10()] });
      expect(service.obtenirAbsencesPertinentes(edt)).toEqual([]);
    });

    it('exclut une absence dont la parité est incompatible avec la fréquence de l’EDT', () => {
      const d = DonneesMother.base();
      d.classe.eleves = [
        EleveMother.base('e1', 'MARTIN', 'Paul', {
          absencesRecurrentes: [AbsenceRecurrenteMother.base({ paritesSemaine: 'impaire' })],
        }),
      ];
      donneesService.charger(d);
      const edt = EdtMother.base({ frequence: 'paire', creneaux: [CreneauMother.lundi9h10()] });
      expect(service.obtenirAbsencesPertinentes(edt)).toEqual([]);
    });

    it("inclut une absence en 'lesDeux', compatible avec toute fréquence d'EDT", () => {
      const d = DonneesMother.base();
      const absence = AbsenceRecurrenteMother.base({ paritesSemaine: 'lesDeux' });
      d.classe.eleves = [
        EleveMother.base('e1', 'MARTIN', 'Paul', { absencesRecurrentes: [absence] }),
      ];
      donneesService.charger(d);
      const edt = EdtMother.base({ frequence: 'impaire', creneaux: [CreneauMother.lundi9h10()] });
      expect(service.obtenirAbsencesPertinentes(edt)).toEqual([
        { eleve: d.classe.eleves[0], absence },
      ]);
    });

    it('trie les résultats par NOM Prénom', () => {
      const d = DonneesMother.base();
      const absenceMartin = AbsenceRecurrenteMother.base({ id: 'arM' });
      const absenceDupont = AbsenceRecurrenteMother.base({ id: 'arD' });
      d.classe.eleves = [
        EleveMother.base('e1', 'MARTIN', 'Paul', { absencesRecurrentes: [absenceMartin] }),
        EleveMother.base('e2', 'DUPONT', 'Alice', { absencesRecurrentes: [absenceDupont] }),
      ];
      donneesService.charger(d);
      const edt = EdtMother.base({ creneaux: [CreneauMother.lundi9h10()] });
      const resultats = service.obtenirAbsencesPertinentes(edt);
      expect(resultats.map((r) => r.eleve.nom)).toEqual(['DUPONT', 'MARTIN']);
    });
  });
});
