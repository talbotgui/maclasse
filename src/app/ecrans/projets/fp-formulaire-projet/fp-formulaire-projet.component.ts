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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { McAutoFocusDirective } from '../../../directives/mc-auto-focus.directive';
import { LIBELLES } from '../../../libelles';
import { FormulaireUtils } from '../../../utilitaires/formulaire.utils';
import { DonneesService } from '../../../services/avecEtat/donnees.service';
import { McInputComponent } from '../../../composants/mc-input/mc-input.component';
import { McTextareaComponent } from '../../../composants/mc-textarea/mc-textarea.component';
import { McChipFiltreComponent } from '../../../composants/mc-chip-filtre/mc-chip-filtre.component';
import { McBoutonDestructionComponent } from '../../../composants/mc-bouton-destruction/mc-bouton-destruction.component';
import { McSelecteurCompetencesComponent } from '../../../composants/mc-selecteur-competences/mc-selecteur-competences.component';
import type { Projet, ProjetPeriode } from '../../../modeles/projet.modele';

/** Structure typée du formulaire d'une période de projet. */
interface FormulairePeriodeProjet {
  /** Identifiant de la période (non affiché). */
  id: FormControl<string>;
  /** Nom de la période. */
  periodeNom: FormControl<string>;
  /** Date de début ISO. */
  debut: FormControl<string>;
  /** Date de fin ISO. */
  fin: FormControl<string>;
  /** Description des activités de la période. */
  description: FormControl<string>;
  /** Compétences travaillées, alimentées par le sélecteur de compétences. */
  competencesIds: FormControl<string[]>;
}

/** Structure typée du formulaire d'un projet. */
interface FormulaireProjet {
  /** Nom du projet (obligatoire). */
  nom: FormControl<string>;
  /** Description générale du projet. */
  description: FormControl<string>;
  /** Élèves participant au projet, pilotés par les chips. */
  elevesIds: FormControl<string[]>;
  /** Périodes du projet. */
  periodes: FormArray<FormGroup<FormulairePeriodeProjet>>;
}

/**
 * Formulaire d'édition d'un projet.
 * Reçoit un projet en entrée (null = création), émet les données à la sauvegarde.
 */
