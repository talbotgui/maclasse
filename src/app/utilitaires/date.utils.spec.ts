import { describe, it, expect } from 'vitest';
import { DateUtils } from './date.utils';

describe('DateUtils', () => {
  // ── ajouterJours ──────────────────────────────────────────────────────────

  describe('ajouterJours', () => {
    it('ajoute des jours positifs', () => {
      expect(DateUtils.ajouterJours('2026-06-09', 7)).toBe('2026-06-16');
    });

    it('soustrait des jours (valeur négative)', () => {
      expect(DateUtils.ajouterJours('2026-06-16', -7)).toBe('2026-06-09');
    });

    it('retourne la même date pour zéro jour', () => {
      expect(DateUtils.ajouterJours('2026-06-09', 0)).toBe('2026-06-09');
    });

    it('gère le passage au mois suivant', () => {
      expect(DateUtils.ajouterJours('2026-06-30', 1)).toBe('2026-07-01');
    });

    it('gère le passage à l\'année suivante', () => {
      expect(DateUtils.ajouterJours('2026-12-31', 1)).toBe('2027-01-01');
    });

    it('gère le passage en fin de mois depuis le début', () => {
      expect(DateUtils.ajouterJours('2026-01-01', -1)).toBe('2025-12-31');
    });
  });

  // ── obtenirJourSemaine ────────────────────────────────────────────────────

  describe('obtenirJourSemaine', () => {
    it('retourne lundi pour le 15/06/2026', () => {
      expect(DateUtils.obtenirJourSemaine('2026-06-15')).toBe('lundi');
    });

    it('retourne mardi pour le 16/06/2026', () => {
      expect(DateUtils.obtenirJourSemaine('2026-06-16')).toBe('mardi');
    });

    it('retourne mercredi pour le 17/06/2026', () => {
      expect(DateUtils.obtenirJourSemaine('2026-06-17')).toBe('mercredi');
    });

    it('retourne jeudi pour le 18/06/2026', () => {
      expect(DateUtils.obtenirJourSemaine('2026-06-18')).toBe('jeudi');
    });

    it('retourne vendredi pour le 19/06/2026', () => {
      expect(DateUtils.obtenirJourSemaine('2026-06-19')).toBe('vendredi');
    });

    it('retourne samedi pour le 20/06/2026', () => {
      expect(DateUtils.obtenirJourSemaine('2026-06-20')).toBe('samedi');
    });

    it('retourne dimanche pour le 21/06/2026', () => {
      expect(DateUtils.obtenirJourSemaine('2026-06-21')).toBe('dimanche');
    });
  });

  // ── formaterDateLong ──────────────────────────────────────────────────────

  describe('formaterDateLong', () => {
    it('contient le nom du jour, du mois et l\'année', () => {
      const resultat = DateUtils.formaterDateLong('2026-06-15');
      expect(resultat).toMatch(/lundi/i);
      expect(resultat).toMatch(/juin/i);
      expect(resultat).toMatch(/2026/);
    });

    it('contient le numéro du jour', () => {
      const resultat = DateUtils.formaterDateLong('2026-06-09');
      expect(resultat).toMatch(/9/);
    });
  });

  // ── formaterDateCourt ─────────────────────────────────────────────────────

  describe('formaterDateCourt', () => {
    it('convertit ISO en DD/MM/YYYY', () => {
      expect(DateUtils.formaterDateCourt('2026-06-09')).toBe('09/06/2026');
    });

    it('conserve le zéro pour jour et mois à un chiffre', () => {
      expect(DateUtils.formaterDateCourt('2026-01-05')).toBe('05/01/2026');
    });

    it('gère les grands numéros de jour et mois', () => {
      expect(DateUtils.formaterDateCourt('2026-12-31')).toBe('31/12/2026');
    });
  });

  // ── calculerParite ────────────────────────────────────────────────────────

  describe('calculerParite', () => {
    // Semaine ISO 25 de 2026 : 15–21 juin (impaire)
    it('retourne impaire pour la semaine 25 de 2026 (lundi 15 juin)', () => {
      expect(DateUtils.calculerParite('2026-06-15')).toBe('impaire');
    });

    it('retourne impaire pour un autre jour de la semaine 25 (jeudi 18 juin)', () => {
      expect(DateUtils.calculerParite('2026-06-18')).toBe('impaire');
    });

    // Semaine ISO 26 de 2026 : 22–28 juin (paire)
    it('retourne paire pour la semaine 26 de 2026 (lundi 22 juin)', () => {
      expect(DateUtils.calculerParite('2026-06-22')).toBe('paire');
    });

    // Semaine ISO 1 de 2026 : 29 déc 2025 – 4 jan 2026 (impaire)
    it('retourne impaire pour la semaine 1 de 2026', () => {
      expect(DateUtils.calculerParite('2026-01-01')).toBe('impaire');
    });

    // Semaine ISO 2 de 2026 : 5–11 jan (paire)
    it('retourne paire pour la semaine 2 de 2026', () => {
      expect(DateUtils.calculerParite('2026-01-05')).toBe('paire');
    });
  });

  // ── chevauchementHoraire ──────────────────────────────────────────────────

  describe('chevauchementHoraire', () => {
    it('retourne true si les créneaux se chevauchent partiellement', () => {
      expect(DateUtils.chevauchementHoraire('08:00', '10:00', '09:00', '11:00')).toBe(true);
    });

    it('retourne true si le premier contient le second', () => {
      expect(DateUtils.chevauchementHoraire('08:00', '12:00', '09:00', '10:00')).toBe(true);
    });

    it('retourne true si le second contient le premier', () => {
      expect(DateUtils.chevauchementHoraire('09:00', '10:00', '08:00', '12:00')).toBe(true);
    });

    it('retourne true si les créneaux sont identiques', () => {
      expect(DateUtils.chevauchementHoraire('09:00', '10:00', '09:00', '10:00')).toBe(true);
    });

    it('retourne false pour des créneaux adjacents (fin du 1er = début du 2nd)', () => {
      expect(DateUtils.chevauchementHoraire('08:00', '10:00', '10:00', '12:00')).toBe(false);
    });

    it('retourne false pour des créneaux disjoints', () => {
      expect(DateUtils.chevauchementHoraire('08:00', '09:00', '10:00', '11:00')).toBe(false);
    });

    it('retourne false si le 2nd se termine avant le début du 1er', () => {
      expect(DateUtils.chevauchementHoraire('11:00', '12:00', '08:00', '09:00')).toBe(false);
    });
  });

  // ── formaterHeure ─────────────────────────────────────────────────────────

  describe('formaterHeure', () => {
    it('formate en HH:MM avec zéro initial pour l\'heure', () => {
      expect(DateUtils.formaterHeure(new Date(2026, 5, 9, 8, 5))).toBe('08:05');
    });

    it('formate en HH:MM pour des valeurs à deux chiffres', () => {
      expect(DateUtils.formaterHeure(new Date(2026, 5, 9, 14, 30))).toBe('14:30');
    });

    it('formate minuit', () => {
      expect(DateUtils.formaterHeure(new Date(2026, 5, 9, 0, 0))).toBe('00:00');
    });

    it('formate avec zéro initial pour les minutes', () => {
      expect(DateUtils.formaterHeure(new Date(2026, 5, 9, 10, 5))).toBe('10:05');
    });
  });
});
