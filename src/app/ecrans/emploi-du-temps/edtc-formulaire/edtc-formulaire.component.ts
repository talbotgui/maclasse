/**
 * Sous-composant formulaire de l'écran emploi du temps pour les emplois du temps calculés.
 * Édite la définition (nom, dates, fréquence, sources, élèves concernés).
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
import type { InputSignal, OutputEmitterRef, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { McAutoFocusDirective } from '../../../directives/mc-auto-focus.directive';
import { LIBELLES } from '../../../libelles';
import { McInputComponent } from '../../../composants/mc-input/mc-input.component';
import { McSelectComponent } from '../../../composants/mc-select/mc-select.component';
import { McChipFiltreComponent } from '../../../composants/mc-chip-filtre/mc-chip-filtre.component';
import { McElevesConcernesComponent } from '../../../composants/mc-eleves-concernes/mc-eleves-concernes.component';
import { McBoutonDestructionComponent } from '../../../composants/mc-bouton-destruction/mc-bouton-destruction.component';
import type {
  EmploiDuTempsCalcule,
  SourceEdtCalcule,
} from '../../../modeles/emploi-du-temps-calcule.modele';
import type { ElevesConcernes, FrequenceSemaine } from '../../../modeles/emploi-du-temps.modele';

/** Structure typée du formulaire d'un emploi du temps calculé. */
interface FormulaireEdtCalcule {
  /** Nom de la définition. */
  nom: FormControl<string>;
  /** Date de début ISO, chaîne vide si sans limite. */
  dateDebut: FormControl<string>;
  /** Date de fin ISO, chaîne vide si sans limite. */
  dateFin: FormControl<string>;
  /** Parité des semaines prises en compte. */
  frequence: FormControl<FrequenceSemaine>;
  /** Périmètre des élèves concernés. */
  elevesConcernes: FormControl<ElevesConcernes>;
}

/**
 * Formulaire de définition d'un emploi du temps calculé (lecture seule côté grille).
 */
@Component({
  selector: 'edtc-formulaire',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    McAutoFocusDirective,
    McInputComponent,
    McSelectComponent,
    McChipFiltreComponent,
    McElevesConcernesComponent,
    McBoutonDestructionComponent,
  ],
  templateUrl: './edtc-formulaire.component.html',
  styleUrl: './edtc-formulaire.component.scss',
})
export class EdtcFormulaireComponent {
  /** Périmètre par défaut : toute la classe. */
  private static readonly ELEVES_CONCERNES_DEFAUT: ElevesConcernes = {
    type: 'classe',
    groupes: [],
    elevesIds: [],
  };

  /** Constante centralisée des libellés. */
  protected readonly LIBELLES = LIBELLES;

  /** Détection de changement pour mise à jour en mode OnPush. */
  private readonly cdr = inject(ChangeDetectorRef);

  /** Demande le focus sur le premier champ à l'apparition du formulaire. */
  public readonly focusDemande: InputSignal<boolean> = input(false);

  /** Définition à éditer (`null` = aucun formulaire affiché). */
  public readonly edtCalcule: InputSignal<EmploiDuTempsCalcule | null> =
    input<EmploiDuTempsCalcule | null>(null);

  /** `true` si la définition existe déjà dans les données (affiche SUPPRIMER). */
  public readonly existant: InputSignal<boolean> = input(false);

  /** Émis avec la définition saisie à l'enregistrement. */
  protected readonly enregistrer: OutputEmitterRef<EmploiDuTempsCalcule> =
    output<EmploiDuTempsCalcule>();

  /** Émis pour demander la suppression de la définition. */
  protected readonly supprimer: OutputEmitterRef<void> = output<void>();

  /** Émis quand l'utilisateur annule. */
  protected readonly annuler: OutputEmitterRef<void> = output<void>();

  /** Options de fréquence. */
  protected readonly optionsFrequence = [
    { valeur: 'paire', libelle: LIBELLES.edt.frequencePaire },
    { valeur: 'impaire', libelle: LIBELLES.edt.frequenceImpaire },
    { valeur: 'lesDeux', libelle: LIBELLES.edt.frequenceLesDeux },
  ];

  /** Sources proposées sous forme de chips à sélection multiple. */
  protected readonly optionsSources: { valeur: SourceEdtCalcule; libelle: string }[] = [
    { valeur: 'recreation', libelle: LIBELLES.edt.sourceRecreation },
    { valeur: 'tempsClasse', libelle: LIBELLES.edt.sourceTempsClasse },
    { valeur: 'absencesRegulieres', libelle: LIBELLES.edt.sourceAbsencesRegulieres },
  ];

  /** Sources actuellement cochées. */
  protected readonly sourcesCochees = signal<SourceEdtCalcule[]>([]);

