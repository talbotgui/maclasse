/**
 * Écran de paramétrage : gestion des données de configuration et des référentiels.
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import type { WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LIBELLES } from '../../libelles';
import { DonneesService } from '../../services/avecEtat/donnees.service';
import { ReferentielService } from '../../services/sansEtat/referentiel.service';
import { SauvegardeAutoService } from '../../services/sansEtat/sauvegarde-auto.service';
import { CommandeRemplacement } from '../../commandes/commande-remplacement';
import { McAutoFocusDirective } from '../../directives/mc-auto-focus.directive';
import { McInputComponent } from '../../composants/mc-input/mc-input.component';
import { McChampHeureComponent } from '../../composants/mc-champ-heure/mc-champ-heure.component';
import { McChipFiltreComponent } from '../../composants/mc-chip-filtre/mc-chip-filtre.component';
import { McBoutonDestructionComponent } from '../../composants/mc-bouton-destruction/mc-bouton-destruction.component';
import { McBadgeStatutComponent } from '../../composants/mc-badge-statut/mc-badge-statut.component';
import { PopinAvertissementComponent } from '../../composants/popins/popin-avertissement/popin-avertissement.component';
import type { AvecNavigationGardee } from '../../gardes/modifications-non-enregistrees.garde';
import { ObjetUtils } from '../../utilitaires/objet.utils';
import { TexteUtils } from '../../utilitaires/texte.utils';
import type { DonneesApplication, Enseignant } from '../../modeles/donnees-application.modele';
import type {
  Competence,
  ConfigEmploiDuTemps,
  Groupe,
  JourFerie,
  Periode,
  StatutAcquisition,
  StatutEleve,
  TypeContact,
} from '../../modeles/referentiels.modele';
import type { JourSemaine } from '../../modeles/emploi-du-temps.modele';

/** Identifiants des sections de l'écran paramétrage. */
type SectionId =
  | 'enseignantClasse'
  | 'periodes'
  | 'semaineHoraires'
  | 'groupes'
  | 'bareme'
  | 'statutsEleve'
  | 'typesContact'
  | 'joursFeries'
  | 'preferences'
  | 'domainesCompetences';

/** Erreur de saisie de l'identifiant d'une ligne non enregistrée. */
type ErreurIdentifiant = 'obligatoire' | 'dejaUtilise';

/** Entrée de navigation de la colonne gauche. */
interface EntreeSection {
  /** Identifiant technique de la section. */
  id: SectionId;
  /** Libellé affiché dans la liste. */
  libelle: string;
}

/** Contrôles d'un formulaire dont chaque champ de `T` est un `FormControl` non nul. */
type ControlesDe<T> = { [K in keyof T]: FormControl<T[K]> };

/**
 * Ligne d'une section liste : valeur éditée de l'entrée et identifiant de l'entrée chargée.
 * Le suivi des lignes se fait par l'instance du `FormGroup`, stable d'un rechargement à l'autre.
 */
interface LigneFormulaire<T> {
  /** Identifiant de l'entrée enregistrée représentée par la ligne (`null` si jamais enregistrée). */
  idOrigine: FormControl<string | null>;
  /** Valeur éditée de l'entrée. */
  valeur: FormGroup<ControlesDe<T>>;
  /**
   * Valeur enregistrée lors du dernier chargement de la ligne (`null` si jamais enregistrée) :
   * référence qui décide si la ligne est modifiée au rechargement suivant.
   */
  reference: FormControl<T | null>;
}

/** Structure typée du formulaire Enseignant & Classe. */
interface FormulaireEnseignantClasse {
  /** Prénom de l'enseignant. */
  prenom: FormControl<string>;
  /** Nom de l'enseignant. */
  nom: FormControl<string>;
  /** Année scolaire. */
  annee: FormControl<string>;
  /** Niveau de la classe. */
  niveauClasse: FormControl<string>;
}

/** Structure typée du formulaire Semaine & Horaires. */
interface FormulaireSemaineHoraires {
  /** Jours ouvrés, pilotés par les chips, dans l'ordre de la semaine. */
  joursOuvres: FormControl<JourSemaine[]>;
  /** Heure de début de journée `HH:MM`. */
  heureDebutJournee: FormControl<string>;
  /** Heure de fin de journée `HH:MM`. */
  heureFinJournee: FormControl<string>;
}

/** Structure typée du formulaire Préférences. */
interface FormulairePreferences {
  /** Délai de sauvegarde automatique en minutes ; chaîne vide si le champ est vidé. */
  delaiSauvegardeAutoMinutes: FormControl<number | string>;
}

/** Valeurs brutes d'un formulaire réactif dont les contrôles sont décrits par `C`. */
type ValeursDe<C extends { [K in keyof C]: AbstractControl }> = ReturnType<
  FormGroup<C>['getRawValue']
>;

/**
 * Écran de paramétrage de l'application.
 * Deux colonnes : navigation par section à gauche, formulaire à droite.
 * Implémente `AvecNavigationGardee` : quitter l'écran ou changer de section avec des
 * modifications non enregistrées dans la section active demande confirmation.
 */
@Component({
  selector: 'ecran-parametrage',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    McAutoFocusDirective,
    McInputComponent,
    McChampHeureComponent,
    McChipFiltreComponent,
    McBoutonDestructionComponent,
    McBadgeStatutComponent,
    PopinAvertissementComponent,
  ],
  templateUrl: './ecran-parametrage.component.html',
  styleUrl: './ecran-parametrage.component.scss',
})
export class EcranParametrageComponent implements AvecNavigationGardee {
  /** Constante centralisée des libellés. */
  protected readonly LIBELLES = LIBELLES;

  /** Service de données : lecture et mutations via commandes. */
  private readonly donneesService = inject(DonneesService);

  /** Service référentiel : CRUD des listes configurables. */
  private readonly referentielService = inject(ReferentielService);

  /** Service de sauvegarde automatique : relance du timer si le délai change en session. */
  private readonly sauvegardeAutoService = inject(SauvegardeAutoService);

  /** Détection de changement pour mise à jour manuelle en mode OnPush. */
  private readonly cdr = inject(ChangeDetectorRef);

  /** Jours de la semaine scolaire dans l'ordre d'affichage. */
  protected readonly JOURS_SEMAINE: JourSemaine[] = [
    'lundi',
    'mardi',
    'mercredi',
    'jeudi',
    'vendredi',
  ];

  /** Libellés des jours pour l'affichage des chips. */
  protected readonly LIBELLES_JOURS: Record<JourSemaine, string> = {
    lundi: 'L',
    mardi: 'Ma',
    mercredi: 'Me',
    jeudi: 'J',
    vendredi: 'V',
  };

  /** Liste ordonnée des sections disponibles. */
  protected readonly listeSections: EntreeSection[] = [
    { id: 'enseignantClasse', libelle: LIBELLES.parametrage.sections.enseignantClasse },
    { id: 'periodes', libelle: LIBELLES.parametrage.sections.periodes },
    { id: 'semaineHoraires', libelle: LIBELLES.parametrage.sections.semaineHoraires },
    { id: 'groupes', libelle: LIBELLES.parametrage.sections.groupes },
    { id: 'bareme', libelle: LIBELLES.parametrage.sections.bareme },
    { id: 'statutsEleve', libelle: LIBELLES.parametrage.sections.statutsEleve },
    { id: 'typesContact', libelle: LIBELLES.parametrage.sections.typesContact },
    { id: 'joursFeries', libelle: LIBELLES.parametrage.sections.joursFeries },
    { id: 'preferences', libelle: LIBELLES.parametrage.sections.preferences },
    { id: 'domainesCompetences', libelle: LIBELLES.parametrage.sections.domainesCompetences },
  ];

