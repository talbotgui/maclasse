import { describe, it, expect, beforeEach } from 'vitest';
import { Component } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { McSelecteurCompetencesComponent } from './mc-selecteur-competences.component';
import { DonneesService } from '../../services/avecEtat/donnees.service';
import { DonneesMother } from '../../tests/donnees.mother';
import { CompetenceMother } from '../../tests/competence.mother';

/**
 * Composant hôte minimal permettant de tester {@link McSelecteurCompetencesComponent}
 * avec des inputs/outputs liés.
 */
@Component({
  template: `
    <mc-selecteur-competences
      [competencesSelectionnees]="selectionnes"
      [multiSelection]="multi"
      (selectionChange)="selectionnes = $event"
    />
  `,
  imports: [McSelecteurCompetencesComponent],
})
class ComposantHote {
  /** Identifiants des compétences sélectionnées, mis à jour lors de `selectionChange`. */
  selectionnes: string[] = [];
  /** Mode de sélection. */
  multi = true;
}

describe('McSelecteurCompetencesComponent', () => {
  let fixture: ComponentFixture<ComposantHote>;
  let hote: ComposantHote;

  /** Retourne l'élément input de l'autocomplétion. */
  const champSaisie = () =>
    fixture.debugElement.query(By.css('#rechercheCompetences')).nativeElement as HTMLInputElement;

  /** Simule une saisie dans le champ d'autocomplétion. */
  const saisir = (valeur: string) => {
    const input = champSaisie();
    input.value = valeur;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };

  /** Envoie une touche clavier sur le champ de saisie. */
  const appuyerTouche = (key: string) => {
    champSaisie().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    fixture.detectChanges();
  };

  /** Retourne les options visibles dans la liste de suggestions. */
  const suggestions = () =>
    fixture.debugElement
      .queryAll(By.css('.mc-selecteur-competences__option'))
      .map((d) => d.nativeElement as HTMLLIElement);

  /** Retourne les CHIPs des compétences sélectionnées. */
  const chipsSelection = () =>
    fixture.debugElement.queryAll(By.css('.mc-selecteur-competences__chip'));

  /** Clique sur le bouton chip d'un domaine par son identifiant. */
  const cliquerFiltreDomaine = (id: string) => {
    fixture.debugElement.query(By.css(`#filtreDomaine_${id}`))?.nativeElement.click();
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    const donneesService = TestBed.inject(DonneesService);
    const d = DonneesMother.base();
    d.referentiels.competences = CompetenceMother.arbreSimple();
    donneesService.charger(d);
    fixture = TestBed.createComponent(ComposantHote);
    hote = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('chips de filtre par domaine', () => {
    it('affiche un chip par domaine de niveau 1', () => {
      const chips = fixture.debugElement.queryAll(
        By.css('.mc-selecteur-competences__domaines mc-chip-filtre'),
      );

      expect(chips.length).toBe(2);
    });

    it('activer un filtre de domaine restreint les suggestions', () => {
      saisir('a');
      const avantFiltre = suggestions().length;

      cliquerFiltreDomaine('MATH');
      saisir('a');

      expect(suggestions().length).toBeLessThan(avantFiltre);
      expect(suggestions().every((o) => o.textContent?.includes('Mathématiques'))).toBe(true);
    });

    it('désactiver un filtre de domaine restaure toutes les suggestions', () => {
      saisir('a');
      const total = suggestions().length;

      cliquerFiltreDomaine('MATH');
      cliquerFiltreDomaine('MATH');
      saisir('a');

      expect(suggestions().length).toBe(total);
    });
  });

  describe('autocomplétion', () => {
    it('saisie vide : aucune suggestion affichée', () => {
      saisir('');

      expect(suggestions()).toHaveLength(0);
    });

    it('saisie "lecture" : suggère le chemin complet', () => {
      saisir('lecture');

      expect(suggestions()).toHaveLength(1);
      expect(suggestions()[0].textContent?.trim()).toBe('Français › Lecture');
    });

    it('saisie sans correspondance : affiche "aucun résultat"', () => {
      saisir('zzzzz');

      const message = fixture.debugElement.query(
        By.css('.mc-selecteur-competences__aucun-resultat'),
      );
      expect(message).not.toBeNull();
      expect(suggestions()).toHaveLength(0);
    });

    it('saisie "texte" : suggère la compétence feuille avec chemin complet', () => {
      saisir('texte');

      expect(suggestions()).toHaveLength(1);
      expect(suggestions()[0].textContent?.trim()).toBe(
        'Français › Lecture › Comprendre un texte lu',
      );
    });
  });

  describe('navigation clavier dans les suggestions', () => {
    it('ArrowDown sélectionne la première option', () => {
      saisir('a');

      appuyerTouche('ArrowDown');

      expect(suggestions()[0].classList).toContain('mc-selecteur-competences__option--active');
    });

    it('ArrowDown puis ArrowDown sélectionne la deuxième option', () => {
      saisir('a');

      appuyerTouche('ArrowDown');
      appuyerTouche('ArrowDown');

      expect(suggestions()[1].classList).toContain('mc-selecteur-competences__option--active');
      expect(suggestions()[0].classList).not.toContain('mc-selecteur-competences__option--active');
    });

    it('ArrowUp depuis le début ne passe pas en dessous de -1', () => {
      saisir('a');

      appuyerTouche('ArrowUp');

      expect(
        suggestions().every(
          (o) => !o.classList.contains('mc-selecteur-competences__option--active'),
        ),
      ).toBe(true);
    });

    it("Enter sélectionne l'option focalisée et vide le champ", () => {
      saisir('lecture');
      appuyerTouche('ArrowDown');

      appuyerTouche('Enter');

      expect(hote.selectionnes).toContain('FR-LECT');
      expect(champSaisie().value).toBe('');
    });

    it('Escape ferme le panneau et vide le champ', () => {
      saisir('lecture');

      appuyerTouche('Escape');

      expect(champSaisie().value).toBe('');
      expect(suggestions()).toHaveLength(0);
    });
  });

  describe('sélection de compétences', () => {
    it("cliquer sur une suggestion émet selectionChange avec l'ID et vide le champ", () => {
      saisir('lecture');

      suggestions()[0].click();
      fixture.detectChanges();

      expect(hote.selectionnes).toContain('FR-LECT');
      expect(champSaisie().value).toBe('');
    });

    it('cliquer sur une compétence déjà sélectionnée ne crée pas de doublon', () => {
      saisir('lecture');
      suggestions()[0].click();
      fixture.detectChanges();

      saisir('lecture');
      suggestions()[0].click();
      fixture.detectChanges();

      expect(hote.selectionnes.filter((id) => id === 'FR-LECT')).toHaveLength(1);
    });

    it('mode mono : sélectionner remplace la sélection existante', () => {
      hote.multi = false;
      // Pas de detectChanges isolé : la saisie déclenche le premier cycle commun
      saisir('nombres');
      suggestions()[0].click();
      fixture.detectChanges();

      saisir('lecture');
      suggestions()[0].click();
      fixture.detectChanges();

      expect(hote.selectionnes).toEqual(['FR-LECT']);
    });
  });

  describe('chips des compétences sélectionnées', () => {
    it('affiche un chip par compétence sélectionnée avec son libellé court', () => {
      saisir('texte');
      suggestions()[0].click();
      fixture.detectChanges();

      const chips = chipsSelection();
      expect(chips).toHaveLength(1);
      expect(chips[0].nativeElement.textContent).toContain('Comprendre un texte lu');
    });

    it('supprimer un chip émet la sélection sans cet identifiant', () => {
      saisir('texte');
      suggestions()[0].click();
      fixture.detectChanges();

      saisir('haute');
      suggestions()[0].click();
      fixture.detectChanges();

      fixture.debugElement.query(By.css('#supprimerComp_FR-LECT-1'))?.nativeElement.click();
      fixture.detectChanges();

      expect(hote.selectionnes).not.toContain('FR-LECT-1');
      expect(hote.selectionnes).toContain('FR-LECT-2');
    });

    it("n'affiche pas la zone chips si la sélection est vide", () => {
      expect(chipsSelection()).toHaveLength(0);
    });
  });
});
