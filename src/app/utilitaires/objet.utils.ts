/**
 * Utilitaires de comparaison d'objets de données.
 * Toutes les méthodes sont statiques — la classe n'a pas vocation à être instanciée.
 */

/**
 * Classe utilitaire exposant des opérations de comparaison structurelle.
 */
export class ObjetUtils {
  /**
   * Compare deux valeurs en profondeur : primitives, `Date`, tableaux et objets JSON simples.
   * L'ordre des clés d'un objet n'a pas d'incidence ; l'ordre des éléments d'un tableau, si.
   * `NaN` est considéré égal à `NaN` ; une clé absente diffère d'une clé valant `undefined`.
   * Ne gère ni `Map`, ni `Set`, ni les références circulaires.
   * @param a Première valeur.
   * @param b Seconde valeur.
   * @returns `true` si les deux valeurs sont structurellement égales.
   */
  public static sontEgaux(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (typeof a === 'number' && typeof b === 'number') return Number.isNaN(a) && Number.isNaN(b);
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;

    if (a instanceof Date || b instanceof Date) {
      return a instanceof Date && b instanceof Date && a.getTime() === b.getTime();
    }

    const tableauA = Array.isArray(a);
    if (tableauA !== Array.isArray(b)) return false;

    if (tableauA) {
      const listeA = a as unknown[];
      const listeB = b as unknown[];
      return (
        listeA.length === listeB.length &&
        listeA.every((valeur, index) => ObjetUtils.sontEgaux(valeur, listeB[index]))
      );
    }

    const objetA = a as Record<string, unknown>;
    const objetB = b as Record<string, unknown>;
    const clesA = Object.keys(objetA);
    const clesB = Object.keys(objetB);
    return (
      clesA.length === clesB.length &&
      clesA.every(
        (cle) =>
          Object.prototype.hasOwnProperty.call(objetB, cle) &&
          ObjetUtils.sontEgaux(objetA[cle], objetB[cle]),
      )
    );
  }
}
