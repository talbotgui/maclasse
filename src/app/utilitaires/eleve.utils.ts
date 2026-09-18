/**
 * Utilitaires de manipulation des élèves.
 * Toutes les méthodes sont statiques — la classe n'a pas vocation à être instanciée.
 */

import { Eleve } from '../modeles/eleve.modele';
import { ElevesConcernes } from '../modeles/emploi-du-temps.modele';

/**
 * Classe utilitaire exposant des opérations sur les périmètres d'élèves concernés.
 */
export class EleveUtils {
  /**
   * Résout un périmètre `ElevesConcernes` en liste d'identifiants d'élèves.
   * `undefined` ou `type === 'classe'` retourne tous les élèves de la classe.
   * @param elevesConcernes Périmètre à résoudre, éventuellement absent.
   * @param tousEleves Élèves de la classe.
   * @returns Identifiants des élèves concernés.
   */
  public static resoudreElevesConcernes(
    elevesConcernes: ElevesConcernes | undefined,
    tousEleves: Eleve[],
  ): string[] {
    if (!elevesConcernes || elevesConcernes.type === 'classe') {
      return tousEleves.map((e) => e.id);
    }
    if (elevesConcernes.type === 'groupes') {
      const groupes = elevesConcernes.groupes;
      return tousEleves.filter((e) => e.groupes.some((g) => groupes.includes(g))).map((e) => e.id);
    }
    return elevesConcernes.elevesIds;
  }
}
