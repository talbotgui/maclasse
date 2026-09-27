import { describe, it, expect } from 'vitest';
import { FormControl, FormGroup } from '@angular/forms';
import { FormulaireUtils } from './formulaire.utils';

describe('FormulaireUtils', () => {
  describe('validerPlageHoraire', () => {
    it('retourne null pour une plage dont la fin suit le début', () => {
      const groupe = new FormGroup({
        heureDebut: new FormControl('09:00'),
        heureFin: new FormControl('10:00'),
      });

      expect(FormulaireUtils.validerPlageHoraire(groupe)).toBeNull();
    });

    it('signale une fin égale au début', () => {
      const groupe = new FormGroup({
        heureDebut: new FormControl('09:00'),
        heureFin: new FormControl('09:00'),
      });

      expect(FormulaireUtils.validerPlageHoraire(groupe)).toEqual({ plageHoraireInvalide: true });
    });

    it('signale une fin antérieure au début', () => {
      const groupe = new FormGroup({
        heureDebut: new FormControl('11:00'),
        heureFin: new FormControl('10:30'),
      });

      expect(FormulaireUtils.validerPlageHoraire(groupe)).toEqual({ plageHoraireInvalide: true });
    });

    it("ne signale rien si l'heure de début manque", () => {
      const groupe = new FormGroup({
        heureDebut: new FormControl(''),
        heureFin: new FormControl('10:00'),
      });

      expect(FormulaireUtils.validerPlageHoraire(groupe)).toBeNull();
    });

    it("ne signale rien si l'heure de fin manque", () => {
      const groupe = new FormGroup({
        heureDebut: new FormControl('10:00'),
        heureFin: new FormControl(''),
      });

      expect(FormulaireUtils.validerPlageHoraire(groupe)).toBeNull();
    });

    it('ne signale rien si le groupe ne porte pas les deux heures', () => {
      expect(FormulaireUtils.validerPlageHoraire(new FormGroup({}))).toBeNull();
    });
  });

  describe('validerTexteNonVide', () => {
    it('retourne null pour un texte renseigné', () => {
      expect(FormulaireUtils.validerTexteNonVide(new FormControl('Semaine A'))).toBeNull();
    });

    it('signale un texte vide', () => {
      expect(FormulaireUtils.validerTexteNonVide(new FormControl(''))).toEqual({ texteVide: true });
    });

    it("signale un texte fait d'espaces", () => {
      expect(FormulaireUtils.validerTexteNonVide(new FormControl('   '))).toEqual({
        texteVide: true,
      });
    });

    it('signale une valeur qui n’est pas une chaîne', () => {
      expect(FormulaireUtils.validerTexteNonVide(new FormControl(null))).toEqual({
        texteVide: true,
      });
    });
  });
});
