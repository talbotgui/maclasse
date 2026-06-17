/**
 * Service de sauvegarde automatique périodique.
 * Orchestre le chiffrement et le téléchargement du fichier de sauvegarde.
 */

import { Injectable, WritableSignal, inject, signal } from '@angular/core';
import { DonneesService } from '../avecEtat/donnees.service';
import { ContexteService } from '../avecEtat/contexte.service';
import { ChiffrementService } from './chiffrement.service';

/**
 * Service singleton gérant la sauvegarde automatique périodique et manuelle.
 * Injecte `DonneesService`, `ContexteService` et `ChiffrementService`.
 */
@Injectable({ providedIn: 'root' })
export class SauvegardeAutoService {
  /** Accès aux données et marquage post-sauvegarde. */
  private readonly _donneesService = inject(DonneesService);

  /** Contexte applicatif : mot de passe de chiffrement. */
  private readonly _contexteService = inject(ContexteService);

  /** Service de chiffrement AES-GCM. */
  private readonly _chiffrementService = inject(ChiffrementService);

  /** Date et heure de la dernière sauvegarde réussie, ou `null` si aucune. */
  public readonly dateDerniereSauvegarde: WritableSignal<Date | null> = signal(null);

  /** Référence au minuteur de sauvegarde automatique, `null` si inactif. */
  private _timer: ReturnType<typeof setInterval> | null = null;

  /**
   * Démarre le minuteur de sauvegarde automatique.
   * Le délai est lu depuis `configuration.delaiSauvegardeAutoMinutes` des données chargées.
   * Si le minuteur était déjà actif, il est réinitialisé.
   * À appeler après la première sauvegarde manuelle réussie.
   */
  public demarrer(): void {
    this.arreter();
    const delaiMinutes =
      this._donneesService.donnees()?.configuration.delaiSauvegardeAutoMinutes ?? 2;
    this._timer = setInterval(() => void this.sauvegarder(), delaiMinutes * 60_000);
  }

  /**
   * Arrête le minuteur de sauvegarde automatique.
   * Sans effet si aucun minuteur n'est actif.
   */
  public arreter(): void {
    if (this._timer !== null) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  /**
   * Effectue la sauvegarde : chiffrement des données, téléchargement du fichier ZIP,
   * puis mise à jour du signal `dateDerniereSauvegarde` et marquage des données comme sauvegardées.
   * Sans effet si aucune donnée n'est chargée ou si aucun mot de passe n'est défini dans le contexte.
   */
  public async sauvegarder(): Promise<void> {
    const donnees = this._donneesService.donnees();
    const motDePasse = this._contexteService.motDePasse;
    if (!donnees || !motDePasse) return;

    const blob = await this._chiffrementService.chiffrer(donnees, motDePasse);
    this._declencherTelechargement(blob);
    this._donneesService.marquerCommeSauvegarde();
    this.dateDerniereSauvegarde.set(new Date());
  }

  /**
   * `true` si le minuteur de sauvegarde automatique est actif.
   */
  public get timerActif(): boolean {
    return this._timer !== null;
  }

  /**
   * Déclenche le téléchargement du Blob ZIP dans le navigateur via un lien `<a>` virtuel.
   * Le nom du fichier inclut la date du jour au format ISO.
   * @param blob Blob ZIP à télécharger.
   */
  protected _declencherTelechargement(blob: Blob): void {
    const url = URL.createObjectURL(blob);
    const lien = document.createElement('a');
    lien.href = url;
    lien.download = `maclasse_${new Date().toISOString().slice(0, 10)}.zip`;
    document.body.appendChild(lien);
    lien.click();
    document.body.removeChild(lien);
    URL.revokeObjectURL(url);
  }
}
