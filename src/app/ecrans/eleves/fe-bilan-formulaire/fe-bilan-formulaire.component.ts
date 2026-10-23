/**
 * Formulaire d'édition d'un bilan de l'onglet Bilans de l'écran Élèves.
 */

import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import type { InputSignal, OutputEmitterRef, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LIBELLES } from '../../../libelles';
import { McInputComponent } from '../../../composants/mc-input/mc-input.component';
import { McEditeurRicheComponent } from '../../../composants/mc-editeur-riche/mc-editeur-riche.component';
import { McSelecteurCompetencesComponent } from '../../../composants/mc-selecteur-competences/mc-selecteur-competences.component';
import { McAutoFocusDirective } from '../../../directives/mc-auto-focus.directive';
import { FormulaireUtils } from '../../../utilitaires/formulaire.utils';
import type { Bilan, EvaluationBilan } from '../../../modeles/bilan.modele';
import type { StatutAcquisition } from '../../../modeles/referentiels.modele';

/** Contrôles d'une ligne d'évaluation. */
interface FormulaireEvaluation {
  /** Identifiant de la ligne (non saisi). */
  id: FormControl<string>;
  /** Compétence évaluée (`''` tant qu'elle n'est pas choisie). */
  competenceId: FormControl<string>;
  /** Statut d'acquisition (`''` = non renseigné). */
  statutAcquisitionId: FormControl<string>;
  /** Commentaire libre. */
  commentaire: FormControl<string>;
}

/** Contrôles du formulaire d'un bilan. */
interface FormulaireBilan {
  /** Titre du bilan (obligatoire). */
  titre: FormControl<string>;
  /** Texte riche du bilan. */
  bilans: FormControl<string>;
  /** Texte riche des besoins spécifiques. */
  besoinsSpecifiques: FormControl<string>;
  /** Texte riche des moyens. */
  moyens: FormControl<string>;
  /** Lignes d'évaluation. */
  evaluations: FormArray<FormGroup<FormulaireEvaluation>>;
}

/**
 * Édition d'un bilan dans un `fieldset` : titre en légende, VALIDER / ANNULER,
 * trois éditeurs riches et le tableau des évaluations directement éditable.
 * Le formulaire est initialisé une seule fois depuis `bilan` : le composant est recréé
 * à chaque passage en édition.
 */
@Component({
  selector: 'fe-bilan-formulaire',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    McInputComponent,
    McEditeurRicheComponent,
    McSelecteurCompetencesComponent,
    McAutoFocusDirective,
  ],
  templateUrl: './fe-bilan-formulaire.component.html',
  styleUrl: './fe-bilan-formulaire.component.scss',
})
export class FeBilanFormulaireComponent implements OnInit {
  /** Constante centralisée des libellés. */
  protected readonly LIBELLES = LIBELLES;

  /** Bilan édité (nouveau brouillon ou bilan enregistré). */
  public readonly bilan: InputSignal<Bilan> = input.required<Bilan>();

  /** Sous-domaine du bilan : seules ses compétences évaluables sont proposées. */
  public readonly sousDomaineId: InputSignal<string> = input.required<string>();

  /** Statuts d'acquisition proposés pour les évaluations. */
  public readonly statutsAcquisition: InputSignal<StatutAcquisition[]> =
    input<StatutAcquisition[]>([]);

  /** `true` pour placer le focus sur le titre à l'affichage. */
  public readonly focusDemande: InputSignal<boolean> = input(false);

  /** Émis avec le bilan saisi, à enregistrer. */
  protected readonly valider: OutputEmitterRef<Bilan> = output<Bilan>();

  /** Émis quand la saisie est abandonnée. */
  protected readonly annuler: OutputEmitterRef<void> = output<void>();

  /** Formulaire du bilan. */
  protected readonly form = new FormGroup<FormulaireBilan>({
    titre: new FormControl('', {
      nonNullable: true,
      validators: [FormulaireUtils.validerTexteNonVide],
    }),
    bilans: new FormControl('', { nonNullable: true }),
    besoinsSpecifiques: new FormControl('', { nonNullable: true }),
    moyens: new FormControl('', { nonNullable: true }),
    evaluations: new FormArray<FormGroup<FormulaireEvaluation>>([], {
      validators: [FormulaireUtils.validerEvaluationsBilan],
    }),
  });

  /** Statut du formulaire, suivi via `statusChanges`. */
  private readonly statutForm: WritableSignal<string> = signal(this.form.status);

  /** Index de la ligne d'évaluation venant d'être ajoutée, à focaliser (`null` si aucune). */
  protected readonly indexAFocaliser: WritableSignal<number | null> = signal(null);

  /** Options du statut d'acquisition (glyphe et libellé). */
  protected readonly optionsStatut = computed(() =>
    this.statutsAcquisition().map((s) => ({ valeur: s.id, libelle: `${s.glyphe} ${s.libelle}` })),
  );

  /** Suit le statut du formulaire. */
  public constructor() {
    this.form.statusChanges
      .pipe(takeUntilDestroyed())
      .subscribe((statut) => this.statutForm.set(statut));
  }

