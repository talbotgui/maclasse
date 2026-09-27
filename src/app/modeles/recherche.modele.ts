/**
 * Modèles de données liés à la recherche globale dans l'application.
 */

/** Nature technique d'un élément trouvé par la recherche globale. */
export type TypeResultatRecherche = 'eleve' | 'projet';

/**
 * Résultat d'une recherche globale — représente un élément navigable de l'application.
 */
export interface ResultatRecherche {
  /** Type technique de l'élément trouvé, traduit à l'affichage via `LIBELLES.entete.typesResultatRecherche`. */
  type: TypeResultatRecherche;
  /** Libellé affiché dans la liste de résultats. */
  titre: string;
  /** UUID de l'élément trouvé. */
  id: string;
  /** Route Angular cible (ex. : `'/eleves'`, `'/projets'`). */
  route: string;
}
