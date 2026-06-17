import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { EmploiDuTempsService } from './emploi-du-temps.service';
import { DonneesService } from '../avecEtat/donnees.service';
import { DonneesApplication } from '../../modeles/donnees-application.modele';
import { EmploiDuTemps, CreneauEdt } from '../../modeles/emploi-du-temps.modele';
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

const EDT_1: EmploiDuTemps = {
  id: 'edt1',
  nom: 'Semaine complète',
  dateDebut: null,
  dateFin: null,
  frequence: 'lesDeux',
  creneaux: [],
};

const CRENEAU_LUNDI_9_10: CreneauEdt = {
  id: 'c1',
  jour: 'lundi',
  heureDebut: '09:00',
  heureFin: '10:00',
  type: 'pedagogique',
};

describe('EmploiDuTempsService', () => {
  let service: EmploiDuTempsService;
  let donneesService: DonneesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmploiDuTempsService);
    donneesService = TestBed.inject(DonneesService);
    donneesService.charger(creerDonneesVides());
  });

  /** L'EDT est ajouté à la liste et la création est réversible via UNDO. */
  describe('creerEdt', () => {
    it('ajoute un EDT', () => {
      service.creerEdt(EDT_1);
      expect(donneesService.donnees()?.emploisDuTemps).toHaveLength(1);
    });

    it('supporte le UNDO', () => {
      service.creerEdt(EDT_1);
      donneesService.annuler();
      expect(donneesService.donnees()?.emploisDuTemps).toHaveLength(0);
    });
  });

  /** Met à jour l'EDT trouvé par son id ; sans effet si id inconnu ou données absentes. */
  describe('modifierEdt', () => {
    it('met à jour un EDT existant', () => {
      service.creerEdt(EDT_1);
      service.modifierEdt({ ...EDT_1, nom: 'Nouveau nom' });
      expect(donneesService.donnees()?.emploisDuTemps[0].nom).toBe('Nouveau nom');
    });

    it('sans effet si id inexistant', () => {
      service.creerEdt(EDT_1);
      service.modifierEdt({ ...EDT_1, id: 'inconnu', nom: 'X' });
      expect(donneesService.donnees()?.emploisDuTemps[0].nom).toBe('Semaine complète');
    });

    it('sans effet si aucune donnée chargée', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const s = TestBed.inject(EmploiDuTempsService);
      expect(() => s.modifierEdt(EDT_1)).not.toThrow();
    });

    it('supporte le UNDO', () => {
      service.creerEdt(EDT_1);
      service.modifierEdt({ ...EDT_1, nom: 'Nouveau nom' });
      donneesService.annuler();
      expect(donneesService.donnees()?.emploisDuTemps[0].nom).toBe('Semaine complète');
    });
  });

  /** Retire l'EDT et tous ses créneaux ; sans effet si id inconnu ou données absentes. */
  describe('supprimerEdt', () => {
    it('supprime un EDT existant', () => {
      service.creerEdt(EDT_1);
      service.supprimerEdt('edt1');
      expect(donneesService.donnees()?.emploisDuTemps).toHaveLength(0);
    });

    it('sans effet si id inexistant', () => {
      service.creerEdt(EDT_1);
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
      service.creerEdt(EDT_1);
      service.supprimerEdt('edt1');
      donneesService.annuler();
      expect(donneesService.donnees()?.emploisDuTemps).toHaveLength(1);
    });
  });

  /** Retourne l'EDT si l'id existe, undefined sinon. */
  describe('obtenirEdt', () => {
    it("retourne l'EDT si l'id existe", () => {
      service.creerEdt(EDT_1);
      expect(service.obtenirEdt('edt1')?.nom).toBe('Semaine complète');
    });

    it("retourne undefined si l'id n'existe pas", () => {
      expect(service.obtenirEdt('inconnu')).toBeUndefined();
    });
  });

  /** Ajoute un créneau en fin de liste dans l'EDT ciblé ; sans effet si EDT inconnu. */
  describe('ajouterCreneau', () => {
    it("ajoute un créneau à l'EDT", () => {
      service.creerEdt(EDT_1);
      service.ajouterCreneau('edt1', CRENEAU_LUNDI_9_10);
      expect(donneesService.donnees()?.emploisDuTemps[0].creneaux).toHaveLength(1);
    });

    it('sans effet si EDT inexistant', () => {
      service.creerEdt(EDT_1);
      service.ajouterCreneau('inconnu', CRENEAU_LUNDI_9_10);
      expect(donneesService.donnees()?.emploisDuTemps[0].creneaux).toHaveLength(0);
    });

    it('sans effet si aucune donnée chargée', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const s = TestBed.inject(EmploiDuTempsService);
      expect(() => s.ajouterCreneau('edt1', CRENEAU_LUNDI_9_10)).not.toThrow();
    });

    it('supporte le UNDO', () => {
      service.creerEdt(EDT_1);
      service.ajouterCreneau('edt1', CRENEAU_LUNDI_9_10);
      donneesService.annuler();
      expect(donneesService.donnees()?.emploisDuTemps[0].creneaux).toHaveLength(0);
    });
  });

  /** Remplace le créneau par son id dans l'EDT ciblé ; sans effet si EDT ou créneau inconnu. */
  describe('modifierCreneau', () => {
    it('met à jour un créneau existant', () => {
      service.creerEdt(EDT_1);
      service.ajouterCreneau('edt1', CRENEAU_LUNDI_9_10);
      service.modifierCreneau('edt1', { ...CRENEAU_LUNDI_9_10, heureFin: '11:00' });
      expect(donneesService.donnees()?.emploisDuTemps[0].creneaux[0].heureFin).toBe('11:00');
    });

    it('sans effet si EDT inexistant', () => {
      service.creerEdt(EDT_1);
      service.ajouterCreneau('edt1', CRENEAU_LUNDI_9_10);
      service.modifierCreneau('inconnu', { ...CRENEAU_LUNDI_9_10, heureFin: '11:00' });
      expect(donneesService.donnees()?.emploisDuTemps[0].creneaux[0].heureFin).toBe('10:00');
    });

    it('sans effet si aucune donnée chargée', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const s = TestBed.inject(EmploiDuTempsService);
      expect(() => s.modifierCreneau('edt1', CRENEAU_LUNDI_9_10)).not.toThrow();
    });
  });

  /** Retire le créneau de l'EDT ciblé ; sans effet si EDT ou créneau inconnu. */
  describe('supprimerCreneau', () => {
    it('supprime un créneau existant', () => {
      service.creerEdt(EDT_1);
      service.ajouterCreneau('edt1', CRENEAU_LUNDI_9_10);
      service.supprimerCreneau('edt1', 'c1');
      expect(donneesService.donnees()?.emploisDuTemps[0].creneaux).toHaveLength(0);
    });

    it('sans effet si EDT inexistant', () => {
      service.creerEdt(EDT_1);
      service.ajouterCreneau('edt1', CRENEAU_LUNDI_9_10);
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
    it("retourne false si aucun autre EDT n'existe", () => {
      const edt = { ...EDT_1, creneaux: [CRENEAU_LUNDI_9_10] };
      expect(service.validerChevauchement(edt)).toBe(false);
    });

    it('détecte un chevauchement entre deux EDTs lesDeux sans plage de dates', () => {
      service.creerEdt({ ...EDT_1, id: 'edt1', creneaux: [CRENEAU_LUNDI_9_10] });
      const edt2: EmploiDuTemps = { id: 'edt2', nom: 'EDT2', dateDebut: null, dateFin: null, frequence: 'lesDeux', creneaux: [CRENEAU_LUNDI_9_10] };
      expect(service.validerChevauchement(edt2)).toBe(true);
    });

    it('retourne false si fréquences incompatibles (paire vs impaire)', () => {
      service.creerEdt({ ...EDT_1, id: 'edt1', frequence: 'paire', creneaux: [CRENEAU_LUNDI_9_10] });
      const edt2: EmploiDuTemps = { id: 'edt2', nom: 'EDT2', dateDebut: null, dateFin: null, frequence: 'impaire', creneaux: [CRENEAU_LUNDI_9_10] };
      expect(service.validerChevauchement(edt2)).toBe(false);
    });

    it('détecte un chevauchement entre EDT paire et EDT lesDeux', () => {
      service.creerEdt({ ...EDT_1, id: 'edt1', frequence: 'paire', creneaux: [CRENEAU_LUNDI_9_10] });
      const edt2: EmploiDuTemps = { id: 'edt2', nom: 'EDT2', dateDebut: null, dateFin: null, frequence: 'lesDeux', creneaux: [CRENEAU_LUNDI_9_10] };
      expect(service.validerChevauchement(edt2)).toBe(true);
    });

    it('détecte un chevauchement entre deux EDTs impaire', () => {
      service.creerEdt({ ...EDT_1, id: 'edt1', frequence: 'impaire', creneaux: [CRENEAU_LUNDI_9_10] });
      const edt2: EmploiDuTemps = { id: 'edt2', nom: 'EDT2', dateDebut: null, dateFin: null, frequence: 'impaire', creneaux: [CRENEAU_LUNDI_9_10] };
      expect(service.validerChevauchement(edt2)).toBe(true);
    });

    it('retourne false si les plages de dates ne se chevauchent pas', () => {
      service.creerEdt({ ...EDT_1, id: 'edt1', dateDebut: '2025-09-01', dateFin: '2025-10-31', creneaux: [CRENEAU_LUNDI_9_10] });
      const edt2: EmploiDuTemps = { id: 'edt2', nom: 'EDT2', dateDebut: '2025-11-01', dateFin: '2025-12-31', frequence: 'lesDeux', creneaux: [CRENEAU_LUNDI_9_10] };
      expect(service.validerChevauchement(edt2)).toBe(false);
    });

    it('retourne false si les créneaux ne se chevauchent pas horaire (adjacents)', () => {
      service.creerEdt({ ...EDT_1, id: 'edt1', creneaux: [CRENEAU_LUNDI_9_10] });
      const CRENEAU_10_11: CreneauEdt = { id: 'c2', jour: 'lundi', heureDebut: '10:00', heureFin: '11:00', type: 'pedagogique' };
      const edt2: EmploiDuTemps = { id: 'edt2', nom: 'EDT2', dateDebut: null, dateFin: null, frequence: 'lesDeux', creneaux: [CRENEAU_10_11] };
      expect(service.validerChevauchement(edt2)).toBe(false);
    });

    it('retourne false si les créneaux ne sont pas le même jour', () => {
      service.creerEdt({ ...EDT_1, id: 'edt1', creneaux: [CRENEAU_LUNDI_9_10] });
      const CRENEAU_MARDI: CreneauEdt = { id: 'c2', jour: 'mardi', heureDebut: '09:00', heureFin: '10:00', type: 'pedagogique' };
      const edt2: EmploiDuTemps = { id: 'edt2', nom: 'EDT2', dateDebut: null, dateFin: null, frequence: 'lesDeux', creneaux: [CRENEAU_MARDI] };
      expect(service.validerChevauchement(edt2)).toBe(false);
    });

    it('retourne false si aucune donnée chargée', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const s = TestBed.inject(EmploiDuTempsService);
      expect(s.validerChevauchement(EDT_1)).toBe(false);
    });

    it('détecte un chevauchement partiel (un créneau sur plusieurs)', () => {
      const C_MARDI: CreneauEdt = { id: 'cm', jour: 'mardi', heureDebut: '08:00', heureFin: '09:00', type: 'recreation' };
      service.creerEdt({ ...EDT_1, id: 'edt1', creneaux: [C_MARDI, CRENEAU_LUNDI_9_10] });
      const edt2: EmploiDuTemps = { id: 'edt2', nom: 'EDT2', dateDebut: null, dateFin: null, frequence: 'lesDeux', creneaux: [CRENEAU_LUNDI_9_10] };
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
      service.creerEdt(EDT_1);
      expect(service.calculerConflitsAbsences('inconnu')).toEqual([]);
    });

    it('retourne tableau vide si aucun élève dans la classe', () => {
      service.creerEdt({ ...EDT_1, creneaux: [CRENEAU_LUNDI_9_10] });
      expect(service.calculerConflitsAbsences('c1')).toEqual([]);
    });

    it('retourne tableau vide si élève sans absence récurrente', () => {
      const d = creerDonneesVides();
      d.classe.eleves = [creerEleve('e1', 'MARTIN', 'Paul')];
      donneesService.charger(d);
      service.creerEdt({ ...EDT_1, creneaux: [CRENEAU_LUNDI_9_10] });
      expect(service.calculerConflitsAbsences('c1')).toEqual([]);
    });

    it('détecte un conflit pour un élève de la classe entière', () => {
      const d = creerDonneesVides();
      d.classe.eleves = [
        creerEleve('e1', 'MARTIN', 'Paul', [], [
          { id: 'a1', libelle: 'Orthophonie', jour: 'lundi', heureDebut: '09:30', heureFin: '10:30', paritesSemaine: 'lesDeux' },
        ]),
      ];
      donneesService.charger(d);
      service.creerEdt({ ...EDT_1, creneaux: [CRENEAU_LUNDI_9_10] });
      const conflits = service.calculerConflitsAbsences('c1');
      expect(conflits).toHaveLength(1);
      expect(conflits[0]).toBe('MARTIN Paul — Orthophonie');
    });

    it("ne détecte pas de conflit si l'absence est sur un autre jour", () => {
      const d = creerDonneesVides();
      d.classe.eleves = [
        creerEleve('e1', 'MARTIN', 'Paul', [], [
          { id: 'a1', libelle: 'Orthophonie', jour: 'mardi', heureDebut: '09:00', heureFin: '10:00', paritesSemaine: 'lesDeux' },
        ]),
      ];
      donneesService.charger(d);
      service.creerEdt({ ...EDT_1, creneaux: [CRENEAU_LUNDI_9_10] });
      expect(service.calculerConflitsAbsences('c1')).toEqual([]);
    });

    it("ne détecte pas de conflit si l'absence est non chevauchante (adjacent)", () => {
      const d = creerDonneesVides();
      d.classe.eleves = [
        creerEleve('e1', 'MARTIN', 'Paul', [], [
          { id: 'a1', libelle: 'Orthophonie', jour: 'lundi', heureDebut: '10:00', heureFin: '11:00', paritesSemaine: 'lesDeux' },
        ]),
      ];
      donneesService.charger(d);
      service.creerEdt({ ...EDT_1, creneaux: [CRENEAU_LUNDI_9_10] });
      expect(service.calculerConflitsAbsences('c1')).toEqual([]);
    });

    it('filtre les élèves par groupe si elevesConcernes.type = groupes', () => {
      const d = creerDonneesVides();
      d.classe.eleves = [
        creerEleve('e1', 'MARTIN', 'Paul', ['GA'], [
          { id: 'a1', libelle: 'Ortho', jour: 'lundi', heureDebut: '09:00', heureFin: '10:00', paritesSemaine: 'lesDeux' },
        ]),
        creerEleve('e2', 'DUPONT', 'Marie', ['GB'], [
          { id: 'a2', libelle: 'RASED', jour: 'lundi', heureDebut: '09:00', heureFin: '10:00', paritesSemaine: 'lesDeux' },
        ]),
      ];
      donneesService.charger(d);
      const CRENEAU_GROUPE: CreneauEdt = {
        id: 'cg', jour: 'lundi', heureDebut: '09:00', heureFin: '10:00', type: 'pedagogique',
        elevesConcernes: { type: 'groupes', groupes: ['GA'], elevesIds: [] },
      };
      service.creerEdt({ ...EDT_1, creneaux: [CRENEAU_GROUPE] });
      const conflits = service.calculerConflitsAbsences('cg');
      expect(conflits).toHaveLength(1);
      expect(conflits[0]).toContain('MARTIN');
    });

    it('filtre les élèves par ID si elevesConcernes.type = eleves', () => {
      const d = creerDonneesVides();
      d.classe.eleves = [
        creerEleve('e1', 'MARTIN', 'Paul', [], [
          { id: 'a1', libelle: 'Ortho', jour: 'lundi', heureDebut: '09:00', heureFin: '10:00', paritesSemaine: 'lesDeux' },
        ]),
        creerEleve('e2', 'DUPONT', 'Marie', [], [
          { id: 'a2', libelle: 'RASED', jour: 'lundi', heureDebut: '09:00', heureFin: '10:00', paritesSemaine: 'lesDeux' },
        ]),
      ];
      donneesService.charger(d);
      const CRENEAU_ELEVES: CreneauEdt = {
        id: 'ce', jour: 'lundi', heureDebut: '09:00', heureFin: '10:00', type: 'pedagogique',
        elevesConcernes: { type: 'eleves', groupes: [], elevesIds: ['e2'] },
      };
      service.creerEdt({ ...EDT_1, creneaux: [CRENEAU_ELEVES] });
      const conflits = service.calculerConflitsAbsences('ce');
      expect(conflits).toHaveLength(1);
      expect(conflits[0]).toContain('DUPONT');
    });

    it('retourne plusieurs conflits pour le même créneau', () => {
      const d = creerDonneesVides();
      d.classe.eleves = [
        creerEleve('e1', 'MARTIN', 'Paul', [], [
          { id: 'a1', libelle: 'Ortho', jour: 'lundi', heureDebut: '09:00', heureFin: '10:00', paritesSemaine: 'lesDeux' },
        ]),
        creerEleve('e2', 'DUPONT', 'Marie', [], [
          { id: 'a2', libelle: 'RASED', jour: 'lundi', heureDebut: '09:00', heureFin: '10:00', paritesSemaine: 'lesDeux' },
        ]),
      ];
      donneesService.charger(d);
      service.creerEdt({ ...EDT_1, creneaux: [CRENEAU_LUNDI_9_10] });
      const conflits = service.calculerConflitsAbsences('c1');
      expect(conflits).toHaveLength(2);
    });

    it("ignore les élèves inconnus dans la liste d'IDs explicites", () => {
      const d = creerDonneesVides();
      d.classe.eleves = [creerEleve('e1', 'MARTIN', 'Paul')];
      donneesService.charger(d);
      const CRENEAU_INCONNU: CreneauEdt = {
        id: 'ci', jour: 'lundi', heureDebut: '09:00', heureFin: '10:00', type: 'pedagogique',
        elevesConcernes: { type: 'eleves', groupes: [], elevesIds: ['inconnu'] },
      };
      service.creerEdt({ ...EDT_1, creneaux: [CRENEAU_INCONNU] });
      expect(service.calculerConflitsAbsences('ci')).toEqual([]);
    });
  });
});
