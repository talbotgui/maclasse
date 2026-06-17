import { Projet, ProjetPeriode } from '../modeles/projet.modele';

/**
 * Fournit des instances de {@link Projet} prêtes à l'emploi pour les tests.
 * Par défaut : id='p1', nom='Compostage'.
 */
export class ProjetMother {
  /** Retourne un projet avec les valeurs par défaut, surchargées par {@link surcharge}. */
  static base(surcharge: Partial<Projet> = {}): Projet {
    return {
      id: 'p1',
      nom: 'Compostage',
      description: 'Projet sur le compostage',
      elevesIds: [],
      periodes: [],
      ...surcharge,
    };
  }
}

/**
 * Fournit des instances de {@link ProjetPeriode} prêtes à l'emploi pour les tests.
 * Par défaut : 'Période 1', du 2025-09-01 au 2025-10-18.
 */
export class PeriodeMother {
  /** Retourne une période avec les valeurs par défaut, surchargées par {@link surcharge}. */
  static base(surcharge: Partial<ProjetPeriode> = {}): ProjetPeriode {
    return {
      periodeNom: 'Période 1',
      debut: '2025-09-01',
      fin: '2025-10-18',
      description: 'Phase 1',
      competencesIds: [],
      ...surcharge,
    };
  }
}
