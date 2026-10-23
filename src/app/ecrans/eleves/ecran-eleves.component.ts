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
import { McOngletsComponent } from '../../composants/mc-onglets/mc-onglets.component';
import { PopinAvertissementComponent } from '../../composants/popins/popin-avertissement/popin-avertissement.component';
import { FeFicheEleveComponent } from './fe-fiche-eleve/fe-fiche-eleve.component';
import { FeFormulaireEleveComponent } from './fe-formulaire-eleve/fe-formulaire-eleve.component';
import { FeOngletBilansComponent } from './fe-onglet-bilans/fe-onglet-bilans.component';
import type { Eleve } from '../../modeles/eleve.modele';
import type { Onglet } from '../../modeles/composants.modele';

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
    McOngletsComponent,
    PopinAvertissementComponent,
    FeFicheEleveComponent,
    FeFormulaireEleveComponent,
    FeOngletBilansComponent,
  ],
  templateUrl: './ecran-eleves.component.html',
  styleUrl: './ecran-eleves.component.scss',
})
export class EcranElevesComponent extends EcranEditionGardeeBase {
  /** Identifiant de l'onglet de la fiche administrative (identité, contacts, absences…). */
  protected static readonly ONGLET_FICHE_ADMINISTRATIVE = 'FicheAdministrative';

  /** Identifiant de l'onglet des bilans par sous-domaine de compétences. */
  protected static readonly ONGLET_BILANS = 'Bilans';

  /** Constante centralisée des libellés. */
  protected readonly LIBELLES = LIBELLES;

  /** Identifiant de l'onglet de la fiche administrative, exposé au template. */
  protected readonly ongletFicheAdministrative = EcranElevesComponent.ONGLET_FICHE_ADMINISTRATIVE;

  /** Identifiant de l'onglet des bilans, exposé au template. */
  protected readonly ongletBilans = EcranElevesComponent.ONGLET_BILANS;

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

  /** Onglet affiché dans la colonne droite, conservé lors d'un changement d'élève. */
  protected readonly ongletActif = signal(EcranElevesComponent.ONGLET_FICHE_ADMINISTRATIVE);

  /** `true` si un bilan est en cours d'édition dans l'onglet Bilans. */
  protected readonly bilanEnEdition = signal(false);

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

  /** Onglets de la colonne droite ; les bilans sont indisponibles tant que l'élève n'est pas enregistré. */
  protected readonly onglets = computed<Onglet[]>(() => [
    {
      id: EcranElevesComponent.ONGLET_FICHE_ADMINISTRATIVE,
      libelle: LIBELLES.eleve.ongletFicheAdministrative,
    },
    {
      id: EcranElevesComponent.ONGLET_BILANS,
      libelle: LIBELLES.eleve.ongletBilans,
      desactive: !this.eleveSelectionne(),
    },
  ]);

  /** Liste des groupes du référentiel. */
  protected readonly groupes = computed(() => this.donnees()?.referentiels.groupes ?? []);

  /** Liste des statuts élève du référentiel. */
  protected readonly statutsEleve = computed(() => this.donnees()?.referentiels.statutsEleve ?? []);

  /** Liste des statuts d'acquisition du référentiel. */
  protected readonly statutsAcquisition = computed(
    () => this.donnees()?.referentiels.statutsAcquisition ?? [],
  );

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
   * Une saisie est en cours dans le formulaire de l'élève ou dans un bilan.
   * @returns `true` si quitter la saisie demande confirmation.
   */
  protected override verifierEditionEnCours(): boolean {
    return this.enModeEdition() || this.bilanEnEdition();
  }

  /** Abandonne le formulaire de l'élève et le bilan en cours d'édition. */
  protected override abandonnerEdition(): void {
    super.abandonnerEdition();
    this.bilanEnEdition.set(false);
  }

  /**
   * Mémorise l'état d'édition des bilans, signalé par l'onglet Bilans.
   * @param enEdition `true` si un bilan est en édition.
   */
  protected traiterEditionBilan(enEdition: boolean): void {
    this.bilanEnEdition.set(enEdition);
  }

  /**
   * Tente d'afficher un onglet. Affiche la popin si une édition est en cours.
   * @param id Identifiant de l'onglet demandé.
   */
  protected selectionnerOnglet(id: string): void {
    this.executerOuAvertir(() => this.ongletActif.set(id));
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
    this.ongletActif.set(EcranElevesComponent.ONGLET_FICHE_ADMINISTRATIVE);
    this.enModeEdition.set(true);
  }
}
