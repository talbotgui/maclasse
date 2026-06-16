/**
 * Vérifie la cohérence entre le modèle TypeScript `DonneesApplication`
 * et le jeu de données par défaut `public/donnees-defaut.json`.
 *
 * Deux niveaux de vérification :
 * - Compile-time : `satisfies` échoue à la compilation si un champ requis manque dans le JSON.
 * - Runtime : assertions sur les formats, l'unicité des IDs et les références croisées.
 */

import donneesDefaut from '../../../public/donnees-defaut.json';
import type { ConfigApplication, DonneesApplication, Enseignant } from './donnees-application.modele';
import type { JourSemaine } from './emploi-du-temps.modele';
import type { Bulletin, Ppi } from './ppi-bulletin.modele';
import type { Projet } from './projet.modele';
import type { Referentiels } from './referentiels.modele';

// ── Vérifications compile-time ────────────────────────────────────────────
// Si un champ requis est ajouté à DonneesApplication sans être répercuté dans le JSON,
// la compilation échoue ici — avant même d'exécuter les tests.

/** Tous les champs racine de DonneesApplication sont présents dans le JSON. */
const _checkCles = donneesDefaut satisfies Record<keyof DonneesApplication, unknown>;

/** Les champs scalaires non-récursifs sont structurellement compatibles. */
const _checkConfig = donneesDefaut.configuration satisfies ConfigApplication;
const _checkEnseignant = donneesDefaut.enseignant satisfies Enseignant;
const _checkReferentiels = donneesDefaut.referentiels satisfies Record<keyof Referentiels, unknown>;
const _checkProjets = donneesDefaut.projets satisfies Record<keyof Projet, unknown>[];
const _checkPpi = donneesDefaut.ppi satisfies Ppi[];
const _checkBulletins = donneesDefaut.bulletins satisfies Bulletin[];

// ── Constantes de validation ──────────────────────────────────────────────

/** Regex d'une date au format ISO 8601 (`YYYY-MM-DD`). */
const REGEX_DATE_ISO = /^\d{4}-\d{2}-\d{2}$/;

/** Regex d'une heure au format `HH:MM`. */
const REGEX_HEURE = /^\d{2}:\d{2}$/;

/** Jours de la semaine scolaire valides. */
const JOURS_SEMAINE: JourSemaine[] = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'];

// ── Tests runtime ─────────────────────────────────────────────────────────

/** Raccourci typé vers les données JSON en tant que DonneesApplication. */
const donnees = donneesDefaut as unknown as DonneesApplication;

