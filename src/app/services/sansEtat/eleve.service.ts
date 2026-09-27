/**
 * Service métier gérant les opérations sur les élèves.
 * Toute mutation transite par `DonneesService.executer()`.
 */

import { Injectable, inject } from '@angular/core';
import { Eleve } from '../../modeles/eleve.modele';
import { JourSemaine } from '../../modeles/emploi-du-temps.modele';
import { CommandeCreation } from '../../commandes/commande-creation';
import { CommandeModification } from '../../commandes/commande-modification';
import { CommandeSuppression } from '../../commandes/commande-suppression';
import { DonneesService } from '../avecEtat/donnees.service';
import { DateUtils } from '../../utilitaires/date.utils';
import { TexteUtils } from '../../utilitaires/texte.utils';
import { LIBELLES } from '../../libelles';

/**
 * Service sans état exposant le CRUD des élèves et le calcul des conflits d'absences.
 */
@Injectable({ providedIn: 'root' })
export class EleveService {
  /** Accès aux données de l'application et soumission des commandes. */
  private readonly donneesService = inject(DonneesService);

  /**
   * Crée un élève et l'ajoute à la classe.
   * @param eleve Élève à ajouter (doit posséder un `id` unique).
   */
  public creerEleve(eleve: Eleve): void {
    this.donneesService.executer(
      new CommandeCreation((d) => d.classe.eleves, eleve, LIBELLES.commandes.ajoutEleve),
    );
  }

  /**
   * Modifie un élève existant retrouvé par son `id`.
   * Sans effet si l'`id` n'existe pas ou si aucune donnée n'est chargée.
   * @param eleve Nouvelle valeur de l'élève (même `id`).
   */
  public modifierEleve(eleve: Eleve): void {
    const donnees = this.donneesService.donnees();
    if (!donnees) return;
    const ancien = donnees.classe.eleves.find((e) => e.id === eleve.id);
    if (!ancien) return;
    this.donneesService.executer(
      new CommandeModification(
        (d) => d.classe.eleves,
        ancien,
        eleve,
        LIBELLES.commandes.modificationEleve,
      ),
    );
  }

  /**
   * Supprime un élève retrouvé par son identifiant.
   * Sans effet si l'`id` n'existe pas ou si aucune donnée n'est chargée.
   * @param id UUID de l'élève à supprimer.
   */
  public supprimerEleve(id: string): void {
    const donnees = this.donneesService.donnees();
    if (!donnees) return;
    const index = donnees.classe.eleves.findIndex((e) => e.id === id);
    if (index === -1) return;
    this.donneesService.executer(
      new CommandeSuppression(
        (d) => d.classe.eleves,
        donnees.classe.eleves[index],
        index,
        LIBELLES.commandes.suppressionEleve,
      ),
    );
  }

  /**
   * Retourne un élève par son identifiant, ou `undefined` s'il n'existe pas.
   * @param id UUID de l'élève.
   */
  public obtenirEleve(id: string): Eleve | undefined {
    return this.donneesService.donnees()?.classe.eleves.find((e) => e.id === id);
  }

  /**
   * Retourne la liste des élèves triée NOM Prénom, filtrée si un terme est fourni.
   * La recherche est insensible à la casse et aux accents.
   * @param terme Terme de recherche (vide = liste complète triée).
   * @returns Élèves correspondants, triés alphabétiquement.
   */
  public rechercherEleves(terme: string): Eleve[] {
    const eleves = this.donneesService.donnees()?.classe.eleves ?? [];
    const tries = this.trierElevesParNomPrenom(eleves);
    if (!terme.trim()) return tries;
    const t = TexteUtils.normaliserPourRecherche(terme);
    return tries.filter(
      (e) =>
        TexteUtils.normaliserPourRecherche(e.nom).includes(t) ||
        TexteUtils.normaliserPourRecherche(e.prenom).includes(t) ||
        TexteUtils.normaliserPourRecherche(`${e.nom} ${e.prenom}`).includes(t) ||
        TexteUtils.normaliserPourRecherche(`${e.prenom} ${e.nom}`).includes(t),
    );
  }

