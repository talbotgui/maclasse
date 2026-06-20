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
} from '@angular/core';
import type { InputSignal, OutputEmitterRef } from '@angular/core';
import { McAutoFocusDirective } from '../../../directives/mc-auto-focus.directive';
import { FormsModule } from '@angular/forms';
import { LIBELLES } from '../../../libelles';
import { McInputComponent } from '../../../composants/mc-input/mc-input.component';
import { McTextareaComponent } from '../../../composants/mc-textarea/mc-textarea.component';
import { McSelectComponent } from '../../../composants/mc-select/mc-select.component';
import { McRadioGroupComponent } from '../../../composants/mc-radio-group/mc-radio-group.component';
import { McChampHeureComponent } from '../../../composants/mc-champ-heure/mc-champ-heure.component';
import { McChipFiltreComponent } from '../../../composants/mc-chip-filtre/mc-chip-filtre.component';
import { McBoutonDestructionComponent } from '../../../composants/mc-bouton-destruction/mc-bouton-destruction.component';
import type { Eleve, AbsenceRecurrente, AbsencePonctuelle, Contact, CursusAnnee } from '../../../modeles/eleve.modele';
import type { Groupe, StatutEleve, TypeContact } from '../../../modeles/referentiels.modele';

/**
 * Formulaire d'édition d'un élève.
 * Reçoit un élève en entrée (null = création), émet les données à la sauvegarde.
 * Toutes les mutations locales passent par la copie `formEleve`.
 */
@Component({
  selector: 'fe-formulaire-eleve',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
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
  public readonly enregistrer: OutputEmitterRef<Eleve> = output<Eleve>();

  /** Émis quand l'utilisateur annule la saisie. */
  public readonly annuler: OutputEmitterRef<void> = output<void>();

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

  /** Options pour le jour des absences récurrentes. */
  protected readonly optionsJour = [
    { valeur: 'lundi', libelle: 'Lundi' },
    { valeur: 'mardi', libelle: 'Mardi' },
    { valeur: 'mercredi', libelle: 'Mercredi' },
    { valeur: 'jeudi', libelle: 'Jeudi' },
    { valeur: 'vendredi', libelle: 'Vendredi' },
  ];

  /** Copie locale mutable de l'élève en cours de saisie. */
  protected formEleve: Eleve = this.creerEleveVide();

  /** Charge la copie locale à chaque changement de l'élève reçu en entrée. */
  public constructor() {
    effect(() => {
      const e = this.eleve();
      this.formEleve = e ? structuredClone(e) : this.creerEleveVide();
      this.cdr.markForCheck();
    });
  }

  /**
   * Retourne les options de statuts élève au format attendu par `mc-select`.
   * @returns Options { valeur, libelle }.
   */
  protected get optionsStatut(): { valeur: string; libelle: string }[] {
    return this.statutsEleve().map(s => ({ valeur: s.id, libelle: s.libelle }));
  }

  /**
   * Retourne les options de types de contact au format attendu par `mc-select`.
   * @returns Options { valeur, libelle }.
   */
  protected get optionsTypeContact(): { valeur: string; libelle: string }[] {
    return this.typesContact().map(t => ({ valeur: t.id, libelle: t.libelle }));
  }

  /**
   * Bascule l'appartenance d'un groupe pour l'élève en cours d'édition.
   * @param id Identifiant du groupe.
   * @param actif Nouvel état du chip.
   */
  protected basculerGroupe(id: string, actif: boolean): void {
    if (actif && !this.formEleve.groupes.includes(id)) {
      this.formEleve.groupes = [...this.formEleve.groupes, id];
    } else if (!actif) {
      this.formEleve.groupes = this.formEleve.groupes.filter(g => g !== id);
    }
  }

  /** Ajoute un contact vide à la fin de la liste. */
  protected ajouterContact(): void {
    this.formEleve.contacts = [
      ...this.formEleve.contacts,
      { type: '', nom: '', email: '', telephone: '', adressePostale: '' },
    ];
  }

  /**
   * Supprime un contact à l'index donné.
   * @param index Index du contact à supprimer.
   */
  protected supprimerContact(index: number): void {
    this.formEleve.contacts = this.formEleve.contacts.filter((_, i) => i !== index);
  }

  /** Ajoute une absence récurrente vide. */
  protected ajouterAbsenceRecurrente(): void {
    const nouvelleAbsence: AbsenceRecurrente = {
      id: crypto.randomUUID(),
      libelle: '',
      jour: 'lundi',
      heureDebut: '',
      heureFin: '',
      paritesSemaine: 'lesDeux',
    };
    this.formEleve.absencesRecurrentes = [...this.formEleve.absencesRecurrentes, nouvelleAbsence];
  }

  /**
   * Supprime une absence récurrente à l'index donné.
   * @param index Index à supprimer.
   */
  protected supprimerAbsenceRecurrente(index: number): void {
    this.formEleve.absencesRecurrentes = this.formEleve.absencesRecurrentes.filter(
      (_, i) => i !== index,
    );
  }

  /** Ajoute une absence ponctuelle vide. */
  protected ajouterAbsencePonctuelle(): void {
    const nouvelleAbsence: AbsencePonctuelle = {
      id: crypto.randomUUID(),
      date: '',
      justification: '',
    };
    this.formEleve.absencesPonctuelles = [...this.formEleve.absencesPonctuelles, nouvelleAbsence];
  }

  /**
   * Supprime une absence ponctuelle à l'index donné.
   * @param index Index à supprimer.
   */
  protected supprimerAbsencePonctuelle(index: number): void {
    this.formEleve.absencesPonctuelles = this.formEleve.absencesPonctuelles.filter(
      (_, i) => i !== index,
    );
  }

  /** Ajoute une entrée de cursus vide. */
  protected ajouterCursus(): void {
    const nouvelleAnnee: CursusAnnee = {
      annee: new Date().getFullYear(),
      niveau: '',
      etablissement: '',
      accompagnement: '',
    };
    this.formEleve.cursus = [...this.formEleve.cursus, nouvelleAnnee];
  }

  /**
   * Supprime une entrée de cursus à l'index donné.
   * @param index Index à supprimer.
   */
  protected supprimerCursus(index: number): void {
    this.formEleve.cursus = this.formEleve.cursus.filter((_, i) => i !== index);
  }

  /** Émet l'élève modifié au parent pour persistence. */
  protected onEnregistrer(): void {
    this.enregistrer.emit(structuredClone(this.formEleve));
  }

  /** Crée un objet Eleve vide pour les créations. */
  private creerEleveVide(): Eleve {
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
