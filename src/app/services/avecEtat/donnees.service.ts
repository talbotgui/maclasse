/**
 * Service central de l'application : porte le JSON complet et gère UNDO/REDO.
 * Toute mutation des données doit transiter par `executer()`.
 */

import { Injectable, Signal, WritableSignal, computed, signal } from '@angular/core';
import { Commande } from '../../modeles/commande.modele';
import { DonneesApplication } from '../../modeles/donnees-application.modele';
import { DateUtils } from '../../utilitaires/date.utils';

/**
 * Service stateful singleton : contient les données de l'application
 * et les piles UNDO/REDO.
 * Aucun composant ni service métier ne peut modifier les données directement.
 */
@Injectable({ providedIn: 'root' })
export class DonneesService {
  /** Signal interne portant les données courantes (écriture réservée à ce service). */
  private readonly donneesModifiables: WritableSignal<DonneesApplication | null> = signal(null);

  /** Pile des commandes exécutées, réversibles via `annuler()`. */
  private readonly pileUndo: WritableSignal<Commande[]> = signal([]);

  /** Pile des commandes annulées, rétablissables via `refaire()`. */
  private readonly pileRedo: WritableSignal<Commande[]> = signal([]);

  /** Indique si des données ont été modifiées depuis la dernière sauvegarde. */
  private readonly modifieeDepuisSauvegarde: WritableSignal<boolean> = signal(false);

  /** Données courantes de l'application, ou `null` si non chargées. */
  public readonly donnees: Signal<DonneesApplication | null> = this.donneesModifiables.asReadonly();

  /** `true` si la pile UNDO contient au moins une commande. */
  public readonly peutAnnuler: Signal<boolean> = computed(() => this.pileUndo().length > 0);

  /** `true` si la pile REDO contient au moins une commande. */
  public readonly peutRefaire: Signal<boolean> = computed(() => this.pileRedo().length > 0);

  /** Libellé de la prochaine commande annulable, ou `null` si la pile est vide. */
  public readonly libelleSommetUndo: Signal<string | null> = computed(() => {
    const pile = this.pileUndo();
    return pile.length > 0 ? pile[pile.length - 1].libelle : null;
  });

  /** Libellé de la prochaine commande rétablissable, ou `null` si la pile est vide. */
  public readonly libelleSommetRedo: Signal<string | null> = computed(() => {
    const pile = this.pileRedo();
    return pile.length > 0 ? pile[pile.length - 1].libelle : null;
  });

  /** `true` si des données ont été modifiées depuis la dernière sauvegarde. */
  public readonly aDonneesModifiees: Signal<boolean> = this.modifieeDepuisSauvegarde.asReadonly();

  /**
   * Charge un jeu de données et réinitialise les piles UNDO/REDO.
   *
   * Le recentrage du cahier journal sur la semaine suivante ne concerne que les
   * données d'exemple (création d'un nouveau fichier, consultation du référentiel) :
   * un fichier ZIP importé par l'utilisateur doit conserver ses dates telles quelles,
   * sans quoi chaque aller-retour de sauvegarde décalerait son cahier journal.
   *
   * @param donnees Données à charger — clonées pour isolation.
   * @param recentrerCahierJournalSurSemaineSuivante `true` pour décaler les dates du
   * cahier journal vers la semaine suivant la date courante (données d'exemple uniquement).
   * `false` par défaut : les dates sont conservées à l'identique.
   */
  public charger(
    donnees: DonneesApplication,
    recentrerCahierJournalSurSemaineSuivante = false,
  ): void {
    const clone = structuredClone(donnees);
    if (recentrerCahierJournalSurSemaineSuivante) {
      this.decalerCahierJournalVersSemaineSuivante(clone);
    }
    this.donneesModifiables.set(clone);
    this.pileUndo.set([]);
    this.pileRedo.set([]);
    this.modifieeDepuisSauvegarde.set(false);
  }

  /**
   * Décale toutes les dates du cahier journal pour qu'elles tombent dans la semaine
   * suivant la date courante, en conservant le jour de la semaine de chaque journée.
   * Sans effet si le cahier journal est vide.
   * @param donnees Données à muter (déjà clonées).
   */
  private decalerCahierJournalVersSemaineSuivante(donnees: DonneesApplication): void {
    if (donnees.cahierJournal.length === 0) {
      return;
    }
    const premiereDate = donnees.cahierJournal.reduce(
      (min, j) => (j.date < min ? j.date : min),
      donnees.cahierJournal[0].date,
    );
    const lundiOrigine = DateUtils.lundiDeLaSemaine(premiereDate);
    const lundiCible = DateUtils.lundiDeLaSemaineSuivante(DateUtils.dateAujourdhui());
    const delta = DateUtils.differenceEnJours(lundiOrigine, lundiCible);
    donnees.cahierJournal.forEach((j) => {
      j.date = DateUtils.ajouterJours(j.date, delta);
    });
  }

  /**
   * Exécute une commande, met à jour les données et vide la pile REDO.
   * Après cette opération `aDonneesModifiees` vaut `true`.
   * @param commande Commande décrivant la mutation et son inverse.
   */
  public executer(commande: Commande): void {
    const courant = this.donneesModifiables();
    if (courant === null) {
      return;
    }
    this.donneesModifiables.set(commande.executer(courant));
    this.pileUndo.update((pile) => [...pile, commande]);
    this.pileRedo.set([]);
    this.modifieeDepuisSauvegarde.set(true);
  }

  /**
   * Annule la dernière commande exécutée et la déplace dans la pile REDO.
   * Sans effet si la pile UNDO est vide ou si aucune donnée n'est chargée.
   */
  public annuler(): void {
    const pileUndoCourante = this.pileUndo();
    const courant = this.donneesModifiables();
    if (pileUndoCourante.length === 0 || courant === null) {
      return;
    }
    const commande = pileUndoCourante[pileUndoCourante.length - 1];
    this.donneesModifiables.set(commande.annuler(courant));
    this.pileUndo.update((p) => p.slice(0, -1));
    this.pileRedo.update((p) => [...p, commande]);
    this.modifieeDepuisSauvegarde.set(true);
  }

  /**
   * Rétablit la dernière commande annulée et la déplace dans la pile UNDO.
   * Sans effet si la pile REDO est vide ou si aucune donnée n'est chargée.
   */
  public refaire(): void {
    const pileRedoCourante = this.pileRedo();
    const courant = this.donneesModifiables();
    if (pileRedoCourante.length === 0 || courant === null) {
      return;
    }
    const commande = pileRedoCourante[pileRedoCourante.length - 1];
    this.donneesModifiables.set(commande.executer(courant));
    this.pileRedo.update((p) => p.slice(0, -1));
    this.pileUndo.update((p) => [...p, commande]);
    this.modifieeDepuisSauvegarde.set(true);
  }

  /**
   * Signale que les données viennent d'être sauvegardées.
   * Remet `aDonneesModifiees` à `false`.
   */
  public marquerCommeSauvegarde(): void {
    this.modifieeDepuisSauvegarde.set(false);
  }
}
