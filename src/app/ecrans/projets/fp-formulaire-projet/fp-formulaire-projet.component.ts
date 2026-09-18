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
  signal,
} from '@angular/core';
import type { InputSignal, OutputEmitterRef, WritableSignal } from '@angular/core';
import { McAutoFocusDirective } from '../../../directives/mc-auto-focus.directive';
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
    McAutoFocusDirective,
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

  /** Demande le focus sur le premier champ à l'apparition du formulaire. */
  public readonly focusDemande: InputSignal<boolean> = input(false);

  /** Projet à éditer, ou `null` pour une création. */
  public readonly projet: InputSignal<Projet | null> = input<Projet | null>(null);

  /** Émis avec le projet modifié (ou créé) à la validation. */
  protected readonly enregistrer: OutputEmitterRef<Projet> = output<Projet>();

  /** Émis quand l'utilisateur annule la saisie. */
  protected readonly annuler: OutputEmitterRef<void> = output<void>();

  /** Liste des élèves de la classe pour les chips de sélection. */
  protected readonly eleves = computed(() => this.donneesService.donnees()?.classe.eleves ?? []);

  /** Copie locale mutable du projet en cours de saisie. */
  protected formProjet: Projet = this.creerProjetVide();

  /** Index de la période venant d'être ajoutée, à focaliser (`null` si aucune). */
  protected readonly indexAFocaliserPeriode: WritableSignal<number | null> = signal(null);

  /**
   * Identifiant du projet actuellement chargé dans `formProjet` (`null` en création),
   * `undefined` tant qu'aucun chargement n'a eu lieu.
   */
  private idFormulaireCharge: string | null | undefined = undefined;

  /**
   * Charge la copie locale lors d'un changement réel de projet édité.
   * Ignore les changements de référence de `projet()` qui ne correspondent pas à un
   * changement d'identité (ex. UNDO/REDO global), pour ne pas écraser la saisie en cours.
   */
  public constructor() {
    effect(() => {
      const p = this.projet();
      const id = p?.id ?? null;
      if (id === this.idFormulaireCharge) return;
      this.idFormulaireCharge = id;
      this.formProjet = p ? structuredClone(p) : this.creerProjetVide();
      this.cdr.markForCheck();
    });
  }

  /**
   * Ajoute un élève au projet en cours d'édition.
   * @param id UUID de l'élève.
   */
  protected ajouterEleve(id: string): void {
    if (!this.formProjet.elevesIds.includes(id)) {
      this.formProjet.elevesIds = [...this.formProjet.elevesIds, id];
    }
  }

  /**
   * Retire un élève du projet.
   * @param id UUID de l'élève.
   */
  protected retirerEleve(id: string): void {
    this.formProjet.elevesIds = this.formProjet.elevesIds.filter((e) => e !== id);
  }

  /** Ajoute une période vide à la fin de la liste et demande le focus dessus. */
  protected ajouterPeriode(): void {
    const nouvellePeriode: ProjetPeriode = {
      id: crypto.randomUUID(),
      periodeNom: '',
      debut: '',
      fin: '',
      description: '',
      competencesIds: [],
    };
    this.formProjet.periodes = [...this.formProjet.periodes, nouvellePeriode];
    this.indexAFocaliserPeriode.set(this.formProjet.periodes.length - 1);
  }

  /**
   * Supprime une période à l'index donné.
   * @param index Index à supprimer.
   */
  protected supprimerPeriode(index: number): void {
    this.formProjet.periodes = this.formProjet.periodes.filter((_, i) => i !== index);
    this.indexAFocaliserPeriode.set(null);
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

  /** Délègue l'annulation de la saisie au parent. */
  protected onAnnuler(): void {
    this.annuler.emit();
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
