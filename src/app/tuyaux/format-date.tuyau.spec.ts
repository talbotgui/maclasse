import { describe, it, expect, beforeEach } from 'vitest';
import { FormatDateTuyau } from './format-date.tuyau';

describe('FormatDateTuyau', () => {
  let tuyau: FormatDateTuyau;

  beforeEach(() => {
    tuyau = new FormatDateTuyau();
  });

  describe('format long (défaut)', () => {
    it('formate une date ISO en libellé long français', () => {
      expect(tuyau.transform('2026-06-15')).toBe('lundi 15 juin 2026');
    });

    it('formate correctement avec le paramètre format explicite', () => {
      expect(tuyau.transform('2026-06-15', 'long')).toBe('lundi 15 juin 2026');
    });

    it('formate un premier janvier', () => {
      expect(tuyau.transform('2026-01-01')).toBe('jeudi 1 janvier 2026');
    });
  });

  describe('format court', () => {
    it('formate une date ISO au format DD/MM/YYYY avec zéro initial', () => {
      expect(tuyau.transform('2026-06-09', 'court')).toBe('09/06/2026');
    });

    it('formate une date avec jour et mois à deux chiffres', () => {
      expect(tuyau.transform('2026-12-31', 'court')).toBe('31/12/2026');
    });

    it('formate un premier janvier en format court', () => {
      expect(tuyau.transform('2026-01-01', 'court')).toBe('01/01/2026');
    });
  });
});
