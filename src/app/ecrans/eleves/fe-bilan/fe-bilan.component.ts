/**
 * Bilan en lecture seule de l'onglet Bilans de l'écran Élèves.
 */

import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import type { InputSignal, OutputEmitterRef } from '@angular/core';
import { LIBELLES } from '../../../libelles';
import { McBadgeStatutComponent } from '../../../composants/mc-badge-statut/mc-badge-statut.component';
import { McBoutonDestructionComponent } from '../../../composants/mc-bouton-destruction/mc-bouton-destruction.component';
import { McAutoFocusDirective } from '../../../directives/mc-auto-focus.directive';
import { CompetenceService } from '../../../services/sansEtat/competence.service';
import { BilanService } from '../../../services/sansEtat/bilan.service';
import { DateUtils } from '../../../utilitaires/date.utils';
import type { Bilan, LigneEvaluationLecture } from '../../../modeles/bilan.modele';
import type { StatutAcquisition } from '../../../modeles/referentiels.modele';

/**
 * Bilan replié ou déplié. La barre de titre porte le bouton de bascule (date et titre)
 * et les actions MODIFIER, DUPLIQUER, MONTER, DESCENDRE et SUPPRIMER ; le corps affiche
 * les trois textes et le tableau des évaluations sans colonne d'actions.
 */
@Component({
  selector: 'fe-bilan',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [McBadgeStatutComponent, McBoutonDestructionComponent, McAutoFocusDirective],
  templateUrl: './fe-bilan.component.html',
  styleUrl: './fe-bilan.component.scss',
})
export class FeBilanComponent {
  /** Constante centralisée des libellés. */
  protected readonly LIBELLES = LIBELLES;

  /** Bilan affiché. */
  public readonly bilan: InputSignal<Bilan> = input.required<Bilan>();

  /** Statuts d'acquisition du référentiel, pour afficher les évaluations. */
  public readonly statutsAcquisition: InputSignal<StatutAcquisition[]> =
    input<StatutAcquisition[]>([]);

  /** `true` si le corps du bilan est affiché. */
  public readonly deplie: InputSignal<boolean> = input(false);

  /** `true` si les actions sont indisponibles (un autre bilan est en cours d'édition). */
  public readonly actionsDesactivees: InputSignal<boolean> = input(false);

  /** `true` si le bilan peut monter d'une position. */
  public readonly peutMonter: InputSignal<boolean> = input(false);

  /** `true` si le bilan peut descendre d'une position. */
  public readonly peutDescendre: InputSignal<boolean> = input(false);

  /** `true` pour placer le focus sur le bouton MODIFIER (retour d'édition). */
  public readonly focusDemande: InputSignal<boolean> = input(false);

  /** Émis pour replier ou déplier le bilan. */
  protected readonly basculer: OutputEmitterRef<void> = output<void>();

  /** Émis pour passer le bilan en édition. */
  protected readonly modifier: OutputEmitterRef<void> = output<void>();

  /** Émis pour dupliquer le bilan. */
  protected readonly dupliquer: OutputEmitterRef<void> = output<void>();

  /** Émis pour monter le bilan d'une position. */
  protected readonly monter: OutputEmitterRef<void> = output<void>();

  /** Émis pour descendre le bilan d'une position. */
  protected readonly descendre: OutputEmitterRef<void> = output<void>();

  /** Émis pour supprimer le bilan (après confirmation). */
  protected readonly supprimer: OutputEmitterRef<void> = output<void>();

  /** Navigation dans l'arbre des compétences. */
  private readonly competenceService = inject(CompetenceService);

  /** Utilitaire de date exposé au template. */
  protected readonly DateUtils = DateUtils;

  /** Titre affiché, ou « (sans titre) ». */
  protected readonly titreAffiche = computed(() => this.bilan().titre || LIBELLES.bilans.sansTitre);

  /** Lignes du tableau des évaluations. */
  protected readonly lignes = computed<LigneEvaluationLecture[]>(() => {
    const statuts = this.statutsAcquisition();
    return this.bilan().evaluations.map((ev) => ({
      id: ev.id,
      competence: this.obtenirLibelleCompetence(ev.competenceId),
      statut: statuts.find((s) => s.id === ev.statutAcquisitionId) ?? null,
      commentaire: ev.commentaire,
    }));
  });

  /** Demande la bascule replié / déplié. */
  protected onBasculer(): void {
    this.basculer.emit();
  }

  /** Demande le passage en édition. */
  protected onModifier(): void {
    this.modifier.emit();
  }

  /** Demande la duplication. */
  protected onDupliquer(): void {
    this.dupliquer.emit();
  }

  /** Demande la montée d'une position. */
  protected onMonter(): void {
    this.monter.emit();
  }

  /** Demande la descente d'une position. */
  protected onDescendre(): void {
    this.descendre.emit();
  }

  /** Demande la suppression. */
  protected onSupprimer(): void {
    this.supprimer.emit();
  }

  /**
   * Libellé d'une compétence relatif à son sous-domaine (niveaux sous le niveau 3).
   * @param id Identifiant de la compétence.
   * @returns Libellé, ou l'identifiant si la compétence est introuvable (domaine désactivé…).
   */
  private obtenirLibelleCompetence(id: string): string {
    const chemin = this.competenceService.obtenirChemin(id);
    if (chemin.length === 0) return id;
    return chemin
      .slice(BilanService.NIVEAU_SOUS_DOMAINE)
      .map((n) => n.libelle)
      .join(BilanService.SEPARATEUR_LIBELLE);
  }
}
