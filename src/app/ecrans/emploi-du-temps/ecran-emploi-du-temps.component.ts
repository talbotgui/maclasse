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
import { EmploiDuTempsCalculeService } from '../../services/sansEtat/emploi-du-temps-calcule.service';
import { EdtFormulaireComponent } from './edt-formulaire/edt-formulaire.component';
import { EdtcFormulaireComponent } from './edtc-formulaire/edtc-formulaire.component';
import { McPastillesElevesConcernesComponent } from '../../composants/mc-pastilles-eleves-concernes/mc-pastilles-eleves-concernes.component';
import { PopinAvertissementComponent } from '../../composants/popins/popin-avertissement/popin-avertissement.component';
import { PopinWarningsAbsencesComponent } from '../../composants/popins/popin-warnings-absences/popin-warnings-absences.component';
import { DateUtils } from '../../utilitaires/date.utils';
import type { AvecNavigationGardee } from '../../gardes/modifications-non-enregistrees.garde';
import type {
  EmploiDuTemps,
  CreneauEdt,
  TempsCreneau,
  JourSemaine,
  FrequenceSemaine,
} from '../../modeles/emploi-du-temps.modele';
import type { Competence } from '../../modeles/referentiels.modele';
import type {
  CreneauCalcule,
  EmploiDuTempsCalcule,
} from '../../modeles/emploi-du-temps-calcule.modele';

/**
 * Écran emploi du temps.
 * Colonne gauche : liste des EDT avec indicateur de conflit.
 * Colonne centrale : grille hebdomadaire de l'EDT sélectionné.
 * Colonne droite : formulaire contextuel EDT, créneau ou EDT calculé.
 * Un EDT calculé s'affiche dans la même grille, en lecture seule.
 */
