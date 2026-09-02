import { Competence } from '../modeles/referentiels.modele';

/** Fournit des arbres de {@link Competence} prêts à l'emploi pour les tests. */
export class CompetenceMother {
  /**
   * Retourne un arbre à 2 domaines (Français, Mathématiques) avec 3 niveaux de profondeur.
   * Couvre les cas de recherche insensible à la casse/accents, de navigation par chemin
   * et d'extraction de libellé breadcrumb.
   */
  /**
   * Retourne un domaine N1 « Français » avec deux sous-domaines N2 feuilles
   * (`d1-1` Lecture, `d1-2` Écriture). Adapté à l'écran paramétrage qui n'affiche
   * que deux niveaux de profondeur.
   */
  static domaineAvecSousDomaines(): Competence {
    return {
      id: 'd1',
      libelle: 'Français',
      enfants: [
        { id: 'd1-1', libelle: 'Lecture', enfants: [] },
        { id: 'd1-2', libelle: 'Écriture', enfants: [] },
      ],
    };
  }

  static arbreSimple(): Competence[] {
    return [
      {
        id: 'FR',
        libelle: 'Français',
        enfants: [
          {
            id: 'FR-LECT',
            libelle: 'Lecture',
            enfants: [
              { id: 'FR-LECT-1', libelle: 'Comprendre un texte lu' },
              { id: 'FR-LECT-2', libelle: 'Lire à voix haute' },
            ],
          },
          { id: 'FR-ECRIT', libelle: 'Écriture', enfants: [] },
        ],
      },
      {
        id: 'MATH',
        libelle: 'Mathématiques',
        enfants: [{ id: 'MATH-NB', libelle: 'Nombres et calculs' }],
      },
    ];
  }
}
