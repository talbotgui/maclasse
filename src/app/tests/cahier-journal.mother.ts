import { JourneeJournal, Seance } from '../modeles/cahier-journal.modele';

/**
 * Dates canoniques utilisées dans les tests du cahier journal.
 * Les valeurs sont figées pour garantir la reproductibilité des calculs de parité.
 */
export class DatesTest {
  /** Lundi 5 janvier 2026 — semaine 2 — paire. */
  static readonly lundiPaire = '2026-01-05';
  /** Lundi 12 janvier 2026 — semaine 3 — impaire. */
  static readonly lundiImpaire = '2026-01-12';
  /** Samedi 10 janvier 2026 — non ouvré. */
  static readonly samedi = '2026-01-10';
}

/**
 * Fournit des instances de {@link Seance} prêtes à l'emploi pour les tests.
 * Chaque méthode retourne un objet distinct ; les surcharges permettent de cibler
 * uniquement les champs pertinents pour le test.
 */
export class SeanceMother {
  /** Retourne une séance pédagogique de 9h à 10h (id='s1'), surchargée par {@link surcharge}. */
  static pedagogique(surcharge: Partial<Seance> = {}): Seance {
    return { id: 's1', heureDebut: '09:00', heureFin: '10:00', type: 'pedagogique', ...surcharge };
  }

  /** Retourne une séance de récréation de 10h à 11h (id='s2'), surchargée par {@link surcharge}. */
  static recreation(surcharge: Partial<Seance> = {}): Seance {
    return { id: 's2', heureDebut: '10:00', heureFin: '11:00', type: 'recreation', ...surcharge };
  }
}

/**
 * Fournit des instances de {@link JourneeJournal} prêtes à l'emploi pour les tests.
 * Chaque méthode retourne un objet distinct ; les surcharges permettent de cibler
 * uniquement les champs pertinents pour le test.
 */
export class JourneeMother {
  /**
   * Retourne une journée du cahier journal (id='j1', une séance pédagogique)
   * datée du lundi 5 janvier 2026, surchargée par {@link surcharge}.
   */
  static base(surcharge: Partial<JourneeJournal> = {}): JourneeJournal {
    return {
      id: 'j1',
      date: DatesTest.lundiPaire,
      seances: [SeanceMother.pedagogique()],
      ...surcharge,
    };
  }
}
