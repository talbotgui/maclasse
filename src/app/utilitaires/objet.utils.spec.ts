import { describe, it, expect } from 'vitest';
import { ObjetUtils } from './objet.utils';

describe('ObjetUtils', () => {
  describe('sontEgaux', () => {
    it('retourne true pour deux primitives identiques', () => {
      expect(ObjetUtils.sontEgaux(1, 1)).toBe(true);
      expect(ObjetUtils.sontEgaux('a', 'a')).toBe(true);
      expect(ObjetUtils.sontEgaux(true, true)).toBe(true);
    });

    it('retourne false pour deux primitives différentes', () => {
      expect(ObjetUtils.sontEgaux(1, 2)).toBe(false);
      expect(ObjetUtils.sontEgaux('a', 'b')).toBe(false);
    });

    it('retourne false pour des types différents', () => {
      expect(ObjetUtils.sontEgaux(1, '1')).toBe(false);
      expect(ObjetUtils.sontEgaux(0, false)).toBe(false);
    });

    it('gère null face à un objet', () => {
      expect(ObjetUtils.sontEgaux(null, {})).toBe(false);
      expect(ObjetUtils.sontEgaux({}, null)).toBe(false);
      expect(ObjetUtils.sontEgaux(null, null)).toBe(true);
    });

    it('retourne true pour deux objets plats identiques', () => {
      expect(ObjetUtils.sontEgaux({ id: 'a', libelle: 'A' }, { id: 'a', libelle: 'A' })).toBe(true);
    });

    it('ignore l ordre des clés', () => {
      expect(ObjetUtils.sontEgaux({ id: 'a', libelle: 'A' }, { libelle: 'A', id: 'a' })).toBe(true);
    });

    it('retourne false si une valeur diffère', () => {
      expect(ObjetUtils.sontEgaux({ id: 'a', libelle: 'A' }, { id: 'a', libelle: 'B' })).toBe(
        false,
      );
    });

    it('retourne false si le nombre de clés diffère', () => {
      expect(ObjetUtils.sontEgaux({ id: 'a' }, { id: 'a', libelle: 'A' })).toBe(false);
      expect(ObjetUtils.sontEgaux({ id: 'a', libelle: 'A' }, { id: 'a' })).toBe(false);
    });

    it('compare les objets imbriqués en profondeur', () => {
      expect(
        ObjetUtils.sontEgaux(
          { id: 'a', meta: { couleur: '#000', actif: true } },
          { id: 'a', meta: { couleur: '#000', actif: true } },
        ),
      ).toBe(true);
      expect(
        ObjetUtils.sontEgaux(
          { id: 'a', meta: { couleur: '#000', actif: true } },
          { id: 'a', meta: { couleur: '#fff', actif: true } },
        ),
      ).toBe(false);
    });

    it('compare les tableaux par index', () => {
      expect(ObjetUtils.sontEgaux(['lundi', 'mardi'], ['lundi', 'mardi'])).toBe(true);
      expect(ObjetUtils.sontEgaux(['lundi', 'mardi'], ['mardi', 'lundi'])).toBe(false);
      expect(ObjetUtils.sontEgaux(['lundi'], ['lundi', 'mardi'])).toBe(false);
    });

    it('retourne false entre un tableau et un objet', () => {
      expect(ObjetUtils.sontEgaux([], {})).toBe(false);
    });

    it('compare des tableaux d objets', () => {
      expect(ObjetUtils.sontEgaux([{ id: 'a', libelle: 'A' }], [{ id: 'a', libelle: 'A' }])).toBe(
        true,
      );
    });

    it('considère NaN égal à NaN', () => {
      expect(ObjetUtils.sontEgaux(NaN, NaN)).toBe(true);
      expect(ObjetUtils.sontEgaux({ x: NaN }, { x: NaN })).toBe(true);
      expect(ObjetUtils.sontEgaux(NaN, 1)).toBe(false);
    });

    it('compare deux Date par leur valeur temporelle', () => {
      expect(ObjetUtils.sontEgaux(new Date('2026-09-02'), new Date('2026-09-02'))).toBe(true);
      expect(ObjetUtils.sontEgaux(new Date('2026-09-02'), new Date('2026-09-03'))).toBe(false);
      expect(ObjetUtils.sontEgaux(new Date('2026-09-02'), {})).toBe(false);
    });

    it('distingue une clé absente d une clé valant undefined', () => {
      expect(ObjetUtils.sontEgaux({ a: undefined, b: 1 }, { b: 1, c: undefined })).toBe(false);
      expect(ObjetUtils.sontEgaux({ a: undefined }, { a: undefined })).toBe(true);
    });
  });
});
