import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SauvegardeAutoService } from './sauvegarde-auto.service';
import { DonneesService } from '../avecEtat/donnees.service';
import { ContexteService } from '../avecEtat/contexte.service';
import { DonneesApplication } from '../../modeles/donnees-application.modele';

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

beforeAll(() => {
  // Polyfill pour les environnements de test sans URL.createObjectURL (jsdom).
  if (typeof URL.createObjectURL !== 'function') {
    URL.createObjectURL = (_blob: Blob) => 'blob:fake-url-for-tests';
    URL.revokeObjectURL = (_url: string) => {};
  }
});

describe('SauvegardeAutoService', () => {
  let service: SauvegardeAutoService;
  let donneesService: DonneesService;
  let contexteService: ContexteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SauvegardeAutoService);
    donneesService = TestBed.inject(DonneesService);
    contexteService = TestBed.inject(ContexteService);
    service.arreter();
    service.dateDerniereSauvegarde.set(null);
  });

  // ── sauvegarder ───────────────────────────────────────────────────────────

  describe('sauvegarder', () => {
    it('sans effet si aucune donnée chargée', async () => {
      contexteService.motDePasse = 'mdp';
      await service.sauvegarder();
      expect(service.dateDerniereSauvegarde()).toBeNull();
    });

    it('sans effet si aucun mot de passe défini', async () => {
      donneesService.charger(creerDonneesVides());
      contexteService.motDePasse = null;
      await service.sauvegarder();
      expect(service.dateDerniereSauvegarde()).toBeNull();
    });

    it('met à jour dateDerniereSauvegarde après une sauvegarde réussie', async () => {
      donneesService.charger(creerDonneesVides());
      contexteService.motDePasse = 'mdpTest123';
      await service.sauvegarder();
      expect(service.dateDerniereSauvegarde()).not.toBeNull();
    });

    it('marque les données comme sauvegardées après une sauvegarde réussie', async () => {
      const d = creerDonneesVides();
      donneesService.charger(d);
      contexteService.motDePasse = 'mdpTest123';
      // Simuler une modification pour que aDonneesModifiees soit true
      // (la sauvegarde doit le remettre à false)
      await service.sauvegarder();
      expect(donneesService.aDonneesModifiees()).toBe(false);
    });

    it('dateDerniereSauvegarde est une Date récente', async () => {
      donneesService.charger(creerDonneesVides());
      contexteService.motDePasse = 'mdpTest123';
      const avant = new Date();
      await service.sauvegarder();
      const apres = new Date();
      const date = service.dateDerniereSauvegarde()!;
      expect(date.getTime()).toBeGreaterThanOrEqual(avant.getTime());
      expect(date.getTime()).toBeLessThanOrEqual(apres.getTime());
    });
  });

  // ── demarrer / arreter ────────────────────────────────────────────────────

  describe('demarrer', () => {
    it('active le timer', () => {
      donneesService.charger(creerDonneesVides());
      service.demarrer();
      expect(service.timerActif).toBe(true);
      service.arreter();
    });

    it('remplace un timer déjà actif', () => {
      donneesService.charger(creerDonneesVides());
      service.demarrer();
      service.demarrer();
      expect(service.timerActif).toBe(true);
      service.arreter();
    });

    it('démarre même sans données chargées', () => {
      expect(() => service.demarrer()).not.toThrow();
      expect(service.timerActif).toBe(true);
      service.arreter();
    });
  });

  describe('arreter', () => {
    it('désactive le timer', () => {
      donneesService.charger(creerDonneesVides());
      service.demarrer();
      service.arreter();
      expect(service.timerActif).toBe(false);
    });

    it('sans effet si aucun timer actif', () => {
      expect(() => service.arreter()).not.toThrow();
      expect(service.timerActif).toBe(false);
    });
  });
});
