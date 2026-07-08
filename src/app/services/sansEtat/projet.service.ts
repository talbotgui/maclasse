/**
 * Service métier gérant les projets pédagogiques.
 * Toute mutation transite par `DonneesService.executer()`.
 */

import { Injectable, inject } from '@angular/core';
import { Projet, ProjetPeriode } from '../../modeles/projet.modele';
import { CommandeCreation } from '../../commandes/commande-creation';
import { CommandeModification } from '../../commandes/commande-modification';
import { CommandeSuppression } from '../../commandes/commande-suppression';
import { DonneesService } from '../avecEtat/donnees.service';
import { TexteUtils } from '../../utilitaires/texte.utils';
import { LIBELLES } from '../../libelles';

/**
 * Service sans état exposant le CRUD des projets pédagogiques et de leurs périodes.
 */
@Injectable({ providedIn: 'root' })
export class ProjetService {
  /** Accès aux données de l'application et soumission des commandes. */
  private readonly donneesService = inject(DonneesService);

  /**
   * Crée un projet et l'ajoute à la liste des projets.
   * @param projet Projet à créer (doit posséder un `id` unique).
   */
  public creerProjet(projet: Projet): void {
    this.donneesService.executer(
      new CommandeCreation((d) => d.projets, projet, LIBELLES.commandes.ajoutProjet),
    );
  }

  /**
   * Modifie un projet existant retrouvé par son `id`.
   * Sans effet si l'`id` n'existe pas ou si aucune donnée n'est chargée.
   * @param projet Nouvelle valeur du projet (même `id`).
   */
  public modifierProjet(projet: Projet): void {
    const donnees = this.donneesService.donnees();
    if (!donnees) return;
    const ancien = donnees.projets.find((p) => p.id === projet.id);
    if (!ancien) return;
    this.donneesService.executer(
      new CommandeModification(
        (d) => d.projets,
        ancien,
        projet,
        LIBELLES.commandes.modificationProjet,
      ),
    );
  }

  /**
   * Supprime un projet par son identifiant.
   * Sans effet si l'`id` n'existe pas ou si aucune donnée n'est chargée.
   * @param id UUID du projet à supprimer.
   */
  public supprimerProjet(id: string): void {
    const donnees = this.donneesService.donnees();
    if (!donnees) return;
    const index = donnees.projets.findIndex((p) => p.id === id);
    if (index === -1) return;
    this.donneesService.executer(
      new CommandeSuppression(
        (d) => d.projets,
        donnees.projets[index],
        index,
        LIBELLES.commandes.suppressionProjet,
      ),
    );
  }

  /**
   * Retourne un projet par son identifiant, ou `undefined` s'il n'existe pas.
   * @param id UUID du projet.
   */
  public obtenirProjet(id: string): Projet | undefined {
    return this.donneesService.donnees()?.projets.find((p) => p.id === id);
  }

  /**
   * Retourne la liste des projets filtrée par terme de recherche.
   * La recherche porte sur le nom et la description. Insensible à la casse et aux accents.
   * @param terme Terme de recherche (vide = liste complète).
   * @returns Projets correspondants.
   */
  public rechercherProjets(terme: string): Projet[] {
    const projets = this.donneesService.donnees()?.projets ?? [];
    if (!terme.trim()) return projets;
    const t = TexteUtils.normaliserPourRecherche(terme);
    return projets.filter(
      (p) =>
        TexteUtils.normaliserPourRecherche(p.nom).includes(t) ||
        TexteUtils.normaliserPourRecherche(p.description).includes(t),
    );
  }

  /**
   * Ajoute une période à un projet existant.
   * Le projet est remplacé dans son intégralité (UNDO/REDO au niveau du projet).
   * Sans effet si le projet n'existe pas ou si aucune donnée n'est chargée.
   * @param projetId UUID du projet.
   * @param periode Période à ajouter.
   */
  public ajouterPeriode(projetId: string, periode: ProjetPeriode): void {
    const donnees = this.donneesService.donnees();
    if (!donnees) return;
    const ancien = donnees.projets.find((p) => p.id === projetId);
    if (!ancien) return;
    const nouveau: Projet = { ...ancien, periodes: [...ancien.periodes, periode] };
    this.donneesService.executer(
      new CommandeModification(
        (d) => d.projets,
        ancien,
        nouveau,
        LIBELLES.commandes.ajoutPeriodeProjet,
      ),
    );
  }

  /**
   * Modifie une période d'un projet (retrouvée par `periodeNom`).
   * Sans effet si le projet ou la période n'existe pas.
   * @param projetId UUID du projet.
   * @param anciennePeriode Période actuelle (son `periodeNom` sert de clé).
   * @param nouvellePeriode Nouvelle valeur de la période.
   */
  public modifierPeriode(
    projetId: string,
    anciennePeriode: ProjetPeriode,
    nouvellePeriode: ProjetPeriode,
  ): void {
    const donnees = this.donneesService.donnees();
    if (!donnees) return;
    const ancien = donnees.projets.find((p) => p.id === projetId);
    if (!ancien) return;
    const periodes = ancien.periodes.map((pp) =>
      pp.periodeNom === anciennePeriode.periodeNom ? nouvellePeriode : pp,
    );
    const nouveau: Projet = { ...ancien, periodes };
    this.donneesService.executer(
      new CommandeModification(
        (d) => d.projets,
        ancien,
        nouveau,
        LIBELLES.commandes.modificationPeriodeProjet,
      ),
    );
  }

  /**
   * Supprime une période d'un projet (retrouvée par `periodeNom`).
   * Sans effet si le projet ou la période n'existe pas.
   * @param projetId UUID du projet.
   * @param periodeNom Nom de la période à supprimer.
   */
  public supprimerPeriode(projetId: string, periodeNom: string): void {
    const donnees = this.donneesService.donnees();
    if (!donnees) return;
    const ancien = donnees.projets.find((p) => p.id === projetId);
    if (!ancien) return;
    const nouveau: Projet = {
      ...ancien,
      periodes: ancien.periodes.filter((pp) => pp.periodeNom !== periodeNom),
    };
    this.donneesService.executer(
      new CommandeModification(
        (d) => d.projets,
        ancien,
        nouveau,
        LIBELLES.commandes.suppressionPeriodeProjet,
      ),
    );
  }
}
