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
import { FormsModule } from '@angular/forms';
import { LIBELLES } from '../../libelles';
import { DonneesService } from '../../services/avecEtat/donnees.service';
import { ReferentielService } from '../../services/sansEtat/referentiel.service';
import { CommandeRemplacement } from '../../commandes/commande-par-index';
import { McInputComponent } from '../../composants/mc-input/mc-input.component';
import { McChampHeureComponent } from '../../composants/mc-champ-heure/mc-champ-heure.component';
import { McChipFiltreComponent } from '../../composants/mc-chip-filtre/mc-chip-filtre.component';
import { McBoutonDestructionComponent } from '../../composants/mc-bouton-destruction/mc-bouton-destruction.component';
import { McBadgeStatutComponent } from '../../composants/mc-badge-statut/mc-badge-statut.component';
import type { Enseignant } from '../../modeles/donnees-application.modele';
import type {
  Competence,
  FrequenceAbsence,
  Groupe,
  JourFerie,
  Periode,
  RaisonAbsence,
  StatutAcquisition,
  StatutEleve,
  TypeContact,
  ConfigEmploiDuTemps,
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
  | 'raisonsAbsence'
  | 'frequencesAbsence'
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

/**
 * Écran de paramétrage de l'application.
 * Deux colonnes : navigation par section à gauche, formulaire à droite.
 */
@Component({
  selector: 'ecran-parametrage',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
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
    { id: 'raisonsAbsence', libelle: LIBELLES.parametrage.sections.raisonsAbsence },
    { id: 'frequencesAbsence', libelle: LIBELLES.parametrage.sections.frequencesAbsence },
    { id: 'joursFeries', libelle: LIBELLES.parametrage.sections.joursFeries },
    { id: 'preferences', libelle: LIBELLES.parametrage.sections.preferences },
    { id: 'domainesCompetences', libelle: LIBELLES.parametrage.sections.domainesCompetences },
  ];

  /** Section actuellement affichée. */
  protected readonly sectionActive = signal<SectionId>('enseignantClasse');

  /** Copie locale du formulaire Enseignant & Classe. */
  protected formEnseignantClasse = {
    prenom: '',
    nom: '',
    annee: '',
    niveauClasse: '',
  };

  /** Copie locale du formulaire Semaine & Horaires. */
  protected formSemaineHoraires: ConfigEmploiDuTemps = {
    joursOuvres: [],
    heureDebutJournee: '',
    heureFinJournee: '',
  };

  /** Copie locale du formulaire Préférences. */
  protected formPreferences = { delaiSauvegardeAutoMinutes: 2 };

  /** Copies locales des listes éditables inline. */
  protected copiePeriodes = signal<Periode[]>([]);
  /** Copies locales des groupes. */
  protected copieGroupes = signal<Groupe[]>([]);
  /** Copies locales du barème. */
  protected copieBareme = signal<StatutAcquisition[]>([]);
  /** Copies locales des statuts élève. */
  protected copieStatutsEleve = signal<StatutEleve[]>([]);
  /** Copies locales des types de contact. */
  protected copieTypesContact = signal<TypeContact[]>([]);
  /** Copies locales des raisons d'absence. */
  protected copieRaisonsAbsence = signal<RaisonAbsence[]>([]);
  /** Copies locales des fréquences d'absence. */
  protected copieFrequencesAbsence = signal<FrequenceAbsence[]>([]);
  /** Copies locales des jours fériés. */
  protected copieJoursFeries = signal<JourFerie[]>([]);

  /**
   * Ensemble des IDs de domaines (N1) et sous-domaines (N2) actifs dans le formulaire.
   * Vide = tous actifs (comportement par défaut).
   */
  protected copieDomainesActifs = signal<Set<string>>(new Set());

  /** Tous les domaines N1 de l'arbre complet (non filtré), pour affichage dans le paramétrage. */
  protected readonly tousDomaines = computed<Competence[]>(
    () => this.donneesService.donnees()?.referentiels.competences ?? [],
  );

  /** Réinitialise les copies locales à chaque changement de section ou de données. */
  public constructor() {
    effect(() => {
      const section = this.sectionActive();
      const d = this.donneesService.donnees();
      if (!d) return;

      switch (section) {
        case 'enseignantClasse':
          this.formEnseignantClasse = {
            prenom: d.enseignant.prenom,
            nom: d.enseignant.nom,
            annee: d.enseignant.annee,
            niveauClasse: d.classe.niveau,
          };
          break;
        case 'periodes':
          this.copiePeriodes.set(structuredClone(d.referentiels.periodes));
          break;
        case 'semaineHoraires':
          this.formSemaineHoraires = structuredClone(d.referentiels.configEmploiDuTemps);
          break;
        case 'groupes':
          this.copieGroupes.set(structuredClone(d.referentiels.groupes));
          break;
        case 'bareme':
          this.copieBareme.set(structuredClone(d.referentiels.statutsAcquisition));
          break;
        case 'statutsEleve':
          this.copieStatutsEleve.set(structuredClone(d.referentiels.statutsEleve));
          break;
        case 'typesContact':
          this.copieTypesContact.set(structuredClone(d.referentiels.typesContact));
          break;
        case 'raisonsAbsence':
          this.copieRaisonsAbsence.set(structuredClone(d.referentiels.raisonsAbsence));
          break;
        case 'frequencesAbsence':
          this.copieFrequencesAbsence.set(
            structuredClone(d.referentiels.frequencesAbsence),
          );
          break;
        case 'joursFeries':
          this.copieJoursFeries.set(structuredClone(d.referentiels.joursFeries));
          break;
        case 'preferences':
          this.formPreferences = {
            delaiSauvegardeAutoMinutes: d.configuration.delaiSauvegardeAutoMinutes,
          };
          break;
        case 'domainesCompetences': {
          const actifs = d.configuration.domainesActifs;
          if (!actifs || actifs.length === 0) {
            // Rien de configuré → tout cocher
            const tousIds = new Set<string>();
            d.referentiels.competences.forEach(n1 => {
              tousIds.add(n1.id);
              n1.enfants?.forEach(n2 => tousIds.add(n2.id));
            });
            this.copieDomainesActifs.set(tousIds);
          } else {
            this.copieDomainesActifs.set(new Set(actifs));
          }
          break;
        }
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
    const ancienEnseignant = d.enseignant;
    const nouvelEnseignant: Enseignant = {
      prenom: this.formEnseignantClasse.prenom,
      nom: this.formEnseignantClasse.nom,
      annee: this.formEnseignantClasse.annee,
    };
    this.donneesService.executer(
      new CommandeRemplacement<Enseignant>(
        (data, v) => {
          data.enseignant = v;
        },
        ancienEnseignant,
        nouvelEnseignant,
      ),
    );
    const ancienneClasse = d.classe;
    this.donneesService.executer(
      new CommandeRemplacement<string>(
        (data, v) => {
          data.classe.niveau = v;
        },
        ancienneClasse.niveau,
        this.formEnseignantClasse.niveauClasse,
      ),
    );
  }

  /** Réinitialise le formulaire Enseignant & Classe depuis le store. */
  protected annulerEnseignantClasse(): void {
    const d = this.donneesService.donnees();
    if (!d) return;
    this.formEnseignantClasse = {
      prenom: d.enseignant.prenom,
      nom: d.enseignant.nom,
      annee: d.enseignant.annee,
      niveauClasse: d.classe.niveau,
    };
    this.cdr.markForCheck();
  }

  /** Enregistre la configuration Semaine & Horaires. */
  protected enregistrerSemaineHoraires(): void {
    const d = this.donneesService.donnees();
    if (!d) return;
    this.referentielService.modifierConfigEmploiDuTemps(
      d.referentiels.configEmploiDuTemps,
      structuredClone(this.formSemaineHoraires),
    );
  }

  /** Réinitialise le formulaire Semaine & Horaires depuis le store. */
  protected annulerSemaineHoraires(): void {
    const d = this.donneesService.donnees();
    if (!d) return;
    this.formSemaineHoraires = structuredClone(d.referentiels.configEmploiDuTemps);
    this.cdr.markForCheck();
  }

  /**
   * Bascule un jour dans la liste des jours ouvrés.
   * @param jour Jour à ajouter ou retirer.
   * @param actif `true` si le chip est actif après le clic.
   */
  protected basculerJourOuvre(jour: JourSemaine, actif: boolean): void {
    if (actif) {
      const joursOrdonnes = this.JOURS_SEMAINE.filter(
        j => j === jour || this.formSemaineHoraires.joursOuvres.includes(j),
      );
      this.formSemaineHoraires = { ...this.formSemaineHoraires, joursOuvres: joursOrdonnes };
    } else {
      this.formSemaineHoraires = {
        ...this.formSemaineHoraires,
        joursOuvres: this.formSemaineHoraires.joursOuvres.filter(j => j !== jour),
      };
    }
  }

  /** Enregistre les préférences. */
  protected enregistrerPreferences(): void {
    const d = this.donneesService.donnees();
    if (!d) return;
    this.donneesService.executer(
      new CommandeRemplacement<number>(
        (data, v) => {
          data.configuration.delaiSauvegardeAutoMinutes = v;
        },
        d.configuration.delaiSauvegardeAutoMinutes,
        this.formPreferences.delaiSauvegardeAutoMinutes,
      ),
    );
  }

  /** Réinitialise les préférences depuis le store. */
  protected annulerPreferences(): void {
    const d = this.donneesService.donnees();
    if (!d) return;
    this.formPreferences = {
      delaiSauvegardeAutoMinutes: d.configuration.delaiSauvegardeAutoMinutes,
    };
    this.cdr.markForCheck();
  }

  /** Ajoute une période vide en bas de la liste. */
  protected ajouterPeriode(): void {
    this.copiePeriodes.update(liste => [
      ...liste,
      { id: crypto.randomUUID(), nom: '', debut: '', fin: '' },
    ]);
  }

  /**
   * Enregistre la période à l'index donné (création ou modification).
   * @param index Index dans la copie locale.
   */
  protected enregistrerPeriode(index: number): void {
    const d = this.donneesService.donnees();
    if (!d) return;
    const periode = this.copiePeriodes()[index];
    const existante = d.referentiels.periodes.find(p => p.id === periode.id);
    if (existante) {
      this.referentielService.modifierPeriode(existante, periode);
    } else {
      this.referentielService.ajouterPeriode(periode);
    }
  }

  /**
   * Supprime une période.
   * @param periode Période à supprimer.
   */
  protected supprimerPeriode(periode: Periode): void {
    this.referentielService.supprimerPeriode(periode);
    this.copiePeriodes.update(liste => liste.filter(p => p.id !== periode.id));
  }

  /** @returns `true` si la période est utilisée et ne peut être supprimée. */
  protected estPeriodeUtilisee(periode: Periode): boolean {
    return this.referentielService.estPeriodeUtilisee(periode.nom);
  }

  /** Ajoute un groupe vide. */
  protected ajouterGroupe(): void {
    this.copieGroupes.update(liste => [
      ...liste,
      { id: crypto.randomUUID(), libelle: '' },
    ]);
  }

  /**
   * Enregistre un groupe.
   * @param index Index dans la copie locale.
   */
  protected enregistrerGroupe(index: number): void {
    const d = this.donneesService.donnees();
    if (!d) return;
    const groupe = this.copieGroupes()[index];
    const existant = d.referentiels.groupes.find(g => g.id === groupe.id);
    if (existant) {
      this.referentielService.modifierGroupe(existant, groupe);
    } else {
      this.referentielService.ajouterGroupe(groupe);
    }
  }

  /**
   * Supprime un groupe.
   * @param groupe Groupe à supprimer.
   */
  protected supprimerGroupe(groupe: Groupe): void {
    this.referentielService.supprimerGroupe(groupe);
    this.copieGroupes.update(liste => liste.filter(g => g.id !== groupe.id));
  }

  /** @returns `true` si le groupe est utilisé. */
  protected estGroupeUtilise(groupe: Groupe): boolean {
    return this.referentielService.estGroupeUtilise(groupe.id);
  }

  /** Ajoute un statut d'acquisition vide. */
  protected ajouterStatutAcquisition(): void {
    this.copieBareme.update(liste => [
      ...liste,
      { id: '', glyphe: '', libelle: '', couleur: '#000000', fond: '#ffffff' },
    ]);
  }

  /**
   * Enregistre un statut d'acquisition.
   * @param index Index dans la copie locale.
   */
  protected enregistrerStatutAcquisition(index: number): void {
    const d = this.donneesService.donnees();
    if (!d) return;
    const statut = this.copieBareme()[index];
    const existant = d.referentiels.statutsAcquisition.find(s => s.id === statut.id);
    if (existant) {
      this.referentielService.modifierStatutAcquisition(existant, statut);
    } else {
      this.referentielService.ajouterStatutAcquisition(statut);
    }
  }

  /**
   * Supprime un statut d'acquisition.
   * @param statut Statut à supprimer.
   */
  protected supprimerStatutAcquisition(statut: StatutAcquisition): void {
    this.referentielService.supprimerStatutAcquisition(statut);
    this.copieBareme.update(liste => liste.filter(s => s.id !== statut.id));
  }

  /** @returns `true` si le statut d'acquisition est utilisé. */
  protected estStatutAcquisitionUtilise(statut: StatutAcquisition): boolean {
    return this.referentielService.estStatutAcquisitionUtilise(statut.id);
  }

  /** Ajoute un statut élève vide. */
  protected ajouterStatutEleve(): void {
    this.copieStatutsEleve.update(liste => [
      ...liste,
      { id: '', libelle: '' },
    ]);
  }

  /**
   * Enregistre un statut élève.
   * @param index Index dans la copie locale.
   */
  protected enregistrerStatutEleve(index: number): void {
    const d = this.donneesService.donnees();
    if (!d) return;
    const statut = this.copieStatutsEleve()[index];
    const existant = d.referentiels.statutsEleve.find(s => s.id === statut.id);
    if (existant) {
      this.referentielService.modifierStatutEleve(existant, statut);
    } else {
      this.referentielService.ajouterStatutEleve(statut);
    }
  }

  /**
   * Supprime un statut élève.
   * @param statut Statut à supprimer.
   */
  protected supprimerStatutEleve(statut: StatutEleve): void {
    this.referentielService.supprimerStatutEleve(statut);
    this.copieStatutsEleve.update(liste => liste.filter(s => s.id !== statut.id));
  }

  /** @returns `true` si le statut élève est utilisé. */
  protected estStatutEleveUtilise(statut: StatutEleve): boolean {
    return this.referentielService.estStatutEleveUtilise(statut.id);
  }

  /** Ajoute un type de contact vide. */
  protected ajouterTypeContact(): void {
    this.copieTypesContact.update(liste => [
      ...liste,
      { id: '', libelle: '' },
    ]);
  }

  /**
   * Enregistre un type de contact.
   * @param index Index dans la copie locale.
   */
  protected enregistrerTypeContact(index: number): void {
    const d = this.donneesService.donnees();
    if (!d) return;
    const type = this.copieTypesContact()[index];
    const existant = d.referentiels.typesContact.find(t => t.id === type.id);
    if (existant) {
      this.referentielService.modifierTypeContact(existant, type);
    } else {
      this.referentielService.ajouterTypeContact(type);
    }
  }

  /**
   * Supprime un type de contact.
   * @param type Type à supprimer.
   */
  protected supprimerTypeContact(type: TypeContact): void {
    this.referentielService.supprimerTypeContact(type);
    this.copieTypesContact.update(liste => liste.filter(t => t.id !== type.id));
  }

  /** @returns `true` si le type de contact est utilisé. */
  protected estTypeContactUtilise(type: TypeContact): boolean {
    return this.referentielService.estTypeContactUtilise(type.id);
  }

  /** Ajoute une raison d'absence vide. */
  protected ajouterRaisonAbsence(): void {
    this.copieRaisonsAbsence.update(liste => [
      ...liste,
      { id: crypto.randomUUID(), libelle: '' },
    ]);
  }

  /**
   * Enregistre une raison d'absence.
   * @param index Index dans la copie locale.
   */
  protected enregistrerRaisonAbsence(index: number): void {
    const d = this.donneesService.donnees();
    if (!d) return;
    const raison = this.copieRaisonsAbsence()[index];
    const existante = d.referentiels.raisonsAbsence.find(r => r.id === raison.id);
    if (existante) {
      this.referentielService.modifierRaisonAbsence(existante, raison);
    } else {
      this.referentielService.ajouterRaisonAbsence(raison);
    }
  }

  /**
   * Supprime une raison d'absence.
   * @param raison Raison à supprimer.
   */
  protected supprimerRaisonAbsence(raison: RaisonAbsence): void {
    this.referentielService.supprimerRaisonAbsence(raison);
    this.copieRaisonsAbsence.update(liste => liste.filter(r => r.id !== raison.id));
  }

  /** Ajoute une fréquence d'absence vide. */
  protected ajouterFrequenceAbsence(): void {
    this.copieFrequencesAbsence.update(liste => [
      ...liste,
      { id: crypto.randomUUID(), libelle: '' },
    ]);
  }

  /**
   * Enregistre une fréquence d'absence.
   * @param index Index dans la copie locale.
   */
  protected enregistrerFrequenceAbsence(index: number): void {
    const d = this.donneesService.donnees();
    if (!d) return;
    const frequence = this.copieFrequencesAbsence()[index];
    const existante = d.referentiels.frequencesAbsence.find(f => f.id === frequence.id);
    if (existante) {
      this.referentielService.modifierFrequenceAbsence(existante, frequence);
    } else {
      this.referentielService.ajouterFrequenceAbsence(frequence);
    }
  }

  /**
   * Supprime une fréquence d'absence.
   * @param frequence Fréquence à supprimer.
   */
  protected supprimerFrequenceAbsence(frequence: FrequenceAbsence): void {
    this.referentielService.supprimerFrequenceAbsence(frequence);
    this.copieFrequencesAbsence.update(liste => liste.filter(f => f.id !== frequence.id));
  }

  /** Ajoute un jour férié vide. */
  protected ajouterJourFerie(): void {
    this.copieJoursFeries.update(liste => [
      ...liste,
      { id: crypto.randomUUID(), nom: '', date: '' },
    ]);
  }

  /**
   * Enregistre un jour férié.
   * @param index Index dans la copie locale.
   */
  protected enregistrerJourFerie(index: number): void {
    const d = this.donneesService.donnees();
    if (!d) return;
    const jourFerie = this.copieJoursFeries()[index];
    const existant = d.referentiels.joursFeries.find(j => j.id === jourFerie.id);
    if (existant) {
      this.referentielService.modifierJourFerie(existant, jourFerie);
    } else {
      this.referentielService.ajouterJourFerie(jourFerie);
    }
  }

  /**
   * Supprime un jour férié.
   * @param jourFerie Jour férié à supprimer.
   */
  protected supprimerJourFerie(jourFerie: JourFerie): void {
    this.referentielService.supprimerJourFerie(jourFerie);
    this.copieJoursFeries.update(liste => liste.filter(j => j.id !== jourFerie.id));
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
      domaine.enfants?.forEach(ss => nouveauSet.add(ss.id));
    } else {
      nouveauSet.delete(domaine.id);
      domaine.enfants?.forEach(ss => nouveauSet.delete(ss.id));
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
  protected basculerSousDomaine(domaine: Competence, sousDomaine: Competence, actif: boolean): void {
    const nouveauSet = new Set(this.copieDomainesActifs());
    if (actif) {
      nouveauSet.add(sousDomaine.id);
    } else {
      if (nouveauSet.has(domaine.id)) {
        // Décomposer le domaine parent : activer tous les autres sous-domaines sauf celui-ci
        nouveauSet.delete(domaine.id);
        domaine.enfants?.forEach(ss => {
          if (ss.id !== sousDomaine.id) nouveauSet.add(ss.id);
        });
      } else {
        nouveauSet.delete(sousDomaine.id);
      }
    }
    this.copieDomainesActifs.set(nouveauSet);
  }

  /** Enregistre la sélection des domaines de compétences actifs. */
  protected enregistrerDomainesCompetences(): void {
    const d = this.donneesService.donnees();
    if (!d) return;
    const actifs = this.copieDomainesActifs();

    // Si tous les nœuds N1 et N2 sont actifs, on stocke [] (= tout afficher)
    const tousIds: string[] = [];
    d.referentiels.competences.forEach(n1 => {
      tousIds.push(n1.id);
      n1.enfants?.forEach(n2 => tousIds.push(n2.id));
    });
    const toutActif = tousIds.every(id => actifs.has(id));

    this.donneesService.executer(
      new CommandeRemplacement<string[]>(
        (data, v) => { data.configuration.domainesActifs = v; },
        d.configuration.domainesActifs ?? [],
        toutActif ? [] : [...actifs],
      ),
    );
  }

  /** Réinitialise la sélection des domaines depuis le store. */
  protected annulerDomainesCompetences(): void {
    const d = this.donneesService.donnees();
    if (!d) return;
    const actifs = d.configuration.domainesActifs;
    if (!actifs || actifs.length === 0) {
      const tousIds = new Set<string>();
      d.referentiels.competences.forEach(n1 => {
        tousIds.add(n1.id);
        n1.enfants?.forEach(n2 => tousIds.add(n2.id));
      });
      this.copieDomainesActifs.set(tousIds);
    } else {
      this.copieDomainesActifs.set(new Set(actifs));
    }
    this.cdr.markForCheck();
  }
}
