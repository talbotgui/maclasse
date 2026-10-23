import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  viewChildren,
} from '@angular/core';
import type { InputSignal, OutputEmitterRef, Signal } from '@angular/core';
import { ComposantBase } from '../../composant-base';
import type { Onglet } from '../../modeles/composants.modele';

/**
 * Barre d'onglets accessible (pattern WAI-ARIA *Tabs*, activation manuelle).
 * Les flèches ←/→ et Début/Fin déplacent le focus entre les onglets actifs ;
 * Entrée ou Espace (clic natif du bouton) demande la sélection de l'onglet focalisé.
 * Le composant ne mémorise pas l'onglet actif : le parent décide de la sélection
 * (il peut la refuser, par exemple pour protéger une saisie non enregistrée).
 */
@Component({
  selector: 'mc-onglets',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mc-onglets.component.html',
  styleUrl: './mc-onglets.component.scss',
})
export class McOngletsComponent extends ComposantBase {
  /** Onglets affichés, dans l'ordre. */
  public readonly onglets: InputSignal<Onglet[]> = input.required<Onglet[]>();

  /** Identifiant de l'onglet actuellement sélectionné. */
  public readonly ongletActif: InputSignal<string> = input.required<string>();

  /** Nom accessible de la barre d'onglets. */
  public readonly libelle: InputSignal<string> = input.required<string>();

  /** Émis avec l'identifiant de l'onglet dont la sélection est demandée. */
  protected readonly selection: OutputEmitterRef<string> = output<string>();

  /** Boutons des onglets, dans l'ordre d'affichage. */
  private readonly boutons: Signal<readonly ElementRef<HTMLButtonElement>[]> =
    viewChildren<ElementRef<HTMLButtonElement>>('bouton');

  /**
   * Demande la sélection d'un onglet, sauf s'il est déjà actif.
   * @param id Identifiant de l'onglet.
   */
  protected onSelection(id: string): void {
    if (id !== this.ongletActif()) this.selection.emit(id);
  }

  /**
   * Déplace le focus entre les onglets actifs au clavier (←/→ en boucle, Début/Fin).
   * @param evenement Événement clavier reçu par un onglet.
   * @param index Index de l'onglet qui a le focus.
   */
  protected naviguerAuClavier(evenement: KeyboardEvent, index: number): void {
    const actifs = this.onglets()
      .map((onglet, i) => (onglet.desactive ? -1 : i))
      .filter((i) => i !== -1);
    const position = actifs.indexOf(index);
    let cible: number;
    switch (evenement.key) {
      case 'ArrowRight':
        cible = actifs[(position + 1) % actifs.length];
        break;
      case 'ArrowLeft':
        cible = actifs[(position - 1 + actifs.length) % actifs.length];
        break;
      case 'Home':
        cible = actifs[0];
        break;
      case 'End':
        cible = actifs[actifs.length - 1];
        break;
      default:
        return;
    }
    evenement.preventDefault();
    this.boutons()[cible].nativeElement.focus();
  }
}