  /** Section actuellement affichée. */
  protected readonly sectionActive = signal<SectionId>('enseignantClasse');

  /** `true` si la popin d'avertissement de modifications non enregistrées est visible. */
  protected readonly popinAvertissementVisible = signal(false);

  /** Résolution de la promesse de navigation hors de l'écran (garde CanDeactivate). */
  private resolveGarde: ((result: boolean) => void) | null = null;

  /** Section demandée, en attente de la confirmation de l'abandon des saisies (`null` si aucune). */
  private sectionEnAttente: SectionId | null = null;

  /** Borne minimale acceptée pour le délai de sauvegarde automatique, en minutes. */
  private static readonly DELAI_SAUVEGARDE_MIN = 1;

  /** Borne maximale acceptée pour le délai de sauvegarde automatique, en minutes. */
  private static readonly DELAI_SAUVEGARDE_MAX = 60;

  /** Borne minimale exposée au template pour l'attribut natif `min` du champ délai. */
  protected readonly delaiSauvegardeMin = EcranParametrageComponent.DELAI_SAUVEGARDE_MIN;

  /** Borne maximale exposée au template pour l'attribut natif `max` du champ délai. */
  protected readonly delaiSauvegardeMax = EcranParametrageComponent.DELAI_SAUVEGARDE_MAX;

  /** Formulaire réactif Enseignant & Classe. */
  protected readonly formEnseignantClasse: FormGroup<FormulaireEnseignantClasse> =
    new FormGroup<FormulaireEnseignantClasse>({
      prenom: new FormControl('', { nonNullable: true }),
      nom: new FormControl('', { nonNullable: true }),
      annee: new FormControl('', { nonNullable: true }),
      niveauClasse: new FormControl('', { nonNullable: true }),
    });

  /** Formulaire réactif Semaine & Horaires. */
  protected readonly formSemaineHoraires: FormGroup<FormulaireSemaineHoraires> =
    new FormGroup<FormulaireSemaineHoraires>({
      joursOuvres: new FormControl<JourSemaine[]>([], { nonNullable: true }),
      heureDebutJournee: new FormControl('', { nonNullable: true }),
      heureFinJournee: new FormControl('', { nonNullable: true }),
    });

