import { signal } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { ComposantBase } from './composant-base';

/**
 * Classe de base abstraite des composants de saisie à valeur textuelle
 * (`mc-input`, `mc-textarea`, `mc-select`, `mc-radio-group`, `mc-champ-heure`).
 * Porte l'implémentation commune de `ControlValueAccessor` : valeur courante,
 * état désactivé et callbacks Angular Forms.
 */
export abstract class ChampBase extends ComposantBase implements ControlValueAccessor {
  /** Valeur courante du champ. */
  protected readonly valeur = signal('');

  /** Indique si le champ est désactivé par le FormControl parent. */
  protected readonly estDesactive = signal(false);

  /**
   * Callback de notification des changements, fourni par Angular Forms.
   * `null` signale une valeur vidée (ex. : réponse effacée d'un `mc-radio-group`).
   */
  protected onChange: (valeur: string | number | null) => void = () => {};

  /** Callback de notification du touché, fourni par Angular Forms. */
  protected onTouched: () => void = () => {};

  /**
   * Reçoit la valeur depuis le FormControl et met à jour le signal interne.
   * @param valeur Valeur fournie par Angular Forms (peut être `null` à l'initialisation,
   * ou un `number` pour un champ `type="number"`).
   */
  public writeValue(valeur: string | number | null | undefined): void {
    this.valeur.set(valeur === null || valeur === undefined ? '' : String(valeur));
  }

  /**
   * Enregistre le callback appelé lors de chaque changement de valeur.
   * @param fn Fonction fournie par Angular Forms.
   */
  public registerOnChange(fn: (valeur: string | number | null) => void): void {
    this.onChange = fn;
  }

  /**
   * Enregistre le callback appelé lors de la perte de focus.
   * @param fn Fonction fournie par Angular Forms.
   */
  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Active ou désactive le champ selon l'état du FormControl parent.
   * @param estDesactive `true` pour désactiver le champ.
   */
  public setDisabledState(estDesactive: boolean): void {
    this.estDesactive.set(estDesactive);
  }

  /**
   * Mémorise la nouvelle valeur saisie et notifie Angular Forms.
   * @param valeur Nouvelle valeur brute du champ.
   */
  protected surChangement(valeur: string): void {
    this.valeur.set(valeur);
    this.onChange(valeur);
  }

  /** Notifie Angular Forms que le champ a été touché (perte de focus). */
  protected surBlur(): void {
    this.onTouched();
  }
}
