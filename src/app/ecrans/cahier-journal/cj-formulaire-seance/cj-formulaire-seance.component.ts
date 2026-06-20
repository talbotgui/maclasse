/**
 * Sous-composant formulaire de saisie d'une séance du cahier journal.
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import type { InputSignal, OutputEmitterRef } from '@angular/core';
import { McAutoFocusDirective } from '../../../directives/mc-auto-focus.directive';
import { FormsModule } from '@angular/forms';
import { LIBELLES } from '../../../libelles';
import { McInputComponent } from '../../../composants/mc-input/mc-input.component';
import { McSelectComponent } from '../../../composants/mc-select/mc-select.component';
import { McChampHeureComponent } from '../../../composants/mc-champ-heure/mc-champ-heure.component';
import { McTextareaComponent } from '../../../composants/mc-textarea/mc-textarea.component';
import { McChipFiltreComponent } from '../../../composants/mc-chip-filtre/mc-chip-filtre.component';
import { McElevesConcernesComponent } from '../../../composants/mc-eleves-concernes/mc-eleves-concernes.component';
import { McSelecteurCompetencesComponent } from '../../../composants/mc-selecteur-competences/mc-selecteur-competences.component';
import type { Seance, JourneeJournal } from '../../../modeles/cahier-journal.modele';
import type { ElevesConcernes } from '../../../modeles/emploi-du-temps.modele';
import type { Competence } from '../../../modeles/referentiels.modele';

/**
 * Formulaire de saisie ou de modification d'une séance.
 * Utilisé en mode création (seance = null) ou en mode modification.
 */
@Component({
  selector: 'cj-formulaire-seance',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    McAutoFocusDirective,
    McInputComponent,
    McSelectComponent,
    McChampHeureComponent,
    McTextareaComponent,
    McChipFiltreComponent,
    McElevesConcernesComponent,
    McSelecteurCompetencesComponent,
  ],
  templateUrl: './cj-formulaire-seance.component.html',
  styleUrl: './cj-formulaire-seance.component.scss',
})
export class CjFormulaireSeanceComponent {
  /** Constante centralisée des libellés. */
  protected readonly LIBELLES = LIBELLES;

  /** Détection de changement pour mise à jour en mode OnPush. */
  private readonly cdr = inject(ChangeDetectorRef);

  /** Demande le focus sur le premier champ à l'apparition du formulaire. */
  public readonly focusDemande: InputSignal<boolean> = input(false);

  /** Séance à modifier (`null` pour une création). */
  public readonly seance: InputSignal<Seance | null> = input<Seance | null>(null);

  /** Journée cible (pour initialiser l'heure si créneaux existent). */
  public readonly journee: InputSignal<JourneeJournal | null> = input<JourneeJournal | null>(null);

  /** Domaines de niveau 1 pour les chips de disciplines. */
  public readonly domaines: InputSignal<Competence[]> = input<Competence[]>([]);

  /** Émis avec la séance complète à l'enregistrement. */
  public readonly enregistrer: OutputEmitterRef<Seance> = output<Seance>();

  /** Émis quand l'utilisateur annule. */
  public readonly annuler: OutputEmitterRef<void> = output<void>();

  /** Options de type de séance. */
  protected readonly optionsType = [
    { valeur: 'pedagogique', libelle: LIBELLES.cahierJournal.labelType + ' — Pédagogique' },
    { valeur: 'recreation', libelle: LIBELLES.cahierJournal.labelType + ' — Récréation' },
    { valeur: 'pauseDejeuner', libelle: LIBELLES.cahierJournal.labelType + ' — Pause déjeuner' },
  ];

  /** Copie mutable de la séance en cours d'édition. */
  protected formSeance: Seance = this.creerSeanceVide();

  /** Charge la copie locale à chaque changement de l'entrée. */
  public constructor() {
    effect(() => {
      const s = this.seance();
      this.formSeance = s ? structuredClone(s) : this.creerSeanceVide();
      this.cdr.markForCheck();
    });
  }

  /** Crée une séance vide avec les valeurs par défaut. */
  private creerSeanceVide(): Seance {
    return {
      id: crypto.randomUUID(),
      heureDebut: '08:00',
      heureFin: '09:00',
      type: 'pedagogique',
      disciplinesIds: [],
      competencesIds: [],
      elevesConcernes: { type: 'classe', groupes: [], elevesIds: [] },
    };
  }

  /**
   * Bascule une discipline dans la liste du formulaire.
   * @param id Identifiant du domaine.
   * @param actif Nouvel état.
   */
  protected basculerDiscipline(id: string, actif: boolean): void {
    const ids = this.formSeance.disciplinesIds ?? [];
    this.formSeance.disciplinesIds = actif
      ? [...ids, id]
      : ids.filter(d => d !== id);
  }

  /**
   * Met à jour les compétences depuis le sélecteur.
   * @param ids Nouveaux identifiants sélectionnés.
   */
  protected surSelectionCompetences(ids: string[]): void {
    this.formSeance.competencesIds = ids;
  }

  /**
   * Met à jour l'objet elevesConcernes.
   * @param val Nouvelle valeur émise par mc-eleves-concernes.
   */
  protected surElevesConcernesChange(val: ElevesConcernes): void {
    this.formSeance = { ...this.formSeance, elevesConcernes: val };
  }

  /** Émet la séance complète à l'enregistrement. */
  protected onEnregistrer(): void {
    const seance = structuredClone(this.formSeance);
    seance.titre = seance.titre || undefined;
    seance.objectifs = seance.objectifs || undefined;
    seance.deroulement = seance.deroulement || undefined;
    seance.ressources = seance.ressources || undefined;
    seance.description = seance.description || undefined;
    this.enregistrer.emit(seance);
  }
}
