/**
 * Service métier gérant le cahier journal.
 * Toute mutation transite par `DonneesService.executer()`.
 */

import { Injectable, inject } from '@angular/core';
import { JourneeJournal, Seance } from '../../modeles/cahier-journal.modele';
import { CommandeCreation } from '../../commandes/commande-creation';
import { CommandeModification } from '../../commandes/commande-modification';
import { CommandeSuppression } from '../../commandes/commande-suppression';
import { DonneesService } from '../avecEtat/donnees.service';
import { EleveService } from './eleve.service';
import { DateUtils } from '../../utilitaires/date.utils';
import { LIBELLES } from '../../libelles';

/**
 * Service sans état exposant toutes les opérations du cahier journal :
 * initialisation, gestion des séances et des journées, duplication, conflits d'absences.
 */
@Injectable({ providedIn: 'root' })
export class CahierJournalService {
  /** Accès aux données de l'application et soumission des commandes. */
  private readonly donneesService = inject(DonneesService);

  /** Service élèves, utilisé pour générer le pré-remplissage des notes de journée. */
  private readonly eleveService = inject(EleveService);

  /**
   * Initialise une journée vide pour la date donnée.
   * Les notes sont pré-remplies avec les absences du jour (récurrentes et ponctuelles) s'il en
   * existe au moins une. Aucune garde `if (journee.notes)` supplémentaire n'est nécessaire :
   * cette méthode ne s'exécute jamais sur une journée déjà existante (voir la vérification
   * ci-dessous), donc `notes` n'a jamais pu être renseigné avant cet appel.
   * Sans effet si une entrée existe déjà pour cette date ou si aucune donnée n'est chargée.
   * @param date Date ISO de la journée à créer (ex. : `"2026-06-09"`).
   */
  public initialiserJourneeVide(date: string): void {
    const donnees = this.donneesService.donnees();
    if (!donnees) return;
    if (donnees.cahierJournal.some((j) => j.date === date)) return;
    const notesInitiales = this.genererNotesInitiales(date);
    this.donneesService.executer(
      new CommandeCreation<JourneeJournal>(
        (d) => d.cahierJournal,
        {
          id: crypto.randomUUID(),
          date,
          seances: [],
          ...(notesInitiales ? { notes: notesInitiales } : {}),
        },
        LIBELLES.commandes.initialisationJourneeVide,
      ),
    );
  }

  /**
   * Initialise une journée en important les créneaux de l'EDT applicable à cette date.
   * Détermine la parité ISO de la semaine pour sélectionner les EDTs compatibles.
   * Trie les séances par heure de début croissante.
   * Les notes sont pré-remplies avec les absences du jour (récurrentes et ponctuelles) s'il en
   * existe au moins une. Aucune garde `if (journee.notes)` supplémentaire n'est nécessaire :
   * cette méthode ne s'exécute jamais sur une journée déjà existante (voir la vérification
   * ci-dessous), donc `notes` n'a jamais pu être renseigné avant cet appel.
   * Sans effet si une journée existe déjà pour cette date ou si la date tombe un week-end.
   * @param date Date ISO de la journée à initialiser.
   */
  public initialiserDepuisEdt(date: string): void {
    const donnees = this.donneesService.donnees();
    if (!donnees) return;
    if (donnees.cahierJournal.some((j) => j.date === date)) return;

    const jourSemaine = DateUtils.obtenirJourSemaine(date);
    if (jourSemaine === 'samedi' || jourSemaine === 'dimanche') return;

    const parite = DateUtils.calculerParite(date);
    const seances: Seance[] = [];

    for (const edt of donnees.emploisDuTemps) {
      if (edt.dateDebut && date < edt.dateDebut) continue;
      if (edt.dateFin && date > edt.dateFin) continue;
      if (edt.frequence !== 'lesDeux' && edt.frequence !== parite) continue;

      for (const creneau of edt.creneaux) {
        if (creneau.jour !== jourSemaine) continue;
        for (const temps of creneau.temps) {
          seances.push({
            id: crypto.randomUUID(),
            heureDebut: temps.heureDebut,
            heureFin: temps.heureFin,
            type: creneau.type,
            ...(temps.disciplinesIds ? { disciplinesIds: [...temps.disciplinesIds] } : {}),
            ...(temps.titre !== undefined ? { titre: temps.titre } : {}),
            ...(temps.elevesConcernes
              ? {
                  elevesConcernes: {
                    type: temps.elevesConcernes.type,
                    groupes: [...temps.elevesConcernes.groupes],
                    elevesIds: [...temps.elevesConcernes.elevesIds],
                  },
                }
              : {}),
          });
        }
      }
    }
    seances.sort((a, b) => a.heureDebut.localeCompare(b.heureDebut));
    const notesInitiales = this.genererNotesInitiales(date);
    this.donneesService.executer(
      new CommandeCreation<JourneeJournal>(
        (d) => d.cahierJournal,
        {
          id: crypto.randomUUID(),
          date,
          seances,
          ...(notesInitiales ? { notes: notesInitiales } : {}),
        },
        LIBELLES.commandes.initialisationDepuisEdt,
      ),
    );
  }

