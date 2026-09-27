/**
 * Sous-composant formulaire contextuel de l'écran emploi du temps.
 * Affiche soit les propriétés d'un EDT, soit le formulaire d'un créneau.
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
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { McAutoFocusDirective } from '../../../directives/mc-auto-focus.directive';
import { LIBELLES } from '../../../libelles';
import { DateUtils } from '../../../utilitaires/date.utils';
import { FormulaireUtils } from '../../../utilitaires/formulaire.utils';
import { ObjetUtils } from '../../../utilitaires/objet.utils';
import { McInputComponent } from '../../../composants/mc-input/mc-input.component';
import { McSelectComponent } from '../../../composants/mc-select/mc-select.component';
import { McChampHeureComponent } from '../../../composants/mc-champ-heure/mc-champ-heure.component';
import { McChipFiltreComponent } from '../../../composants/mc-chip-filtre/mc-chip-filtre.component';
import { McElevesConcernesComponent } from '../../../composants/mc-eleves-concernes/mc-eleves-concernes.component';
import { McBoutonDestructionComponent } from '../../../composants/mc-bouton-destruction/mc-bouton-destruction.component';
import type {
  EmploiDuTemps,
  CreneauEdt,
  TempsCreneau,
  ElevesConcernes,
  FrequenceSemaine,
  JourSemaine,
  TypeCreneau,
} from '../../../modeles/emploi-du-temps.modele';
import type { Competence } from '../../../modeles/referentiels.modele';
import type { OptionFormulaire } from '../../../modeles/composants.modele';
import { EmploiDuTempsService } from '../../../services/sansEtat/emploi-du-temps.service';

/** Structure typée du formulaire des propriétés d'un EDT. */
interface FormulaireProprietesEdt {
  /** Nom de l'EDT (obligatoire). */
  nom: FormControl<string>;
  /** Date de début ISO, chaîne vide si sans limite. */
  dateDebut: FormControl<string>;
  /** Date de fin ISO, chaîne vide si sans limite. */
  dateFin: FormControl<string>;
  /** Semaines sur lesquelles l'EDT s'applique. */
  frequence: FormControl<FrequenceSemaine>;
}

/** Structure typée du formulaire d'un temps de créneau. */
interface FormulaireTemps {
  /** Identifiant du temps (non affiché, sert au suivi des lignes). */
  id: FormControl<string>;
  /** Heure de début au format `HH:MM`. */
  heureDebut: FormControl<string>;
  /** Heure de fin au format `HH:MM`. */
  heureFin: FormControl<string>;
  /** Disciplines traitées, pilotées par les chips. */
  disciplinesIds: FormControl<string[]>;
  /** Titre libre du temps, chaîne vide si absent. */
  titre: FormControl<string>;
  /** Périmètre des élèves concernés, `null` si non renseigné. */
  elevesConcernes: FormControl<ElevesConcernes | null>;
}

/** Structure typée du formulaire d'un créneau. */
interface FormulaireCreneau {
  /** Jour du créneau. */
  jour: FormControl<JourSemaine>;
  /** Nature du créneau. */
  type: FormControl<TypeCreneau>;
  /** Temps du créneau (1 à `NOMBRE_TEMPS_MAX`). */
  temps: FormArray<FormGroup<FormulaireTemps>>;
}

/**
 * Formulaire contextuel de l'emploi du temps.
 * Si `creneau` est non nul, affiche le formulaire créneau.
 * Sinon affiche le formulaire des propriétés de l'EDT.
 */
@Component({
  selector: 'edt-formulaire',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    McAutoFocusDirective,
    McInputComponent,
    McSelectComponent,
    McChampHeureComponent,
    McChipFiltreComponent,
    McElevesConcernesComponent,
    McBoutonDestructionComponent,
  ],
  templateUrl: './edt-formulaire.component.html',
  styleUrl: './edt-formulaire.component.scss',
})
export class EdtFormulaireComponent {
  /** Heure de début proposée pour un nouveau temps quand le créneau n'en a aucun. */
  private static readonly HEURE_DEBUT_DEFAUT = '08:00';

