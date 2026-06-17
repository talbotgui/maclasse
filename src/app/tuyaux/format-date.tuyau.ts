import { Pipe, PipeTransform } from '@angular/core';
import { DateUtils } from '../utilitaires/date.utils';

/**
 * Tuyau Angular de formatage de date ISO (`YYYY-MM-DD`) vers un libellé lisible.
 *
 * - Format `'long'` (défaut) : délègue à {@link DateUtils.formaterDateLong} — ex. `"lundi 15 juin 2026"`.
 * - Format `'court'` : délègue à {@link DateUtils.formaterDateCourt} — ex. `"15/06/2026"`.
 *
 * @example
 * ```html
 * {{ seance.date | formaterDate }}
 * {{ seance.date | formaterDate:'court' }}
 * ```
 */
@Pipe({ name: 'formaterDate' })
export class FormatDateTuyau implements PipeTransform {
  /**
   * Transforme une date ISO en libellé formaté.
   * @param valeur Date au format `YYYY-MM-DD`.
   * @param format `'long'` pour le libellé complet, `'court'` pour `DD/MM/YYYY`.
   * @returns Date formatée selon le format demandé.
   */
  public transform(valeur: string, format: 'long' | 'court' = 'long'): string {
    return format === 'long'
      ? DateUtils.formaterDateLong(valeur)
      : DateUtils.formaterDateCourt(valeur);
  }
}
