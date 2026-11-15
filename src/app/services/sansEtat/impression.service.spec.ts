import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ImpressionService } from './impression.service';
import { LIBELLES } from '../../libelles';
import { DateUtils } from '../../utilitaires/date.utils';

describe('ImpressionService', () => {
  let service: ImpressionService;

  beforeEach(() => {
    service = new ImpressionService();
  });

  afterEach(() => {
    document.documentElement.style.removeProperty(ImpressionService.VARIABLE_ENTETE);
    document.documentElement.style.removeProperty(ImpressionService.VARIABLE_DATE);
  });

  describe('préparation des marges', () => {
    it("pose le libellé d'entête en chaîne CSS", () => {
      service.preparerMarges(new Date(2026, 10, 15, 14, 32));
      expect(
        document.documentElement.style.getPropertyValue(ImpressionService.VARIABLE_ENTETE),
      ).toBe(`"${LIBELLES.impression.entete}"`);
    });

    it("pose la date et l'heure fournies en chaîne CSS", () => {
      service.preparerMarges(new Date(2026, 10, 15, 14, 32));
      expect(
        document.documentElement.style.getPropertyValue(ImpressionService.VARIABLE_DATE),
      ).toBe('"15/11/2026 14:32"');
    });

    it("utilise l'heure courante par défaut", () => {
      const avant = DateUtils.formaterDateHeure(new Date());
      service.preparerMarges();
      const apres = DateUtils.formaterDateHeure(new Date());
      const valeur = document.documentElement.style.getPropertyValue(
        ImpressionService.VARIABLE_DATE,
      );
      expect([`"${avant}"`, `"${apres}"`]).toContain(valeur);
    });
  });
});
