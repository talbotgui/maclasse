/**
 * Écran de gestion des emplois du temps.
 * Trois colonnes : liste des EDT, grille hebdomadaire, formulaire contextuel.
 */

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { LIBELLES } from '../../libelles';
import { DonneesService } from '../../services/avecEtat/donnees.service';
import { EmploiDuTempsService } from '../../services/sansEtat/emploi-du-temps.service';
import { CompetenceService } from '../../services/sansEtat/competence.service';
import { EdtFormulaireComponent } from './edt-formulaire/edt-formulaire.component';
import { McPastillesElevesConcernesComponent } from '../../composants/mc-pastilles-eleves-concernes/mc-pastilles-eleves-concernes.component';
import { PopinAvertissementComponent } from '../../composants/popins/popin-avertissement/popin-avertissement.component';
import { PopinWarningsAbsencesComponent } from '../../composants/popins/popin-warnings-absences/popin-warnings-absences.component';
import { DateUtils } from '../../utilitaires/date.utils';
import type { AvecNavigationGardee } from '../../gardes/modifications-non-enregistrees.garde';
import type {
  EmploiDuTemps,
  CreneauEdt,
  JourSemaine,
  FrequenceSemaine,
} from '../../modeles/emploi-du-temps.modele';
import type { Competence } from '../../modeles/referentiels.modele';

/**
 * Écran emploi du temps.
 * Colonne gauche : liste des EDT avec indicateur de conflit.
 * Colonne centrale : grille hebdomadaire de l'EDT sélectionné.
 * Colonne droite : formulaire contextuel EDT ou créneau.
 */
@Component({
  selector: 'ecran-emploi-du-temps',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    EdtFormulaireComponent,
    McPastillesElevesConcernesComponent,
    PopinAvertissementComponent,
    PopinWarningsAbsencesComponent,
  ],
  templateUrl: './ecran-emploi-du-temps.component.html',
  styleUrl: './ecran-emploi-du-temps.component.scss',
})
export class EcranEmploiDuTempsComponent implements AvecNavigationGardee {
  /** Ordre canonique des jours ouvrés. */
  private static readonly ORDRE_JOURS: JourSemaine[] = [
    'lundi',
    'mardi',
    'mercredi',
    'jeudi',
    'vendredi',
  ];

  /**
   * Crée un EDT vide prêt pour la saisie.
   * @returns Emploi du temps initialisé avec des valeurs par défaut.
   */
  private static creerEdtVide(): EmploiDuTemps {
    return {
      id: crypto.randomUUID(),
      nom: '',
      dateDebut: null,
      dateFin: null,
      frequence: 'lesDeux' as FrequenceSemaine,
      creneaux: [],
    };
  }

  /**
   * Crée un créneau vide pour le jour donné.
   * Si des créneaux existent déjà pour ce jour, `heureDebut` est initialisée à la
   * `heureFin` la plus tardive parmi eux, et `heureFin` à `heureDebut + 1h`.
   * @param jour Jour de la semaine du nouveau créneau.
   * @param creneauxDuJour Créneaux existants pour ce jour dans l'EDT courant.
   * @returns Créneau initialisé.
   */
  private static creerCreneauVide(
    jour: JourSemaine,
    creneauxDuJour: CreneauEdt[] = [],
  ): CreneauEdt {
    const derniereHeureFin = creneauxDuJour
      .map((c) => c.heureFin)
      .sort()
      .at(-1);
    const heureDebut = derniereHeureFin ?? '08:00';
    return {
      id: crypto.randomUUID(),
      jour,
      heureDebut,
      heureFin: DateUtils.ajouterHeures(heureDebut, 1),
      type: 'pedagogique',
      disciplinesIds: [],
      elevesConcernes: { type: 'classe', groupes: [], elevesIds: [] },
    };
  }

  /** Constante centralisée des libellés. */
  protected readonly LIBELLES = LIBELLES;

  /** Accès aux données de l'application. */
  private readonly donneesService = inject(DonneesService);

  /** Service métier emploi du temps. */
  private readonly emploiDuTempsService = inject(EmploiDuTempsService);

  /** Service des compétences pour charger les domaines racine. */
  private readonly competenceService = inject(CompetenceService);

  /** EDT affiché dans la grille (peut différer de l'EDT en cours d'édition). */
  protected readonly edtSelectionne = signal<EmploiDuTemps | null>(null);

  /** EDT passé au formulaire propriétés (null quand le formulaire créneau est actif). */
  protected readonly formEdt = signal<EmploiDuTemps | null>(null);

  /** Créneau passé au formulaire créneau (null quand le formulaire EDT est actif). */
  protected readonly creneauEdite = signal<CreneauEdt | null>(null);