  /** Constante centralisée des libellés. */
  protected readonly LIBELLES = LIBELLES;

  /** Détection de changement pour mise à jour en mode OnPush. */
  private readonly cdr = inject(ChangeDetectorRef);

  /** Demande le focus sur le premier champ à l'apparition du formulaire. */
  public readonly focusDemande: InputSignal<boolean> = input(false);

  /** EDT courant (propriétés). */
  public readonly edt: InputSignal<EmploiDuTemps | null> = input<EmploiDuTemps | null>(null);

  /** Créneau à éditer (null = afficher les propriétés EDT). */
  public readonly creneau: InputSignal<CreneauEdt | null> = input<CreneauEdt | null>(null);

  /** `true` si le créneau édité existe déjà dans l'EDT (modification), `false` pour une création. */
  public readonly creneauExistant: InputSignal<boolean> = input(false);

  /** Domaines de niveau 1 pour les chips de disciplines. */
  public readonly domaines: InputSignal<Competence[]> = input<Competence[]>([]);

  /** Jours ouvrés configurés, proposés dans le sélecteur de jour du créneau. */
  public readonly joursOuvres: InputSignal<JourSemaine[]> = input<JourSemaine[]>([]);

  /** Émis avec l'EDT modifié à la sauvegarde des propriétés. */
  protected readonly edtEnregistre: OutputEmitterRef<EmploiDuTemps> = output<EmploiDuTemps>();

  /** Émis pour déclencher la suppression de l'EDT. */
  protected readonly edtSupprime: OutputEmitterRef<void> = output<void>();

  /** Émis avec le créneau modifié ou créé. */
  protected readonly creneauEnregistre: OutputEmitterRef<CreneauEdt> = output<CreneauEdt>();

  /** Émis pour déclencher la suppression d'un créneau existant. */
  protected readonly creneauSupprime: OutputEmitterRef<string> = output<string>();

  /** Émis quand l'utilisateur annule la saisie des propriétés de l'EDT (valeurs déjà restaurées). */
  protected readonly edtAnnule: OutputEmitterRef<void> = output<void>();

  /** Émis quand l'utilisateur annule la saisie d'un créneau. */
  protected readonly creneauAnnule: OutputEmitterRef<void> = output<void>();

  /** Options de fréquence pour l'EDT. */
  protected readonly optionsFrequence = [
    { valeur: 'paire', libelle: LIBELLES.edt.frequencePaire },
    { valeur: 'impaire', libelle: LIBELLES.edt.frequenceImpaire },
    { valeur: 'lesDeux', libelle: LIBELLES.edt.frequenceLesDeux },
  ];

  /** Options de type de créneau. */
  protected readonly optionsTypeCreneau = [
    { valeur: 'pedagogique', libelle: LIBELLES.edt.typesCreneau.pedagogique },
    { valeur: 'recreation', libelle: LIBELLES.edt.typesCreneau.recreation },
    { valeur: 'pauseDejeuner', libelle: LIBELLES.edt.typesCreneau.pauseDejeuner },
  ];

  /** Options de jour proposées pour le créneau, limitées aux jours ouvrés configurés. */
  protected readonly optionsJour = computed<OptionFormulaire[]>(() =>
    this.joursOuvres().map((jour) => ({ valeur: jour, libelle: LIBELLES.edt.joursLibelles[jour] })),
  );

  /** Formulaire réactif des propriétés de l'EDT. */
  protected readonly formEdt: FormGroup<FormulaireProprietesEdt> =
    new FormGroup<FormulaireProprietesEdt>({
      nom: new FormControl('', {
        nonNullable: true,
        validators: FormulaireUtils.validerTexteNonVide,
      }),
      dateDebut: new FormControl('', { nonNullable: true }),
      dateFin: new FormControl('', { nonNullable: true }),
      frequence: new FormControl<FrequenceSemaine>('lesDeux', { nonNullable: true }),
    });

