import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { EleveService } from './eleve.service';
import { DonneesService } from '../avecEtat/donnees.service';
import { DonneesMother } from '../../tests/donnees.mother';
import { EleveMother } from '../../tests/eleve.mother';

describe('EleveService', () => {
  let service: EleveService;
  let donneesService: DonneesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EleveService);
    donneesService = TestBed.inject(DonneesService);
    donneesService.charger(DonneesMother.base());
  });

  /** L'élève est ajouté à la liste et la création est réversible via UNDO. */
  describe('creerEleve', () => {
    it('ajoute l\'élève à la classe', () => {
      const eleve = EleveMother.base('e1', 'MARTIN', 'Paul');
      service.creerEleve(eleve);
      expect(donneesService.donnees()?.classe.eleves).toHaveLength(1);
      expect(donneesService.donnees()?.classe.eleves[0].id).toBe('e1');
    });

    it('supporte l\'annulation UNDO', () => {
      service.creerEleve(EleveMother.base('e1', 'MARTIN', 'Paul'));
      donneesService.annuler();
      expect(donneesService.donnees()?.classe.eleves).toHaveLength(0);
    });
  });

  /** Met à jour l'élève trouvé par son id, supporte UNDO ; sans effet si id inconnu ou données absentes. */
  describe('modifierEleve', () => {
    it('met à jour un élève existant', () => {
      const eleve = EleveMother.base('e1', 'MARTIN', 'Paul');
      service.creerEleve(eleve);
      service.modifierEleve({ ...eleve, prenom: 'Pierre' });
      expect(donneesService.donnees()?.classe.eleves[0].prenom).toBe('Pierre');
    });

    it('sans effet si id inexistant', () => {
      service.modifierEleve(EleveMother.base('inconnu', 'X', 'Y'));
      expect(donneesService.donnees()?.classe.eleves).toHaveLength(0);
    });

    it('sans effet si aucune donnée chargée', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const s = TestBed.inject(EleveService);
      expect(() => s.modifierEleve(EleveMother.base('e1', 'X', 'Y'))).not.toThrow();
    });

    it('supporte le UNDO', () => {
      const eleve = EleveMother.base('e1', 'MARTIN', 'Paul');
      service.creerEleve(eleve);
      service.modifierEleve({ ...eleve, prenom: 'Pierre' });
      donneesService.annuler();
      expect(donneesService.donnees()?.classe.eleves[0].prenom).toBe('Paul');
    });
  });

  /** Retire l'élève par son id ; sans effet si id inconnu ou données absentes. */
  describe('supprimerEleve', () => {
    it('supprime un élève existant', () => {
      service.creerEleve(EleveMother.base('e1', 'MARTIN', 'Paul'));
      service.supprimerEleve('e1');
      expect(donneesService.donnees()?.classe.eleves).toHaveLength(0);
    });

    it('sans effet si id inexistant', () => {
      service.creerEleve(EleveMother.base('e1', 'MARTIN', 'Paul'));
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

  /** Retourne l'élève si l'id existe, undefined sinon. */
  describe('obtenirEleve', () => {
    it('retourne l\'élève si l\'id existe', () => {
      const eleve = EleveMother.base('e1', 'MARTIN', 'Paul');
      service.creerEleve(eleve);
      expect(service.obtenirEleve('e1')?.nom).toBe('MARTIN');
    });

    it('retourne undefined si l\'id n\'existe pas', () => {
      expect(service.obtenirEleve('inconnu')).toBeUndefined();
    });
  });

  /** Retourne les élèves triés NOM Prénom, filtrés par terme insensible à la casse et aux accents. */
  describe('rechercherEleves', () => {
    beforeEach(() => {
      service.creerEleve(EleveMother.base('e1', 'MARTIN', 'Paul'));
      service.creerEleve(EleveMother.base('e2', 'DUPONT', 'Marie'));
      service.creerEleve(EleveMother.base('e3', 'ÉLIE', 'Élodie'));
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

  /** Retourne les libellés des absences récurrentes chevauchant le créneau sur le jour donné. */
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
      service.creerEleve(EleveMother.base('e1', 'MARTIN', 'Paul'));
      expect(service.calculerConflitsAbsences('e1', '09:00', '10:00', 'lundi')).toEqual([]);
    });

    it('détecte un conflit sur le bon jour et le bon créneau', () => {
      service.creerEleve(EleveMother.base('e1', 'MARTIN', 'Paul', {
        absencesRecurrentes: [{
          id: 'a1', libelle: 'Orthophonie',
          jour: 'lundi', heureDebut: '09:00', heureFin: '10:00', paritesSemaine: 'lesDeux',
        }],
      }));
      expect(service.calculerConflitsAbsences('e1', '09:30', '10:30', 'lundi')).toEqual(['Orthophonie']);
    });

    it('n\'inclut pas les absences sur un autre jour', () => {
      service.creerEleve(EleveMother.base('e1', 'MARTIN', 'Paul', {
        absencesRecurrentes: [{
          id: 'a1', libelle: 'Orthophonie',
          jour: 'mardi', heureDebut: '09:00', heureFin: '10:00', paritesSemaine: 'lesDeux',
        }],
      }));
      expect(service.calculerConflitsAbsences('e1', '09:00', '10:00', 'lundi')).toEqual([]);
    });

    it('n\'inclut pas les absences non chevauchantes', () => {
      service.creerEleve(EleveMother.base('e1', 'MARTIN', 'Paul', {
        absencesRecurrentes: [{
          id: 'a1', libelle: 'Orthophonie',
          jour: 'lundi', heureDebut: '10:00', heureFin: '11:00', paritesSemaine: 'lesDeux',
        }],
      }));
      expect(service.calculerConflitsAbsences('e1', '08:00', '10:00', 'lundi')).toEqual([]);
    });

    it('retourne plusieurs conflits', () => {
      service.creerEleve(EleveMother.base('e1', 'MARTIN', 'Paul', {
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