@Component({
  selector: 'fp-formulaire-projet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
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

  /** Formulaire réactif du projet en cours de saisie. */
  protected readonly form: FormGroup<FormulaireProjet> = new FormGroup<FormulaireProjet>({
    nom: new FormControl('', {
      nonNullable: true,
      validators: FormulaireUtils.validerTexteNonVide,
    }),
    description: new FormControl('', { nonNullable: true }),
    elevesIds: new FormControl<string[]>([], { nonNullable: true }),
    periodes: new FormArray<FormGroup<FormulairePeriodeProjet>>([]),
  });

  /** Identifiant du projet édité (ou créé), non modifiable par le formulaire et recopié à l'émission. */
  private idProjet: string = crypto.randomUUID();

  /**
   * Statut du formulaire, suivi via `statusChanges` et resynchronisé après chaque chargement
   * (un `reset` sans émission ne déclenche pas `statusChanges`).
   */
  private readonly statutForm: WritableSignal<string> = signal(this.form.status);

  /** Index de la période venant d'être ajoutée, à focaliser (`null` si aucune). */
  protected readonly indexAFocaliserPeriode: WritableSignal<number | null> = signal(null);

  /**
   * Accès typé au `FormArray` des périodes, pour le template.
   * @returns Le `FormArray` des périodes.
   */
  protected get periodesFormArray(): FormArray<FormGroup<FormulairePeriodeProjet>> {
    return this.form.controls.periodes;
  }

  /**
   * Identifiant du projet actuellement chargé dans le formulaire (`null` en création),
   * `undefined` tant qu'aucun chargement n'a eu lieu.
   */
  private idFormulaireCharge: string | null | undefined = undefined;

  /**
   * Charge le formulaire lors d'un changement réel de projet édité.
   * Ignore les changements de référence de `projet()` qui ne correspondent pas à un
   * changement d'identité (ex. UNDO/REDO global), pour ne pas écraser la saisie en cours.
   */
  public constructor() {
    this.form.statusChanges
      .pipe(takeUntilDestroyed())
      .subscribe((statut) => this.statutForm.set(statut));
    effect(() => {
      const p = this.projet();
      const id = p?.id ?? null;
      if (id === this.idFormulaireCharge) return;
      this.idFormulaireCharge = id;
      this.chargerProjet(p ?? FpFormulaireProjetComponent.creerProjetVide());
    });
  }

  /**
   * Indique si un élève participe au projet en cours d'édition.
   * @param id UUID de l'élève.
   * @returns `true` si l'élève est sélectionné.
   */
  protected estEleveSelectionne(id: string): boolean {
    return this.form.controls.elevesIds.value.includes(id);
  }

  /**
   * Ajoute un élève au projet en cours d'édition.
   * @param id UUID de l'élève.
   */
  protected ajouterEleve(id: string): void {
    const controle = this.form.controls.elevesIds;
    if (!controle.value.includes(id)) {
      controle.setValue([...controle.value, id]);
    }
  }

  /**
   * Retire un élève du projet.
   * @param id UUID de l'élève.
   */
  protected retirerEleve(id: string): void {
    const controle = this.form.controls.elevesIds;
    controle.setValue(controle.value.filter((e) => e !== id));
  }

  /** Ajoute une période vide à la fin de la liste et demande le focus dessus. */
  protected ajouterPeriode(): void {
    this.periodesFormArray.push(
      FpFormulaireProjetComponent.creerGroupePeriode({
        id: crypto.randomUUID(),
        periodeNom: '',
        debut: '',
        fin: '',
        description: '',
        competencesIds: [],
      }),
    );
    this.indexAFocaliserPeriode.set(this.periodesFormArray.length - 1);
  }

  /**
   * Supprime une période à l'index donné.
   * @param index Index à supprimer.
   */
  protected supprimerPeriode(index: number): void {
    this.periodesFormArray.removeAt(index);
    this.indexAFocaliserPeriode.set(null);
  }

  /**
   * Met à jour les compétences d'une période.
   * @param index Index de la période.
   * @param ids Nouveaux identifiants de compétences.
   */
  protected surSelectionCompetences(index: number, ids: string[]): void {
    this.periodesFormArray.at(index)?.controls.competencesIds.setValue(ids);
  }

  /**
   * Indique si le formulaire peut être enregistré : le nom du projet est obligatoire.
   * @returns `true` si le formulaire est valide (nom contenant au moins un caractère non blanc).
   */
  protected estFormulaireValide(): boolean {
    return this.statutForm() === 'VALID';
  }

  /** Émet le projet saisi au parent pour persistance. */
  protected onEnregistrer(): void {
    if (this.form.invalid) return;
    const valeurs = this.form.getRawValue();
    this.enregistrer.emit({
      id: this.idProjet,
      nom: valeurs.nom,
      description: valeurs.description,
      elevesIds: [...valeurs.elevesIds],
      periodes: valeurs.periodes.map((periode) => ({
        ...periode,
        competencesIds: [...periode.competencesIds],
      })),
    });
  }

  /** Délègue l'annulation de la saisie au parent. */
  protected onAnnuler(): void {
    this.annuler.emit();
  }

  /**
   * Charge un projet dans le formulaire : champs simples par `reset`, puis `FormArray`
   * des périodes vidé et reconstruit (un `reset` ne redimensionne pas un `FormArray`).
   * @param projet Projet à charger (projet vide en création).
   */
  private chargerProjet(projet: Projet): void {
    this.idProjet = projet.id;
    this.periodesFormArray.clear({ emitEvent: false });
    for (const periode of projet.periodes) {
      this.periodesFormArray.push(FpFormulaireProjetComponent.creerGroupePeriode(periode), {
        emitEvent: false,
      });
    }
    this.form.controls.nom.reset(projet.nom, { emitEvent: false });
    this.form.controls.description.reset(projet.description, { emitEvent: false });
    this.form.controls.elevesIds.reset([...projet.elevesIds], { emitEvent: false });
    this.form.updateValueAndValidity({ emitEvent: false });
    this.statutForm.set(this.form.status);
    this.indexAFocaliserPeriode.set(null);
    this.cdr.markForCheck();
  }

  /**
   * Crée le groupe de contrôles d'une période.
   * @param periode Période à représenter.
   * @returns Groupe de contrôles initialisé avec les valeurs de la période.
   */
  private static creerGroupePeriode(periode: ProjetPeriode): FormGroup<FormulairePeriodeProjet> {
    return new FormGroup<FormulairePeriodeProjet>({
      id: new FormControl(periode.id, { nonNullable: true }),
      periodeNom: new FormControl(periode.periodeNom, { nonNullable: true }),
      debut: new FormControl(periode.debut, { nonNullable: true }),
      fin: new FormControl(periode.fin, { nonNullable: true }),
      description: new FormControl(periode.description, { nonNullable: true }),
      competencesIds: new FormControl<string[]>([...periode.competencesIds], {
        nonNullable: true,
      }),
    });
  }

  /**
   * Crée un projet vide pour les créations.
   * @returns Projet vide avec un nouvel identifiant.
   */
  private static creerProjetVide(): Projet {
    return {
      id: crypto.randomUUID(),
      nom: '',
      description: '',
      elevesIds: [],
      periodes: [],
    };
  }
}
