import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  WritableSignal,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ComposantBase } from '../../composant-base';
import { DonneesService } from '../../services/avecEtat/donnees.service';
import { ContexteService } from '../../services/avecEtat/contexte.service';
import { SauvegardeAutoService } from '../../services/sansEtat/sauvegarde-auto.service';
import { RechercheGlobaleService } from '../../services/sansEtat/recherche-globale.service';
import { McChampRechercheComponent } from '../mc-champ-recherche/mc-champ-recherche.component';
import { PopinSauvegardeComponent } from '../popins/popin-sauvegarde/popin-sauvegarde.component';
import { DateUtils } from '../../utilitaires/date.utils';
import type { ResultatRecherche } from '../../modeles/recherche.modele';

/**
 * Composant d'en-tête de l'application MaClasse.
 * Affiché en permanence au-dessus du routeur : logo, navigation, recherche globale,
 * actions SAUVEGARDER / ANNULER / REFAIRE et bascule de thème.
 * Aucun `input()` ni `output()` — injecte directement les services nécessaires.
 */
@Component({
  selector: 'mc-entete',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, McChampRechercheComponent, PopinSauvegardeComponent],
  templateUrl: './mc-entete.component.html',
  styleUrl: './mc-entete.component.scss',
})
export class McEnteteComponent extends ComposantBase {
  /** Données courantes et signaux UNDO/REDO/modifications. */
  protected readonly donneesService = inject(DonneesService);

  /** Contexte applicatif : thème, sélections, mot de passe. */
  private readonly contexteService = inject(ContexteService);

  /** Service de sauvegarde automatique et manuelle. */
  private readonly sauvegardeAutoService = inject(SauvegardeAutoService);

  /** Service de recherche globale. */
  private readonly rechercheGlobaleService = inject(RechercheGlobaleService);

  /** Routeur Angular pour la navigation depuis les résultats de recherche. */
  private readonly router = inject(Router);

  /** Contrôle la visibilité de la popin de saisie du mot de passe. */
  protected readonly popinSauvegardeVisible: WritableSignal<boolean> = signal(false);

  /** Résultats de la dernière recherche globale. */
  protected readonly resultatsRecherche: WritableSignal<ResultatRecherche[]> = signal([]);

  /** Contrôle la visibilité du panneau de résultats de recherche. */
  protected readonly listeResultatsVisible: WritableSignal<boolean> = signal(false);

  /** Texte du tooltip du bouton ANNULER : préfixe + libellé de la commande en sommet de pile. */
  protected readonly tooltipAnnuler: Signal<string> = computed(() => {
    const libelle = this.donneesService.libelleSommetUndo();
    return libelle
      ? this.LIBELLES.entete.tooltipPrefixeAnnuler + libelle
      : this.LIBELLES.entete.annuler;
  });

  /** Texte du tooltip du bouton REFAIRE : préfixe + libellé de la commande en sommet de pile. */
  protected readonly tooltipRefaire: Signal<string> = computed(() => {
    const libelle = this.donneesService.libelleSommetRedo();
    return libelle
      ? this.LIBELLES.entete.tooltipPrefixeRefaire + libelle
      : this.LIBELLES.entete.refaire;
  });

  /** Texte du tooltip du bouton SAUVEGARDER : horodatage ou message d'absence. */
  protected readonly tooltipSauvegarder: Signal<string> = computed(() => {
    const date = this.sauvegardeAutoService.dateDerniereSauvegarde();
    if (!date) return this.LIBELLES.entete.tooltipAucuneSauvegarde;
    return (
      this.LIBELLES.entete.tooltipDerniereSauvegarde +
      DateUtils.formaterDateCourt(date.toISOString().slice(0, 10)) +
      ' à ' +
      DateUtils.formaterHeure(date)
    );
  });

  /**
   * Déclenche la sauvegarde : ouvre la popin si aucun mot de passe n'est mémorisé,
   * sinon lance directement la sauvegarde via `SauvegardeAutoService`.
   */
  protected surSauvegarder(): void {
    if (!this.contexteService.motDePasse) {
      this.popinSauvegardeVisible.set(true);
    } else {
      void this.sauvegardeAutoService.sauvegarder();
    }
  }

  /**
   * Mémorise le mot de passe, ferme la popin, effectue la sauvegarde,
   * puis démarre la sauvegarde automatique périodique.
   * @param motDePasse Mot de passe de chiffrement saisi dans la popin.
   */
  protected surConfirmationSauvegarde(motDePasse: string): void {
    this.contexteService.motDePasse = motDePasse;
    this.popinSauvegardeVisible.set(false);
    void this.sauvegardeAutoService.sauvegarder().then(() => {
      this.sauvegardeAutoService.demarrer();
    });
  }

  /** Ferme la popin de sauvegarde sans effectuer d'opération. */
  protected surAnnulationSauvegarde(): void {
    this.popinSauvegardeVisible.set(false);
  }

  /**
   * Met à jour la liste des résultats et affiche le panneau.
   * @param terme Terme de recherche émis par `mc-champ-recherche`.
   */
  protected surRecherche(terme: string): void {
    const resultats = this.rechercheGlobaleService.rechercher(terme);
    this.resultatsRecherche.set(resultats);
    this.listeResultatsVisible.set(resultats.length > 0);
  }

  /**
   * Ferme le panneau de résultats si le focus quitte entièrement la zone de recherche.
   * Si le focus reste dans la zone (ex. : passage vers un item de résultat), le panneau reste ouvert.
   * @param event Événement `focusout` du conteneur de recherche.
   */
  protected surBlurZoneRecherche(event: FocusEvent): void {
    const conteneur = event.currentTarget as HTMLElement;
    if (!conteneur.contains(event.relatedTarget as Node)) {
      this.listeResultatsVisible.set(false);
    }
  }

  /**
   * Navigue vers l'écran correspondant au résultat sélectionné.
   * Pré-sélectionne l'élève ou le projet dans le contexte afin que l'écran cible
   * affiche directement la fiche concernée.
   * @param resultat Résultat de recherche sélectionné par l'utilisateur.
   */
  protected surSelectionResultat(resultat: ResultatRecherche): void {
    this.listeResultatsVisible.set(false);
    this.resultatsRecherche.set([]);
    if (resultat.type === 'eleve') {
      this.contexteService.eleveSelectionne.set(resultat.id);
    } else if (resultat.type === 'projet') {
      this.contexteService.projetSelectionne.set(resultat.id);
    }
    void this.router.navigate([resultat.route]);
  }

  /** Annule la dernière commande exécutée (UNDO). */
  protected surAnnuler(): void {
    this.donneesService.annuler();
  }

  /** Rétablit la dernière commande annulée (REDO). */
  protected surRefaire(): void {
    this.donneesService.refaire();
  }

  /** Passe au thème suivant dans le cycle des cinq thèmes disponibles. */
  protected surBasculerTheme(): void {
    this.contexteService.basculerTheme();
  }
}
