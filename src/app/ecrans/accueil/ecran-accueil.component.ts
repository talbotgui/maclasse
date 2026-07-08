/**
 * Écran d'accueil : affiche la date du jour et le résumé des séances du cahier journal.
 */

import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { LIBELLES } from '../../libelles';
import { DonneesService } from '../../services/avecEtat/donnees.service';
import { CompetenceService } from '../../services/sansEtat/competence.service';
import { DateUtils } from '../../utilitaires/date.utils';

/** Vue résumée d'une séance pédagogique pour l'affichage de l'accueil. */
interface SeanceResumee {
  /** Heure de début au format `HH:MM`. */
  heureDebut: string;
  /** Heure de fin au format `HH:MM`. */
  heureFin: string;
  /** Libellés des domaines de compétences associés. */
  disciplines: string[];
  /** Nombre d'élèves concernés par la séance. */
  nbEleves: number;
}

/**
 * Écran d'accueil de l'application.
 * Affiche la date du jour et un résumé en lecture seule des séances
 * du cahier journal du jour (hors récréations et pauses déjeuner).
 */
@Component({
  selector: 'ecran-accueil',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ecran-accueil.component.html',
  styleUrl: './ecran-accueil.component.scss',
})
export class EcranAccueilComponent {
  /** Constante centralisée des libellés. */
  protected readonly LIBELLES = LIBELLES;

  /** Service de données : lecture du cahier journal. */
  private readonly donneesService = inject(DonneesService);

  /** Service de compétences : résolution des libellés de domaines. */
  private readonly competenceService = inject(CompetenceService);

  /** Date ISO locale du jour (format `YYYY-MM-DD`). */
  private readonly dateIsoAujourdhui: string = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  /** Date du jour formatée en toutes lettres (ex. `"lundi 9 juin 2026"`). */
  protected readonly dateFormatee: string = DateUtils.formaterDateLong(this.dateIsoAujourdhui);

  /**
   * Séances pédagogiques du jour, filtrées (hors récréations et pauses déjeuner),
   * prêtes à l'affichage avec disciplines résolues et nombre d'élèves calculé.
   */
  protected readonly seancesResumees = computed<SeanceResumee[]>(() => {
    const donnees = this.donneesService.donnees();
    if (!donnees) return [];

    const journee = donnees.cahierJournal.find((j) => j.date === this.dateIsoAujourdhui);
    if (!journee) return [];

    const nbTotalEleves = donnees.classe.eleves.length;

    return journee.seances
      .filter((s) => s.type === 'pedagogique')
      .map((s) => {
        const disciplines = (s.disciplinesIds ?? [])
          .map((id) => this.competenceService.obtenirDomaineParId(id)?.libelle ?? '')
          .filter((l) => l.length > 0);

        let nbEleves = nbTotalEleves;
        if (s.elevesConcernes) {
          if (s.elevesConcernes.type === 'eleves') {
            nbEleves = s.elevesConcernes.elevesIds.length;
          } else if (s.elevesConcernes.type === 'groupes') {
            nbEleves = donnees.classe.eleves.filter((e) =>
              e.groupes.some((g) => s.elevesConcernes!.groupes.includes(g)),
            ).length;
          }
        }

        return { heureDebut: s.heureDebut, heureFin: s.heureFin, disciplines, nbEleves };
      });
  });
}
