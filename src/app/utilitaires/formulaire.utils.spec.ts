import { describe, it, expect } from 'vitest';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
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

  describe('validerEvaluationsBilan', () => {
    /**
     * Construit un tableau de lignes d'évaluation portant les compétences données.
     * @param ids Identifiants de compétence, une ligne par identifiant.
     * @returns Tableau de groupes de contrôles.
     */
    const tableau = (ids: string[]): FormArray =>
      new FormArray(ids.map((id) => new FormGroup({ competenceId: new FormControl(id) })));

    it('accepte un tableau vide ou des compétences distinctes', () => {
      expect(FormulaireUtils.validerEvaluationsBilan(tableau([]))).toBeNull();
      expect(FormulaireUtils.validerEvaluationsBilan(tableau(['c1', 'c2']))).toBeNull();
    });

    it('signale une ligne sans compétence', () => {
      expect(FormulaireUtils.validerEvaluationsBilan(tableau(['c1', '']))).toEqual({
        evaluationSansCompetence: true,
      });
    });

    it('signale une compétence évaluée deux fois', () => {
      expect(FormulaireUtils.validerEvaluationsBilan(tableau(['c1', 'c1']))).toEqual({
        competenceEnDouble: true,
      });
    });

    it("ignore un contrôle qui n'est pas un tableau", () => {
      expect(FormulaireUtils.validerEvaluationsBilan(new FormControl('x'))).toBeNull();
    });
  });
});
