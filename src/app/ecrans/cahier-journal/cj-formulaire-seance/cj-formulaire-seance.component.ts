/**
 * Sous-composant formulaire de saisie d'une séance du cahier journal.
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
  untracked,
} from '@angular/core';
import type { InputSignal, OutputEmitterRef, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { McAutoFocusDirective } from '../../../directives/mc-auto-focus.directive';
import { LIBELLES } from '../../../libelles';
import { McInputComponent } from '../../../composants/mc-input/mc-input.component';
import { McSelectComponent } from '../../../composants/mc-select/mc-select.component';
import { McChampHeureComponent } from '../../../composants/mc-champ-heure/mc-champ-heure.component';
import { McTextareaComponent } from '../../../composants/mc-textarea/mc-textarea.component';
import { McChipFiltreComponent } from '../../../composants/mc-chip-filtre/mc-chip-filtre.component';
import { McElevesConcernesComponent } from '../../../composants/mc-eleves-concernes/mc-eleves-concernes.component';
import { McSelecteurCompetencesComponent } from '../../../composants/mc-selecteur-competences/mc-selecteur-competences.component';
import type { Seance, JourneeJournal } from '../../../modeles/cahier-journal.modele';
import type { ElevesConcernes, TypeCreneau } from '../../../modeles/emploi-du-temps.modele';
import type { Competence } from '../../../modeles/referentiels.modele';

/** Structure typée du formulaire réactif de saisie d'une séance. */
interface FormulaireSeance {
  /** Heure de début au format `HH:MM`. */
  heureDebut: FormControl<string>;
  /** Heure de fin au format `HH:MM`. */
  heureFin: FormControl<string>;
  /** Nature de la séance. */
  type: FormControl<TypeCreneau>;
  /** Titre libre de la séance. */
  titre: FormControl<string>;
  /** Objectifs pédagogiques. */
  objectifs: FormControl<string>;
  /** Description du déroulement. */
  deroulement: FormControl<string>;
  /** Ressources et matériaux utilisés. */
  ressources: FormControl<string>;
  /** Description synthétique de la séance. */
  description: FormControl<string>;
  /** Périmètre des élèves concernés. */
  elevesConcernes: FormControl<ElevesConcernes>;
}

/**
 * Formulaire de saisie ou de modification d'une séance.
 * Utilisé en mode création (seance = null) ou en mode modification.
 */
