/**
 * Écran de gestion des emplois du temps.
 * Trois colonnes : liste des EDT, grille hebdomadaire, formulaire contextuel.
 */

import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { LIBELLES } from '../../libelles';
import { DonneesService } from '../../services/avecEtat/donnees.service';
import { EmploiDuTempsService } from '../../services/sansEtat/emploi-du-temps.service';
import { CompetenceService } from '../../services/sansEtat/competence.service';
import { EdtFormulaireComponent } from './edt-formulaire/edt-formulaire.component';
import type { EmploiDuTemps, CreneauEdt, JourSemaine, FrequenceSemaine } from '../../modeles/emploi-du-temps.modele';
import type { Competence } from '../../modeles/referentiels.modele';

/** Libellés français des jours de semaine. */
const LIBELLES_JOURS: Record<JourSemaine, string> = {
  lundi: 'Lundi',
  mardi: 'Mardi',
  mercredi: 'Mercredi',
  jeudi: 'Jeudi',
  vendredi: 'Vendredi',
};

/** Ordre canonique des jours ouvrés. */
const ORDRE_JOURS: JourSemaine[] = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'];

/** Crée un EDT vide prêt pour la saisie. */
function creerEdtVide(): EmploiDuTemps {
  return {
    id: crypto.randomUUID(),
    nom: '',
    dateDebut: null,
    dateFin: null,
    frequence: 'lesDeux' as FrequenceSemaine,
    creneaux: [],
  };
}

/** Crée un créneau vide pour le jour donné. */
function creerCreneauVide(jour: JourSemaine): CreneauEdt {
  return {
    id: crypto.randomUUID(),
    jour,
    heureDebut: '08:00',
    heureFin: '09:00',
    type: 'pedagogique',
    disciplinesIds: [],
    elevesConcernes: { type: 'classe', groupes: [], elevesIds: [] },
  };
}

/**
 * Écran emploi du temps.
 * Colonne gauche : liste des EDT avec indicateur de conflit.
 * Colonne centrale : grille hebdomadaire de l'EDT sélectionné.
 * Colonne droite : formulaire contextuel EDT ou créneau.
 */
@Component({
  selector: 'ecran-emploi-du-temps',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EdtFormulaireComponent],
  templateUrl: './ecran-emploi-du-temps.component.html',
  styleUrl: './ecran-emploi-du-temps.component.scss',
})
export class EcranEmploiDuTempsComponent {
  /** Constante centralisée des libellés. */
  protected readonly LIBELLES = LIBELLES;

  /** Map jours→libellés exposée au template. */
  protected readonly LIBELLES_JOURS = LIBELLES_JOURS;

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

  /** Liste complète des EDT depuis le store. */
  protected readonly edts = computed<EmploiDuTemps[]>(
    () => this.donneesService.donnees()?.emploisDuTemps ?? [],
  );

  /** Jours ouvrés configurés pour la grille hebdomadaire. */
  protected readonly joursOuvres = computed<JourSemaine[]>(() => {
    const jours =
      this.donneesService.donnees()?.referentiels.configEmploiDuTemps.joursOuvres ?? [];
    return ORDRE_JOURS.filter(j => jours.includes(j));
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

  /**
   * Retourne le créneau à l'intersection d'un jour et d'une plage horaire.
   * @param jour Jour de la semaine.
   * @param ligne Plage {heureDebut, heureFin}.
   */
  protected creneauDeGrille(
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
  }

  /** Lance la création d'un nouvel EDT (formulaire vide, grille vide). */
  protected creerEdt(): void {
    this.edtSelectionne.set(null);
    this.formEdt.set(creerEdtVide());
    this.creneauEdite.set(null);
  }

  /**
   * Ouvre le formulaire créneau pour un créneau existant.
   * @param creneau Créneau à modifier.
   */
  protected selectionnerCreneau(creneau: CreneauEdt): void {
    this.formEdt.set(null);
    this.creneauEdite.set(creneau);
  }

  /**
   * Ouvre le formulaire créneau pour un nouveau créneau sur le jour donné.
   * @param jour Jour de la semaine du nouveau créneau.
   */
  protected ajouterCreneauPourJour(jour: JourSemaine): void {
    this.formEdt.set(null);
    this.creneauEdite.set(creerCreneauVide(jour));
  }

  /**
   * Enregistre l'EDT (création ou modification).
   * @param edt EDT émis par le formulaire.
   */
  protected onEdtEnregistre(edt: EmploiDuTemps): void {
    const existant = this.donneesService.donnees()?.emploisDuTemps.find(e => e.id === edt.id);
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
    const existant = edt.creneaux.find(c => c.id === creneau.id);
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
    const edt = this.edtSelectionne();
    this.creneauEdite.set(null);
    this.formEdt.set(edt);
  }

  /** Lance l'impression de la grille de l'EDT sélectionné. */
  protected imprimer(): void {
    window.print();
  }
}
