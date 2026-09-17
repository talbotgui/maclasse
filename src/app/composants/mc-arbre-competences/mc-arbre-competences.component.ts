import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
  viewChildren,
} from '@angular/core';
import type { InputSignal, OutputEmitterRef } from '@angular/core';
import { ComposantBase } from '../../composant-base';
import { McChampRechercheComponent } from '../mc-champ-recherche/mc-champ-recherche.component';
import { McChipFiltreComponent } from '../mc-chip-filtre/mc-chip-filtre.component';
import { CompetenceService } from '../../services/sansEtat/competence.service';
import type { Competence } from '../../modeles/referentiels.modele';
import type { NoeudAffiche } from '../../modeles/composants.modele';

/**
 * Arbre hiérarchique de compétences avec filtrage textuel et filtrage par domaine.
 * Utilisé dans l'écran Compétences où l'arbre est la pièce centrale de navigation.
 *
 * Chaque nœud expose un bouton "Ajouter au panier" qui émet `selectionChange` avec la
 * compétence ajoutée. Un doublon dans `competencesSelectionnees` désactive le bouton.
 * En mode recherche active : les nœuds correspondants et leurs ancêtres sont affichés
 * et auto-dépliés ; l'état déplié d'avant la recherche est restauré à l'effacement.
 */
@Component({
  selector: 'mc-arbre-competences',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [McChampRechercheComponent, McChipFiltreComponent],
  templateUrl: './mc-arbre-competences.component.html',
  styleUrl: './mc-arbre-competences.component.scss',
})
export class McArbreCompetencesComponent extends ComposantBase {
  /** Identifiants des compétences déjà présentes dans le panier (désactivent le bouton d'ajout). */
  public readonly competencesSelectionnees: InputSignal<string[]> = input<string[]>([]);

  /** Émis avec la liste mise à jour des identifiants après ajout d'une compétence. */
  protected readonly selectionChange: OutputEmitterRef<string[]> = output<string[]>();

  /** Service d'accès à l'arbre des compétences. */
  private readonly competenceService = inject(CompetenceService);

  /** Terme de recherche saisi par l'utilisateur. */
  private readonly termeRecherche = signal('');

  /** Identifiants des domaines actifs dans le filtre (Set vide = tous affichés). */
  private readonly domainesActifs = signal<Set<string>>(new Set());

  /** Identifiants des nœuds actuellement dépliés. */
  private readonly noeudsDepliés = signal<Set<string>>(new Set());

  /** Références aux boutons de libellé de l'arbre, dans l'ordre d'affichage, pour la navigation clavier. */
  private readonly boutonsSelection =
    viewChildren<ElementRef<HTMLButtonElement>>('boutonSelection');

  /** Index du nœud actuellement inclus dans l'ordre de tabulation (roving tabindex). */
  protected readonly indexFocalise = signal(0);

  /** État déplié sauvegardé avant l'activation d'une recherche, `null` si inactif. */
  private readonly noeudsDepliésAvantRecherche = signal<Set<string> | null>(null);

  /** Domaines de niveau 1 de l'arbre. */
  protected readonly domaines = computed(() => this.competenceService.obtenirDomaines());

  /** Identifiants des nœuds correspondant au terme de recherche courant. */
  private readonly idsCorrespondants = computed<Set<string>>(() => {
    const terme = this.termeRecherche().trim();
    if (!terme) return new Set<string>();
    return new Set(this.competenceService.rechercherCompetences(terme).map((c) => c.id));
  });

  /**
   * Identifiants des nœuds ancêtres de résultats de recherche.
   * Ces nœuds sont auto-dépliés pour rendre les résultats visibles.
   */
  private readonly idsAncetresResultats = computed<Set<string>>(() => {
    const cherches = this.idsCorrespondants();
    if (cherches.size === 0) return new Set<string>();
    const ancetres = new Set<string>();
    const parcourir = (noeud: Competence): boolean => {
      let aResultat = cherches.has(noeud.id);
      for (const enfant of noeud.enfants ?? []) {
        if (parcourir(enfant)) aResultat = true;
      }
      if (aResultat && !cherches.has(noeud.id)) ancetres.add(noeud.id);
      return aResultat;
    };
    this.competenceService.obtenirDomaines().forEach(parcourir);
    return ancetres;
  });

  /** Liste aplatie des nœuds visibles dans l'arbre selon l'état courant. */
  protected readonly noeudsAffiches = computed<NoeudAffiche[]>(() => {
    const domainesActifs = this.domainesActifs();
    const depliés = this.noeudsDepliés();
    const cherches = this.idsCorrespondants();
    const ancetres = this.idsAncetresResultats();
    const selection = this.competencesSelectionnees();
    const enRecherche = cherches.size > 0;

    const resultat: NoeudAffiche[] = [];

    const ajouter = (noeud: Competence, niveau: number): void => {
      const estFeuille = !noeud.enfants?.length;
      const estCorrespondant = cherches.has(noeud.id);
      const estAncetre = ancetres.has(noeud.id);

      if (enRecherche && !estCorrespondant && !estAncetre) return;

      const estDeplie = enRecherche ? estAncetre : depliés.has(noeud.id);

      resultat.push({
        competence: noeud,
        niveau,
        estFeuille,
        estDeplie,
        estSelectionne: selection.includes(noeud.id),
      });

      if (estDeplie && noeud.enfants) {
        noeud.enfants.forEach((enfant) => ajouter(enfant, niveau + 1));
      }
    };

    const domainesFiltres =
      domainesActifs.size > 0
        ? this.domaines().filter((d) => domainesActifs.has(d.id))
        : this.domaines();

    domainesFiltres.forEach((d) => ajouter(d, 0));
    return resultat;
  });