  /** Charge le bilan dans le formulaire. */
  public ngOnInit(): void {
    const bilan = this.bilan();
    this.form.controls.evaluations.clear({ emitEvent: false });
    bilan.evaluations.forEach((ev) =>
      this.form.controls.evaluations.push(FeBilanFormulaireComponent.creerLigne(ev), {
        emitEvent: false,
      }),
    );
    this.form.reset(
      {
        titre: bilan.titre,
        bilans: bilan.bilans,
        besoinsSpecifiques: bilan.besoinsSpecifiques,
        moyens: bilan.moyens,
      },
      { emitEvent: false },
    );
    this.form.controls.evaluations.updateValueAndValidity({ emitEvent: false });
    this.form.updateValueAndValidity({ emitEvent: false });
    this.statutForm.set(this.form.status);
  }

  /** Lignes d'évaluation du formulaire. */
  protected get lignes(): FormGroup<FormulaireEvaluation>[] {
    return this.form.controls.evaluations.controls;
  }

  /**
   * Indique si le formulaire peut être validé.
   * @returns `true` si le titre est saisi et les évaluations sont valides.
   */
  protected estFormulaireValide(): boolean {
    return this.statutForm() === 'VALID';
  }

  /**
   * Message d'erreur du formulaire, ou `null` s'il est valide.
   * Le titre manquant n'est signalé qu'une fois le champ touché ou modifié.
   * @returns Message à afficher sous le formulaire.
   */
  protected obtenirMessageErreur(): string | null {
    this.statutForm();
    const titre = this.form.controls.titre;
    if (titre.invalid && (titre.touched || titre.dirty)) return LIBELLES.bilans.erreurTitre;
    const erreurs = this.form.controls.evaluations.errors;
    if (erreurs?.['evaluationSansCompetence']) {
      return LIBELLES.bilans.erreurEvaluationSansCompetence;
    }
    if (erreurs?.['competenceEnDouble']) return LIBELLES.bilans.erreurCompetenceEnDouble;
    return null;
  }

  /**
   * Retourne la sélection du sélecteur de compétences d'une ligne.
   * @param ligne Ligne d'évaluation.
   * @returns Identifiant de la compétence choisie, ou liste vide.
   */
  protected obtenirSelectionLigne(ligne: FormGroup<FormulaireEvaluation>): string[] {
    const id = ligne.controls.competenceId.value;
    return id ? [id] : [];
  }

  /**
   * Reporte la compétence choisie dans une ligne.
   * @param ligne Ligne d'évaluation.
   * @param ids Sélection émise par le sélecteur (au plus un identifiant).
   */
  protected choisirCompetence(ligne: FormGroup<FormulaireEvaluation>, ids: string[]): void {
    ligne.controls.competenceId.setValue(ids[0] ?? '');
    ligne.markAsDirty();
  }

  /** Ajoute une ligne d'évaluation vide en fin de tableau et y place le focus. */
  protected ajouterEvaluation(): void {
    this.form.controls.evaluations.push(
      FeBilanFormulaireComponent.creerLigne({
        id: crypto.randomUUID(),
        competenceId: '',
        statutAcquisitionId: null,
        commentaire: '',
      }),
    );
    this.indexAFocaliser.set(this.lignes.length - 1);
  }

  /**
   * Supprime une ligne d'évaluation.
   * @param index Index de la ligne.
   */
  protected supprimerEvaluation(index: number): void {
    this.form.controls.evaluations.removeAt(index);
    this.indexAFocaliser.set(null);
  }

  /** Émet le bilan saisi au parent pour enregistrement. */
  protected onValider(): void {
    if (this.form.invalid) return;
    const valeurs = this.form.getRawValue();
    this.valider.emit({
      id: this.bilan().id,
      // Date conservée telle quelle : l'enregistrement la remplace par celle du jour
      date: this.bilan().date,
      titre: valeurs.titre.trim(),
      bilans: valeurs.bilans,
      besoinsSpecifiques: valeurs.besoinsSpecifiques,
      moyens: valeurs.moyens,
      evaluations: valeurs.evaluations.map((ev) => ({
        id: ev.id,
        competenceId: ev.competenceId,
        statutAcquisitionId: ev.statutAcquisitionId || null,
        commentaire: ev.commentaire,
      })),
    });
  }

  /** Émet l'abandon de la saisie au parent. */
  protected onAnnuler(): void {
    this.annuler.emit();
  }

  /**
   * Crée le groupe de contrôles d'une ligne d'évaluation.
   * @param evaluation Valeurs initiales de la ligne.
   * @returns Groupe de contrôles de la ligne.
   */
  private static creerLigne(evaluation: EvaluationBilan): FormGroup<FormulaireEvaluation> {
    return new FormGroup<FormulaireEvaluation>({
      id: new FormControl(evaluation.id, { nonNullable: true }),
      competenceId: new FormControl(evaluation.competenceId, { nonNullable: true }),
      statutAcquisitionId: new FormControl(evaluation.statutAcquisitionId ?? '', {
        nonNullable: true,
      }),
      commentaire: new FormControl(evaluation.commentaire, { nonNullable: true }),
    });
  }
}
