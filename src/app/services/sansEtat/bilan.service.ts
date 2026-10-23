/**
 * Service métier gérant les bilans des élèves, regroupés par sous-domaine de compétences.
 * Toute mutation transite par `DonneesService.executer()`.
 */

import { Injectable, inject } from '@angular/core';
import {
  Bilan,
  EvaluationBilan,
  SousDomaineDisponible,
  SuiviSousDomaine,
} from '../../modeles/bilan.modele';
import { Competence } from '../../modeles/referentiels.modele';
import { CommandeModification } from '../../commandes/commande-modification';
import { DonneesService } from '../avecEtat/donnees.service';
import { CompetenceService } from './competence.service';
import { DateUtils } from '../../utilitaires/date.utils';
import { LIBELLES } from '../../libelles';

/**
 * Service sans état exposant la lecture des sous-domaines de compétences et
 * l'enregistrement, la suppression, la duplication et le déplacement des bilans.
 * Chaque mutation produit une seule commande de modification de l'élève (une entrée UNDO).
 */
@Injectable({ providedIn: 'root' })
export class BilanService {
  /** Séparateur des niveaux dans le libellé complet d'un sous-domaine. */
  public static readonly SEPARATEUR_LIBELLE = ' > ';

  /** Profondeur, depuis la racine, des sous-domaines dans l'arbre des compétences. */
  private static readonly NIVEAU_SOUS_DOMAINE = 3;

  /** Accès aux données de l'application et soumission des commandes. */
  private readonly donneesService = inject(DonneesService);

  /** Navigation dans l'arbre des compétences (domaines actifs). */
  private readonly competenceService = inject(CompetenceService);

  /**
   * Liste les sous-domaines (nœuds de niveau 3) des domaines actifs, dans l'ordre de l'arbre.
   * @returns Sous-domaines avec leur libellé complet `N1 > N2 > N3`.
   */
  public obtenirSousDomaines(): SousDomaineDisponible[] {
    const resultats: SousDomaineDisponible[] = [];
    const parcourir = (noeud: Competence, chemin: string[]): void => {
      const cheminCourant = [...chemin, noeud.libelle];
      if (cheminCourant.length === BilanService.NIVEAU_SOUS_DOMAINE) {
        resultats.push({
          id: noeud.id,
          libelle: cheminCourant.join(BilanService.SEPARATEUR_LIBELLE),
        });
        return;
      }
      noeud.enfants?.forEach((enfant) => parcourir(enfant, cheminCourant));
    };
    this.competenceService.obtenirDomaines().forEach((domaine) => parcourir(domaine, []));
    return resultats;
  }

  /**
   * Retourne le libellé complet `N1 > N2 > N3` d'un sous-domaine.
   * @param sousDomaineId Identifiant de la compétence de niveau 3.
   * @returns Libellé complet, ou `''` si le sous-domaine est introuvable.
   */
  public obtenirLibelleSousDomaine(sousDomaineId: string): string {
    return this.competenceService
      .obtenirChemin(sousDomaineId)
      .map((n) => n.libelle)
      .join(BilanService.SEPARATEUR_LIBELLE);
  }

  /**
   * Liste les compétences évaluables (feuilles) d'un sous-domaine, dans l'ordre de l'arbre.
   * @param sousDomaineId Identifiant de la compétence de niveau 3.
   * @returns Feuilles du sous-arbre, ou `[]` si le sous-domaine est introuvable.
   */
  public obtenirCompetencesEvaluables(sousDomaineId: string): Competence[] {
    const sousDomaine = this.competenceService.obtenirChemin(sousDomaineId).at(-1);
    if (!sousDomaine) return [];
    const feuilles: Competence[] = [];
    const parcourir = (noeud: Competence): void => {
      if (noeud.enfants?.length) noeud.enfants.forEach(parcourir);
      else feuilles.push(noeud);
    };
    sousDomaine.enfants?.forEach(parcourir);
    return feuilles;
  }

  /**
   * Crée un bilan vierge, daté du jour et sans titre. Il n'est pas enregistré.
   * @returns Nouveau bilan avec un identifiant unique.
   */
  public creerBilanVierge(): Bilan {
    return {
      id: crypto.randomUUID(),
      date: DateUtils.dateAujourdhui(),
      titre: '',
      bilans: '',
      besoinsSpecifiques: '',
      moyens: '',
      evaluations: [],
    };
  }

  /**
   * Crée une ligne d'évaluation vierge.
   * @returns Nouvelle évaluation sans compétence ni statut.
   */
  public creerEvaluationVierge(): EvaluationBilan {
    return { id: crypto.randomUUID(), competenceId: '', statutAcquisitionId: null, commentaire: '' };
  }

