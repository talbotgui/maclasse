import { describe, it, expect } from 'vitest';
import { MigrationService } from './migration.service';
import { DonneesMother } from '../../tests/donnees.mother';
import { DonneesApplication } from '../../modeles/donnees-application.modele';
import { EdtCalculeMother } from '../../tests/emploi-du-temps-calcule.mother';

describe('MigrationService', () => {
  const service = new MigrationService();

  describe('ajout des emplois du temps calculés', () => {
    it('crée le tableau absent et passe à la dernière version', () => {
      const anciennes = DonneesMother.base({ version: '2026.09.2' }) as Partial<DonneesApplication>;
      delete anciennes.emploisDuTempsCalcules;
      const migrees = service.migrer(anciennes as DonneesApplication);
      expect(migrees.emploisDuTempsCalcules).toEqual([]);
      expect(migrees.version).toBe('2026.09.3');
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
});
