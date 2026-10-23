import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { McOngletsComponent } from './mc-onglets.component';

describe('McOngletsComponent', () => {
  let fixture: ComponentFixture<McOngletsComponent>;
  let component: McOngletsComponent;

  /** Boutons des onglets rendus. */
  const boutons = (): HTMLButtonElement[] =>
    fixture.debugElement.queryAll(By.css('[role="tab"]')).map((d) => d.nativeElement);

  /**
   * Déclenche une touche sur un onglet.
   * @param index Index de l'onglet.
   * @param key Touche pressée.
   * @returns L'événement, pour vérifier `defaultPrevented`.
   */
  const presser = (index: number, key: string): KeyboardEvent => {
    const evenement = new KeyboardEvent('keydown', { key, cancelable: true });
    boutons()[index].dispatchEvent(evenement);
    return evenement;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(McOngletsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('libelle', 'Sections');
    fixture.componentRef.setInput('onglets', [
      { id: 'Un', libelle: 'Premier' },
      { id: 'Deux', libelle: 'Deuxième', desactive: true },
      { id: 'Trois', libelle: 'Troisième' },
      { id: 'Quatre', libelle: 'Quatrième' },
    ]);
    fixture.componentRef.setInput('ongletActif', 'Un');
    fixture.detectChanges();
  });

  describe('rendu accessible', () => {
    it('expose une liste d’onglets nommée', () => {
      const liste = fixture.debugElement.query(By.css('[role="tablist"]')).nativeElement;
      expect(liste.getAttribute('aria-label')).toBe('Sections');
    });

    it('relie chaque onglet à son panneau et marque l’onglet actif', () => {
      const [un, deux] = boutons();
      expect(un.id).toBe('ongletUn');
      expect(un.getAttribute('aria-controls')).toBe('panneauUn');
      expect(un.getAttribute('aria-selected')).toBe('true');
      expect(un.tabIndex).toBe(0);
      expect(deux.getAttribute('aria-selected')).toBe('false');
      expect(deux.tabIndex).toBe(-1);
    });

    it('désactive un onglet marqué désactivé', () => {
      expect(boutons()[1].disabled).toBe(true);
      expect(boutons()[2].disabled).toBe(false);
    });
  });

  describe('sélection', () => {
    it('demande la sélection d’un autre onglet au clic', () => {
      const spy = vi.spyOn((component as any).selection, 'emit');
      boutons()[2].click();
      expect(spy).toHaveBeenCalledWith('Trois');
    });

    it('n’émet rien au clic sur l’onglet déjà actif', () => {
      const spy = vi.spyOn((component as any).selection, 'emit');
      boutons()[0].click();
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('navigation clavier', () => {
    it('→ passe à l’onglet suivant en sautant l’onglet désactivé', () => {
      const evenement = presser(0, 'ArrowRight');
      expect(document.activeElement).toBe(boutons()[2]);
      expect(evenement.defaultPrevented).toBe(true);
    });

    it('→ sur le dernier onglet revient au premier', () => {
      presser(3, 'ArrowRight');
      expect(document.activeElement).toBe(boutons()[0]);
    });

    it('← sur le premier onglet va au dernier', () => {
      presser(0, 'ArrowLeft');
      expect(document.activeElement).toBe(boutons()[3]);
    });

    it('Début et Fin vont au premier et au dernier onglet', () => {
      presser(2, 'End');
      expect(document.activeElement).toBe(boutons()[3]);
      presser(3, 'Home');
      expect(document.activeElement).toBe(boutons()[0]);
    });

    it('ignore les autres touches et ne demande pas de sélection', () => {
      const spy = vi.spyOn((component as any).selection, 'emit');
      const evenement = presser(0, 'a');
      expect(evenement.defaultPrevented).toBe(false);
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
