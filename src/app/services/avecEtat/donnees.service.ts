/**
 * Service central de l'application : porte le JSON complet et gère UNDO/REDO.
 * Toute mutation des données doit transiter par `executer()`.
 */

import { Injectable, Signal, WritableSignal, computed, signal } from '@angular/core';
import { Commande } from '../../modeles/commande.modele';
import { DonneesApplication } from '../../modeles/donnees-application.modele';

/**
 * Service stateful singleton : contient les données de l'application
 * et les piles UNDO/REDO.
 * Aucun composant ni service métier ne peut modifier les données directement.
 */
@Injectable({ providedIn: 'root' })
export class DonneesService {
  /** Signal interne portant les données courantes. */
  private readonly _donnees: WritableSignal<DonneesApplication | null> = signal(null);

  /** Pile des commandes exécutées, réversibles via `annuler()`. */
  private readonly _pileUndo: WritableSignal<Commande[]> = signal([]);

  /** Pile des commandes annulées, rétablissables via `refaire()`. */
  private readonly _pileRedo: WritableSignal<Commande[]> = signal([]);

  /** Indique si des données ont été modifiées depuis la dernière sauvegarde. */
  private readonly _modifieeDepuisSauvegarde: WritableSignal<boolean> = signal(false);

  /** Données courantes de l'application, ou `null` si non chargées. */
  public readonly donnees: Signal<DonneesApplication | null> = this._donnees.asReadonly();

  /** `true` si la pile UNDO contient au moins une commande. */
  public readonly peutAnnuler: Signal<boolean> = computed(() => this._pileUndo().length > 0);

  /** `true` si la pile REDO contient au moins une commande. */
  public readonly peutRefaire: Signal<boolean> = computed(() => this._pileRedo().length > 0);

  /** `true` si des données ont été modifiées depuis la dernière sauvegarde. */
  public readonly aDonneesModifiees: Signal<boolean> = this._modifieeDepuisSauvegarde.asReadonly();

  /**
   * Charge un jeu de données et réinitialise les piles UNDO/REDO.
   * Appeler cette méthode au chargement d'un fichier ou à la création d'un nouveau fichier.
   * @param donnees Données à charger — clonées pour isolation.
   */
  public charger(donnees: DonneesApplication): void {
    this._donnees.set(structuredClone(donnees));
    this._pileUndo.set([]);
    this._pileRedo.set([]);
    this._modifieeDepuisSauvegarde.set(false);
  }

  /**
   * Exécute une commande, met à jour les données et vide la pile REDO.
   * Après cette opération `aDonneesModifiees` vaut `true`.
   * @param commande Commande décrivant la mutation et son inverse.
   */
  public executer(commande: Commande): void {
    const courant = this._donnees();
    if (courant === null) {
      return;
    }
    this._donnees.set(commande.executer(courant));
    this._pileUndo.update(pile => [...pile, commande]);
    this._pileRedo.set([]);
    this._modifieeDepuisSauvegarde.set(true);
  }

  /**
   * Annule la dernière commande exécutée et la déplace dans la pile REDO.
   * Sans effet si la pile UNDO est vide ou si aucune donnée n'est chargée.
   */
  public annuler(): void {
    const pileUndo = this._pileUndo();
    const courant = this._donnees();
    if (pileUndo.length === 0 || courant === null) {
      return;
    }
    const commande = pileUndo[pileUndo.length - 1];
    this._donnees.set(commande.annuler(courant));
    this._pileUndo.update(p => p.slice(0, -1));
    this._pileRedo.update(p => [...p, commande]);
    this._modifieeDepuisSauvegarde.set(true);
  }

  /**
   * Rétablit la dernière commande annulée et la déplace dans la pile UNDO.
   * Sans effet si la pile REDO est vide ou si aucune donnée n'est chargée.
   */
  public refaire(): void {
    const pileRedo = this._pileRedo();
    const courant = this._donnees();
    if (pileRedo.length === 0 || courant === null) {
      return;
    }
    const commande = pileRedo[pileRedo.length - 1];
    this._donnees.set(commande.executer(courant));
    this._pileRedo.update(p => p.slice(0, -1));
    this._pileUndo.update(p => [...p, commande]);
    this._modifieeDepuisSauvegarde.set(true);
  }

  /**
   * Signale que les données viennent d'être sauvegardées.
   * Remet `aDonneesModifiees` à `false`.
   */
  public marquerCommeSauvegarde(): void {
    this._modifieeDepuisSauvegarde.set(false);
  }
}
