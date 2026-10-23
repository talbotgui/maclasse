/**
 * Onglet Bilans de l'écran Élèves : bilans de l'élève regroupés par sous-domaine.
 */

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import type { InputSignal, OutputEmitterRef, WritableSignal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { LIBELLES } from '../../../libelles';
import { McSelecteurCompetencesComponent } from '../../../composants/mc-selecteur-competences/mc-selecteur-competences.component';
import { BilanService } from '../../../services/sansEtat/bilan.service';
import { FeBilanComponent } from '../fe-bilan/fe-bilan.component';
import { FeBilanFormulaireComponent } from '../fe-bilan-formulaire/fe-bilan-formulaire.component';
import type { Bilan, EditionBilan, SectionSousDomaine } from '../../../modeles/bilan.modele';
import type { Eleve } from '../../../modeles/eleve.modele';
import type { StatutAcquisition } from '../../../modeles/referentiels.modele';

/**
 * Onglet Bilans : cadre « Ajouter un sous-domaine » puis un cadre par sous-domaine suivi.
 * Un seul bilan est en édition à la fois ; un nouveau bilan n'est enregistré qu'à VALIDER.
 * L'état d'édition est signalé au parent pour la garde de navigation.
 */
@Component({
  selector: 'fe-onglet-bilans',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UpperCasePipe, McSelecteurCompetencesComponent, FeBilanComponent, FeBilanFormulaireComponent],
  templateUrl: './fe-onglet-bilans.component.html',
  styleUrl: './fe-onglet-bilans.component.scss',
})
export class FeOngletBilansComponent {
  /** Constante centralisée des libellés. */
  protected readonly LIBELLES = LIBELLES;

  /** Profondeur des sous-domaines, exposée au sélecteur. */
  protected readonly niveauSousDomaine = BilanService.NIVEAU_SOUS_DOMAINE;

  /** Séparateur des libellés de sous-domaine, exposé au sélecteur. */
  protected readonly separateurLibelle = BilanService.SEPARATEUR_LIBELLE;

  /** Élève dont les bilans sont affichés. */
  public readonly eleve: InputSignal<Eleve> = input.required<Eleve>();

  /** Statuts d'acquisition du référentiel. */
  public readonly statutsAcquisition: InputSignal<StatutAcquisition[]> =
    input<StatutAcquisition[]>([]);

  /** Émis avec `true` quand un bilan passe en édition, `false` quand l'édition se termine. */
  protected readonly editionChange: OutputEmitterRef<boolean> = output<boolean>();

  /** Émis pour imprimer les bilans. */
  protected readonly imprimer: OutputEmitterRef<void> = output<void>();

  /** Identifiant du champ de recherche du cadre d'ajout. */
  private static readonly ID_CHAMP_AJOUT = 'rechercheCompetencesSousDomaine';

  /** Service métier des bilans. */
  private readonly bilanService = inject(BilanService);

  /** Élément hôte, pour retrouver l'élément à focaliser après un rendu. */
  private readonly hote: ElementRef<HTMLElement> = inject(ElementRef);

  /** Injecteur, pour programmer une mise au point après le prochain rendu. */
  private readonly injecteur = inject(Injector);

  /** Sous-domaine choisi dans le cadre d'ajout, ou `null`. */
  protected readonly sousDomaineChoisi: WritableSignal<string | null> = signal(null);

  /** Bilan en cours d'édition, ou `null`. */
  protected readonly edition: WritableSignal<EditionBilan | null> = signal(null);

  /** Identifiants des bilans dépliés. */
  protected readonly deplies: WritableSignal<ReadonlySet<string>> = signal(new Set());

  /** Identifiant du bilan dont le bouton MODIFIER doit recevoir le focus, ou `null`. */
  protected readonly focusModifierId: WritableSignal<string | null> = signal(null);

  /** Sous-domaines affichés, dans l'ordre d'ajout, avec le nouveau bilan éventuel. */
  protected readonly sections = computed<SectionSousDomaine[]>(() => {
    const edition = this.edition();
    const sections: SectionSousDomaine[] = this.eleve().suivisSousDomaines.map((suivi) => ({
      sousDomaineId: suivi.sousDomaineId,
      libelle: this.obtenirLibelle(suivi.sousDomaineId),
      bilans: [...suivi.bilans],
      nombreEnregistres: suivi.bilans.length,
    }));
    if (edition?.nouveau) {
      let section = sections.find((s) => s.sousDomaineId === edition.sousDomaineId);
      if (!section) {
        section = {
          sousDomaineId: edition.sousDomaineId,
          libelle: this.obtenirLibelle(edition.sousDomaineId),
          bilans: [],
          nombreEnregistres: 0,
        };
        sections.push(section);
      }
      section.bilans.push(edition.bilan);
    }
    return sections;
  });

