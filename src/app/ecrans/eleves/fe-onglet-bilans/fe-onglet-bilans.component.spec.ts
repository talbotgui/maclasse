import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { FeOngletBilansComponent } from './fe-onglet-bilans.component';
import { DonneesService } from '../../../services/avecEtat/donnees.service';
import { DonneesMother } from '../../../tests/donnees.mother';
import { CompetenceMother } from '../../../tests/competence.mother';
import { EleveMother } from '../../../tests/eleve.mother';
import { BilanMother, SuiviSousDomaineMother } from '../../../tests/bilan.mother';
import { LIBELLES } from '../../../libelles';
import type { Bilan } from '../../../modeles/bilan.modele';
import type { Eleve } from '../../../modeles/eleve.modele';

describe('FeOngletBilansComponent', () => {
  let fixture: ComponentFixture<FeOngletBilansComponent>;
  let component: FeOngletBilansComponent;
  let donneesService: DonneesService;

  /**
   * Élève `id` dans les données courantes.
   * @param id Identifiant de l'élève.
   */
  const eleve = (id = 'e1'): Eleve =>
    donneesService.donnees()!.classe.eleves.find((e) => e.id === id)!;

  /** Transmet au composant l'élève `e1` à jour, comme le ferait l'écran. */
  const rafraichir = (): void => {
    fixture.componentRef.setInput('eleve', eleve());
    fixture.detectChanges();
  };

  /** Identifiants des bilans par sous-domaine affiché. */
  const ordre = (): Record<string, string[]> =>
    Object.fromEntries(
      (component as any)
        .sections()
        .map((s: { sousDomaineId: string; bilans: Bilan[] }) => [
          s.sousDomaineId,
          s.bilans.map((b) => b.id),
        ]),
    );

  beforeEach(() => {
    TestBed.configureTestingModule({});
    donneesService = TestBed.inject(DonneesService);
    const donnees = DonneesMother.avecEleves([
      EleveMother.base('e1', 'MARTIN', 'Paul', {
        suivisSousDomaines: [
          SuiviSousDomaineMother.avecBilans('FR-C2-L', [
            BilanMother.base('b1'),
            BilanMother.base('b2'),
          ]),
          SuiviSousDomaineMother.avecBilans('ZZ', [BilanMother.base('b3')]),
        ],
      }),
      EleveMother.base('e2', 'DUPONT', 'Léa'),
    ]);
    donnees.referentiels.competences = CompetenceMother.arbreQuatreNiveaux();
    donneesService.charger(donnees);
    fixture = TestBed.createComponent(FeOngletBilansComponent);
    component = fixture.componentInstance;
    rafraichir();
  });

  describe('affichage', () => {
    it('affiche un cadre par sous-domaine avec son libellé, ou son identifiant s’il est inconnu', () => {
      const titres = [...fixture.nativeElement.querySelectorAll('h3')].map((h: HTMLElement) =>
        h.textContent?.trim(),
      );
      expect(titres).toEqual(['Français > Cycle 2 > Lire', 'ZZ']);
      expect(ordre()).toEqual({ 'FR-C2-L': ['b1', 'b2'], ZZ: ['b3'] });
    });

    it('affiche un message quand l’élève n’a aucun bilan', () => {
      fixture.componentRef.setInput('eleve', eleve('e2'));
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.onglet-bilans__vide').textContent.trim()).toBe(
        LIBELLES.eleve.aucunBilan,
      );
      expect(fixture.nativeElement.querySelector('#btnImprimerBilans').disabled).toBe(true);
    });
  });

  describe('ajout d’un bilan', () => {
    it('reste inactif sans sous-domaine choisi', () => {
      const spy = vi.spyOn((component as any).editionChange, 'emit');
      (component as any).ajouterBilan();
      expect((component as any).edition()).toBeNull();
      expect(spy).not.toHaveBeenCalled();
    });

    it('ouvre un nouveau bilan dans un nouveau cadre de sous-domaine', () => {
      const spy = vi.spyOn((component as any).editionChange, 'emit');
      (component as any).choisirSousDomaine(['MA-C2-N']);
      (component as any).ajouterBilan();
      fixture.detectChanges();

      const edition = (component as any).edition();
      expect(edition.nouveau).toBe(true);
      expect(ordre()['MA-C2-N']).toEqual([edition.bilan.id]);
      expect((component as any).sousDomaineChoisi()).toBeNull();
      expect(spy).toHaveBeenCalledWith(true);
      expect(fixture.nativeElement.querySelector('fe-bilan-formulaire')).not.toBeNull();
      expect(donneesService.peutAnnuler()).toBe(false);
    });

    it('ajoute le nouveau bilan à la fin d’un sous-domaine existant', () => {
      (component as any).choisirSousDomaine(['FR-C2-L']);
      (component as any).ajouterBilan();
      const id = (component as any).edition().bilan.id;
      expect(ordre()['FR-C2-L']).toEqual(['b1', 'b2', id]);
    });

    it('enregistre le nouveau bilan à la validation et le déplie', () => {
      const spy = vi.spyOn((component as any).editionChange, 'emit');
      (component as any).choisirSousDomaine(['MA-C2-N']);
      (component as any).ajouterBilan();
      const bilan = { ...(component as any).edition().bilan, titre: 'Nombres' };

      (component as any).validerBilan('MA-C2-N', bilan);
      rafraichir();

      expect(eleve().suivisSousDomaines.at(-1)?.bilans[0].titre).toBe('Nombres');
      expect((component as any).edition()).toBeNull();
      expect((component as any).deplies().has(bilan.id)).toBe(true);
      expect((component as any).focusModifierId()).toBe(bilan.id);
      expect(spy).toHaveBeenLastCalledWith(false);
    });

    it('fait disparaître un nouveau bilan abandonné', () => {
      (component as any).choisirSousDomaine(['MA-C2-N']);
      (component as any).ajouterBilan();
      (component as any).annulerEdition();
      expect(ordre()['MA-C2-N']).toBeUndefined();
      expect((component as any).focusModifierId()).toBeNull();
    });
  });

  describe('modification', () => {
    it('passe un bilan en édition et bloque une seconde édition', () => {
      (component as any).modifierBilan('FR-C2-L', BilanMother.base('b1'));
      (component as any).modifierBilan('FR-C2-L', BilanMother.base('b2'));
      expect((component as any).estEnEdition('b1')).toBe(true);
      expect((component as any).estEnEdition('b2')).toBe(false);

      (component as any).choisirSousDomaine(['MA-C2-N']);
      (component as any).ajouterBilan();
      expect((component as any).estEnEdition('b1')).toBe(true);
    });

    it('rend le focus au bouton MODIFIER après annulation', () => {
      (component as any).modifierBilan('FR-C2-L', BilanMother.base('b1'));
      (component as any).annulerEdition();
      expect((component as any).edition()).toBeNull();
      expect((component as any).focusModifierId()).toBe('b1');
    });
  });

  describe('actions en lecture', () => {
    it('duplique, déplace et supprime via le service', () => {
      (component as any).deplacerBilan('FR-C2-L', 'b2', -1);
      rafraichir();
      expect(ordre()['FR-C2-L']).toEqual(['b2', 'b1']);

      (component as any).dupliquerBilan('FR-C2-L', 'b1');
      rafraichir();
      expect(ordre()['FR-C2-L']).toHaveLength(3);

      (component as any).supprimerBilan('ZZ', 'b3');
      rafraichir();
      expect(ordre()['ZZ']).toBeUndefined();
    });

    it('déplie un bilan, puis tout le sous-domaine, puis replie tout', () => {
      (component as any).basculerBilan('b1');
      expect([...(component as any).deplies()]).toEqual(['b1']);
      (component as any).basculerBilan('b1');
      expect((component as any).deplies().size).toBe(0);

      const section = (component as any).sections()[0];
      (component as any).deplierTout(section, true);
      expect([...(component as any).deplies()]).toEqual(['b1', 'b2']);
      (component as any).deplierTout(section, false);
      expect((component as any).deplies().size).toBe(0);
    });

    it('demande l’impression', () => {
      const spy = vi.spyOn((component as any).imprimer, 'emit');
      (component as any).onImprimer();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('cohérence et focus', () => {
    it('ferme l’édition d’un bilan annulé par le bouton ANNULER de l’entête', () => {
      (component as any).validerBilan('FR-C2-L', BilanMother.base('b9'));
      rafraichir();
      (component as any).modifierBilan('FR-C2-L', BilanMother.base('b9'));
      const spy = vi.spyOn((component as any).editionChange, 'emit');

      donneesService.annuler();
      rafraichir();

      expect((component as any).edition()).toBeNull();
      expect(spy).toHaveBeenCalledWith(false);
    });

    it('conserve un nouveau bilan pendant un ANNULER de l’entête', () => {
      (component as any).dupliquerBilan('FR-C2-L', 'b1');
      rafraichir();
      (component as any).choisirSousDomaine(['MA-C2-N']);
      (component as any).ajouterBilan();
      donneesService.annuler();
      rafraichir();
      expect((component as any).edition()?.nouveau).toBe(true);
    });

    it('rend le focus au champ d’ajout après l’abandon d’un nouveau bilan', async () => {
      (component as any).choisirSousDomaine(['MA-C2-N']);
      (component as any).ajouterBilan();
      fixture.detectChanges();
      (component as any).annulerEdition();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(document.activeElement?.id).toBe('rechercheCompetencesSousDomaine');
    });

    it('rend le focus au bilan voisin après une suppression, au champ d’ajout sinon', async () => {
      document.body.appendChild(fixture.nativeElement);
      (component as any).supprimerBilan('FR-C2-L', 'b1');
      rafraichir();
      await fixture.whenStable();
      expect(document.activeElement?.id).toBe('btnBasculerBilan_b2');

      (component as any).supprimerBilan('ZZ', 'b3');
      rafraichir();
      await fixture.whenStable();
      expect(document.activeElement?.id).toBe('rechercheCompetencesSousDomaine');
    });
  });

  describe('changement d’élève', () => {
    it('abandonne l’édition et replie les bilans', () => {
      (component as any).basculerBilan('b2');
      (component as any).modifierBilan('FR-C2-L', BilanMother.base('b1'));
      const spy = vi.spyOn((component as any).editionChange, 'emit');

      fixture.componentRef.setInput('eleve', eleve('e2'));
      fixture.detectChanges();

      expect((component as any).edition()).toBeNull();
      expect((component as any).deplies().size).toBe(0);
      expect(spy).toHaveBeenCalledWith(false);
    });

    it('ne signale rien sans édition en cours', () => {
      const spy = vi.spyOn((component as any).editionChange, 'emit');
      fixture.componentRef.setInput('eleve', eleve('e2'));
      fixture.detectChanges();
      expect(spy).not.toHaveBeenCalled();
    });

    it('conserve l’état pour une nouvelle version du même élève', () => {
      (component as any).basculerBilan('b1');
      (component as any).dupliquerBilan('FR-C2-L', 'b2');
      rafraichir();
      expect((component as any).deplies().has('b1')).toBe(true);
    });
  });
});
