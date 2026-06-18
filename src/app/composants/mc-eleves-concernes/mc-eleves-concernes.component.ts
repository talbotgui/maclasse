import { ChangeDetectionStrategy, Component, computed, forwardRef, inject, input, signal } from '@angular/core';
import type { InputSignal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ComposantBase } from '../../composant-base';
import { DonneesService } from '../../services/avecEtat/donnees.service';
import type { ElevesConcernes } from '../../modeles/emploi-du-temps.modele';

/**
 * Composant CVA de sélection du périmètre d'élèves concernés par une séance ou un créneau.
 * Trois modes exclusifs : toute la classe, sélection par groupes, sélection par élèves nommés.
 * Injecte `DonneesService` pour obtenir la liste des groupes et des élèves.
 */
@Component({
  selector: 'mc-eleves-concernes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // NG_VALUE_ACCESSOR permet à Angular Forms de reconnaître ce composant comme un ControlValueAccessor. 
  // Ainsi, il peut être utilisé dans un FormControl et recevoir/émettre des valeurs.
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => McElevesConcernesComponent),
      multi: true,
    },
  ],
  templateUrl: './mc-eleves-concernes.component.html',
  styleUrl: './mc-eleves-concernes.component.scss',
})
export class McElevesConcernesComponent extends ComposantBase implements ControlValueAccessor {
  /** Valeur vide par défaut (toute la classe, aucun groupe ni élève sélectionné). */
  private static readonly VALEUR_DEFAUT: ElevesConcernes = { type: 'classe', groupes: [], elevesIds: [] };

  /** Préfixe des identifiants HTML internes du composant pour éviter les collisions. */
  public readonly id: InputSignal<string> = input.required<string>();

  /** Accès aux données de l'application pour charger groupes et élèves. */
  private readonly donneesService = inject(DonneesService);

  /** Valeur interne courante du composant. */
  protected readonly valeurInterne = signal<ElevesConcernes>({ ...McElevesConcernesComponent.VALEUR_DEFAUT });

  /** Liste des groupes configurés dans les référentiels. */
  protected readonly groupes = computed(
    () => this.donneesService.donnees()?.referentiels.groupes ?? [],
  );

  /** Liste des élèves de la classe, triés NOM Prénom. */
  protected readonly eleves = computed(() =>
    [...(this.donneesService.donnees()?.classe.eleves ?? [])].sort((a, b) =>
      a.nom.localeCompare(b.nom) || a.prenom.localeCompare(b.prenom),
    ),
  );

  /** Callback de notification des changements, fourni par Angular Forms. */
  protected onChange: (valeur: ElevesConcernes) => void = () => {};

  /** Callback de notification du touché, fourni par Angular Forms. */
  protected onTouched: () => void = () => {};

  /**
   * Reçoit la valeur depuis le FormControl.
   * @param valeur Valeur fournie par Angular Forms, `null` si réinitialisation.
   */
  public writeValue(valeur: ElevesConcernes | null): void {
    this.valeurInterne.set(valeur ?? { ...McElevesConcernesComponent.VALEUR_DEFAUT });
  }

  /**
   * Enregistre le callback de changement.
   * @param fn Fonction fournie par Angular Forms.
   */
  public registerOnChange(fn: (valeur: ElevesConcernes) => void): void {
    this.onChange = fn;
  }

  /**
   * Enregistre le callback de touché.
   * @param fn Fonction fournie par Angular Forms.
   */
  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Active ou désactive le composant selon l'état du FormControl parent.
   * Non implémenté : ce composant n'a pas d'état désactivé.
   */
  public setDisabledState(_estDesactive: boolean): void {
    // Ce composant ne gère pas l'état désactivé.
  }

  /**
   * Bascule vers un nouveau mode de sélection et réinitialise les sélections secondaires.
   * @param type Nouveau mode sélectionné.
   */
  protected surChangementMode(type: 'classe' | 'groupes' | 'eleves'): void {
    const nouvelleValeur: ElevesConcernes = { type, groupes: [], elevesIds: [] };
    this.valeurInterne.set(nouvelleValeur);
    this.onChange(nouvelleValeur);
    this.onTouched();
  }

  /**
   * Ajoute ou retire un groupe de la sélection.
   * @param groupeId Identifiant du groupe.
   */
  protected basculerGroupe(groupeId: string): void {
    const courante = this.valeurInterne();
    const groupes = courante.groupes.includes(groupeId)
      ? courante.groupes.filter(id => id !== groupeId)
      : [...courante.groupes, groupeId];
    const nouvelleValeur: ElevesConcernes = { ...courante, groupes };
    this.valeurInterne.set(nouvelleValeur);
    this.onChange(nouvelleValeur);
    this.onTouched();
  }

  /**
   * Ajoute ou retire un élève de la sélection.
   * @param eleveId UUID de l'élève.
   */
  protected basculerEleve(eleveId: string): void {
    const courante = this.valeurInterne();
    const elevesIds = courante.elevesIds.includes(eleveId)
      ? courante.elevesIds.filter(id => id !== eleveId)
      : [...courante.elevesIds, eleveId];
    const nouvelleValeur: ElevesConcernes = { ...courante, elevesIds };
    this.valeurInterne.set(nouvelleValeur);
    this.onChange(nouvelleValeur);
    this.onTouched();
  }
}