  /**
   * Réinitialise l'onglet quand l'élève affiché change, et ferme l'édition d'un bilan
   * enregistré qui n'existe plus (ex. ANNULER global de l'entête pendant la saisie).
   */
  public constructor() {
    let idEleve: string | null = null;
    effect(() => {
      const eleve = this.eleve();
      if (idEleve !== null && eleve.id !== idEleve) {
        untracked(() => this.reinitialiser());
      } else {
        const edition = untracked(() => this.edition());
        const existe = eleve.suivisSousDomaines.some((s) =>
          s.bilans.some((b) => b.id === edition?.bilan.id),
        );
        if (edition && !edition.nouveau && !existe) {
          untracked(() => this.terminerEdition(null));
        }
      }
      idEleve = eleve.id;
    });
  }

  /**
   * Mémorise le sous-domaine choisi dans le cadre d'ajout.
   * @param ids Sélection émise par le sélecteur (au plus un identifiant).
   */
  protected choisirSousDomaine(ids: string[]): void {
    this.sousDomaineChoisi.set(ids[0] ?? null);
  }

  /** Ouvre un nouveau bilan, en édition, dans le sous-domaine choisi. */
  protected ajouterBilan(): void {
    const sousDomaineId = this.sousDomaineChoisi();
    if (!sousDomaineId || this.edition()) return;
    this.demarrerEdition({
      sousDomaineId,
      bilan: this.bilanService.creerBilanVierge(),
      nouveau: true,
    });
    this.sousDomaineChoisi.set(null);
  }

  /**
   * Passe un bilan enregistré en édition.
   * @param sousDomaineId Sous-domaine du bilan.
   * @param bilan Bilan à modifier.
   */
  protected modifierBilan(sousDomaineId: string, bilan: Bilan): void {
    if (this.edition()) return;
    this.demarrerEdition({ sousDomaineId, bilan, nouveau: false });
  }

  /**
   * Enregistre le bilan saisi et repasse en lecture, bilan déplié.
   * @param sousDomaineId Sous-domaine du bilan.
   * @param bilan Bilan saisi.
   */
  protected validerBilan(sousDomaineId: string, bilan: Bilan): void {
    this.bilanService.enregistrerBilan(this.eleve().id, sousDomaineId, bilan);
    this.terminerEdition(bilan.id);
  }

  /**
   * Abandonne la saisie : un nouveau bilan disparaît (le focus revient au champ d'ajout),
   * un bilan existant reste inchangé (le focus revient à son bouton MODIFIER).
   */
  protected annulerEdition(): void {
    const edition = this.edition();
    if (edition && !edition.nouveau) {
      this.terminerEdition(edition.bilan.id);
    } else {
      this.terminerEdition(null);
      this.focaliserApresRendu(FeOngletBilansComponent.ID_CHAMP_AJOUT);
    }
  }

  /**
   * Duplique un bilan en fin de sous-domaine.
   * @param sousDomaineId Sous-domaine du bilan.
   * @param bilanId Identifiant du bilan.
   */
  protected dupliquerBilan(sousDomaineId: string, bilanId: string): void {
    this.bilanService.dupliquerBilan(this.eleve().id, sousDomaineId, bilanId);
  }

  /**
   * Déplace un bilan d'une position dans son sous-domaine.
   * @param sousDomaineId Sous-domaine du bilan.
   * @param bilanId Identifiant du bilan.
   * @param decalage `-1` pour monter, `1` pour descendre.
   */
  protected deplacerBilan(sousDomaineId: string, bilanId: string, decalage: -1 | 1): void {
    this.bilanService.deplacerBilan(this.eleve().id, sousDomaineId, bilanId, decalage);
  }

