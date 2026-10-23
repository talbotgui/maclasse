import { describe, it, expect, beforeEach } from 'vitest';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { McEditeurRicheComponent } from './mc-editeur-riche.component';
import { LIBELLES } from '../../libelles';

/** Hôte de test liant l'éditeur à un FormControl. */
@Component({
  imports: [McEditeurRicheComponent, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<mc-editeur-riche id="champBilan" label="Bilans" [formControl]="controle" />`,
})
class HoteEditeurComponent {
  /** Contrôle lié à l'éditeur. */
  public readonly controle = new FormControl('<p>Texte <strong>initial</strong></p>', {
    nonNullable: true,
  });
}

/** Hôte de test dont le contrôle est désactivé avant la création de l'éditeur. */
@Component({
  imports: [McEditeurRicheComponent, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<mc-editeur-riche id="champMoyens" label="Moyens" [formControl]="controle" />`,
})
class HoteEditeurDesactiveComponent {
  /** Contrôle désactivé dès sa création. */
  public readonly controle = new FormControl({ value: '<p>Figé</p>', disabled: true });
}

describe('McEditeurRicheComponent', () => {
  let fixture: ComponentFixture<HoteEditeurComponent>;
  let hote: HoteEditeurComponent;

  /** Zone éditable montée par Tiptap. */
  const zone = (): HTMLElement => fixture.nativeElement.querySelector('#champBilanSaisie');

  /**
   * Bouton de la barre d'outils.
   * @param action Identifiant de l'action (ex. : `Gras`).
   */
  const bouton = (action: string): HTMLButtonElement =>
    fixture.nativeElement.querySelector(`#btn${action}_champBilan`);

  /** Instance de l'éditeur sous test. */
  const editeur = (): McEditeurRicheComponent =>
    fixture.debugElement.children[0].componentInstance as McEditeurRicheComponent;

  beforeEach(async () => {
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(HoteEditeurComponent);
    hote = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  describe('rendu accessible', () => {
    it('monte une zone éditable multi-lignes nommée par le libellé visible', () => {
      expect(zone().getAttribute('role')).toBe('textbox');
      expect(zone().getAttribute('aria-multiline')).toBe('true');
      expect(zone().getAttribute('aria-labelledby')).toBe('champBilanLibelle');
      expect(fixture.nativeElement.querySelector('#champBilanLibelle').textContent).toBe('Bilans');
      expect(zone().getAttribute('contenteditable')).toBe('true');
    });

    it('nomme la barre d’outils et ses boutons', () => {
      const barre = fixture.nativeElement.querySelector('[role="group"]') as HTMLElement;
      expect(barre.getAttribute('aria-label')).toBe(
        `${LIBELLES.editeurRiche.ariaBarreOutils} — Bilans`,
      );
      expect(bouton('Gras').getAttribute('aria-label')).toBe(LIBELLES.editeurRiche.ariaGras);
      expect(bouton('ListePuces').hasAttribute('aria-label')).toBe(false);
      expect(bouton('ListePuces').title).toBe(LIBELLES.editeurRiche.titreListePuces);
    });
  });

  describe('liaison avec le FormControl', () => {
    it('affiche la valeur initiale du contrôle', () => {
      expect(zone().innerHTML).toContain('<strong>initial</strong>');
    });

    it('reporte une valeur écrite par le contrôle sans la renvoyer', () => {
      hote.controle.setValue('<p>Nouveau</p>');
      expect(zone().textContent).toBe('Nouveau');
      expect(hote.controle.dirty).toBe(false);
    });

    it('traite une valeur null comme un document vide', () => {
      editeur().writeValue(null);
      expect(zone().textContent).toBe('');
    });

    it('notifie le contrôle à chaque modification, en HTML', () => {
      bouton('Gras').click();
      expect(hote.controle.value).toBe('<p>Texte <strong>initial</strong></p>');
      (editeur() as any).editeur.commands.setContent('<p>Saisie</p>', { emitUpdate: true });
      expect(hote.controle.value).toBe('<p>Saisie</p>');
    });

    it('émet une chaîne vide quand le document est vidé', () => {
      (editeur() as any).editeur.commands.clearContent(true);
      expect(hote.controle.value).toBe('');
    });

    it('marque le contrôle touché à la perte de focus', () => {
      (editeur() as any).editeur.commands.focus();
      (editeur() as any).editeur.commands.blur();
      zone().dispatchEvent(new FocusEvent('blur'));
      expect(hote.controle.touched).toBe(true);
    });

    it('ne marque pas le contrôle touché quand le focus passe sur un bouton de la barre', () => {
      zone().dispatchEvent(new FocusEvent('blur', { relatedTarget: bouton('Gras') }));
      expect(hote.controle.touched).toBe(false);
    });

    it('rend la zone et les boutons inactifs quand le contrôle est désactivé', () => {
      hote.controle.disable();
      fixture.detectChanges();
      expect(zone().getAttribute('contenteditable')).toBe('false');
      expect(zone().getAttribute('aria-disabled')).toBe('true');
      expect(bouton('Gras').disabled).toBe(true);

      hote.controle.enable();
      fixture.detectChanges();
      expect(zone().getAttribute('contenteditable')).toBe('true');
      expect(zone().hasAttribute('aria-disabled')).toBe(false);
    });

    it('crée la zone non modifiable si le contrôle est désactivé avant le montage', async () => {
      const autre = TestBed.createComponent(HoteEditeurDesactiveComponent);
      autre.detectChanges();
      await autre.whenStable();
      const zoneDesactivee = autre.nativeElement.querySelector('#champMoyensSaisie') as HTMLElement;
      expect(zoneDesactivee.getAttribute('contenteditable')).toBe('false');
      expect(zoneDesactivee.getAttribute('aria-disabled')).toBe('true');
      expect(zoneDesactivee.textContent).toBe('Figé');
    });
  });

  describe('mises en forme', () => {
    beforeEach(() => {
      (editeur() as any).editeur.commands.selectAll();
    });

    it.each([
      ['Gras', '<strong>'],
      ['Italique', '<em>'],
      ['Souligne', '<u>'],
      ['ListePuces', '<ul>'],
      ['ListeNumerotee', '<ol>'],
    ])('le bouton %s applique la mise en forme %s', (action, balise) => {
      (editeur() as any).editeur.commands.unsetAllMarks();
      bouton(action).click();
      expect(hote.controle.value).toContain(balise);
    });

    it('signale par aria-pressed la mise en forme active au curseur', () => {
      bouton('Italique').click();
      fixture.detectChanges();
      expect(bouton('Italique').getAttribute('aria-pressed')).toBe('true');
      expect(bouton('ListePuces').getAttribute('aria-pressed')).toBe('false');
    });
  });

  describe('destruction', () => {
    it("détruit l'éditeur Tiptap et ignore les appels tardifs", () => {
      const composant = editeur();
      const tiptap = (composant as any).editeur;
      fixture.destroy();

      expect(tiptap.isDestroyed).toBe(true);
      expect((composant as any).editeur).toBeNull();
      expect(() => {
        composant.writeValue('<p>Tardif</p>');
        composant.setDisabledState(true);
        (composant as any).basculerAction(McEditeurRicheComponent['ACTIONS'][0]);
      }).not.toThrow();
    });
  });
});
