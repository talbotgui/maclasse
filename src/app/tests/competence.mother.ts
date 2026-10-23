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
  public static domaineAvecSousDomaines(): Competence {
    return {
      id: 'd1',
      libelle: 'Français',
      enfants: [
        { id: 'd1-1', libelle: 'Lecture', enfants: [] },
        { id: 'd1-2', libelle: 'Écriture', enfants: [] },
      ],
    };
  }

  /**
   * Retourne un arbre à 4 niveaux comme le référentiel par défaut (domaine > cycle >
   * sous-domaine > compétence) : Français (`FR`) > Cycle 2 (`FR-C2`) > sous-domaines
   * Lire (`FR-C2-L`, deux feuilles dont une sous un nœud intermédiaire) et Écrire
   * (`FR-C2-E`, une feuille) ; Mathématiques (`MA`) > Cycle 2 (`MA-C2`) > Nombres
   * (`MA-C2-N`, une feuille).
   */
  public static arbreQuatreNiveaux(): Competence[] {
    return [
      {
        id: 'FR',
        libelle: 'Français',
        enfants: [
          {
            id: 'FR-C2',
            libelle: 'Cycle 2',
            enfants: [
              {
                id: 'FR-C2-L',
                libelle: 'Lire',
                enfants: [
                  { id: 'FR-C2-L-1', libelle: 'Identifier des mots' },
                  {
                    id: 'FR-C2-L-2',
                    libelle: 'Comprendre',
                    enfants: [{ id: 'FR-C2-L-2-1', libelle: 'Comprendre un texte lu' }],
                  },
                ],
              },
              {
                id: 'FR-C2-E',
                libelle: 'Écrire',
                enfants: [{ id: 'FR-C2-E-1', libelle: 'Copier un texte' }],
              },
            ],
          },
        ],
      },
      {
        id: 'MA',
        libelle: 'Mathématiques',
        enfants: [
          {
            id: 'MA-C2',
            libelle: 'Cycle 2',
            enfants: [
              {
                id: 'MA-C2-N',
                libelle: 'Nombres',
                enfants: [{ id: 'MA-C2-N-1', libelle: 'Dénombrer' }],
              },
            ],
          },
        ],
      },
    ];
  }

  public static arbreSimple(): Competence[] {
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
