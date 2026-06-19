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
import { FormsModule } from '@angular/forms';
import { LIBELLES } from '../../../libelles';
import { McInputComponent } from '../../../composants/mc-input/mc-input.component';
import { McSelectComponent } from '../../../composants/mc-select/mc-select.component';
import { McChampHeureComponent } from '../../../composants/mc-champ-heure/mc-champ-heure.component';
import { McChipFiltreComponent } from '../../../composants/mc-chip-filtre/mc-chip-filtre.component';
import { McElevesConcernesComponent } from '../../../composants/mc-eleves-concernes/mc-eleves-concernes.component';
import { McBoutonDestructionComponent } from '../../../composants/mc-bouton-destruction/mc-bouton-destruction.component';
import type { EmploiDuTemps, CreneauEdt, ElevesConcernes } from '../../../modeles/emploi-du-temps.modele';
import type { Competence } from '../../../modeles/referentiels.modele';

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

  /** EDT courant (propriétés). */
  public readonly edt: InputSignal<EmploiDuTemps | null> = input<EmploiDuTemps | null>(null);

  /** Créneau à éditer (null = afficher les propriétés EDT). */
  public readonly creneau: InputSignal<CreneauEdt | null> = input<CreneauEdt | null>(null);

  /** Domaines de niveau 1 pour les chips de disciplines. */
  public readonly domaines: InputSignal<Competence[]> = input<Competence[]>([]);

  /** Émis avec l'EDT modifié à la sauvegarde des propriétés. */
  public readonly edtEnregistre: OutputEmitterRef<EmploiDuTemps> = output<EmploiDuTemps>();

  /** Émis pour déclencher la suppression de l'EDT. */
  public readonly edtSupprime: OutputEmitterRef<void> = output<void>();

  /** Émis avec le créneau modifié ou créé. */
  public readonly creneauEnregistre: OutputEmitterRef<CreneauEdt> = output<CreneauEdt>();

  /** Émis pour déclencher la suppression d'un créneau existant. */
  public readonly creneauSupprime: OutputEmitterRef<string> = output<string>();

  /** Émis quand l'utilisateur annule. */
  public readonly annule: OutputEmitterRef<void> = output<void>();

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

  /** Copie locale de l'EDT en cours d'édition. */
  protected formEdt: EmploiDuTemps | null = null;

  /** Copie locale du créneau en cours d'édition. */
  protected formCreneau: CreneauEdt | null = null;

  /** `true` si un créneau existant est en cours d'édition (pour afficher SUPPRIMER). */
  protected readonly estEditionCreneau = computed(
    () => this.creneau() !== null && !!this.creneau()?.id,
  );

  /** Charge les copies locales à chaque changement des entrées. */
  public constructor() {
    effect(() => {
      const e = this.edt();
      this.formEdt = e ? structuredClone(e) : null;
      this.cdr.markForCheck();
    });
    effect(() => {
      const c = this.creneau();
      this.formCreneau = c ? structuredClone(c) : null;
      this.cdr.markForCheck();
    });
  }

  /**
   * Bascule une discipline dans les disciplines du créneau.
   * @param id Identifiant du domaine.
   * @param actif Nouvel état.
   */
  protected basculerDiscipline(id: string, actif: boolean): void {
    if (!this.formCreneau) return;
    const ids = this.formCreneau.disciplinesIds ?? [];
    this.formCreneau.disciplinesIds = actif
      ? [...ids, id]
      : ids.filter(d => d !== id);
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
}
