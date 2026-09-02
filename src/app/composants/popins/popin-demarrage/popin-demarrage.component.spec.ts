import { describe, it, expect, beforeEach, beforeAll, afterEach, vi } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { PopinDemarrageComponent } from './popin-demarrage.component';
import { DonneesMother } from '../../../tests/donnees.mother';
import { LIBELLES } from '../../../libelles';
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
    it('fetch réussi → émet creationDemandee avec les données', async () => {
      const donnees: DonneesApplication = DonneesMother.base();
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(donnees),
        }),
      );
      const spy = vi.spyOn((component as any).creationDemandee, 'emit');

      await component['creer']();

      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ version: '1.0' }));
    });

    it('fetch réussi → n’émet pas demarrageTermine (réservé à l’import)', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(DonneesMother.base()),
        }),
      );
      const spy = vi.spyOn((component as any).demarrageTermine, 'emit');

      await component['creer']();

      expect(spy).not.toHaveBeenCalled();
    });

    it('fetch réussi → enChargement repasse à false', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(DonneesMother.base()),
        }),
      );

      await component['creer']();

      expect((component as any).enChargement()).toBe(false);
    });

    it('fetch ok=false → affiche une erreur', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

      await component['creer']();

      expect((component as any).erreur()).toBe(LIBELLES.demarrage.erreurFichier);
      expect((component as any).enChargement()).toBe(false);
    });

    it('erreur réseau → affiche une erreur', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('réseau')));

      await component['creer']();

      expect((component as any).erreur()).toBe(LIBELLES.demarrage.erreurFichier);
    });

    it('appel pendant enChargement → ignoré', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(DonneesMother.base()) }),
      );
      const spy = vi.spyOn((component as any).creationDemandee, 'emit');
      (component as any).enChargement.set(true);

      await component['creer']();

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('charger()', () => {
    const fichierZip = new File(['contenu'], 'donnees.zip', { type: 'application/zip' });

    it('sans fichier sélectionné → ne fait rien', async () => {
      (component as any).fichierSelectionne.set(null);
      (component as any).motDePasse.set('secret');
      const spy = vi.spyOn((component as any).demarrageTermine, 'emit');

      await component['charger']();

      expect(spy).not.toHaveBeenCalled();
    });

    it('sans mot de passe → ne fait rien', async () => {
      (component as any).fichierSelectionne.set(fichierZip);
      (component as any).motDePasse.set('');
      const spy = vi.spyOn((component as any).demarrageTermine, 'emit');

      await component['charger']();

      expect(spy).not.toHaveBeenCalled();
    });

    it('succès → émet demarrageTermine', async () => {
      const donnees = DonneesMother.base();
      const { ChiffrementService } = await import('../../../services/sansEtat/chiffrement.service');
      const chiffrementService = TestBed.inject(ChiffrementService);
      vi.spyOn(chiffrementService, 'dechiffrer').mockResolvedValue(donnees);

      (component as any).fichierSelectionne.set(fichierZip);
      (component as any).motDePasse.set('secret');
      const spy = vi.spyOn((component as any).demarrageTermine, 'emit');

      await component['charger']();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('DOMException → affiche erreur mot de passe', async () => {
      const { ChiffrementService } = await import('../../../services/sansEtat/chiffrement.service');
      const chiffrementService = TestBed.inject(ChiffrementService);
      vi.spyOn(chiffrementService, 'dechiffrer').mockRejectedValue(new DOMException('decrypt'));

      (component as any).fichierSelectionne.set(fichierZip);
      (component as any).motDePasse.set('mauvais');

      await component['charger']();

      expect((component as any).erreur()).toBe(LIBELLES.demarrage.erreurMotDePasse);
    });

    it('autre erreur → affiche erreur fichier', async () => {
      const { ChiffrementService } = await import('../../../services/sansEtat/chiffrement.service');
      const chiffrementService = TestBed.inject(ChiffrementService);
      vi.spyOn(chiffrementService, 'dechiffrer').mockRejectedValue(new Error('corrompu'));

      (component as any).fichierSelectionne.set(fichierZip);
      (component as any).motDePasse.set('secret');

      await component['charger']();

      expect((component as any).erreur()).toBe(LIBELLES.demarrage.erreurFichier);
      expect((component as any).enChargement()).toBe(false);
    });
  });

  describe('accederReferentiel()', () => {
    it('fetch réussi → émet referentielDemande avec les données', async () => {
      const donnees: DonneesApplication = DonneesMother.base();
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(donnees),
        }),
      );
      const spy = vi.spyOn((component as any).referentielDemande, 'emit');

      await component['accederReferentiel']();

      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ version: '1.0' }));
    });

    it('fetch réussi → enChargement repasse à false', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(DonneesMother.base()),
        }),
      );

      await component['accederReferentiel']();

      expect((component as any).enChargement()).toBe(false);
    });

    it('fetch ok=false → affiche une erreur', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

      await component['accederReferentiel']();

      expect((component as any).erreur()).toBe(LIBELLES.demarrage.erreurFichier);
      expect((component as any).enChargement()).toBe(false);
    });

    it('erreur réseau → affiche une erreur', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('réseau')));

      await component['accederReferentiel']();

      expect((component as any).erreur()).toBe(LIBELLES.demarrage.erreurFichier);
    });

    it('appel pendant enChargement → ignoré', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(DonneesMother.base()) }),
      );
      const spy = vi.spyOn((component as any).referentielDemande, 'emit');
      (component as any).enChargement.set(true);

      await component['accederReferentiel']();

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('peutCharger', () => {
    it('false si pas de fichier', () => {
      (component as any).fichierSelectionne.set(null);
      (component as any).motDePasse.set('secret');

      expect(component['peutCharger']).toBe(false);
    });

    it('false si motDePasse vide', () => {
      (component as any).fichierSelectionne.set(new File(['x'], 'f.zip'));
      (component as any).motDePasse.set('');

      expect(component['peutCharger']).toBe(false);
    });

    it('false si enChargement=true', () => {
      (component as any).fichierSelectionne.set(new File(['x'], 'f.zip'));
      (component as any).motDePasse.set('secret');
      (component as any).enChargement.set(true);

      expect(component['peutCharger']).toBe(false);
    });

    it('true si fichier + mdp + pas en chargement', () => {
      (component as any).fichierSelectionne.set(new File(['x'], 'f.zip'));
      (component as any).motDePasse.set('secret');
      (component as any).enChargement.set(false);

      expect(component['peutCharger']).toBe(true);
    });
  });

  describe('délégation des outputs', () => {
    it('onCreationDemandee émet creationDemandee avec les données', () => {
      const donnees = DonneesMother.base();
      const spy = vi.spyOn((component as any).creationDemandee, 'emit');

      (component as any).onCreationDemandee(donnees);

      expect(spy).toHaveBeenCalledWith(donnees);
    });

    it('onDemarrageTermine émet demarrageTermine avec les données', () => {
      const donnees = DonneesMother.base();
      const spy = vi.spyOn((component as any).demarrageTermine, 'emit');

      (component as any).onDemarrageTermine(donnees);

      expect(spy).toHaveBeenCalledWith(donnees);
    });

    it('onReferentielDemande émet referentielDemande avec les données', () => {
      const donnees = DonneesMother.base();
      const spy = vi.spyOn((component as any).referentielDemande, 'emit');

      (component as any).onReferentielDemande(donnees);

      expect(spy).toHaveBeenCalledWith(donnees);
    });
  });
});
