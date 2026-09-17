import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { CjFormulaireSeanceComponent } from './cj-formulaire-seance.component';
import { DonneesService } from '../../../services/avecEtat/donnees.service';
import { DonneesMother } from '../../../tests/donnees.mother';
import { SeanceMother } from '../../../tests/cahier-journal.mother';
import { LIBELLES } from '../../../libelles';
import type { Seance } from '../../../modeles/cahier-journal.modele';

describe('CjFormulaireSeanceComponent', () => {
  let fixture: ComponentFixture<CjFormulaireSeanceComponent>;
  let component: CjFormulaireSeanceComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    TestBed.inject(DonneesService).charger(DonneesMother.base());
    fixture = TestBed.createComponent(CjFormulaireSeanceComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('domaines', [{ id: 'd1', libelle: 'Français', enfants: [] }]);
    fixture.detectChanges();
  });

  describe('initialisation', () => {
    it('seance=null sans heuresParDefaut → valeurs par défaut', () => {
      fixture.componentRef.setInput('seance', null);
      fixture.detectChanges();

      const form = (component as any).form;
      expect(form.controls.heureDebut.value).toBe('08:00');
      expect(form.controls.heureFin.value).toBe('09:00');
      expect(form.controls.type.value).toBe('pedagogique');
    });

    it('seance=null avec heuresParDefaut → utilise les heures fournies par le parent à la création', () => {
      // heuresParDefaut n'est lu qu'à la création du composant (untracked) : il doit donc
      // être positionné avant le tout premier detectChanges, comme le ferait le parent réel
      // qui instancie <cj-formulaire-seance> avec ses bindings déjà en place.
      const fixtureCreation = TestBed.createComponent(CjFormulaireSeanceComponent);
      fixtureCreation.componentRef.setInput('domaines', []);
      fixtureCreation.componentRef.setInput('seance', null);
      fixtureCreation.componentRef.setInput('heuresParDefaut', {
        heureDebut: '13:00',
        heureFin: '13:30',
      });
      fixtureCreation.detectChanges();

      const form = (fixtureCreation.componentInstance as any).form;
      expect(form.controls.heureDebut.value).toBe('13:00');
      expect(form.controls.heureFin.value).toBe('13:30');
    });

    it('seance existante → formulaire rempli et identifiant conservé à l’enregistrement', () => {
      const seance = SeanceMother.pedagogique({ id: 's1', heureDebut: '10:00', heureFin: '11:00' });
      fixture.componentRef.setInput('seance', seance);
      fixture.detectChanges();

      expect((component as any).form.controls.heureDebut.value).toBe('10:00');

      const spy = vi.spyOn((component as any).enregistrer, 'emit');
      (component as any).onEnregistrer();
      expect((spy.mock.calls[0][0] as Seance).id).toBe('s1');
    });

    it('changement de heuresParDefaut en mode création sans changer seance → ne réinitialise pas la saisie en cours', () => {
      fixture.componentRef.setInput('seance', null);
      fixture.componentRef.setInput('heuresParDefaut', { heureDebut: '08:00', heureFin: '09:00' });
      fixture.detectChanges();

      (component as any).form.controls.titre.setValue('Saisie en cours');

      fixture.componentRef.setInput('heuresParDefaut', { heureDebut: '08:00', heureFin: '09:00' });
      fixture.detectChanges();

      expect((component as any).form.controls.titre.value).toBe('Saisie en cours');
    });

    it('changement de seance → formulaire rechargé et soumissionTentee réinitialisée', () => {
      const s1 = SeanceMother.pedagogique({ heureDebut: '09:00' });
      const s2 = SeanceMother.pedagogique({ heureDebut: '11:00' });
      fixture.componentRef.setInput('seance', s1);
      fixture.detectChanges();
      (component as any).form.controls.heureFin.setValue('08:00');
      (component as any).onEnregistrer();
      expect((component as any).soumissionTentee()).toBe(true);

      fixture.componentRef.setInput('seance', s2);
      fixture.detectChanges();

      expect((component as any).form.controls.heureDebut.value).toBe('11:00');
      expect((component as any).soumissionTentee()).toBe(false);
    });
  });

  describe('estModifie', () => {
    it('retourne false juste après le chargement', () => {
      fixture.componentRef.setInput('seance', SeanceMother.pedagogique());
      fixture.detectChanges();

      expect(component.estModifie()).toBe(false);
    });

    it('retourne true après modification du formulaire réactif (saisie utilisateur)', () => {
      fixture.componentRef.setInput('seance', SeanceMother.pedagogique());
      fixture.detectChanges();

      const champTitre = fixture.nativeElement.querySelector(
        '#inputTitreSeance-input',
      ) as HTMLInputElement;
      champTitre.value = 'Nouveau titre';
      champTitre.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.estModifie()).toBe(true);
    });

    it('retourne true après modification des disciplines sélectionnées', () => {
      fixture.componentRef.setInput('seance', SeanceMother.pedagogique());
      fixture.detectChanges();

      (component as any).basculerDiscipline('d1', true);

      expect(component.estModifie()).toBe(true);
    });

    it('retourne true après modification des compétences sélectionnées', () => {
      fixture.componentRef.setInput('seance', SeanceMother.pedagogique());
      fixture.detectChanges();

      (component as any).surSelectionCompetences(['c1']);

      expect(component.estModifie()).toBe(true);
    });

    it('revient à false après rechargement sur une nouvelle séance', () => {
      fixture.componentRef.setInput('seance', SeanceMother.pedagogique());
      fixture.detectChanges();
      (component as any).form.controls.titre.markAsDirty();
      expect(component.estModifie()).toBe(true);

      fixture.componentRef.setInput('seance', SeanceMother.pedagogique({ id: 's2' }));
      fixture.detectChanges();

      expect(component.estModifie()).toBe(false);
    });
  });

  describe('typeSelectionne', () => {
    it('reflète la valeur initiale du contrôle type', () => {
      expect((component as any).typeSelectionne()).toBe('pedagogique');
    });

    it('se met à jour quand le contrôle type change', () => {
      (component as any).form.controls.type.setValue('recreation');

      expect((component as any).typeSelectionne()).toBe('recreation');
    });
  });

  describe('basculerDiscipline', () => {
    it('ajoute une discipline absente', () => {
      (component as any).basculerDiscipline('d1', true);

      expect((component as any).disciplinesIdsInternes()).toContain('d1');
    });

    it('retire une discipline présente', () => {
      (component as any).disciplinesIdsInternes.set(['d1']);

      (component as any).basculerDiscipline('d1', false);

      expect((component as any).disciplinesIdsInternes()).not.toContain('d1');
    });
  });

  describe('surSelectionCompetences', () => {
    it('remplace les competencesIds', () => {
      (component as any).surSelectionCompetences(['c1', 'c2']);

      expect((component as any).competencesIds()).toEqual(['c1', 'c2']);
    });
  });

  describe('onEnregistrer', () => {
    it('formulaire valide → émet la séance avec les chaînes présentes conservées', () => {
      const seance = SeanceMother.pedagogique({ titre: 'Titre', objectifs: 'Objectifs' });
      fixture.componentRef.setInput('seance', seance);
      fixture.detectChanges();

      const spy = vi.spyOn((component as any).enregistrer, 'emit');
      (component as any).onEnregistrer();

      expect(spy).toHaveBeenCalledTimes(1);
      const emis = spy.mock.calls[0][0] as Seance;
      expect(emis.titre).toBe('Titre');
      expect(emis.objectifs).toBe('Objectifs');
      expect(emis.elevesConcernes).toEqual(
        seance.elevesConcernes ?? { type: 'classe', groupes: [], elevesIds: [] },
      );
    });

    it('formulaire valide → convertit les chaînes optionnelles vides en undefined', () => {
      const seance = SeanceMother.pedagogique({
        titre: '',
        objectifs: '',
        deroulement: 'déroulement',
      });
      fixture.componentRef.setInput('seance', seance);
      fixture.detectChanges();

      const spy = vi.spyOn((component as any).enregistrer, 'emit');
      (component as any).onEnregistrer();

      const emis = spy.mock.calls[0][0] as Seance;
      expect(emis.titre).toBeUndefined();
      expect(emis.objectifs).toBeUndefined();
      expect(emis.deroulement).toBe('déroulement');
    });

    it('heure de début vide → n’émet pas et affiche le message des champs obligatoires', () => {
      (component as any).form.controls.heureDebut.setValue('');

      const spy = vi.spyOn((component as any).enregistrer, 'emit');
      (component as any).onEnregistrer();

      expect(spy).not.toHaveBeenCalled();
      expect((component as any).messageErreur()).toBe(
        LIBELLES.cahierJournal.erreurChampsObligatoires,
      );
    });

    it('heure de fin vide → n’émet pas et affiche le message des champs obligatoires', () => {
      (component as any).form.controls.heureFin.setValue('');

      const spy = vi.spyOn((component as any).enregistrer, 'emit');
      (component as any).onEnregistrer();

      expect(spy).not.toHaveBeenCalled();
      expect((component as any).messageErreur()).toBe(
        LIBELLES.cahierJournal.erreurChampsObligatoires,
      );
    });

    it('heure de fin non postérieure à l’heure de début → n’émet pas et affiche le message de plage horaire', () => {
      (component as any).form.controls.heureDebut.setValue('10:00');
      (component as any).form.controls.heureFin.setValue('09:00');

      const spy = vi.spyOn((component as any).enregistrer, 'emit');
      (component as any).onEnregistrer();

      expect(spy).not.toHaveBeenCalled();
      expect((component as any).messageErreur()).toBe(LIBELLES.cahierJournal.erreurPlageHoraire);
    });
  });

  describe('messageErreur', () => {
    it('reste null tant qu’aucune soumission n’a été tentée, même si le formulaire est invalide', () => {
      (component as any).form.controls.heureDebut.setValue('');

      expect((component as any).messageErreur()).toBeNull();
    });
  });

  describe('onAnnuler', () => {
    it('émet annuler', () => {
      const spy = vi.spyOn((component as any).annuler, 'emit');

      (component as any).onAnnuler();

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