  /** Sources à l'ouverture du formulaire, pour la détection de modifications. */
  private sourcesOrigine: SourceEdtCalcule[] = [];

  /** Identifiant de la définition actuellement chargée (`undefined` tant qu'aucune ne l'est). */
  private idCharge: string | null | undefined = undefined;

  /** Identifiant conservé pour la définition en cours d'édition. */
  private idCourant: string = crypto.randomUUID();

  /** Formulaire réactif des propriétés de la définition. */
  protected readonly form: FormGroup<FormulaireEdtCalcule> = new FormGroup<FormulaireEdtCalcule>({
    nom: new FormControl('', { nonNullable: true, validators: Validators.required }),
    dateDebut: new FormControl('', { nonNullable: true }),
    dateFin: new FormControl('', { nonNullable: true }),
    frequence: new FormControl<FrequenceSemaine>('lesDeux', { nonNullable: true }),
    elevesConcernes: new FormControl<ElevesConcernes>(
      EdtcFormulaireComponent.ELEVES_CONCERNES_DEFAUT,
      { nonNullable: true },
    ),
  });

  /** `true` après une première tentative d'enregistrement (déclenche l'affichage des erreurs). */
  protected readonly soumissionTentee = signal(false);

  /** Statut du formulaire, exposé en signal pour le calcul du message d'erreur. */
  private readonly statutForm: Signal<string> = toSignal(this.form.statusChanges, {
    initialValue: this.form.status,
  });

  /** Message d'erreur affiché après une soumission invalide, `null` sinon. */
  protected readonly messageErreur = computed<string | null>(() => {
    const invalide = this.statutForm() !== 'VALID' || this.sourcesCochees().length === 0;
    return this.soumissionTentee() && invalide ? LIBELLES.edt.erreurEdtCalculeObligatoire : null;
  });

  /**
   * Charge le formulaire lors d'un changement réel de définition (par identité),
   * pour ne pas écraser la saisie lors d'un UNDO/REDO global.
   */
  public constructor() {
    effect(() => {
      const e = this.edtCalcule();
      const id = e?.id ?? null;
      if (id === this.idCharge) return;
      this.idCharge = id;
      if (!e) return;
      this.idCourant = e.id;
      this.form.reset(
        {
          nom: e.nom,
          dateDebut: e.dateDebut ?? '',
          dateFin: e.dateFin ?? '',
          frequence: e.frequence,
          elevesConcernes: structuredClone(e.elevesConcernes),
        },
        { emitEvent: false },
      );
      this.sourcesCochees.set([...e.sources]);
      this.sourcesOrigine = [...e.sources];
      this.soumissionTentee.set(false);
      this.cdr.markForCheck();
    });
  }

  /**
   * Indique si le formulaire contient des modifications non enregistrées.
   * @returns `true` si un champ ou la sélection de sources a changé depuis le chargement.
   */
  public estModifie(): boolean {
    return (
      this.form.dirty ||
      JSON.stringify(this.sourcesCochees()) !== JSON.stringify(this.sourcesOrigine)
    );
  }

  /**
   * Indique si une source est cochée.
   * @param source Source à tester.
   * @returns `true` si la source est cochée.
   */
  protected estSourceCochee(source: SourceEdtCalcule): boolean {
    return this.sourcesCochees().includes(source);
  }

  /**
   * Coche ou décoche une source.
   * @param source Source concernée.
   * @param actif Nouvel état.
   */
  protected basculerSource(source: SourceEdtCalcule, actif: boolean): void {
    this.sourcesCochees.update((sources) =>
      actif ? [...sources, source] : sources.filter((s) => s !== source),
    );
  }

  /** Valide puis émet la définition saisie ; affiche l'erreur si elle est incomplète. */
  protected onEnregistrer(): void {
    this.soumissionTentee.set(true);
    if (this.form.invalid || this.sourcesCochees().length === 0) return;
    const valeurs = this.form.getRawValue();
    this.enregistrer.emit({
      id: this.idCourant,
      nom: valeurs.nom,
      dateDebut: valeurs.dateDebut || null,
      dateFin: valeurs.dateFin || null,
      frequence: valeurs.frequence,
      sources: [...this.sourcesCochees()],
      elevesConcernes: structuredClone(valeurs.elevesConcernes),
    });
    this.form.markAsPristine();
    this.sourcesOrigine = [...this.sourcesCochees()];
  }

  /** Délègue l'annulation au parent. */
  protected onAnnuler(): void {
    this.annuler.emit();
  }

  /** Délègue la demande de suppression au parent. */
  protected onSupprimer(): void {
    this.supprimer.emit();
  }
}
