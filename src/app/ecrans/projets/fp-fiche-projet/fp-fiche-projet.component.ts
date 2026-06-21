/**
 * Sous-composant d'affichage en lecture seule de la fiche d'un projet.
 */

import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import type { InputSignal, OutputEmitterRef } from '@angular/core';
import { LIBELLES } from '../../../libelles';
import { McBoutonDestructionComponent } from '../../../composants/mc-bouton-destruction/mc-bouton-destruction.component';
import { CompetenceService } from '../../../services/sansEtat/competence.service';
import { DonneesService } from '../../../services/avecEtat/donnees.service';
import { DateUtils } from '../../../utilitaires/date.utils';
import type { Projet } from '../../../modeles/projet.modele';

/**
 * Fiche projet en lecture seule.
 * Affiche les informations générales et les périodes avec leurs compétences résolues.
 */
@Component({
  selector: 'fp-fiche-projet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [McBoutonDestructionComponent],
  templateUrl: './fp-fiche-projet.component.html',
  styleUrl: './fp-fiche-projet.component.scss',
})
export class FpFicheProjetComponent {
  /** Constante centralisée des libellés. */
  protected readonly LIBELLES = LIBELLES;

  /** Utilitaire de formatage de dates. */
  protected readonly DateUtils = DateUtils;

  /** Service de compétences pour la résolution des libellés. */
  private readonly competenceService = inject(CompetenceService);

  /** Service de données pour la résolution des noms d'élèves. */
  private readonly donneesService = inject(DonneesService);

  /** Projet à afficher. */
  public readonly projet: InputSignal<Projet> = input.required<Projet>();

  /** Émis quand l'utilisateur clique sur MODIFIER. */
  public readonly modifier: OutputEmitterRef<void> = output<void>();

  /** Émis quand l'utilisateur confirme la suppression. */
  public readonly supprimer: OutputEmitterRef<void> = output<void>();

  /** Émis quand l'utilisateur clique sur IMPRIMER. */
  public readonly imprimer: OutputEmitterRef<void> = output<void>();

  /**
   * Résout les noms des élèves associés au projet.
   * @returns Chaîne "NOM Prénom, NOM Prénom…"
   */
  protected get nomEleves(): string {
    const eleves = this.donneesService.donnees()?.classe.eleves ?? [];
    return this.projet()
      .elevesIds.map(id => {
        const e = eleves.find(el => el.id === id);
        return e ? `${e.nom.toUpperCase()} ${e.prenom}` : id;
      })
      .join(', ') || '—';
  }

  /**
   * Résout les libellés des compétences pour une période.
   * @param ids Identifiants des compétences.
   * @returns Tableau de libellés résolus.
   */
  protected libellesCompetences(ids: string[]): string[] {
    return ids.map(id => this.competenceService.resoudreLibelle(id)).filter(l => l.length > 0);
  }

  /** Délègue au parent l'action de modification. */
  protected onModifier(): void { this.modifier.emit(); }

  /** Délègue au parent l'action de suppression. */
  protected onSupprimer(): void { this.supprimer.emit(); }

  /** Délègue au parent l'action d'impression. */
  protected onImprimer(): void { this.imprimer.emit(); }
}
