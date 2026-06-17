/**
 * Service de recherche globale dans les données de l'application.
 * Parcourt les élèves et les projets pour retourner des résultats cliquables.
 */

import { Injectable, inject } from '@angular/core';
import { DonneesService } from '../avecEtat/donnees.service';
import { ResultatRecherche } from '../../modeles/recherche.modele';
import { TexteUtils } from '../../utilitaires/texte.utils';

/**
 * Service sans état exposant la recherche textuelle globale.
 * Parcourt les élèves et les projets ; extensible à d'autres domaines.
 */
@Injectable({ providedIn: 'root' })
export class RechercheGlobaleService {
  /** Accès en lecture aux données de l'application. */
  private readonly donneesService = inject(DonneesService);

  /**
   * Recherche tous les éléments correspondant au terme dans les élèves et les projets.
   * La recherche est insensible à la casse et aux accents.
   * Retourne un tableau vide si le terme est vide ou composé uniquement d'espaces.
   * @param terme Terme de recherche saisi par l'utilisateur.
   * @returns Liste de résultats triés : élèves d'abord, puis projets.
   */
  public rechercher(terme: string): ResultatRecherche[] {
    if (!terme.trim()) return [];
    const t = TexteUtils.normaliserPourRecherche(terme);
    const donnees = this.donneesService.donnees();
    if (!donnees) return [];

    const resultats: ResultatRecherche[] = [];

    for (const eleve of donnees.classe.eleves) {
      const libelle = `${eleve.nom} ${eleve.prenom}`;
      if (TexteUtils.normaliserPourRecherche(libelle).includes(t)) {
        resultats.push({
          type: 'eleve',
          titre: libelle,
          id: eleve.id,
          route: '/eleves',
        });
      }
    }

    for (const projet of donnees.projets) {
      if (TexteUtils.normaliserPourRecherche(projet.nom).includes(t)) {
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
}
