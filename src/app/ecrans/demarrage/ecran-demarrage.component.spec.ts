import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { EcranDemarrageComponent } from './ecran-demarrage.component';
import { DonneesService } from '../../services/avecEtat/donnees.service';
import { ContexteService } from '../../services/avecEtat/contexte.service';
import { DonneesMother } from '../../tests/donnees.mother';
import type { DonneesApplication } from '../../modeles/donnees-application.modele';

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

describe('EcranDemarrageComponent', () => {
  let fixture: ComponentFixture<EcranDemarrageComponent>;
  let component: EcranDemarrageComponent;
  let donneesService: DonneesService;
  let contexteService: ContexteService;
  let router: Router;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
    donneesService = TestBed.inject(DonneesService);
    contexteService = TestBed.inject(ContexteService);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(EcranDemarrageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('surDemarrageTermine', () => {
    it('charge les données dans le service', async () => {
      const donnees: DonneesApplication = DonneesMother.base();
      const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      await (component as any).surDemarrageTermine(donnees);

      expect(donneesService.donnees()?.version).toBe('1.0');
      spy.mockRestore();
    });

    it('navigue vers /accueil après chargement', async () => {
      const donnees: DonneesApplication = DonneesMother.base();
      const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      await (component as any).surDemarrageTermine(donnees);

      expect(spy).toHaveBeenCalledWith(['/accueil']);
      spy.mockRestore();
    });

    it('désactive le mode consultation référentiel s\'il était actif', async () => {
      contexteService.modeConsultationReferentiel.set(true);
      const donnees: DonneesApplication = DonneesMother.base();
      const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      await (component as any).surDemarrageTermine(donnees);

      expect(contexteService.modeConsultationReferentiel()).toBe(false);
      spy.mockRestore();
    });
  });

  describe('surReferentielDemande', () => {
    it('charge les données dans le service', async () => {
      const donnees: DonneesApplication = DonneesMother.base();
      const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      await (component as any).surReferentielDemande(donnees);

      expect(donneesService.donnees()?.version).toBe('1.0');
      spy.mockRestore();
    });

    it('active le mode consultation référentiel', async () => {
      const donnees: DonneesApplication = DonneesMother.base();
      const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      await (component as any).surReferentielDemande(donnees);

      expect(contexteService.modeConsultationReferentiel()).toBe(true);
      spy.mockRestore();
    });

    it('navigue vers /competences après chargement', async () => {
      const donnees: DonneesApplication = DonneesMother.base();
      const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      await (component as any).surReferentielDemande(donnees);

      expect(spy).toHaveBeenCalledWith(['/competences']);
      spy.mockRestore();
    });
  });

  describe('rendu', () => {
    it('contient le composant popin-demarrage', () => {
      const popin = fixture.nativeElement.querySelector('popin-demarrage');
      expect(popin).not.toBeNull();
    });
  });
});
