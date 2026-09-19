import { signal } from '@angular/core';
import type { AvecNavigationGardee } from './gardes/modifications-non-enregistrees.garde';

/**
 * Classe de base abstraite des écrans « liste + fiche/formulaire » (élèves, projets).
 * Porte le mode édition, la popin d'avertissement de modifications non enregistrées
 * et la garde de navigation associée.
 */
export abstract class EcranEditionGardeeBase implements AvecNavigationGardee {
  /** `true` si le formulaire est en mode édition ou création. */
  protected readonly enModeEdition = signal(false);

  /** `true` si la popin d'avertissement est visible. */
  protected readonly popinAvertissementVisible = signal(false);

  /** Résolution de la promesse de navigation (garde CanDeactivate). */
  private resolveGarde: ((result: boolean) => void) | null = null;

  /** Action en attente de confirmation (sélection ou création). */
  private actionEnAttente: (() => void) | null = null;

  /**
   * Exécute l'action immédiatement, ou après confirmation de la popin d'avertissement
   * si une édition est en cours.
   * @param action Action à exécuter (sélection d'un élément, ouverture de la création…).
   */
  protected executerOuAvertir(action: () => void): void {
    if (this.enModeEdition()) {
      this.actionEnAttente = action;
      this.popinAvertissementVisible.set(true);
    } else {
      action();
    }
  }

  /** Confirme l'avertissement et exécute l'action en attente. */
  protected confirmerAvertissement(): void {
    this.popinAvertissementVisible.set(false);
    if (this.resolveGarde) {
      this.resolveGarde(true);
      this.resolveGarde = null;
    } else {
      this.actionEnAttente?.();
      this.actionEnAttente = null;
    }
    this.enModeEdition.set(false);
  }

  /** Annule l'avertissement et reste sur le formulaire. */
  protected annulerAvertissement(): void {
    this.popinAvertissementVisible.set(false);
    if (this.resolveGarde) {
      this.resolveGarde(false);
      this.resolveGarde = null;
    }
    this.actionEnAttente = null;
  }

  /** Active le mode édition de l'élément sélectionné. */
  protected activerEdition(): void {
    this.enModeEdition.set(true);
  }

  /** Lance l'impression de la fiche. */
  protected imprimer(): void {
    window.print();
  }

  /**
   * Implémentation de `AvecNavigationGardee`.
   * Retourne `true` immédiatement si aucune modification, sinon ouvre la popin
   * et attend la décision de l'utilisateur.
   * @returns Promesse résolue à `true` pour autoriser la navigation.
   */
  public confirmerNavigation(): Promise<boolean> {
    if (!this.enModeEdition()) return Promise.resolve(true);
    return new Promise<boolean>((resolve) => {
      this.resolveGarde = resolve;
      this.popinAvertissementVisible.set(true);
    });
  }
}