@Component({
  selector: 'ecran-emploi-du-temps',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    EdtFormulaireComponent,
    EdtcFormulaireComponent,
    McPastillesElevesConcernesComponent,
    PopinAvertissementComponent,
    PopinWarningsAbsencesComponent,
  ],
  templateUrl: './ecran-emploi-du-temps.component.html',
  styleUrl: './ecran-emploi-du-temps.component.scss',
  host: {
    '(window:beforeprint)': 'preparerImpression()',
    '(window:afterprint)': 'terminerImpression()',
  },
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

  /** Libellé affiché pour chaque fréquence dans le titre d'impression. */
  private static readonly LIBELLES_FREQUENCE: Record<FrequenceSemaine, string> = {
    paire: LIBELLES.edt.frequencePaire,
    impaire: LIBELLES.edt.frequenceImpaire,
    lesDeux: LIBELLES.edt.frequenceLesDeux,
  };

  /** Largeur imprimable d'une page A4 paysage aux marges de 10 mm (277 mm), en pixels CSS. */
  private static readonly LARGEUR_IMPRIMABLE_PX = 1047;

  /** Hauteur imprimable d'une page A4 paysage aux marges de 10 mm (190 mm), en pixels CSS. */
  private static readonly HAUTEUR_IMPRIMABLE_PX = 718;

  /** Variable CSS portant le facteur de réduction de la grille à l'impression. */
  private static readonly VARIABLE_ECHELLE_IMPRESSION = '--edt-echelle-impression';

  /**
   * Calcule le facteur de réduction qui fait tenir un contenu dans la hauteur imprimable.
   * @param hauteurContenu Hauteur mesurée du contenu, en pixels CSS.
   * @returns Facteur entre 0 et 1 ; 1 si le contenu tient déjà ou n'a pas pu être mesuré.
   */
  private static calculerEchelleImpression(hauteurContenu: number): number {
    if (hauteurContenu <= EcranEmploiDuTempsComponent.HAUTEUR_IMPRIMABLE_PX) return 1;
    return EcranEmploiDuTempsComponent.HAUTEUR_IMPRIMABLE_PX / hauteurContenu;
  }

  /**
   * Formate le titre d'impression d'un EDT : `nom (début-fin / fréquence)`.
   * La partie dates devient `à partir du …` ou `jusqu'au …` si une seule date est connue,
   * et disparaît si aucune ne l'est.
   * @param edt EDT ou EDT calculé à imprimer.
   * @returns Titre formaté.
   */
  private static formaterTitreImpression(
    edt: Pick<EmploiDuTemps, 'nom' | 'dateDebut' | 'dateFin' | 'frequence'>,
  ): string {
    const frequence = EcranEmploiDuTempsComponent.LIBELLES_FREQUENCE[edt.frequence];
    const debut = edt.dateDebut ? DateUtils.formaterDateCourt(edt.dateDebut) : null;
    const fin = edt.dateFin ? DateUtils.formaterDateCourt(edt.dateFin) : null;
    let dates: string | null = null;
    if (debut && fin) dates = `${debut}-${fin}`;
    else if (debut) dates = LIBELLES.edt.prefixeImpressionDepuis + debut;
    else if (fin) dates = LIBELLES.edt.prefixeImpressionJusquau + fin;
    return dates ? `${edt.nom} (${dates} / ${frequence})` : `${edt.nom} (${frequence})`;
  }

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
   * Crée une définition d'EDT calculé vide prête pour la saisie.
   * @returns Définition initialisée avec des valeurs par défaut (toute la classe, toutes semaines).
   */
  private static creerEdtCalculeVide(): EmploiDuTempsCalcule {
    return {
      id: crypto.randomUUID(),
      nom: '',
      dateDebut: null,
      dateFin: null,
      frequence: 'lesDeux',
      sources: [],
      elevesConcernes: { type: 'classe', groupes: [], elevesIds: [] },
    };
  }

  /**
   * Crée un créneau vide pour le jour donné, avec un premier temps par défaut.
   * Si des temps existent déjà pour ce jour, l'`heureDebut` du nouveau temps est
   * initialisée à la `heureFin` la plus tardive parmi eux, et `heureFin` à `heureDebut + 1h`.
   * @param jour Jour de la semaine du nouveau créneau.
   * @param tempsDuJour Temps déjà utilisés ce jour-là dans l'EDT courant, tous créneaux confondus.
   * @returns Créneau initialisé avec un unique temps.
   */
  private static creerCreneauVide(jour: JourSemaine, tempsDuJour: TempsCreneau[] = []): CreneauEdt {
    const derniereHeureFin = tempsDuJour
      .map((t) => t.heureFin)
      .sort((a, b) => a.localeCompare(b))
      .at(-1);
    const heureDebut = derniereHeureFin ?? '08:00';
    return {
      id: crypto.randomUUID(),
      jour,
      type: 'pedagogique',
      temps: [
        {
          id: crypto.randomUUID(),
          heureDebut,
          heureFin: DateUtils.ajouterHeures(heureDebut, 1),
          disciplinesIds: [],
          elevesConcernes: { type: 'classe', groupes: [], elevesIds: [] },
        },
      ],
    };
  }

  /** Constante centralisée des libellés. */
  protected readonly LIBELLES = LIBELLES;

  /** Accès aux données de l'application. */
  private readonly donneesService = inject(DonneesService);

  /** Service métier emploi du temps. */
  private readonly emploiDuTempsService = inject(EmploiDuTempsService);

  /** Service métier des emplois du temps calculés. */
  private readonly emploiDuTempsCalculeService = inject(EmploiDuTempsCalculeService);

  /** Service des compétences pour charger les domaines racine. */
  private readonly competenceService = inject(CompetenceService);

  /** EDT affiché dans la grille (peut différer de l'EDT en cours d'édition). */
  protected readonly edtSelectionne = signal<EmploiDuTemps | null>(null);

  /** EDT passé au formulaire propriétés (null quand le formulaire créneau est actif). */
  protected readonly formEdt = signal<EmploiDuTemps | null>(null);

  /** EDT calculé affiché en lecture seule dans la grille (exclusif avec `edtSelectionne`). */
  protected readonly edtCalculeSelectionne = signal<EmploiDuTempsCalcule | null>(null);

  /** EDT calculé passé au formulaire de définition (null quand un autre formulaire est actif). */
  protected readonly formEdtCalcule = signal<EmploiDuTempsCalcule | null>(null);

  /** Créneau passé au formulaire créneau (null quand le formulaire EDT est actif). */
  protected readonly creneauEdite = signal<CreneauEdt | null>(null);

  /** `true` si le créneau édité existe déjà dans l'EDT sélectionné, `false` pour une création. */
  protected readonly creneauEditeExistant = computed(() => {
    const creneau = this.creneauEdite();
    return (
      creneau !== null &&
      (this.edtSelectionne()?.creneaux.some((c) => c.id === creneau.id) ?? false)
    );
  });

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

  /** Indique si la liste du bandeau des absences régulières est dépliée (dépliée à l'arrivée, non mémorisé). */
  protected readonly absencesDepliees = signal(true);

  /**
   * Demande de focus transmise à `edt-formulaire`, pulsée à chaque changement de sélection.
   * `edt-formulaire` n'étant jamais recréé lors d'un passage d'un créneau/EDT à un autre
   * (même bloc `@if`), un simple `true` statique ne suffit pas à redéclencher le focus :
   * il faut une réelle transition `false` → `true` observée sur deux cycles de détection.
   */
  protected readonly focusDemandeFormulaire = signal(true);

  /** Boutons de sélection d'EDT actuellement rendus, dans l'ordre d'affichage. */
  private readonly optionsEdt = viewChildren<ElementRef<HTMLButtonElement>>('optionEdt');

  /** Conteneur de la grille, porteur du facteur de réduction appliqué à l'impression. */
  private readonly grilleConteneur = viewChild<ElementRef<HTMLElement>>('grilleConteneur');

  /** En-tête de la grille (nom de l'EDT), mesuré pour ajuster l'impression à une page. */
  private readonly grilleEntete = viewChild<ElementRef<HTMLElement>>('grilleEntete');

  /** Tableau de la grille, mesuré pour ajuster l'impression à une page. */
  private readonly grilleTableau = viewChild<ElementRef<HTMLElement>>('grilleTableau');

  /** Titre du document mémorisé au début de l'impression, restauré à la fin ; `null` hors impression. */
  private titreAvantImpression: string | null = null;

  /** Résolution de la promesse de navigation (garde CanDeactivate). */
  private resolveGarde: ((result: boolean) => void) | null = null;

  /** Référence au formulaire EDT/créneau actuellement affiché, s'il y en a un. */
  private readonly formulaireEdt = viewChild(EdtFormulaireComponent);

  /** Référence au formulaire d'EDT calculé actuellement affiché, s'il y en a un. */
  private readonly formulaireEdtCalcule = viewChild(EdtcFormulaireComponent);

  /** Liste complète des EDT calculés depuis le store. */
  protected readonly edtsCalcules = computed<EmploiDuTempsCalcule[]>(
    () => this.donneesService.donnees()?.emploisDuTempsCalcules ?? [],
  );

  /** `true` si le formulaire d'EDT calculé affiche une définition déjà enregistrée. */
  protected readonly formEdtCalculeExistant = computed<boolean>(() => {
    const id = this.formEdtCalcule()?.id;
    return id !== undefined && this.edtsCalcules().some((e) => e.id === id);
  });

  /** Créneaux de l'EDT calculé sélectionné, recalculés à chaque changement des données. */
  protected readonly creneauxCalcules = computed<CreneauCalcule[]>(() => {
    const edtCalcule = this.edtCalculeSelectionne();
    return edtCalcule ? this.emploiDuTempsCalculeService.calculerCreneaux(edtCalcule) : [];
  });

  /** Nom affiché dans l'en-tête de la grille (EDT ou EDT calculé sélectionné). */
  protected readonly nomGrille = computed<string>(
    () => this.edtSelectionne()?.nom ?? this.edtCalculeSelectionne()?.nom ?? '',
  );

  /** Titre du document pendant l'impression (métadonnées de l'EDT affiché), vide sans EDT affiché. */
  protected readonly titreImpression = computed<string>(() => {
    const edt = this.edtSelectionne() ?? this.edtCalculeSelectionne();
    return edt ? EcranEmploiDuTempsComponent.formaterTitreImpression(edt) : '';
  });

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
   * Lignes de la grille : plages horaires uniques triées par heureDebut,
   * déduites de l'ensemble des temps de tous les créneaux de l'EDT sélectionné,
   * ou des créneaux de l'EDT calculé sélectionné.
   */
  protected readonly lignesGrille = computed<{ heureDebut: string; heureFin: string }[]>(() => {
    const edt = this.edtSelectionne();
    const vus = new Map<string, { heureDebut: string; heureFin: string }>();
    const horaires: { heureDebut: string; heureFin: string }[] = [
      ...(edt?.creneaux.flatMap((c) => c.temps) ?? []),
      ...this.creneauxCalcules(),
    ];
    for (const t of horaires) {
      const cle = `${t.heureDebut}-${t.heureFin}`;
      if (!vus.has(cle)) vus.set(cle, { heureDebut: t.heureDebut, heureFin: t.heureFin });
    }
    return [...vus.values()].sort((a, b) => a.heureDebut.localeCompare(b.heureDebut));
  });

  /**
   * Index des temps pour un accès O(1) dans la grille.
   * Clé : `"jour-heureDebut-heureFin"`. Une même case peut contenir plusieurs temps,
   * qu'ils appartiennent au même créneau ou à des créneaux différents partageant l'horaire.
   */
  protected readonly indexCreneaux = computed<
    Map<string, { creneau: CreneauEdt; temps: TempsCreneau }[]>
  >(() => {
    const edt = this.edtSelectionne();
    const map = new Map<string, { creneau: CreneauEdt; temps: TempsCreneau }[]>();
    if (!edt) return map;
    for (const c of edt.creneaux) {
      for (const t of c.temps) {
        const cle = `${c.jour}-${t.heureDebut}-${t.heureFin}`;
        const entrees = map.get(cle) ?? [];
        entrees.push({ creneau: c, temps: t });
        map.set(cle, entrees);
      }
    }
    return map;
  });

  /** Index des créneaux calculés. Clé : `"jour-heureDebut-heureFin"`. */
  protected readonly indexCreneauxCalcules = computed<Map<string, CreneauCalcule[]>>(() => {
    const map = new Map<string, CreneauCalcule[]>();
    for (const c of this.creneauxCalcules()) {
      const cle = `${c.jour}-${c.heureDebut}-${c.heureFin}`;
      map.set(cle, [...(map.get(cle) ?? []), c]);
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
   * Retourne les temps (avec leur créneau parent) à l'intersection d'un jour et d'une plage horaire.
   * @param jour Jour de la semaine.
   * @param ligne Plage {heureDebut, heureFin}.
   * @returns Liste des temps de cette case, vide si aucun.
   */
  protected obtenirTempsDeGrille(
    jour: JourSemaine,
    ligne: { heureDebut: string; heureFin: string },
  ): { creneau: CreneauEdt; temps: TempsCreneau }[] {
    return this.indexCreneaux().get(`${jour}-${ligne.heureDebut}-${ligne.heureFin}`) ?? [];
  }

  /**
   * Retourne les créneaux calculés à l'intersection d'un jour et d'une plage horaire.
   * @param jour Jour de la semaine.
   * @param ligne Plage {heureDebut, heureFin}.
   * @returns Liste des créneaux calculés de cette case, vide si aucun.
   */
  protected obtenirCreneauxCalculesDeGrille(
    jour: JourSemaine,
    ligne: { heureDebut: string; heureFin: string },
  ): CreneauCalcule[] {
    return this.indexCreneauxCalcules().get(`${jour}-${ligne.heureDebut}-${ligne.heureFin}`) ?? [];
  }

  /** Efface la sélection et le formulaire d'EDT calculé. */
  private effacerEdtCalcule(): void {
    this.edtCalculeSelectionne.set(null);
    this.formEdtCalcule.set(null);
  }

  /**
   * Sélectionne un EDT existant : affiche sa grille et son formulaire propriétés.
   * @param edt Emploi du temps sélectionné.
   */
  protected selectionnerEdt(edt: EmploiDuTemps): void {
    this.effacerEdtCalcule();
    this.edtSelectionne.set(edt);
    this.formEdt.set(edt);
    this.creneauEdite.set(null);
    this.redemanderFocusFormulaire();
  }

  /**
   * Sélectionne un EDT calculé : affiche sa grille en lecture seule et son formulaire de définition.
   * @param edtCalcule EDT calculé sélectionné.
   */
  protected selectionnerEdtCalcule(edtCalcule: EmploiDuTempsCalcule): void {
    this.edtSelectionne.set(null);
    this.formEdt.set(null);
    this.creneauEdite.set(null);
    this.edtCalculeSelectionne.set(edtCalcule);
    this.formEdtCalcule.set(edtCalcule);
    this.redemanderFocusFormulaire();
  }

  /** Lance la création d'un nouvel EDT calculé (formulaire vide, grille vide). */
  protected creerEdtCalcule(): void {
    this.edtSelectionne.set(null);
    this.formEdt.set(null);
    this.creneauEdite.set(null);
    this.edtCalculeSelectionne.set(null);
    this.formEdtCalcule.set(EcranEmploiDuTempsComponent.creerEdtCalculeVide());
    this.redemanderFocusFormulaire();
  }

  /** Lance la création d'un nouvel EDT (formulaire vide, grille vide). */
  protected creerEdt(): void {
    this.effacerEdtCalcule();
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
   * Ouvre le formulaire créneau pour un nouveau créneau (avec un premier temps) sur le jour donné.
   * L'heure de début du premier temps est initialisée à la fin du dernier temps existant ce jour-là.
   * @param jour Jour de la semaine du nouveau créneau.
   */
  protected ajouterCreneauPourJour(jour: JourSemaine): void {
    this.formEdt.set(null);
    const tempsDuJour =
      this.edtSelectionne()
        ?.creneaux.filter((c) => c.jour === jour)
        .flatMap((c) => c.temps) ?? [];
    this.creneauEdite.set(EcranEmploiDuTempsComponent.creerCreneauVide(jour, tempsDuJour));
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

  /**
   * Enregistre un EDT calculé (création ou modification) et l'affiche dans la grille.
   * @param edtCalcule Définition émise par le formulaire.
   */
  protected onEdtCalculeEnregistre(edtCalcule: EmploiDuTempsCalcule): void {
    if (this.emploiDuTempsCalculeService.obtenirEdtCalcule(edtCalcule.id)) {
      this.emploiDuTempsCalculeService.modifierEdtCalcule(edtCalcule);
    } else {
      this.emploiDuTempsCalculeService.creerEdtCalcule(edtCalcule);
    }
    const sauvegarde = this.emploiDuTempsCalculeService.obtenirEdtCalcule(edtCalcule.id) ?? null;
    this.edtCalculeSelectionne.set(sauvegarde);
    this.formEdtCalcule.set(sauvegarde);
  }

  /** Supprime l'EDT calculé affiché et réinitialise l'interface. */
  protected onEdtCalculeSupprime(): void {
    const id = this.formEdtCalcule()?.id;
    if (id) this.emploiDuTempsCalculeService.supprimerEdtCalcule(id);
    this.effacerEdtCalcule();
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
    const existant = edt.creneaux.some((c) => c.id === creneau.id);
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

  /** Ferme le formulaire en cours (EDT, créneau ou EDT calculé) sans désélectionner l'EDT affiché. */
  protected onAnnule(): void {
    this.effacerEdtCalcule();
    this.creneauEdite.set(null);
    this.formEdt.set(null);
  }

  /** Lance l'impression de la grille de l'EDT sélectionné. */
  protected imprimer(): void {
    window.print();
  }

  /**
   * Prépare l'impression (bouton IMPRIMER ou Ctrl+P) : remplace le titre du document par
   * les métadonnées de l'EDT affiché et réduit la grille pour qu'elle tienne sur une page.
   * La grille est mesurée avec les styles écran à la largeur imprimable : les éléments
   * masqués à l'impression sont encore comptés, l'estimation est donc prudente.
   */
  protected preparerImpression(): void {
    const titre = this.titreImpression();
    if (titre) {
      this.titreAvantImpression = document.title;
      document.title = titre;
    }
    const conteneur = this.grilleConteneur()?.nativeElement;
    if (!conteneur) return;
    conteneur.style.width = `${EcranEmploiDuTempsComponent.LARGEUR_IMPRIMABLE_PX}px`;
    const hauteur =
      (this.grilleEntete()?.nativeElement.offsetHeight ?? 0) +
      (this.grilleTableau()?.nativeElement.offsetHeight ?? 0);
    conteneur.style.width = '';
    conteneur.style.setProperty(
      EcranEmploiDuTempsComponent.VARIABLE_ECHELLE_IMPRESSION,
      String(EcranEmploiDuTempsComponent.calculerEchelleImpression(hauteur)),
    );
  }

  /** Termine l'impression : restaure le titre du document et l'échelle de la grille. */
  protected terminerImpression(): void {
    if (this.titreAvantImpression !== null) {
      document.title = this.titreAvantImpression;
      this.titreAvantImpression = null;
    }
    this.grilleConteneur()?.nativeElement.style.removeProperty(
      EcranEmploiDuTempsComponent.VARIABLE_ECHELLE_IMPRESSION,
    );
  }

  /**
   * Affiche le détail des conflits de l'EDT donné : chevauchement interne et EDT en conflit.
   * @param edt EDT dont l'icône de conflit a été activée.
   */
  protected afficherConflitsEdt(edt: EmploiDuTemps): void {
    const conflits = this.emploiDuTempsService
      .obtenirEdtsEnConflit(edt)
      .map((autre) => LIBELLES.edt.prefixeChevaucheEdt + autre.nom);
    if (this.emploiDuTempsService.verifierChevauchementInterne(edt)) {
      conflits.unshift(LIBELLES.edt.chevauchementInterne);
    }
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

  /** Replie ou déplie la liste du bandeau des absences régulières. */
  protected basculerAbsences(): void {
    this.absencesDepliees.update((depliees) => !depliees);
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
   * Retourne `true` immédiatement si aucun formulaire EDT/créneau/EDT calculé n'est ouvert ou modifié,
   * sinon ouvre la popin d'avertissement et attend la décision de l'utilisateur.
   * @returns Promesse résolue à `true` pour autoriser la navigation.
   */
  public confirmerNavigation(): Promise<boolean> {
    const modifie = this.formulaireEdt()?.estModifie() || this.formulaireEdtCalcule()?.estModifie();
    if (!modifie) return Promise.resolve(true);
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
