import type {
  StatutAcquisition,
  Groupe,
  StatutEleve,
  TypeContact,
  JourFerie,
  Periode,
} from '../modeles/referentiels.modele';

/** Fournit des instances de types référentiel prêtes à l'emploi pour les tests. */
export class StatutAcquisitionMother {
  /** Retourne un {@link StatutAcquisition} "Acquis" minimal valide. */
  static acquis(surcharge: Partial<StatutAcquisition> = {}): StatutAcquisition {
    return {
      id: 'A',
      glyphe: '✓',
      libelle: 'Acquis',
      couleur: 'var(--vert)',
      fond: 'var(--vert-fond)',
      ...surcharge,
    };
  }

  /** Retourne un {@link StatutAcquisition} "En cours" minimal valide. */
  static enCours(surcharge: Partial<StatutAcquisition> = {}): StatutAcquisition {
    return {
      id: 'EC',
      glyphe: '~',
      libelle: 'En cours',
      couleur: 'var(--orange)',
      fond: 'var(--orange-fond)',
      ...surcharge,
    };
  }

  /** Retourne un {@link StatutAcquisition} "Non acquis" minimal valide. */
  static nonAcquis(surcharge: Partial<StatutAcquisition> = {}): StatutAcquisition {
    return {
      id: 'NA',
      glyphe: '✗',
      libelle: 'Non acquis',
      couleur: 'var(--erreur)',
      fond: 'var(--erreur-fond)',
      ...surcharge,
    };
  }
}

/** Fournit des instances de {@link Groupe} prêtes à l'emploi pour les tests. */
export class GroupeMother {
  /** Retourne un groupe minimal valide. */
  static base(id = 'GA', libelle = 'Groupe A'): Groupe {
    return { id, libelle };
  }
}

/** Fournit des instances de {@link StatutEleve} prêtes à l'emploi pour les tests. */
export class StatutEleveMother {
  /** Retourne un statut élève minimal valide. */
  static base(id = 'DC', libelle = 'Dans la classe'): StatutEleve {
    return { id, libelle };
  }
}

/** Fournit des instances de {@link TypeContact} prêtes à l'emploi pour les tests. */
export class TypeContactMother {
  /** Retourne un type de contact minimal valide. */
  static base(id = 'P', libelle = 'Père'): TypeContact {
    return { id, libelle };
  }
}

/** Fournit des instances de {@link JourFerie} prêtes à l'emploi pour les tests. */
export class JourFerieMother {
  /** Retourne un jour férié minimal valide. */
  static base(date = '2025-11-01', nom = 'Toussaint'): JourFerie {
    return { id: crypto.randomUUID(), nom, date };
  }
}

/** Fournit des instances de {@link Periode} prêtes à l'emploi pour les tests. */
export class PeriodeMother {
  /** Retourne une période minimale valide. */
  static base(surcharge: Partial<Periode> = {}): Periode {
    return { id: 'P1', nom: 'Période 1', debut: '2025-09-01', fin: '2025-10-31', ...surcharge };
  }
}
