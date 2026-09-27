/**
 * Sous-composant formulaire d'édition et de création d'un élève.
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import type { InputSignal, OutputEmitterRef, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { McAutoFocusDirective } from '../../../directives/mc-auto-focus.directive';
import { LIBELLES } from '../../../libelles';
import { FormulaireUtils } from '../../../utilitaires/formulaire.utils';
import { McInputComponent } from '../../../composants/mc-input/mc-input.component';
import { McTextareaComponent } from '../../../composants/mc-textarea/mc-textarea.component';
import { McSelectComponent } from '../../../composants/mc-select/mc-select.component';
import { McRadioGroupComponent } from '../../../composants/mc-radio-group/mc-radio-group.component';
import { McChampHeureComponent } from '../../../composants/mc-champ-heure/mc-champ-heure.component';
import { McChipFiltreComponent } from '../../../composants/mc-chip-filtre/mc-chip-filtre.component';
import { McBoutonDestructionComponent } from '../../../composants/mc-bouton-destruction/mc-bouton-destruction.component';
import type {
  Eleve,
  AbsenceRecurrente,
  AbsencePonctuelle,
  Contact,
  CursusAnnee,
  Sexe,
} from '../../../modeles/eleve.modele';
import type { FrequenceSemaine, JourSemaine } from '../../../modeles/emploi-du-temps.modele';
import type { OptionFormulaire } from '../../../modeles/composants.modele';
import type { Groupe, StatutEleve, TypeContact } from '../../../modeles/referentiels.modele';

/** Structure typée du formulaire d'un contact. */
interface FormulaireContact {
  /** Référence vers un `TypeContact`. */
  type: FormControl<string>;
  /** Nom complet du contact. */
  nom: FormControl<string>;
  /** Adresse électronique. */
  email: FormControl<string>;
  /** Numéro de téléphone. */
  telephone: FormControl<string>;
  /** Adresse postale. */
  adressePostale: FormControl<string>;
}

/** Structure typée du formulaire d'une absence récurrente. */
interface FormulaireAbsenceRecurrente {
  /** Identifiant de l'absence (non affiché). */
  id: FormControl<string>;
  /** Libellé descriptif. */
  libelle: FormControl<string>;
  /** Jour de la semaine. */
  jour: FormControl<JourSemaine>;
  /** Heure de début `HH:MM`. */
  heureDebut: FormControl<string>;
  /** Heure de fin `HH:MM`. */
  heureFin: FormControl<string>;
  /** Parité des semaines concernées. */
  paritesSemaine: FormControl<FrequenceSemaine>;
}

/** Structure typée du formulaire d'une absence ponctuelle. */
interface FormulaireAbsencePonctuelle {
  /** Identifiant de l'absence (non affiché). */
  id: FormControl<string>;
  /** Date ISO de l'absence. */
  date: FormControl<string>;
  /** Justification libre. */
  justification: FormControl<string>;
}

/** Structure typée du formulaire d'une année de cursus. */
interface FormulaireCursus {
  /** Identifiant de l'entrée (non affiché). */
  id: FormControl<string>;
  /** Année scolaire ; chaîne (vide ou non numérique) tant que la saisie n'est pas un nombre. */
  annee: FormControl<number | string>;
  /** Niveau suivi. */
  niveau: FormControl<string>;
  /** Établissement fréquenté. */
  etablissement: FormControl<string>;
  /** Dispositif ou accompagnement. */
  accompagnement: FormControl<string>;
}

/** Structure typée du formulaire d'un élève. */
interface FormulaireEleve {
  /** Prénom (obligatoire). */
  prenom: FormControl<string>;
  /** Nom (obligatoire). */
  nom: FormControl<string>;
  /** Sexe déclaré. */
  sexe: FormControl<Sexe>;
  /** Niveau scolaire actuel. */
  niveau: FormControl<string>;
  /** Groupes de l'élève, pilotés par les chips. */
  groupes: FormControl<string[]>;
  /** Date de naissance ISO. */
  dateNaissance: FormControl<string>;
  /** Date d'arrivée ISO. */
  dateArrivee: FormControl<string>;
  /** Référence vers un `StatutEleve`. */
  statut: FormControl<string>;
  /** Bilans. */
  bilans: FormControl<string>;
  /** Accueil. */
  accueil: FormControl<string>;
  /** Inclusion, chaîne vide si non renseignée. */
  inclusion: FormControl<string>;
  /** Contacts. */
  contacts: FormArray<FormGroup<FormulaireContact>>;
  /** Absences récurrentes. */
  absencesRecurrentes: FormArray<FormGroup<FormulaireAbsenceRecurrente>>;
  /** Absences ponctuelles. */
  absencesPonctuelles: FormArray<FormGroup<FormulaireAbsencePonctuelle>>;
  /** Cursus. */
  cursus: FormArray<FormGroup<FormulaireCursus>>;
  /** Notes sur le droit à l'image. */
  notesDroitImage: FormControl<string>;
  /** Notes sur l'autorisation de baignade. */
  notesAutorisationBaignade: FormControl<string>;
  /** Notes PPA, chaîne vide si non renseignées. */
  notesPPA: FormControl<string>;
  /** Notes ESS, chaîne vide si non renseignées. */
  notesESS: FormControl<string>;
}

