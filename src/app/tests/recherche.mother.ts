import type { ResultatRecherche } from '../modeles/recherche.modele';

/** Fournit des instances de {@link ResultatRecherche} prêtes à l'emploi pour les tests. */
export class ResultatRechercheMother {

  /** Retourne un résultat de type élève minimal valide. */
  static eleve(surcharge: Partial<ResultatRecherche> = {}): ResultatRecherche {
    return { type: 'eleve', titre: 'DUPONT Marie', id: 'eleve-1', route: '/eleves', ...surcharge };
  }

  /** Retourne un résultat de type projet minimal valide. */
  static projet(surcharge: Partial<ResultatRecherche> = {}): ResultatRecherche {
    return { type: 'projet', titre: 'Projet sciences', id: 'projet-1', route: '/projets', ...surcharge };
  }
}
