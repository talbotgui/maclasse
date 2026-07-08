import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import type { InputSignal, OutputEmitterRef } from '@angular/core';
import { ComposantBase } from '../../../composant-base';
import { McAutoFocusDirective } from '../../../directives/mc-auto-focus.directive';
import { DonneesService } from '../../../services/avecEtat/donnees.service';
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
  imports: [McAutoFocusDirective],
  templateUrl: './popin-export-competences.component.html',
  styleUrl: './popin-export-competences.component.scss',
})
export class PopinExportCompetencesComponent extends ComposantBase {
  /** Contrôle la visibilité de la popin. */
  public readonly visible: InputSignal<boolean> = input(false);

  /** Identifiants des compétences à exporter. */
  public readonly competencesIds: InputSignal<string[]> = input<string[]>([]);

  /** Mode d'export : `'projet'` pour projet/période, `'seance'` pour jour/séance. */
  public readonly mode: InputSignal<'projet' | 'seance'> = input<'projet' | 'seance'>('projet');

  /** Émis avec les identifiants cibles quand l'utilisateur confirme l'export. */
  protected readonly confirme: OutputEmitterRef<ResultatExportCompetences> =
    output<ResultatExportCompetences>();

  /** Émis quand l'utilisateur annule. */
  protected readonly annule: OutputEmitterRef<void> = output<void>();

  /** Référence à l'élément `<dialog>` natif. */
  private readonly dialogEl = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  /** Accès aux données de l'application pour construire les listes. */
  private readonly donneesService = inject(DonneesService);

  /** Sélection principale : projet ID (mode projet) ou date ISO (mode séance). */
  protected readonly selectionPrimaire = signal('');

  /** Sélection secondaire : index période en string (mode projet) ou séance ID (mode séance). */
  protected readonly selectionSecondaire = signal('');

  /** `true` quand les deux sélections sont renseignées. */
  protected readonly peutConfirmer = computed(
    () => !!this.selectionPrimaire() && !!this.selectionSecondaire(),
  );

  /** Options du premier `<select>` selon le mode courant. */
  protected readonly optionsPrimaires = computed<OptionFormulaire[]>(() => {
    const donnees = this.donneesService.donnees();
    if (!donnees) return [];
    if (this.mode() === 'projet') {
      return donnees.projets.map((p) => ({ valeur: p.id, libelle: p.nom }));
    }
    return donnees.cahierJournal
      .filter((j) => j.seances.some((s) => s.type === 'pedagogique'))
      .map((j) => ({ valeur: j.date, libelle: j.date }));
  });

  /** Options du second `<select>` dépendant de la sélection primaire. */
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

  /** Ouvre ou ferme la dialog native en réaction au signal `visible`. */
  public constructor() {
    super();
    effect(() => {
      const el = this.dialogEl().nativeElement;
      if (this.visible()) {
        this.selectionPrimaire.set('');
        this.selectionSecondaire.set('');
        if (!el.open) el.showModal();
      } else if (el.open) {
        el.close();
      }
    });
  }

  /**
   * Met à jour la sélection primaire et réinitialise la secondaire.
   * @param valeur Identifiant sélectionné dans le premier `<select>`.
   */
  protected surChangementPrimaire(valeur: string): void {
    this.selectionPrimaire.set(valeur);
    this.selectionSecondaire.set('');
  }

  /**
   * Met à jour la sélection secondaire.
   * @param valeur Identifiant sélectionné dans le second `<select>`.
   */
  protected surChangementSecondaire(valeur: string): void {
    this.selectionSecondaire.set(valeur);
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
