import { Bilan, EvaluationBilan, SuiviSousDomaine } from '../modeles/bilan.modele';

/** Fournit des instances de {@link Bilan} prêtes à l'emploi pour les tests. */
export class BilanMother {
  /**
   * Retourne un bilan du 1er octobre 2026 sans évaluation, surchargé par {@link surcharge}.
   * @param id Identifiant du bilan.
   * @param surcharge Champs à remplacer.
   */
  public static base(id: string, surcharge: Partial<Bilan> = {}): Bilan {
    return {
      id,
      date: '2026-10-01',
      titre: `Bilan ${id}`,
      bilans: '<p>Progrès réguliers</p>',
      besoinsSpecifiques: '<p>Temps supplémentaire</p>',
      moyens: '<p>Tutorat</p>',
      evaluations: [],
      ...surcharge,
    };
  }
}

/** Fournit des instances d'{@link EvaluationBilan} prêtes à l'emploi pour les tests. */
export class EvaluationBilanMother {
  /**
   * Retourne une évaluation « Acquis » de la compétence `FR-C2-L-1`, surchargée par {@link surcharge}.
   * @param id Identifiant de la ligne.
   * @param surcharge Champs à remplacer.
   */
  public static base(id: string, surcharge: Partial<EvaluationBilan> = {}): EvaluationBilan {
    return {
      id,
      competenceId: 'FR-C2-L-1',
      statutAcquisitionId: 'A',
      commentaire: '',
      ...surcharge,
    };
  }
}

/** Fournit des instances de {@link SuiviSousDomaine} prêtes à l'emploi pour les tests. */
export class SuiviSousDomaineMother {
  /**
   * Retourne le suivi du sous-domaine {@link sousDomaineId} avec les bilans fournis.
   * @param sousDomaineId Identifiant de la compétence de niveau 3.
   * @param bilans Bilans du suivi, dans l'ordre d'affichage.
   */
  public static avecBilans(sousDomaineId: string, bilans: Bilan[]): SuiviSousDomaine {
    return { sousDomaineId, bilans };
  }
}
