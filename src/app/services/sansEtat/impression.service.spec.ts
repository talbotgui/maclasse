import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { EnvironmentInjector, createEnvironmentInjector, signal } from '@angular/core';
import { ImpressionService } from './impression.service';
import { LIBELLES } from '../../libelles';
import { DateUtils } from '../../utilitaires/date.utils';

describe('ImpressionService', () => {
  /** Titre du document avant chaque test, restauré après. */
  const titreApplication = 'MaClasse';

  let service: ImpressionService;

  /** Injecteur jouant le rôle d'un écran : sa destruction retire l'enregistrement du titre. */
  let injecteurEcran: EnvironmentInjector;

  /**
   * Lit une variable CSS posée sur la racine du document.
   * @param variable Nom de la variable.
   * @returns Valeur de la variable, vide si absente.
   */
  const lireVariable = (variable: string): string =>
    document.documentElement.style.getPropertyValue(variable);

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImpressionService);
    injecteurEcran = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
    document.title = titreApplication;
  });

  afterEach(() => {
    service.terminerImpression();
    document.documentElement.style.removeProperty(ImpressionService.VARIABLE_ENTETE);
    document.documentElement.style.removeProperty(ImpressionService.VARIABLE_DATE);
  });

  describe('entête', () => {
    it('affiche le libellé seul sans titre de document enregistré', () => {
      service.preparerImpression();
      expect(lireVariable(ImpressionService.VARIABLE_ENTETE)).toBe(
        `"${LIBELLES.impression.entete}"`,
      );
    });

    it('ajoute le titre du document enregistré après le séparateur', () => {
      injecteurEcran.runInContext(() => service.suivreTitre(signal('Bilan MARTIN Alice')));
      service.preparerImpression();
      expect(lireVariable(ImpressionService.VARIABLE_ENTETE)).toBe(
        `"${LIBELLES.impression.entete}${LIBELLES.impression.separateurTitre}Bilan MARTIN Alice"`,
      );
    });

    it('affiche le libellé seul quand le titre enregistré est vide', () => {
      injecteurEcran.runInContext(() => service.suivreTitre(signal('')));
      service.preparerImpression();
      expect(lireVariable(ImpressionService.VARIABLE_ENTETE)).toBe(
        `"${LIBELLES.impression.entete}"`,
      );
    });

    it('lit la valeur du titre au moment de l’impression', () => {
      const titre = signal('Projet Sciences');
      injecteurEcran.runInContext(() => service.suivreTitre(titre));
      titre.set('Projet Arts');
      service.preparerImpression();
      expect(lireVariable(ImpressionService.VARIABLE_ENTETE)).toContain('Projet Arts');
    });

    it('échappe les guillemets et barres obliques inverses du titre', () => {
      injecteurEcran.runInContext(() => service.suivreTitre(signal('Projet "a\\b"')));
      service.preparerImpression();
      expect(lireVariable(ImpressionService.VARIABLE_ENTETE)).toBe(
        `"${LIBELLES.impression.entete}${LIBELLES.impression.separateurTitre}Projet \\"a\\\\b\\""`,
      );
    });
  });

  describe('titre sur plusieurs lignes', () => {
    it('remplace les sauts de ligne par une espace', () => {
      injecteurEcran.runInContext(() => service.suivreTitre(signal('Projet a\r\nb')));
      service.preparerImpression();
      expect(lireVariable(ImpressionService.VARIABLE_ENTETE)).toBe(
        `"${LIBELLES.impression.entete}${LIBELLES.impression.separateurTitre}Projet a b"`,
      );
    });
  });

  describe('enregistrement du titre', () => {
    it("retire le titre à la destruction de l'écran qui l'a enregistré", () => {
      injecteurEcran.runInContext(() => service.suivreTitre(signal('Projet Sciences')));
      injecteurEcran.destroy();
      service.preparerImpression();
      expect(lireVariable(ImpressionService.VARIABLE_ENTETE)).toBe(
        `"${LIBELLES.impression.entete}"`,
      );
    });

    it("conserve le titre du nouvel écran à la destruction de l'ancien", () => {
      const injecteurNouvelEcran = createEnvironmentInjector(
        [],
        TestBed.inject(EnvironmentInjector),
      );
      injecteurEcran.runInContext(() => service.suivreTitre(signal('Projet Sciences')));
      injecteurNouvelEcran.runInContext(() => service.suivreTitre(signal('Bilan MARTIN Alice')));
      injecteurEcran.destroy();
      service.preparerImpression();
      expect(lireVariable(ImpressionService.VARIABLE_ENTETE)).toContain('Bilan MARTIN Alice');
      injecteurNouvelEcran.destroy();
    });

    it("exige un contexte d'injection", () => {
      expect(() => service.suivreTitre(signal('Projet Sciences'))).toThrow();
    });
  });

  describe('pied de page', () => {
    it("pose la date et l'heure fournies en chaîne CSS", () => {
      service.preparerImpression(new Date(2026, 10, 15, 14, 32));
      expect(lireVariable(ImpressionService.VARIABLE_DATE)).toBe('"15/11/2026 14:32"');
    });

    it("utilise l'heure courante par défaut", () => {
      const avant = DateUtils.formaterDateHeure(new Date());
      service.preparerImpression();
      const apres = DateUtils.formaterDateHeure(new Date());
      expect([`"${avant}"`, `"${apres}"`]).toContain(lireVariable(ImpressionService.VARIABLE_DATE));
    });
  });

  describe('titre du document (nom du PDF)', () => {
    it("remplace le titre du document pendant l'impression et le restaure après", () => {
      injecteurEcran.runInContext(() => service.suivreTitre(signal('Bilan MARTIN Alice')));
      service.preparerImpression();
      expect(document.title).toBe('Bilan MARTIN Alice');
      service.terminerImpression();
      expect(document.title).toBe(titreApplication);
    });

    it('ne modifie pas le titre du document sans titre enregistré', () => {
      service.preparerImpression();
      expect(document.title).toBe(titreApplication);
      service.terminerImpression();
      expect(document.title).toBe(titreApplication);
    });

    it('restaure le titre initial même si la préparation est appelée deux fois', () => {
      injecteurEcran.runInContext(() => service.suivreTitre(signal('Bilan MARTIN Alice')));
      service.preparerImpression();
      service.preparerImpression();
      service.terminerImpression();
      expect(document.title).toBe(titreApplication);
    });
  });
});
