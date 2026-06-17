/**
 * Service métier gérant les référentiels configurables de l'application.
 * Expose les contrôles d'utilisation et le CRUD de chaque type de référentiel.
 */

import { Injectable, inject } from '@angular/core';
import {
  ConfigEmploiDuTemps,
  FrequenceAbsence,
  Groupe,
  JourFerie,
  Periode,
  RaisonAbsence,
  StatutAcquisition,
  StatutEleve,
  TypeContact,
} from '../../modeles/referentiels.modele';
import { CommandeCreation } from '../../commandes/commande-creation';
import { CommandeModification } from '../../commandes/commande-modification';
import { CommandeSuppression } from '../../commandes/commande-suppression';
import { CommandeRemplacement } from '../../commandes/commande-par-index';
import { DonneesService } from '../avecEtat/donnees.service';

/**
 * Service sans état exposant les contrôles d'utilisation et le CRUD
 * pour chaque type de référentiel configuré dans l'écran paramétrage.
 */
@Injectable({ providedIn: 'root' })
export class ReferentielService {
  /** Accès aux données de l'application et soumission des commandes. */
  private readonly _donneesService = inject(DonneesService);

  // ── Contrôles d'utilisation ──────────────────────────────────────────────

  /**
   * Indique si un groupe est référencé par un élève, un créneau EDT ou une séance.
   * @param id Identifiant du groupe.
   */
  public estGroupeUtilise(id: string): boolean {
    const d = this._donneesService.donnees();
    if (!d) return false;
    return (
      d.classe.eleves.some(e => e.groupes.includes(id)) ||
      d.emploisDuTemps.some(edt =>
        edt.creneaux.some(c => c.elevesConcernes?.groupes.includes(id)),
      ) ||
      d.cahierJournal.some(j =>
        j.seances.some(s => s.elevesConcernes?.groupes.includes(id)),
      )
    );
  }

  /**
   * Indique si un statut d'acquisition est référencé dans un PPI ou un bulletin.
   * @param id Identifiant du statut.
   */
  public estStatutAcquisitionUtilise(id: string): boolean {
    const d = this._donneesService.donnees();
    if (!d) return false;
    return (
      d.ppi.some(p => p.competencesEntrees.some(c => c.evaluation === id)) ||
      d.bulletins.some(b => b.competencesEvaluees.some(c => c.evaluation === id))
    );
  }

  /**
   * Indique si un statut élève est référencé par au moins un élève.
   * @param id Identifiant du statut.
   */
  public estStatutEleveUtilise(id: string): boolean {
    return this._donneesService.donnees()?.classe.eleves.some(e => e.statut === id) ?? false;
  }

  /**
   * Indique si un type de contact est référencé dans les contacts d'un élève.
   * @param id Identifiant du type.
   */
  public estTypeContactUtilise(id: string): boolean {
    return (
      this._donneesService.donnees()?.classe.eleves.some(e =>
        e.contacts.some(c => c.type === id),
      ) ?? false
    );
  }

  /**
   * Indique si une période est référencée dans un projet ou un bulletin.
   * La période est identifiée par son nom (clé métier utilisée dans les projets et bulletins).
   * @param nom Nom de la période.
   */
  public estPeriodeUtilisee(nom: string): boolean {
    const d = this._donneesService.donnees();
    if (!d) return false;
    return (
      d.projets.some(p => p.periodes.some(pp => pp.periodeNom === nom)) ||
      d.bulletins.some(b => b.periode === nom)
    );
  }

  /**
   * Les raisons d'absence ne sont pas référencées dans les données — retourne toujours `false`.
   * @param _id Identifiant non utilisé.
   */
  public estRaisonAbsenceUtilisee(_id: string): boolean {
    return false;
  }

  /**
   * Les fréquences d'absence ne sont pas référencées dans les données — retourne toujours `false`.
   * @param _id Identifiant non utilisé.
   */
  public estFrequenceAbsenceUtilisee(_id: string): boolean {
    return false;
  }

  // ── CRUD Groupes ─────────────────────────────────────────────────────────

  /**
   * Ajoute un groupe dans les référentiels.
   * @param groupe Groupe à ajouter.
   */
  public ajouterGroupe(groupe: Groupe): void {
    this._donneesService.executer(
      new CommandeCreation(d => d.referentiels.groupes, groupe),
    );
  }

  /**
   * Modifie un groupe existant.
   * @param ancien Valeur actuelle.
   * @param nouveau Nouvelle valeur.
   */
  public modifierGroupe(ancien: Groupe, nouveau: Groupe): void {
    this._donneesService.executer(
      new CommandeModification(d => d.referentiels.groupes, ancien, nouveau),
    );
  }

  /**
   * Supprime un groupe des référentiels.
   * @param groupe Groupe à supprimer.
   */
  public supprimerGroupe(groupe: Groupe): void {
    const index =
      this._donneesService.donnees()?.referentiels.groupes.findIndex(g => g.id === groupe.id) ??
      -1;
    if (index === -1) return;
    this._donneesService.executer(
      new CommandeSuppression(d => d.referentiels.groupes, groupe, index),
    );
  }

