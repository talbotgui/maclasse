import { CreneauEdt, EmploiDuTemps } from '../modeles/emploi-du-temps.modele';

/**
 * Fournit des instances de {@link EmploiDuTemps} prêtes à l'emploi pour les tests.
 * Par défaut : id='edt1', fréquence='lesDeux', sans plage de dates ni créneaux.
 */
export class EdtMother {
  /** Retourne un EDT avec les valeurs par défaut, surchargées par {@link surcharge}. */
  static base(surcharge: Partial<EmploiDuTemps> = {}): EmploiDuTemps {
    return {
      id: 'edt1',
      nom: 'Semaine complète',
      dateDebut: null,
      dateFin: null,
      frequence: 'lesDeux',
      creneaux: [],
      ...surcharge,
    };
  }
}

/**
 * Fournit des instances de {@link CreneauEdt} prêtes à l'emploi pour les tests.
 */
export class CreneauMother {
  /** Retourne un créneau pédagogique le lundi de 9h à 10h, surchargé par {@link surcharge}. */
  static lundi9h10(surcharge: Partial<CreneauEdt> = {}): CreneauEdt {
    return {
      id: 'c1',
      jour: 'lundi',
      heureDebut: '09:00',
      heureFin: '10:00',
      type: 'pedagogique',
      ...surcharge,
    };
  }
}
