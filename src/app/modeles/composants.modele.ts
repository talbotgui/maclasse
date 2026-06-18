/**
 * Modèles partagés pour les composants de formulaire génériques.
 */

/**
 * Option d'un sélecteur ou d'un groupe de boutons radio.
 * Utilisée par `mc-select` et `mc-radio-group`.
 */
export interface OptionFormulaire {
  /** Valeur technique transmise au FormControl parent. */
  valeur: string;
  /** Libellé affiché dans l'interface utilisateur. */
  libelle: string;
}
