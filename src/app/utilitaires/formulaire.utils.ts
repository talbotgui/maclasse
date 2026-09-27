/**
 * Validateurs de formulaires réactifs partagés entre les écrans.
 * Toutes les méthodes sont statiques — la classe n'a pas vocation à être instanciée.
 */

import type { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Classe utilitaire exposant des validateurs `ValidatorFn` réutilisables.
 */
export class FormulaireUtils {
  /**
   * Valide qu'un groupe portant `heureDebut` et `heureFin` (format `HH:MM`) décrit une plage
   * non vide. Aucune erreur n'est levée tant qu'une des deux heures manque : l'obligation
   * de saisie relève du validateur `required` des contrôles eux-mêmes.
   * @param groupe Groupe de contrôles portant `heureDebut` et `heureFin`.
   * @returns `{ plageHoraireInvalide: true }` si l'heure de fin n'est pas strictement
   *   postérieure à l'heure de début, `null` sinon.
   */
  public static validerPlageHoraire(groupe: AbstractControl): ValidationErrors | null {
    const debut: unknown = groupe.get('heureDebut')?.value;
    const fin: unknown = groupe.get('heureFin')?.value;
    if (typeof debut === 'string' && typeof fin === 'string' && debut && fin && fin <= debut) {
      return { plageHoraireInvalide: true };
    }
    return null;
  }

  /**
   * Valide qu'un contrôle texte contient au moins un caractère non blanc.
   * Couvre aussi le champ vide, sans recourir à `Validators.required`.
   * @param controle Contrôle dont la valeur est une chaîne.
   * @returns `{ texteVide: true }` si la valeur, une fois les espaces retirés, est vide ;
   *   `null` sinon.
   */
  public static validerTexteNonVide(controle: AbstractControl): ValidationErrors | null {
    const valeur: unknown = controle.value;
    const texte = typeof valeur === 'string' ? valeur.trim() : '';
    return texte.length > 0 ? null : { texteVide: true };
  }
}
