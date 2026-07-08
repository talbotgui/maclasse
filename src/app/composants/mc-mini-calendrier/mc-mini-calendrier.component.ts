import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import type { InputSignal, OutputEmitterRef } from '@angular/core';
import { ComposantBase } from '../../composant-base';
import type { JourFerie } from '../../modeles/referentiels.modele';
import type { JourSemaine } from '../../modeles/emploi-du-temps.modele';
import type { CaseCalendrier } from '../../modeles/composants.modele';
import { LIBELLES } from '../../libelles';

/**
 * Calendrier mensuel miniature navigable.
 * Grise les weekends, jours fériés et jours non ouvrés.
 * Met en évidence les journées ayant une entrée dans le cahier journal.
 * La navigation entre mois est limitée par `dateMin` et `dateMax`.
 */
@Component({
  selector: 'mc-mini-calendrier',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mc-mini-calendrier.component.html',
  styleUrl: './mc-mini-calendrier.component.scss',
})
export class McMiniCalendrierComponent extends ComposantBase {
  /** En-têtes des colonnes (semaine française, lundi en premier). */
  private static readonly ENTETES_COLONNES = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  /** Dates ISO des journées ayant au moins une entrée dans le cahier journal. */
  public readonly journeesAvecEntrees: InputSignal<string[]> = input<string[]>([]);

  /** Jours fériés et périodes de vacances de l'année scolaire. */
  public readonly joursFeries: InputSignal<JourFerie[]> = input<JourFerie[]>([]);

  /** Jours ouvrés affichés dans la grille (ex. : lundi à vendredi). */
  public readonly joursOuvres: InputSignal<JourSemaine[]> = input<JourSemaine[]>([]);

  /** Date ISO du jour sélectionné, ou `null` si aucun. */
  public readonly jourSelectionne: InputSignal<string | null> = input<string | null>(null);

  /**
   * Date ISO minimale de navigation (premier jour de la première période).
   * `null` = pas de limite inférieure.
   */
  public readonly dateMin: InputSignal<string | null> = input<string | null>(null);

  /**
   * Date ISO maximale de navigation (dernier jour de la dernière période).
   * `null` = pas de limite supérieure.
   */
  public readonly dateMax: InputSignal<string | null> = input<string | null>(null);

  /** Émis avec la date ISO du jour que l'utilisateur vient de sélectionner. */
  protected readonly jourChange: OutputEmitterRef<string> = output<string>();

  /** En-têtes de colonnes exposés au template. */
  protected readonly entetes = McMiniCalendrierComponent.ENTETES_COLONNES;

  /** Premier jour du mois affiché (jour toujours fixé à 1). */
  protected readonly moisAffiche = signal<Date>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );

  /** Libellé localisé du mois affiché (ex. : "juin 2026"). */
  protected readonly libelleMois = computed(() =>
    this.moisAffiche().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
  );

  /** `true` si la navigation vers le mois précédent est autorisée. */
  protected readonly peutNaviguerArriere = computed(() => {
    const min = this.dateMin();
    if (!min) return true;
    const m = this.moisAffiche();
    const moisMin = new Date(min + 'T00:00:00');
    return m.getFullYear() * 12 + m.getMonth() > moisMin.getFullYear() * 12 + moisMin.getMonth();
  });

  /** `true` si la navigation vers le mois suivant est autorisée. */
  protected readonly peutNaviguerAvant = computed(() => {
    const max = this.dateMax();
    if (!max) return true;
    const m = this.moisAffiche();
    const moisMax = new Date(max + 'T00:00:00');
    return m.getFullYear() * 12 + m.getMonth() < moisMax.getFullYear() * 12 + moisMax.getMonth();
  });

  /** Cases de la grille du mois affiché (cases vides + jours du mois). */
  protected readonly grille = computed<CaseCalendrier[]>(() => {
    const mois = this.moisAffiche();
    const entrees = new Set(this.journeesAvecEntrees());
    const feries = new Set(this.joursFeries().map((f) => f.date));
    const joursOuvresSet = new Set<string>(this.joursOuvres());
    const selectionne = this.jourSelectionne();
    const aujourdhui = McMiniCalendrierComponent.versDateIso(new Date());

    const annee = mois.getFullYear();
    const moisNum = mois.getMonth();
    const premier = new Date(annee, moisNum, 1);
    const nJours = new Date(annee, moisNum + 1, 0).getDate();
    const offset = (premier.getDay() + 6) % 7;

    const cases: CaseCalendrier[] = [];

    for (let i = 0; i < offset; i++) {
      cases.push({
        date: null,
        grise: false,
        avecEntree: false,
        estSelectionnee: false,
        estAujourdhui: false,
      });
    }

    for (let j = 1; j <= nJours; j++) {
      const d = new Date(annee, moisNum, j);
      const iso = McMiniCalendrierComponent.versDateIso(d);
      const nomJour = this.LIBELLES.dates.nomsJours[d.getDay()];
      const estWeekend = d.getDay() === 0 || d.getDay() === 6;
      const grise = estWeekend || feries.has(iso) || (!estWeekend && !joursOuvresSet.has(nomJour));

      cases.push({
        date: iso,
        grise,
        avecEntree: entrees.has(iso),
        estSelectionnee: iso === selectionne,
        estAujourdhui: iso === aujourdhui,
      });
    }

    return cases;
  });

  /**
   * Synchronise le mois affiché avec `jourSelectionne` lorsque la date sélectionnée
   * appartient à un mois différent de celui en cours d'affichage.
   */
  public constructor() {
    super();
    effect(() => {
      const jourSel = this.jourSelectionne();
      if (!jourSel) return;
      const date = new Date(jourSel + 'T00:00:00');
      const affiche = untracked(() => this.moisAffiche());
      if (date.getFullYear() !== affiche.getFullYear() || date.getMonth() !== affiche.getMonth()) {
        this.moisAffiche.set(new Date(date.getFullYear(), date.getMonth(), 1));
      }
    });
  }

  /** Navigue vers le mois précédent si autorisé. */
  protected naviguerMoisPrecedent(): void {
    if (!this.peutNaviguerArriere()) return;
    const m = this.moisAffiche();
    this.moisAffiche.set(new Date(m.getFullYear(), m.getMonth() - 1, 1));
  }

  /** Navigue vers le mois suivant si autorisé. */
  protected naviguerMoisSuivant(): void {
    if (!this.peutNaviguerAvant()) return;
    const m = this.moisAffiche();
    this.moisAffiche.set(new Date(m.getFullYear(), m.getMonth() + 1, 1));
  }

  /**
   * Émet la date sélectionnée si le jour n'est pas grisé.
   * @param caseCalendrier Case du calendrier cliquée.
   */
  protected selectionnerJour(caseCalendrier: CaseCalendrier): void {
    if (!caseCalendrier.date || caseCalendrier.grise) return;
    this.jourChange.emit(caseCalendrier.date);
  }

  /**
   * Retourne la date locale au format ISO (YYYY-MM-DD) sans conversion UTC.
   * @param date Objet Date local.
   */
  private static versDateIso(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
