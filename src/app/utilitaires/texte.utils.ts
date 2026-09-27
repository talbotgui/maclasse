/**
 * Utilitaires de manipulation de chaînes de caractères.
 * Toutes les méthodes sont statiques — la classe n'a pas vocation à être instanciée.
 */

/**
 * Classe utilitaire exposant des opérations courantes sur les chaînes de caractères.
 */
export class TexteUtils {
  /**
   * Normalise un texte pour une recherche insensible à la casse et aux accents.
   * Supprime les diacritiques via la décomposition NFD puis met en minuscules.
   * @param texte Texte à normaliser.
   * @returns Texte en minuscules sans diacritiques.
   */
  public static normaliserPourRecherche(texte: string): string {
    return texte.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  /**
   * Normalise un identifiant de référentiel pour une comparaison d'unicité : espaces en
   * bordure retirés, minuscules. Les accents sont conservés.
   * @param identifiant Identifiant saisi.
   * @returns Identifiant normalisé.
   */
  public static normaliserIdentifiant(identifiant: string): string {
    return identifiant.trim().toLocaleLowerCase('fr');
  }
}