  /** Formulaire réactif du créneau. */
  protected readonly formCreneau: FormGroup<FormulaireCreneau> = new FormGroup<FormulaireCreneau>({
    jour: new FormControl<JourSemaine>('lundi', { nonNullable: true }),
    type: new FormControl<TypeCreneau>('pedagogique', { nonNullable: true }),
    temps: new FormArray<FormGroup<FormulaireTemps>>([]),
  });

  /** Identifiant de l'EDT édité, non modifiable par le formulaire et recopié à l'émission. */
  private idEdt = '';

  /**
   * Créneaux de l'EDT édité, non modifiables par ce formulaire et recopiés à l'émission :
   * l'EDT émis remplace l'EDT entier, un EDT émis sans créneaux les effacerait.
   */
  private creneauxEdt: CreneauEdt[] = [];

  /** Identifiant du créneau édité, non modifiable par le formulaire et recopié à l'émission. */
  private idCreneau = '';

  /** Valeur du formulaire des propriétés au chargement ou au dernier enregistrement, `null` sans EDT. */
  private valeurEdtOrigine: ReturnType<FormGroup<FormulaireProprietesEdt>['getRawValue']> | null =
    null;

  /** Valeur du formulaire du créneau au chargement ou au dernier enregistrement, `null` sans créneau. */
  private valeurCreneauOrigine: ReturnType<FormGroup<FormulaireCreneau>['getRawValue']> | null =
    null;

  /**
   * Identifiant de l'EDT actuellement chargé dans `formEdt` (`null` si aucun),
   * `undefined` tant qu'aucun chargement n'a eu lieu.
   */
  private idEdtCharge: string | null | undefined = undefined;

  /**
   * Identifiant du créneau actuellement chargé dans `formCreneau` (`null` si aucun),
   * `undefined` tant qu'aucun chargement n'a eu lieu.
   */
  private idCreneauCharge: string | null | undefined = undefined;

  /** `true` si un créneau existant est en cours d'édition (titre « Modifier » et bouton SUPPRIMER). */
  protected readonly estEditionCreneau = computed(
    () => this.creneau() !== null && this.creneauExistant(),
  );

  /** `true` après une tentative d'enregistrement des propriétés (déclenche l'affichage des erreurs). */
  protected readonly soumissionEdtTentee: WritableSignal<boolean> = signal(false);

  /** `true` après une tentative d'enregistrement du créneau (déclenche l'affichage des erreurs). */
  protected readonly soumissionCreneauTentee: WritableSignal<boolean> = signal(false);

  /**
   * Statut du formulaire des propriétés, suivi via `statusChanges` et resynchronisé après
   * chaque chargement (un `reset` sans émission ne déclenche pas `statusChanges`).
   */
  private readonly statutEdt: WritableSignal<string> = signal(this.formEdt.status);

  /**
   * Statut du formulaire du créneau, suivi via `statusChanges` et resynchronisé après
   * chaque chargement ou modification programmatique du `FormArray` des temps.
   */
  private readonly statutCreneau: WritableSignal<string> = signal(this.formCreneau.status);

  /** Type du créneau sélectionné, pour l'affichage conditionnel des champs pédagogiques. */
  protected readonly typeCreneau: WritableSignal<TypeCreneau> = signal(
    this.formCreneau.controls.type.value,
  );

  /** Index du bloc temps à focaliser à l'apparition (RGAA), `null` si aucun ajout récent. */
  protected readonly indexAFocaliserTemps: WritableSignal<number | null> = signal(null);

  /**
   * Accès typé au `FormArray` des temps du créneau, pour le template.
   * @returns Le `FormArray` des temps.
   */
  protected get tempsFormArray(): FormArray<FormGroup<FormulaireTemps>> {
    return this.formCreneau.controls.temps;
  }