  /**
   * Génère le contenu initial des notes d'une journée à partir des absences du jour.
   * Combine les absences récurrentes et ponctuelles via
   * `EleveService.genererLibellesAbsencesDuJour`.
   * @param date Date ISO de la journée.
   * @returns Texte des notes pré-remplies, ou `undefined` si aucune absence ce jour-là.
   */
  private genererNotesInitiales(date: string): string | undefined {
    const lignes = this.eleveService.genererLibellesAbsencesDuJour(date);
    if (lignes.length === 0) return undefined;
    return [LIBELLES.cahierJournal.enteteAbsencesJour, ...lignes].join('\n');
  }

  /**
   * Modifie les notes libres d'une journée.
   * La valeur est normalisée : une chaîne vide ou blanche efface les notes (`undefined`).
   * Sans effet si la journée n'existe pas ou si la valeur normalisée est inchangée.
   * @param date Date ISO de la journée.
   * @param notes Nouveau contenu des notes.
   */
  public modifierNotesJournee(date: string, notes: string): void {
    const ancienneJournee = this.donneesService
      .donnees()
      ?.cahierJournal.find((j) => j.date === date);
    if (!ancienneJournee) return;
    const notesNettoyees = notes.trim();
    const valeur = notesNettoyees.length > 0 ? notesNettoyees : undefined;
    if (ancienneJournee.notes === valeur) return;
    const nouvelleJournee: JourneeJournal = { ...ancienneJournee, notes: valeur };
    this.donneesService.executer(
      new CommandeModification<JourneeJournal>(
        (d) => d.cahierJournal,
        ancienneJournee,
        nouvelleJournee,
        LIBELLES.commandes.modificationNotesJournee,
      ),
    );
  }

  /**
   * Ajoute une séance à la journée identifiée par la date.
   * La séance est ajoutée en fin de liste — le tri est géré par l'écran.
   * Sans effet si la journée n'existe pas ou si aucune donnée n'est chargée.
   * @param date Date ISO de la journée.
   * @param seance Séance à ajouter.
   */
  public ajouterSeance(date: string, seance: Seance): void {
    const ancienneJournee = this.donneesService
      .donnees()
      ?.cahierJournal.find((j) => j.date === date);
    if (!ancienneJournee) return;
    const nouvelleJournee: JourneeJournal = {
      ...ancienneJournee,
      seances: [...ancienneJournee.seances, seance],
    };
    this.donneesService.executer(
      new CommandeModification<JourneeJournal>(
        (d) => d.cahierJournal,
        ancienneJournee,
        nouvelleJournee,
        LIBELLES.commandes.ajoutSeance,
      ),
    );
  }

  /**
   * Modifie une séance existante (retrouvée par son `id`) dans la journée.
   * Sans effet si la journée ou la séance n'existe pas.
   * @param date Date ISO de la journée.
   * @param seance Nouvelle valeur de la séance (même `id`).
   */
  public modifierSeance(date: string, seance: Seance): void {
    const ancienneJournee = this.donneesService
      .donnees()
      ?.cahierJournal.find((j) => j.date === date);
    if (!ancienneJournee) return;
    const nouvelleJournee: JourneeJournal = {
      ...ancienneJournee,
      seances: ancienneJournee.seances.map((s) => (s.id === seance.id ? seance : s)),
    };
    this.donneesService.executer(
      new CommandeModification<JourneeJournal>(
        (d) => d.cahierJournal,
        ancienneJournee,
        nouvelleJournee,
        LIBELLES.commandes.modificationSeance,
      ),
    );
  }

  /**
   * Supprime une séance de la journée.
   * Sans effet si la journée ou la séance n'existe pas.
   * @param date Date ISO de la journée.
   * @param seanceId UUID de la séance à supprimer.
   */
  public supprimerSeance(date: string, seanceId: string): void {
    const ancienneJournee = this.donneesService
      .donnees()
      ?.cahierJournal.find((j) => j.date === date);
    if (!ancienneJournee) return;
    const nouvelleJournee: JourneeJournal = {
      ...ancienneJournee,
      seances: ancienneJournee.seances.filter((s) => s.id !== seanceId),
    };
    this.donneesService.executer(
      new CommandeModification<JourneeJournal>(
        (d) => d.cahierJournal,
        ancienneJournee,
        nouvelleJournee,
        LIBELLES.commandes.suppressionSeance,
      ),
    );
  }

