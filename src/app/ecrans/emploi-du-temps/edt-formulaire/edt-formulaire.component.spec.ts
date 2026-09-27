import { LIBELLES } from '../../../libelles';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { EdtFormulaireComponent } from './edt-formulaire.component';
import { DonneesService } from '../../../services/avecEtat/donnees.service';
import { EmploiDuTempsService } from '../../../services/sansEtat/emploi-du-temps.service';
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
    it('edt=null → aucun formulaire de propriétés affiché', () => {
      fixture.componentRef.setInput('edt', null);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('#formProprietesEdt')).toBeNull();
    });

    it('edt fourni → formulaire chargé avec ses valeurs, dates nulles en chaîne vide', () => {
      fixture.componentRef.setInput(
        'edt',
        EdtMother.base({ nom: 'Mon EDT', dateFin: '2026-10-18' }),
      );
      fixture.detectChanges();

      expect((component as any).formEdt.getRawValue()).toEqual({
        nom: 'Mon EDT',
        dateDebut: '',
        dateFin: '2026-10-18',
        frequence: 'lesDeux',
      });
      expect(fixture.nativeElement.querySelector('#formProprietesEdt')).not.toBeNull();
    });

    it("changement d'identité d'edt → formulaire rechargé", () => {
      fixture.componentRef.setInput('edt', EdtMother.base({ id: 'edt1', nom: 'EDT 1' }));
      fixture.detectChanges();
      fixture.componentRef.setInput('edt', EdtMother.base({ id: 'edt2', nom: 'EDT 2' }));
      fixture.detectChanges();

      expect((component as any).formEdt.controls.nom.value).toBe('EDT 2');
    });

    it('régression SOU-020 : même identité d’edt avec contenu différent (UNDO/REDO) → saisie conservée', () => {
      fixture.componentRef.setInput('edt', EdtMother.base({ id: 'edt1', nom: 'EDT 1' }));
      fixture.detectChanges();
      (component as any).formEdt.controls.nom.setValue('Saisie en cours');

      fixture.componentRef.setInput(
        'edt',
        EdtMother.base({ id: 'edt1', nom: 'EDT 1 (modifié ailleurs)' }),
      );
      fixture.detectChanges();

      expect((component as any).formEdt.controls.nom.value).toBe('Saisie en cours');
    });
  });

  describe('initialisation créneau', () => {
    it('creneau fourni → formulaire chargé avec un groupe par temps', () => {
      const creneau = CreneauMother.lundi9h10({
        jour: 'mardi',
        temps: [
          TempsCreneauMother.base({ id: 't1', heureDebut: '10:00', heureFin: '11:00' }),
          TempsCreneauMother.base({ id: 't2', heureDebut: '11:00', heureFin: '12:00' }),
        ],
      });
      fixture.componentRef.setInput('creneau', creneau);
      fixture.detectChanges();

      const valeur = (component as any).formCreneau.getRawValue();
      expect(valeur.jour).toBe('mardi');
      expect(valeur.temps.map((t: { id: string }) => t.id)).toEqual(['t1', 't2']);
      expect(valeur.temps[0].heureDebut).toBe('10:00');
      expect(fixture.nativeElement.querySelector('#inputHeureDebutTemps1')).not.toBeNull();
    });

    it("changement d'identité de créneau → FormArray reconstruit", () => {
      fixture.componentRef.setInput(
        'creneau',
        CreneauMother.lundi9h10({
          id: 'c1',
          temps: [TempsCreneauMother.base({ id: 'a' }), TempsCreneauMother.base({ id: 'b' })],
        }),
      );
      fixture.detectChanges();
      fixture.componentRef.setInput(
        'creneau',
        CreneauMother.avecHoraire('11:00', '12:00', { id: 'c2' }),
      );
      fixture.detectChanges();

      const temps = (component as any).tempsFormArray;
      expect(temps.length).toBe(1);
      expect(temps.at(0).controls.heureDebut.value).toBe('11:00');
    });

    it('régression SOU-020 : même identité de créneau avec contenu différent (UNDO/REDO) → saisie conservée', () => {
      fixture.componentRef.setInput(
        'creneau',
        CreneauMother.avecHoraire('09:00', '12:00', { id: 'c1' }),
      );
      fixture.detectChanges();
      (component as any).tempsFormArray.at(0).controls.heureDebut.setValue('07:30');

      fixture.componentRef.setInput(
        'creneau',
        CreneauMother.avecHoraire('11:00', '12:00', { id: 'c1' }),
      );
      fixture.detectChanges();

      expect((component as any).tempsFormArray.at(0).controls.heureDebut.value).toBe('07:30');
    });
  });

  describe('estModifie', () => {
    it('retourne false sans aucun formulaire chargé', () => {
      expect(component.estModifie()).toBe(false);
    });

    it('retourne false juste après le chargement des propriétés EDT', () => {
      fixture.componentRef.setInput('edt', EdtMother.base({ nom: 'Mon EDT' }));
      fixture.detectChanges();

      expect(component.estModifie()).toBe(false);
    });

    it('retourne true après modification des propriétés EDT', () => {
      fixture.componentRef.setInput('edt', EdtMother.base({ nom: 'Mon EDT' }));
      fixture.detectChanges();

      (component as any).formEdt.controls.nom.setValue('Nom modifié');

      expect(component.estModifie()).toBe(true);
    });

    it('retourne false après retour à la valeur d’origine', () => {
      fixture.componentRef.setInput('edt', EdtMother.base({ nom: 'Mon EDT' }));
      fixture.detectChanges();
      const nom = (component as any).formEdt.controls.nom;

      nom.setValue('Nom modifié');
      nom.setValue('Mon EDT');

      expect(component.estModifie()).toBe(false);
    });

    it('retourne false juste après le chargement du créneau', () => {
      fixture.componentRef.setInput('creneau', CreneauMother.lundi9h10());
      fixture.detectChanges();

      expect(component.estModifie()).toBe(false);
    });

    it('retourne true après modification d’une heure du créneau', () => {
      fixture.componentRef.setInput('creneau', CreneauMother.avecHoraire('09:00', '12:00'));
      fixture.detectChanges();

      (component as any).tempsFormArray.at(0).controls.heureDebut.setValue('10:00');

      expect(component.estModifie()).toBe(true);
    });

    it('retourne true après ajout d’un temps', () => {
      fixture.componentRef.setInput('creneau', CreneauMother.lundi9h10());
      fixture.detectChanges();

      (component as any).ajouterTemps();

      expect(component.estModifie()).toBe(true);
    });

    it('revient à false après rechargement sur un edt d’identité différente', () => {
      fixture.componentRef.setInput('edt', EdtMother.base({ id: 'edt1', nom: 'Mon EDT' }));
      fixture.detectChanges();
      (component as any).formEdt.controls.nom.setValue('Nom modifié');
      expect(component.estModifie()).toBe(true);

      fixture.componentRef.setInput('edt', EdtMother.base({ id: 'edt2', nom: 'Autre EDT' }));
      fixture.detectChanges();

      expect(component.estModifie()).toBe(false);
    });

    it('revient à false après un enregistrement des propriétés', () => {
      fixture.componentRef.setInput('edt', EdtMother.base({ nom: 'Mon EDT' }));
      fixture.detectChanges();
      (component as any).formEdt.controls.nom.setValue('Nom modifié');

      (component as any).onEnregistrerEdt();

      expect(component.estModifie()).toBe(false);
    });

    it('revient à false après un enregistrement du créneau', () => {
      fixture.componentRef.setInput('creneau', CreneauMother.lundi9h10());
      fixture.detectChanges();
      (component as any).ajouterTemps();

      (component as any).onEnregistrerCreneau();

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

  describe('disciplines et élèves concernés d’un temps', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('creneau', CreneauMother.lundi9h10());
      fixture.detectChanges();
    });

    it('ajoute une discipline absente', () => {
      (component as any).basculerDiscipline(0, 'd1', true);

      const groupe = (component as any).tempsFormArray.at(0);
      expect(groupe.controls.disciplinesIds.value).toEqual(['d1']);
      expect((component as any).estDisciplineSelectionnee(groupe, 'd1')).toBe(true);
    });

    it('retire une discipline présente', () => {
      (component as any).tempsFormArray.at(0).controls.disciplinesIds.setValue(['d1']);

      (component as any).basculerDiscipline(0, 'd1', false);

      expect((component as any).tempsFormArray.at(0).controls.disciplinesIds.value).toEqual([]);
    });

    it('ne fait rien pour un index de temps inexistant', () => {
      expect(() => (component as any).basculerDiscipline(5, 'd1', true)).not.toThrow();
    });

    it('les élèves concernés sont portés par le contrôle du temps', () => {
      const val: ElevesConcernes = { type: 'groupes', groupes: ['GA'], elevesIds: [] };

      (component as any).tempsFormArray.at(0).controls.elevesConcernes.setValue(val);

      expect((component as any).formCreneau.getRawValue().temps[0].elevesConcernes).toEqual(val);
    });
  });

  describe('ajout de temps sans temps existant', () => {
    it('le premier temps commence à 08:00 par défaut', () => {
      (component as any).ajouterTemps();

      const groupe = (component as any).tempsFormArray.at(0);
      expect(groupe.controls.heureDebut.value).toBe('08:00');
      expect(groupe.controls.heureFin.value).toBe('09:00');
    });
  });

  describe('ajout et suppression de temps', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('creneau', CreneauMother.avecHoraire('09:00', '10:00'));
      fixture.detectChanges();
    });

    it('ajoute un temps enchaîné sur le précédent et demande le focus sur lui', () => {
      (component as any).ajouterTemps();

      const temps = (component as any).tempsFormArray;
      expect(temps.length).toBe(2);
      expect(temps.at(1).controls.heureDebut.value).toBe('10:00');
      expect(temps.at(1).controls.heureFin.value).toBe('11:00');
      expect((component as any).indexAFocaliserTemps()).toBe(1);
    });

    it('bloque l’ajout au-delà du maximum et désactive le bouton', () => {
      for (let i = 0; i < EmploiDuTempsService.NOMBRE_TEMPS_MAX + 1; i++) {
        (component as any).ajouterTemps();
      }
      fixture.detectChanges();

      expect((component as any).tempsFormArray.length).toBe(EmploiDuTempsService.NOMBRE_TEMPS_MAX);
      const bouton = fixture.nativeElement.querySelector('#btnAjouterTemps') as HTMLButtonElement;
      expect(bouton.disabled).toBe(true);
    });

    it('ne supprime pas le dernier temps restant', () => {
      (component as any).supprimerTemps(0);

      expect((component as any).tempsFormArray.length).toBe(1);
    });

    it('supprime un temps et remet le focus demandé à null', () => {
      (component as any).ajouterTemps();

      (component as any).supprimerTemps(1);

      expect((component as any).tempsFormArray.length).toBe(1);
      expect((component as any).indexAFocaliserTemps()).toBeNull();
    });

    it('suppression du temps du milieu parmi trois → les deux restants gardent leurs valeurs', () => {
      fixture.componentRef.setInput(
        'creneau',
        CreneauMother.lundi9h10({
          id: 'c3',
          temps: [
            TempsCreneauMother.base({
              id: 't1',
              heureDebut: '08:00',
              heureFin: '09:00',
              titre: 'A',
            }),
            TempsCreneauMother.base({
              id: 't2',
              heureDebut: '09:00',
              heureFin: '10:00',
              titre: 'B',
            }),
            TempsCreneauMother.base({
              id: 't3',
              heureDebut: '10:00',
              heureFin: '11:00',
              titre: 'C',
            }),
          ],
        }),
      );
      fixture.detectChanges();
      const champDernier = fixture.nativeElement.querySelector('#inputHeureDebutTemps2');

      (component as any).supprimerTemps(1);
      (component as any).cdr.markForCheck();
      fixture.detectChanges();

      const valeurs = (component as any).formCreneau.getRawValue().temps;
      expect(valeurs.map((t: { titre: string }) => t.titre)).toEqual(['A', 'C']);
      expect(valeurs[1].heureDebut).toBe('10:00');
      expect(fixture.nativeElement.querySelector('#inputHeureDebutTemps1')).toBe(champDernier);
    });
  });

  describe('validation du nom de l’EDT', () => {
    it("n'émet pas et affiche l'erreur si le nom est fait d'espaces", () => {
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

    it("n'émet pas si le nom est vide", () => {
      fixture.componentRef.setInput('edt', EdtMother.base({ nom: '' }));
      fixture.detectChanges();
      const spy = vi.spyOn((component as any).edtEnregistre, 'emit');

      (component as any).onEnregistrerEdt();

      expect(spy).not.toHaveBeenCalled();
    });

    it("n'affiche pas d'erreur avant une tentative d'enregistrement", () => {
      fixture.componentRef.setInput('edt', EdtMother.base({ nom: '' }));
      fixture.detectChanges();

      expect((component as any).obtenirErreurNomEdt()).toBeNull();
      expect(fixture.nativeElement.querySelector('#erreurFormulaireEdt')).toBeNull();
    });

    it('retire le message dès que le nom est saisi', () => {
      fixture.componentRef.setInput('edt', EdtMother.base({ nom: '' }));
      fixture.detectChanges();
      (component as any).onEnregistrerEdt();
      expect((component as any).obtenirErreurNomEdt()).toBe(LIBELLES.edt.erreurNomObligatoire);

      (component as any).formEdt.controls.nom.setValue('Semaine A');

      expect((component as any).obtenirErreurNomEdt()).toBeNull();
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
    it("n'émet pas et signale le seul temps dont la fin précède le début", () => {
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

    it('retire le message dès que la plage devient valide', () => {
      fixture.componentRef.setInput('creneau', CreneauMother.avecHoraire('11:00', '10:00'));
      fixture.detectChanges();
      (component as any).onEnregistrerCreneau();
      const groupe = (component as any).tempsFormArray.at(0);
      expect((component as any).obtenirErreurHorairesTemps(groupe)).toBe(
        LIBELLES.commun.erreurPlageHoraire,
      );

      groupe.controls.heureFin.setValue('12:00');

      expect((component as any).obtenirErreurHorairesTemps(groupe)).toBeNull();
    });

    it("n'émet pas si l'heure de fin égale l'heure de début", () => {
      fixture.componentRef.setInput('creneau', CreneauMother.avecHoraire('09:00', '09:00'));
      fixture.detectChanges();
      const spy = vi.spyOn((component as any).creneauEnregistre, 'emit');

      (component as any).onEnregistrerCreneau();

      expect(spy).not.toHaveBeenCalled();
    });

    it("n'émet pas et affiche le message si une heure est vide", () => {
      fixture.componentRef.setInput('creneau', CreneauMother.avecHoraire('', '10:00'));
      fixture.detectChanges();
      const spy = vi.spyOn((component as any).creneauEnregistre, 'emit');

      (component as any).onEnregistrerCreneau();

      expect(spy).not.toHaveBeenCalled();
      expect(
        (component as any).obtenirErreurHorairesTemps((component as any).tempsFormArray.at(0)),
      ).toBe(LIBELLES.commun.erreurPlageHoraire);
    });

    it("n'affiche pas d'erreur avant une tentative d'enregistrement", () => {
      fixture.componentRef.setInput('creneau', CreneauMother.avecHoraire('11:00', '10:00'));
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('#erreurHeuresTemps0')).toBeNull();
    });
  });

  describe('onEnregistrerEdt', () => {
    it("émet l'EDT saisi avec son id, dates vides converties en null", () => {
      fixture.componentRef.setInput('edt', EdtMother.base({ id: 'e7', nom: 'Semaine A' }));
      fixture.detectChanges();
      (component as any).formEdt.controls.frequence.setValue('paire');
      const spy = vi.spyOn((component as any).edtEnregistre, 'emit');

      (component as any).onEnregistrerEdt();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0]).toEqual(
        EdtMother.base({ id: 'e7', nom: 'Semaine A', frequence: 'paire' }),
      );
    });

    it("conserve les créneaux de l'EDT, en copie", () => {
      const creneaux = [
        CreneauMother.lundi9h10({ id: 'c1' }),
        CreneauMother.lundi9h10({ id: 'c2' }),
      ];
      fixture.componentRef.setInput('edt', EdtMother.base({ creneaux }));
      fixture.detectChanges();
      const spy = vi.spyOn((component as any).edtEnregistre, 'emit');

      (component as any).onEnregistrerEdt();

      const emis = spy.mock.calls[0][0] as EmploiDuTemps;
      expect(emis.creneaux).toEqual(creneaux);
      expect(emis.creneaux).not.toBe(creneaux);
    });

    it("n'émet pas sans EDT chargé", () => {
      fixture.componentRef.setInput('edt', null);
      fixture.detectChanges();
      const spy = vi.spyOn((component as any).edtEnregistre, 'emit');

      (component as any).onEnregistrerEdt();

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('onEnregistrerCreneau', () => {
    it('émet le créneau saisi avec son id', () => {
      fixture.componentRef.setInput(
        'creneau',
        CreneauMother.avecHoraire('09:00', '12:00', { id: 'c5' }),
      );
      fixture.detectChanges();
      const spy = vi.spyOn((component as any).creneauEnregistre, 'emit');

      (component as any).onEnregistrerCreneau();

      expect(spy).toHaveBeenCalledTimes(1);
      const emis = spy.mock.calls[0][0] as CreneauEdt;
      expect(emis.id).toBe('c5');
      expect(emis.temps[0].heureDebut).toBe('09:00');
    });

    it("n'émet pas sans créneau chargé", () => {
      fixture.componentRef.setInput('creneau', null);
      fixture.detectChanges();
      const spy = vi.spyOn((component as any).creneauEnregistre, 'emit');

      (component as any).onEnregistrerCreneau();

      expect(spy).not.toHaveBeenCalled();
    });

    it('émet le nouveau jour choisi, heures inchangées', () => {
      const creneau = CreneauMother.lundi9h10({ jour: 'lundi' });
      fixture.componentRef.setInput('creneau', creneau);
      fixture.detectChanges();
      (component as any).formCreneau.controls.jour.setValue('jeudi');
      const spy = vi.spyOn((component as any).creneauEnregistre, 'emit');

      (component as any).onEnregistrerCreneau();

      const emis = spy.mock.calls[0][0] as CreneauEdt;
      expect(emis.jour).toBe('jeudi');
      expect(emis.temps[0].heureDebut).toBe(creneau.temps[0].heureDebut);
      expect(emis.temps[0].heureFin).toBe(creneau.temps[0].heureFin);
    });

    it('basculement pédagogique → pause → pédagogique : champs pédagogiques conservés', () => {
      const tempsComplet = TempsCreneauMother.base({ titre: 'Maths', disciplinesIds: ['d1'] });
      fixture.componentRef.setInput('creneau', CreneauMother.lundi9h10({ temps: [tempsComplet] }));
      fixture.detectChanges();
      const type = (component as any).formCreneau.controls.type;

      type.setValue('pauseDejeuner');
      expect((component as any).typeCreneau()).toBe('pauseDejeuner');
      type.setValue('pedagogique');

      expect((component as any).tempsFormArray.at(0).controls.titre.value).toBe('Maths');
      expect((component as any).typeCreneau()).toBe('pedagogique');
    });

    it('émet une pause déjeuner sans les champs pédagogiques, en conservant le formulaire', () => {
      const tempsComplet = TempsCreneauMother.base({
        titre: 'Maths',
        disciplinesIds: ['d1'],
        elevesConcernes: { type: 'classe', groupes: [], elevesIds: [] },
      });
      fixture.componentRef.setInput('creneau', CreneauMother.lundi9h10({ temps: [tempsComplet] }));
      fixture.detectChanges();
      (component as any).formCreneau.controls.type.setValue('pauseDejeuner');
      const spy = vi.spyOn((component as any).creneauEnregistre, 'emit');

      (component as any).onEnregistrerCreneau();

      const emis = spy.mock.calls[0][0] as CreneauEdt;
      expect(emis.type).toBe('pauseDejeuner');
      expect(emis.temps).toStrictEqual([TempsCreneauMother.base()]);
      expect((component as any).tempsFormArray.at(0).controls.titre.value).toBe('Maths');
    });

    it('émet un créneau pédagogique avec ses champs pédagogiques', () => {
      const elevesConcernes: ElevesConcernes = { type: 'groupes', groupes: ['GA'], elevesIds: [] };
      const tempsComplet = TempsCreneauMother.base({
        titre: 'Maths',
        disciplinesIds: ['d1'],
        elevesConcernes,
      });
      fixture.componentRef.setInput('creneau', CreneauMother.lundi9h10({ temps: [tempsComplet] }));
      fixture.detectChanges();
      const spy = vi.spyOn((component as any).creneauEnregistre, 'emit');

      (component as any).onEnregistrerCreneau();

      expect((spy.mock.calls[0][0] as CreneauEdt).temps).toStrictEqual([tempsComplet]);
    });

    it('émet un temps pédagogique sans titre vide ni élèves concernés non renseignés', () => {
      fixture.componentRef.setInput('creneau', CreneauMother.lundi9h10());
      fixture.detectChanges();
      const spy = vi.spyOn((component as any).creneauEnregistre, 'emit');

      (component as any).onEnregistrerCreneau();

      expect((spy.mock.calls[0][0] as CreneauEdt).temps).toStrictEqual([
        TempsCreneauMother.base({ disciplinesIds: [] }),
      ]);
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
      (component as any).formEdt.controls.nom.setValue('');
      (component as any).onEnregistrerEdt();

      (component as any).onEdtAnnule();

      expect((component as any).formEdt.controls.nom.value).toBe('Semaine A');
      expect(component.estModifie()).toBe(false);
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

    it("onCreneauSupprime n'émet pas sans créneau chargé", () => {
      fixture.componentRef.setInput('creneau', null);
      fixture.detectChanges();
      const spy = vi.spyOn((component as any).creneauSupprime, 'emit');

      (component as any).onCreneauSupprime();

      expect(spy).not.toHaveBeenCalled();
    });
  });
});
