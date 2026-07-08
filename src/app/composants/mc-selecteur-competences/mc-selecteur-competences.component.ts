import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import type { InputSignal, OutputEmitterRef } from '@angular/core';
import { ComposantBase } from '../../composant-base';
import { McChipFiltreComponent } from '../mc-chip-filtre/mc-chip-filtre.component';
import { CompetenceService } from '../../services/sansEtat/competence.service';
import type { OptionAutoComplete } from '../../modeles/composants.modele';

/**
 * Sélecteur de compétences compact en trois zones :
 * 1. CHIPs de filtre par domaine (filtre les suggestions).
 * 2. Champ d'autocomplétion affichant le chemin complet de chaque option.
 * 3. CHIPs des compétences sélectionnées, chacun avec un bouton de suppression.
 *
 * Pattern ARIA combobox : l'input porte `role="combobox"` ; la liste `role="listbox"`.
 * La navigation clavier suit les recommandations WAI-ARIA 1.2 (↓/↑, Entrée, Échap).
 */
@Component({
  selector: 'mc-selecteur-competences',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [McChipFiltreComponent],
  templateUrl: './mc-selecteur-competences.component.html',
  styleUrl: './mc-selecteur-competences.component.scss',
})
export class McSelecteurCompetencesComponent extends ComposantBase {
  /**
   * Suffixe contextuel ajouté aux IDs internes pour garantir l'unicité du DOM
   * quand le composant est instancié plusieurs fois simultanément.
   */
  public readonly contexteId: InputSignal<string> = input('');

  /** Identifiants des compétences actuellement sélectionnées. */
  public readonly competencesSelectionnees: InputSignal<string[]> = input<string[]>([]);

  /** `true` pour autoriser la sélection de plusieurs compétences simultanément. */
  public readonly multiSelection: InputSignal<boolean> = input(true);

  /** Émis avec la liste mise à jour des identifiants sélectionnés. */
  protected readonly selectionChange: OutputEmitterRef<string[]> = output<string[]>();

  /** Service d'accès à l'arbre des compétences. */
  private readonly competenceService = inject(CompetenceService);

  /** Valeur courante du champ de saisie. */
  protected readonly saisie = signal('');

  /** Indique si le panneau de suggestions est actuellement ouvert. */
  protected readonly estOuvert = signal(false);

  /** Index de l'option mise en évidence au clavier (-1 = aucune). */
  private readonly indexFocalise = signal(-1);

  /** Identifiants des domaines actifs dans le filtre (Set vide = tous affichés). */
  private readonly domainesFiltres = signal<Set<string>>(new Set());

  /** Domaines de niveau 1 disponibles. */
  protected readonly domaines = computed(() => this.competenceService.obtenirDomaines());

  /**
   * Options d'autocomplétion filtrées selon la saisie et les domaines actifs.
   * Vide si le champ de saisie est vide.
   */
  protected readonly suggestions = computed<OptionAutoComplete[]>(() => {
    const terme = this.saisie().trim();
    if (!terme) return [];

    let resultats = this.competenceService.rechercherCompetences(terme);

    const filtres = this.domainesFiltres();
    if (filtres.size > 0) {
      resultats = resultats.filter((c) => {
        const chemin = this.competenceService.obtenirChemin(c.id);
        return chemin.length > 0 && filtres.has(chemin[0].id);
      });
    }

    return resultats.map((c) => ({
      id: c.id,
      libelle: this.competenceService.resoudreLibelle(c.id),
    }));
  });

  /** Identifiant de l'option actuellement mise en évidence, ou `null`. */
  protected readonly idOptionFocalisee = computed<string | null>(() => {
    const index = this.indexFocalise();
    const options = this.suggestions();
    return index >= 0 && index < options.length ? options[index].id : null;
  });

  /**
   * Compétences sélectionnées avec leur libellé propre (dernier segment du chemin)
   * pour affichage dans les CHIPs, et le chemin complet pour l'aria-label du bouton ×.
   */
  protected readonly competencesAffichees = computed(() =>
    this.competencesSelectionnees().map((id) => {
      const chemin = this.competenceService.resoudreLibelle(id);
      return {
        id,
        libelleCourt: chemin.split(' › ').at(-1) ?? chemin,
        cheminComplet: chemin,
      };
    }),
  );

  /**
   * Met à jour la saisie et ouvre les suggestions si le champ n'est pas vide.
   * @param event Événement `input` natif.
   */
  protected surSaisie(event: Event): void {
    const valeur = (event.target as HTMLInputElement).value;
    this.saisie.set(valeur);
    this.indexFocalise.set(-1);
    this.estOuvert.set(!!valeur.trim());
  }

  /** Rouvre les suggestions si une saisie est déjà présente lors du focus. */
  protected surFocus(): void {
    if (this.saisie().trim()) {
      this.estOuvert.set(true);
    }
  }

  /** Ferme les suggestions lors de la perte de focus (après les événements mousedown). */
  protected surBlur(): void {
    this.estOuvert.set(false);
  }

  /**
   * Navigation clavier dans la liste de suggestions (pattern ARIA combobox) :
   * - ↓ : option suivante (ouvre si fermé).
   * - ↑ : option précédente.
   * - Entrée : sélectionne l'option mise en évidence.
   * - Échap : ferme et vide le champ.
   * @param event Événement clavier natif.
   */
  protected naviguerClavier(event: KeyboardEvent): void {
    const options = this.suggestions();
    const index = this.indexFocalise();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.estOuvert() && options.length > 0) this.estOuvert.set(true);
        this.indexFocalise.set(Math.min(index + 1, options.length - 1));
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.indexFocalise.set(Math.max(index - 1, -1));
        break;

      case 'Enter': {
        event.preventDefault();
        const option = options[index];
        if (option) this.selectionnerOption(option.id);
        break;
      }

      case 'Escape':
        event.preventDefault();
        this.fermer();
        break;
    }
  }

  /**
   * Sélectionne une option de la liste d'autocomplétion.
   * Appelé sur `mousedown` (avant `blur`) pour éviter la fermeture anticipée.
   * @param id Identifiant de la compétence à ajouter.
   */
  protected selectionnerOption(id: string): void {
    const courant = this.competencesSelectionnees();
    if (!courant.includes(id)) {
      const nouvelleSelection = this.multiSelection() ? [...courant, id] : [id];
      this.selectionChange.emit(nouvelleSelection);
    }
    this.fermer();
  }

  /**
   * Retire une compétence de la sélection.
   * @param id Identifiant de la compétence à supprimer.
   */
  protected supprimerCompetence(id: string): void {
    this.selectionChange.emit(this.competencesSelectionnees().filter((i) => i !== id));
  }

  /**
   * Active ou désactive un filtre de domaine et réinitialise le focus clavier.
   * @param id Identifiant du domaine.
   */
  protected basculerDomaine(id: string): void {
    this.domainesFiltres.update((set) => {
      const nouvel = new Set(set);
      if (nouvel.has(id)) nouvel.delete(id);
      else nouvel.add(id);
      return nouvel;
    });
    this.indexFocalise.set(-1);
  }

  /**
   * Indique si un domaine est actif dans le filtre.
   * @param id Identifiant du domaine.
   */
  protected estDomaineFiltre(id: string): boolean {
    return this.domainesFiltres().has(id);
  }

  /** Ferme le panneau et réinitialise la saisie et le focus clavier. */
  private fermer(): void {
    this.estOuvert.set(false);
    this.indexFocalise.set(-1);
    this.saisie.set('');
  }
}