  // ── CRUD Statuts d'acquisition ────────────────────────────────────────────

  /**
   * Ajoute un statut d'acquisition dans les référentiels.
   * @param statut Statut à ajouter.
   */
  public ajouterStatutAcquisition(statut: StatutAcquisition): void {
    this._donneesService.executer(
      new CommandeCreation(d => d.referentiels.statutsAcquisition, statut),
    );
  }

  /**
   * Modifie un statut d'acquisition.
   * @param ancien Valeur actuelle.
   * @param nouveau Nouvelle valeur.
   */
  public modifierStatutAcquisition(ancien: StatutAcquisition, nouveau: StatutAcquisition): void {
    this._donneesService.executer(
      new CommandeModification(d => d.referentiels.statutsAcquisition, ancien, nouveau),
    );
  }

  /**
   * Supprime un statut d'acquisition.
   * @param statut Statut à supprimer.
   */
  public supprimerStatutAcquisition(statut: StatutAcquisition): void {
    const index =
      this._donneesService
        .donnees()
        ?.referentiels.statutsAcquisition.findIndex(s => s.id === statut.id) ?? -1;
    if (index === -1) return;
    this._donneesService.executer(
      new CommandeSuppression(d => d.referentiels.statutsAcquisition, statut, index),
    );
  }

  // ── CRUD Statuts élève ────────────────────────────────────────────────────

  /**
   * Ajoute un statut élève.
   * @param statut Statut à ajouter.
   */
  public ajouterStatutEleve(statut: StatutEleve): void {
    this._donneesService.executer(
      new CommandeCreation(d => d.referentiels.statutsEleve, statut),
    );
  }

  /**
   * Modifie un statut élève.
   * @param ancien Valeur actuelle.
   * @param nouveau Nouvelle valeur.
   */
  public modifierStatutEleve(ancien: StatutEleve, nouveau: StatutEleve): void {
    this._donneesService.executer(
      new CommandeModification(d => d.referentiels.statutsEleve, ancien, nouveau),
    );
  }

  /**
   * Supprime un statut élève.
   * @param statut Statut à supprimer.
   */
  public supprimerStatutEleve(statut: StatutEleve): void {
    const index =
      this._donneesService
        .donnees()
        ?.referentiels.statutsEleve.findIndex(s => s.id === statut.id) ?? -1;
    if (index === -1) return;
    this._donneesService.executer(
      new CommandeSuppression(d => d.referentiels.statutsEleve, statut, index),
    );
  }

  // ── CRUD Types de contact ─────────────────────────────────────────────────

  /**
   * Ajoute un type de contact.
   * @param type Type à ajouter.
   */
  public ajouterTypeContact(type: TypeContact): void {
    this._donneesService.executer(
      new CommandeCreation(d => d.referentiels.typesContact, type),
    );
  }

  /**
   * Modifie un type de contact.
   * @param ancien Valeur actuelle.
   * @param nouveau Nouvelle valeur.
   */
  public modifierTypeContact(ancien: TypeContact, nouveau: TypeContact): void {
    this._donneesService.executer(
      new CommandeModification(d => d.referentiels.typesContact, ancien, nouveau),
    );
  }

  /**
   * Supprime un type de contact.
   * @param type Type à supprimer.
   */
  public supprimerTypeContact(type: TypeContact): void {
    const index =
      this._donneesService
        .donnees()
        ?.referentiels.typesContact.findIndex(t => t.id === type.id) ?? -1;
    if (index === -1) return;
    this._donneesService.executer(
      new CommandeSuppression(d => d.referentiels.typesContact, type, index),
    );
  }

  // ── CRUD Raisons d'absence ────────────────────────────────────────────────

  /**
   * Ajoute une raison d'absence.
   * @param raison Raison à ajouter.
   */
  public ajouterRaisonAbsence(raison: RaisonAbsence): void {
    this._donneesService.executer(
      new CommandeCreation(d => d.referentiels.raisonsAbsence, raison),
    );
  }

  /**
   * Modifie une raison d'absence.
   * @param ancienne Valeur actuelle.
   * @param nouvelle Nouvelle valeur.
   */
  public modifierRaisonAbsence(ancienne: RaisonAbsence, nouvelle: RaisonAbsence): void {
    this._donneesService.executer(
      new CommandeModification(d => d.referentiels.raisonsAbsence, ancienne, nouvelle),
    );
  }

  /**
   * Supprime une raison d'absence.
   * @param raison Raison à supprimer.
   */
  public supprimerRaisonAbsence(raison: RaisonAbsence): void {
    const index =
      this._donneesService
        .donnees()
        ?.referentiels.raisonsAbsence.findIndex(r => r.id === raison.id) ?? -1;
    if (index === -1) return;
    this._donneesService.executer(
      new CommandeSuppression(d => d.referentiels.raisonsAbsence, raison, index),
    );
  }

