import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  forwardRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import type { InputSignal, Signal } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { ChampBase } from '../../champ-base';
import { LIBELLES } from '../../libelles';
import type { ActionEditeurRiche } from '../../modeles/composants.modele';

/**
 * Éditeur de texte riche (Tiptap) conforme RGAA, intégré aux Reactive Forms.
 * La valeur échangée avec le FormControl est du HTML ; un document vide vaut `''`.
 * La zone éditable porte `role="textbox"`, `aria-multiline` et le libellé visible ;
 * la barre de mise en forme expose l'état de chaque bouton par `aria-pressed`.
 */
@Component({
  selector: 'mc-editeur-riche',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => McEditeurRicheComponent),
      multi: true,
    },
  ],
  templateUrl: './mc-editeur-riche.component.html',
  styleUrl: './mc-editeur-riche.component.scss',
})
export class McEditeurRicheComponent extends ChampBase {
  /** Mises en forme proposées, dans l'ordre de la barre d'outils. */
  protected static readonly ACTIONS: readonly ActionEditeurRiche[] = [
    {
      id: 'Gras',
      nomTiptap: 'bold',
      libelle: LIBELLES.editeurRiche.gras,
      ariaLabel: LIBELLES.editeurRiche.ariaGras,
      titre: LIBELLES.editeurRiche.ariaGras,
    },
    {
      id: 'Italique',
      nomTiptap: 'italic',
      libelle: LIBELLES.editeurRiche.italique,
      ariaLabel: LIBELLES.editeurRiche.ariaItalique,
      titre: LIBELLES.editeurRiche.ariaItalique,
    },
    {
      id: 'Souligne',
      nomTiptap: 'underline',
      libelle: LIBELLES.editeurRiche.souligne,
      ariaLabel: LIBELLES.editeurRiche.ariaSouligne,
      titre: LIBELLES.editeurRiche.ariaSouligne,
    },
    {
      id: 'ListePuces',
      nomTiptap: 'bulletList',
      libelle: LIBELLES.editeurRiche.listePuces,
      ariaLabel: null,
      titre: LIBELLES.editeurRiche.titreListePuces,
    },
    {
      id: 'ListeNumerotee',
      nomTiptap: 'orderedList',
      libelle: LIBELLES.editeurRiche.listeNumerotee,
      ariaLabel: null,
      titre: LIBELLES.editeurRiche.titreListeNumerotee,
    },
  ];

  /**
   * Identifiant du champ : préfixe des IDs de la zone éditable (`<id>Saisie`), du libellé
   * (`<id>Libelle`) et suffixe des IDs des boutons (`btn<Action>_<id>`).
   */
  public readonly id: InputSignal<string> = input.required<string>();

  /** Libellé visible du champ. */
  public readonly label: InputSignal<string> = input.required<string>();

  /** Mises en forme proposées, exposées au template. */
  protected readonly actions = McEditeurRicheComponent.ACTIONS;

  /** Mises en forme actives à la position du curseur, par identifiant d'action. */
  protected readonly actionsActives = signal<ReadonlySet<string>>(new Set());

  /** Conteneur dans lequel Tiptap monte la zone éditable. */
  private readonly zone: Signal<ElementRef<HTMLDivElement>> =
    viewChild.required<ElementRef<HTMLDivElement>>('zone');

  /** Élément hôte, pour savoir si le focus reste dans le composant. */
  private readonly hote: ElementRef<HTMLElement> = inject(ElementRef);

  /** Instance Tiptap, créée après le premier rendu et détruite avec le composant. */
  private editeur: Editor | null = null;

  /** Crée l'éditeur après le premier rendu et le détruit avec le composant. */
  public constructor() {
    super();
    afterNextRender(() => this.creerEditeur());
    inject(DestroyRef).onDestroy(() => {
      this.editeur?.destroy();
      this.editeur = null;
    });
  }

