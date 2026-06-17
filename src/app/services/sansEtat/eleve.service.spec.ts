import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { EleveService } from './eleve.service';
import { DonneesService } from '../avecEtat/donnees.service';
import { DonneesApplication } from '../../modeles/donnees-application.modele';
import { Eleve } from '../../modeles/eleve.modele';

/** Construit un jeu de données minimal valide pour les tests. */
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
      configEmploiDuTemps: { joursOuvres: ['lundi', 'mardi', 'jeudi', 'vendredi'], heureDebutJournee: '08:30', heureFinJournee: '16:30' },
    },
    emploisDuTemps: [], projets: [], cahierJournal: [], ppi: [], bulletins: [],
  };
}

/** Construit un élève minimal pour les tests. */
function creerEleve(partial: Partial<Eleve> & { id: string; nom: string; prenom: string }): Eleve {
  return {
    id: partial.id,
    prenom: partial.prenom,
    nom: partial.nom,
    sexe: partial.sexe ?? 'M',
    niveau: partial.niveau ?? 'CM2',
    groupes: partial.groupes ?? [],
    dateNaissance: '2015-01-01',
    dateArrivee: '2025-09-01',
    statut: 'DC',
    bilans: '',
    accueil: '',
    inclusion: null,
    contacts: [],
    absencesRecurrentes: partial.absencesRecurrentes ?? [],
    absencesPonctuelles: [],
    cursus: [],
    notesDroitImage: '',
    notesAutorisationBaignade: '',
    notesPPA: null,
    notesESS: null,
  };
}

