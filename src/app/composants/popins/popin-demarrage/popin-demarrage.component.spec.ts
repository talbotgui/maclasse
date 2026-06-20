import { describe, it, expect, beforeEach, beforeAll, afterEach, vi } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { PopinDemarrageComponent } from './popin-demarrage.component';
import { DonneesMother } from '../../../tests/donnees.mother';
import type { DonneesApplication } from '../../../modeles/donnees-application.modele';

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

describe('PopinDemarrageComponent', () => {
  let fixture: ComponentFixture<PopinDemarrageComponent>;
  let component: PopinDemarrageComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(PopinDemarrageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('creer()', () => {
    it('fetch réussi → émet demarrageTermine avec les données', async () => {
      const donnees: DonneesApplication = DonneesMother.base();
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(donnees),
      }));
      const emis: DonneesApplication[] = [];
      (component as any).demarrageTermine.subscribe((d: DonneesApplication) => emis.push(d));

      await component['creer']();

      expect(emis).toHaveLength(1);
      expect(emis[0].version).toBe('1.0');
    });

    it('fetch réussi → enChargement repasse à false', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(DonneesMother.base()),
      }));

      await component['creer']();

      expect((component as any).enChargement()).toBe(false);
    });

    it('fetch ok=false → affiche une erreur', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

      await component['creer']();

      expect((component as any).erreur()).toBeTruthy();
      expect((component as any).enChargement()).toBe(false);
    });

    it('erreur réseau → affiche une erreur', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('réseau')));

      await component['creer']();

      expect((component as any).erreur()).toBeTruthy();
    });

    it('appel pendant enChargement → ignoré', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(DonneesMother.base()) }));
      const emis: DonneesApplication[] = [];
      (component as any).demarrageTermine.subscribe((d: DonneesApplication) => emis.push(d));
      (component as any).enChargement.set(true);

      await component['creer']();

      expect(emis).toHaveLength(0);
    });
  });

  describe('charger()', () => {
    const fichierZip = new File(['contenu'], 'donnees.zip', { type: 'application/zip' });

    it('sans fichier sélectionné → ne fait rien', async () => {
      (component as any).fichierSelectionne = null;
      (component as any).motDePasse.set('secret');
      const emis: DonneesApplication[] = [];
      (component as any).demarrageTermine.subscribe((d: DonneesApplication) => emis.push(d));

      await component['charger']();

      expect(emis).toHaveLength(0);
    });

    it('sans mot de passe → ne fait rien', async () => {
      (component as any).fichierSelectionne = fichierZip;
      (component as any).motDePasse.set('');
      const emis: DonneesApplication[] = [];
      (component as any).demarrageTermine.subscribe((d: DonneesApplication) => emis.push(d));

      await component['charger']();

      expect(emis).toHaveLength(0);
    });

    it('succès → émet demarrageTermine', async () => {
      const donnees = DonneesMother.base();
      const { ChiffrementService } = await import('../../../services/sansEtat/chiffrement.service');
      const chiffrementService = TestBed.inject(ChiffrementService);
      vi.spyOn(chiffrementService, 'dechiffrer').mockResolvedValue(donnees);

      (component as any).fichierSelectionne = fichierZip;
      (component as any).motDePasse.set('secret');
      const emis: DonneesApplication[] = [];
      (component as any).demarrageTermine.subscribe((d: DonneesApplication) => emis.push(d));

      await component['charger']();

      expect(emis).toHaveLength(1);
    });

    it('DOMException → affiche erreur mot de passe', async () => {
      const { ChiffrementService } = await import('../../../services/sansEtat/chiffrement.service');
      const chiffrementService = TestBed.inject(ChiffrementService);
      vi.spyOn(chiffrementService, 'dechiffrer').mockRejectedValue(new DOMException('decrypt'));

      (component as any).fichierSelectionne = fichierZip;
      (component as any).motDePasse.set('mauvais');

      await component['charger']();

      const erreur = (component as any).erreur() as string;
      expect(erreur).toBeTruthy();
    });

    it('autre erreur → affiche erreur fichier', async () => {
      const { ChiffrementService } = await import('../../../services/sansEtat/chiffrement.service');
      const chiffrementService = TestBed.inject(ChiffrementService);
      vi.spyOn(chiffrementService, 'dechiffrer').mockRejectedValue(new Error('corrompu'));

      (component as any).fichierSelectionne = fichierZip;
      (component as any).motDePasse.set('secret');

      await component['charger']();

      expect((component as any).erreur()).toBeTruthy();
      expect((component as any).enChargement()).toBe(false);
    });
  });

  describe('peutCharger', () => {
    it('false si pas de fichier', () => {
      (component as any).fichierSelectionne = null;
      (component as any).motDePasse.set('secret');

      expect(component['peutCharger']).toBe(false);
    });

    it('false si motDePasse vide', () => {
      (component as any).fichierSelectionne = new File(['x'], 'f.zip');
      (component as any).motDePasse.set('');

      expect(component['peutCharger']).toBe(false);
    });

    it('false si enChargement=true', () => {
      (component as any).fichierSelectionne = new File(['x'], 'f.zip');
      (component as any).motDePasse.set('secret');
      (component as any).enChargement.set(true);

      expect(component['peutCharger']).toBe(false);
    });

    it('true si fichier + mdp + pas en chargement', () => {
      (component as any).fichierSelectionne = new File(['x'], 'f.zip');
      (component as any).motDePasse.set('secret');
      (component as any).enChargement.set(false);

      expect(component['peutCharger']).toBe(true);
    });
  });
});
