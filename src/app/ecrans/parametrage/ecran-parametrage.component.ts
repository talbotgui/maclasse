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
} from '@angular/core';
import type { WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { ObjetUtils } from '../../utilitaires/objet.utils';
import type { Enseignant } from '../../modeles/donnees-application.modele';
import type {
  Competence,
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

/**
 * Écran de paramétrage de l'application.
 * Deux colonnes : navigation par section à gauche, formulaire à droite.
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
  ],
  templateUrl: './ecran-parametrage.component.html',
  styleUrl: './ecran-parametrage.component.scss',
})
export class EcranParametrageComponent {
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

  /** Tous les domaines N1 de l'arbre complet (non filtré), pour affichage dans le paramétrage. */
  protected readonly tousDomaines = computed<Competence[]>(
    () => this.donneesService.donnees()?.referentiels.competences ?? [],
  );

  /**
   * Recharge la section active à chaque changement de section ou de données. Les sections
   * liste sont réconciliées ligne par ligne : les instances de `FormGroup` des entrées
   * toujours présentes sont conservées.
   */
  public constructor() {
    this.formPreferences.statusChanges
      .pipe(takeUntilDestroyed())
      .subscribe((statut) => this.statutPreferences.set(statut));
    effect(() => {
      const section = this.sectionActive();
      const d = this.donneesService.donnees();
      if (!d) return;

      switch (section) {
        case 'enseignantClasse':
          this.chargerEnseignantClasse();
          break;
        case 'periodes':
          EcranParametrageComponent.reconcilierLignes(this.lignesPeriodes, d.referentiels.periodes);
          this.indexAFocaliserPeriode.set(null);
          break;
        case 'semaineHoraires':
          this.chargerSemaineHoraires();
          break;
        case 'groupes':
          EcranParametrageComponent.reconcilierLignes(this.lignesGroupes, d.referentiels.groupes);
          this.indexAFocaliserGroupe.set(null);
          break;
        case 'bareme':
          EcranParametrageComponent.reconcilierLignes(
            this.lignesBareme,
            d.referentiels.statutsAcquisition,
          );
          this.indexAFocaliserBareme.set(null);
          break;
        case 'statutsEleve':
          EcranParametrageComponent.reconcilierLignes(
            this.lignesStatutsEleve,
            d.referentiels.statutsEleve,
          );
          this.indexAFocaliserStatutEleve.set(null);
          break;
        case 'typesContact':
          EcranParametrageComponent.reconcilierLignes(
            this.lignesTypesContact,
            d.referentiels.typesContact,
          );
          this.indexAFocaliserTypeContact.set(null);
          break;
        case 'joursFeries':
          EcranParametrageComponent.reconcilierLignes(
            this.lignesJoursFeries,
            d.referentiels.joursFeries,
          );
          this.indexAFocaliserJourFerie.set(null);
          break;
        case 'preferences':
          this.chargerPreferences();
          break;
        case 'domainesCompetences':
          this.chargerDomainesCompetences();
          break;
      }
      this.cdr.markForCheck();
    });
  }

  /**
   * Active la section cliquée et réinitialise les copies locales.
   * @param id Identifiant de la section à afficher.
   */
  protected activerSection(id: SectionId): void {
    this.sectionActive.set(id);
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
    if (!d || !ligne) return;
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
    if (!d || !ligne) return;
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
    if (!d || !ligne) return;
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
    } else if (nouveauSet.has(domaine.id)) {
      // Décomposer le domaine parent : activer tous les autres sous-domaines sauf celui-ci
      nouveauSet.delete(domaine.id);
      domaine.enfants?.forEach((ss) => {
        if (ss.id !== sousDomaine.id) nouveauSet.add(ss.id);
      });
    } else {
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

  /** Charge le formulaire Enseignant & Classe depuis le store. */
  private chargerEnseignantClasse(): void {
    const d = this.donneesService.donnees();
    if (!d) return;
    this.formEnseignantClasse.reset(
      {
        prenom: d.enseignant.prenom,
        nom: d.enseignant.nom,
        annee: d.enseignant.annee,
        niveauClasse: d.classe.niveau,
      },
      { emitEvent: false },
    );
  }

  /** Charge le formulaire Semaine & Horaires depuis le store. */
  private chargerSemaineHoraires(): void {
    const d = this.donneesService.donnees();
    if (!d) return;
    const config = d.referentiels.configEmploiDuTemps;
    this.formSemaineHoraires.reset(
      { ...config, joursOuvres: [...config.joursOuvres] },
      { emitEvent: false },
    );
  }

  /** Charge le formulaire Préférences depuis le store et resynchronise son statut. */
  private chargerPreferences(): void {
    const d = this.donneesService.donnees();
    if (!d) return;
    this.formPreferences.reset(
      { delaiSauvegardeAutoMinutes: d.configuration.delaiSauvegardeAutoMinutes },
      { emitEvent: false },
    );
    this.statutPreferences.set(this.formPreferences.status);
  }

  /** Charge la sélection des domaines actifs depuis le store (rien de configuré = tout coché). */
  private chargerDomainesCompetences(): void {
    const d = this.donneesService.donnees();
    if (!d) return;
    const actifs = d.configuration.domainesActifs;
    if (!actifs || actifs.length === 0) {
      this.copieDomainesActifs.set(new Set(this.collecterIdsDomaines()));
    } else {
      this.copieDomainesActifs.set(new Set(actifs));
    }
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
    });
  }

  /**
   * Réconcilie les lignes d'une section liste avec les entrées enregistrées, dans leur ordre :
   * la ligne d'une entrée toujours présente (même `idOrigine`) est réutilisée et reçoit la
   * valeur enregistrée, une ligne est créée pour une entrée nouvelle, les autres lignes
   * (entrées disparues, lignes jamais enregistrées) sont retirées.
   * @param lignes Lignes de la section.
   * @param entrees Entrées enregistrées de la section.
   */
  private static reconcilierLignes<T extends { id: string }>(
    lignes: FormArray<FormGroup<LigneFormulaire<T>>>,
    entrees: readonly T[],
  ): void {
    const lignesParId = new Map<string, FormGroup<LigneFormulaire<T>>>();
    for (const ligne of lignes.controls) {
      const idOrigine = ligne.controls.idOrigine.value;
      if (idOrigine !== null) lignesParId.set(idOrigine, ligne);
    }
    const reconciliees = entrees.map((entree) => {
      const existante = lignesParId.get(entree.id);
      if (!existante)
        return EcranParametrageComponent.creerLigne(structuredClone(entree), entree.id);
      const valeur = structuredClone(entree) as Parameters<
        typeof existante.controls.valeur.reset
      >[0];
      existante.controls.valeur.reset(valeur, { emitEvent: false });
      return existante;
    });
    lignes.clear({ emitEvent: false });
    for (const ligne of reconciliees) lignes.push(ligne, { emitEvent: false });
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
    return !ObjetUtils.sontEgaux(this.formEnseignantClasse.getRawValue(), {
      prenom: d.enseignant.prenom,
      nom: d.enseignant.nom,
      annee: d.enseignant.annee,
      niveauClasse: d.classe.niveau,
    });
  }

  /**
   * @returns `true` si le formulaire Semaine & Horaires diffère du store.
   * La liste des jours ouvrés est triée avant comparaison : seul l'ensemble des jours
   * compte, pas leur ordre de saisie.
   */
  protected estSemaineHorairesModifie(): boolean {
    const d = this.donneesService.donnees();
    if (!d) return false;
    const store = d.referentiels.configEmploiDuTemps;
    const saisie = this.formSemaineHoraires.getRawValue();
    return !ObjetUtils.sontEgaux(
      { ...saisie, joursOuvres: [...saisie.joursOuvres].sort((a, b) => a.localeCompare(b)) },
      { ...store, joursOuvres: [...store.joursOuvres].sort((a, b) => a.localeCompare(b)) },
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