  /**
   * Met à jour le terme de recherche. Sauvegarde l'état déplié au début de la recherche
   * et le restaure à l'effacement.
   * @param terme Nouveau terme de recherche.
   */
  protected surRecherche(terme: string): void {
    const etaitVide = !this.termeRecherche().trim();
    const estVide = !terme.trim();

    if (etaitVide && !estVide) {
      this.noeudsDepliésAvantRecherche.set(new Set(this.noeudsDepliés()));
    } else if (!etaitVide && estVide) {
      const sauvegarde = this.noeudsDepliésAvantRecherche();
      if (sauvegarde !== null) {
        this.noeudsDepliés.set(new Set(sauvegarde));
        this.noeudsDepliésAvantRecherche.set(null);
      }
    }
    this.termeRecherche.set(terme);
  }

  /**
   * Bascule l'état déplié/replié d'un nœud non-feuille.
   * @param id Identifiant du nœud.
   */
  protected basculerNoeud(id: string): void {
    this.noeudsDepliés.update((set) => {
      const nouvel = new Set(set);
      if (nouvel.has(id)) {
        nouvel.delete(id);
      } else {
        nouvel.add(id);
      }
      return nouvel;
    });
  }

  /**
   * Ajoute une compétence au panier si elle n'y est pas déjà.
   * @param id Identifiant de la compétence à ajouter.
   */
  protected ajouterAuPanier(id: string): void {
    const courant = this.competencesSelectionnees();
    if (!courant.includes(id)) {
      this.selectionChange.emit([...courant, id]);
    }
  }

  /**
   * Gère la navigation clavier dans l'arbre selon le pattern WAI-ARIA Tree View :
   * - ↓/↑ : nœud suivant/précédent visible.
   * - → : déplier si fermé, sinon descendre vers le premier enfant.
   * - ← : replier si ouvert, sinon remonter vers le nœud parent.
   * - Début/Fin : sauter au premier/dernier nœud.
   * @param event Événement clavier intercepté.
   * @param indexCourant Index du nœud focalisé dans `noeudsAffiches`.
   */
  protected naviguerClavier(event: KeyboardEvent, indexCourant: number): void {
    const noeuds = this.noeudsAffiches();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focaliserNoeud(indexCourant + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focaliserNoeud(indexCourant - 1);
        break;
      case 'Home':
        event.preventDefault();
        this.focaliserNoeud(0);
        break;
      case 'End':
        event.preventDefault();
        this.focaliserNoeud(this.boutonsSelection().length - 1);
        break;
      case 'ArrowRight': {
        event.preventDefault();
        const noeud = noeuds[indexCourant];
        if (!noeud.estFeuille && !noeud.estDeplie) {
          this.basculerNoeud(noeud.competence.id);
        } else if (!noeud.estFeuille && noeud.estDeplie) {
          this.focaliserNoeud(indexCourant + 1);
        }
        break;
      }
      case 'ArrowLeft': {
        event.preventDefault();
        const noeud = noeuds[indexCourant];
        if (!noeud.estFeuille && noeud.estDeplie) {
          this.basculerNoeud(noeud.competence.id);
        } else {
          let i = indexCourant - 1;
          while (i >= 0 && noeuds[i].niveau >= noeud.niveau) {
            i--;
          }
          this.focaliserNoeud(i);
        }
        break;
      }
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.ajouterAuPanier(noeuds[indexCourant].competence.id);
        break;
    }
  }

  /**
   * Déplace le focus clavier vers le nœud à l'index donné et met à jour le roving tabindex.
   * @param index Index du nœud à focaliser dans `noeudsAffiches`.
   */
  private focaliserNoeud(index: number): void {
    const boutons = this.boutonsSelection();
    if (index < 0 || index >= boutons.length) return;
    this.indexFocalise.set(index);
    boutons[index].nativeElement.focus();
  }

  /**
   * Met à jour le roving tabindex quand un nœud reçoit le focus par un autre moyen que
   * les flèches (ex. clic direct ou Tab entrant dans l'arbre).
   * @param index Index du nœud focalisé.
   */
  protected surFocusNoeud(index: number): void {
    this.indexFocalise.set(index);
  }

  /**
   * Active ou désactive un filtre de domaine.
   * @param id Identifiant du domaine.
   */
  protected basculerDomaine(id: string): void {
    this.domainesActifs.update((set) => {
      const nouvel = new Set(set);
      if (nouvel.has(id)) {
        nouvel.delete(id);
      } else {
        nouvel.add(id);
      }
      return nouvel;
    });
  }

  /**
   * Indique si un domaine est actif dans le filtre.
   * @param id Identifiant du domaine.
   */
  protected estDomaineActif(id: string): boolean {
    return this.domainesActifs().has(id);
  }
}