/**
 * Formulaire d'édition d'un élève.
 * Reçoit un élève en entrée (null = création), émet les données à la sauvegarde.
 */
@Component({
  selector: 'fe-formulaire-eleve',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    McAutoFocusDirective,
    McInputComponent,
    McTextareaComponent,
    McSelectComponent,
    McRadioGroupComponent,
    McChampHeureComponent,
    McChipFiltreComponent,
    McBoutonDestructionComponent,
  ],
  templateUrl: './fe-formulaire-eleve.component.html',
  styleUrl: './fe-formulaire-eleve.component.scss',
})
export class FeFormulaireEleveComponent {
  /** Constante centralisée des libellés. */
  protected readonly LIBELLES = LIBELLES;

  /** Détection de changement pour mise à jour manuelle en mode OnPush. */
  private readonly cdr = inject(ChangeDetectorRef);

  /** Demande le focus sur le premier champ à l'apparition du formulaire. */
  public readonly focusDemande: InputSignal<boolean> = input(false);

  /** Élève à éditer, ou `null` pour une création. */
  public readonly eleve: InputSignal<Eleve | null> = input<Eleve | null>(null);

  /** Groupes du référentiel pour les chips de sélection. */
  public readonly groupes: InputSignal<Groupe[]> = input<Groupe[]>([]);

  /** Statuts élève pour le sélecteur. */
  public readonly statutsEleve: InputSignal<StatutEleve[]> = input<StatutEleve[]>([]);

  /** Types de contact pour le sélecteur. */
  public readonly typesContact: InputSignal<TypeContact[]> = input<TypeContact[]>([]);

  /** Émis avec l'élève modifié (ou créé) à la validation du formulaire. */
  protected readonly enregistrer: OutputEmitterRef<Eleve> = output<Eleve>();

  /** Émis quand l'utilisateur annule la saisie. */
  protected readonly annuler: OutputEmitterRef<void> = output<void>();

  /** Options pour le sélecteur de sexe. */
  protected readonly optionsSexe = [
    { valeur: 'M', libelle: LIBELLES.eleve.labelSexeM },
    { valeur: 'F', libelle: LIBELLES.eleve.labelSexeF },
  ];

  /** Options pour la fréquence des absences récurrentes. */
  protected readonly optionsFrequence = [
    { valeur: 'paire', libelle: LIBELLES.edt.frequencePaire },
    { valeur: 'impaire', libelle: LIBELLES.edt.frequenceImpaire },
    { valeur: 'lesDeux', libelle: LIBELLES.edt.frequenceLesDeux },
  ];

  /** Options pour le jour des absences récurrentes, dans l'ordre des jours de `LIBELLES`. */
  protected readonly optionsJour: OptionFormulaire[] = Object.entries(
    LIBELLES.edt.joursLibelles,
  ).map(([valeur, libelle]) => ({ valeur, libelle }));