  /** Contrôle la visibilité de la popin d'avertissement de navigation (modifications non enregistrées). */
  protected readonly popinNavigationVisible = signal(false);

  /** Contrôle la visibilité de la popin de détail des conflits entre EDT. */
  protected readonly popinConflitsEdtVisible = signal(false);

  /** Messages des EDT en conflit avec l'EDT consulté, affichés dans la popin de détail. */
  protected readonly conflitsEdt = signal<string[]>([]);

  /** Contrôle la visibilité de la popin de détail des conflits créneau/absence élève. */
  protected readonly popinConflitsAbsencesVisible = signal(false);

  /** Messages des absences en conflit avec le créneau consulté, affichés dans la popin de détail. */
  protected readonly conflitsAbsences = signal<string[]>([]);

  /** Index de l'EDT actuellement inclus dans l'ordre de tabulation (roving tabindex). */
  protected readonly indexEdtFocalise = signal(0);

  /**
   * Demande de focus transmise à `edt-formulaire`, pulsée à chaque changement de sélection.
   * `edt-formulaire` n'étant jamais recréé lors d'un passage d'un créneau/EDT à un autre
   * (même bloc `@if`), un simple `true` statique ne suffit pas à redéclencher le focus :
   * il faut une réelle transition `false` → `true` observée sur deux cycles de détection.
   */
  protected readonly focusDemandeFormulaire = signal(true);

  /** Boutons de sélection d'EDT actuellement rendus, dans l'ordre d'affichage. */
  private readonly optionsEdt = viewChildren<ElementRef<HTMLButtonElement>>('optionEdt');

  /** Résolution de la promesse de navigation (garde CanDeactivate). */
  private resolveGarde: ((result: boolean) => void) | null = null;

  /** Référence au formulaire EDT/créneau actuellement affiché, s'il y en a un. */
  private readonly formulaireEdt = viewChild(EdtFormulaireComponent);

  /** Liste complète des EDT depuis le store. */
  protected readonly edts = computed<EmploiDuTemps[]>(
    () => this.donneesService.donnees()?.emploisDuTemps ?? [],
  );

  /** Jours ouvrés configurés pour la grille hebdomadaire. */
  protected readonly joursOuvres = computed<JourSemaine[]>(() => {
    const jours = this.donneesService.donnees()?.referentiels.configEmploiDuTemps.joursOuvres ?? [];
    return EcranEmploiDuTempsComponent.ORDRE_JOURS.filter((j: JourSemaine) => jours.includes(j));
  });

  /** Domaines de niveau 1 pour les chips de disciplines du formulaire créneau. */
  protected readonly domaines = computed<Competence[]>(() =>
    this.competenceService.obtenirDomaines(),
  );

  /**
   * Lignes de la grille : plages horaires uniques triées par heureDebut
   * des créneaux de l'EDT sélectionné.
   */
  protected readonly lignesGrille = computed<{ heureDebut: string; heureFin: string }[]>(() => {
    const edt = this.edtSelectionne();
    if (!edt) return [];
    const vus = new Map<string, { heureDebut: string; heureFin: string }>();
    for (const c of edt.creneaux) {
      const cle = `${c.heureDebut}-${c.heureFin}`;
      if (!vus.has(cle)) vus.set(cle, { heureDebut: c.heureDebut, heureFin: c.heureFin });
    }
    return [...vus.values()].sort((a, b) => a.heureDebut.localeCompare(b.heureDebut));
  });

  /**
   * Index des créneaux pour un accès O(1) dans la grille.
   * Clé : `"jour-heureDebut-heureFin"`.
   */
  protected readonly indexCreneaux = computed<Map<string, CreneauEdt>>(() => {
    const edt = this.edtSelectionne();
    if (!edt) return new Map();
    const map = new Map<string, CreneauEdt>();
    for (const c of edt.creneaux) {
      map.set(`${c.jour}-${c.heureDebut}-${c.heureFin}`, c);
    }
    return map;
  });

  /** Identifiants des EDT présentant des chevauchements de créneaux. */
  protected readonly edtsAvecConflits = computed<Set<string>>(() => {
    const ids = new Set<string>();
    for (const edt of this.edts()) {
      if (this.emploiDuTempsService.validerChevauchement(edt)) ids.add(edt.id);
    }
    return ids;
  });

  /** Absences régulières pertinentes pour l'EDT sélectionné (jour utilisé + parité compatible). */
  protected readonly absencesPertinentes = computed(() => {
    const edt = this.edtSelectionne();
    return edt ? this.emploiDuTempsService.obtenirAbsencesPertinentes(edt) : [];
  });

