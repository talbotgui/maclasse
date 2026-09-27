import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import type { InputSignal, OutputEmitterRef, Signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { PopinBase } from '../../../popin-base';
import { McAutoFocusDirective } from '../../../directives/mc-auto-focus.directive';
import { McSelectComponent } from '../../../composants/mc-select/mc-select.component';
import { DonneesService } from '../../../services/avecEtat/donnees.service';
import { DateUtils } from '../../../utilitaires/date.utils';
import type {
  OptionFormulaire,
  ResultatExportCompetences,
} from '../../../modeles/composants.modele';

export type { ResultatExportCompetences };

/**
 * Popin d'export de compétences vers un projet (période) ou une séance du cahier journal.
 * Injecte `DonneesService` pour construire les listes de sélection en cascade.
 */
@Component({
  selector: 'popin-export-competences',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, McAutoFocusDirective, McSelectComponent],
  templateUrl: './popin-export-competences.component.html',
  styleUrl: './popin-export-competences.component.scss',
})
export class PopinExportCompetencesComponent extends PopinBase {
  /** Identifiants des compétences à exporter. */
  public readonly competencesIds: InputSignal<string[]> = input<string[]>([]);

  /** Mode d'export : `'projet'` pour projet/période, `'seance'` pour jour/séance. */
  public readonly mode: InputSignal<'projet' | 'seance'> = input<'projet' | 'seance'>('projet');

  /** Émis avec les identifiants cibles quand l'utilisateur confirme l'export. */
  protected readonly confirme: OutputEmitterRef<ResultatExportCompetences> =
    output<ResultatExportCompetences>();

  /** Émis quand l'utilisateur annule. */
  protected readonly annule: OutputEmitterRef<void> = output<void>();

  /** Accès aux données de l'application pour construire les listes. */
  private readonly donneesService = inject(DonneesService);

  /** Champ de la sélection principale : projet ID (mode projet) ou date ISO (mode séance). */
  protected readonly controlePrimaire = new FormControl('', { nonNullable: true });

  /** Champ de la sélection secondaire : index de période (mode projet) ou séance ID (mode séance). */
  protected readonly controleSecondaire = new FormControl('', { nonNullable: true });

  /** Sélection principale courante, en signal pour le calcul des options dépendantes. */
  protected readonly selectionPrimaire: Signal<string> = toSignal(
    this.controlePrimaire.valueChanges,
    { initialValue: this.controlePrimaire.value },
  );

  /** Sélection secondaire courante, en signal pour l'activation du bouton de confirmation. */
  protected readonly selectionSecondaire: Signal<string> = toSignal(
    this.controleSecondaire.valueChanges,
    { initialValue: this.controleSecondaire.value },
  );

  /** `true` quand les deux sélections sont renseignées. */
  protected readonly peutConfirmer = computed(
    () => !!this.selectionPrimaire() && !!this.selectionSecondaire(),
  );

  /** Options de la première liste selon le mode courant (journées affichées en JJ/MM/AAAA). */
  protected readonly optionsPrimaires = computed<OptionFormulaire[]>(() => {
    const donnees = this.donneesService.donnees();
    if (!donnees) return [];
    if (this.mode() === 'projet') {
      return donnees.projets.map((p) => ({ valeur: p.id, libelle: p.nom }));
    }
    return donnees.cahierJournal
      .filter((j) => j.seances.some((s) => s.type === 'pedagogique'))
      .map((j) => ({ valeur: j.date, libelle: DateUtils.formaterDateCourt(j.date) }));
  });

  /** Options de la seconde liste, dépendant de la sélection primaire. */
  protected readonly optionsSecondaires = computed<OptionFormulaire[]>(() => {
    const donnees = this.donneesService.donnees();
    if (!donnees || !this.selectionPrimaire()) return [];
    if (this.mode() === 'projet') {
      const projet = donnees.projets.find((p) => p.id === this.selectionPrimaire());
      return (
        projet?.periodes.map((p, i) => ({
          valeur: String(i),
          libelle: p.periodeNom,
        })) ?? []
      );
    }
    const journee = donnees.cahierJournal.find((j) => j.date === this.selectionPrimaire());
    return (
      journee?.seances
        .filter((s) => s.type === 'pedagogique')
        .map((s) => ({
          valeur: s.id,
          libelle: s.titre ? s.titre : `${s.heureDebut} – ${s.heureFin}`,
        })) ?? []
    );
  });

  /** Vide la sélection secondaire à chaque changement de la sélection principale. */
  public constructor() {
    super();
    this.controlePrimaire.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.controleSecondaire.reset());
  }

  /** Réinitialise les champs de saisie à chaque ouverture. */
  protected override reinitialiserALOuverture(): void {
    this.controlePrimaire.reset();
    this.controleSecondaire.reset();
  }

  /** Émet le résultat de l'export si les deux sélections sont renseignées. */
  protected surConfirmation(): void {
    if (!this.peutConfirmer()) return;
    this.confirme.emit({
      cibleType: this.mode(),
      cibleId: this.selectionPrimaire(),
      secondaireId: this.selectionSecondaire(),
    });
  }

  /** Annule l'export. */
  protected surAnnulation(): void {
    this.annule.emit();
  }

  /** Intercepte Échap pour émettre `annule`. */
  protected surCancel(event: Event): void {
    event.preventDefault();
    this.annule.emit();
  }
}