  /**
   * Reçoit la valeur HTML du FormControl et la reporte dans l'éditeur sans notifier en retour.
   * @param valeur HTML fourni par Angular Forms (`null` ou `undefined` = vide).
   */
  public override writeValue(valeur: string | number | null | undefined): void {
    super.writeValue(valeur);
    if (this.editeur && this.lireValeurEditeur() !== this.valeur()) {
      this.editeur.commands.setContent(this.valeur(), { emitUpdate: false });
    }
  }

  /**
   * Rend l'éditeur non modifiable quand le FormControl est désactivé.
   * @param estDesactive `true` pour désactiver le champ.
   */
  public override setDisabledState(estDesactive: boolean): void {
    super.setDisabledState(estDesactive);
    this.editeur?.setEditable(!estDesactive);
    this.signalerDesactivation();
  }

  /**
   * Applique ou retire une mise en forme à la sélection, puis rend le focus à la zone éditable.
   * @param action Mise en forme demandée.
   */
  protected basculerAction(action: ActionEditeurRiche): void {
    const chaine = this.editeur?.chain().focus();
    if (!chaine) return;
    switch (action.nomTiptap) {
      case 'bold':
        chaine.toggleBold().run();
        break;
      case 'italic':
        chaine.toggleItalic().run();
        break;
      case 'underline':
        chaine.toggleUnderline().run();
        break;
      case 'bulletList':
        chaine.toggleBulletList().run();
        break;
      case 'orderedList':
        chaine.toggleOrderedList().run();
        break;
    }
  }

  /**
   * Indique si une mise en forme est active à la position du curseur.
   * @param action Mise en forme à tester.
   * @returns `true` si la mise en forme est active.
   */
  protected estActionActive(action: ActionEditeurRiche): boolean {
    return this.actionsActives().has(action.id);
  }

  /** Monte l'éditeur Tiptap dans la zone et le relie à Angular Forms. */
  private creerEditeur(): void {
    this.editeur = new Editor({
      element: this.zone().nativeElement,
      extensions: [StarterKit.configure({ heading: false, codeBlock: false, link: false })],
      content: this.valeur(),
      editable: !this.estDesactive(),
      editorProps: {
        attributes: {
          id: this.id() + 'Saisie',
          role: 'textbox',
          'aria-multiline': 'true',
          'aria-labelledby': this.id() + 'Libelle',
          class: 'mc-editeur-riche__contenu',
        },
      },
      onUpdate: () => this.surChangement(this.lireValeurEditeur()),
      onBlur: ({ event }) => this.traiterPerteFocus(event),
      onTransaction: () => this.actualiserActionsActives(),
    });
    this.signalerDesactivation();
  }

  /**
   * Marque le champ « touché » seulement si le focus quitte le composant entier :
   * un clic sur un bouton de mise en forme ne compte pas comme une sortie du champ.
   * @param evenement Événement de perte de focus de la zone éditable.
   */
  private traiterPerteFocus(evenement: FocusEvent): void {
    const cible = evenement.relatedTarget;
    if (cible instanceof Node && this.hote.nativeElement.contains(cible)) return;
    this.surBlur();
  }

  /** Reporte l'état désactivé sur la zone éditable (`aria-disabled`). */
  private signalerDesactivation(): void {
    const dom = this.editeur?.view.dom;
    if (!dom) return;
    if (this.estDesactive()) dom.setAttribute('aria-disabled', 'true');
    else dom.removeAttribute('aria-disabled');
  }

  /**
   * Lit le HTML de l'éditeur ; un document sans texte vaut `''`.
   * @returns Le HTML courant, ou `''` si l'éditeur est vide ou absent.
   */
  private lireValeurEditeur(): string {
    if (!this.editeur || this.editeur.isEmpty) return '';
    return this.editeur.getHTML();
  }

  /** Recalcule les mises en forme actives à la position du curseur. */
  private actualiserActionsActives(): void {
    const editeur = this.editeur;
    if (!editeur) return;
    this.actionsActives.set(
      new Set(this.actions.filter((a) => editeur.isActive(a.nomTiptap)).map((a) => a.id)),
    );
  }
}