  /** Formulaire réactif de l'élève en cours de saisie. */
  protected readonly form: FormGroup<FormulaireEleve> = new FormGroup<FormulaireEleve>({
    prenom: new FormControl('', {
      nonNullable: true,
      validators: FormulaireUtils.validerTexteNonVide,
    }),
    nom: new FormControl('', {
      nonNullable: true,
      validators: FormulaireUtils.validerTexteNonVide,
    }),
    sexe: new FormControl<Sexe>('M', { nonNullable: true }),
    niveau: new FormControl('', { nonNullable: true }),
    groupes: new FormControl<string[]>([], { nonNullable: true }),
    dateNaissance: new FormControl('', { nonNullable: true }),
    dateArrivee: new FormControl('', { nonNullable: true }),
    statut: new FormControl('', { nonNullable: true }),
    bilans: new FormControl('', { nonNullable: true }),
    accueil: new FormControl('', { nonNullable: true }),
    inclusion: new FormControl('', { nonNullable: true }),
    contacts: new FormArray<FormGroup<FormulaireContact>>([]),
    absencesRecurrentes: new FormArray<FormGroup<FormulaireAbsenceRecurrente>>([]),
    absencesPonctuelles: new FormArray<FormGroup<FormulaireAbsencePonctuelle>>([]),
    cursus: new FormArray<FormGroup<FormulaireCursus>>([]),
    notesDroitImage: new FormControl('', { nonNullable: true }),
    notesAutorisationBaignade: new FormControl('', { nonNullable: true }),
    notesPPA: new FormControl('', { nonNullable: true }),
    notesESS: new FormControl('', { nonNullable: true }),
  });

  /** Identifiant de l'élève édité (ou créé), non modifiable par le formulaire et recopié à l'émission. */
  private idEleve: string = crypto.randomUUID();

  /**
   * Années de cursus enregistrées, par identifiant d'entrée : valeur émise pour une entrée
   * dont le champ année ne contient pas un nombre (champ vidé).
   */
  private anneesCursusOrigine = new Map<string, number>();

  /**
   * Statut du formulaire, suivi via `statusChanges` et resynchronisé après chaque chargement
   * (un `reset` sans émission ne déclenche pas `statusChanges`).
   */
  private readonly statutForm: WritableSignal<string> = signal(this.form.status);

  /**
   * Identifiant de l'élève actuellement chargé dans le formulaire (`null` en création),
   * `undefined` tant qu'aucun chargement n'a eu lieu. Permet de ne recharger le formulaire
   * que lors d'un changement réel d'élève édité, jamais lors d'une simple nouvelle
   * référence de `eleve()` (ex. UNDO/REDO global sans rapport avec cet élève).
   */
  private idFormulaireCharge: string | null | undefined = undefined;

  /** Index du contact venant d'être ajouté, à focaliser (`null` si aucun). */
  protected readonly indexAFocaliserContact: WritableSignal<number | null> = signal(null);

  /** Index de l'absence récurrente venant d'être ajoutée, à focaliser (`null` si aucun). */
  protected readonly indexAFocaliserAbsRec: WritableSignal<number | null> = signal(null);

  /** Index de l'absence ponctuelle venant d'être ajoutée, à focaliser (`null` si aucun). */
  protected readonly indexAFocaliserAbsPonct: WritableSignal<number | null> = signal(null);

  /** Index de l'entrée de cursus venant d'être ajoutée, à focaliser (`null` si aucun). */
  protected readonly indexAFocaliserCursus: WritableSignal<number | null> = signal(null);

  /**
   * Charge le formulaire lors d'un changement réel d'élève édité.
   * Ignore les changements de référence de `eleve()` qui ne correspondent pas à un
   * changement d'identité (ex. UNDO/REDO global), pour ne pas écraser la saisie en cours.
   */
  public constructor() {
    this.form.statusChanges
      .pipe(takeUntilDestroyed())
      .subscribe((statut) => this.statutForm.set(statut));
    effect(() => {
      const e = this.eleve();
      const id = e?.id ?? null;
      if (id === this.idFormulaireCharge) return;
      this.idFormulaireCharge = id;
      this.chargerEleve(e ?? FeFormulaireEleveComponent.creerEleveVide());
    });
  }

  /**
   * Retourne les options de statuts élève au format attendu par `mc-select`.
   * @returns Options { valeur, libelle }.
   */
  protected get optionsStatut(): { valeur: string; libelle: string }[] {
    return this.statutsEleve().map((s) => ({ valeur: s.id, libelle: s.libelle }));
  }

  /**
   * Retourne les options de types de contact au format attendu par `mc-select`.
   * @returns Options { valeur, libelle }.
   */
  protected get optionsTypeContact(): { valeur: string; libelle: string }[] {
    return this.typesContact().map((t) => ({ valeur: t.id, libelle: t.libelle }));
  }

  /**
   * Accès typé au `FormArray` des contacts, pour le template.
   * @returns Le `FormArray` des contacts.
   */
  protected get contactsFormArray(): FormArray<FormGroup<FormulaireContact>> {
    return this.form.controls.contacts;
  }