  /**
   * Charge les formulaires lors d'un changement réel d'EDT/créneau édité.
   * Ignore les changements de référence qui ne correspondent pas à un changement
   * d'identité (ex. UNDO/REDO global), pour ne pas écraser la saisie en cours.
   */
  public constructor() {
    this.formEdt.statusChanges
      .pipe(takeUntilDestroyed())
      .subscribe((statut) => this.statutEdt.set(statut));
    this.formCreneau.statusChanges
      .pipe(takeUntilDestroyed())
      .subscribe((statut) => this.statutCreneau.set(statut));
    this.formCreneau.controls.type.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((type) => this.typeCreneau.set(type));
    effect(() => {
      const e = this.edt();
      const id = e?.id ?? null;
      if (id === this.idEdtCharge) return;
      this.idEdtCharge = id;
      this.chargerEdt(e);
    });
    effect(() => {
      const c = this.creneau();
      const id = c?.id ?? null;
      if (id === this.idCreneauCharge) return;
      this.idCreneauCharge = id;
      this.chargerCreneau(c);
    });
  }

  /**
   * Indique si le formulaire actuellement affiché (propriétés EDT ou créneau) contient
   * des modifications non enregistrées par rapport à sa valeur d'origine.
   * Revenir à la valeur d'origine n'est pas une modification.
   * @returns `true` si les propriétés EDT ou le créneau ont été modifiés depuis le chargement.
   */
  public estModifie(): boolean {
    const edtModifie =
      this.valeurEdtOrigine !== null &&
      !ObjetUtils.sontEgaux(this.formEdt.getRawValue(), this.valeurEdtOrigine);
    const creneauModifie =
      this.valeurCreneauOrigine !== null &&
      !ObjetUtils.sontEgaux(this.formCreneau.getRawValue(), this.valeurCreneauOrigine);
    return edtModifie || creneauModifie;
  }

  /**
   * Indique si le créneau en cours d'édition a atteint le nombre maximal de temps.
   * @returns `true` si le `FormArray` des temps contient déjà le nombre maximal autorisé.
   */
  protected estNombreTempsMaxAtteint(): boolean {
    return this.tempsFormArray.length >= EmploiDuTempsService.NOMBRE_TEMPS_MAX;
  }

  /**
   * Message d'erreur des propriétés de l'EDT, affiché après une tentative d'enregistrement.
   * @returns Message « nom obligatoire » si le nom est invalide après une tentative, `null` sinon.
   */
  protected obtenirErreurNomEdt(): string | null {
    if (!this.soumissionEdtTentee() || this.statutEdt() === 'VALID') return null;
    return LIBELLES.edt.erreurNomObligatoire;
  }

  /**
   * Message d'erreur des horaires d'un temps, affiché après une tentative d'enregistrement.
   * Couvre l'heure manquante comme la plage vide ou inversée.
   * @param groupe Groupe du temps à contrôler.
   * @returns Message « fin postérieure au début » si le temps est invalide après une tentative,
   *   `null` sinon.
   */
  protected obtenirErreurHorairesTemps(groupe: FormGroup<FormulaireTemps>): string | null {
    if (!this.soumissionCreneauTentee() || this.statutCreneau() === 'VALID' || groupe.valid) {
      return null;
    }
    return LIBELLES.commun.erreurPlageHoraire;
  }

  /**
   * Indique si une discipline est sélectionnée pour un temps.
   * @param groupe Groupe du temps.
   * @param id Identifiant du domaine.
   * @returns `true` si la discipline figure dans les disciplines du temps.
   */
  protected estDisciplineSelectionnee(groupe: FormGroup<FormulaireTemps>, id: string): boolean {
    return groupe.controls.disciplinesIds.value.includes(id);
  }

  /**
   * Bascule une discipline dans les disciplines du temps donné.
   * @param indexTemps Index du temps dans le `FormArray` des temps.
   * @param id Identifiant du domaine.
   * @param actif Nouvel état.
   */
  protected basculerDiscipline(indexTemps: number, id: string, actif: boolean): void {
    const controle = this.tempsFormArray.at(indexTemps)?.controls.disciplinesIds;
    if (!controle) return;
    const ids = controle.value;
    controle.setValue(actif ? [...ids, id] : ids.filter((d) => d !== id));
  }

