import { describe, it, expect, beforeEach } from 'vitest';
import { Component } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { McArbreCompetencesComponent } from './mc-arbre-competences.component';
import { DonneesService } from '../../services/avecEtat/donnees.service';
import { DonneesMother } from '../../tests/donnees.mother';
import { CompetenceMother } from '../../tests/competence.mother';

/** Composant hôte minimal pour tester {@link McArbreCompetencesComponent} dans un contexte Angular réel. */
@Component({
  template: `<mc-arbre-competences [competencesSelectionnees]="[]" />`,
  imports: [McArbreCompetencesComponent],
})
class ComposantHote {}

describe('McArbreCompetencesComponent', () => {
  let fixture: ComponentFixture<ComposantHote>;

  /** Retourne tous les boutons de libellé (sélection) dans l'ordre d'affichage. */
  const boutonsLibelle = () =>
    fixture.debugElement
      .queryAll(By.css('.mc-arbre-competences__libelle'))
      .map((d) => d.nativeElement as HTMLButtonElement);

  /** Clique sur le bouton toggle du nœud `id` pour le déplier/replier. */
  const cliquerToggle = (id: string) => {
    const btn = fixture.debugElement.query(By.css(`#noeudToggle_${id}`));
    btn?.nativeElement.click();
    fixture.detectChanges();
  };

  /** Envoie un événement clavier sur le bouton à l'index donné. */
  const appuyerTouche = (indexBouton: number, key: string) => {
    const bouton = boutonsLibelle()[indexBouton];
    bouton.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    const donneesService = TestBed.inject(DonneesService);
    const d = DonneesMother.base();
    d.referentiels.competences = CompetenceMother.arbreSimple();
    donneesService.charger(d);
    fixture = TestBed.createComponent(ComposantHote);
    fixture.detectChanges();
  });

  describe('navigation clavier — ArrowDown / ArrowUp', () => {
    it('ArrowDown déplace le focus sur le nœud suivant', () => {
      const boutons = boutonsLibelle();
      boutons[0].focus();

      appuyerTouche(0, 'ArrowDown');

      expect(document.activeElement).toBe(boutons[1]);
    });

    it('ArrowUp déplace le focus sur le nœud précédent', () => {
      const boutons = boutonsLibelle();
      boutons[1].focus();

      appuyerTouche(1, 'ArrowUp');

      expect(document.activeElement).toBe(boutons[0]);
    });

    it('ArrowDown sur le dernier nœud ne déplace pas le focus', () => {
      const boutons = boutonsLibelle();
      const dernier = boutons[boutons.length - 1];
      dernier.focus();

      appuyerTouche(boutons.length - 1, 'ArrowDown');

      expect(document.activeElement).toBe(dernier);
    });

    it('ArrowUp sur le premier nœud ne déplace pas le focus', () => {
      const boutons = boutonsLibelle();
      boutons[0].focus();

      appuyerTouche(0, 'ArrowUp');

      expect(document.activeElement).toBe(boutons[0]);
    });
  });

  describe('navigation clavier — Home / End', () => {
    it('Home déplace le focus sur le premier nœud', () => {
      const boutons = boutonsLibelle();
      boutons[1].focus();

      appuyerTouche(1, 'Home');

      expect(document.activeElement).toBe(boutons[0]);
    });

    it('End déplace le focus sur le dernier nœud', () => {
      const boutons = boutonsLibelle();
      boutons[0].focus();

      appuyerTouche(0, 'End');

      expect(document.activeElement).toBe(boutons[boutons.length - 1]);
    });
  });

  describe('navigation clavier — ArrowRight', () => {
    it('ArrowRight déplie un nœud fermé et conserve le focus', () => {
      const boutons = boutonsLibelle();
      boutons[0].focus();

      appuyerTouche(0, 'ArrowRight');

      expect(boutonsLibelle().length).toBeGreaterThan(boutons.length);
      expect(document.activeElement).toBe(boutonsLibelle()[0]);
    });

    it('ArrowRight sur un nœud déjà déplié descend vers le premier enfant', () => {
      cliquerToggle('FR');
      const boutonsApresDepliage = boutonsLibelle();

      boutonsApresDepliage[0].focus();
      appuyerTouche(0, 'ArrowRight');

      expect(document.activeElement).toBe(boutonsLibelle()[1]);
    });

    it('ArrowRight sur une feuille ne fait rien', () => {
      cliquerToggle('FR');
      cliquerToggle('FR-LECT');
      const boutons = boutonsLibelle();
      const indexFeuille = boutons.findIndex((b) => b.id === 'noeudSel_FR-LECT-1');
      boutons[indexFeuille].focus();

      appuyerTouche(indexFeuille, 'ArrowRight');

      expect(document.activeElement).toBe(boutons[indexFeuille]);
      expect(boutonsLibelle().length).toBe(boutons.length);
    });
  });

  describe('navigation clavier — ArrowLeft', () => {
    it('ArrowLeft replie un nœud déplié et conserve le focus', () => {
      cliquerToggle('FR');
      const boutonsApresDepliage = boutonsLibelle();
      boutonsApresDepliage[0].focus();

      appuyerTouche(0, 'ArrowLeft');

      expect(boutonsLibelle().length).toBeLessThan(boutonsApresDepliage.length);
      expect(document.activeElement).toBe(boutonsLibelle()[0]);
    });

    it('ArrowLeft depuis un enfant remonte vers le parent', () => {
      cliquerToggle('FR');
      const boutons = boutonsLibelle();
      const indexEnfant = boutons.findIndex((b) => b.id === 'noeudSel_FR-LECT');
      boutons[indexEnfant].focus();

      appuyerTouche(indexEnfant, 'ArrowLeft');

      expect(document.activeElement).toBe(boutonsLibelle()[0]);
    });

    it('ArrowLeft sur un nœud racine fermé ne fait rien', () => {
      const boutons = boutonsLibelle();
      boutons[0].focus();

      appuyerTouche(0, 'ArrowLeft');

      expect(document.activeElement).toBe(boutons[0]);
    });
  });
});
