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
import type { Competence } from '../../modeles/referentiels.modele';
import { TexteUtils } from '../../utilitaires/texte.utils';

/**
 * Sélecteur de compétences compact en trois zones :
 * 1. CHIPs de filtre par domaine (filtre les suggestions).
 * 2. Champ d'autocomplétion affichant le chemin complet de chaque option.
 * 3. CHIPs des compétences sélectionnées, chacun avec un bouton de suppression.
 *
 * Suggestions : liste native `ul > li > button` pilotée au clavier depuis l'input (les boutons ne sont pas focusables au Tab).
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

  /**
   * Restreint les suggestions aux nœuds de cette profondeur (1 = domaines), ou `null`
   * pour proposer tous les nœuds.
   */
  public readonly niveau: InputSignal<number | null> = input<number | null>(null);

  /**
   * Restreint les suggestions aux feuilles du sous-arbre de ce nœud, ou `null` pour
   * proposer tout l'arbre. Les filtres par domaine sont alors masqués et toutes les
   * feuilles sont proposées dès l'ouverture, sans saisie.
   */
  public readonly racineId: InputSignal<string | null> = input<string | null>(null);

  /** Séparateur des niveaux dans le chemin complet affiché d'une compétence. */
  public readonly separateur: InputSignal<string> = input(' › ');

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

  /** Domaines de niveau 1 disponibles pour le filtre ; aucun quand la recherche est limitée à un sous-arbre. */
  protected readonly domaines = computed(() =>
    this.racineId() ? [] : this.competenceService.obtenirDomaines(),
  );

  /**
   * Compétences candidates quand la recherche est restreinte (`racineId` ou `niveau`),
   * ou `null` si toutes les compétences de l'arbre sont proposées.
   */
  private readonly candidats = computed<Competence[] | null>(() => {
    const racineId = this.racineId();
    if (racineId) return this.competenceService.obtenirFeuilles(racineId);
    const niveau = this.niveau();
    return niveau === null ? null : this.competenceService.obtenirNoeudsDeNiveau(niveau);
  });

  /**
   * Options d'autocomplétion filtrées selon la saisie et les domaines actifs.
   * Vide si le champ de saisie est vide, sauf dans un sous-arbre (`racineId`)
   * où toutes les feuilles sont proposées.
   */
  protected readonly suggestions = computed<OptionAutoComplete[]>(() => {
    const terme = this.saisie().trim();
    const candidats = this.candidats();
    let resultats: Competence[];
    if (!terme) {
      resultats = this.racineId() && candidats ? candidats : [];
    } else if (candidats) {
      const t = TexteUtils.normaliserPourRecherche(terme);
      resultats = candidats.filter((c) =>
        TexteUtils.normaliserPourRecherche(this.construireChemin(c.id)).includes(t),
      );
    } else {
      resultats = this.competenceService.rechercherCompetences(terme);
    }

    const filtres = this.domainesFiltres();
    if (filtres.size > 0) {
      resultats = resultats.filter((c) => {
        const chemin = this.competenceService.obtenirChemin(c.id);
        return chemin.length > 0 && filtres.has(chemin[0].id);
      });
    }

    return resultats.map((c) => ({ id: c.id, libelle: this.construireChemin(c.id) }));
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
      const cheminComplet = this.construireChemin(id);
      return {
        id,
        libelleCourt: this.competenceService.obtenirChemin(id).at(-1)?.libelle ?? cheminComplet,
        cheminComplet,
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
    this.estOuvert.set(!!valeur.trim() || !!this.racineId());
  }

  /** Rouvre les suggestions (focus ou clic) si une saisie est présente, ou toujours dans un sous-arbre (`racineId`). */
  protected surFocus(): void {
    if (this.saisie().trim() || this.racineId()) {
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
   * - Début/Fin : première/dernière suggestion.
   * - Entrée : sélectionne l'option mise en évidence.
   * - Échap : ferme le panneau sans vider la saisie.
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

      case 'Home':
        if (options.length === 0) break;
        event.preventDefault();
        this.indexFocalise.set(0);
        break;

      case 'End':
        if (options.length === 0) break;
        event.preventDefault();
        this.indexFocalise.set(options.length - 1);
        break;

      case 'Enter': {
        event.preventDefault();
        const option = options[index];
        if (option) this.selectionnerOption(option.id);
        break;
      }

      case 'Escape':
        event.preventDefault();
        this.fermerPanneau();
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

  /**
   * Construit le chemin complet d'une compétence avec le séparateur configuré.
   * @param id Identifiant de la compétence.
   * @returns Libellés du domaine jusqu'à la compétence, ou `''` si elle est introuvable.
   */
  private construireChemin(id: string): string {
    return this.competenceService
      .obtenirChemin(id)
      .map((n) => n.libelle)
      .join(this.separateur());
  }

  /** Ferme le panneau et réinitialise la saisie et le focus clavier. */
  private fermer(): void {
    this.fermerPanneau();
    this.saisie.set('');
  }

  /** Ferme le panneau de suggestions et réinitialise le focus clavier, sans vider la saisie. */
  private fermerPanneau(): void {
    this.estOuvert.set(false);
    this.indexFocalise.set(-1);
  }
}
