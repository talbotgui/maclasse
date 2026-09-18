import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { EdtcFormulaireComponent } from './edtc-formulaire.component';
import { DonneesService } from '../../../services/avecEtat/donnees.service';
import { DonneesMother } from '../../../tests/donnees.mother';
import { EdtCalculeMother } from '../../../tests/emploi-du-temps-calcule.mother';
import type { EmploiDuTempsCalcule } from '../../../modeles/emploi-du-temps-calcule.modele';
import { LIBELLES } from '../../../libelles';

describe('EdtcFormulaireComponent', () => {
  let fixture: ComponentFixture<EdtcFormulaireComponent>;
  let component: EdtcFormulaireComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    TestBed.inject(DonneesService).charger(DonneesMother.base());
    fixture = TestBed.createComponent(EdtcFormulaireComponent);
    component = fixture.componentInstance;
  });

  /** Charge une définition dans le formulaire et rend le template. */
  const charger = (surcharge = {}): void => {
    fixture.componentRef.setInput('edtCalcule', EdtCalculeMother.base(surcharge));
    fixture.detectChanges();
  };

  describe('initialisation', () => {
    it("sans définition, aucun formulaire n'est rendu", () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('form')).toBeNull();
    });

    it('charge les valeurs de la définition', () => {
      charger({ nom: 'Ma vue', dateDebut: '2026-01-01', sources: ['recreation'] });
      expect((component as any).form.controls.nom.value).toBe('Ma vue');
      expect((component as any).form.controls.dateDebut.value).toBe('2026-01-01');
      expect((component as any).form.controls.dateFin.value).toBe('');
      expect((component as any).sourcesCochees()).toEqual(['recreation']);
      expect(fixture.nativeElement.querySelector('#formProprietesEdtCalcule')).not.toBeNull();
    });

    it("recharge le formulaire au changement d'identité", () => {
      charger({ id: 'a', nom: 'A' });
      fixture.componentRef.setInput('edtCalcule', EdtCalculeMother.base({ id: 'b', nom: 'B' }));
      fixture.detectChanges();
      expect((component as any).form.controls.nom.value).toBe('B');
    });

    it("ne recharge pas le formulaire si l'identité est inchangée", () => {
      charger({ id: 'a', nom: 'A' });
      (component as any).form.controls.nom.setValue('Saisie en cours');
      fixture.componentRef.setInput('edtCalcule', EdtCalculeMother.base({ id: 'a', nom: 'Autre' }));
      fixture.detectChanges();
      expect((component as any).form.controls.nom.value).toBe('Saisie en cours');
    });

    it("masque SUPPRIMER pour une nouvelle définition et l'affiche pour une existante", () => {
      charger();
      expect(fixture.nativeElement.querySelector('#btnSupprimerEdtCalcule')).toBeNull();
      fixture.componentRef.setInput('existant', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('#btnSupprimerEdtCalcule')).not.toBeNull();
    });
  });

  describe('sources', () => {
    it('coche et décoche une source', () => {
      charger();
      (component as any).basculerSource('tempsClasse', true);
      (component as any).basculerSource('recreation', true);
      (component as any).basculerSource('tempsClasse', false);
      expect((component as any).sourcesCochees()).toEqual(['recreation']);
      expect((component as any).estSourceCochee('recreation')).toBe(true);
      expect((component as any).estSourceCochee('tempsClasse')).toBe(false);
    });

    it('affiche un chip par source', () => {
      charger();
      expect(fixture.nativeElement.querySelectorAll('mc-chip-filtre')).toHaveLength(3);
    });
  });

  describe('estModifie', () => {
    it('est faux juste après le chargement', () => {
      charger();
      expect(component.estModifie()).toBe(false);
    });

    it("est vrai après modification d'un champ", () => {
      charger();
      (component as any).form.controls.nom.setValue('Autre');
      (component as any).form.controls.nom.markAsDirty();
      expect(component.estModifie()).toBe(true);
    });

    it('est vrai après modification des sources', () => {
      charger();
      (component as any).basculerSource('recreation', true);
      expect(component.estModifie()).toBe(true);
    });
  });

  describe('enregistrement', () => {
    it('émet la définition saisie avec des dates vides converties en null', () => {
      charger({ id: 'x', nom: 'Vue', sources: ['recreation', 'absencesRegulieres'] });
      const spy = vi.spyOn((component as any).enregistrer, 'emit');
      (component as any).onEnregistrer();
      expect(spy).toHaveBeenCalledTimes(1);
      const emis = spy.mock.calls[0][0] as EmploiDuTempsCalcule;
      expect(emis.id).toBe('x');
      expect(emis.nom).toBe('Vue');
      expect(emis.dateDebut).toBeNull();
      expect(emis.dateFin).toBeNull();
      expect(emis.sources).toEqual(['recreation', 'absencesRegulieres']);
      expect(component.estModifie()).toBe(false);
    });

    it('émet les dates saisies', () => {
      charger({
        nom: 'Vue',
        sources: ['recreation'],
        dateDebut: '2026-01-01',
        dateFin: '2026-02-01',
      });
      const spy = vi.spyOn((component as any).enregistrer, 'emit');
      (component as any).onEnregistrer();
      expect((spy.mock.calls[0][0] as EmploiDuTempsCalcule).dateDebut).toBe('2026-01-01');
      expect((spy.mock.calls[0][0] as EmploiDuTempsCalcule).dateFin).toBe('2026-02-01');
    });

    it("n'émet pas et affiche l'erreur si le nom est vide", () => {
      charger({ nom: '', sources: ['recreation'] });
      const spy = vi.spyOn((component as any).enregistrer, 'emit');
      (component as any).onEnregistrer();
      fixture.detectChanges();
      expect(spy).not.toHaveBeenCalled();
      expect(
        fixture.nativeElement.querySelector('#erreurFormulaireEdtCalcule').textContent,
      ).toContain(LIBELLES.edt.erreurEdtCalculeObligatoire);
    });

    it("n'émet pas si aucune source n'est cochée", () => {
      charger({ nom: 'Vue', sources: [] });
      const spy = vi.spyOn((component as any).enregistrer, 'emit');
      (component as any).onEnregistrer();
      expect(spy).not.toHaveBeenCalled();
      expect((component as any).messageErreur()).toBe(LIBELLES.edt.erreurEdtCalculeObligatoire);
    });

    it("n'affiche pas d'erreur avant la première soumission", () => {
      charger({ nom: '' });
      expect((component as any).messageErreur()).toBeNull();
    });
  });

  describe('annulation et suppression', () => {
    it('onAnnuler émet annuler', () => {
      charger();
      const spy = vi.spyOn((component as any).annuler, 'emit');
      (component as any).onAnnuler();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('onSupprimer émet supprimer', () => {
      charger();
      const spy = vi.spyOn((component as any).supprimer, 'emit');
      (component as any).onSupprimer();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