describe('EleveService', () => {
  let service: EleveService;
  let donneesService: DonneesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EleveService);
    donneesService = TestBed.inject(DonneesService);
    donneesService.charger(creerDonneesVides());
  });

  // ── creerEleve ────────────────────────────────────────────────────────────

  describe('creerEleve', () => {
    it('ajoute l\'élève à la classe', () => {
      const eleve = creerEleve({ id: 'e1', nom: 'MARTIN', prenom: 'Paul' });
      service.creerEleve(eleve);
      expect(donneesService.donnees()?.classe.eleves).toHaveLength(1);
      expect(donneesService.donnees()?.classe.eleves[0].id).toBe('e1');
    });

    it('supporte l\'annulation UNDO', () => {
      service.creerEleve(creerEleve({ id: 'e1', nom: 'MARTIN', prenom: 'Paul' }));
      donneesService.annuler();
      expect(donneesService.donnees()?.classe.eleves).toHaveLength(0);
    });
  });

  // ── modifierEleve ─────────────────────────────────────────────────────────

  describe('modifierEleve', () => {
    it('met à jour un élève existant', () => {
      const eleve = creerEleve({ id: 'e1', nom: 'MARTIN', prenom: 'Paul' });
      service.creerEleve(eleve);
      service.modifierEleve({ ...eleve, prenom: 'Pierre' });
      expect(donneesService.donnees()?.classe.eleves[0].prenom).toBe('Pierre');
    });

    it('sans effet si id inexistant', () => {
      service.modifierEleve(creerEleve({ id: 'inconnu', nom: 'X', prenom: 'Y' }));
      expect(donneesService.donnees()?.classe.eleves).toHaveLength(0);
    });

    it('sans effet si aucune donnée chargée', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const s = TestBed.inject(EleveService);
      expect(() => s.modifierEleve(creerEleve({ id: 'e1', nom: 'X', prenom: 'Y' }))).not.toThrow();
    });

    it('supporte le UNDO', () => {
      const eleve = creerEleve({ id: 'e1', nom: 'MARTIN', prenom: 'Paul' });
      service.creerEleve(eleve);
      service.modifierEleve({ ...eleve, prenom: 'Pierre' });
      donneesService.annuler();
      expect(donneesService.donnees()?.classe.eleves[0].prenom).toBe('Paul');
    });
  });

  // ── supprimerEleve ────────────────────────────────────────────────────────

  describe('supprimerEleve', () => {
    it('supprime un élève existant', () => {
      service.creerEleve(creerEleve({ id: 'e1', nom: 'MARTIN', prenom: 'Paul' }));
      service.supprimerEleve('e1');
      expect(donneesService.donnees()?.classe.eleves).toHaveLength(0);
    });

    it('sans effet si id inexistant', () => {
      service.creerEleve(creerEleve({ id: 'e1', nom: 'MARTIN', prenom: 'Paul' }));
      service.supprimerEleve('inconnu');
      expect(donneesService.donnees()?.classe.eleves).toHaveLength(1);
    });

    it('sans effet si aucune donnée chargée', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const s = TestBed.inject(EleveService);
      expect(() => s.supprimerEleve('e1')).not.toThrow();
    });
  });

  // ── obtenirEleve ──────────────────────────────────────────────────────────

  describe('obtenirEleve', () => {
    it('retourne l\'élève si l\'id existe', () => {
      const eleve = creerEleve({ id: 'e1', nom: 'MARTIN', prenom: 'Paul' });
      service.creerEleve(eleve);
      expect(service.obtenirEleve('e1')?.nom).toBe('MARTIN');
    });

    it('retourne undefined si l\'id n\'existe pas', () => {
      expect(service.obtenirEleve('inconnu')).toBeUndefined();
    });
  });

  // ── rechercherEleves ──────────────────────────────────────────────────────

  describe('rechercherEleves', () => {
    beforeEach(() => {
      service.creerEleve(creerEleve({ id: 'e1', nom: 'MARTIN', prenom: 'Paul' }));
      service.creerEleve(creerEleve({ id: 'e2', nom: 'DUPONT', prenom: 'Marie' }));
      service.creerEleve(creerEleve({ id: 'e3', nom: 'ÉLIE', prenom: 'Élodie' }));
    });

    it('retourne tous les élèves triés si terme vide', () => {
      const resultats = service.rechercherEleves('');
      expect(resultats).toHaveLength(3);
      expect(resultats[0].nom).toBe('DUPONT');
      expect(resultats[1].nom).toBe('ÉLIE');
      expect(resultats[2].nom).toBe('MARTIN');
    });

    it('filtre par nom', () => {
      const resultats = service.rechercherEleves('martin');
      expect(resultats).toHaveLength(1);
      expect(resultats[0].nom).toBe('MARTIN');
    });

    it('filtre par prénom', () => {
      const resultats = service.rechercherEleves('marie');
      expect(resultats).toHaveLength(1);
      expect(resultats[0].prenom).toBe('Marie');
    });

    it('est insensible aux accents', () => {
      const resultats = service.rechercherEleves('elie');
      expect(resultats).toHaveLength(1);
      expect(resultats[0].nom).toBe('ÉLIE');
    });

    it('est insensible à la casse', () => {
      const resultats = service.rechercherEleves('DUPONT');
      expect(resultats).toHaveLength(1);
    });

    it('retourne tableau vide si aucun résultat', () => {
      expect(service.rechercherEleves('xyz')).toHaveLength(0);
    });

    it('recherche avec terme espaces seuls retourne tous les élèves', () => {
      expect(service.rechercherEleves('   ')).toHaveLength(3);
    });
  });

  // ── calculerConflitsAbsences ──────────────────────────────────────────────

  describe('calculerConflitsAbsences', () => {
    it('retourne tableau vide si aucune donnée chargée', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const s = TestBed.inject(EleveService);
      expect(s.calculerConflitsAbsences('e1', '09:00', '10:00', 'lundi')).toEqual([]);
    });

    it('retourne tableau vide si élève inconnu', () => {
      expect(service.calculerConflitsAbsences('inconnu', '09:00', '10:00', 'lundi')).toEqual([]);
    });

    it('retourne tableau vide si aucune absence récurrente', () => {
      service.creerEleve(creerEleve({ id: 'e1', nom: 'MARTIN', prenom: 'Paul' }));
      expect(service.calculerConflitsAbsences('e1', '09:00', '10:00', 'lundi')).toEqual([]);
    });

    it('détecte un conflit sur le bon jour et le bon créneau', () => {
      service.creerEleve(creerEleve({
        id: 'e1', nom: 'MARTIN', prenom: 'Paul',
        absencesRecurrentes: [{
          id: 'a1', libelle: 'Orthophonie',
          jour: 'lundi', heureDebut: '09:00', heureFin: '10:00', paritesSemaine: 'lesDeux',
        }],
      }));
      expect(service.calculerConflitsAbsences('e1', '09:30', '10:30', 'lundi')).toEqual(['Orthophonie']);
    });

    it('n\'inclut pas les absences sur un autre jour', () => {
      service.creerEleve(creerEleve({
        id: 'e1', nom: 'MARTIN', prenom: 'Paul',
        absencesRecurrentes: [{
          id: 'a1', libelle: 'Orthophonie',
          jour: 'mardi', heureDebut: '09:00', heureFin: '10:00', paritesSemaine: 'lesDeux',
        }],
      }));
      expect(service.calculerConflitsAbsences('e1', '09:00', '10:00', 'lundi')).toEqual([]);
    });

    it('n\'inclut pas les absences non chevauchantes', () => {
      service.creerEleve(creerEleve({
        id: 'e1', nom: 'MARTIN', prenom: 'Paul',
        absencesRecurrentes: [{
          id: 'a1', libelle: 'Orthophonie',
          jour: 'lundi', heureDebut: '10:00', heureFin: '11:00', paritesSemaine: 'lesDeux',
        }],
      }));
      expect(service.calculerConflitsAbsences('e1', '08:00', '10:00', 'lundi')).toEqual([]);
    });

    it('retourne plusieurs conflits', () => {
      service.creerEleve(creerEleve({
        id: 'e1', nom: 'MARTIN', prenom: 'Paul',
        absencesRecurrentes: [
          { id: 'a1', libelle: 'Ortho', jour: 'lundi', heureDebut: '09:00', heureFin: '09:30', paritesSemaine: 'lesDeux' },
          { id: 'a2', libelle: 'RASED', jour: 'lundi', heureDebut: '09:15', heureFin: '10:00', paritesSemaine: 'lesDeux' },
        ],
      }));
      const conflits = service.calculerConflitsAbsences('e1', '09:00', '10:00', 'lundi');
      expect(conflits).toHaveLength(2);
    });
  });
});
