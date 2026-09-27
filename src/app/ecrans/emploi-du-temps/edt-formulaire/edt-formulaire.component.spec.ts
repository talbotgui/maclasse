import { LIBELLES } from '../../../libelles';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { EdtFormulaireComponent } from './edt-formulaire.component';
import { DonneesService } from '../../../services/avecEtat/donnees.service';
import { DonneesMother } from '../../../tests/donnees.mother';
import {
  EdtMother,
  CreneauMother,
  TempsCreneauMother,
} from '../../../tests/emploi-du-temps.mother';
import type {
  EmploiDuTemps,
  CreneauEdt,
  ElevesConcernes,
} from '../../../modeles/emploi-du-temps.modele';

describe('EdtFormulaireComponent', () => {
  let fixture: ComponentFixture<EdtFormulaireComponent>;
  let component: EdtFormulaireComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    TestBed.inject(DonneesService).charger(DonneesMother.base());
    fixture = TestBed.createComponent(EdtFormulaireComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('domaines', [{ id: 'd1', libelle: 'Français', enfants: [] }]);
    fixture.componentRef.setInput('joursOuvres', ['lundi', 'mardi', 'mercredi']);
    fixture.detectChanges();
  });

  describe('initialisation EDT', () => {
    it('edt=null → formEdt=null', () => {
      fixture.componentRef.setInput('edt', null);
      fixture.detectChanges();

      expect((component as any).formEdt).toBeNull();
    });

    it('edt fourni → formEdt est un clone', () => {
      const edt = EdtMother.base({ nom: 'Mon EDT' });
      fixture.componentRef.setInput('edt', edt);
      fixture.detectChanges();

      expect((component as any).formEdt.nom).toBe('Mon EDT');
      expect((component as any).formEdt).not.toBe(edt);
    });

    it("changement d'identité d'edt → formEdt rechargé", () => {
      const e1 = EdtMother.base({ id: 'edt1', nom: 'EDT 1' });
      const e2 = EdtMother.base({ id: 'edt2', nom: 'EDT 2' });
      fixture.componentRef.setInput('edt', e1);
      fixture.detectChanges();
      fixture.componentRef.setInput('edt', e2);
      fixture.detectChanges();

      expect((component as any).formEdt.nom).toBe('EDT 2');
    });

    it('régression SOU-020 : même identité d’edt avec contenu différent → formEdt non écrasé', () => {
      const e1 = EdtMother.base({ id: 'edt1', nom: 'EDT 1' });
      fixture.componentRef.setInput('edt', e1);
      fixture.detectChanges();
      (component as any).formEdt.nom = 'Saisie en cours';

      const e1Modifie = EdtMother.base({ id: 'edt1', nom: 'EDT 1 (modifié ailleurs)' });
      fixture.componentRef.setInput('edt', e1Modifie);
      fixture.detectChanges();

      expect((component as any).formEdt.nom).toBe('Saisie en cours');
    });
  });

  describe('initialisation créneau', () => {
    it('creneau=null → formCreneau=null', () => {
      fixture.componentRef.setInput('creneau', null);
      fixture.detectChanges();

      expect((component as any).formCreneau).toBeNull();
    });

    it('creneau fourni → formCreneau est un clone', () => {
      const creneau = CreneauMother.avecHoraire('10:00', '12:00');
      fixture.componentRef.setInput('creneau', creneau);
      fixture.detectChanges();

      expect((component as any).formCreneau.temps[0].heureDebut).toBe('10:00');
      expect((component as any).formCreneau).not.toBe(creneau);
    });

    it('changement d’identité de créneau → formCreneau rechargé', () => {
      const c1 = CreneauMother.avecHoraire('09:00', '12:00', { id: 'c1' });
      const c2 = CreneauMother.avecHoraire('11:00', '12:00', { id: 'c2' });
      fixture.componentRef.setInput('creneau', c1);
      fixture.detectChanges();
      fixture.componentRef.setInput('creneau', c2);
      fixture.detectChanges();

      expect((component as any).formCreneau.temps[0].heureDebut).toBe('11:00');
    });

    it('régression SOU-020 : même identité de créneau avec contenu différent → formCreneau non écrasé', () => {
      const c1 = CreneauMother.avecHoraire('09:00', '12:00', { id: 'c1' });
      fixture.componentRef.setInput('creneau', c1);
      fixture.detectChanges();
      (component as any).formCreneau.temps[0].heureDebut = '07:30';

      const c1Modifie = CreneauMother.avecHoraire('11:00', '12:00', { id: 'c1' });
      fixture.componentRef.setInput('creneau', c1Modifie);
      fixture.detectChanges();

      expect((component as any).formCreneau.temps[0].heureDebut).toBe('07:30');
    });
  });

  describe('estModifie', () => {
    it('retourne false juste après le chargement des propriétés EDT', () => {
      fixture.componentRef.setInput('edt', EdtMother.base({ nom: 'Mon EDT' }));
      fixture.detectChanges();

      expect(component.estModifie()).toBe(false);
    });

    it('retourne true après modification locale des propriétés EDT', () => {
      fixture.componentRef.setInput('edt', EdtMother.base({ nom: 'Mon EDT' }));
      fixture.detectChanges();

      (component as any).formEdt.nom = 'Nom modifié';

      expect(component.estModifie()).toBe(true);
    });

    it('retourne false juste après le chargement du créneau', () => {
      fixture.componentRef.setInput('creneau', CreneauMother.lundi9h10());
      fixture.detectChanges();

      expect(component.estModifie()).toBe(false);
    });

    it('retourne true après modification locale du créneau', () => {
      fixture.componentRef.setInput('creneau', CreneauMother.avecHoraire('09:00', '12:00'));
      fixture.detectChanges();

      (component as any).formCreneau.temps[0].heureDebut = '10:00';

      expect(component.estModifie()).toBe(true);
    });

    it('revient à false après rechargement sur un edt de identité différente', () => {
      fixture.componentRef.setInput('edt', EdtMother.base({ id: 'edt1', nom: 'Mon EDT' }));
      fixture.detectChanges();
      (component as any).formEdt.nom = 'Nom modifié';
      expect(component.estModifie()).toBe(true);

      fixture.componentRef.setInput('edt', EdtMother.base({ id: 'edt2', nom: 'Autre EDT' }));
      fixture.detectChanges();

      expect(component.estModifie()).toBe(false);
    });
  });

  describe('optionsJour', () => {
    it('reflète les jours ouvrés reçus en input', () => {
      fixture.componentRef.setInput('joursOuvres', ['lundi', 'jeudi']);
      fixture.detectChanges();

      expect((component as any).optionsJour()).toEqual([
        { valeur: 'lundi', libelle: 'Lundi' },
        { valeur: 'jeudi', libelle: 'Jeudi' },
      ]);
    });

    it('retourne [] si aucun jour ouvré fourni', () => {
      fixture.componentRef.setInput('joursOuvres', []);
      fixture.detectChanges();

      expect((component as any).optionsJour()).toEqual([]);
    });
  });

  describe('estEditionCreneau', () => {
    it('false si creneau=null', () => {
      fixture.componentRef.setInput('creneau', null);
      fixture.detectChanges();

      expect((component as any).estEditionCreneau()).toBe(false);
    });

    it('true si creneau existant dans l’EDT', () => {
      fixture.componentRef.setInput('creneau', CreneauMother.lundi9h10({ id: 'c1' }));
      fixture.componentRef.setInput('creneauExistant', true);
      fixture.detectChanges();

      expect((component as any).estEditionCreneau()).toBe(true);
    });

    it('affiche « Créer » et pas SUPPRIMER pour un nouveau créneau', () => {
      fixture.componentRef.setInput('creneau', CreneauMother.lundi9h10({ id: 'c1' }));
      fixture.componentRef.setInput('creneauExistant', false);
      fixture.detectChanges();

      const titre = fixture.nativeElement.querySelector('#formCreneau h2') as HTMLElement;
      expect(titre.textContent).toContain(LIBELLES.commun.creer);
      expect(fixture.nativeElement.querySelector('#btnSupprimerCreneau')).toBeNull();
    });

    it('affiche « Modifier » et SUPPRIMER pour un créneau existant', () => {
      fixture.componentRef.setInput('creneau', CreneauMother.lundi9h10({ id: 'c1' }));
      fixture.componentRef.setInput('creneauExistant', true);
      fixture.detectChanges();

      const titre = fixture.nativeElement.querySelector('#formCreneau h2') as HTMLElement;
      expect(titre.textContent).toContain(LIBELLES.commun.modifier);
      expect(fixture.nativeElement.querySelector('#btnSupprimerCreneau')).not.toBeNull();
    });

    it('false pour un nouveau créneau, même s’il porte déjà un id', () => {
      fixture.componentRef.setInput('creneau', CreneauMother.lundi9h10({ id: 'c1' }));
      fixture.componentRef.setInput('creneauExistant', false);
      fixture.detectChanges();

      expect((component as any).estEditionCreneau()).toBe(false);
    });
  });

  describe('basculerDiscipline', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('creneau', CreneauMother.lundi9h10());
      fixture.detectChanges();
    });

    it('ajoute une discipline absente', () => {
      (component as any).basculerDiscipline(0, 'd1', true);

      expect((component as any).formCreneau.temps[0].disciplinesIds).toContain('d1');
    });

    it('retire une discipline présente', () => {
      (component as any).formCreneau.temps[0].disciplinesIds = ['d1'];

      (component as any).basculerDiscipline(0, 'd1', false);

      expect((component as any).formCreneau.temps[0].disciplinesIds).not.toContain('d1');
    });

    it('ne fait rien si formCreneau=null', () => {
      fixture.componentRef.setInput('creneau', null);
      fixture.detectChanges();

      expect(() => (component as any).basculerDiscipline(0, 'd1', true)).not.toThrow();
    });
  });

  describe('surElevesConcernesChange', () => {
    it('met à jour elevesConcernes du formCreneau', () => {
      fixture.componentRef.setInput('creneau', CreneauMother.lundi9h10());
      fixture.detectChanges();
      const val: ElevesConcernes = { type: 'groupes', groupes: ['GA'], elevesIds: [] };

      (component as any).surElevesConcernesChange(0, val);

      expect((component as any).formCreneau.temps[0].elevesConcernes).toEqual(val);
    });

    it('ne fait rien si formCreneau=null', () => {
      fixture.componentRef.setInput('creneau', null);
      fixture.detectChanges();

      expect(() =>
        (component as any).surElevesConcernesChange(0, {
          type: 'classe',
          groupes: [],
          elevesIds: [],
        }),
      ).not.toThrow();
    });
  });

  describe('onEnregistrerEdt', () => {
    it('émet un clone de formEdt', () => {
      const edt = EdtMother.base({ nom: 'Semaine A' });
      fixture.componentRef.setInput('edt', edt);
      fixture.detectChanges();

      const spy = vi.spyOn((component as any).edtEnregistre, 'emit');

      (component as any).onEnregistrerEdt();

      expect(spy).toHaveBeenCalledTimes(1);
      const emis = spy.mock.calls[0][0] as EmploiDuTemps;
      expect(emis.nom).toBe('Semaine A');
      expect(emis).not.toBe((component as any).formEdt);
    });

    it("n'émet pas si formEdt=null", () => {
      fixture.componentRef.setInput('edt', null);
      fixture.detectChanges();

      const spy = vi.spyOn((component as any).edtEnregistre, 'emit');

      (component as any).onEnregistrerEdt();

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('validation du nom de l’EDT', () => {
    it("n'émet pas et affiche l'erreur si le nom est vide (espaces seuls)", () => {
      fixture.componentRef.setInput('edt', EdtMother.base({ nom: '   ' }));
      fixture.detectChanges();
      const spy = vi.spyOn((component as any).edtEnregistre, 'emit');

      (component as any).onEnregistrerEdt();
      fixture.detectChanges();

      expect(spy).not.toHaveBeenCalled();
      const erreur = fixture.nativeElement.querySelector('#erreurFormulaireEdt') as HTMLElement;
      expect(erreur.getAttribute('role')).toBe('alert');
      expect(erreur.textContent?.trim()).toBe(LIBELLES.edt.erreurNomObligatoire);
    });

    it("n'affiche pas d'erreur avant une tentative d'enregistrement", () => {
      fixture.componentRef.setInput('edt', EdtMother.base({ nom: '' }));
      fixture.detectChanges();

      expect((component as any).obtenirErreurNomEdt()).toBeNull();
      expect(fixture.nativeElement.querySelector('#erreurFormulaireEdt')).toBeNull();
    });

    it("efface l'erreur au chargement d'un autre EDT", () => {
      fixture.componentRef.setInput('edt', EdtMother.base({ id: 'a', nom: '' }));
      fixture.detectChanges();
      (component as any).onEnregistrerEdt();

      fixture.componentRef.setInput('edt', EdtMother.base({ id: 'b', nom: '' }));
      fixture.detectChanges();

      expect((component as any).obtenirErreurNomEdt()).toBeNull();
    });
  });

  describe('validation des horaires des temps', () => {
    it("n'émet pas et signale le temps dont la fin précède le début", () => {
      const creneau = CreneauMother.lundi9h10({
        temps: [
          TempsCreneauMother.base({ id: 't1', heureDebut: '09:00', heureFin: '10:00' }),
          TempsCreneauMother.base({ id: 't2', heureDebut: '11:00', heureFin: '10:30' }),
        ],
      });
      fixture.componentRef.setInput('creneau', creneau);
      fixture.detectChanges();
      const spy = vi.spyOn((component as any).creneauEnregistre, 'emit');

      (component as any).onEnregistrerCreneau();
      fixture.detectChanges();

      expect(spy).not.toHaveBeenCalled();
      expect(fixture.nativeElement.querySelector('#erreurHeuresTemps0')).toBeNull();
      const erreur = fixture.nativeElement.querySelector('#erreurHeuresTemps1') as HTMLElement;
      expect(erreur.getAttribute('role')).toBe('alert');
      expect(erreur.textContent?.trim()).toBe(LIBELLES.commun.erreurPlageHoraire);
    });

    it("n'émet pas si l'heure de fin égale l'heure de début", () => {
      fixture.componentRef.setInput('creneau', CreneauMother.avecHoraire('09:00', '09:00'));
      fixture.detectChanges();
      const spy = vi.spyOn((component as any).creneauEnregistre, 'emit');

      (component as any).onEnregistrerCreneau();

      expect(spy).not.toHaveBeenCalled();
    });

    it("n'émet pas si une heure est vide", () => {
      fixture.componentRef.setInput('creneau', CreneauMother.avecHoraire('', '10:00'));
      fixture.detectChanges();
      const spy = vi.spyOn((component as any).creneauEnregistre, 'emit');

      (component as any).onEnregistrerCreneau();

      expect(spy).not.toHaveBeenCalled();
    });

    it("n'affiche pas d'erreur avant une tentative d'enregistrement", () => {
      fixture.componentRef.setInput('creneau', CreneauMother.avecHoraire('11:00', '10:00'));
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('#erreurHeuresTemps0')).toBeNull();
    });
  });

  describe('onEnregistrerCreneau', () => {
    it('émet un clone de formCreneau', () => {
      const creneau = CreneauMother.avecHoraire('09:00', '12:00');
      fixture.componentRef.setInput('creneau', creneau);
      fixture.detectChanges();

      const spy = vi.spyOn((component as any).creneauEnregistre, 'emit');

      (component as any).onEnregistrerCreneau();

      expect(spy).toHaveBeenCalledTimes(1);
      const emis = spy.mock.calls[0][0] as CreneauEdt;
      expect(emis.temps[0].heureDebut).toBe('09:00');
      expect(emis).not.toBe((component as any).formCreneau);
    });

    it("n'émet pas si formCreneau=null", () => {
      fixture.componentRef.setInput('creneau', null);
      fixture.detectChanges();

      const spy = vi.spyOn((component as any).creneauEnregistre, 'emit');

      (component as any).onEnregistrerCreneau();

      expect(spy).not.toHaveBeenCalled();
    });

    it('émet le nouveau jour choisi, heureDebut/heureFin inchangés', () => {
      const creneau = CreneauMother.lundi9h10({ jour: 'lundi' });
      fixture.componentRef.setInput('creneau', creneau);
      fixture.detectChanges();
      (component as any).formCreneau.jour = 'jeudi';

      const spy = vi.spyOn((component as any).creneauEnregistre, 'emit');

      (component as any).onEnregistrerCreneau();

      const emis = spy.mock.calls[0][0] as CreneauEdt;
      expect(emis.jour).toBe('jeudi');
      expect(emis.temps[0].heureDebut).toBe(creneau.temps[0].heureDebut);
      expect(emis.temps[0].heureFin).toBe(creneau.temps[0].heureFin);
    });

    it('émet une pause déjeuner sans les champs pédagogiques, en conservant le formulaire', () => {
      const tempsComplet = TempsCreneauMother.base({
        titre: 'Maths',
        disciplinesIds: ['d1'],
        elevesConcernes: { type: 'classe', groupes: [], elevesIds: [] },
      });
      fixture.componentRef.setInput('creneau', CreneauMother.lundi9h10({ temps: [tempsComplet] }));
      fixture.detectChanges();
      (component as any).formCreneau.type = 'pauseDejeuner';

      const spy = vi.spyOn((component as any).creneauEnregistre, 'emit');

      (component as any).onEnregistrerCreneau();

      const emis = spy.mock.calls[0][0] as CreneauEdt;
      expect(emis.type).toBe('pauseDejeuner');
      expect(emis.temps).toEqual([TempsCreneauMother.base()]);
      expect((component as any).formCreneau.temps[0].titre).toBe('Maths');
    });

    it('émet un créneau pédagogique avec ses champs pédagogiques', () => {
      const tempsComplet = TempsCreneauMother.base({ titre: 'Maths', disciplinesIds: ['d1'] });
      fixture.componentRef.setInput('creneau', CreneauMother.lundi9h10({ temps: [tempsComplet] }));
      fixture.detectChanges();

      const spy = vi.spyOn((component as any).creneauEnregistre, 'emit');

      (component as any).onEnregistrerCreneau();

      expect((spy.mock.calls[0][0] as CreneauEdt).temps).toEqual([tempsComplet]);
    });
  });

  describe('onEdtAnnule / onCreneauAnnule / onEdtSupprime / onCreneauSupprime', () => {
    it('onEdtAnnule émet edtAnnule', () => {
      const spy = vi.spyOn((component as any).edtAnnule, 'emit');

      (component as any).onEdtAnnule();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('onEdtAnnule restaure les valeurs enregistrées et efface les erreurs', () => {
      fixture.componentRef.setInput('edt', EdtMother.base({ nom: 'Semaine A' }));
      fixture.detectChanges();
      (component as any).formEdt.nom = '';
      (component as any).onEnregistrerEdt();

      (component as any).onEdtAnnule();

      expect((component as any).formEdt.nom).toBe('Semaine A');
      expect((component as any).estModifie()).toBe(false);
      expect((component as any).obtenirErreurNomEdt()).toBeNull();
    });

    it('onCreneauAnnule émet creneauAnnule', () => {
      const spy = vi.spyOn((component as any).creneauAnnule, 'emit');

      (component as any).onCreneauAnnule();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('onEdtSupprime émet edtSupprime', () => {
      const spy = vi.spyOn((component as any).edtSupprime, 'emit');

      (component as any).onEdtSupprime();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("onCreneauSupprime émet creneauSupprime avec l'id du créneau", () => {
      fixture.componentRef.setInput('creneau', CreneauMother.lundi9h10({ id: 'c9' }));
      fixture.detectChanges();
      const spy = vi.spyOn((component as any).creneauSupprime, 'emit');

      (component as any).onCreneauSupprime();

      expect(spy).toHaveBeenCalledWith('c9');
    });

    it("onCreneauSupprime n'émet pas si formCreneau=null", () => {
      fixture.componentRef.setInput('creneau', null);
      fixture.detectChanges();
      const spy = vi.spyOn((component as any).creneauSupprime, 'emit');

      (component as any).onCreneauSupprime();

      expect(spy).not.toHaveBeenCalled();
    });
  });
});
