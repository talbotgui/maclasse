import { EmploiDuTempsCalcule } from '../modeles/emploi-du-temps-calcule.modele';

/**
 * Fournit des instances de {@link EmploiDuTempsCalcule} prêtes à l'emploi pour les tests.
 * Par défaut : id='edtc1', fréquence='lesDeux', sans plage de dates, sans source, toute la classe.
 */
export class EdtCalculeMother {
  /** Retourne un EDT calculé avec les valeurs par défaut, surchargées par {@link surcharge}. */
  static base(surcharge: Partial<EmploiDuTempsCalcule> = {}): EmploiDuTempsCalcule {
    return {
      id: 'edtc1',
      nom: 'Vue calculée',
      dateDebut: null,
      dateFin: null,
      frequence: 'lesDeux',
      sources: [],
      elevesConcernes: { type: 'classe', groupes: [], elevesIds: [] },
      ...surcharge,
    };
  }
}