  /** Identifiants des créneaux de l'EDT sélectionné en conflit avec une absence élève. */
  protected readonly creneauxAvecConflits = computed<Set<string>>(() => {
    const edt = this.edtSelectionne();
    if (!edt) return new Set();
    const ids = new Set<string>();
    for (const creneau of edt.creneaux) {
      if (this.emploiDuTempsService.calculerConflitsAbsences(creneau.id).length > 0) {
        ids.add(creneau.id);
      }
    }
    return ids;
  });

  /**
   * Retourne le créneau à l'intersection d'un jour et d'une plage horaire.
   * @param jour Jour de la semaine.
   * @param ligne Plage {heureDebut, heureFin}.
   */
  protected obtenirCreneauDeGrille(
    jour: JourSemaine,
    ligne: { heureDebut: string; heureFin: string },
  ): CreneauEdt | undefined {
    return this.indexCreneaux().get(`${jour}-${ligne.heureDebut}-${ligne.heureFin}`);
  }

  /**
   * Sélectionne un EDT existant : affiche sa grille et son formulaire propriétés.
   * @param edt Emploi du temps sélectionné.
   */
  protected selectionnerEdt(edt: EmploiDuTemps): void {
    this.edtSelectionne.set(edt);
    this.formEdt.set(edt);
    this.creneauEdite.set(null);
    this.redemanderFocusFormulaire();
  }

  /** Lance la création d'un nouvel EDT (formulaire vide, grille vide). */
  protected creerEdt(): void {
    this.edtSelectionne.set(null);
    this.formEdt.set(EcranEmploiDuTempsComponent.creerEdtVide());
    this.creneauEdite.set(null);
    this.redemanderFocusFormulaire();
  }

  /**
   * Ouvre le formulaire créneau pour un créneau existant.
   * @param creneau Créneau à modifier.
   */
  protected selectionnerCreneau(creneau: CreneauEdt): void {
    this.formEdt.set(null);
    this.creneauEdite.set(creneau);
    this.redemanderFocusFormulaire();
  }

  /**
   * Ouvre le formulaire créneau pour un nouveau créneau sur le jour donné.
   * L'heure de début est initialisée à la fin du dernier créneau existant pour ce jour.
   * @param jour Jour de la semaine du nouveau créneau.
   */
  protected ajouterCreneauPourJour(jour: JourSemaine): void {
    this.formEdt.set(null);
    const creneauxDuJour = this.edtSelectionne()?.creneaux.filter((c) => c.jour === jour) ?? [];
    this.creneauEdite.set(EcranEmploiDuTempsComponent.creerCreneauVide(jour, creneauxDuJour));
    this.redemanderFocusFormulaire();
  }

  /**
   * Pulse `focusDemandeFormulaire` (false puis true sur le cycle suivant) pour
   * redéclencher `[mcAutoFocus]` sur `edt-formulaire`, qui n'est jamais recréé
   * entre deux sélections successives.
   */
  private redemanderFocusFormulaire(): void {
    this.focusDemandeFormulaire.set(false);
    setTimeout(() => this.focusDemandeFormulaire.set(true));
  }

  /**
   * Enregistre l'EDT (création ou modification).
   * @param edt EDT émis par le formulaire.
   */
  protected onEdtEnregistre(edt: EmploiDuTemps): void {
    const existant = this.donneesService.donnees()?.emploisDuTemps.find((e) => e.id === edt.id);
    if (existant) {
      this.emploiDuTempsService.modifierEdt(edt);
    } else {
      this.emploiDuTempsService.creerEdt(edt);
    }
    const sauvegarde = this.emploiDuTempsService.obtenirEdt(edt.id) ?? null;
    this.edtSelectionne.set(sauvegarde);
    this.formEdt.set(sauvegarde);
  }

  /** Supprime l'EDT sélectionné et réinitialise l'interface. */
  protected onEdtSupprime(): void {
    const edt = this.edtSelectionne();
    if (edt) this.emploiDuTempsService.supprimerEdt(edt.id);
    this.edtSelectionne.set(null);
    this.formEdt.set(null);
    this.creneauEdite.set(null);
  }

  /**
   * Enregistre un créneau (ajout ou modification) dans l'EDT sélectionné.
   * @param creneau Créneau émis par le formulaire.
   */
  protected onCreneauEnregistre(creneau: CreneauEdt): void {
    const edt = this.edtSelectionne();
    if (!edt) return;
    const existant = edt.creneaux.find((c) => c.id === creneau.id);
    if (existant) {
      this.emploiDuTempsService.modifierCreneau(edt.id, creneau);
    } else {
      this.emploiDuTempsService.ajouterCreneau(edt.id, creneau);
    }
    this.edtSelectionne.set(this.emploiDuTempsService.obtenirEdt(edt.id) ?? null);
    this.creneauEdite.set(null);
    this.formEdt.set(this.edtSelectionne());
  }

