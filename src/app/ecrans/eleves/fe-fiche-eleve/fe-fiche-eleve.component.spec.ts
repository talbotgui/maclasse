import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { FeFicheEleveComponent } from './fe-fiche-eleve.component';
import { AutorisationMother, EleveMother } from '../../../tests/eleve.mother';
import { LIBELLES } from '../../../libelles';
import type { Eleve } from '../../../modeles/eleve.modele';

describe('FeFicheEleveComponent', () => {
  let fixture: ComponentFixture<FeFicheEleveComponent>;
  let component: FeFicheEleveComponent;

  const groupes = [
    { id: 'GA', libelle: 'Groupe A' },
    { id: 'GB', libelle: 'Groupe B' },
  ];
  const statutsEleve = [{ id: 'DC', libelle: 'Dans la classe' }];
  const typesContact = [{ id: 'P', libelle: 'Père' }];
  const eleve = EleveMother.base('e1', 'MARTIN', 'Alice', {
    statut: 'DC',
    groupes: ['GA', 'GB'],
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(FeFicheEleveComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('eleve', eleve);
    fixture.componentRef.setInput('groupes', groupes);
    fixture.componentRef.setInput('statutsEleve', statutsEleve);
    fixture.componentRef.setInput('typesContact', typesContact);
    fixture.detectChanges();
  });

  describe('obtenirLibelleStatut', () => {
    it("retourne le libellé correspondant à l'id", () => {
      expect((component as any).obtenirLibelleStatut('DC')).toBe('Dans la classe');
    });

    it("retourne l'id brut si statut non trouvé", () => {
      expect((component as any).obtenirLibelleStatut('inconnu')).toBe('inconnu');
    });
  });

  describe('obtenirLibelleTypeContact', () => {
    it("retourne le libellé correspondant à l'id", () => {
      expect((component as any).obtenirLibelleTypeContact('P')).toBe('Père');
    });

    it("retourne l'id brut si type non trouvé", () => {
      expect((component as any).obtenirLibelleTypeContact('X')).toBe('X');
    });
  });

  describe('obtenirLibelleGroupe', () => {
    it('retourne le libellé du groupe', () => {
      expect((component as any).obtenirLibelleGroupe('GA')).toBe('Groupe A');
    });

    it("retourne l'id brut si groupe non trouvé", () => {
      expect((component as any).obtenirLibelleGroupe('GZ')).toBe('GZ');
    });
  });

  describe('outputs', () => {
    it('modifier émet quand onModifier() est appelée', () => {
      const spy = vi.spyOn((component as any).modifier, 'emit');
      component['onModifier']();
      expect(spy).toHaveBeenCalled();
    });

    it('supprimer émet quand onSupprimer() est appelée', () => {
      const spy = vi.spyOn((component as any).supprimer, 'emit');
      component['onSupprimer']();
      expect(spy).toHaveBeenCalled();
    });

    it('imprimer émet quand onImprimer() est appelée', () => {
      const spy = vi.spyOn((component as any).imprimer, 'emit');
      component['onImprimer']();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('affichage DOM', () => {
    it('affiche le nom en majuscules', () => {
      expect(fixture.nativeElement.textContent).toContain('MARTIN');
    });

    it('affiche le prénom', () => {
      expect(fixture.nativeElement.textContent).toContain('Alice');
    });
  });

  describe('notes administratives et informations utiles', () => {
    const afficher = (surcharge: Partial<Eleve>): void => {
      fixture.componentRef.setInput('eleve', EleveMother.base('e1', 'MARTIN', 'Alice', surcharge));
      fixture.detectChanges();
    };
    const texte = (selecteur: string): string | undefined =>
      (fixture.nativeElement.querySelector(selecteur) as HTMLElement | null)?.textContent?.trim();

    it('réponse et précision → « Réponse — précision »', () => {
      afficher({
        droitImage: AutorisationMother.vide({ reponse: 'accepte', precision: 'Sauf presse' }),
      });

      expect((component as any).autorisationsRenseignees()).toEqual([
        {
          libelle: LIBELLES.eleve.labelDroitImage,
          valeur: LIBELLES.eleve.reponsesAutorisation.accepte + ' — Sauf presse',
        },
      ]);
    });

    it('réponse sans précision → réponse seule', () => {
      afficher({ autorisationBaignade: AutorisationMother.vide({ reponse: 'sansReponse' }) });

      expect((component as any).autorisationsRenseignees()).toEqual([
        {
          libelle: LIBELLES.eleve.labelAutorisationBaignade,
          valeur: LIBELLES.eleve.reponsesAutorisation.sansReponse,
        },
      ]);
    });

    it('précision sans réponse → précision seule', () => {
      afficher({ autorisationSortieReguliere: AutorisationMother.vide({ precision: 'Le mardi' }) });

      expect((component as any).autorisationsRenseignees()).toEqual([
        { libelle: LIBELLES.eleve.labelAutorisationSortieReguliere, valeur: 'Le mardi' },
      ]);
    });

    it('autorisations, PPA et ESS vides → section Notes administratives masquée', () => {
      afficher({});

      expect((component as any).autorisationsRenseignees()).toEqual([]);
      expect(fixture.nativeElement.querySelector('#titreNotes')).toBeNull();
    });

    it('autorisation renseignée → section affichée avec son libellé et sa valeur', () => {
      afficher({ droitImage: AutorisationMother.vide({ reponse: 'refuse' }) });

      expect(texte('#titreNotes + dl dt')).toBe(LIBELLES.eleve.labelDroitImage);
      expect(texte('#titreNotes + dl dd')).toBe(LIBELLES.eleve.reponsesAutorisation.refuse);
    });

    it('rien de renseigné → section Informations utiles masquée', () => {
      afficher({});

      expect((component as any).informationsUtiles()).toEqual([]);
      expect(fixture.nativeElement.querySelector('#titreInfosUtiles')).toBeNull();
    });

    it('cases cochées et latéralité → affichées dans la section Informations utiles', () => {
      afficher({ portLunettes: true, notificationAesh: true, lateralite: 'gaucher' });

      const attendu = [
        LIBELLES.eleve.labelPortLunettes,
        LIBELLES.eleve.labelNotificationAesh,
        LIBELLES.eleve.labelLateralite + ' : ' + LIBELLES.eleve.lateralites.gaucher,
      ];
      expect((component as any).informationsUtiles()).toEqual(attendu);
      const items = Array.from(
        fixture.nativeElement.querySelectorAll('#titreInfosUtiles + ul li'),
      ).map((li) => (li as HTMLElement).textContent?.trim());
      expect(items).toEqual(attendu);
    });

    it('seule la case lunettes cochée → seul « Port de lunettes » affiché', () => {
      afficher({ portLunettes: true });

      expect((component as any).informationsUtiles()).toEqual([LIBELLES.eleve.labelPortLunettes]);
    });

    it('seule la latéralité renseignée → seule la latéralité affichée', () => {
      afficher({ lateralite: 'droitier' });

      expect((component as any).informationsUtiles()).toEqual([
        LIBELLES.eleve.labelLateralite + ' : ' + LIBELLES.eleve.lateralites.droitier,
      ]);
    });

    it('seule la case AESH cochée → seule « Notification AESH » affichée', () => {
      afficher({ notificationAesh: true });

      expect((component as any).informationsUtiles()).toEqual([
        LIBELLES.eleve.labelNotificationAesh,
      ]);
    });
  });
});