  // ── CRUD Fréquences d'absence ─────────────────────────────────────────────

  /**
   * Ajoute une fréquence d'absence.
   * @param frequence Fréquence à ajouter.
   */
  public ajouterFrequenceAbsence(frequence: FrequenceAbsence): void {
    this._donneesService.executer(
      new CommandeCreation(d => d.referentiels.frequencesAbsence, frequence),
    );
  }

  /**
   * Modifie une fréquence d'absence.
   * @param ancienne Valeur actuelle.
   * @param nouvelle Nouvelle valeur.
   */
  public modifierFrequenceAbsence(ancienne: FrequenceAbsence, nouvelle: FrequenceAbsence): void {
    this._donneesService.executer(
      new CommandeModification(d => d.referentiels.frequencesAbsence, ancienne, nouvelle),
    );
  }

  /**
   * Supprime une fréquence d'absence.
   * @param frequence Fréquence à supprimer.
   */
  public supprimerFrequenceAbsence(frequence: FrequenceAbsence): void {
    const index =
      this._donneesService
        .donnees()
        ?.referentiels.frequencesAbsence.findIndex(f => f.id === frequence.id) ?? -1;
    if (index === -1) return;
    this._donneesService.executer(
      new CommandeSuppression(d => d.referentiels.frequencesAbsence, frequence, index),
    );
  }

  // ── CRUD Périodes ─────────────────────────────────────────────────────────

  /**
   * Ajoute une période dans les référentiels.
   * @param periode Période à ajouter.
   */
  public ajouterPeriode(periode: Periode): void {
    this._donneesService.executer(
      new CommandeCreation(d => d.referentiels.periodes, periode),
    );
  }

  /**
   * Modifie une période retrouvée par son identifiant.
   * @param ancienne Période actuelle.
   * @param nouvelle Nouvelle période.
   */
  public modifierPeriode(ancienne: Periode, nouvelle: Periode): void {
    const index =
      this._donneesService.donnees()?.referentiels.periodes.findIndex(p => p.id === ancienne.id) ??
      -1;
    if (index === -1) return;
    this._donneesService.executer(
      new CommandeModification(d => d.referentiels.periodes, ancienne, nouvelle),
    );
  }

  /**
   * Supprime une période retrouvée par son identifiant.
   * @param periode Période à supprimer.
   */
  public supprimerPeriode(periode: Periode): void {
    const index =
      this._donneesService.donnees()?.referentiels.periodes.findIndex(p => p.id === periode.id) ??
      -1;
    if (index === -1) return;
    this._donneesService.executer(
      new CommandeSuppression(d => d.referentiels.periodes, periode, index),
    );
  }

  // ── CRUD Jours fériés ─────────────────────────────────────────────────────

  /**
   * Ajoute un jour férié dans les référentiels.
   * @param jourFerie Jour férié à ajouter.
   */
  public ajouterJourFerie(jourFerie: JourFerie): void {
    this._donneesService.executer(
      new CommandeCreation(d => d.referentiels.joursFeries, jourFerie),
    );
  }

  /**
   * Modifie un jour férié retrouvé par son identifiant.
   * @param ancien Jour férié actuel.
   * @param nouveau Nouveau jour férié.
   */
  public modifierJourFerie(ancien: JourFerie, nouveau: JourFerie): void {
    const index =
      this._donneesService.donnees()?.referentiels.joursFeries.findIndex(j => j.id === ancien.id) ??
      -1;
    if (index === -1) return;
    this._donneesService.executer(
      new CommandeModification(d => d.referentiels.joursFeries, ancien, nouveau),
    );
  }

  /**
   * Supprime un jour férié retrouvé par son identifiant.
   * @param jourFerie Jour férié à supprimer.
   */
  public supprimerJourFerie(jourFerie: JourFerie): void {
    const index =
      this._donneesService.donnees()?.referentiels.joursFeries.findIndex(j => j.id === jourFerie.id) ??
      -1;
    if (index === -1) return;
    this._donneesService.executer(
      new CommandeSuppression(d => d.referentiels.joursFeries, jourFerie, index),
    );
  }

  // ── Configuration EDT ─────────────────────────────────────────────────────

  /**
   * Remplace la configuration globale de l'emploi du temps.
   * @param ancienne Configuration actuelle (conservée pour UNDO).
   * @param nouvelle Nouvelle configuration.
   */
  public modifierConfigEmploiDuTemps(
    ancienne: ConfigEmploiDuTemps,
    nouvelle: ConfigEmploiDuTemps,
  ): void {
    this._donneesService.executer(
      new CommandeRemplacement<ConfigEmploiDuTemps>(
        (d, v) => {
          d.referentiels.configEmploiDuTemps = v;
        },
        ancienne,
        nouvelle,
      ),
    );
  }
}
