/**
 * Modèles de données liés à la recherche globale dans l'application.
 */

/**
 * Résultat d'une recherche globale — représente un élément navigable de l'application.
 */
export interface ResultatRecherche {
  /** Type de l'élément trouvé (ex. : `'eleve'`, `'projet'`). */
  type: string;
  /** Libellé affiché dans la liste de résultats. */
  titre: string;
  /** UUID de l'élément trouvé. */
  id: string;
  /** Route Angular cible (ex. : `'/eleves'`, `'/projets'`). */
  route: string;
}
