/**
 * Service de préparation de l'impression : contenu des marges des pages imprimées.
 */

import { Injectable } from '@angular/core';
import { LIBELLES } from '../../libelles';
import { DateUtils } from '../../utilitaires/date.utils';

/**
 * Service singleton qui alimente l'entête et le pied de page des impressions.
 * Les zones de marge `@page` de `styles.scss` affichent les variables CSS posées ici
 * sur la racine du document : le CSS ne sait ni lire `LIBELLES` ni calculer l'heure.
 */
@Injectable({ providedIn: 'root' })
export class ImpressionService {
  /** Variable CSS lue par la zone `@top-center` : libellé de l'entête. */
  public static readonly VARIABLE_ENTETE = '--mc-impression-entete';

  /** Variable CSS lue par la zone `@bottom-left` : date et heure de l'impression. */
  public static readonly VARIABLE_DATE = '--mc-impression-date';

  /** Caractères à échapper dans une chaîne CSS entre guillemets doubles. */
  private static readonly CARACTERES_A_ECHAPPER = /["\\]/g;

  /**
   * Pose sur la racine du document le libellé d'entête et la date et l'heure de l'impression.
   * À appeler juste avant l'impression (événement `beforeprint`).
   * @param maintenant Instant de l'impression (heure courante par défaut).
   */
  public preparerMarges(maintenant: Date = new Date()): void {
    const style = document.documentElement.style;
    style.setProperty(
      ImpressionService.VARIABLE_ENTETE,
      ImpressionService.convertirEnChaineCss(LIBELLES.impression.entete),
    );
    style.setProperty(
      ImpressionService.VARIABLE_DATE,
      ImpressionService.convertirEnChaineCss(DateUtils.formaterDateHeure(maintenant)),
    );
  }

  /**
   * Convertit un texte en chaîne CSS utilisable dans la propriété `content`.
   * @param texte Texte à convertir.
   * @returns Texte entre guillemets doubles, guillemets et barres obliques inverses échappés.
   */
  private static convertirEnChaineCss(texte: string): string {
    return `"${texte.replace(ImpressionService.CARACTERES_A_ECHAPPER, '\\$&')}"`;
  }
}