  /** Ajoute un temps en fin de liste et demande le focus dessus. No-op au-delà du maximum. */
  protected ajouterTemps(): void {
    if (this.estNombreTempsMaxAtteint()) return;
    const heureDebut =
      this.tempsFormArray.at(-1)?.controls.heureFin.value ??
      EdtFormulaireComponent.HEURE_DEBUT_DEFAUT;
    this.tempsFormArray.push(
      EdtFormulaireComponent.creerGroupeTemps({
        id: crypto.randomUUID(),
        heureDebut,
        heureFin: DateUtils.ajouterHeures(heureDebut, 1),
        disciplinesIds: [],
        elevesConcernes: { type: 'classe', groupes: [], elevesIds: [] },
      }),
    );
    this.indexAFocaliserTemps.set(this.tempsFormArray.length - 1);
  }

  /**
   * Supprime le temps à l'index donné. No-op s'il ne reste plus qu'un seul temps.
   * @param index Index du temps à supprimer.
   */
  protected supprimerTemps(index: number): void {
    if (this.tempsFormArray.length <= 1) return;
    this.tempsFormArray.removeAt(index);
    this.indexAFocaliserTemps.set(null);
  }

  /** Enregistre les propriétés de l'EDT si le nom est renseigné ; sinon affiche l'erreur. */
  protected onEnregistrerEdt(): void {
    this.soumissionEdtTentee.set(true);
    if (this.valeurEdtOrigine === null || this.formEdt.invalid) return;
    const valeurs = this.formEdt.getRawValue();
    this.edtEnregistre.emit({
      id: this.idEdt,
      nom: valeurs.nom,
      dateDebut: valeurs.dateDebut || null,
      dateFin: valeurs.dateFin || null,
      frequence: valeurs.frequence,
      creneaux: structuredClone(this.creneauxEdt),
    });
    this.valeurEdtOrigine = valeurs;
  }

  /**
   * Enregistre le créneau si chaque temps a une heure de fin postérieure à son heure de début ;
   * sinon affiche l'erreur sur les temps concernés. Un créneau hors classe (récréation, pause
   * déjeuner) est émis sans les champs pédagogiques de ses temps ; le formulaire, lui,
   * conserve les saisies.
   */
  protected onEnregistrerCreneau(): void {
    this.soumissionCreneauTentee.set(true);
    if (this.valeurCreneauOrigine === null || this.formCreneau.invalid) return;
    const valeurs = this.formCreneau.getRawValue();
    const pedagogique = valeurs.type === 'pedagogique';
    this.creneauEnregistre.emit({
      id: this.idCreneau,
      jour: valeurs.jour,
      type: valeurs.type,
      temps: valeurs.temps.map((t) =>
        pedagogique
          ? EdtFormulaireComponent.convertirTempsPedagogique(t)
          : { id: t.id, heureDebut: t.heureDebut, heureFin: t.heureFin },
      ),
    });
    this.valeurCreneauOrigine = valeurs;
  }

  /**
   * Restaure les propriétés de l'EDT telles qu'à l'ouverture du formulaire, puis délègue
   * l'annulation au parent (qui ferme le formulaire si l'EDT n'a jamais été enregistré).
   */
  protected onEdtAnnule(): void {
    if (this.valeurEdtOrigine) {
      this.formEdt.reset(this.valeurEdtOrigine);
    }
    this.soumissionEdtTentee.set(false);
    this.cdr.markForCheck();
    this.edtAnnule.emit();
  }

  /** Délègue l'annulation de la saisie du créneau au parent. */
  protected onCreneauAnnule(): void {
    this.creneauAnnule.emit();
  }

  /** Délègue la demande de suppression de l'EDT au parent. */
  protected onEdtSupprime(): void {
    this.edtSupprime.emit();
  }

  /** Délègue la demande de suppression du créneau en cours au parent. */
  protected onCreneauSupprime(): void {
    if (this.valeurCreneauOrigine !== null) this.creneauSupprime.emit(this.idCreneau);
  }

