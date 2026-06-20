/**
 * Écran de sélection et d'export de compétences.
 */

import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { LIBELLES } from '../../libelles';
import { DonneesService } from '../../services/avecEtat/donnees.service';
import { ContexteService } from '../../services/avecEtat/contexte.service';
import { CompetenceService } from '../../services/sansEtat/competence.service';
import { ProjetService } from '../../services/sansEtat/projet.service';
import { CahierJournalService } from '../../services/sansEtat/cahier-journal.service';
import { McArbreCompetencesComponent } from '../../composants/mc-arbre-competences/mc-arbre-competences.component';
import { PopinExportCompetencesComponent } from '../../composants/popins/popin-export-competences/popin-export-competences.component';
import type { ResultatExportCompetences } from '../../composants/popins/popin-export-competences/popin-export-competences.component';
import { signal } from '@angular/core';

/**
 * Écran de gestion du panier de compétences.
 * Trois zones : sélecteur (avec filtres intégrés), panier persistant, export.
 */
@Component({
  selector: 'ecran-competences',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [McArbreCompetencesComponent, PopinExportCompetencesComponent],
  templateUrl: './ecran-competences.component.html',
  styleUrl: './ecran-competences.component.scss',
})
export class EcranCompetencesComponent {
  /** Constante centralisée des libellés. */
  protected readonly LIBELLES = LIBELLES;

  /** Service de données. */
  private readonly donneesService = inject(DonneesService);

  /** Contexte applicatif : panier de compétences persistant. */
  private readonly contexteService = inject(ContexteService);

  /** Service de compétences : résolution des libellés. */
  private readonly competenceService = inject(CompetenceService);

  /** Service de projets : export vers une période. */
  private readonly projetService = inject(ProjetService);

  /** Service du cahier journal : export vers une séance. */
  private readonly cahierJournalService = inject(CahierJournalService);

  /** Mode de la popin d'export actuellement ouverte. */
  protected readonly modeExport = signal<'projet' | 'seance'>('projet');

  /** `true` si la popin d'export est visible. */
  protected readonly popinExportVisible = signal(false);

  /** Panier courant depuis le contexte. */
  protected readonly panier = this.contexteService.panierCompetences;

  /** `true` si le panier contient au moins une compétence. */
  protected readonly panierNonVide = computed(() => this.panier().length > 0);

  /**
   * Libellés des compétences dans le panier, associés à leurs IDs.
   * @returns Tableau { id, libelle }.
   */
  protected readonly panierAvecLibelles = computed(() =>
    this.panier().map(id => ({
      id,
      libelle: this.competenceService.resoudreLibelle(id),
    })),
  );

  /**
   * Réagit à la sélection dans mc-selecteur-competences et met à jour le panier.
   * @param ids Nouveaux identifiants sélectionnés.
   */
  protected surSelectionChange(ids: string[]): void {
    this.contexteService.panierCompetences.set(ids);
  }

  /** Vide intégralement le panier. */
  protected viderPanier(): void {
    this.contexteService.panierCompetences.set([]);
  }

  /**
   * Retire une compétence du panier.
   * @param id Identifiant à retirer.
   */
  protected retirerDuPanier(id: string): void {
    this.contexteService.panierCompetences.update(ids => ids.filter(i => i !== id));
  }

  /** Ouvre la popin d'export vers un projet. */
  protected exporterVersProjet(): void {
    this.modeExport.set('projet');
    this.popinExportVisible.set(true);
  }

  /** Ouvre la popin d'export vers une séance. */
  protected exporterVersSeance(): void {
    this.modeExport.set('seance');
    this.popinExportVisible.set(true);
  }

  /** Ferme la popin d'export sans action. */
  protected annulerExport(): void {
    this.popinExportVisible.set(false);
  }

  /**
   * Traite le résultat de la popin d'export et appelle le service concerné.
   * @param resultat Résultat de la popin (cible + identifiants).
   */
  protected confirmerExport(resultat: ResultatExportCompetences): void {
    this.popinExportVisible.set(false);
    const competences = this.panier();

    if (resultat.cibleType === 'projet') {
      const projet = this.donneesService.donnees()?.projets.find(p => p.id === resultat.cibleId);
      const periodeIndex = parseInt(resultat.secondaireId, 10);
      const periode = projet?.periodes[periodeIndex];
      if (projet && periode) {
        const nouvellePeriode = {
          ...periode,
          competencesIds: [...new Set([...periode.competencesIds, ...competences])],
        };
        this.projetService.modifierPeriode(projet.id, periode, nouvellePeriode);
      }
    } else {
      const journee = this.donneesService
        .donnees()
        ?.cahierJournal.find(j => j.date === resultat.cibleId);
      const seance = journee?.seances.find(s => s.id === resultat.secondaireId);
      if (seance) {
        const nouvelleSeance = {
          ...seance,
          competencesIds: [...new Set([...(seance.competencesIds ?? []), ...competences])],
        };
        this.cahierJournalService.modifierSeance(resultat.cibleId, nouvelleSeance);
      }
    }

    this.contexteService.panierCompetences.set([]);
  }
}
