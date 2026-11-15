/**
 * Service de préparation de l'impression : contenu des marges des pages imprimées
 * et titre du document pendant l'impression.
 */

import { DestroyRef, Injectable, Signal, inject } from '@angular/core';
import { LIBELLES } from '../../libelles';
import { DateUtils } from '../../utilitaires/date.utils';

/**
 * Service singleton qui alimente l'entête et le pied de page des impressions.
 * Les zones de marge `@page` de `styles.scss` affichent les variables CSS posées ici
 * sur la racine du document : le CSS ne sait ni lire `LIBELLES` ni calculer l'heure.
 * L'écran affiché fournit le titre du document imprimé via `suivreTitre()`.
 */
@Injectable({ providedIn: 'root' })
export class ImpressionService {
  /** Variable CSS lue par la zone `@top-center` : libellé de l'entête. */
  public static readonly VARIABLE_ENTETE = '--mc-impression-entete';

  /** Variable CSS lue par la zone `@bottom-left` : date et heure de l'impression. */
  public static readonly VARIABLE_DATE = '--mc-impression-date';

  /** Caractères à échapper dans une chaîne CSS entre guillemets doubles. */
  private static readonly CARACTERES_A_ECHAPPER = /["\\]/g;

  /** Sauts de ligne, interdits dans une chaîne CSS : remplacés par une espace. */
  private static readonly SAUTS_DE_LIGNE = /[\r\n]+/g;

  /** Titre du document imprimé de l'écran affiché, `null` si aucun écran n'en fournit. */
  private sourceTitre: Signal<string> | null = null;

  /** Titre du document mémorisé au début de l'impression, restauré à la fin ; `null` hors impression. */
  private titreAvantImpression: string | null = null;

  /**
   * Enregistre le titre du document imprimé de l'écran affiché. Le signal n'est lu qu'au
   * début de l'impression ; une chaîne vide signifie « pas de document ».
   * À appeler dans un contexte d'injection (constructeur d'écran) : l'enregistrement est
   * retiré à la destruction de l'écran.
   * @param titre Signal du titre du document (ex. « Bilan MARTIN Alice »).
   */
  public suivreTitre(titre: Signal<string>): void {
    this.sourceTitre = titre;
    inject(DestroyRef).onDestroy(() => {
      if (this.sourceTitre === titre) this.sourceTitre = null;
    });
  }

  /**
   * Prépare l'impression (événement `beforeprint`) : pose sur la racine du document
   * l'entête (« Application Ma Classe - titre ») et l'horodatage, puis remplace
   * `document.title` par le titre, proposé par le navigateur comme nom du PDF.
   * @param maintenant Instant de l'impression (heure courante par défaut).
   */
  public preparerImpression(maintenant: Date = new Date()): void {
    const titre = this.sourceTitre?.() ?? '';
    const entete = titre
      ? LIBELLES.impression.entete + LIBELLES.impression.separateurTitre + titre
      : LIBELLES.impression.entete;
    const style = document.documentElement.style;
    style.setProperty(
      ImpressionService.VARIABLE_ENTETE,
      ImpressionService.convertirEnChaineCss(entete),
    );
    style.setProperty(
      ImpressionService.VARIABLE_DATE,
      ImpressionService.convertirEnChaineCss(DateUtils.formaterDateHeure(maintenant)),
    );
    if (titre && this.titreAvantImpression === null) {
      this.titreAvantImpression = document.title;
      document.title = titre;
    }
  }

  /** Termine l'impression (événement `afterprint`) : restaure le titre du document. */
  public terminerImpression(): void {
    if (this.titreAvantImpression !== null) {
      document.title = this.titreAvantImpression;
      this.titreAvantImpression = null;
    }
  }

  /**
   * Convertit un texte en chaîne CSS utilisable dans la propriété `content`.
   * @param texte Texte à convertir.
   * @returns Texte entre guillemets doubles, guillemets et barres obliques inverses échappés,
   * sauts de ligne remplacés par une espace.
   */
  private static convertirEnChaineCss(texte: string): string {
    const echappe = texte
      .replace(ImpressionService.CARACTERES_A_ECHAPPER, '\\$&')
      .replace(ImpressionService.SAUTS_DE_LIGNE, ' ');
    return `"${echappe}"`;
  }
}
