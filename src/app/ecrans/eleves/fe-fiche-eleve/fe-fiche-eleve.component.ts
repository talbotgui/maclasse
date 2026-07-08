/**
 * Sous-composant d'affichage en lecture seule de la fiche d'un élève.
 */

import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { InputSignal, OutputEmitterRef } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { LIBELLES } from '../../../libelles';
import { McAutoFocusDirective } from '../../../directives/mc-auto-focus.directive';
import { McBoutonDestructionComponent } from '../../../composants/mc-bouton-destruction/mc-bouton-destruction.component';
import { DateUtils } from '../../../utilitaires/date.utils';
import type { Eleve } from '../../../modeles/eleve.modele';
import type { Groupe, StatutEleve, TypeContact } from '../../../modeles/referentiels.modele';

/**
 * Affichage en lecture seule de la fiche d'un élève.
 * Émetteurs d'actions délégués à l'écran parent.
 */
@Component({
  selector: 'fe-fiche-eleve',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UpperCasePipe, McAutoFocusDirective, McBoutonDestructionComponent],
  templateUrl: './fe-fiche-eleve.component.html',
  styleUrl: './fe-fiche-eleve.component.scss',
})
export class FeFicheEleveComponent {
  /** Constante centralisée des libellés. */
  protected readonly LIBELLES = LIBELLES;

  /** Utilitaire de formatage de dates. */
  protected readonly DateUtils = DateUtils;

  /** Élève à afficher. */
  public readonly eleve: InputSignal<Eleve> = input.required<Eleve>();

  /** Demande le focus sur le bouton MODIFIER à l'apparition de la fiche. */
  public readonly focusDemande: InputSignal<boolean> = input(false);

  /** Groupes du référentiel pour résolution des libellés. */
  public readonly groupes: InputSignal<Groupe[]> = input<Groupe[]>([]);

  /** Statuts élève pour résolution du libellé. */
  public readonly statutsEleve: InputSignal<StatutEleve[]> = input<StatutEleve[]>([]);

  /** Types de contact pour résolution des libellés. */
  public readonly typesContact: InputSignal<TypeContact[]> = input<TypeContact[]>([]);

  /** Émis quand l'utilisateur clique sur MODIFIER. */
  public readonly modifier: OutputEmitterRef<void> = output<void>();

  /** Émis quand l'utilisateur confirme la suppression. */
  public readonly supprimer: OutputEmitterRef<void> = output<void>();

  /** Émis quand l'utilisateur clique sur IMPRIMER. */
  public readonly imprimer: OutputEmitterRef<void> = output<void>();

  /**
   * Résout le libellé d'un statut élève depuis son identifiant.
   * @param id Identifiant du statut.
   * @returns Libellé ou l'identifiant brut si non trouvé.
   */
  protected obtenirLibelleStatut(id: string): string {
    return this.statutsEleve().find((s) => s.id === id)?.libelle ?? id;
  }

  /**
   * Résout le libellé d'un type de contact depuis son identifiant.
   * @param id Identifiant du type.
   * @returns Libellé ou l'identifiant brut si non trouvé.
   */
  protected obtenirLibelleTypeContact(id: string): string {
    return this.typesContact().find((t) => t.id === id)?.libelle ?? id;
  }

  /**
   * Résout le libellé d'un groupe depuis son identifiant.
   * @param id Identifiant du groupe.
   * @returns Libellé ou l'identifiant brut si non trouvé.
   */
  protected obtenirLibelleGroupe(id: string): string {
    return this.groupes().find((g) => g.id === id)?.libelle ?? id;
  }

  /** Délègue au parent l'action de modification. */
  protected onModifier(): void {
    this.modifier.emit();
  }

  /** Délègue au parent l'action de suppression. */
  protected onSupprimer(): void {
    this.supprimer.emit();
  }

  /** Délègue au parent l'action d'impression. */
  protected onImprimer(): void {
    this.imprimer.emit();
  }
}
