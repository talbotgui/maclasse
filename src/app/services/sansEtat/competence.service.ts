/**
 * Service métier de navigation dans l'arbre des compétences.
 * Toutes les méthodes sont en lecture seule — le CRUD des compétences
 * est délégué à `ReferentielService`.
 */

import { Injectable, inject } from '@angular/core';
import { Competence } from '../../modeles/referentiels.modele';
import { DonneesService } from '../avecEtat/donnees.service';

/**
 * Service sans état exposant la navigation, la recherche et la résolution
 * dans l'arbre hiérarchique des compétences du programme.
 */
@Injectable({ providedIn: 'root' })
export class CompetenceService {
  /** Accès en lecture aux données de l'application. */
  private readonly _donneesService = inject(DonneesService);

  /**
   * Retourne les nœuds de niveau 1 de l'arbre (domaines / disciplines).
   * Ce sont les identifiants utilisés dans `disciplinesIds` des séances et créneaux EDT.
   * @returns Tableau des domaines, ou tableau vide si aucune donnée chargée.
   */
  public obtenirDomaines(): Competence[] {
    return this._donneesService.donnees()?.referentiels.competences ?? [];
  }

  /**
   * Retourne un domaine de niveau 1 par son identifiant.
   * @param id Identifiant du domaine.
   * @returns Le domaine, ou `undefined` s'il n'existe pas.
   */
  public obtenirDomaineParId(id: string): Competence | undefined {
    return this.obtenirDomaines().find(d => d.id === id);
  }

  /**
   * Recherche dans tous les nœuds de l'arbre dont le libellé contient le terme.
   * La recherche est insensible à la casse et aux accents.
   * Retourne un tableau vide si le terme est vide ou composé uniquement d'espaces.
   * @param terme Terme de recherche.
   * @returns Nœuds correspondants (tous niveaux confondus).
   */
  public rechercherCompetences(terme: string): Competence[] {
    if (!terme.trim()) return [];
    const t = this._normaliser(terme);
    const resultats: Competence[] = [];
    const parcourir = (noeud: Competence): void => {
      if (this._normaliser(noeud.libelle).includes(t)) {
        resultats.push(noeud);
      }
      noeud.enfants?.forEach(parcourir);
    };
    this.obtenirDomaines().forEach(parcourir);
    return resultats;
  }

  /**
   * Retourne le libellé complet d'un nœud sous forme de chemin breadcrumb.
   * Exemple : `"Français › Lecture › Comprendre un texte"`
   * Retourne une chaîne vide si l'identifiant n'existe pas dans l'arbre.
   * @param id Identifiant du nœud.
   * @returns Chemin complet séparé par `›`.
   */
  public resoudreLibelle(id: string): string {
    return this.obtenirChemin(id)
      .map(n => n.libelle)
      .join(' › ');
  }

  /**
   * Retourne le chemin depuis la racine jusqu'au nœud identifié.
   * Retourne un tableau vide si l'identifiant n'existe pas.
   * @param id Identifiant du nœud cible.
   * @returns Tableau de nœuds du domaine racine jusqu'au nœud cible (inclus).
   */
  public obtenirChemin(id: string): Competence[] {
    const trouver = (noeud: Competence, chemin: Competence[]): Competence[] | null => {
      const cheminCourant = [...chemin, noeud];
      if (noeud.id === id) return cheminCourant;
      if (!noeud.enfants) return null;
      for (const enfant of noeud.enfants) {
        const resultat = trouver(enfant, cheminCourant);
        if (resultat) return resultat;
      }
      return null;
    };
    for (const domaine of this.obtenirDomaines()) {
      const chemin = trouver(domaine, []);
      if (chemin) return chemin;
    }
    return [];
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
