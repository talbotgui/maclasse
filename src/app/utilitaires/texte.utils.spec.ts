import { describe, it, expect } from 'vitest';
import { TexteUtils } from './texte.utils';

describe('TexteUtils', () => {
  describe('normalisation pour la recherche', () => {
    it('retire les accents et passe en minuscules', () => {
      expect(TexteUtils.normaliserPourRecherche('Élève ÉCOLE')).toBe('eleve ecole');
    });
  });

  describe("normalisation d'un identifiant", () => {
    it('passe en minuscules', () => {
      expect(TexteUtils.normaliserIdentifiant('DC')).toBe('dc');
    });

    it('retire les espaces en bordure, pas ceux du milieu', () => {
      expect(TexteUtils.normaliserIdentifiant('  D C ')).toBe('d c');
    });

    it('conserve les accents', () => {
      expect(TexteUtils.normaliserIdentifiant('É')).toBe('é');
    });

    it('identifiant blanc → chaîne vide', () => {
      expect(TexteUtils.normaliserIdentifiant('   ')).toBe('');
    });
  });
});
