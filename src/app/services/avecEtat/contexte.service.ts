/**
 * Service de contexte global : thème visuel, sélections courantes et panier de compétences.
 * Données transverses non liées à un écran spécifique.
 */

import { Injectable, WritableSignal, signal } from '@angular/core';

/** Séquence cyclique des thèmes disponibles. */
const THEMES = ['defaut', 'foret', 'crepuscule', 'terre', 'contraste'] as const;

/** Clé de stockage du thème actif dans le `localStorage`. */
const CLE_THEME = 'mc_theme';

/**
 * Service stateful singleton exposant le thème actif, les sélections persistantes
 * entre écrans et le panier de compétences.
 */
@Injectable({ providedIn: 'root' })
export class ContexteService {
  /** Identifiant du thème visuel actif, persisté dans le `localStorage`. */
  public readonly themeActif: WritableSignal<string>;

  /** ID du dernier élève sélectionné — conservé lors des changements d'écran. */
  public readonly eleveSelectionne: WritableSignal<string | null> = signal(null);

  /** ISO date du dernier jour consulté dans le cahier journal. */
  public readonly jourCourantCahierJournal: WritableSignal<string | null> = signal(null);

  /** IDs des compétences présentes dans le panier (écran Compétences). */
  public readonly panierCompetences: WritableSignal<string[]> = signal([]);

  /** Mot de passe de chiffrement saisi au chargement — jamais persisté. */
  public motDePasse: string | null = null;

  /** Initialise le thème depuis le `localStorage` et l'applique immédiatement. */
  public constructor() {
    const themeStocke = localStorage.getItem(CLE_THEME) ?? 'defaut';
    this.themeActif = signal(themeStocke);
    this.appliquerTheme(themeStocke);
  }

  /**
   * Passe au thème suivant dans le cycle des thèmes disponibles.
   * Le nouveau thème est appliqué au document et persisté dans le `localStorage`.
   */
  public basculerTheme(): void {
    const indexCourant = THEMES.indexOf(this.themeActif() as (typeof THEMES)[number]);
    const suivant = THEMES[(indexCourant + 1) % THEMES.length];
    this.themeActif.set(suivant);
    this.appliquerTheme(suivant);
    localStorage.setItem(CLE_THEME, suivant);
  }

  /**
   * Applique un thème en définissant l'attribut `data-theme` sur l'élément `<html>`.
   * Pour le thème par défaut, l'attribut est supprimé (thème par défaut via `:root`).
   * @param id Identifiant du thème à appliquer.
   */
  public appliquerTheme(id: string): void {
    if (id === 'defaut') {
      delete document.documentElement.dataset['theme'];
    } else {
      document.documentElement.dataset['theme'] = id;
    }
  }
}