  /**
   * Échange les heures de début et de fin entre deux séances d'une même journée.
   * L'ordre du tableau de stockage n'est pas modifié : seuls `heureDebut` et `heureFin` sont permutés.
   * Sans effet si la journée n'existe pas ou si l'un des identifiants est introuvable.
   * @param date Date ISO de la journée.
   * @param idSeanceA Identifiant de la première séance.
   * @param idSeanceB Identifiant de la seconde séance.
   */
  public echangerHeuresSeances(date: string, idSeanceA: string, idSeanceB: string): void {
    const ancienneJournee = this.donneesService
      .donnees()
      ?.cahierJournal.find((j) => j.date === date);
    if (!ancienneJournee) return;
    const seanceA = ancienneJournee.seances.find((s) => s.id === idSeanceA);
    const seanceB = ancienneJournee.seances.find((s) => s.id === idSeanceB);
    if (!seanceA || !seanceB) return;
    const seances = ancienneJournee.seances.map((s) => {
      if (s.id === idSeanceA)
        return { ...s, heureDebut: seanceB.heureDebut, heureFin: seanceB.heureFin };
      if (s.id === idSeanceB)
        return { ...s, heureDebut: seanceA.heureDebut, heureFin: seanceA.heureFin };
      return s;
    });
    const nouvelleJournee: JourneeJournal = { ...ancienneJournee, seances };
    this.donneesService.executer(
      new CommandeModification<JourneeJournal>(
        (d) => d.cahierJournal,
        ancienneJournee,
        nouvelleJournee,
        LIBELLES.commandes.reordonnancementSeances,
      ),
    );
  }

  /**
   * Supprime entièrement une journée du cahier journal.
   * Sans effet si la journée n'existe pas ou si aucune donnée n'est chargée.
   * @param date Date ISO de la journée à supprimer.
   */
  public supprimerJournee(date: string): void {
    const donnees = this.donneesService.donnees();
    if (!donnees) return;
    const index = donnees.cahierJournal.findIndex((j) => j.date === date);
    if (index === -1) return;
    this.donneesService.executer(
      new CommandeSuppression<JourneeJournal>(
        (d) => d.cahierJournal,
        donnees.cahierJournal[index],
        index,
        LIBELLES.commandes.suppressionJournee,
      ),
    );
  }

  /**
   * Duplique une séance depuis `dateSource` vers `dateCible` en générant un nouvel UUID.
   * Si `dateCible` n'a pas encore de journée, une journée est créée avec cette séance.
   * Sans effet si la journée ou la séance source n'existe pas.
   * @param seanceId UUID de la séance à dupliquer.
   * @param dateSource Date ISO de la journée source.
   * @param dateCible Date ISO de la journée cible.
   */
  public dupliquerSeance(seanceId: string, dateSource: string, dateCible: string): void {
    const donnees = this.donneesService.donnees();
    if (!donnees) return;
    const journeeSource = donnees.cahierJournal.find((j) => j.date === dateSource);
    if (!journeeSource) return;
    const seanceSource = journeeSource.seances.find((s) => s.id === seanceId);
    if (!seanceSource) return;
    const nouvelleSeance: Seance = { ...structuredClone(seanceSource), id: crypto.randomUUID() };

    const journeeCible = donnees.cahierJournal.find((j) => j.date === dateCible);
    if (!journeeCible) {
      this.donneesService.executer(
        new CommandeCreation<JourneeJournal>(
          (d) => d.cahierJournal,
          { id: crypto.randomUUID(), date: dateCible, seances: [nouvelleSeance] },
          LIBELLES.commandes.duplicationSeance,
        ),
      );
    } else {
      const nouvelleJournee: JourneeJournal = {
        ...journeeCible,
        seances: [...journeeCible.seances, nouvelleSeance],
      };
      this.donneesService.executer(
        new CommandeModification<JourneeJournal>(
          (d) => d.cahierJournal,
          journeeCible,
          nouvelleJournee,
          LIBELLES.commandes.duplicationSeance,
        ),
      );
    }
  }