  /** Formulaire réactif Préférences (délai borné). */
  protected readonly formPreferences: FormGroup<FormulairePreferences> =
    new FormGroup<FormulairePreferences>({
      delaiSauvegardeAutoMinutes: new FormControl<number | string>(5, {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.min(EcranParametrageComponent.DELAI_SAUVEGARDE_MIN),
          Validators.max(EcranParametrageComponent.DELAI_SAUVEGARDE_MAX),
        ],
      }),
    });

  /**
   * Statut du formulaire Préférences, suivi via `statusChanges` et resynchronisé après chaque
   * chargement (un `reset` sans émission ne déclenche pas `statusChanges`).
   */
  private readonly statutPreferences: WritableSignal<string> = signal(this.formPreferences.status);

  /** Lignes éditables des périodes scolaires. */
  protected readonly lignesPeriodes = new FormArray<FormGroup<LigneFormulaire<Periode>>>([]);
  /** Lignes éditables des groupes. */
  protected readonly lignesGroupes = new FormArray<FormGroup<LigneFormulaire<Groupe>>>([]);
  /** Lignes éditables du barème. */
  protected readonly lignesBareme = new FormArray<FormGroup<LigneFormulaire<StatutAcquisition>>>(
    [],
  );
  /** Lignes éditables des statuts élève. */
  protected readonly lignesStatutsEleve = new FormArray<FormGroup<LigneFormulaire<StatutEleve>>>(
    [],
  );
  /** Lignes éditables des types de contact. */
  protected readonly lignesTypesContact = new FormArray<FormGroup<LigneFormulaire<TypeContact>>>(
    [],
  );
  /** Lignes éditables des jours fériés. */
  protected readonly lignesJoursFeries = new FormArray<FormGroup<LigneFormulaire<JourFerie>>>([]);

  /** Index de la ligne venant d'être ajoutée à focaliser, par section (`null` si aucune). */
  protected readonly indexAFocaliserPeriode = signal<number | null>(null);
  /** Index du groupe venant d'être ajouté à focaliser (`null` si aucun). */
  protected readonly indexAFocaliserGroupe = signal<number | null>(null);
  /** Index du statut d'acquisition venant d'être ajouté à focaliser (`null` si aucun). */
  protected readonly indexAFocaliserBareme = signal<number | null>(null);
  /** Index du statut élève venant d'être ajouté à focaliser (`null` si aucun). */
  protected readonly indexAFocaliserStatutEleve = signal<number | null>(null);
  /** Index du type de contact venant d'être ajouté à focaliser (`null` si aucun). */
  protected readonly indexAFocaliserTypeContact = signal<number | null>(null);
  /** Index du jour férié venant d'être ajouté à focaliser (`null` si aucun). */
  protected readonly indexAFocaliserJourFerie = signal<number | null>(null);

  /**
   * Ensemble des IDs de domaines (N1) et sous-domaines (N2) actifs dans le formulaire.
   * Vide = tous actifs (comportement par défaut).
   */
  protected readonly copieDomainesActifs = signal<Set<string>>(new Set());

  /**
   * Section chargée lors du dernier passage de l'`effect` de rechargement (`null` avant le
   * premier) : distingue un changement de section (rechargement complet) d'un changement
   * des données (saisies modifiées conservées).
   */
  private sectionChargee: SectionId | null = null;

  /** Valeurs enregistrées chargées en dernier dans le formulaire Enseignant & Classe. */
  private referenceEnseignantClasse: ValeursDe<FormulaireEnseignantClasse> | null = null;

  /** Valeurs enregistrées chargées en dernier dans le formulaire Semaine & Horaires. */
  private referenceSemaineHoraires: ValeursDe<FormulaireSemaineHoraires> | null = null;

  /** Valeurs enregistrées chargées en dernier dans le formulaire Préférences. */
  private referencePreferences: ValeursDe<FormulairePreferences> | null = null;

  /** Sélection enregistrée chargée en dernier dans la section Domaines de compétences. */
  private referenceDomainesActifs: Set<string> | null = null;

  /** Tous les domaines N1 de l'arbre complet (non filtré), pour affichage dans le paramétrage. */
  protected readonly tousDomaines = computed<Competence[]>(
    () => this.donneesService.donnees()?.referentiels.competences ?? [],
  );

  /**
   * Recharge la section active à chaque changement de section ou de données. Un changement
   * de section recharge entièrement la nouvelle section ; un changement des données (ENREGISTRER,
   * ANNULER / REFAIRE de l'entête) conserve les saisies modifiées de la section active et ne
   * met à jour que ce qui ne l'est pas.
   */
  public constructor() {
    this.formPreferences.statusChanges
      .pipe(takeUntilDestroyed())
      .subscribe((statut) => this.statutPreferences.set(statut));
    effect(() => {
      const section = this.sectionActive();
      const d = this.donneesService.donnees();
      if (!d) return;
      untracked(() => {
        const conserver = this.sectionChargee === section;
        this.sectionChargee = section;
        this.rechargerSection(section, d, conserver);
      });
      this.cdr.markForCheck();
    });
  }

  /**
   * Active la section cliquée, qui est rechargée depuis les données. Si la section active
   * porte des modifications non enregistrées, la popin d'avertissement est ouverte et le
   * changement n'a lieu qu'à la confirmation.
   * @param id Identifiant de la section à afficher.
   */
  protected activerSection(id: SectionId): void {
    if (id === this.sectionActive()) return;
    if (this.verifierSectionActiveModifiee()) {
      this.sectionEnAttente = id;
      this.popinAvertissementVisible.set(true);
      return;
    }
    this.sectionActive.set(id);
  }

  /**
   * Implémentation de `AvecNavigationGardee`.
   * Retourne `true` immédiatement si la section active n'a aucune modification non enregistrée,
   * sinon ouvre la popin d'avertissement et attend la décision de l'utilisateur.
   * @returns Promesse résolue à `true` pour autoriser la navigation.
   */
  public confirmerNavigation(): Promise<boolean> {
    if (!this.verifierSectionActiveModifiee()) return Promise.resolve(true);
    return new Promise<boolean>((resolve) => {
      this.resolveGarde = resolve;
      this.popinAvertissementVisible.set(true);
    });
  }

  /** Confirme l'abandon des saisies : autorise la navigation ou change de section. */
  protected confirmerAvertissement(): void {
    this.popinAvertissementVisible.set(false);
    if (this.resolveGarde) {
      this.resolveGarde(true);
      this.resolveGarde = null;
    } else if (this.sectionEnAttente !== null) {
      this.sectionActive.set(this.sectionEnAttente);
    }
    this.sectionEnAttente = null;
  }

  /** Annule l'abandon : reste sur l'écran et la section active, saisies conservées. */
  protected annulerAvertissement(): void {
    this.popinAvertissementVisible.set(false);
    this.resolveGarde?.(false);
    this.resolveGarde = null;
    this.sectionEnAttente = null;
  }

  /**
   * Indique si la section active porte des modifications non enregistrées : formulaire
   * différent des données, ou ligne de liste modifiée ou jamais enregistrée
   * (mêmes critères que les pastilles « Non enregistré »).
   * @returns `true` si quitter la section ferait perdre des saisies.
   */
  private verifierSectionActiveModifiee(): boolean {
    switch (this.sectionActive()) {
      case 'enseignantClasse':
        return this.estEnseignantClasseModifie();
      case 'semaineHoraires':
        return this.estSemaineHorairesModifie();
      case 'preferences':
        return this.estPreferencesModifie();
      case 'domainesCompetences':
        return this.estDomainesCompetencesModifie();
      case 'periodes':
        return this.lignesPeriodes.controls.some((_, i) => this.estPeriodeLigneModifiee(i));
      case 'groupes':
        return this.lignesGroupes.controls.some((_, i) => this.estGroupeLigneModifiee(i));
      case 'bareme':
        return this.lignesBareme.controls.some((_, i) => this.estStatutAcquisitionLigneModifiee(i));
      case 'statutsEleve':
        return this.lignesStatutsEleve.controls.some((_, i) => this.estStatutEleveLigneModifiee(i));
      case 'typesContact':
        return this.lignesTypesContact.controls.some((_, i) => this.estTypeContactLigneModifiee(i));
      case 'joursFeries':
        return this.lignesJoursFeries.controls.some((_, i) => this.estJourFerieLigneModifiee(i));
    }
  }

  /** Enregistre les modifications de la section Enseignant & Classe. */
  protected enregistrerEnseignantClasse(): void {
    const d = this.donneesService.donnees();
    if (!d) return;
    const valeurs = this.formEnseignantClasse.getRawValue();
    const ancienEnseignant = d.enseignant;
    const nouvelEnseignant: Enseignant = {
      prenom: valeurs.prenom,
      nom: valeurs.nom,
      annee: valeurs.annee,
    };
    this.donneesService.executer(
      new CommandeRemplacement<Enseignant>(
        (data, v) => {
          data.enseignant = v;
        },
        ancienEnseignant,
        nouvelEnseignant,
        LIBELLES.commandes.modificationEnseignant,
      ),
    );
    const ancienneClasse = d.classe;
    this.donneesService.executer(
      new CommandeRemplacement<string>(
        (data, v) => {
          data.classe.niveau = v;
        },
        ancienneClasse.niveau,
        valeurs.niveauClasse,
        LIBELLES.commandes.modificationNiveauClasse,
      ),
    );
  }

  /** Réinitialise le formulaire Enseignant & Classe depuis le store. */
  protected annulerEnseignantClasse(): void {
    this.chargerEnseignantClasse();
    this.cdr.markForCheck();
  }

  /** Enregistre la configuration Semaine & Horaires. */
  protected enregistrerSemaineHoraires(): void {
    const d = this.donneesService.donnees();
    if (!d) return;
    const valeurs = this.formSemaineHoraires.getRawValue();
    this.referentielService.modifierConfigEmploiDuTemps(d.referentiels.configEmploiDuTemps, {
      ...valeurs,
      joursOuvres: [...valeurs.joursOuvres],
    });
  }

  /** Réinitialise le formulaire Semaine & Horaires depuis le store. */
  protected annulerSemaineHoraires(): void {
    this.chargerSemaineHoraires();
    this.cdr.markForCheck();
  }

  /**
   * Indique si un jour est coché parmi les jours ouvrés du formulaire.
   * @param jour Jour à tester.
   * @returns `true` si le jour est ouvré dans le formulaire.
   */
  protected estJourOuvre(jour: JourSemaine): boolean {
    return this.formSemaineHoraires.controls.joursOuvres.value.includes(jour);
  }

  /**
   * Ajoute un jour aux jours ouvrés, en conservant l'ordre canonique.
   * @param jour Jour à ajouter.
   */
  protected ajouterJourOuvre(jour: JourSemaine): void {
    const controle = this.formSemaineHoraires.controls.joursOuvres;
    controle.setValue(this.JOURS_SEMAINE.filter((j) => j === jour || controle.value.includes(j)));
  }

  /**
   * Retire un jour des jours ouvrés du formulaire.
   * @param jour Jour à retirer.
   */
  protected retirerJourOuvre(jour: JourSemaine): void {
    const controle = this.formSemaineHoraires.controls.joursOuvres;
    controle.setValue(controle.value.filter((j) => j !== jour));
  }

  /** Enregistre les préférences si le délai saisi est valide. */
  protected enregistrerPreferences(): void {
    const d = this.donneesService.donnees();
    if (!d || this.formPreferences.invalid) return;
    this.donneesService.executer(
      new CommandeRemplacement<number>(
        (data, v) => {
          data.configuration.delaiSauvegardeAutoMinutes = v;
        },
        d.configuration.delaiSauvegardeAutoMinutes,
        Number(this.formPreferences.controls.delaiSauvegardeAutoMinutes.value),
        LIBELLES.commandes.modificationPreferences,
      ),
    );
    if (this.sauvegardeAutoService.timerActif) {
      this.sauvegardeAutoService.demarrer();
    }
  }

  /** @returns `true` si le délai de sauvegarde automatique saisi est renseigné et compris dans les bornes autorisées. */
  protected preferencesValides(): boolean {
    return this.statutPreferences() === 'VALID';
  }

  /** Réinitialise les préférences depuis le store. */
  protected annulerPreferences(): void {
    this.chargerPreferences();
    this.cdr.markForCheck();
  }

  /** Ajoute une période vide en bas de la liste et demande le focus dessus. */
  protected ajouterPeriode(): void {
    this.lignesPeriodes.push(
      EcranParametrageComponent.creerLigne<Periode>(
        { id: crypto.randomUUID(), nom: '', debut: '', fin: '' },
        null,
      ),
    );
    this.indexAFocaliserPeriode.set(this.lignesPeriodes.length - 1);
  }

  /**
   * Enregistre la période à l'index donné (création ou modification).
   * @param index Index de la ligne.
   */
  protected enregistrerPeriode(index: number): void {
    const d = this.donneesService.donnees();
    const ligne = this.lignesPeriodes.at(index);
    if (!d || !ligne) return;
    const periode = EcranParametrageComponent.marquerLigneEnregistree(ligne);
    const existante = d.referentiels.periodes.find((p) => p.id === periode.id);
    if (existante) {
      this.referentielService.modifierPeriode(existante, periode);
    } else {
      this.referentielService.ajouterPeriode(periode);
    }
  }

  /**
   * Supprime la période de la ligne donnée.
   * @param index Index de la ligne.
   */
  protected supprimerPeriode(index: number): void {
    const ligne = this.lignesPeriodes.at(index);
    if (!ligne) return;
    this.referentielService.supprimerPeriode(ligne.controls.valeur.getRawValue());
    this.lignesPeriodes.removeAt(index);
    this.indexAFocaliserPeriode.set(null);
  }

  /**
   * Indique si une période est utilisée et ne peut être supprimée.
   * @param periode Période à tester.
   * @returns `true` si la période est utilisée.
   */
  protected estPeriodeUtilisee(periode: Periode): boolean {
    return this.referentielService.estPeriodeUtilisee(periode.nom);
  }

  /** Ajoute un groupe vide et demande le focus dessus. */
  protected ajouterGroupe(): void {
    this.lignesGroupes.push(
      EcranParametrageComponent.creerLigne<Groupe>({ id: crypto.randomUUID(), libelle: '' }, null),
    );
    this.indexAFocaliserGroupe.set(this.lignesGroupes.length - 1);
  }

  /**
   * Enregistre un groupe.
   * @param index Index de la ligne.
   */
  protected enregistrerGroupe(index: number): void {
    const d = this.donneesService.donnees();
    const ligne = this.lignesGroupes.at(index);
    if (!d || !ligne) return;
    const groupe = EcranParametrageComponent.marquerLigneEnregistree(ligne);
    const existant = d.referentiels.groupes.find((g) => g.id === groupe.id);
    if (existant) {
      this.referentielService.modifierGroupe(existant, groupe);
    } else {
      this.referentielService.ajouterGroupe(groupe);
    }
  }

  /**
   * Supprime le groupe de la ligne donnée.
   * @param index Index de la ligne.
   */
  protected supprimerGroupe(index: number): void {
    const ligne = this.lignesGroupes.at(index);
    if (!ligne) return;
    this.referentielService.supprimerGroupe(ligne.controls.valeur.getRawValue());
    this.lignesGroupes.removeAt(index);
    this.indexAFocaliserGroupe.set(null);
  }

  /**
   * Indique si un groupe est utilisé.
   * @param groupe Groupe à tester.
   * @returns `true` si le groupe est utilisé.
   */
  protected estGroupeUtilise(groupe: Groupe): boolean {
    return this.referentielService.estGroupeUtilise(groupe.id);
  }

  /** Ajoute un statut d'acquisition vide et demande le focus dessus. */
  protected ajouterStatutAcquisition(): void {
    this.lignesBareme.push(
      EcranParametrageComponent.creerLigne<StatutAcquisition>(
        { id: '', glyphe: '', libelle: '', couleur: '#000000', fond: '#ffffff' },
        null,
      ),
    );
    this.indexAFocaliserBareme.set(this.lignesBareme.length - 1);
  }

  /**
   * Enregistre un statut d'acquisition.
   * @param index Index de la ligne.
   */
  protected enregistrerStatutAcquisition(index: number): void {
    const d = this.donneesService.donnees();
    const ligne = this.lignesBareme.at(index);
    if (!d || !ligne || this.obtenirErreurIdentifiantBareme(index) !== null) return;
    EcranParametrageComponent.retirerEspacesIdentifiant(ligne);
    const statut = EcranParametrageComponent.marquerLigneEnregistree(ligne);
    const existant = d.referentiels.statutsAcquisition.find((s) => s.id === statut.id);
    if (existant) {
      this.referentielService.modifierStatutAcquisition(existant, statut);
    } else {
      this.referentielService.ajouterStatutAcquisition(statut);
    }
  }

  /**
   * Supprime le statut d'acquisition de la ligne donnée.
   * @param index Index de la ligne.
   */
  protected supprimerStatutAcquisition(index: number): void {
    const ligne = this.lignesBareme.at(index);
    if (!ligne) return;
    this.referentielService.supprimerStatutAcquisition(ligne.controls.valeur.getRawValue());
    this.lignesBareme.removeAt(index);
    this.indexAFocaliserBareme.set(null);
  }

  /**
   * Indique si un statut d'acquisition est utilisé.
   * @param statut Statut à tester.
   * @returns `true` si le statut d'acquisition est utilisé.
   */
  protected estStatutAcquisitionUtilise(statut: StatutAcquisition): boolean {
    return this.referentielService.estStatutAcquisitionUtilise(statut.id);
  }

  /** Ajoute un statut élève vide et demande le focus dessus. */
  protected ajouterStatutEleve(): void {
    this.lignesStatutsEleve.push(
      EcranParametrageComponent.creerLigne<StatutEleve>({ id: '', libelle: '' }, null),
    );
    this.indexAFocaliserStatutEleve.set(this.lignesStatutsEleve.length - 1);
  }

  /**
   * Enregistre un statut élève.
   * @param index Index de la ligne.
   */
  protected enregistrerStatutEleve(index: number): void {
    const d = this.donneesService.donnees();
    const ligne = this.lignesStatutsEleve.at(index);
    if (!d || !ligne || this.obtenirErreurIdentifiantStatutEleve(index) !== null) return;
    EcranParametrageComponent.retirerEspacesIdentifiant(ligne);
    const statut = EcranParametrageComponent.marquerLigneEnregistree(ligne);
    const existant = d.referentiels.statutsEleve.find((s) => s.id === statut.id);
    if (existant) {
      this.referentielService.modifierStatutEleve(existant, statut);
    } else {
      this.referentielService.ajouterStatutEleve(statut);
    }
  }

  /**
   * Supprime le statut élève de la ligne donnée.
   * @param index Index de la ligne.
   */
  protected supprimerStatutEleve(index: number): void {
    const ligne = this.lignesStatutsEleve.at(index);
    if (!ligne) return;
    this.referentielService.supprimerStatutEleve(ligne.controls.valeur.getRawValue());
    this.lignesStatutsEleve.removeAt(index);
    this.indexAFocaliserStatutEleve.set(null);
  }

  /**
   * Indique si un statut élève est utilisé.
   * @param statut Statut à tester.
   * @returns `true` si le statut élève est utilisé.
   */
  protected estStatutEleveUtilise(statut: StatutEleve): boolean {
    return this.referentielService.estStatutEleveUtilise(statut.id);
  }

  /** Ajoute un type de contact vide et demande le focus dessus. */
  protected ajouterTypeContact(): void {
    this.lignesTypesContact.push(
      EcranParametrageComponent.creerLigne<TypeContact>({ id: '', libelle: '' }, null),
    );
    this.indexAFocaliserTypeContact.set(this.lignesTypesContact.length - 1);
  }

  /**
   * Enregistre un type de contact.
   * @param index Index de la ligne.
   */
  protected enregistrerTypeContact(index: number): void {
    const d = this.donneesService.donnees();
    const ligne = this.lignesTypesContact.at(index);
    if (!d || !ligne || this.obtenirErreurIdentifiantTypeContact(index) !== null) return;
    EcranParametrageComponent.retirerEspacesIdentifiant(ligne);
    const type = EcranParametrageComponent.marquerLigneEnregistree(ligne);
    const existant = d.referentiels.typesContact.find((t) => t.id === type.id);
    if (existant) {
      this.referentielService.modifierTypeContact(existant, type);
    } else {
      this.referentielService.ajouterTypeContact(type);
    }
  }

  /**
   * Supprime le type de contact de la ligne donnée.
   * @param index Index de la ligne.
   */
  protected supprimerTypeContact(index: number): void {
    const ligne = this.lignesTypesContact.at(index);
    if (!ligne) return;
    this.referentielService.supprimerTypeContact(ligne.controls.valeur.getRawValue());
    this.lignesTypesContact.removeAt(index);
    this.indexAFocaliserTypeContact.set(null);
  }

  /**
   * Indique si un type de contact est utilisé.
   * @param type Type à tester.
   * @returns `true` si le type de contact est utilisé.
   */
  protected estTypeContactUtilise(type: TypeContact): boolean {
    return this.referentielService.estTypeContactUtilise(type.id);
  }

  /** Ajoute un jour férié vide et demande le focus dessus. */
  protected ajouterJourFerie(): void {
    this.lignesJoursFeries.push(
      EcranParametrageComponent.creerLigne<JourFerie>(
        { id: crypto.randomUUID(), nom: '', date: '' },
        null,
      ),
    );
    this.indexAFocaliserJourFerie.set(this.lignesJoursFeries.length - 1);
  }

  /**
   * Enregistre un jour férié.
   * @param index Index de la ligne.
   */
  protected enregistrerJourFerie(index: number): void {
    const d = this.donneesService.donnees();
    const ligne = this.lignesJoursFeries.at(index);
    if (!d || !ligne) return;
    const jourFerie = EcranParametrageComponent.marquerLigneEnregistree(ligne);
    const existant = d.referentiels.joursFeries.find((j) => j.id === jourFerie.id);
    if (existant) {
      this.referentielService.modifierJourFerie(existant, jourFerie);
    } else {
      this.referentielService.ajouterJourFerie(jourFerie);
    }
  }

  /**
   * Supprime le jour férié de la ligne donnée.
   * @param index Index de la ligne.
   */
  protected supprimerJourFerie(index: number): void {
    const ligne = this.lignesJoursFeries.at(index);
    if (!ligne) return;
    this.referentielService.supprimerJourFerie(ligne.controls.valeur.getRawValue());
    this.lignesJoursFeries.removeAt(index);
    this.indexAFocaliserJourFerie.set(null);
  }

  /**
   * @param index Index de la ligne dans la section Barème.
   * @returns Erreur de l'identifiant saisi, `null` s'il est valide ou si la ligne est enregistrée.
   */
  protected obtenirErreurIdentifiantBareme(index: number): ErreurIdentifiant | null {
    return EcranParametrageComponent.obtenirErreurIdentifiant(
      this.lignesBareme,
      index,
      this.donneesService.donnees()?.referentiels.statutsAcquisition ?? [],
    );
  }

  /**
   * @param index Index de la ligne dans la section Statuts élève.
   * @returns Erreur de l'identifiant saisi, `null` s'il est valide ou si la ligne est enregistrée.
   */
  protected obtenirErreurIdentifiantStatutEleve(index: number): ErreurIdentifiant | null {
    return EcranParametrageComponent.obtenirErreurIdentifiant(
      this.lignesStatutsEleve,
      index,
      this.donneesService.donnees()?.referentiels.statutsEleve ?? [],
    );
  }

  /**
   * @param index Index de la ligne dans la section Types de contact.
   * @returns Erreur de l'identifiant saisi, `null` s'il est valide ou si la ligne est enregistrée.
   */
  protected obtenirErreurIdentifiantTypeContact(index: number): ErreurIdentifiant | null {
    return EcranParametrageComponent.obtenirErreurIdentifiant(
      this.lignesTypesContact,
      index,
      this.donneesService.donnees()?.referentiels.typesContact ?? [],
    );
  }

  /**
   * Message à afficher sous l'identifiant d'une ligne. Un doublon est signalé immédiatement ;
   * un identifiant vide seulement une fois le champ modifié ou quitté, pour ne pas afficher
   * d'erreur sur une ligne tout juste ajoutée.
   * @param ligne Ligne d'une section liste.
   * @param erreur Erreur de l'identifiant de la ligne (`null` si aucune).
   * @returns Message d'erreur, `null` si rien n'est à afficher.
   */
  protected obtenirMessageErreurIdentifiant<T>(
    ligne: FormGroup<LigneFormulaire<T>>,
    erreur: ErreurIdentifiant | null,
  ): string | null {
    if (erreur === 'dejaUtilise') return LIBELLES.parametrage.erreurIdentifiantDejaUtilise;
    const controleId = ligne.controls.valeur.get('id');
    if (erreur === 'obligatoire' && (controleId?.dirty || controleId?.touched)) {
      return LIBELLES.parametrage.erreurIdentifiantObligatoire;
    }
    return null;
  }

  /**
   * Indique si une ligne représente une entrée enregistrée : son identifiant est alors figé.
   * @param ligne Ligne d'une section liste.
   * @returns `true` si la ligne est rattachée à une entrée enregistrée.
   */
  protected verifierLigneEnregistree<T>(ligne: FormGroup<LigneFormulaire<T>>): boolean {
    return ligne.controls.idOrigine.value !== null;
  }

  /**
   * Valeur courante d'une ligne, pour les liaisons du template. Référence stable tant que la
   * ligne n'est pas modifiée (contrairement à `getRawValue()`, qui crée un nouvel objet à
   * chaque appel) ; tous les contrôles étant actifs, elle contient tous les champs.
   * @param ligne Ligne d'une section liste.
   * @returns Valeur de l'entrée éditée.
   */
  protected obtenirValeurLigne<T>(ligne: FormGroup<LigneFormulaire<T>>): T {
    return ligne.controls.valeur.value as T;
  }

  /**
   * Indique si un domaine N1 est actif dans le formulaire.
   * @param domaineId Identifiant du domaine N1.
   */
  protected estDomaineActif(domaineId: string): boolean {
    return this.copieDomainesActifs().has(domaineId);
  }

  /**
   * Indique si un sous-domaine N2 est actif dans le formulaire.
   * Retourne `true` si son ID ou celui de son domaine parent est dans l'ensemble.
   * @param domaineId Identifiant du domaine N1 parent.
   * @param sousDomId Identifiant du sous-domaine N2.
   */
  protected estSousDomaineActif(domaineId: string, sousDomId: string): boolean {
    const actifs = this.copieDomainesActifs();
    return actifs.has(sousDomId) || actifs.has(domaineId);
  }

  /**
   * Bascule un domaine N1 entier (coche ou décoche tous ses sous-domaines N2).
   * @param domaine Nœud N1.
   * @param actif `true` pour activer, `false` pour désactiver.
   */
  protected basculerDomaine(domaine: Competence, actif: boolean): void {
    const nouveauSet = new Set(this.copieDomainesActifs());
    if (actif) {
      nouveauSet.add(domaine.id);
      domaine.enfants?.forEach((ss) => nouveauSet.add(ss.id));
    } else {
      nouveauSet.delete(domaine.id);
      domaine.enfants?.forEach((ss) => nouveauSet.delete(ss.id));
    }
    this.copieDomainesActifs.set(nouveauSet);
  }

  /**
   * Bascule un sous-domaine N2 individuellement.
   * Si le domaine parent N1 était entièrement actif (via son ID), il est décomposé
   * en ses sous-domaines individuels pour permettre la sélection partielle.
   * @param domaine Nœud N1 parent.
   * @param sousDomaine Nœud N2 à basculer.
   * @param actif `true` pour activer, `false` pour désactiver.
   */
  protected basculerSousDomaine(
    domaine: Competence,
    sousDomaine: Competence,
    actif: boolean,
  ): void {
    const nouveauSet = new Set(this.copieDomainesActifs());
    if (actif) {
      nouveauSet.add(sousDomaine.id);
    } else {
      if (nouveauSet.has(domaine.id)) {
        // Décomposer le domaine parent : activer tous les autres sous-domaines sauf celui-ci
        nouveauSet.delete(domaine.id);
        domaine.enfants?.forEach((ss) => {
          if (ss.id !== sousDomaine.id) nouveauSet.add(ss.id);
        });
      }
      // Retiré même si le domaine parent était actif : son ID peut figurer dans l'ensemble
      // (tout coché au chargement)
      nouveauSet.delete(sousDomaine.id);
    }
    this.copieDomainesActifs.set(nouveauSet);
  }

  /** Enregistre la sélection des domaines de compétences actifs. */
  protected enregistrerDomainesCompetences(): void {
    const d = this.donneesService.donnees();
    if (!d) return;
    const actifs = this.copieDomainesActifs();

    // Si tous les nœuds N1 et N2 sont actifs, on stocke [] (= tout afficher)
    const toutActif = this.collecterIdsDomaines().every((id) => actifs.has(id));

    this.donneesService.executer(
      new CommandeRemplacement<string[]>(
        (data, v) => {
          data.configuration.domainesActifs = v;
        },
        d.configuration.domainesActifs ?? [],
        toutActif ? [] : [...actifs],
        LIBELLES.commandes.modificationDomainesActifs,
      ),
    );
  }

  /** Réinitialise la sélection des domaines depuis le store. */
  protected annulerDomainesCompetences(): void {
    this.chargerDomainesCompetences();
    this.cdr.markForCheck();
  }

  /**
   * Recharge une section depuis les données.
   * @param section Section à recharger.
   * @param d Données courantes.
   * @param conserver `true` pour conserver les saisies modifiées (même section, données changées),
   * `false` pour un rechargement complet (changement de section).
   */
  private rechargerSection(section: SectionId, d: DonneesApplication, conserver: boolean): void {
    switch (section) {
      case 'enseignantClasse':
        this.chargerEnseignantClasse(conserver);
        break;
      case 'periodes':
        EcranParametrageComponent.reconcilierLignes(
          this.lignesPeriodes,
          d.referentiels.periodes,
          conserver,
        );
        this.indexAFocaliserPeriode.set(null);
        break;
      case 'semaineHoraires':
        this.chargerSemaineHoraires(conserver);
        break;
      case 'groupes':
        EcranParametrageComponent.reconcilierLignes(
          this.lignesGroupes,
          d.referentiels.groupes,
          conserver,
        );
        this.indexAFocaliserGroupe.set(null);
        break;
      case 'bareme':
        EcranParametrageComponent.reconcilierLignes(
          this.lignesBareme,
          d.referentiels.statutsAcquisition,
          conserver,
        );
        this.indexAFocaliserBareme.set(null);
        break;
      case 'statutsEleve':
        EcranParametrageComponent.reconcilierLignes(
          this.lignesStatutsEleve,
          d.referentiels.statutsEleve,
          conserver,
        );
        this.indexAFocaliserStatutEleve.set(null);
        break;
      case 'typesContact':
        EcranParametrageComponent.reconcilierLignes(
          this.lignesTypesContact,
          d.referentiels.typesContact,
          conserver,
        );
        this.indexAFocaliserTypeContact.set(null);
        break;
      case 'joursFeries':
        EcranParametrageComponent.reconcilierLignes(
          this.lignesJoursFeries,
          d.referentiels.joursFeries,
          conserver,
        );
        this.indexAFocaliserJourFerie.set(null);
        break;
      case 'preferences':
        this.chargerPreferences(conserver);
        break;
      case 'domainesCompetences':
        this.chargerDomainesCompetences(conserver);
        break;
    }
  }

  /**
   * Lit dans les données les valeurs enregistrées du formulaire Enseignant & Classe.
   * @param d Données courantes.
   * @returns Valeurs enregistrées, dans la structure du formulaire.
   */
  private static lireEnseignantClasse(
    d: DonneesApplication,
  ): ValeursDe<FormulaireEnseignantClasse> {
    return {
      prenom: d.enseignant.prenom,
      nom: d.enseignant.nom,
      annee: d.enseignant.annee,
      niveauClasse: d.classe.niveau,
    };
  }

  /**
   * Lit dans les données les valeurs enregistrées du formulaire Semaine & Horaires.
   * @param d Données courantes.
   * @returns Copie de la configuration enregistrée, dans la structure du formulaire.
   */
  private static lireSemaineHoraires(d: DonneesApplication): ValeursDe<FormulaireSemaineHoraires> {
    const config: ConfigEmploiDuTemps = d.referentiels.configEmploiDuTemps;
    return {
      joursOuvres: [...config.joursOuvres],
      heureDebutJournee: config.heureDebutJournee,
      heureFinJournee: config.heureFinJournee,
    };
  }

  /**
   * Lit dans les données les valeurs enregistrées du formulaire Préférences.
   * @param d Données courantes.
   * @returns Valeurs enregistrées, dans la structure du formulaire.
   */
  private static lirePreferences(d: DonneesApplication): ValeursDe<FormulairePreferences> {
    return { delaiSauvegardeAutoMinutes: d.configuration.delaiSauvegardeAutoMinutes };
  }

  /**
   * Lit dans les données la sélection enregistrée des domaines actifs.
   * @param d Données courantes.
   * @returns Identifiants actifs ; tous les domaines et sous-domaines si rien n'est configuré.
   */
  private lireDomainesActifs(d: DonneesApplication): Set<string> {
    const actifs = d.configuration.domainesActifs;
    return new Set(actifs && actifs.length > 0 ? actifs : this.collecterIdsDomaines());
  }

  /**
   * Indique si le rechargement doit remplacer la saisie d'un formulaire par les valeurs
   * enregistrées : toujours lors d'un rechargement complet, sinon seulement si la saisie
   * n'est pas modifiée par rapport à la référence chargée précédemment.
   * @param conserver `true` si les saisies modifiées doivent être conservées.
   * @param saisie Saisie courante du formulaire.
   * @param reference Valeurs enregistrées chargées précédemment (`null` si aucune).
   * @returns `true` si le formulaire doit recevoir les valeurs enregistrées.
   */
  private static verifierRemplacementSaisie(
    conserver: boolean,
    saisie: unknown,
    reference: unknown,
  ): boolean {
    return !conserver || reference === null || ObjetUtils.sontEgaux(saisie, reference);
  }

  /**
   * Charge le formulaire Enseignant & Classe depuis le store.
   * @param conserver `true` pour conserver une saisie modifiée par rapport à la référence.
   */
  private chargerEnseignantClasse(conserver = false): void {
    const d = this.donneesService.donnees();
    if (!d) return;
    const enregistrees = EcranParametrageComponent.lireEnseignantClasse(d);
    if (
      EcranParametrageComponent.verifierRemplacementSaisie(
        conserver,
        this.formEnseignantClasse.getRawValue(),
        this.referenceEnseignantClasse,
      )
    ) {
      this.formEnseignantClasse.reset(enregistrees, { emitEvent: false });
    }
    this.referenceEnseignantClasse = enregistrees;
  }

  /**
   * Charge le formulaire Semaine & Horaires depuis le store. Les jours ouvrés sont comparés
   * triés : seul l'ensemble des jours compte, pas leur ordre de saisie.
   * @param conserver `true` pour conserver une saisie modifiée par rapport à la référence.
   */
  private chargerSemaineHoraires(conserver = false): void {
    const d = this.donneesService.donnees();
    if (!d) return;
    const enregistrees = EcranParametrageComponent.lireSemaineHoraires(d);
    const reference = this.referenceSemaineHoraires;
    if (
      EcranParametrageComponent.verifierRemplacementSaisie(
        conserver,
        EcranParametrageComponent.normaliserSemaineHoraires(this.formSemaineHoraires.getRawValue()),
        reference && EcranParametrageComponent.normaliserSemaineHoraires(reference),
      )
    ) {
      this.formSemaineHoraires.reset(
        { ...enregistrees, joursOuvres: [...enregistrees.joursOuvres] },
        { emitEvent: false },
      );
    }
    this.referenceSemaineHoraires = enregistrees;
  }

  /**
   * Charge le formulaire Préférences depuis le store et resynchronise son statut.
   * @param conserver `true` pour conserver une saisie modifiée par rapport à la référence.
   */
  private chargerPreferences(conserver = false): void {
    const d = this.donneesService.donnees();
    if (!d) return;
    const enregistrees = EcranParametrageComponent.lirePreferences(d);
    if (
      EcranParametrageComponent.verifierRemplacementSaisie(
        conserver,
        this.formPreferences.getRawValue(),
        this.referencePreferences,
      )
    ) {
      this.formPreferences.reset(enregistrees, { emitEvent: false });
      this.statutPreferences.set(this.formPreferences.status);
    }
    this.referencePreferences = enregistrees;
  }

  /**
   * Charge la sélection des domaines actifs depuis le store (rien de configuré = tout coché).
   * @param conserver `true` pour conserver une sélection modifiée par rapport à la référence.
   */
  private chargerDomainesCompetences(conserver = false): void {
    const d = this.donneesService.donnees();
    if (!d) return;
    const enregistres = this.lireDomainesActifs(d);
    const reference = this.referenceDomainesActifs;
    if (
      EcranParametrageComponent.verifierRemplacementSaisie(
        conserver,
        EcranParametrageComponent.trierIdentifiants(this.copieDomainesActifs()),
        reference && EcranParametrageComponent.trierIdentifiants(reference),
      )
    ) {
      this.copieDomainesActifs.set(new Set(enregistres));
    }
    this.referenceDomainesActifs = enregistres;
  }

  /**
   * Normalise les valeurs Semaine & Horaires pour comparaison : jours ouvrés triés.
   * @param valeurs Valeurs du formulaire ou valeurs enregistrées.
   * @returns Copie dont les jours ouvrés sont triés.
   */
  private static normaliserSemaineHoraires(
    valeurs: ValeursDe<FormulaireSemaineHoraires>,
  ): ValeursDe<FormulaireSemaineHoraires> {
    return { ...valeurs, joursOuvres: [...valeurs.joursOuvres].sort((a, b) => a.localeCompare(b)) };
  }

  /**
   * Trie un ensemble d'identifiants pour une comparaison indépendante de l'ordre d'insertion.
   * @param ids Ensemble d'identifiants.
   * @returns Identifiants triés.
   */
  private static trierIdentifiants(ids: ReadonlySet<string>): string[] {
    return [...ids].sort((a, b) => a.localeCompare(b));
  }

  /**
   * Crée la ligne d'une section liste.
   * @param entree Valeur initiale de la ligne.
   * @param idOrigine Identifiant de l'entrée enregistrée représentée, `null` pour une nouvelle ligne.
   * @returns Groupe de contrôles de la ligne.
   */
  private static creerLigne<T extends object>(
    entree: T,
    idOrigine: string | null,
  ): FormGroup<LigneFormulaire<T>> {
    const controles: Record<string, FormControl<unknown>> = {};
    for (const [cle, valeur] of Object.entries(entree)) {
      controles[cle] = new FormControl<unknown>(valeur, { nonNullable: true });
    }
    return new FormGroup<LigneFormulaire<T>>({
      idOrigine: new FormControl<string | null>(idOrigine),
      valeur: new FormGroup(controles) as unknown as FormGroup<ControlesDe<T>>,
      reference: new FormControl<T | null>(idOrigine === null ? null : structuredClone(entree)),
    });
  }

  /**
   * Réconcilie les lignes d'une section liste avec les entrées enregistrées, dans leur ordre.
   * La ligne d'une entrée toujours présente (même `idOrigine`) est réutilisée ; une ligne est
   * créée pour une entrée nouvelle.
   *
   * Rechargement complet (`conserverSaisies` à `false`) : les lignes réutilisées reçoivent la
   * valeur enregistrée, les autres (entrées disparues, lignes jamais enregistrées) sont retirées.
   *
   * Conservation des saisies (`conserverSaisies` à `true`) : une ligne réutilisée garde sa saisie
   * si elle est modifiée par rapport à sa référence ; une ligne jamais enregistrée est conservée ;
   * une ligne dont l'entrée a disparu est retirée sauf si elle est modifiée, auquel cas elle
   * redevient non enregistrée. Les lignes conservées sans entrée suivent, dans leur ordre d'origine.
   * @param lignes Lignes de la section.
   * @param entrees Entrées enregistrées de la section.
   * @param conserverSaisies `true` pour conserver les saisies modifiées.
   */
  private static reconcilierLignes<T extends { id: string }>(
    lignes: FormArray<FormGroup<LigneFormulaire<T>>>,
    entrees: readonly T[],
    conserverSaisies = false,
  ): void {
    const lignesParId = new Map<string, FormGroup<LigneFormulaire<T>>>();
    for (const ligne of lignes.controls) {
      const idOrigine = ligne.controls.idOrigine.value;
      if (idOrigine !== null) lignesParId.set(idOrigine, ligne);
    }
    const rattachees = new Set<FormGroup<LigneFormulaire<T>>>();
    const reconciliees = entrees.map((entree) => {
      const existante = lignesParId.get(entree.id);
      if (!existante)
        return EcranParametrageComponent.creerLigne(structuredClone(entree), entree.id);
      rattachees.add(existante);
      if (
        !conserverSaisies ||
        !EcranParametrageComponent.verifierLigneModifieeDepuisReference(existante)
      ) {
        const valeur = structuredClone(entree) as Parameters<
          typeof existante.controls.valeur.reset
        >[0];
        existante.controls.valeur.reset(valeur, { emitEvent: false });
      }
      existante.controls.reference.setValue(structuredClone(entree), { emitEvent: false });
      return existante;
    });
    const conservees = conserverSaisies
      ? lignes.controls.filter(
          (ligne) =>
            !rattachees.has(ligne) &&
            EcranParametrageComponent.verifierLigneModifieeDepuisReference(ligne),
        )
      : [];
    for (const ligne of conservees) {
      ligne.controls.idOrigine.setValue(null, { emitEvent: false });
      ligne.controls.reference.setValue(null, { emitEvent: false });
    }
    lignes.clear({ emitEvent: false });
    for (const ligne of [...reconciliees, ...conservees]) lignes.push(ligne, { emitEvent: false });
  }

  /**
   * Indique si une ligne est modifiée par rapport à sa référence, c'est-à-dire à la valeur
   * enregistrée lors de son dernier chargement. Une ligne jamais enregistrée est modifiée.
   * @param ligne Ligne d'une section liste.
   * @returns `true` si la ligne n'a pas de référence ou si sa saisie en diffère.
   */
  private static verifierLigneModifieeDepuisReference<T>(
    ligne: FormGroup<LigneFormulaire<T>>,
  ): boolean {
    const reference = ligne.controls.reference.value;
    return (
      reference === null || !ObjetUtils.sontEgaux(ligne.controls.valeur.getRawValue(), reference)
    );
  }

  /**
   * Contrôle l'identifiant d'une ligne non enregistrée : obligatoire, et unique dans la section
   * (sans tenir compte de la casse ni des espaces en bordure) face aux entrées enregistrées et
   * aux autres lignes. Deux nouvelles lignes au même identifiant sont toutes deux en erreur :
   * sinon, enregistrer la seconde remplacerait la première.
   * @param lignes Lignes de la section.
   * @param index Index de la ligne contrôlée.
   * @param entrees Entrées enregistrées de la section.
   * @returns Erreur de l'identifiant, `null` s'il est valide, si la ligne est enregistrée
   *   (identifiant figé) ou si l'index est hors bornes.
   */
  private static obtenirErreurIdentifiant<T extends { id: string }>(
    lignes: FormArray<FormGroup<LigneFormulaire<T>>>,
    index: number,
    entrees: readonly T[],
  ): ErreurIdentifiant | null {
    const ligne = lignes.at(index);
    if (!ligne || ligne.controls.idOrigine.value !== null) return null;
    const identifiant = TexteUtils.normaliserIdentifiant(
      (ligne.controls.valeur.getRawValue() as T).id,
    );
    if (identifiant === '') return 'obligatoire';
    const autresIdentifiants = [
      ...entrees.map((entree) => entree.id),
      ...lignes.controls
        .filter((autre) => autre !== ligne)
        .map((autre) => (autre.controls.valeur.getRawValue() as T).id),
    ];
    return autresIdentifiants.some(
      (autre) => TexteUtils.normaliserIdentifiant(autre) === identifiant,
    )
      ? 'dejaUtilise'
      : null;
  }

  /**
   * Retire les espaces en bordure de l'identifiant d'une ligne non enregistrée, avant son
   * enregistrement. L'identifiant d'une ligne enregistrée, figé, n'est pas touché.
   * @param ligne Ligne à enregistrer.
   */
  private static retirerEspacesIdentifiant<T extends { id: string }>(
    ligne: FormGroup<LigneFormulaire<T>>,
  ): void {
    if (ligne.controls.idOrigine.value !== null) return;
    const controleId = ligne.controls.valeur.controls.id;
    controleId.setValue(controleId.value.trim() as T['id']);
  }

  /**
   * Marque une ligne comme représentant l'entrée enregistrée sous son identifiant courant,
   * pour que la réconciliation qui suit l'enregistrement réutilise la ligne.
   * @param ligne Ligne enregistrée.
   * @returns Valeur de l'entrée à enregistrer.
   */
  private static marquerLigneEnregistree<T extends { id: string }>(
    ligne: FormGroup<LigneFormulaire<T>>,
  ): T {
    const valeur = ligne.controls.valeur.getRawValue() as T;
    ligne.controls.idOrigine.setValue(valeur.id);
    return valeur;
  }

  /**
   * Collecte les identifiants de tous les domaines N1 et sous-domaines N2 de l'arbre complet.
   * @returns Liste plate de tous les identifiants (vide si les données ne sont pas chargées).
   */
  private collecterIdsDomaines(): string[] {
    const d = this.donneesService.donnees();
    if (!d) return [];
    const ids: string[] = [];
    d.referentiels.competences.forEach((n1) => {
      ids.push(n1.id);
      n1.enfants?.forEach((n2) => ids.push(n2.id));
    });
    return ids;
  }

  /**
   * Indique si une ligne éditée inline diffère de sa version enregistrée dans le store,
   * retrouvée par l'identifiant saisi. Une ligne absente du store (création en cours) est
   * considérée comme modifiée.
   * @param ligne Ligne de la section (`undefined` si l'index est hors bornes).
   * @param listeStore Liste correspondante dans le store.
   * @returns `true` si la ligne est nouvelle ou a été modifiée.
   */
  private verifierLigneModifiee<T extends { id: string }>(
    ligne: FormGroup<LigneFormulaire<T>> | undefined,
    listeStore: readonly T[],
  ): boolean {
    if (!ligne) return false;
    const valeur = ligne.controls.valeur.getRawValue() as T;
    const enregistree = listeStore.find((e) => e.id === valeur.id);
    return !enregistree || !ObjetUtils.sontEgaux(enregistree, valeur);
  }

  /** @returns `true` si le formulaire Enseignant & Classe diffère du store. */
  protected estEnseignantClasseModifie(): boolean {
    const d = this.donneesService.donnees();
    if (!d) return false;
    return !ObjetUtils.sontEgaux(
      this.formEnseignantClasse.getRawValue(),
      EcranParametrageComponent.lireEnseignantClasse(d),
    );
  }

  /**
   * @returns `true` si le formulaire Semaine & Horaires diffère du store.
   * La liste des jours ouvrés est triée avant comparaison : seul l'ensemble des jours
   * compte, pas leur ordre de saisie.
   */
  protected estSemaineHorairesModifie(): boolean {
    const d = this.donneesService.donnees();
    if (!d) return false;
    return !ObjetUtils.sontEgaux(
      EcranParametrageComponent.normaliserSemaineHoraires(this.formSemaineHoraires.getRawValue()),
      EcranParametrageComponent.normaliserSemaineHoraires(
        EcranParametrageComponent.lireSemaineHoraires(d),
      ),
    );
  }

  /** @returns `true` si le formulaire Préférences diffère du store. */
  protected estPreferencesModifie(): boolean {
    const d = this.donneesService.donnees();
    if (!d) return false;
    return (
      this.formPreferences.controls.delaiSauvegardeAutoMinutes.value !==
      d.configuration.delaiSauvegardeAutoMinutes
    );
  }

  /** @returns `true` si la sélection des domaines diffère de la configuration enregistrée. */
  protected estDomainesCompetencesModifie(): boolean {
    const d = this.donneesService.donnees();
    if (!d) return false;
    const actifs = this.copieDomainesActifs();
    const toutActif = this.collecterIdsDomaines().every((id) => actifs.has(id));
    const copieNormalisee = (toutActif ? [] : [...actifs]).sort((a, b) => a.localeCompare(b));
    const storeNormalise = [...(d.configuration.domainesActifs ?? [])].sort((a, b) =>
      a.localeCompare(b),
    );
    return !ObjetUtils.sontEgaux(copieNormalisee, storeNormalise);
  }

  /**
   * @param index Index de la ligne dans la section.
   * @returns `true` si la période est nouvelle ou modifiée.
   */
  protected estPeriodeLigneModifiee(index: number): boolean {
    const d = this.donneesService.donnees();
    return (
      !!d && this.verifierLigneModifiee(this.lignesPeriodes.at(index), d.referentiels.periodes)
    );
  }

  /**
   * @param index Index de la ligne dans la section.
   * @returns `true` si le groupe est nouveau ou modifié.
   */
  protected estGroupeLigneModifiee(index: number): boolean {
    const d = this.donneesService.donnees();
    return !!d && this.verifierLigneModifiee(this.lignesGroupes.at(index), d.referentiels.groupes);
  }

  /**
   * @param index Index de la ligne dans la section.
   * @returns `true` si le statut d'acquisition est nouveau ou modifié.
   */
  protected estStatutAcquisitionLigneModifiee(index: number): boolean {
    const d = this.donneesService.donnees();
    return (
      !!d &&
      this.verifierLigneModifiee(this.lignesBareme.at(index), d.referentiels.statutsAcquisition)
    );
  }

  /**
   * @param index Index de la ligne dans la section.
   * @returns `true` si le statut élève est nouveau ou modifié.
   */
  protected estStatutEleveLigneModifiee(index: number): boolean {
    const d = this.donneesService.donnees();
    return (
      !!d &&
      this.verifierLigneModifiee(this.lignesStatutsEleve.at(index), d.referentiels.statutsEleve)
    );
  }

  /**
   * @param index Index de la ligne dans la section.
   * @returns `true` si le type de contact est nouveau ou modifié.
   */
  protected estTypeContactLigneModifiee(index: number): boolean {
    const d = this.donneesService.donnees();
    return (
      !!d &&
      this.verifierLigneModifiee(this.lignesTypesContact.at(index), d.referentiels.typesContact)
    );
  }

  /**
   * @param index Index de la ligne dans la section.
   * @returns `true` si le jour férié est nouveau ou modifié.
   */
  protected estJourFerieLigneModifiee(index: number): boolean {
    const d = this.donneesService.donnees();
    return (
      !!d &&
      this.verifierLigneModifiee(this.lignesJoursFeries.at(index), d.referentiels.joursFeries)
    );
  }
}