  /**
   * Calcule les conflits entre un créneau horaire et les absences récurrentes d'un élève.
   * Retourne les libellés des absences récurrentes qui chevauchent le créneau sur le jour donné.
   * La parité de la semaine n'est pas vérifiée ici — c'est la responsabilité de l'appelant.
   * @param eleveId UUID de l'élève.
   * @param heureDebut Heure de début du créneau (`HH:MM`).
   * @param heureFin Heure de fin du créneau (`HH:MM`).
   * @param jour Jour de la semaine.
   * @returns Liste des libellés d'absences en conflit.
   */
  public calculerConflitsAbsences(
    eleveId: string,
    heureDebut: string,
    heureFin: string,
    jour: JourSemaine,
  ): string[] {
    const donnees = this.donneesService.donnees();
    if (!donnees) return [];
    const eleve = donnees.classe.eleves.find((e) => e.id === eleveId);
    if (!eleve) return [];
    return eleve.absencesRecurrentes
      .filter(
        (a) =>
          a.jour === jour &&
          DateUtils.chevauchementHoraire(a.heureDebut, a.heureFin, heureDebut, heureFin),
      )
      .map((a) => a.libelle);
  }

  /**
   * Liste les élèves ayant une absence ponctuelle à la date donnée.
   * @param date Date ISO du jour à analyser.
   * @returns UUID des élèves absents ce jour-là, ou `[]` si aucun (ou si aucune donnée n'est chargée).
   */
  public listerIdsElevesAbsents(date: string): string[] {
    const eleves = this.donneesService.donnees()?.classe.eleves ?? [];
    return eleves
      .filter((eleve) => eleve.absencesPonctuelles.some((abs) => abs.date === date))
      .map((eleve) => eleve.id);
  }

  /**
   * Génère les libellés des absences (récurrentes et ponctuelles) du jour donné, regroupées
   * en une ligne par élève concerné. Une absence récurrente est retenue si son jour correspond
   * ET si sa parité de semaine est `"lesDeux"` ou coïncide avec la parité de la date. Une
   * absence ponctuelle est retenue si sa date correspond exactement.
   * Pour un même élève, les absences récurrentes retenues sont triées par heure de début
   * croissante et libellées avec leur plage horaire ; les absences ponctuelles retenues
   * suivent, leur justification étant mise en MAJUSCULES pour les distinguer dans le texte brut.
   * @param date Date ISO du jour à analyser.
   * @returns Une ligne par élève concerné, triées par élève (NOM Prénom), ou `[]` si aucune.
   */
  public genererLibellesAbsencesDuJour(date: string): string[] {
    const donnees = this.donneesService.donnees();
    if (!donnees) return [];
    const jourSemaine = DateUtils.obtenirJourSemaine(date);
    const parite = DateUtils.calculerParite(date);
    const eleves = this.trierElevesParNomPrenom(donnees.classe.eleves);
    const lignes: string[] = [];
    for (const eleve of eleves) {
      const recurrentes = eleve.absencesRecurrentes
        .filter(
          (abs) =>
            abs.jour === jourSemaine &&
            (abs.paritesSemaine === 'lesDeux' || abs.paritesSemaine === parite),
        )
        .sort((a, b) => a.heureDebut.localeCompare(b.heureDebut))
        .map((abs) => `${abs.libelle} (${abs.heureDebut}-${abs.heureFin})`);
      const ponctuelles = eleve.absencesPonctuelles
        .filter((abs) => abs.date === date)
        .map((abs) => abs.justification.toUpperCase());
      const absences = [...recurrentes, ...ponctuelles];
      if (absences.length > 0) {
        lignes.push(`- ${eleve.nom} ${eleve.prenom} : ${absences.join(' ; ')}`);
      }
    }
    return lignes;
  }

  /**
   * Trie une liste d'élèves par NOM puis Prénom (ordre alphabétique français), sans muter l'original.
   * @param eleves Élèves à trier.
   * @returns Nouveau tableau trié.
   */
  private trierElevesParNomPrenom(eleves: Eleve[]): Eleve[] {
    return [...eleves].sort((a, b) =>
      `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`, 'fr'),
    );
  }
}