  /**
   * Supprime un créneau de l'EDT sélectionné.
   * @param creneauId UUID du créneau à supprimer.
   */
  protected onCreneauSupprime(creneauId: string): void {
    const edt = this.edtSelectionne();
    if (!edt) return;
    this.emploiDuTempsService.supprimerCreneau(edt.id, creneauId);
    this.edtSelectionne.set(this.emploiDuTempsService.obtenirEdt(edt.id) ?? null);
    this.creneauEdite.set(null);
    this.formEdt.set(this.edtSelectionne());
  }

  /** Annule l'édition en cours et réaffiche les propriétés de l'EDT sélectionné. */
  protected onAnnule(): void {
    this.edtSelectionne.set(null);
    this.creneauEdite.set(null);
    this.formEdt.set(null);
  }

  /** Lance l'impression de la grille de l'EDT sélectionné. */
  protected imprimer(): void {
    window.print();
  }

  /**
   * Affiche le détail des EDT en conflit avec l'EDT donné.
   * @param edt EDT dont l'icône de conflit a été activée.
   */
  protected afficherConflitsEdt(edt: EmploiDuTemps): void {
    const conflits = this.emploiDuTempsService
      .obtenirEdtsEnConflit(edt)
      .map((autre) => LIBELLES.edt.prefixeChevaucheEdt + autre.nom);
    this.conflitsEdt.set(conflits);
    this.popinConflitsEdtVisible.set(true);
  }

  /** Ferme la popin de détail des conflits entre EDT. */
  protected fermerConflitsEdt(): void {
    this.popinConflitsEdtVisible.set(false);
    this.conflitsEdt.set([]);
  }

  /**
   * Affiche le détail des absences élèves en conflit avec le créneau donné.
   * @param creneau Créneau dont l'icône de conflit a été activée.
   * @param event Événement de clic, dont la propagation est stoppée pour éviter
   * de déclencher la sélection du créneau (bouton frère dans la même cellule).
   */
  protected afficherConflitsAbsences(creneau: CreneauEdt, event: Event): void {
    event.stopPropagation();
    this.conflitsAbsences.set(this.emploiDuTempsService.calculerConflitsAbsences(creneau.id));
    this.popinConflitsAbsencesVisible.set(true);
  }

  /** Ferme la popin de détail des conflits créneau/absence élève. */
  protected fermerConflitsAbsences(): void {
    this.popinConflitsAbsencesVisible.set(false);
    this.conflitsAbsences.set([]);
  }

  /**
   * Navigation clavier dans la liste des EDT (roving tabindex) :
   * ↓/↑ déplacent le focus, Début/Fin sautent au premier/dernier EDT.
   * @param event Événement clavier natif.
   */
  protected naviguerListeEdt(event: KeyboardEvent): void {
    const options = this.optionsEdt();
    if (options.length === 0) return;
    const index = this.indexEdtFocalise();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focaliserEdt(Math.min(index + 1, options.length - 1));
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.focaliserEdt(Math.max(index - 1, 0));
        break;

      case 'Home':
        event.preventDefault();
        this.focaliserEdt(0);
        break;

      case 'End':
        event.preventDefault();
        this.focaliserEdt(options.length - 1);
        break;
    }
  }

  /**
   * Déplace le focus clavier vers l'EDT à l'index donné.
   * @param index Index de l'option à focaliser.
   */
  private focaliserEdt(index: number): void {
    this.indexEdtFocalise.set(index);
    this.optionsEdt()[index]?.nativeElement.focus();
  }

  /**
   * Implémentation de `AvecNavigationGardee`.
   * Retourne `true` immédiatement si aucun formulaire EDT/créneau n'est ouvert ou modifié,
   * sinon ouvre la popin d'avertissement et attend la décision de l'utilisateur.
   * @returns Promesse résolue à `true` pour autoriser la navigation.
   */
  public confirmerNavigation(): Promise<boolean> {
    if (!this.formulaireEdt()?.estModifie()) return Promise.resolve(true);
    return new Promise<boolean>((resolve) => {
      this.resolveGarde = resolve;
      this.popinNavigationVisible.set(true);
    });
  }

  /** Confirme l'abandon des modifications et autorise la navigation. */
  protected confirmerAbandonNavigation(): void {
    this.popinNavigationVisible.set(false);
    this.resolveGarde?.(true);
    this.resolveGarde = null;
  }

  /** Annule la navigation et reste sur le formulaire en cours. */
  protected annulerAbandonNavigation(): void {
    this.popinNavigationVisible.set(false);
    this.resolveGarde?.(false);
    this.resolveGarde = null;
  }
}
