import {
  ChangeDetectionStrategy, Component, ElementRef, afterNextRender,
  inject, output, signal, viewChild,
} from '@angular/core';
import type { OutputEmitterRef } from '@angular/core';
import { ComposantBase } from '../../../composant-base';
import { ChiffrementService } from '../../../services/sansEtat/chiffrement.service';
import { ContexteService } from '../../../services/avecEtat/contexte.service';
import type { DonneesApplication } from '../../../modeles/donnees-application.modele';

/**
 * Popin de démarrage obligatoire affichée au lancement de l'application.
 * Non fermable (pas d'Échap, pas de bouton Fermer).
 *
 * Deux chemins possibles :
 * - **Créer** : charge `donnees-defaut.json` via `fetch()`.
 * - **Charger** : déchiffre un fichier ZIP avec le mot de passe saisi.
 *
 * Émet `demarrageTermine` avec les données chargées ;
 * l'écran démarrage appelle alors `DonneesService.charger()` et navigue.
 * En cas d'erreur, un message inline est affiché et la popin reste ouverte.
 */
@Component({
  selector: 'popin-demarrage',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './popin-demarrage.component.html',
  styleUrl: './popin-demarrage.component.scss',
})
export class PopinDemarrageComponent extends ComposantBase {
  /** Émis avec les données chargées ou déchiffrées dès qu'elles sont disponibles. */
  protected readonly demarrageTermine: OutputEmitterRef<DonneesApplication> =
    output<DonneesApplication>();

  /** Référence à l'élément `<dialog>` natif. */
  private readonly dialogEl = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  /** Service de déchiffrement du fichier ZIP. */
  private readonly chiffrementService = inject(ChiffrementService);

  /** Service de contexte — mémorise le mot de passe pour les sauvegardes ultérieures. */
  private readonly contexteService = inject(ContexteService);

  /** Fichier ZIP sélectionné par l'utilisateur, `null` si aucun. */
  private fichierSelectionne: File | null = null;

  /** Valeur courante du champ mot de passe. */
  protected readonly motDePasse = signal('');

  /** `true` pendant un chargement en cours (spinner + désactivation des boutons). */
  protected readonly enChargement = signal(false);

  /** Message d'erreur à afficher, `null` si aucune erreur. */
  protected readonly erreur = signal<string | null>(null);

  /** Ouvre la dialog au premier rendu (non closable, donc sans signal `visible`). */
  public constructor() {
    super();
    afterNextRender(() => {
      this.dialogEl().nativeElement.showModal();
    });
  }

  /**
   * Mémorise le fichier ZIP sélectionné dans l'input file.
   * @param event Événement de changement de l'input.
   */
  protected surSelectionFichier(event: Event): void {
    const fichiers = (event.target as HTMLInputElement).files;
    this.fichierSelectionne = fichiers?.[0] ?? null;
    this.erreur.set(null);
  }

  /**
   * Crée un nouveau fichier depuis les données d'exemple `donnees-defaut.json`.
   * Les dates du cahier journal sont décalées vers la semaine suivant la date courante
   * afin que les données d'exemple soient immédiatement pertinentes à l'ouverture.
   * Émet `demarrageTermine` en cas de succès, affiche une erreur sinon.
   */
  protected async creer(): Promise<void> {
    if (this.enChargement()) return;
    this.enChargement.set(true);
    this.erreur.set(null);
    try {
      const reponse = await fetch('/maclasse/donnees-defaut.json');
      if (!reponse.ok) throw new Error('Fichier introuvable');
      const donnees = (await reponse.json()) as DonneesApplication;
      this.demarrageTermine.emit(donnees);
    } catch {
      this.erreur.set(this.LIBELLES.demarrage.erreurFichier);
    } finally {
      this.enChargement.set(false);
    }
  }

  /**
   * Déchiffre le fichier ZIP sélectionné avec le mot de passe saisi.
   * Émet `demarrageTermine` en cas de succès, affiche l'erreur adaptée sinon.
   */
  protected async charger(): Promise<void> {
    if (this.enChargement() || !this.fichierSelectionne || !this.motDePasse().trim()) return;
    this.enChargement.set(true);
    this.erreur.set(null);
    try {
      const mdp = this.motDePasse().trim();
      const donnees = await this.chiffrementService.dechiffrer(this.fichierSelectionne, mdp);
      this.contexteService.motDePasse = mdp;
      this.demarrageTermine.emit(donnees);
    } catch (e) {
      this.erreur.set(
        e instanceof DOMException
          ? this.LIBELLES.demarrage.erreurMotDePasse
          : this.LIBELLES.demarrage.erreurFichier,
      );
    } finally {
      this.enChargement.set(false);
    }
  }

  /** `true` si le formulaire de chargement est valide (fichier et mot de passe présents). */
  protected get peutCharger(): boolean {
    return !!this.fichierSelectionne && !!this.motDePasse().trim() && !this.enChargement();
  }
}
