/**
 * Écran du cahier journal.
 * Colonne gauche : mini-calendrier et actions journée.
 * Colonne droite : liste des séances et formulaire de saisie.
 */

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { LIBELLES } from '../../libelles';
import { DonneesService } from '../../services/avecEtat/donnees.service';
import { CahierJournalService } from '../../services/sansEtat/cahier-journal.service';
import { CompetenceService } from '../../services/sansEtat/competence.service';
import { DateUtils } from '../../utilitaires/date.utils';
import { McMiniCalendrierComponent } from '../../composants/mc-mini-calendrier/mc-mini-calendrier.component';
import { PopinAvertissementComponent } from '../../composants/popins/popin-avertissement/popin-avertissement.component';
import { PopinWarningsAbsencesComponent } from '../../composants/popins/popin-warnings-absences/popin-warnings-absences.component';
import { CjFormulaireSeanceComponent } from './cj-formulaire-seance/cj-formulaire-seance.component';
import type { Seance, JourneeJournal } from '../../modeles/cahier-journal.modele';
import type { Competence, JourFerie } from '../../modeles/referentiels.modele';
import type { JourSemaine } from '../../modeles/emploi-du-temps.modele';

/** Nombre de millisecondes dans un jour. */
const MS_PAR_JOUR = 24 * 60 * 60 * 1000;

/**
 * Décale une date ISO de `delta` jours.
 * @param dateIso Date au format ISO.
 * @param delta Nombre de jours (positif ou négatif).
 */
function decalerDate(dateIso: string, delta: number): string {
  const d = new Date(dateIso + 'T00:00:00');
  d.setTime(d.getTime() + delta * MS_PAR_JOUR);
  return d.toISOString().slice(0, 10);
}

/**
 * Retourne la date ISO d'aujourd'hui sans décalage UTC.
 */
function dateAujourdhui(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Écran du cahier journal.
 * Navigation par mini-calendrier et boutons ±1 j / ±7 j.
 * Séances listées avec réordonnancement, duplication, suppression, et formulaire inline.
 */
@Component({
  selector: 'ecran-cahier-journal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    McMiniCalendrierComponent,
    PopinAvertissementComponent,
    PopinWarningsAbsencesComponent,
    CjFormulaireSeanceComponent,
  ],
  templateUrl: './ecran-cahier-journal.component.html',
  styleUrl: './ecran-cahier-journal.component.scss',
})
export class EcranCahierJournalComponent {
  /** Constante centralisée des libellés. */
  protected readonly LIBELLES = LIBELLES;

  /** Accès aux données de l'application. */
  private readonly donneesService = inject(DonneesService);

  /** Service métier du cahier journal. */
  private readonly cahierJournalService = inject(CahierJournalService);

  /** Service des compétences (domaines pour les chips de disciplines). */
  private readonly competenceService = inject(CompetenceService);

  /** Date actuellement sélectionnée dans le calendrier. */
  protected readonly dateSelectionnee = signal<string>(dateAujourdhui());

  /** Séance sélectionnée pour modification (`null` si aucune). */
  protected readonly seanceEditee = signal<Seance | null>(null);

  /** `true` si le formulaire de création de séance est ouvert. */
  protected readonly enCreationSeance = signal(false);

  /** Contrôle la visibilité de la popin de confirmation de suppression de journée. */
  protected readonly popinSupprimerVisible = signal(false);

  /** Contrôle la visibilité de la popin de duplication. */
  protected readonly popinDuplicationVisible = signal(false);

  /** Date cible pour la duplication de journée ou de séance. */
  protected readonly dateDuplication = signal<string>('');

  /** Identifiant de la séance à dupliquer (`null` = dupliquer la journée complète). */
  protected readonly seanceIdDuplication = signal<string | null>(null);

  /** Contrôle la visibilité de la popin de conflits d'absences. */
  protected readonly popinConflitsVisible = signal(false);

  /** Messages de conflits à afficher dans la popin. */
  protected readonly conflits = signal<string[]>([]);

  /** Journée sélectionnée depuis le store. */
  protected readonly journeeSelectionnee = computed<JourneeJournal | null>(
    () =>
      this.donneesService.donnees()?.cahierJournal.find(
        j => j.date === this.dateSelectionnee(),
      ) ?? null,
  );

  /** Séances ordonnées par heure de début pour la journée sélectionnée. */
  protected readonly seances = computed<Seance[]>(() => {
    const j = this.journeeSelectionnee();
    if (!j) return [];
    return [...j.seances].sort((a, b) => a.heureDebut.localeCompare(b.heureDebut));
  });

  /** Dates possédant des entrées dans le cahier journal (pour le calendrier). */
  protected readonly journeesAvecEntrees = computed<string[]>(
    () => this.donneesService.donnees()?.cahierJournal.map(j => j.date) ?? [],
  );

  /** Jours ouvrés configurés. */
  protected readonly joursOuvres = computed<JourSemaine[]>(
    () =>
      this.donneesService.donnees()?.referentiels.configEmploiDuTemps.joursOuvres ?? [],
  );

  /** Jours fériés configurés. */
  protected readonly joursFeries = computed<JourFerie[]>(
    () => this.donneesService.donnees()?.referentiels.joursFeries ?? [],
  );

  /** Domaines de niveau 1 pour les chips de disciplines. */
  protected readonly domaines = computed<Competence[]>(() =>
    this.competenceService.obtenirDomaines(),
  );

