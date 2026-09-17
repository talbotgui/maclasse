import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SauvegardeAutoService } from './sauvegarde-auto.service';
import { DonneesService } from '../avecEtat/donnees.service';
import { ContexteService } from '../avecEtat/contexte.service';
import { DonneesMother } from '../../tests/donnees.mother';
import { CommandeRemplacement } from '../../commandes/commande-par-index';

/** Référence réelle capturée avant tout `vi.useFakeTimers()`, pour franchir un vrai macro-tick. */
const setTimeoutReel = globalThis.setTimeout;

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

  /** Déclenche le chiffrement et le téléchargement, met à jour la date et marque les données sauvegardées. */
  describe('sauvegarder', () => {
    it('sans effet si aucune donnée chargée', async () => {
      contexteService.motDePasse = 'mdp';
      await service.sauvegarder();
      expect(service.dateDerniereSauvegarde()).toBeNull();
    });

    it('sans effet si aucun mot de passe défini', async () => {
      donneesService.charger(DonneesMother.base());
      contexteService.motDePasse = null;
      await service.sauvegarder();
      expect(service.dateDerniereSauvegarde()).toBeNull();
    });

    it('met à jour dateDerniereSauvegarde après une sauvegarde réussie', async () => {
      donneesService.charger(DonneesMother.base());
      contexteService.motDePasse = 'mdpTest123';
      await service.sauvegarder();
      expect(service.dateDerniereSauvegarde()).not.toBeNull();
    });

    it('marque les données comme sauvegardées après une sauvegarde réussie', async () => {
      const d = DonneesMother.base();
      donneesService.charger(d);
      contexteService.motDePasse = 'mdpTest123';
      // Simuler une modification pour que aDonneesModifiees soit true
      // (la sauvegarde doit le remettre à false)
      await service.sauvegarder();
      expect(donneesService.aDonneesModifiees()).toBe(false);
    });

    it('dateDerniereSauvegarde est une Date récente', async () => {
      donneesService.charger(DonneesMother.base());
      contexteService.motDePasse = 'mdpTest123';
      const avant = new Date();
      await service.sauvegarder();
      const apres = new Date();
      const date = service.dateDerniereSauvegarde()!;
      expect(date.getTime()).toBeGreaterThanOrEqual(avant.getTime());
      expect(date.getTime()).toBeLessThanOrEqual(apres.getTime());
    });
  });

  /** Active le minuteur périodique de sauvegarde ; réinitialise s'il est déjà actif. */
  describe('demarrer', () => {
    it('active le timer', () => {
      donneesService.charger(DonneesMother.base());
      service.demarrer();
      expect(service.timerActif).toBe(true);
      service.arreter();
    });

    it('remplace un timer déjà actif', () => {
      donneesService.charger(DonneesMother.base());
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

  /** Stoppe le timer actif et remet timerActif à false ; sans effet si aucun timer n'est actif. */
  describe('arreter', () => {
    it('désactive le timer', () => {
      donneesService.charger(DonneesMother.base());
      service.demarrer();
      service.arreter();
      expect(service.timerActif).toBe(false);
    });

    it('sans effet si aucun timer actif', () => {
      expect(() => service.arreter()).not.toThrow();
      expect(service.timerActif).toBe(false);
    });
  });

  /**
   * Laisse le chiffrement AES-GCM (asynchrone, réel, non mocké) se résoudre : le tick du
   * minuteur déclenche `sauvegarderSiModifie()` en fire-and-forget, dont la promesse n'est
   * pas suivie par `advanceTimersByTimeAsync`. On boucle sur `setTimeoutReel` — la référence
   * à `globalThis.setTimeout` capturée avant `vi.useFakeTimers()` — pour rendre la main à la
   * vraie boucle d'évènements sur plusieurs tours réels, le temps que l'opération se termine.
   */
  const laisserChiffrementSeResoudre = async () => {
    for (let i = 0; i < 10; i++) {
      await new Promise<void>((resolve) => setTimeoutReel(resolve, 5));
    }
  };

  /** Le tick du minuteur ne sauvegarde que si des données sont en attente de sauvegarde. */
  describe('tick automatique (sauvegarderSiModifie)', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      service.arreter();
      vi.useRealTimers();
    });

    it('ne sauvegarde pas si aucune modification en attente', async () => {
      const d = DonneesMother.base({ configuration: { delaiSauvegardeAutoMinutes: 1 } });
      donneesService.charger(d);
      contexteService.motDePasse = 'mdpTest123';
      service.demarrer();

      await vi.advanceTimersByTimeAsync(60_000);

      expect(service.dateDerniereSauvegarde()).toBeNull();
    });

    it('sauvegarde et remet aDonneesModifiees à false si une modification est en attente', async () => {
      const d = DonneesMother.base({ configuration: { delaiSauvegardeAutoMinutes: 1 } });
      donneesService.charger(d);
      contexteService.motDePasse = 'mdpTest123';
      donneesService.executer(
        new CommandeRemplacement<string>(
          (data, v) => {
            data.enseignant.prenom = v;
          },
          d.enseignant.prenom,
          'Nouveau prénom',
          'Test',
        ),
      );
      service.demarrer();

      await vi.advanceTimersByTimeAsync(60_000);
      await laisserChiffrementSeResoudre();

      expect(service.dateDerniereSauvegarde()).not.toBeNull();
      expect(donneesService.aDonneesModifiees()).toBe(false);
    });

    it('ne sauvegarde pas une seconde fois si aucune nouvelle modification', async () => {
      const d = DonneesMother.base({ configuration: { delaiSauvegardeAutoMinutes: 1 } });
      donneesService.charger(d);
      contexteService.motDePasse = 'mdpTest123';
      donneesService.executer(
        new CommandeRemplacement<string>(
          (data, v) => {
            data.enseignant.prenom = v;
          },
          d.enseignant.prenom,
          'Nouveau prénom',
          'Test',
        ),
      );
      service.demarrer();

      await vi.advanceTimersByTimeAsync(60_000);
      await laisserChiffrementSeResoudre();
      const dateApresPremierTick = service.dateDerniereSauvegarde();

      await vi.advanceTimersByTimeAsync(60_000);
      await laisserChiffrementSeResoudre();

      expect(service.dateDerniereSauvegarde()).toBe(dateApresPremierTick);
    });
  });
});