  /**
   * Accès typé au `FormArray` des absences récurrentes, pour le template.
   * @returns Le `FormArray` des absences récurrentes.
   */
  protected get absencesRecurrentesFormArray(): FormArray<FormGroup<FormulaireAbsenceRecurrente>> {
    return this.form.controls.absencesRecurrentes;
  }

  /**
   * Accès typé au `FormArray` des absences ponctuelles, pour le template.
   * @returns Le `FormArray` des absences ponctuelles.
   */
  protected get absencesPonctuellesFormArray(): FormArray<FormGroup<FormulaireAbsencePonctuelle>> {
    return this.form.controls.absencesPonctuelles;
  }

  /**
   * Accès typé au `FormArray` du cursus, pour le template.
   * @returns Le `FormArray` du cursus.
   */
  protected get cursusFormArray(): FormArray<FormGroup<FormulaireCursus>> {
    return this.form.controls.cursus;
  }

  /**
   * Indique si l'élève en cours d'édition appartient à un groupe.
   * @param id Identifiant du groupe.
   * @returns `true` si le groupe est sélectionné.
   */
  protected estGroupeSelectionne(id: string): boolean {
    return this.form.controls.groupes.value.includes(id);
  }

  /**
   * Ajoute l'élève en cours d'édition à un groupe.
   * @param id Identifiant du groupe.
   */
  protected ajouterGroupe(id: string): void {
    const controle = this.form.controls.groupes;
    if (!controle.value.includes(id)) {
      controle.setValue([...controle.value, id]);
    }
  }

  /**
   * Retire l'élève d'un groupe.
   * @param id Identifiant du groupe.
   */
  protected retirerGroupe(id: string): void {
    const controle = this.form.controls.groupes;
    controle.setValue(controle.value.filter((g) => g !== id));
  }

  /** Ajoute un contact vide à la fin de la liste et demande le focus dessus. */
  protected ajouterContact(): void {
    this.contactsFormArray.push(
      FeFormulaireEleveComponent.creerGroupeContact({
        type: '',
        nom: '',
        email: '',
        telephone: '',
        adressePostale: '',
      }),
    );
    this.indexAFocaliserContact.set(this.contactsFormArray.length - 1);
  }

  /**
   * Supprime un contact à l'index donné.
   * @param index Index du contact à supprimer.
   */
  protected supprimerContact(index: number): void {
    this.contactsFormArray.removeAt(index);
    this.indexAFocaliserContact.set(null);
  }

  /** Ajoute une absence récurrente vide et demande le focus dessus. */
  protected ajouterAbsenceRecurrente(): void {
    this.absencesRecurrentesFormArray.push(
      FeFormulaireEleveComponent.creerGroupeAbsenceRecurrente({
        id: crypto.randomUUID(),
        libelle: '',
        jour: 'lundi',
        heureDebut: '',
        heureFin: '',
        paritesSemaine: 'lesDeux',
      }),
    );
    this.indexAFocaliserAbsRec.set(this.absencesRecurrentesFormArray.length - 1);
  }

  /**
   * Supprime une absence récurrente à l'index donné.
   * @param index Index à supprimer.
   */
  protected supprimerAbsenceRecurrente(index: number): void {
    this.absencesRecurrentesFormArray.removeAt(index);
    this.indexAFocaliserAbsRec.set(null);
  }

  /** Ajoute une absence ponctuelle vide et demande le focus dessus. */
  protected ajouterAbsencePonctuelle(): void {
    this.absencesPonctuellesFormArray.push(
      FeFormulaireEleveComponent.creerGroupeAbsencePonctuelle({
        id: crypto.randomUUID(),
        date: '',
        justification: '',
      }),
    );
    this.indexAFocaliserAbsPonct.set(this.absencesPonctuellesFormArray.length - 1);
  }

  /**
   * Supprime une absence ponctuelle à l'index donné.
   * @param index Index à supprimer.
   */
  protected supprimerAbsencePonctuelle(index: number): void {
    this.absencesPonctuellesFormArray.removeAt(index);
    this.indexAFocaliserAbsPonct.set(null);
  }

  /** Ajoute une entrée de cursus sur l'année courante et demande le focus dessus. */
  protected ajouterCursus(): void {
    const nouvelleAnnee: CursusAnnee = {
      id: crypto.randomUUID(),
      annee: new Date().getFullYear(),
      niveau: '',
      etablissement: '',
      accompagnement: '',
    };
    this.anneesCursusOrigine.set(nouvelleAnnee.id, nouvelleAnnee.annee);
    this.cursusFormArray.push(FeFormulaireEleveComponent.creerGroupeCursus(nouvelleAnnee));
    this.indexAFocaliserCursus.set(this.cursusFormArray.length - 1);
  }