  /** Libellé formaté de la date sélectionnée. */
  protected readonly dateFormatee = computed<string>(() =>
    DateUtils.formaterDateLong(this.dateSelectionnee()),
  );

  /**
   * Navigue à une date voisine.
   * @param delta Nombre de jours à décaler (±1, ±7).
   */
  protected naviguerJour(delta: number): void {
    this.dateSelectionnee.update(d => decalerDate(d, delta));
    this.fermerFormulaire();
  }

  /**
   * Sélectionne une date depuis le mini-calendrier.
   * @param date Date ISO sélectionnée.
   */
  protected surChangementDate(date: string): void {
    this.dateSelectionnee.set(date);
    this.fermerFormulaire();
  }

  /** Initialise la journée sélectionnée avec une structure vide. */
  protected initialiserVide(): void {
    this.cahierJournalService.initialiserJourneeVide(this.dateSelectionnee());
  }

  /** Initialise la journée sélectionnée depuis l'emploi du temps courant. */
  protected initialiserDepuisEdt(): void {
    this.cahierJournalService.initialiserDepuisEdt(this.dateSelectionnee());
  }

  /** Affiche la popin de confirmation de suppression de journée. */
  protected demanderSuppressionJournee(): void {
    this.popinSupprimerVisible.set(true);
  }

  /** Supprime la journée sélectionnée après confirmation. */
  protected confirmerSuppressionJournee(): void {
    this.popinSupprimerVisible.set(false);
    this.cahierJournalService.supprimerJournee(this.dateSelectionnee());
    this.fermerFormulaire();
  }

  /** Annule la suppression. */
  protected annulerSuppression(): void {
    this.popinSupprimerVisible.set(false);
  }

  /**
   * Ouvre la popin de duplication pour la journée ou une séance.
   * @param seanceId UUID de la séance à dupliquer, ou `null` pour la journée.
   */
  protected demanderDuplication(seanceId: string | null): void {
    this.seanceIdDuplication.set(seanceId);
    this.dateDuplication.set('');
    this.popinDuplicationVisible.set(true);
  }

  /** Confirme la duplication vers la date saisie. */
  protected confirmerDuplication(): void {
    const dateCible = this.dateDuplication();
    if (!dateCible) return;
    const seanceId = this.seanceIdDuplication();
    if (seanceId) {
      this.cahierJournalService.dupliquerSeance(seanceId, this.dateSelectionnee(), dateCible);
    } else {
      this.cahierJournalService.dupliquerJournee(this.dateSelectionnee(), dateCible);
    }
    this.popinDuplicationVisible.set(false);
  }

  /** Annule la duplication. */
  protected annulerDuplication(): void {
    this.popinDuplicationVisible.set(false);
  }

  /** Ouvre le formulaire de création de séance. */
  protected creerSeance(): void {
    this.seanceEditee.set(null);
    this.enCreationSeance.set(true);
  }

  /**
   * Ouvre le formulaire de modification d'une séance.
   * @param seance Séance à modifier.
   */
  protected editerSeance(seance: Seance): void {
    this.seanceEditee.set(seance);
    this.enCreationSeance.set(false);
  }

  /**
   * Enregistre une séance (création ou modification).
   * Affiche les conflits d'absences si détectés (non bloquant).
   * @param seance Séance émise par le formulaire.
   */
  protected onEnregistrerSeance(seance: Seance): void {
    const date = this.dateSelectionnee();
    const journee = this.journeeSelectionnee();
    const existante = journee?.seances.find(s => s.id === seance.id);
    if (existante) {
      this.cahierJournalService.modifierSeance(date, seance);
    } else {
      this.cahierJournalService.ajouterSeance(date, seance);
    }
    const conflitsDetectes = this.cahierJournalService.calculerConflitsAbsences(date, seance.id);
    if (conflitsDetectes.length > 0) {
      this.conflits.set(conflitsDetectes);
      this.popinConflitsVisible.set(true);
    }
    this.fermerFormulaire();
  }

  /** Ferme la popin de conflits. */
  protected fermerConflits(): void {
    this.popinConflitsVisible.set(false);
    this.conflits.set([]);
  }

  /** Ferme le formulaire de séance. */
  protected fermerFormulaire(): void {
    this.seanceEditee.set(null);
    this.enCreationSeance.set(false);
  }

  /**
   * Supprime une séance.
   * @param seanceId UUID de la séance à supprimer.
   */
  protected supprimerSeance(seanceId: string): void {
    this.cahierJournalService.supprimerSeance(this.dateSelectionnee(), seanceId);
    if (this.seanceEditee()?.id === seanceId) this.fermerFormulaire();
  }

  /**
   * Déplace une séance vers le haut (indice − 1) ou vers le bas (indice + 1).
   * @param indexSource Indice courant dans la liste triée.
   * @param direction −1 pour monter, +1 pour descendre.
   */
  protected deplacerSeance(indexSource: number, direction: -1 | 1): void {
    const indexCible = indexSource + direction;
    if (indexCible < 0 || indexCible >= this.seances().length) return;
    this.cahierJournalService.deplacerSeance(this.dateSelectionnee(), indexSource, indexCible);
  }

  /**
   * Met à jour la date cible de duplication depuis l'événement input.
   * @param event Événement natif de l'input date.
   */
  protected mettreAJourDateDuplication(event: Event): void {
    this.dateDuplication.set((event.target as HTMLInputElement).value);
  }

  /** Lance l'impression du cahier journal de la journée. */
  protected imprimer(): void {
    window.print();
  }
}
