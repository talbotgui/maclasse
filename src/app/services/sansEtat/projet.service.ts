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
   * Modifie une période d'un projet (retrouvée par `id`).
   * Sans effet si le projet ou la période n'existe pas.
   * @param projetId UUID du projet.
   * @param anciennePeriode Période actuelle (son `id` sert de clé).
   * @param nouvellePeriode Nouvelle valeur de la période.
   */
  public modifierPeriode(
    projetId: string,
    anciennePeriode: ProjetPeriode,
    nouvellePeriode: ProjetPeriode,
  ): void {
    this.modifierProjetExistant(
      projetId,
      LIBELLES.commandes.modificationPeriodeProjet,
      (projet) => ({
        ...projet,
        periodes: projet.periodes.map((pp) =>
          pp.id === anciennePeriode.id ? nouvellePeriode : pp,
        ),
      }),
    );
  }

  /**
   * Remplace un projet existant par sa version transformée, en une commande annulable.
   * Sans effet si le projet n'existe pas ou si aucune donnée n'est chargée.
   * @param projetId UUID du projet.
   * @param libelle Description courte de la commande (tooltip UNDO/REDO).
   * @param transformer Fonction produisant la nouvelle version du projet.
   */
  private modifierProjetExistant(
    projetId: string,
    libelle: string,
    transformer: (projet: Projet) => Projet,
  ): void {
    const ancien = this.donneesService.donnees()?.projets.find((p) => p.id === projetId);
    if (!ancien) return;
    this.donneesService.executer(
      new CommandeModification((d) => d.projets, ancien, transformer(ancien), libelle),
    );
  }
}