  /**
   * Supprime une entrée de cursus à l'index donné.
   * @param index Index à supprimer.
   */
  protected supprimerCursus(index: number): void {
    this.cursusFormArray.removeAt(index);
    this.indexAFocaliserCursus.set(null);
  }

  /**
   * Indique si le formulaire peut être enregistré : le prénom et le nom sont obligatoires.
   * @returns `true` si le prénom et le nom contiennent au moins un caractère non blanc.
   */
  protected estFormulaireValide(): boolean {
    return this.statutForm() === 'VALID';
  }

  /** Émet l'élève saisi au parent pour persistance. */
  protected onEnregistrer(): void {
    if (this.form.invalid) return;
    const valeurs = this.form.getRawValue();
    this.enregistrer.emit({
      id: this.idEleve,
      prenom: valeurs.prenom,
      nom: valeurs.nom,
      sexe: valeurs.sexe,
      niveau: valeurs.niveau,
      groupes: [...valeurs.groupes],
      dateNaissance: valeurs.dateNaissance,
      dateArrivee: valeurs.dateArrivee,
      statut: valeurs.statut,
      bilans: valeurs.bilans,
      accueil: valeurs.accueil,
      inclusion: valeurs.inclusion || null,
      contacts: valeurs.contacts,
      absencesRecurrentes: valeurs.absencesRecurrentes,
      absencesPonctuelles: valeurs.absencesPonctuelles,
      cursus: valeurs.cursus.map((entree) => ({
        ...entree,
        annee:
          typeof entree.annee === 'number'
            ? entree.annee
            : (this.anneesCursusOrigine.get(entree.id) ?? new Date().getFullYear()),
      })),
      notesDroitImage: valeurs.notesDroitImage,
      notesAutorisationBaignade: valeurs.notesAutorisationBaignade,
      notesPPA: valeurs.notesPPA || null,
      notesESS: valeurs.notesESS || null,
    });
  }

  /** Émet l'annulation de la saisie au parent. */
  protected onAnnuler(): void {
    this.annuler.emit();
  }

  /**
   * Charge un élève dans le formulaire : champs simples par `reset`, puis chaque `FormArray`
   * vidé et reconstruit (un `reset` ne redimensionne pas un `FormArray`).
   * @param eleve Élève à charger (élève vide en création).
   */
  private chargerEleve(eleve: Eleve): void {
    this.idEleve = eleve.id;
    this.anneesCursusOrigine = new Map(eleve.cursus.map((c) => [c.id, c.annee]));
    const sansEmission = { emitEvent: false };
    this.contactsFormArray.clear(sansEmission);
    for (const contact of eleve.contacts) {
      this.contactsFormArray.push(
        FeFormulaireEleveComponent.creerGroupeContact(contact),
        sansEmission,
      );
    }
    this.absencesRecurrentesFormArray.clear(sansEmission);
    for (const absence of eleve.absencesRecurrentes) {
      this.absencesRecurrentesFormArray.push(
        FeFormulaireEleveComponent.creerGroupeAbsenceRecurrente(absence),
        sansEmission,
      );
    }
    this.absencesPonctuellesFormArray.clear(sansEmission);
    for (const absence of eleve.absencesPonctuelles) {
      this.absencesPonctuellesFormArray.push(
        FeFormulaireEleveComponent.creerGroupeAbsencePonctuelle(absence),
        sansEmission,
      );
    }
    this.cursusFormArray.clear(sansEmission);
    for (const entree of eleve.cursus) {
      this.cursusFormArray.push(FeFormulaireEleveComponent.creerGroupeCursus(entree), sansEmission);
    }
    const c = this.form.controls;
    c.prenom.reset(eleve.prenom, sansEmission);
    c.nom.reset(eleve.nom, sansEmission);
    c.sexe.reset(eleve.sexe, sansEmission);
    c.niveau.reset(eleve.niveau, sansEmission);
    c.groupes.reset([...eleve.groupes], sansEmission);
    c.dateNaissance.reset(eleve.dateNaissance, sansEmission);
    c.dateArrivee.reset(eleve.dateArrivee, sansEmission);
    c.statut.reset(eleve.statut, sansEmission);
    c.bilans.reset(eleve.bilans, sansEmission);
    c.accueil.reset(eleve.accueil, sansEmission);
    c.inclusion.reset(eleve.inclusion ?? '', sansEmission);
    c.notesDroitImage.reset(eleve.notesDroitImage, sansEmission);
    c.notesAutorisationBaignade.reset(eleve.notesAutorisationBaignade, sansEmission);
    c.notesPPA.reset(eleve.notesPPA ?? '', sansEmission);
    c.notesESS.reset(eleve.notesESS ?? '', sansEmission);
    this.form.updateValueAndValidity(sansEmission);
    this.statutForm.set(this.form.status);
    this.indexAFocaliserContact.set(null);
    this.indexAFocaliserAbsRec.set(null);
    this.indexAFocaliserAbsPonct.set(null);
    this.indexAFocaliserCursus.set(null);
    this.cdr.markForCheck();
  }