describe('donnees-defaut.json — cohérence modèle/données', () => {

  // ── Structure racine ────────────────────────────────────────────────────

  describe('Structure racine', () => {
    it('possède une version non vide', () => {
      expect(donnees.version).toBeTruthy();
    });

    it('toutes les collections sont des tableaux', () => {
      expect(Array.isArray(donnees.emploisDuTemps)).toBe(true);
      expect(Array.isArray(donnees.projets)).toBe(true);
      expect(Array.isArray(donnees.cahierJournal)).toBe(true);
      expect(Array.isArray(donnees.ppi)).toBe(true);
      expect(Array.isArray(donnees.bulletins)).toBe(true);
    });
  });

  // ── Classe ──────────────────────────────────────────────────────────────

  describe('Classe', () => {
    it('a un niveau et une annee non vides', () => {
      expect(donnees.classe.niveau).toBeTruthy();
      expect(donnees.classe.annee).toBeTruthy();
    });

    it('contient au moins un élève', () => {
      expect(donnees.classe.eleves.length).toBeGreaterThan(0);
    });
  });

  // ── Format des dates ISO ────────────────────────────────────────────────

  describe('Format des dates (YYYY-MM-DD)', () => {
    it('dateNaissance et dateArrivee des élèves sont valides', () => {
      for (const eleve of donnees.classe.eleves) {
        expect(eleve.dateNaissance, `dateNaissance de ${eleve.nom}`).toMatch(REGEX_DATE_ISO);
        expect(eleve.dateArrivee, `dateArrivee de ${eleve.nom}`).toMatch(REGEX_DATE_ISO);
      }
    });

    it('dates des absences ponctuelles sont valides', () => {
      for (const eleve of donnees.classe.eleves) {
        for (const abs of eleve.absencesPonctuelles) {
          expect(abs.date, `absencePonctuelle.date de ${eleve.nom}`).toMatch(REGEX_DATE_ISO);
        }
      }
    });

    it('dates des périodes du référentiel sont valides', () => {
      for (const periode of donnees.referentiels.periodes) {
        expect(periode.debut, `debut "${periode.nom}"`).toMatch(REGEX_DATE_ISO);
        expect(periode.fin, `fin "${periode.nom}"`).toMatch(REGEX_DATE_ISO);
      }
    });

    it('dates des jours fériés sont valides', () => {
      for (const jf of donnees.referentiels.joursFeries) {
        expect(jf.date, `JourFerie "${jf.nom}"`).toMatch(REGEX_DATE_ISO);
      }
    });

    it('dates des journées du cahier journal sont valides', () => {
      for (const journee of donnees.cahierJournal) {
        expect(journee.date, `JourneeJournal`).toMatch(REGEX_DATE_ISO);
      }
    });

    it('dates des périodes de projets sont valides', () => {
      for (const projet of donnees.projets) {
        for (const periode of projet.periodes) {
          expect(periode.debut, `debut de "${projet.nom}"`).toMatch(REGEX_DATE_ISO);
          expect(periode.fin, `fin de "${projet.nom}"`).toMatch(REGEX_DATE_ISO);
        }
      }
    });
  });

  // ── Format des heures HH:MM ─────────────────────────────────────────────

  describe('Format des heures (HH:MM)', () => {
    it('heures de la configEmploiDuTemps sont valides', () => {
      const config = donnees.referentiels.configEmploiDuTemps;
      expect(config.heureDebutJournee).toMatch(REGEX_HEURE);
      expect(config.heureFinJournee).toMatch(REGEX_HEURE);
    });

    it('heures des absences récurrentes des élèves sont valides', () => {
      for (const eleve of donnees.classe.eleves) {
        for (const abs of eleve.absencesRecurrentes) {
          expect(abs.heureDebut, `heureDebut abs. récurrente de ${eleve.nom}`).toMatch(REGEX_HEURE);
          expect(abs.heureFin, `heureFin abs. récurrente de ${eleve.nom}`).toMatch(REGEX_HEURE);
        }
      }
    });

    it('heures des séances du cahier journal sont valides', () => {
      for (const journee of donnees.cahierJournal) {
        for (const seance of journee.seances) {
          expect(seance.heureDebut, `heureDebut séance ${seance.id}`).toMatch(REGEX_HEURE);
          expect(seance.heureFin, `heureFin séance ${seance.id}`).toMatch(REGEX_HEURE);
        }
      }
    });

    it('heures des créneaux EDT sont valides', () => {
      for (const edt of donnees.emploisDuTemps) {
        for (const creneau of edt.creneaux) {
          expect(creneau.heureDebut, `heureDebut créneau ${creneau.id}`).toMatch(REGEX_HEURE);
          expect(creneau.heureFin, `heureFin créneau ${creneau.id}`).toMatch(REGEX_HEURE);
        }
      }
    });
  });

  // ── Unicité des identifiants ────────────────────────────────────────────

  describe('Unicité des identifiants', () => {
    it('les IDs des élèves sont uniques', () => {
      const ids = donnees.classe.eleves.map((e) => e.id);
      expect(new Set(ids).size, 'IDs élèves dupliqués').toBe(ids.length);
    });

    it('les IDs des projets sont uniques', () => {
      const ids = donnees.projets.map((p) => p.id);
      expect(new Set(ids).size, 'IDs projets dupliqués').toBe(ids.length);
    });

    it('les IDs des séances du cahier journal sont uniques globalement', () => {
      const ids = donnees.cahierJournal.flatMap((j) => j.seances.map((s) => s.id));
      expect(new Set(ids).size, 'IDs séances dupliqués').toBe(ids.length);
    });

    it('les IDs des absences récurrentes sont uniques globalement', () => {
      const ids = donnees.classe.eleves.flatMap((e) => e.absencesRecurrentes.map((a) => a.id));
      expect(new Set(ids).size, 'IDs absences récurrentes dupliqués').toBe(ids.length);
    });

    it('les IDs des absences ponctuelles sont uniques globalement', () => {
      const ids = donnees.classe.eleves.flatMap((e) => e.absencesPonctuelles.map((a) => a.id));
      expect(new Set(ids).size, 'IDs absences ponctuelles dupliqués').toBe(ids.length);
    });

    it('les IDs des emplois du temps sont uniques', () => {
      const ids = donnees.emploisDuTemps.map((e) => e.id);
      expect(new Set(ids).size, 'IDs EDT dupliqués').toBe(ids.length);
    });
  });

  // ── Intégrité des références croisées ──────────────────────────────────

  describe('Intégrité des références croisées', () => {
    it('les statuts des élèves référencent des entrées valides', () => {
      const statutsValides = new Set(donnees.referentiels.statutsEleve.map((s) => s.id));
      for (const eleve of donnees.classe.eleves) {
        expect(statutsValides.has(eleve.statut), `statut "${eleve.statut}" de ${eleve.nom}`).toBe(true);
      }
    });

    it('les groupes des élèves référencent des entrées valides', () => {
      const groupesValides = new Set(donnees.referentiels.groupes.map((g) => g.id));
      for (const eleve of donnees.classe.eleves) {
        for (const groupe of eleve.groupes) {
          expect(groupesValides.has(groupe), `groupe "${groupe}" de ${eleve.nom}`).toBe(true);
        }
      }
    });

    it('les types de contact référencent des entrées valides', () => {
      const typesValides = new Set(donnees.referentiels.typesContact.map((t) => t.id));
      for (const eleve of donnees.classe.eleves) {
        for (const contact of eleve.contacts) {
          expect(typesValides.has(contact.type), `type contact "${contact.type}" de ${eleve.nom}`).toBe(true);
        }
      }
    });

    it('les joursOuvres de la configEDT sont des jours valides', () => {
      for (const jour of donnees.referentiels.configEmploiDuTemps.joursOuvres) {
        expect(JOURS_SEMAINE, `jourOuvre "${jour}" invalide`).toContain(jour);
      }
    });

    it('les elevesIds des projets référencent des élèves existants', () => {
      const elevesIds = new Set(donnees.classe.eleves.map((e) => e.id));
      for (const projet of donnees.projets) {
        for (const eleveId of projet.elevesIds) {
          expect(elevesIds.has(eleveId), `eleveId "${eleveId}" du projet "${projet.nom}"`).toBe(true);
        }
      }
    });
  });

  // ── Champs optionnels de Eleve ──────────────────────────────────────────

  describe('Champs optionnels de Eleve', () => {
    it('manualite vaut A, D ou G quand elle est définie', () => {
      for (const eleve of donnees.classe.eleves) {
        if (eleve.manualite !== undefined) {
          expect(['A', 'D', 'G'], `manualite de ${eleve.nom}`).toContain(eleve.manualite);
        }
      }
    });

    it('au moins un élève a une manualite renseignée', () => {
      const avecManualite = donnees.classe.eleves.filter((e) => e.manualite !== undefined);
      expect(avecManualite.length).toBeGreaterThan(0);
    });

    it('au moins un élève a des dispositifsMedicaux renseignés', () => {
      const avecDispositifs = donnees.classe.eleves.filter((e) => e.dispositifsMedicaux !== undefined);
      expect(avecDispositifs.length).toBeGreaterThan(0);
    });
  });
});