  /**
   * Enregistre un bilan : le remplace s'il existe déjà dans le sous-domaine, sinon l'ajoute
   * en dernière position (le suivi du sous-domaine est créé s'il n'existe pas).
   * Sans effet si l'élève est introuvable.
   * @param eleveId Identifiant de l'élève.
   * @param sousDomaineId Identifiant du sous-domaine du bilan.
   * @param bilan Bilan à enregistrer.
   */
  public enregistrerBilan(eleveId: string, sousDomaineId: string, bilan: Bilan): void {
    this.modifierSuivis(eleveId, LIBELLES.commandes.enregistrementBilan, (suivis) => {
      let suivi = suivis.find((s) => s.sousDomaineId === sousDomaineId);
      if (!suivi) {
        suivi = { sousDomaineId, bilans: [] };
        suivis.push(suivi);
      }
      const index = suivi.bilans.findIndex((b) => b.id === bilan.id);
      if (index === -1) suivi.bilans.push(structuredClone(bilan));
      else suivi.bilans[index] = structuredClone(bilan);
      return true;
    });
  }

  /**
   * Supprime un bilan. Le suivi du sous-domaine est retiré s'il ne contient plus de bilan.
   * Sans effet si l'élève ou le bilan est introuvable.
   * @param eleveId Identifiant de l'élève.
   * @param sousDomaineId Identifiant du sous-domaine du bilan.
   * @param bilanId Identifiant du bilan à supprimer.
   */
  public supprimerBilan(eleveId: string, sousDomaineId: string, bilanId: string): void {
    this.modifierSuivis(eleveId, LIBELLES.commandes.suppressionBilan, (suivis) => {
      const indexSuivi = suivis.findIndex((s) => s.sousDomaineId === sousDomaineId);
      const suivi = suivis[indexSuivi];
      const index = suivi?.bilans.findIndex((b) => b.id === bilanId) ?? -1;
      if (index === -1) return false;
      suivi.bilans.splice(index, 1);
      if (suivi.bilans.length === 0) suivis.splice(indexSuivi, 1);
      return true;
    });
  }

  /**
   * Duplique un bilan en dernière position de son sous-domaine, avec de nouveaux identifiants.
   * Sans effet si l'élève ou le bilan est introuvable.
   * @param eleveId Identifiant de l'élève.
   * @param sousDomaineId Identifiant du sous-domaine du bilan.
   * @param bilanId Identifiant du bilan à dupliquer.
   */
  public dupliquerBilan(eleveId: string, sousDomaineId: string, bilanId: string): void {
    this.modifierSuivis(eleveId, LIBELLES.commandes.duplicationBilan, (suivis) => {
      const suivi = suivis.find((s) => s.sousDomaineId === sousDomaineId);
      const source = suivi?.bilans.find((b) => b.id === bilanId);
      if (!suivi || !source) return false;
      suivi.bilans.push({
        ...structuredClone(source),
        id: crypto.randomUUID(),
        evaluations: source.evaluations.map((ev) => ({ ...ev, id: crypto.randomUUID() })),
      });
      return true;
    });
  }

  /**
   * Déplace un bilan d'une position vers le haut (`-1`) ou vers le bas (`1`) dans son sous-domaine.
   * Sans effet si l'élève ou le bilan est introuvable, ou si le bilan est déjà à l'extrémité visée.
   * @param eleveId Identifiant de l'élève.
   * @param sousDomaineId Identifiant du sous-domaine du bilan.
   * @param bilanId Identifiant du bilan à déplacer.
   * @param decalage `-1` pour monter, `1` pour descendre.
   */
  public deplacerBilan(
    eleveId: string,
    sousDomaineId: string,
    bilanId: string,
    decalage: -1 | 1,
  ): void {
    this.modifierSuivis(eleveId, LIBELLES.commandes.deplacementBilan, (suivis) => {
      const bilans = suivis.find((s) => s.sousDomaineId === sousDomaineId)?.bilans ?? [];
      const index = bilans.findIndex((b) => b.id === bilanId);
      const cible = index + decalage;
      if (index === -1 || cible < 0 || cible >= bilans.length) return false;
      [bilans[index], bilans[cible]] = [bilans[cible], bilans[index]];
      return true;
    });
  }

  /**
   * Applique une transformation aux suivis d'un élève cloné, puis soumet la modification
   * de l'élève sous forme d'une commande. Rien n'est soumis si l'élève est introuvable
   * ou si la transformation signale qu'elle n'a rien modifié.
   * @param eleveId Identifiant de l'élève.
   * @param libelle Libellé de la commande (tooltip UNDO/REDO).
   * @param transformer Mute les suivis clonés ; retourne `false` si rien n'a été modifié.
   */
  private modifierSuivis(
    eleveId: string,
    libelle: string,
    transformer: (suivis: SuiviSousDomaine[]) => boolean,
  ): void {
    const ancien = this.donneesService.donnees()?.classe.eleves.find((e) => e.id === eleveId);
    if (!ancien) return;
    const nouveau = structuredClone(ancien);
    if (!transformer(nouveau.suivisSousDomaines)) return;
    this.donneesService.executer(
      new CommandeModification((d) => d.classe.eleves, ancien, nouveau, libelle),
    );
  }
}