  /**
   * Supprime un bilan (le sous-domaine disparaît avec son dernier bilan).
   * @param sousDomaineId Sous-domaine du bilan.
   * @param bilanId Identifiant du bilan.
   */
  protected supprimerBilan(sousDomaineId: string, bilanId: string): void {
    const bilans = this.sections().find((s) => s.sousDomaineId === sousDomaineId)?.bilans ?? [];
    const index = bilans.findIndex((b) => b.id === bilanId);
    const voisin = bilans[index + 1] ?? bilans[index - 1];
    this.bilanService.supprimerBilan(this.eleve().id, sousDomaineId, bilanId);
    this.focaliserApresRendu(
      voisin ? 'btnBasculerBilan_' + voisin.id : FeOngletBilansComponent.ID_CHAMP_AJOUT,
    );
  }

  /**
   * Replie ou déplie un bilan.
   * @param bilanId Identifiant du bilan.
   */
  protected basculerBilan(bilanId: string): void {
    this.modifierDeplies([bilanId], !this.deplies().has(bilanId));
  }

  /**
   * Déplie ou replie tous les bilans d'un sous-domaine.
   * @param section Sous-domaine concerné.
   * @param deplier `true` pour déplier, `false` pour replier.
   */
  protected deplierTout(section: SectionSousDomaine, deplier: boolean): void {
    this.modifierDeplies(
      section.bilans.map((b) => b.id),
      deplier,
    );
  }

  /**
   * Indique si un bilan est en cours d'édition.
   * @param bilanId Identifiant du bilan.
   * @returns `true` si le bilan est affiché en formulaire.
   */
  protected estEnEdition(bilanId: string): boolean {
    return this.edition()?.bilan.id === bilanId;
  }

  /** Demande l'impression des bilans. */
  protected onImprimer(): void {
    this.imprimer.emit();
  }

  /**
   * Signale au parent le début ou la fin d'une édition.
   * @param enEdition `true` si un bilan est en édition.
   */
  protected onEditionChange(enEdition: boolean): void {
    this.editionChange.emit(enEdition);
  }

  /**
   * Ouvre l'édition d'un bilan et le déplie.
   * @param edition Bilan à éditer.
   */
  private demarrerEdition(edition: EditionBilan): void {
    this.focusModifierId.set(null);
    this.edition.set(edition);
    this.modifierDeplies([edition.bilan.id], true);
    this.onEditionChange(true);
  }

  /**
   * Ferme l'édition en cours.
   * @param bilanAFocaliser Bilan dont le bouton MODIFIER reçoit le focus, ou `null`.
   */
  private terminerEdition(bilanAFocaliser: string | null): void {
    this.edition.set(null);
    this.focusModifierId.set(bilanAFocaliser);
    this.onEditionChange(false);
  }

  /**
   * Place le focus sur un élément de l'onglet une fois le rendu suivant effectué,
   * quand l'élément qui avait le focus vient d'être retiré du DOM.
   * @param id Identifiant HTML de l'élément à focaliser.
   */
  private focaliserApresRendu(id: string): void {
    afterNextRender(
      () => this.hote.nativeElement.querySelector<HTMLElement>('#' + CSS.escape(id))?.focus(),
      { injector: this.injecteur },
    );
  }

  /** Abandonne toute saisie et replie les bilans (changement d'élève). */
  private reinitialiser(): void {
    const enEdition = this.edition() !== null;
    this.edition.set(null);
    this.sousDomaineChoisi.set(null);
    this.deplies.set(new Set());
    this.focusModifierId.set(null);
    if (enEdition) this.onEditionChange(false);
  }

  /**
   * Ajoute ou retire des bilans de l'ensemble des bilans dépliés.
   * @param ids Identifiants des bilans.
   * @param deplier `true` pour déplier, `false` pour replier.
   */
  private modifierDeplies(ids: string[], deplier: boolean): void {
    this.deplies.update((courant) => {
      const suivant = new Set(courant);
      ids.forEach((id) => (deplier ? suivant.add(id) : suivant.delete(id)));
      return suivant;
    });
  }

  /**
   * Libellé complet d'un sous-domaine, ou son identifiant s'il est introuvable.
   * @param sousDomaineId Identifiant du sous-domaine.
   * @returns Libellé à afficher.
   */
  private obtenirLibelle(sousDomaineId: string): string {
    return this.bilanService.obtenirLibelleSousDomaine(sousDomaineId) || sousDomaineId;
  }
}
