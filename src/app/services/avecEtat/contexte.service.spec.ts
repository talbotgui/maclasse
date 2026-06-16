import { describe, it, expect, beforeEach } from 'vitest';
import { ContexteService } from './contexte.service';

describe('ContexteService', () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset['theme'];
  });

  describe('initialisation', () => {
    it('thème par défaut si localStorage vide', () => {
      const service = new ContexteService();
      expect(service.themeActif()).toBe('defaut');
    });

    it('thème lu depuis localStorage si présent', () => {
      localStorage.setItem('mc_theme', 'foret');
      const service = new ContexteService();
      expect(service.themeActif()).toBe('foret');
    });

    it('eleveSelectionne initialement null', () => {
      const service = new ContexteService();
      expect(service.eleveSelectionne()).toBeNull();
    });

    it('jourCourantCahierJournal initialement null', () => {
      const service = new ContexteService();
      expect(service.jourCourantCahierJournal()).toBeNull();
    });

    it('panierCompetences initialement vide', () => {
      const service = new ContexteService();
      expect(service.panierCompetences()).toEqual([]);
    });

    it('motDePasse initialement null', () => {
      const service = new ContexteService();
      expect(service.motDePasse).toBeNull();
    });
  });

  describe('appliquerTheme', () => {
    it('définit data-theme sur <html> pour un thème non défaut', () => {
      const service = new ContexteService();
      service.appliquerTheme('contraste');
      expect(document.documentElement.dataset['theme']).toBe('contraste');
    });

    it('supprime data-theme sur <html> pour le thème defaut', () => {
      const service = new ContexteService();
      document.documentElement.dataset['theme'] = 'contraste';
      service.appliquerTheme('defaut');
      expect(document.documentElement.dataset['theme']).toBeUndefined();
    });
  });

  describe('basculerTheme', () => {
    it('cycle : defaut → foret → crepuscule → terre → contraste → defaut', () => {
      const service = new ContexteService();
      const sequence = ['foret', 'crepuscule', 'terre', 'contraste', 'defaut'];
      for (const attendu of sequence) {
        service.basculerTheme();
        expect(service.themeActif()).toBe(attendu);
      }
    });

    it('persiste le nouveau thème dans localStorage', () => {
      const service = new ContexteService();
      service.basculerTheme();
      expect(localStorage.getItem('mc_theme')).toBe('foret');
    });

    it('applique le thème au document', () => {
      const service = new ContexteService();
      service.basculerTheme();
      expect(document.documentElement.dataset['theme']).toBe('foret');
    });
  });

  describe('mutations des signaux', () => {
    it('eleveSelectionne peut être modifié', () => {
      const service = new ContexteService();
      service.eleveSelectionne.set('eleve-42');
      expect(service.eleveSelectionne()).toBe('eleve-42');
    });

    it('panierCompetences peut être modifié', () => {
      const service = new ContexteService();
      service.panierCompetences.set(['comp-1', 'comp-2']);
      expect(service.panierCompetences()).toHaveLength(2);
    });

    it('motDePasse peut être modifié', () => {
      const service = new ContexteService();
      service.motDePasse = 'secret';
      expect(service.motDePasse).toBe('secret');
    });
  });
});
