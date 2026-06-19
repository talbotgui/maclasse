/**
 * Écran de gestion des projets pédagogiques.
 */

import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { LIBELLES } from '../../libelles';
import { DonneesService } from '../../services/avecEtat/donnees.service';
import { ProjetService } from '../../services/sansEtat/projet.service';
import { CompetenceService } from '../../services/sansEtat/competence.service';
import { McChampRechercheComponent } from '../../composants/mc-champ-recherche/mc-champ-recherche.component';
import { McChipFiltreComponent } from '../../composants/mc-chip-filtre/mc-chip-filtre.component';
import { PopinAvertissementComponent } from '../../composants/popins/popin-avertissement/popin-avertissement.component';
import { FpFicheProjetComponent } from './fp-fiche-projet/fp-fiche-projet.component';
import { FpFormulaireProjetComponent } from './fp-formulaire-projet/fp-formulaire-projet.component';
import type { AvecNavigationGardee } from '../../gardes/modifications-non-enregistrees.garde';
import type { Projet } from '../../modeles/projet.modele';

/**
 * Écran de gestion des projets pédagogiques.
 * Layout deux colonnes : liste filtrée à gauche, fiche ou formulaire à droite.
 */
@Component({
  selector: 'ecran-projets',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    McChampRechercheComponent,
    McChipFiltreComponent,
    PopinAvertissementComponent,
    FpFicheProjetComponent,
    FpFormulaireProjetComponent,
  ],
  templateUrl: './ecran-projets.component.html',
  styleUrl: './ecran-projets.component.scss',
})
export class EcranProjetsComponent implements AvecNavigationGardee {
  /** Constante centralisée des libellés. */
  protected readonly LIBELLES = LIBELLES;

  /** Service de données. */
  private readonly donneesService = inject(DonneesService);

  /** Service métier des projets. */
  private readonly projetService = inject(ProjetService);

  /** Service de compétences pour le filtrage par domaine. */
  private readonly competenceService = inject(CompetenceService);

  /** Terme de recherche textuel courant. */
  protected readonly termeRecherche = signal('');

  /** Domaines filtrés actifs (IDs). */
  protected readonly domainesFiltres = signal<string[]>([]);

  /** Projet actuellement sélectionné. */
  protected readonly projetSelectionne = signal<Projet | null>(null);

  /** `true` si le formulaire est en mode édition ou création. */
  protected readonly enModeEdition = signal(false);

  /** `true` si la popin d'avertissement est visible. */
  protected readonly popinAvertissementVisible = signal(false);

  /** Résolution de la promesse de navigation (garde CanDeactivate). */
  private resolveGarde: ((result: boolean) => void) | null = null;

  /** Action en attente de confirmation. */
  private actionEnAttente: (() => void) | null = null;

  /** Domaines du premier niveau de l'arbre des compétences. */
  protected readonly domaines = computed(() => this.competenceService.obtenirDomaines());

  /** Projets filtrés (recherche textuelle + chips de domaine). */
  protected readonly projetsAffiches = computed<Projet[]>(() => {
    const terme = this.termeRecherche();
    const filtresDomaines = this.domainesFiltres();
    let projets = this.projetService.rechercherProjets(terme);
    if (filtresDomaines.length > 0) {
      projets = projets.filter(p =>
        p.periodes.some(periode =>
          periode.competencesIds.some(cId => {
            const chemin = this.competenceService.obtenirChemin(cId);
            return chemin.length > 0 && filtresDomaines.includes(chemin[0].id);
          }),
        ),
      );
    }
    return projets;
  });

  /**
   * Tente de sélectionner un projet.
   * @param projet Projet à sélectionner.
   */
  protected selectionnerProjet(projet: Projet): void {
    if (this.enModeEdition()) {
      this.actionEnAttente = () => this.activerProjet(projet);
      this.popinAvertissementVisible.set(true);
    } else {
      this.activerProjet(projet);
    }
  }

  /** Tente d'ouvrir le formulaire de création. */
  protected creerProjet(): void {
    if (this.enModeEdition()) {
      this.actionEnAttente = () => this.activerCreation();
      this.popinAvertissementVisible.set(true);
    } else {
      this.activerCreation();
    }
  }

  /** Confirme l'avertissement et exécute l'action en attente. */
  protected confirmerAvertissement(): void {
    this.popinAvertissementVisible.set(false);
    if (this.resolveGarde) {
      this.resolveGarde(true);
      this.resolveGarde = null;
    } else {
      this.actionEnAttente?.();
      this.actionEnAttente = null;
    }
    this.enModeEdition.set(false);
  }

  /** Annule l'avertissement et reste sur le formulaire. */
  protected annulerAvertissement(): void {
    this.popinAvertissementVisible.set(false);
    if (this.resolveGarde) {
      this.resolveGarde(false);
      this.resolveGarde = null;
    }
    this.actionEnAttente = null;
  }

  /** Active le mode édition du projet sélectionné. */
  protected activerEdition(): void {
    this.enModeEdition.set(true);
  }

  /**
   * Enregistre les modifications et repasse en mode lecture.
   * @param projet Projet modifié ou créé.
   */
  protected onEnregistrer(projet: Projet): void {
    if (this.projetSelectionne()) {
      this.projetService.modifierProjet(projet);
    } else {
      this.projetService.creerProjet(projet);
    }
    this.projetSelectionne.set(
      this.donneesService.donnees()?.projets.find(p => p.id === projet.id) ?? projet,
    );
    this.enModeEdition.set(false);
  }

  /** Annule l'édition et repasse en mode lecture. */
  protected onAnnulerEdition(): void {
    this.enModeEdition.set(false);
    if (!this.projetSelectionne()) {
      this.projetSelectionne.set(null);
    }
  }

  /** Supprime le projet sélectionné. */
  protected supprimerProjet(): void {
    const projet = this.projetSelectionne();
    if (!projet) return;
    this.projetService.supprimerProjet(projet.id);
    this.projetSelectionne.set(null);
  }

  /**
   * Bascule un domaine dans les filtres actifs.
   * @param id Identifiant du domaine.
   * @param actif Nouvel état du chip.
   */
  protected basculerFiltreDomaine(id: string, actif: boolean): void {
    if (actif) {
      this.domainesFiltres.update(ids => [...ids, id]);
    } else {
      this.domainesFiltres.update(ids => ids.filter(i => i !== id));
    }
  }

  /** Lance l'impression du projet. */
  protected imprimer(): void {
    window.print();
  }

  /** Implémentation de `AvecNavigationGardee`. */
  public confirmerNavigation(): Promise<boolean> {
    if (!this.enModeEdition()) return Promise.resolve(true);
    return new Promise<boolean>(resolve => {
      this.resolveGarde = resolve;
      this.popinAvertissementVisible.set(true);
    });
  }

  /** Active un projet et repasse en mode lecture. */
  private activerProjet(projet: Projet): void {
    this.projetSelectionne.set(projet);
    this.enModeEdition.set(false);
  }

  /** Active le mode création. */
  private activerCreation(): void {
    this.projetSelectionne.set(null);
    this.enModeEdition.set(true);
  }
}