  /**
   * Charge les propriétés d'un EDT dans le formulaire et mémorise la valeur d'origine.
   * @param edt EDT à charger, `null` pour n'afficher aucun formulaire de propriétés.
   */
  private chargerEdt(edt: EmploiDuTemps | null): void {
    this.soumissionEdtTentee.set(false);
    if (!edt) {
      this.valeurEdtOrigine = null;
      this.cdr.markForCheck();
      return;
    }
    this.idEdt = edt.id;
    this.creneauxEdt = structuredClone(edt.creneaux);
    this.formEdt.reset(
      {
        nom: edt.nom,
        dateDebut: edt.dateDebut ?? '',
        dateFin: edt.dateFin ?? '',
        frequence: edt.frequence,
      },
      { emitEvent: false },
    );
    this.valeurEdtOrigine = this.formEdt.getRawValue();
    this.statutEdt.set(this.formEdt.status);
    this.cdr.markForCheck();
  }

  /**
   * Charge un créneau dans le formulaire : `jour` et `type` par `reset`, puis le `FormArray`
   * des temps vidé et reconstruit (un `reset` ne redimensionne pas un `FormArray`).
   * @param creneau Créneau à charger, `null` pour n'afficher aucun formulaire de créneau.
   */
  private chargerCreneau(creneau: CreneauEdt | null): void {
    this.soumissionCreneauTentee.set(false);
    this.indexAFocaliserTemps.set(null);
    if (!creneau) {
      this.valeurCreneauOrigine = null;
      this.cdr.markForCheck();
      return;
    }
    this.idCreneau = creneau.id;
    this.tempsFormArray.clear({ emitEvent: false });
    for (const temps of creneau.temps) {
      this.tempsFormArray.push(EdtFormulaireComponent.creerGroupeTemps(temps), {
        emitEvent: false,
      });
    }
    this.formCreneau.controls.jour.reset(creneau.jour, { emitEvent: false });
    this.formCreneau.controls.type.reset(creneau.type, { emitEvent: false });
    this.formCreneau.updateValueAndValidity({ emitEvent: false });
    this.valeurCreneauOrigine = this.formCreneau.getRawValue();
    this.statutCreneau.set(this.formCreneau.status);
    this.typeCreneau.set(creneau.type);
    this.cdr.markForCheck();
  }

  /**
   * Crée le groupe de contrôles d'un temps, avec le validateur de plage horaire.
   * @param temps Temps à représenter.
   * @returns Groupe de contrôles initialisé avec les valeurs du temps.
   */
  private static creerGroupeTemps(temps: TempsCreneau): FormGroup<FormulaireTemps> {
    return new FormGroup<FormulaireTemps>(
      {
        id: new FormControl(temps.id, { nonNullable: true }),
        heureDebut: new FormControl(temps.heureDebut, {
          nonNullable: true,
          validators: Validators.required,
        }),
        heureFin: new FormControl(temps.heureFin, {
          nonNullable: true,
          validators: Validators.required,
        }),
        disciplinesIds: new FormControl<string[]>([...(temps.disciplinesIds ?? [])], {
          nonNullable: true,
        }),
        titre: new FormControl(temps.titre ?? '', { nonNullable: true }),
        elevesConcernes: new FormControl<ElevesConcernes | null>(
          temps.elevesConcernes ? structuredClone(temps.elevesConcernes) : null,
        ),
      },
      { validators: FormulaireUtils.validerPlageHoraire },
    );
  }

  /**
   * Convertit la valeur d'un temps pédagogique du formulaire en `TempsCreneau`,
   * sans titre vide ni périmètre d'élèves non renseigné.
   * @param valeur Valeur brute du groupe du temps.
   * @returns Le temps à émettre.
   */
  private static convertirTempsPedagogique(
    valeur: ReturnType<FormGroup<FormulaireTemps>['getRawValue']>,
  ): TempsCreneau {
    const temps: TempsCreneau = {
      id: valeur.id,
      heureDebut: valeur.heureDebut,
      heureFin: valeur.heureFin,
      disciplinesIds: [...valeur.disciplinesIds],
    };
    if (valeur.titre) temps.titre = valeur.titre;
    if (valeur.elevesConcernes) temps.elevesConcernes = structuredClone(valeur.elevesConcernes);
    return temps;
  }
}
