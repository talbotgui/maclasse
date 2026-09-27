import { describe, it, expect } from 'vitest';
import { MigrationService } from './migration.service';
import { DonneesMother } from '../../tests/donnees.mother';
import { DonneesApplication } from '../../modeles/donnees-application.modele';
import { EdtCalculeMother } from '../../tests/emploi-du-temps-calcule.mother';
import { CreneauMother, EdtMother, TempsCreneauMother } from '../../tests/emploi-du-temps.mother';
import { SourceEdtCalcule } from '../../modeles/emploi-du-temps-calcule.modele';

describe('MigrationService', () => {
  const service = new MigrationService();

  describe('version supportée', () => {
    it('la version courante est celle de la dernière étape de migration', () => {
      expect(service.obtenirVersionCourante()).toBe('2026.09.4');
    });

    it('accepte la version courante et les versions antérieures', () => {
      expect(service.estVersionSupportee('2026.09.4')).toBe(true);
      expect(service.estVersionSupportee('2026.09.1')).toBe(true);
      expect(service.estVersionSupportee('2025.12.9')).toBe(true);
    });

    it('refuse une version plus récente', () => {
      expect(service.estVersionSupportee('2026.09.5')).toBe(false);
      expect(service.estVersionSupportee('2026.10.1')).toBe(false);
      expect(service.estVersionSupportee('2027.01.1')).toBe(false);
    });

    it('compare les segments numériquement et non comme du texte', () => {
      expect(service.estVersionSupportee('2026.09.10')).toBe(false);
      expect(service.estVersionSupportee('2026.09.03')).toBe(true);
    });

    it('ne prend pas une version illisible pour une version future', () => {
      expect(service.estVersionSupportee('abc')).toBe(true);
      expect(service.estVersionSupportee('2026.09.x')).toBe(true);
    });

    it('tolère un nombre de segments différent', () => {
      expect(service.estVersionSupportee('2026.09')).toBe(true);
      expect(service.estVersionSupportee('2026.09.4.1')).toBe(false);
    });
  });

  describe('ordre des étapes', () => {
    it('migre un fichier en version 2026.09.2 même si la comparaison de chaînes le placerait après', () => {
      const anciennes = DonneesMother.base({ version: '2026.09.2' }) as Partial<DonneesApplication>;
      delete anciennes.emploisDuTempsCalcules;

      expect(service.migrer(anciennes as DonneesApplication).emploisDuTempsCalcules).toEqual([]);
    });

    it('ne rejoue pas une étape déjà appliquée', () => {
      const donnees = DonneesMother.base({
        version: '2026.09.3',
        emploisDuTempsCalcules: [EdtCalculeMother.base()],
      });

      expect(service.migrer(donnees).emploisDuTempsCalcules).toHaveLength(1);
    });
  });

  describe('ajout des emplois du temps calculés', () => {
    it('crée le tableau absent et passe à la dernière version', () => {
      const anciennes = DonneesMother.base({ version: '2026.09.2' }) as Partial<DonneesApplication>;
      delete anciennes.emploisDuTempsCalcules;
      const migrees = service.migrer(anciennes as DonneesApplication);
      expect(migrees.emploisDuTempsCalcules).toEqual([]);
      expect(migrees.version).toBe('2026.09.4');
    });

    it('conserve un tableau existant', () => {
      const donnees = DonneesMother.base({
        version: '2026.09.2',
        emploisDuTempsCalcules: [EdtCalculeMother.base()],
      });
      expect(service.migrer(donnees).emploisDuTempsCalcules).toHaveLength(1);
    });
  });

  describe('migration des créneaux vers les temps', () => {
    it('convertit un créneau à plat en un temps unique', () => {
      const donnees = DonneesMother.base({
        version: '2026.09.1',
        emploisDuTemps: [
          {
            id: 'edt1',
            nom: 'Ancien',
            dateDebut: null,
            dateFin: null,
            frequence: 'lesDeux',
            creneaux: [
              {
                id: 'c1',
                jour: 'lundi',
                type: 'pedagogique',
                heureDebut: '09:00',
                heureFin: '10:00',
                titre: 'Maths',
              },
            ] as unknown as DonneesApplication['emploisDuTemps'][number]['creneaux'],
          },
        ],
      });
      const temps = service.migrer(donnees).emploisDuTemps[0].creneaux[0].temps;
      expect(temps).toHaveLength(1);
      expect(temps[0].heureDebut).toBe('09:00');
      expect(temps[0].titre).toBe('Maths');
    });
  });

  describe('regroupement des temps hors classe', () => {
    it('remplace la source recreation par tempsHorsClasse', () => {
      const donnees = DonneesMother.base({
        version: '2026.09.3',
        emploisDuTempsCalcules: [
          EdtCalculeMother.base({
            sources: ['recreation', 'absencesRegulieres'] as unknown as SourceEdtCalcule[],
          }),
        ],
      });
      const migrees = service.migrer(donnees);
      expect(migrees.emploisDuTempsCalcules[0].sources).toEqual([
        'tempsHorsClasse',
        'absencesRegulieres',
      ]);
      expect(migrees.version).toBe('2026.09.4');
    });

    it('ne crée pas de doublon si tempsHorsClasse est déjà présent', () => {
      const donnees = DonneesMother.base({
        version: '2026.09.3',
        emploisDuTempsCalcules: [
          EdtCalculeMother.base({
            sources: ['tempsHorsClasse', 'recreation'] as unknown as SourceEdtCalcule[],
          }),
        ],
      });
      expect(service.migrer(donnees).emploisDuTempsCalcules[0].sources).toEqual([
        'tempsHorsClasse',
      ]);
    });

    it('laisse inchangées les sources sans recreation', () => {
      const donnees = DonneesMother.base({
        version: '2026.09.3',
        emploisDuTempsCalcules: [EdtCalculeMother.base({ sources: ['tempsClasse'] })],
      });
      expect(service.migrer(donnees).emploisDuTempsCalcules[0].sources).toEqual(['tempsClasse']);
    });

    it('retire les champs pédagogiques des temps hors classe et les conserve ailleurs', () => {
      const tempsComplet = TempsCreneauMother.base({
        titre: 'Maths',
        disciplinesIds: ['d1'],
        elevesConcernes: { type: 'classe', groupes: [], elevesIds: [] },
      });
      const donnees = DonneesMother.base({
        version: '2026.09.3',
        emploisDuTemps: [
          EdtMother.base({
            creneaux: [
              CreneauMother.lundi9h10({ id: 'p1', temps: [structuredClone(tempsComplet)] }),
              CreneauMother.lundi9h10({
                id: 'r1',
                type: 'recreation',
                temps: [structuredClone(tempsComplet)],
              }),
              CreneauMother.lundi9h10({
                id: 'd1',
                type: 'pauseDejeuner',
                temps: [structuredClone(tempsComplet)],
              }),
            ],
          }),
        ],
      });
      const [pedagogique, recreation, pause] = service.migrer(donnees).emploisDuTemps[0].creneaux;
      expect(pedagogique.temps[0]).toEqual(tempsComplet);
      expect(recreation.temps[0]).toEqual(TempsCreneauMother.base());
      expect(pause.temps[0]).toEqual(TempsCreneauMother.base());
    });
  });
});
