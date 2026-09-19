/**
 * Écran de gestion des élèves : liste filtrée + fiche ou formulaire.
 */

import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { EcranEditionGardeeBase } from '../../ecran-edition-gardee-base';
import { LIBELLES } from '../../libelles';
import { DonneesService } from '../../services/avecEtat/donnees.service';
import { EleveService } from '../../services/sansEtat/eleve.service';
import { ContexteService } from '../../services/avecEtat/contexte.service';
import { McChampRechercheComponent } from '../../composants/mc-champ-recherche/mc-champ-recherche.component';
import { McChipFiltreComponent } from '../../composants/mc-chip-filtre/mc-chip-filtre.component';
import { PopinAvertissementComponent } from '../../composants/popins/popin-avertissement/popin-avertissement.component';
import { FeFicheEleveComponent } from './fe-fiche-eleve/fe-fiche-eleve.component';
import { FeFormulaireEleveComponent } from './fe-formulaire-eleve/fe-formulaire-eleve.component';
import type { Eleve } from '../../modeles/eleve.modele';

/**
 * Écran de gestion des élèves.
 * Layout deux colonnes : liste filtrée à gauche, fiche ou formulaire à droite.
 * Implémente `AvecNavigationGardee` pour protéger les modifications non enregistrées.
 */
@Component({
  selector: 'ecran-eleves',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    UpperCasePipe,
    McChampRechercheComponent,
    McChipFiltreComponent,
    PopinAvertissementComponent,
    FeFicheEleveComponent,
    FeFormulaireEleveComponent,
  ],
  templateUrl: './ecran-eleves.component.html',
  styleUrl: './ecran-eleves.component.scss',
})
export class EcranElevesComponent extends EcranEditionGardeeBase {
  /** Constante centralisée des libellés. */
  protected readonly LIBELLES = LIBELLES;

  /** Service de données : accès aux élèves et référentiels. */
  private readonly donneesService = inject(DonneesService);

  /** Service métier des élèves : CRUD et recherche. */
  private readonly eleveService = inject(EleveService);

  /** Contexte applicatif : élève sélectionné. */
  private readonly contexteService = inject(ContexteService);

  /** Terme de recherche textuel courant. */
  protected readonly termeRecherche = signal('');

  /** Groupes filtrés actifs (IDs). */
  protected readonly groupesFiltres = signal<string[]>([]);

  /** `true` si le focus doit se placer sur le bouton MODIFIER à la prochaine apparition de la fiche. */
  protected readonly focusModifierDemande = signal(false);

  /** Données de l'application. */
  private readonly donnees = computed(() => this.donneesService.donnees());

  /** Élève sélectionné depuis le contexte. */
  protected readonly eleveSelectionne = computed<Eleve | null>(() => {
    const id = this.contexteService.eleveSelectionne();
    if (!id) return null;
    return this.donnees()?.classe.eleves.find((e) => e.id === id) ?? null;
  });

  /** Liste des groupes du référentiel. */
  protected readonly groupes = computed(() => this.donnees()?.referentiels.groupes ?? []);

  /** Liste des statuts élève du référentiel. */
  protected readonly statutsEleve = computed(() => this.donnees()?.referentiels.statutsEleve ?? []);

  /** Liste des types de contact du référentiel. */
  protected readonly typesContact = computed(() => this.donnees()?.referentiels.typesContact ?? []);

  /** Élèves filtrés (recherche textuelle + chips de groupe) triés NOM Prénom. */
  protected readonly elevesAffiches = computed<Eleve[]>(() => {
    const terme = this.termeRecherche();
    const filtresGroupes = this.groupesFiltres();
    let eleves = this.eleveService.rechercherEleves(terme);
    if (filtresGroupes.length > 0) {
      eleves = eleves.filter((e) => e.groupes.some((g) => filtresGroupes.includes(g)));
    }
    return eleves;
  });

  /**
   * Tente de sélectionner un élève.
   * Si une édition est en cours, affiche la popin d'avertissement.
   * @param eleve Élève à sélectionner.
   */
  protected selectionnerEleve(eleve: Eleve): void {
    this.executerOuAvertir(() => this.activerEleve(eleve));
  }

  /**
   * Tente d'ouvrir le formulaire de création d'un élève.
   * Affiche la popin si une édition est en cours.
   */
  protected creerEleve(): void {
    this.executerOuAvertir(() => this.activerCreation());
  }

  /**
   * Enregistre les modifications de l'élève et repasse en mode lecture.
   * @param eleve Élève modifié (ou créé).
   */
  protected onEnregistrer(eleve: Eleve): void {
    if (this.eleveSelectionne()) {
      this.eleveService.modifierEleve(eleve);
    } else {
      this.eleveService.creerEleve(eleve);
      this.contexteService.eleveSelectionne.set(eleve.id);
    }
    this.enModeEdition.set(false);
    this.focusModifierDemande.set(true);
  }

  /** Annule l'édition et repasse en mode lecture. */
  protected onAnnulerEdition(): void {
    const revientVersFiche = !!this.eleveSelectionne();
    this.enModeEdition.set(false);
    if (!revientVersFiche) {
      this.contexteService.eleveSelectionne.set(null);
    }
    this.focusModifierDemande.set(revientVersFiche);
  }

  /** Supprime l'élève sélectionné. */
  protected supprimerEleve(): void {
    const eleve = this.eleveSelectionne();
    if (!eleve) return;
    this.eleveService.supprimerEleve(eleve.id);
    this.focusModifierDemande.set(false);
    this.contexteService.eleveSelectionne.set(null);
  }

  /**
   * Ajoute un groupe aux filtres actifs.
   * @param id Identifiant du groupe.
   */
  protected ajouterFiltreGroupe(id: string): void {
    this.groupesFiltres.update((ids) => [...ids, id]);
  }

  /**
   * Retire un groupe des filtres actifs.
   * @param id Identifiant du groupe.
   */
  protected retirerFiltreGroupe(id: string): void {
    this.groupesFiltres.update((ids) => ids.filter((i) => i !== id));
  }

  /** Active la sélection d'un élève et repasse en mode lecture. */
  private activerEleve(eleve: Eleve): void {
    this.focusModifierDemande.set(false);
    this.contexteService.eleveSelectionne.set(eleve.id);
    this.enModeEdition.set(false);
  }

  /** Active le mode création (réinitialise la sélection). */
  private activerCreation(): void {
    this.contexteService.eleveSelectionne.set(null);
    this.enModeEdition.set(true);
  }
}
