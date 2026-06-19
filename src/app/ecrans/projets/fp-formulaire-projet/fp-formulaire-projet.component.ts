/**
 * Sous-composant formulaire d'édition et de création d'un projet.
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import type { InputSignal, OutputEmitterRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LIBELLES } from '../../../libelles';
import { DonneesService } from '../../../services/avecEtat/donnees.service';
import { McInputComponent } from '../../../composants/mc-input/mc-input.component';
import { McTextareaComponent } from '../../../composants/mc-textarea/mc-textarea.component';
import { McChipFiltreComponent } from '../../../composants/mc-chip-filtre/mc-chip-filtre.component';
import { McBoutonDestructionComponent } from '../../../composants/mc-bouton-destruction/mc-bouton-destruction.component';
import { McSelecteurCompetencesComponent } from '../../../composants/mc-selecteur-competences/mc-selecteur-competences.component';
import type { Projet, ProjetPeriode } from '../../../modeles/projet.modele';

/**
 * Formulaire d'édition d'un projet.
 * Reçoit un projet en entrée (null = création), émet les données à la sauvegarde.
 */
@Component({
  selector: 'fp-formulaire-projet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    McInputComponent,
    McTextareaComponent,
    McChipFiltreComponent,
    McBoutonDestructionComponent,
    McSelecteurCompetencesComponent,
  ],
  templateUrl: './fp-formulaire-projet.component.html',
  styleUrl: './fp-formulaire-projet.component.scss',
})
export class FpFormulaireProjetComponent {
  /** Constante centralisée des libellés. */
  protected readonly LIBELLES = LIBELLES;

  /** Détection de changement pour mise à jour manuelle en mode OnPush. */
  private readonly cdr = inject(ChangeDetectorRef);

  /** Service de données pour la liste des élèves. */
  private readonly donneesService = inject(DonneesService);

  /** Projet à éditer, ou `null` pour une création. */
  public readonly projet: InputSignal<Projet | null> = input<Projet | null>(null);

  /** Émis avec le projet modifié (ou créé) à la validation. */
  public readonly enregistrer: OutputEmitterRef<Projet> = output<Projet>();

  /** Émis quand l'utilisateur annule la saisie. */
  public readonly annuler: OutputEmitterRef<void> = output<void>();

  /** Liste des élèves de la classe pour les chips de sélection. */
  protected readonly eleves = computed(
    () => this.donneesService.donnees()?.classe.eleves ?? [],
  );

  /** Copie locale mutable du projet en cours de saisie. */
  protected formProjet: Projet = this.creerProjetVide();

  /** Charge la copie locale à chaque changement du projet reçu en entrée. */
  public constructor() {
    effect(() => {
      const p = this.projet();
      this.formProjet = p ? structuredClone(p) : this.creerProjetVide();
      this.cdr.markForCheck();
    });
  }

  /**
   * Bascule l'appartenance d'un élève pour le projet en cours d'édition.
   * @param id UUID de l'élève.
   * @param actif Nouvel état du chip.
   */
  protected basculerEleve(id: string, actif: boolean): void {
    if (actif && !this.formProjet.elevesIds.includes(id)) {
      this.formProjet.elevesIds = [...this.formProjet.elevesIds, id];
    } else if (!actif) {
      this.formProjet.elevesIds = this.formProjet.elevesIds.filter(e => e !== id);
    }
  }

  /** Ajoute une période vide à la fin de la liste. */
  protected ajouterPeriode(): void {
    const nouvellePeriode: ProjetPeriode = {
      periodeNom: '',
      debut: '',
      fin: '',
      description: '',
      competencesIds: [],
    };
    this.formProjet.periodes = [...this.formProjet.periodes, nouvellePeriode];
  }

  /**
   * Supprime une période à l'index donné.
   * @param index Index à supprimer.
   */
  protected supprimerPeriode(index: number): void {
    this.formProjet.periodes = this.formProjet.periodes.filter((_, i) => i !== index);
  }

  /**
   * Met à jour les compétences d'une période.
   * @param index Index de la période.
   * @param ids Nouveaux identifiants de compétences.
   */
  protected surSelectionCompetences(index: number, ids: string[]): void {
    this.formProjet.periodes = this.formProjet.periodes.map((p, i) =>
      i === index ? { ...p, competencesIds: ids } : p,
    );
  }

  /** Émet le projet modifié au parent pour persistence. */
  protected onEnregistrer(): void {
    this.enregistrer.emit(structuredClone(this.formProjet));
  }

  /** Crée un objet Projet vide pour les créations. */
  private creerProjetVide(): Projet {
    return {
      id: crypto.randomUUID(),
      nom: '',
      description: '',
      elevesIds: [],
      periodes: [],
    };
  }
}
