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
import { McAutoFocusDirective } from '../../../directives/mc-auto-focus.directive';
import { FormsModule } from '@angular/forms';
import { LIBELLES } from '../../../libelles';
import { DateUtils } from '../../../utilitaires/date.utils';
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
  JourSemaine,
} from '../../../modeles/emploi-du-temps.modele';
import type { Competence } from '../../../modeles/referentiels.modele';
import type { OptionFormulaire } from '../../../modeles/composants.modele';
import { EmploiDuTempsService } from '../../../services/sansEtat/emploi-du-temps.service';

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

  /** `true` si un créneau existant est en cours d'édition (titre « Modifier » et bouton SUPPRIMER). */
  protected readonly estEditionCreneau = computed(
    () => this.creneau() !== null && this.creneauExistant(),
  );

  /** `true` après une tentative d'enregistrement des propriétés (déclenche l'affichage des erreurs). */
  protected readonly soumissionEdtTentee: WritableSignal<boolean> = signal(false);

  /** `true` après une tentative d'enregistrement du créneau (déclenche l'affichage des erreurs). */
  protected readonly soumissionCreneauTentee: WritableSignal<boolean> = signal(false);

  /** Index du bloc temps à focaliser à l'apparition (RGAA), `null` si aucun ajout récent. */
  protected readonly indexAFocaliserTemps: WritableSignal<number | null> = signal(null);

  /**
   * Indique si le créneau en cours d'édition a atteint le nombre maximal de temps.
   * @returns `true` si `formCreneau.temps` contient déjà le nombre maximal autorisé.
   */
  protected estNombreTempsMaxAtteint(): boolean {
    return (this.formCreneau?.temps.length ?? 0) >= EmploiDuTempsService.NOMBRE_TEMPS_MAX;
  }

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
      this.soumissionEdtTentee.set(false);
      this.cdr.markForCheck();
    });
    effect(() => {
      const c = this.creneau();
      const id = c?.id ?? null;
      if (id === this.idCreneauCharge) return;
      this.idCreneauCharge = id;
      this.formCreneau = c ? structuredClone(c) : null;
      this.creneauOrigine = c ? structuredClone(c) : null;
      this.soumissionCreneauTentee.set(false);
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
   * Message d'erreur des propriétés de l'EDT, affiché après une tentative d'enregistrement.
   * @returns Message « nom obligatoire » si le nom est vide après une tentative, `null` sinon.
   */
  protected obtenirErreurNomEdt(): string | null {
    if (!this.soumissionEdtTentee() || this.verifierNomEdtRenseigne()) return null;
    return LIBELLES.edt.erreurNomObligatoire;
  }

  /**
   * Message d'erreur des horaires d'un temps, affiché après une tentative d'enregistrement.
   * @param temps Temps du créneau à contrôler.
   * @returns Message « fin postérieure au début » si la plage est invalide après une tentative, `null` sinon.
   */
  protected obtenirErreurHorairesTemps(temps: TempsCreneau): string | null {
    if (!this.soumissionCreneauTentee() || EdtFormulaireComponent.verifierPlageHoraire(temps)) {
      return null;
    }
    return LIBELLES.commun.erreurPlageHoraire;
  }

  /**
   * Indique si le nom de l'EDT en cours d'édition est renseigné (hors espaces).
   * @returns `true` si le nom contient au moins un caractère non blanc.
   */
  private verifierNomEdtRenseigne(): boolean {
    return (this.formEdt?.nom ?? '').trim().length > 0;
  }

  /**
   * Indique si les horaires d'un temps sont renseignés et forment une plage non vide.
   * @param temps Temps à contrôler.
   * @returns `true` si l'heure de fin est strictement postérieure à l'heure de début.
   */
  private static verifierPlageHoraire(temps: TempsCreneau): boolean {
    return !!temps.heureDebut && !!temps.heureFin && temps.heureFin > temps.heureDebut;
  }

  /**
   * Bascule une discipline dans les disciplines du temps donné.
   * @param indexTemps Index du temps dans `formCreneau.temps`.
   * @param id Identifiant du domaine.
   * @param actif Nouvel état.
   */
  protected basculerDiscipline(indexTemps: number, id: string, actif: boolean): void {
    if (!this.formCreneau) return;
    const ids = this.formCreneau.temps[indexTemps].disciplinesIds ?? [];
    const disciplinesIds = actif ? [...ids, id] : ids.filter((d) => d !== id);
    this.formCreneau.temps = this.formCreneau.temps.map((t, i) =>
      i === indexTemps ? { ...t, disciplinesIds } : t,
    );
  }

  /**
   * Met à jour l'objet `elevesConcernes` du temps donné.
   * @param indexTemps Index du temps dans `formCreneau.temps`.
   * @param val Nouvelle valeur des élèves concernés.
   */
  protected surElevesConcernesChange(indexTemps: number, val: ElevesConcernes): void {
    if (!this.formCreneau) return;
    this.formCreneau = {
      ...this.formCreneau,
      temps: this.formCreneau.temps.map((t, i) =>
        i === indexTemps ? { ...t, elevesConcernes: val } : t,
      ),
    };
  }

  /** Ajoute un temps vide en fin de liste et demande le focus dessus. No-op au-delà de 4 temps. */
  protected ajouterTemps(): void {
    if (!this.formCreneau || this.estNombreTempsMaxAtteint()) return;
    this.formCreneau.temps = [...this.formCreneau.temps, this.creerTempsVide()];
    this.indexAFocaliserTemps.set(this.formCreneau.temps.length - 1);
  }

  /**
   * Supprime le temps à l'index donné. No-op s'il ne reste plus qu'un seul temps.
   * @param index Index du temps à supprimer.
   */
  protected supprimerTemps(index: number): void {
    if (!this.formCreneau || this.formCreneau.temps.length <= 1) return;
    this.formCreneau.temps = this.formCreneau.temps.filter((_, i) => i !== index);
    this.indexAFocaliserTemps.set(null);
  }

  /**
   * Crée un temps vide, avec un horaire par défaut enchaîné sur le dernier temps existant.
   * @returns Nouveau temps initialisé.
   */
  private creerTempsVide(): TempsCreneau {
    const heureDebut = this.formCreneau?.temps.at(-1)?.heureFin ?? '08:00';
    return {
      id: crypto.randomUUID(),
      heureDebut,
      heureFin: DateUtils.ajouterHeures(heureDebut, 1),
      disciplinesIds: [],
      elevesConcernes: { type: 'classe', groupes: [], elevesIds: [] },
    };
  }

  /** Enregistre les propriétés de l'EDT si le nom est renseigné ; sinon affiche l'erreur. */
  protected onEnregistrerEdt(): void {
    this.soumissionEdtTentee.set(true);
    if (!this.formEdt || !this.verifierNomEdtRenseigne()) return;
    this.edtEnregistre.emit(structuredClone(this.formEdt));
  }

  /**
   * Enregistre le créneau si chaque temps a une heure de fin postérieure à son heure de début ;
   * sinon affiche l'erreur sur les temps concernés. Un créneau hors classe (récréation, pause
   * déjeuner) est émis sans les champs pédagogiques de ses temps ; le formulaire, lui,
   * conserve les saisies.
   */
  protected onEnregistrerCreneau(): void {
    this.soumissionCreneauTentee.set(true);
    if (!this.formCreneau) return;
    if (!this.formCreneau.temps.every((t) => EdtFormulaireComponent.verifierPlageHoraire(t))) {
      return;
    }
    const creneau = structuredClone(this.formCreneau);
    if (creneau.type !== 'pedagogique') {
      creneau.temps = creneau.temps.map(({ id, heureDebut, heureFin }) => ({
        id,
        heureDebut,
        heureFin,
      }));
    }
    this.creneauEnregistre.emit(creneau);
  }

  /**
   * Restaure les propriétés de l'EDT telles qu'à l'ouverture du formulaire, puis délègue
   * l'annulation au parent (qui ferme le formulaire si l'EDT n'a jamais été enregistré).
   */
  protected onEdtAnnule(): void {
    this.formEdt = this.edtOrigine ? structuredClone(this.edtOrigine) : null;
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
    if (this.formCreneau) this.creneauSupprime.emit(this.formCreneau.id);
  }
}
