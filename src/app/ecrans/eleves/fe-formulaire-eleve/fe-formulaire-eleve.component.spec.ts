import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { FeFormulaireEleveComponent } from './fe-formulaire-eleve.component';
import {
  AbsencePonctuelleMother,
  AbsenceRecurrenteMother,
  ContactMother,
  CursusAnneeMother,
  EleveMother,
} from '../../../tests/eleve.mother';
import { LIBELLES } from '../../../libelles';
import type { Eleve } from '../../../modeles/eleve.modele';

describe('FeFormulaireEleveComponent', () => {
  let fixture: ComponentFixture<FeFormulaireEleveComponent>;
  let component: FeFormulaireEleveComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(FeFormulaireEleveComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('groupes', [{ id: 'GA', libelle: 'Groupe A' }]);
    fixture.componentRef.setInput('statutsEleve', [{ id: 'DC', libelle: 'Dans la classe' }]);
    fixture.componentRef.setInput('typesContact', [{ id: 'P', libelle: 'Père' }]);
    fixture.detectChanges();
  });

  describe('initialisation', () => {
    it('eleve=null → formulaire vide, élève créé avec un nouvel id', () => {
      fixture.componentRef.setInput('eleve', null);
      fixture.detectChanges();

      const valeur = (component as any).form.getRawValue();
      expect(valeur.nom).toBe('');
      expect(valeur.prenom).toBe('');
      expect(valeur.contacts).toEqual([]);
      expect((component as any).idEleve).toBeTruthy();
    });

    it('eleve existant → formulaire chargé avec ses valeurs et ses listes', () => {
      const eleve = EleveMother.base('e1', 'MARTIN', 'Alice', {
        inclusion: 'ULIS',
        contacts: [ContactMother.base()],
        absencesRecurrentes: [AbsenceRecurrenteMother.base()],
        absencesPonctuelles: [AbsencePonctuelleMother.base()],
        cursus: [CursusAnneeMother.base()],
      });
      fixture.componentRef.setInput('eleve', eleve);
      fixture.detectChanges();

      const valeur = (component as any).form.getRawValue();
      expect(valeur.nom).toBe('MARTIN');
      expect(valeur.prenom).toBe('Alice');
      expect(valeur.inclusion).toBe('ULIS');
      expect(valeur.notesPPA).toBe('');
      expect(valeur.contacts).toEqual([ContactMother.base()]);
      expect(valeur.absencesRecurrentes).toEqual([AbsenceRecurrenteMother.base()]);
      expect(valeur.absencesPonctuelles).toEqual([AbsencePonctuelleMother.base()]);
      expect(valeur.cursus).toEqual([CursusAnneeMother.base()]);
    });

    it("changement d'identité de l'input eleve → formulaire rechargé", () => {
      fixture.componentRef.setInput(
        'eleve',
        EleveMother.base('e1', 'MARTIN', 'Alice', { contacts: [ContactMother.base()] }),
      );
      fixture.detectChanges();
      fixture.componentRef.setInput('eleve', EleveMother.base('e2', 'DUPONT', 'Bob'));
      fixture.detectChanges();

      expect((component as any).form.controls.nom.value).toBe('DUPONT');
      expect((component as any).contactsFormArray.length).toBe(0);
    });

    it('régression SOU-020 : même identité d’élève avec contenu différent (UNDO/REDO) → saisie conservée', () => {
      fixture.componentRef.setInput('eleve', EleveMother.base('e1', 'MARTIN', 'Alice'));
      fixture.detectChanges();
      (component as any).form.controls.nom.setValue('Saisie en cours');

      fixture.componentRef.setInput('eleve', EleveMother.base('e1', 'MARTIN-MODIFIE', 'Alice'));
      fixture.detectChanges();

      expect((component as any).form.controls.nom.value).toBe('Saisie en cours');
    });
  });

  describe('optionsJour', () => {
    it('libellés des jours issus de LIBELLES.edt.joursLibelles, dans l’ordre de la semaine', () => {
      expect((component as any).optionsJour).toEqual([
        { valeur: 'lundi', libelle: LIBELLES.edt.joursLibelles.lundi },
        { valeur: 'mardi', libelle: LIBELLES.edt.joursLibelles.mardi },
        { valeur: 'mercredi', libelle: LIBELLES.edt.joursLibelles.mercredi },
        { valeur: 'jeudi', libelle: LIBELLES.edt.joursLibelles.jeudi },
        { valeur: 'vendredi', libelle: LIBELLES.edt.joursLibelles.vendredi },
      ]);
    });
  });

  describe('optionsStatut / optionsTypeContact', () => {
    it('optionsStatut mappées depuis statutsEleve', () => {
      const opts = (component as any).optionsStatut;
      expect(opts).toEqual([{ valeur: 'DC', libelle: 'Dans la classe' }]);
    });

    it('optionsTypeContact mappées depuis typesContact', () => {
      const opts = (component as any).optionsTypeContact;
      expect(opts).toEqual([{ valeur: 'P', libelle: 'Père' }]);
    });
  });

  describe('ajouterGroupe / retirerGroupe', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('eleve', EleveMother.base('e1', 'M', 'A'));
      fixture.detectChanges();
    });

    it('ajoute un groupe absent de la sélection', () => {
      (component as any).ajouterGroupe('GA');

      expect((component as any).form.controls.groupes.value).toEqual(['GA']);
      expect((component as any).estGroupeSelectionne('GA')).toBe(true);
    });

    it('retire un groupe présent', () => {
      (component as any).form.controls.groupes.setValue(['GA', 'GB']);

      (component as any).retirerGroupe('GA');

      expect((component as any).form.controls.groupes.value).toEqual(['GB']);
    });

    it("n'ajoute pas un groupe déjà présent", () => {
      (component as any).form.controls.groupes.setValue(['GA']);

      (component as any).ajouterGroupe('GA');

      expect((component as any).form.controls.groupes.value).toEqual(['GA']);
    });
  });

  describe('ajouterContact / supprimerContact', () => {
    it('ajouterContact ajoute un contact vide et demande le focus sur lui', () => {
      (component as any).ajouterContact();

      expect((component as any).form.getRawValue().contacts).toEqual([
        { type: '', nom: '', email: '', telephone: '', adressePostale: '' },
      ]);
      expect((component as any).indexAFocaliserContact()).toBe(0);
    });

    it('supprimerContact(0) retire le premier contact et remet le focus demandé à null', () => {
      (component as any).ajouterContact();
      (component as any).ajouterContact();

      (component as any).supprimerContact(0);

      expect((component as any).contactsFormArray.length).toBe(1);
      expect((component as any).indexAFocaliserContact()).toBeNull();
    });

    it('suppression du contact du milieu (sans id) → les contacts restants sont intacts', () => {
      fixture.componentRef.setInput(
        'eleve',
        EleveMother.base('e1', 'MARTIN', 'Alice', {
          contacts: [
            ContactMother.base({ nom: 'A' }),
            ContactMother.base({ nom: 'B' }),
            ContactMother.base({ nom: 'C' }),
          ],
        }),
      );
      fixture.detectChanges();
      const champDernier = fixture.nativeElement.querySelector('#champContactNom2');

      (component as any).supprimerContact(1);
      (component as any).cdr.markForCheck();
      fixture.detectChanges();

      expect(
        (component as any).form.getRawValue().contacts.map((c: { nom: string }) => c.nom),
      ).toEqual(['A', 'C']);
      expect(fixture.nativeElement.querySelector('#champContactNom1')).toBe(champDernier);
    });
  });

  describe('ajouterAbsenceRecurrente / supprimerAbsenceRecurrente', () => {
    it('ajouterAbsenceRecurrente ajoute une absence avec id UUID et demande le focus', () => {
      (component as any).ajouterAbsenceRecurrente();

      const absences = (component as any).form.getRawValue().absencesRecurrentes;
      expect(absences).toHaveLength(1);
      expect(absences[0].id).toBeTruthy();
      expect(absences[0].jour).toBe('lundi');
      expect((component as any).indexAFocaliserAbsRec()).toBe(0);
    });

    it("supprimerAbsenceRecurrente(0) retire à l'index 0", () => {
      (component as any).ajouterAbsenceRecurrente();
      (component as any).ajouterAbsenceRecurrente();

      (component as any).supprimerAbsenceRecurrente(0);

      expect((component as any).absencesRecurrentesFormArray.length).toBe(1);
      expect((component as any).indexAFocaliserAbsRec()).toBeNull();
    });
  });

  describe('plage horaire des absences récurrentes', () => {
    const groupe = (i: number) => (component as any).absencesRecurrentesFormArray.at(i);
    const message = (i: number) =>
      fixture.nativeElement.querySelector(`#erreurAbsRec${i}`) as HTMLElement | null;
    const champDebut = (i: number) =>
      fixture.nativeElement.querySelector(`#champAbsRecDebut${i}`) as HTMLInputElement;

    beforeEach(() => {
      fixture.componentRef.setInput(
        'eleve',
        EleveMother.base('e1', 'MARTIN', 'Alice', {
          absencesRecurrentes: [AbsenceRecurrenteMother.base()],
        }),
      );
      fixture.detectChanges();
    });

    it('absence valide → aucun message, formulaire valide', () => {
      expect(message(0)).toBeNull();
      expect(champDebut(0).hasAttribute('aria-describedby')).toBe(false);
      expect((component as any).estFormulaireValide()).toBe(true);
    });

    it('heure de fin antérieure au début → message immédiat relié aux champs, formulaire invalide', () => {
      groupe(0).controls.heureFin.setValue('08:00');
      fixture.detectChanges();

      expect(message(0)?.textContent?.trim()).toBe(LIBELLES.commun.erreurPlageHoraire);
      expect(message(0)?.getAttribute('role')).toBe('alert');
      expect(champDebut(0).getAttribute('aria-describedby')).toBe('erreurAbsRec0');
      expect((component as any).estFormulaireValide()).toBe(false);
    });

    it('heure de fin égale au début → message plage horaire', () => {
      groupe(0).controls.heureFin.setValue('09:00');
      fixture.detectChanges();

      expect(message(0)?.textContent?.trim()).toBe(LIBELLES.commun.erreurPlageHoraire);
    });

    it('absence ajoutée sans heures → pas de message, formulaire invalide', () => {
      (component as any).ajouterAbsenceRecurrente();
      fixture.detectChanges();

      expect(message(1)).toBeNull();
      expect((component as any).estFormulaireValide()).toBe(false);
    });

    it('heure manquante après saisie → message heures obligatoires', () => {
      (component as any).ajouterAbsenceRecurrente();
      groupe(1).controls.heureDebut.setValue('09:00');
      groupe(1).controls.heureDebut.markAsDirty();
      fixture.detectChanges();

      expect(message(1)?.textContent?.trim()).toBe(LIBELLES.eleve.erreurHeuresAbsenceObligatoires);
    });

    it('champ horaire quitté vide (touched) → message heures obligatoires', () => {
      (component as any).ajouterAbsenceRecurrente();
      groupe(1).controls.heureFin.markAsTouched();
      fixture.detectChanges();

      expect(message(1)?.textContent?.trim()).toBe(LIBELLES.eleve.erreurHeuresAbsenceObligatoires);
    });

    it('bouton ENREGISTRER désactivé tant que la plage est invalide, réactivé après correction', () => {
      const bouton = () =>
        fixture.nativeElement.querySelector('#btnEnregistrerEleve') as HTMLButtonElement;
      groupe(0).controls.heureFin.setValue('08:00');
      fixture.detectChanges();
      expect(bouton().disabled).toBe(true);

      groupe(0).controls.heureFin.setValue('11:00');
      fixture.detectChanges();
      expect(bouton().disabled).toBe(false);
    });

    it("suppression de l'absence invalide → formulaire de nouveau valide", () => {
      groupe(0).controls.heureFin.setValue('08:00');

      (component as any).supprimerAbsenceRecurrente(0);

      expect((component as any).estFormulaireValide()).toBe(true);
    });

    it("onEnregistrer n'émet pas tant qu'une absence est invalide", () => {
      const spy = vi.spyOn((component as any).enregistrer, 'emit');
      groupe(0).controls.heureFin.setValue('08:00');

      (component as any).onEnregistrer();

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('ajouterAbsencePonctuelle / supprimerAbsencePonctuelle', () => {
    it('ajouterAbsencePonctuelle ajoute une absence avec id UUID et demande le focus', () => {
      (component as any).ajouterAbsencePonctuelle();

      const absences = (component as any).form.getRawValue().absencesPonctuelles;
      expect(absences).toHaveLength(1);
      expect(absences[0].id).toBeTruthy();
      expect((component as any).indexAFocaliserAbsPonct()).toBe(0);
    });

    it("supprimerAbsencePonctuelle(0) retire à l'index 0", () => {
      (component as any).ajouterAbsencePonctuelle();
      (component as any).ajouterAbsencePonctuelle();

      (component as any).supprimerAbsencePonctuelle(0);

      expect((component as any).absencesPonctuellesFormArray.length).toBe(1);
      expect((component as any).indexAFocaliserAbsPonct()).toBeNull();
    });
  });

  describe('ajouterCursus / supprimerCursus', () => {
    it("ajouterCursus ajoute une entrée sur l'année courante et demande le focus", () => {
      (component as any).ajouterCursus();

      const cursus = (component as any).form.getRawValue().cursus;
      expect(cursus).toHaveLength(1);
      expect(cursus[0].annee).toBe(new Date().getFullYear());
      expect((component as any).indexAFocaliserCursus()).toBe(0);
    });

    it("supprimerCursus(0) retire à l'index 0", () => {
      (component as any).ajouterCursus();
      (component as any).ajouterCursus();

      (component as any).supprimerCursus(0);

      expect((component as any).cursusFormArray.length).toBe(1);
      expect((component as any).indexAFocaliserCursus()).toBeNull();
    });
  });

  describe('onEnregistrer', () => {
    it("émet l'élève saisi avec son id", () => {
      const eleve = EleveMother.base('e1', 'MARTIN', 'Alice', {
        inclusion: 'ULIS',
        notesPPA: 'PPA en cours',
        groupes: ['GA'],
        contacts: [ContactMother.base()],
        absencesRecurrentes: [AbsenceRecurrenteMother.base()],
        absencesPonctuelles: [AbsencePonctuelleMother.base()],
        cursus: [CursusAnneeMother.base()],
      });
      fixture.componentRef.setInput('eleve', eleve);
      fixture.detectChanges();
      const spy = vi.spyOn((component as any).enregistrer, 'emit');

      (component as any).onEnregistrer();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0]).toEqual(eleve);
    });

    it('émet inclusion, notes PPA et ESS vides à null', () => {
      fixture.componentRef.setInput(
        'eleve',
        EleveMother.base('e1', 'MARTIN', 'Alice', { inclusion: 'ULIS', notesESS: 'ESS' }),
      );
      fixture.detectChanges();
      (component as any).form.controls.inclusion.setValue('');
      (component as any).form.controls.notesESS.setValue('');
      const spy = vi.spyOn((component as any).enregistrer, 'emit');

      (component as any).onEnregistrer();

      const emis = spy.mock.calls[0][0] as Eleve;
      expect(emis.inclusion).toBeNull();
      expect(emis.notesPPA).toBeNull();
      expect(emis.notesESS).toBeNull();
    });

    it("émet l'année du cursus en nombre", () => {
      fixture.componentRef.setInput(
        'eleve',
        EleveMother.base('e1', 'MARTIN', 'Alice', { cursus: [CursusAnneeMother.base()] }),
      );
      fixture.detectChanges();
      (component as any).cursusFormArray.at(0).controls.annee.setValue(2023);
      const spy = vi.spyOn((component as any).enregistrer, 'emit');

      (component as any).onEnregistrer();

      expect((spy.mock.calls[0][0] as Eleve).cursus[0].annee).toBe(2023);
    });

    it("émet l'année enregistrée si le champ année a été vidé", () => {
      fixture.componentRef.setInput(
        'eleve',
        EleveMother.base('e1', 'MARTIN', 'Alice', { cursus: [CursusAnneeMother.base()] }),
      );
      fixture.detectChanges();
      (component as any).cursusFormArray.at(0).controls.annee.setValue('');
      const spy = vi.spyOn((component as any).enregistrer, 'emit');

      (component as any).onEnregistrer();

      expect((spy.mock.calls[0][0] as Eleve).cursus[0].annee).toBe(CursusAnneeMother.base().annee);
    });

    it("émet l'année courante pour une nouvelle entrée dont le champ année a été vidé", () => {
      fixture.componentRef.setInput('eleve', EleveMother.base('e1', 'MARTIN', 'Alice'));
      fixture.detectChanges();
      (component as any).ajouterCursus();
      (component as any).cursusFormArray.at(0).controls.annee.setValue('');
      const spy = vi.spyOn((component as any).enregistrer, 'emit');

      (component as any).onEnregistrer();

      expect((spy.mock.calls[0][0] as Eleve).cursus[0].annee).toBe(new Date().getFullYear());
    });

    it('n’émet rien si le prénom est vide ou blanc', () => {
      fixture.componentRef.setInput('eleve', EleveMother.base('e1', 'MARTIN', '  '));
      fixture.detectChanges();
      const spy = vi.spyOn((component as any).enregistrer, 'emit');

      (component as any).onEnregistrer();

      expect(spy).not.toHaveBeenCalled();
    });

    it('n’émet rien si le nom est vide', () => {
      fixture.componentRef.setInput('eleve', EleveMother.base('e1', '', 'Alice'));
      fixture.detectChanges();
      const spy = vi.spyOn((component as any).enregistrer, 'emit');

      (component as any).onEnregistrer();

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('estFormulaireValide', () => {
    it('vrai avec un prénom et un nom renseignés', () => {
      fixture.componentRef.setInput('eleve', EleveMother.base('e1', 'MARTIN', 'Alice'));
      fixture.detectChanges();

      expect((component as any).estFormulaireValide()).toBe(true);
    });

    it('faux pour une création vide et bouton ENREGISTRER désactivé', () => {
      fixture.componentRef.setInput('eleve', null);
      fixture.detectChanges();

      expect((component as any).estFormulaireValide()).toBe(false);
      const bouton = fixture.nativeElement.querySelector(
        '#btnEnregistrerEleve',
      ) as HTMLButtonElement;
      expect(bouton.disabled).toBe(true);
    });

    it('bouton désactivé dès que le prénom est vidé, réactivé quand il est ressaisi', () => {
      fixture.componentRef.setInput('eleve', EleveMother.base('e1', 'MARTIN', 'Alice'));
      fixture.detectChanges();
      const bouton = fixture.nativeElement.querySelector(
        '#btnEnregistrerEleve',
      ) as HTMLButtonElement;
      const prenom = (component as any).form.controls.prenom;

      prenom.setValue(' ');
      fixture.detectChanges();
      expect(bouton.disabled).toBe(true);

      prenom.setValue('Alice');
      fixture.detectChanges();
      expect(bouton.disabled).toBe(false);
    });
  });

  describe('annuler', () => {
    it("onAnnuler émet l'output annuler", () => {
      const spy = vi.spyOn((component as any).annuler, 'emit');

      (component as any).onAnnuler();

      expect(spy).toHaveBeenCalled();
    });
  });
});