  /**
   * Crée le groupe de contrôles d'un contact.
   * @param contact Contact à représenter.
   * @returns Groupe de contrôles initialisé.
   */
  private static creerGroupeContact(contact: Contact): FormGroup<FormulaireContact> {
    return new FormGroup<FormulaireContact>({
      type: new FormControl(contact.type, { nonNullable: true }),
      nom: new FormControl(contact.nom, { nonNullable: true }),
      email: new FormControl(contact.email, { nonNullable: true }),
      telephone: new FormControl(contact.telephone, { nonNullable: true }),
      adressePostale: new FormControl(contact.adressePostale, { nonNullable: true }),
    });
  }

  /**
   * Crée le groupe de contrôles d'une absence récurrente.
   * @param absence Absence à représenter.
   * @returns Groupe de contrôles initialisé.
   */
  private static creerGroupeAbsenceRecurrente(
    absence: AbsenceRecurrente,
  ): FormGroup<FormulaireAbsenceRecurrente> {
    return new FormGroup<FormulaireAbsenceRecurrente>({
      id: new FormControl(absence.id, { nonNullable: true }),
      libelle: new FormControl(absence.libelle, { nonNullable: true }),
      jour: new FormControl<JourSemaine>(absence.jour, { nonNullable: true }),
      heureDebut: new FormControl(absence.heureDebut, { nonNullable: true }),
      heureFin: new FormControl(absence.heureFin, { nonNullable: true }),
      paritesSemaine: new FormControl<FrequenceSemaine>(absence.paritesSemaine, {
        nonNullable: true,
      }),
    });
  }

  /**
   * Crée le groupe de contrôles d'une absence ponctuelle.
   * @param absence Absence à représenter.
   * @returns Groupe de contrôles initialisé.
   */
  private static creerGroupeAbsencePonctuelle(
    absence: AbsencePonctuelle,
  ): FormGroup<FormulaireAbsencePonctuelle> {
    return new FormGroup<FormulaireAbsencePonctuelle>({
      id: new FormControl(absence.id, { nonNullable: true }),
      date: new FormControl(absence.date, { nonNullable: true }),
      justification: new FormControl(absence.justification, { nonNullable: true }),
    });
  }

  /**
   * Crée le groupe de contrôles d'une année de cursus.
   * @param entree Année de cursus à représenter.
   * @returns Groupe de contrôles initialisé.
   */
  private static creerGroupeCursus(entree: CursusAnnee): FormGroup<FormulaireCursus> {
    return new FormGroup<FormulaireCursus>({
      id: new FormControl(entree.id, { nonNullable: true }),
      annee: new FormControl<number | string>(entree.annee, { nonNullable: true }),
      niveau: new FormControl(entree.niveau, { nonNullable: true }),
      etablissement: new FormControl(entree.etablissement, { nonNullable: true }),
      accompagnement: new FormControl(entree.accompagnement, { nonNullable: true }),
    });
  }

  /**
   * Crée un élève vide pour les créations.
   * @returns Élève vide avec un nouvel identifiant.
   */
  private static creerEleveVide(): Eleve {
    return {
      id: crypto.randomUUID(),
      prenom: '',
      nom: '',
      sexe: 'M',
      niveau: '',
      groupes: [],
      dateNaissance: '',
      dateArrivee: '',
      statut: '',
      bilans: '',
      accueil: '',
      inclusion: null,
      contacts: [],
      absencesRecurrentes: [],
      absencesPonctuelles: [],
      cursus: [],
      notesDroitImage: '',
      notesAutorisationBaignade: '',
      notesPPA: null,
      notesESS: null,
    };
  }
}