@Component({
  selector: 'cj-formulaire-seance',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
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
  /** Valeur par défaut du périmètre d'élèves concernés (toute la classe). */
  private static readonly ELEVES_CONCERNES_DEFAUT: ElevesConcernes = {
    type: 'classe',
    groupes: [],
    elevesIds: [],
  };

  /** Heures de secours si le parent ne fournit pas `heuresParDefaut` (cas hors écran cahier journal). */
  private static readonly HEURES_PAR_DEFAUT_SECOURS = { heureDebut: '08:00', heureFin: '09:00' };

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

  /**
   * Heures de début/fin proposées par défaut en mode création, calculées par le parent
   * selon la position d'insertion choisie. Ignorées en mode modification.
   */
  public readonly heuresParDefaut: InputSignal<{ heureDebut: string; heureFin: string }> = input<{
    heureDebut: string;
    heureFin: string;
  }>(CjFormulaireSeanceComponent.HEURES_PAR_DEFAUT_SECOURS);

  /** Domaines de niveau 1 pour les chips de disciplines. */
  public readonly domaines: InputSignal<Competence[]> = input<Competence[]>([]);

  /** Émis avec la séance complète à l'enregistrement. */
  protected readonly enregistrer: OutputEmitterRef<Seance> = output<Seance>();

  /** Émis quand l'utilisateur annule. */
  protected readonly annuler: OutputEmitterRef<void> = output<void>();

  /** Options de type de séance. */
  protected readonly optionsType = [
    { valeur: 'pedagogique', libelle: LIBELLES.cahierJournal.labelType + ' — Pédagogique' },
    { valeur: 'recreation', libelle: LIBELLES.cahierJournal.labelType + ' — Récréation' },
    { valeur: 'pauseDejeuner', libelle: LIBELLES.cahierJournal.labelType + ' — Pause déjeuner' },
  ];

  /** Identifiant de la séance en cours d'édition (conservé hors formulaire réactif). */
  private idSeance: string = crypto.randomUUID();

  /** Disciplines sélectionnées, pilotées par les chips (hors formulaire réactif, pas de CVA). */
  protected readonly disciplinesIdsInternes = signal<string[]>([]);

  /** Compétences sélectionnées, pilotées par le sélecteur (hors formulaire réactif, pas de CVA). */
  protected readonly competencesIds = signal<string[]>([]);

  /** Disciplines d'origine à l'ouverture du formulaire, pour la détection de modifications. */
  private disciplinesOrigine: string[] = [];

  /** Compétences d'origine à l'ouverture du formulaire, pour la détection de modifications. */
  private competencesOrigine: string[] = [];

  /** Formulaire réactif de saisie de la séance. */
  protected readonly form: FormGroup<FormulaireSeance> = new FormGroup<FormulaireSeance>(
    {
      heureDebut: new FormControl('', { nonNullable: true, validators: Validators.required }),
      heureFin: new FormControl('', { nonNullable: true, validators: Validators.required }),
      type: new FormControl<TypeCreneau>('pedagogique', {
        nonNullable: true,
        validators: Validators.required,
      }),
      titre: new FormControl('', { nonNullable: true }),
      objectifs: new FormControl('', { nonNullable: true }),
      deroulement: new FormControl('', { nonNullable: true }),
      ressources: new FormControl('', { nonNullable: true }),
      description: new FormControl('', { nonNullable: true }),
      elevesConcernes: new FormControl<ElevesConcernes>(
        CjFormulaireSeanceComponent.ELEVES_CONCERNES_DEFAUT,
        { nonNullable: true },
      ),
    },
    { validators: CjFormulaireSeanceComponent.validerPlageHoraire },
  );

  /** Type de séance sélectionné, dérivé réactivement du formulaire pour piloter l'affichage. */
  protected readonly typeSelectionne: Signal<TypeCreneau> = toSignal(
    this.form.controls.type.valueChanges,
    { initialValue: this.form.controls.type.value },
  );

  /** `true` dès que l'utilisateur a tenté d'enregistrer au moins une fois. */
  protected readonly soumissionTentee = signal(false);

  /** `true` si le formulaire est actuellement invalide, dérivé réactivement de son statut. */
  private readonly formInvalide: Signal<boolean> = toSignal(
    this.form.statusChanges.pipe(map((statut) => statut !== 'VALID')),
    { initialValue: this.form.invalid },
  );

  /** Message d'erreur à afficher, `null` tant qu'aucune tentative d'enregistrement invalide. */
  protected readonly messageErreur = computed<string | null>(() => {
    if (!this.soumissionTentee() || !this.formInvalide()) return null;
    if (this.form.hasError('plageHoraireInvalide')) {
      return LIBELLES.cahierJournal.erreurPlageHoraire;
    }
    return LIBELLES.cahierJournal.erreurChampsObligatoires;
  });

  /** Charge la copie locale à chaque changement de l'entrée. */
  public constructor() {
    effect(() => {
      const s = this.seance();
      const valeurs = s ?? untracked(() => this.creerValeursVides());
      this.idSeance = valeurs.id;
      this.form.reset(
        {
          heureDebut: valeurs.heureDebut,
          heureFin: valeurs.heureFin,
          type: valeurs.type,
          titre: valeurs.titre ?? '',
          objectifs: valeurs.objectifs ?? '',
          deroulement: valeurs.deroulement ?? '',
          ressources: valeurs.ressources ?? '',
          description: valeurs.description ?? '',
          elevesConcernes:
            valeurs.elevesConcernes ?? CjFormulaireSeanceComponent.ELEVES_CONCERNES_DEFAUT,
        },
        { emitEvent: false },
      );
      this.disciplinesIdsInternes.set(valeurs.disciplinesIds ?? []);
      this.disciplinesOrigine = valeurs.disciplinesIds ?? [];
      this.competencesIds.set(valeurs.competencesIds ?? []);
      this.competencesOrigine = valeurs.competencesIds ?? [];
      this.soumissionTentee.set(false);
      this.cdr.markForCheck();
    });
  }

  /**
   * Indique si le formulaire contient des modifications non enregistrées par rapport
   * à sa valeur d'origine (champs réactifs, disciplines et compétences).
   * @returns `true` si au moins un champ a été modifié depuis le chargement.
   */
  public estModifie(): boolean {
    return (
      this.form.dirty ||
      JSON.stringify(this.disciplinesIdsInternes()) !== JSON.stringify(this.disciplinesOrigine) ||
      JSON.stringify(this.competencesIds()) !== JSON.stringify(this.competencesOrigine)
    );
  }

  /** Crée une séance vide avec les valeurs par défaut, selon les heures proposées par le parent. */
  private creerValeursVides(): Seance {
    const { heureDebut, heureFin } = this.heuresParDefaut();
    return {
      id: crypto.randomUUID(),
      heureDebut,
      heureFin,
      type: 'pedagogique',
      disciplinesIds: [],
      competencesIds: [],
      elevesConcernes: CjFormulaireSeanceComponent.ELEVES_CONCERNES_DEFAUT,
    };
  }

  /**
   * Valide que l'heure de fin est postérieure à l'heure de début.
   * @param groupe Groupe de contrôles portant `heureDebut`/`heureFin`.
   * @returns Erreur `plageHoraireInvalide` si l'heure de fin n'est pas après l'heure de début.
   */
  private static validerPlageHoraire(groupe: AbstractControl): ValidationErrors | null {
    const debut = groupe.get('heureDebut')?.value;
    const fin = groupe.get('heureFin')?.value;
    if (debut && fin && fin <= debut) {
      return { plageHoraireInvalide: true };
    }
    return null;
  }

  /**
   * Bascule une discipline dans la liste du formulaire.
   * @param id Identifiant du domaine.
   * @param actif Nouvel état.
   */
  protected basculerDiscipline(id: string, actif: boolean): void {
    this.disciplinesIdsInternes.update((ids) =>
      actif ? [...ids, id] : ids.filter((d) => d !== id),
    );
  }

  /**
   * Met à jour les compétences depuis le sélecteur.
   * @param ids Nouveaux identifiants sélectionnés.
   */
  protected surSelectionCompetences(ids: string[]): void {
    this.competencesIds.set(ids);
  }

  /** Émet la séance complète à l'enregistrement, ou bloque et affiche l'erreur si le formulaire est invalide. */
  protected onEnregistrer(): void {
    this.soumissionTentee.set(true);
    if (this.form.invalid) return;
    const valeurs = this.form.getRawValue();
    const seance: Seance = {
      id: this.idSeance,
      heureDebut: valeurs.heureDebut,
      heureFin: valeurs.heureFin,
      type: valeurs.type,
      disciplinesIds: this.disciplinesIdsInternes(),
      titre: valeurs.titre || undefined,
      objectifs: valeurs.objectifs || undefined,
      competencesIds: this.competencesIds(),
      deroulement: valeurs.deroulement || undefined,
      ressources: valeurs.ressources || undefined,
      description: valeurs.description || undefined,
      elevesConcernes: valeurs.elevesConcernes,
    };
    this.enregistrer.emit(seance);
  }

  /** Délègue l'annulation du formulaire au parent. */
  protected onAnnuler(): void {
    this.annuler.emit();
  }
}