  /**
   * Duplique toutes les séances de `dateSource` vers `dateCible` en générant de nouveaux UUIDs.
   * Les notes de la journée source sont également reportées sur la journée cible.
   * Si `dateCible` n'a pas encore de journée, une journée est créée avec ces séances.
   * Si `dateCible` existe déjà, son contenu est remplacé.
   * Sans effet si la journée source n'existe pas.
   * @param dateSource Date ISO de la journée source.
   * @param dateCible Date ISO de la journée cible.
   */
  public dupliquerJournee(dateSource: string, dateCible: string): void {
    const donnees = this.donneesService.donnees();
    if (!donnees) return;
    const journeeSource = donnees.cahierJournal.find((j) => j.date === dateSource);
    if (!journeeSource) return;
    const seancesClonees = journeeSource.seances.map((s) => ({
      ...structuredClone(s),
      id: crypto.randomUUID(),
    }));

    // Les notes de la journée source sont reportées telles quelles (présentes ou absentes)
    // sur la journée cible, qui reflète intégralement la source après duplication.
    const notesReportees = journeeSource.notes;

    const journeeCible = donnees.cahierJournal.find((j) => j.date === dateCible);
    if (!journeeCible) {
      this.donneesService.executer(
        new CommandeCreation<JourneeJournal>(
          (d) => d.cahierJournal,
          {
            id: crypto.randomUUID(),
            date: dateCible,
            seances: seancesClonees,
            ...(notesReportees !== undefined ? { notes: notesReportees } : {}),
          },
          LIBELLES.commandes.duplicationJournee,
        ),
      );
    } else {
      const nouvelleJournee: JourneeJournal = {
        ...journeeCible,
        seances: seancesClonees,
        ...(notesReportees !== undefined ? { notes: notesReportees } : { notes: undefined }),
      };
      this.donneesService.executer(
        new CommandeModification<JourneeJournal>(
          (d) => d.cahierJournal,
          journeeCible,
          nouvelleJournee,
          LIBELLES.commandes.duplicationJournee,
        ),
      );
    }
  }

  /**
   * Calcule les conflits entre une séance et les absences récurrentes des élèves concernés.
   * Le jour de la semaine et la parité de semaine sont déduits de la date ISO.
   * @param date Date ISO de la journée.
   * @param seanceId UUID de la séance à analyser.
   * @returns Liste de libellés au format `"NOM Prénom — libellé d'absence"`.
   */
  public calculerConflitsAbsences(date: string, seanceId: string): string[] {
    const journee = this.donneesService.donnees()?.cahierJournal.find((j) => j.date === date);
    const seance = journee?.seances.find((s) => s.id === seanceId);
    if (!seance) return [];
    return this.calculerConflitsPourSeance(date, seance);
  }

  /**
   * Calcule les conflits entre une séance et les absences récurrentes des élèves concernés,
   * sans exiger que la séance soit déjà présente dans le cahier journal — utile pour
   * évaluer une séance avant son tout premier enregistrement.
   * @param date Date ISO de la journée.
   * @param seance Séance à analyser (objet complet, pas seulement son id).
   * @returns Liste de libellés au format `"NOM Prénom — libellé d'absence"`.
   */
  public calculerConflitsPourSeance(date: string, seance: Seance): string[] {
    const donnees = this.donneesService.donnees();
    if (!donnees) return [];

    const jourSemaine = DateUtils.obtenirJourSemaine(date);
    if (jourSemaine === 'samedi' || jourSemaine === 'dimanche') return [];
    const parite = DateUtils.calculerParite(date);

    const tousEleves = donnees.classe.eleves;
    let elevesIds: string[];

    if (!seance.elevesConcernes || seance.elevesConcernes.type === 'classe') {
      elevesIds = tousEleves.map((e) => e.id);
    } else if (seance.elevesConcernes.type === 'groupes') {
      const groupes = seance.elevesConcernes.groupes;
      elevesIds = tousEleves
        .filter((e) => e.groupes.some((g) => groupes.includes(g)))
        .map((e) => e.id);
    } else {
      elevesIds = seance.elevesConcernes.elevesIds;
    }

    const conflits: string[] = [];
    for (const eleveId of elevesIds) {
      const eleve = tousEleves.find((e) => e.id === eleveId);
      if (!eleve) continue;
      for (const abs of eleve.absencesRecurrentes) {
        if (
          abs.jour === jourSemaine &&
          (abs.paritesSemaine === 'lesDeux' || abs.paritesSemaine === parite) &&
          DateUtils.chevauchementHoraire(
            abs.heureDebut,
            abs.heureFin,
            seance.heureDebut,
            seance.heureFin,
          )
        ) {
          conflits.push(`${eleve.nom} ${eleve.prenom} — ${abs.libelle}`);
        }
      }
    }
    return conflits;
  }
}
