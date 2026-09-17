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
} from '@angular/core';
import type { InputSignal, OutputEmitterRef } from '@angular/core';
import { McAutoFocusDirective } from '../../../directives/mc-auto-focus.directive';
import { FormsModule } from '@angular/forms';
import { LIBELLES } from '../../../libelles';
import { McInputComponent } from '../../../composants/mc-input/mc-input.component';
import { McSelectComponent } from '../../../composants/mc-select/mc-select.component';
import { McChampHeureComponent } from '../../../composants/mc-champ-heure/mc-champ-heure.component';
import { McChipFiltreComponent } from '../../../composants/mc-chip-filtre/mc-chip-filtre.component';
import { McElevesConcernesComponent } from '../../../composants/mc-eleves-concernes/mc-eleves-concernes.component';
import { McBoutonDestructionComponent } from '../../../composants/mc-bouton-destruction/mc-bouton-destruction.component';
import type {
  EmploiDuTemps,
  CreneauEdt,
  ElevesConcernes,
  JourSemaine,
} from '../../../modeles/emploi-du-temps.modele';
import type { Competence } from '../../../modeles/referentiels.modele';
import type { OptionFormulaire } from '../../../modeles/composants.modele';

/**
 * Formulaire contextuel de l'emploi du temps.
 * Si `creneau` est non nul, affiche le formulaire créneau.
 * Sinon affiche le formulaire des propriétés de l'EDT.
 */
@Component({
  selector: 'edt-formulaire',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
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

  /** Émis quand l'utilisateur annule. */
  protected readonly edtAnnule: OutputEmitterRef<void> = output<void>();

  /** Options de fréquence pour l'EDT. */
  protected readonly optionsFrequence = [
    { valeur: 'paire', libelle: LIBELLES.edt.frequencePaire },
    { valeur: 'impaire', libelle: LIBELLES.edt.frequenceImpaire },
    { valeur: 'lesDeux', libelle: LIBELLES.edt.frequenceLesDeux },
  ];

  /** Options de type de créneau. */
  protected readonly optionsTypeCreneau = [
    { valeur: 'pedagogique', libelle: LIBELLES.edt.typePedagogique },
    { valeur: 'recreation', libelle: LIBELLES.edt.typeRecreation },
    { valeur: 'pauseDejeuner', libelle: LIBELLES.edt.typePauseDejeuner },
  ];

  /** Options de jour proposées pour le créneau, limitées aux jours ouvrés configurés. */
  protected readonly optionsJour = computed<OptionFormulaire[]>(() =>
    this.joursOuvres().map((jour) => ({ valeur: jour, libelle: LIBELLES.edt.joursLibelles[jour] })),
  );

  /** Copie locale de l'EDT en cours d'édition. */
  protected formEdt: EmploiDuTemps | null = null;

  /** Copie locale du créneau en cours d'édition. */
  protected formCreneau: CreneauEdt | null = null;

  /** Valeur d'origine de l'EDT à l'ouverture du formulaire, pour la détection de modifications. */
  private edtOrigine: EmploiDuTemps | null = null;

  /** Valeur d'origine du créneau à l'ouverture du formulaire, pour la détection de modifications. */
  private creneauOrigine: CreneauEdt | null = null;

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

  /** `true` si un créneau existant est en cours d'édition (pour afficher SUPPRIMER). */
  protected readonly estEditionCreneau = computed(
    () => this.creneau() !== null && !!this.creneau()?.id,
  );

  /**
   * Charge les copies locales lors d'un changement réel d'EDT/créneau édité.
   * Ignore les changements de référence qui ne correspondent pas à un changement
   * d'identité (ex. UNDO/REDO global), pour ne pas écraser la saisie en cours.
   */
  public constructor() {
    effect(() => {
      const e = this.edt();
      const id = e?.id ?? null;
      if (id === this.idEdtCharge) return;
      this.idEdtCharge = id;
      this.formEdt = e ? structuredClone(e) : null;
      this.edtOrigine = e ? structuredClone(e) : null;
      this.cdr.markForCheck();
    });
    effect(() => {
      const c = this.creneau();
      const id = c?.id ?? null;
      if (id === this.idCreneauCharge) return;
      this.idCreneauCharge = id;
      this.formCreneau = c ? structuredClone(c) : null;
      this.creneauOrigine = c ? structuredClone(c) : null;
      this.cdr.markForCheck();
    });
  }

  /**
   * Indique si le formulaire actuellement affiché (propriétés EDT ou créneau) contient
   * des modifications non enregistrées par rapport à sa valeur d'origine.
   * @returns `true` si les propriétés EDT ou le créneau ont été modifiés depuis le chargement.
   */
  public estModifie(): boolean {
    return (
      JSON.stringify(this.formEdt) !== JSON.stringify(this.edtOrigine) ||
      JSON.stringify(this.formCreneau) !== JSON.stringify(this.creneauOrigine)
    );
  }

  /**
   * Bascule une discipline dans les disciplines du créneau.
   * @param id Identifiant du domaine.
   * @param actif Nouvel état.
   */
  protected basculerDiscipline(id: string, actif: boolean): void {
    if (!this.formCreneau) return;
    const ids = this.formCreneau.disciplinesIds ?? [];
    this.formCreneau.disciplinesIds = actif ? [...ids, id] : ids.filter((d) => d !== id);
  }

  /** Met à jour l'objet elevesConcernes du créneau. */
  protected surElevesConcernesChange(val: ElevesConcernes): void {
    if (!this.formCreneau) return;
    this.formCreneau = { ...this.formCreneau, elevesConcernes: val };
  }

  /** Enregistre les propriétés de l'EDT. */
  protected onEnregistrerEdt(): void {
    if (this.formEdt) this.edtEnregistre.emit(structuredClone(this.formEdt));
  }

  /** Enregistre le créneau. */
  protected onEnregistrerCreneau(): void {
    if (this.formCreneau) this.creneauEnregistre.emit(structuredClone(this.formCreneau));
  }

  /** Délègue l'annulation de la saisie (EDT ou créneau) au parent. */
  protected onEdtAnnule(): void {
    this.edtAnnule.emit();
  }

  /** Délègue la demande de suppression de l'EDT au parent. */
  protected onEdtSupprime(): void {
    this.edtSupprime.emit();
  }

  /** Délègue la demande de suppression du créneau en cours au parent. */
  protected onCreneauSupprime(): void {
    if (this.formCreneau) this.creneauSupprime.emit(this.formCreneau.id);
  }
}
