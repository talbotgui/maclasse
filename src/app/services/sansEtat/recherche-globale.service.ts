/**
 * Service de recherche globale dans les données de l'application.
 * Parcourt les élèves et les projets pour retourner des résultats cliquables.
 */

import { Injectable, inject } from '@angular/core';
import { DonneesService } from '../avecEtat/donnees.service';

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

/**
 * Service sans état exposant la recherche textuelle globale.
 * Parcourt les élèves et les projets ; extensible à d'autres domaines.
 */
@Injectable({ providedIn: 'root' })
export class RechercheGlobaleService {
  /** Accès en lecture aux données de l'application. */
  private readonly _donneesService = inject(DonneesService);

  /**
   * Recherche tous les éléments correspondant au terme dans les élèves et les projets.
   * La recherche est insensible à la casse et aux accents.
   * Retourne un tableau vide si le terme est vide ou composé uniquement d'espaces.
   * @param terme Terme de recherche saisi par l'utilisateur.
   * @returns Liste de résultats triés : élèves d'abord, puis projets.
   */
  public rechercher(terme: string): ResultatRecherche[] {
    if (!terme.trim()) return [];
    const t = this._normaliser(terme);
    const donnees = this._donneesService.donnees();
    if (!donnees) return [];

    const resultats: ResultatRecherche[] = [];

    for (const eleve of donnees.classe.eleves) {
      const libelle = `${eleve.nom} ${eleve.prenom}`;
      if (this._normaliser(libelle).includes(t)) {
        resultats.push({
          type: 'eleve',
          titre: libelle,
          id: eleve.id,
          route: '/eleves',
        });
      }
    }

    for (const projet of donnees.projets) {
      if (this._normaliser(projet.nom).includes(t)) {
        resultats.push({
          type: 'projet',
          titre: projet.nom,
          id: projet.id,
          route: '/projets',
        });
      }
    }

    return resultats;
  }

  /**
   * Normalise un texte pour la recherche insensible à la casse et aux accents.
   * @param texte Texte à normaliser.
   * @returns Texte en minuscules sans diacritiques.
   */
  private _normaliser(texte: string): string {
    return texte
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }
}
