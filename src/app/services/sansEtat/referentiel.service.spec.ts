import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ReferentielService } from './referentiel.service';
import { DonneesService } from '../avecEtat/donnees.service';
import { DonneesApplication } from '../../modeles/donnees-application.modele';
import { Groupe, Periode, JourFerie, StatutEleve, TypeContact, ConfigEmploiDuTemps } from '../../modeles/referentiels.modele';

/** Construit un jeu de données minimal valide pour les tests. */
function creerDonneesVides(): DonneesApplication {
  return {
    version: '1.0',
    configuration: { delaiSauvegardeAutoMinutes: 2 },
    enseignant: { prenom: 'Test', nom: 'ENS', annee: '2025-2026' },
    classe: { niveau: 'CM2', annee: 'CM2', eleves: [] },
    referentiels: {
      competences: [],
      periodes: [],
      statutsAcquisition: [],
      statutsEleve: [],
      typesContact: [],
      groupes: [],
      joursFeries: [],
      raisonsAbsence: [],
      frequencesAbsence: [],
      configEmploiDuTemps: {
        joursOuvres: ['lundi', 'mardi', 'jeudi', 'vendredi'],
        heureDebutJournee: '08:30',
        heureFinJournee: '16:30',
      },
    },
    emploisDuTemps: [],
    projets: [],
    cahierJournal: [],
    ppi: [],
    bulletins: [],
  };
}

describe('ReferentielService', () => {
  let service: ReferentielService;
  let donneesService: DonneesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReferentielService);
    donneesService = TestBed.inject(DonneesService);
  });

  // ── estGroupeUtilise ──────────────────────────────────────────────────────

  describe('estGroupeUtilise', () => {
    it('retourne false si aucune donnée chargée', () => {
      expect(service.estGroupeUtilise('A')).toBe(false);
    });

    it('retourne false si groupe non référencé', () => {
      donneesService.charger(creerDonneesVides());
      expect(service.estGroupeUtilise('A')).toBe(false);
    });

    it('retourne true si groupe utilisé par un élève', () => {
      const d = creerDonneesVides();
      d.classe.eleves.push({
        id: 'e1', prenom: 'Paul', nom: 'MARTIN', sexe: 'M', niveau: 'CM2',
        groupes: ['A'], dateNaissance: '2015-01-01', dateArrivee: '2025-09-01',
        statut: 'DC', bilans: '', accueil: '', inclusion: null,
        contacts: [], absencesRecurrentes: [], absencesPonctuelles: [], cursus: [],
        notesDroitImage: '', notesAutorisationBaignade: '', notesPPA: null, notesESS: null,
      });
      donneesService.charger(d);
      expect(service.estGroupeUtilise('A')).toBe(true);
    });

    it('retourne true si groupe utilisé dans une séance', () => {
      const d = creerDonneesVides();
      d.cahierJournal.push({
        id: 'j1',
        date: '2026-06-15',
        seances: [{
          id: 's1', heureDebut: '09:00', heureFin: '10:00', type: 'pedagogique',
          elevesConcernes: { type: 'groupes', groupes: ['B'], elevesIds: [] },
        }],
      });
      donneesService.charger(d);
      expect(service.estGroupeUtilise('B')).toBe(true);
    });
  });

  // ── estStatutEleveUtilise ─────────────────────────────────────────────────

  describe('estStatutEleveUtilise', () => {
    it('retourne false sans données', () => {
      expect(service.estStatutEleveUtilise('DC')).toBe(false);
    });

    it('retourne true si statut utilisé par un élève', () => {
      const d = creerDonneesVides();
      d.classe.eleves.push({
        id: 'e1', prenom: 'Paul', nom: 'MARTIN', sexe: 'M', niveau: 'CM2',
        groupes: [], dateNaissance: '2015-01-01', dateArrivee: '2025-09-01',
        statut: 'DC', bilans: '', accueil: '', inclusion: null,
        contacts: [], absencesRecurrentes: [], absencesPonctuelles: [], cursus: [],
        notesDroitImage: '', notesAutorisationBaignade: '', notesPPA: null, notesESS: null,
      });
      donneesService.charger(d);
      expect(service.estStatutEleveUtilise('DC')).toBe(true);
    });

    it('retourne false si statut non utilisé', () => {
      donneesService.charger(creerDonneesVides());
      expect(service.estStatutEleveUtilise('HE')).toBe(false);
    });
  });

  // ── estTypeContactUtilise ─────────────────────────────────────────────────

  describe('estTypeContactUtilise', () => {
    it('retourne true si type de contact utilisé', () => {
      const d = creerDonneesVides();
      d.classe.eleves.push({
        id: 'e1', prenom: 'Paul', nom: 'MARTIN', sexe: 'M', niveau: 'CM2',
        groupes: [], dateNaissance: '2015-01-01', dateArrivee: '2025-09-01',
        statut: 'DC', bilans: '', accueil: '', inclusion: null,
        contacts: [{ type: 'P', nom: 'Papa', email: '', telephone: '', adressePostale: '' }],
        absencesRecurrentes: [], absencesPonctuelles: [], cursus: [],
        notesDroitImage: '', notesAutorisationBaignade: '', notesPPA: null, notesESS: null,
      });
      donneesService.charger(d);
      expect(service.estTypeContactUtilise('P')).toBe(true);
    });

    it('retourne false sans données', () => {
      expect(service.estTypeContactUtilise('P')).toBe(false);
    });
  });

  // ── estPeriodeUtilisee ────────────────────────────────────────────────────

  describe('estPeriodeUtilisee', () => {
    it('retourne false sans données', () => {
      expect(service.estPeriodeUtilisee('Période 1')).toBe(false);
    });

    it('retourne true si période utilisée dans un projet', () => {
      const d = creerDonneesVides();
      d.projets.push({
        id: 'p1', nom: 'Projet', description: '', elevesIds: [],
        periodes: [{ periodeNom: 'Période 1', debut: '2025-09-01', fin: '2025-10-18', description: '', competencesIds: [] }],
      });
      donneesService.charger(d);
      expect(service.estPeriodeUtilisee('Période 1')).toBe(true);
    });

    it('retourne true si période utilisée dans un bulletin', () => {
      const d = creerDonneesVides();
      d.bulletins.push({ id: 'b1', eleveId: 'e1', periode: 'Période 2', competencesEvaluees: [] });
      donneesService.charger(d);
      expect(service.estPeriodeUtilisee('Période 2')).toBe(true);
    });

    it('retourne false si période non utilisée', () => {
      donneesService.charger(creerDonneesVides());
      expect(service.estPeriodeUtilisee('Période 1')).toBe(false);
    });
  });

  // ── estRaisonAbsenceUtilisee / estFrequenceAbsenceUtilisee ────────────────

  describe('estRaisonAbsenceUtilisee et estFrequenceAbsenceUtilisee', () => {
    it('retourne toujours false pour raison', () => {
      expect(service.estRaisonAbsenceUtilisee('X')).toBe(false);
    });

    it('retourne toujours false pour fréquence', () => {
      expect(service.estFrequenceAbsenceUtilisee('SP')).toBe(false);
    });
  });

  // ── CRUD Groupes ──────────────────────────────────────────────────────────

  describe('CRUD groupes', () => {
    const groupe: Groupe = { id: 'A', libelle: 'Groupe A' };

    beforeEach(() => donneesService.charger(creerDonneesVides()));

    it('ajoute un groupe', () => {
      service.ajouterGroupe(groupe);
      expect(donneesService.donnees()?.referentiels.groupes).toHaveLength(1);
      expect(donneesService.donnees()?.referentiels.groupes[0].libelle).toBe('Groupe A');
    });

    it('modifie un groupe', () => {
      service.ajouterGroupe(groupe);
      service.modifierGroupe(groupe, { id: 'A', libelle: 'Groupe Ambre' });
      expect(donneesService.donnees()?.referentiels.groupes[0].libelle).toBe('Groupe Ambre');
    });

    it('supprime un groupe', () => {
      service.ajouterGroupe(groupe);
      service.supprimerGroupe(groupe);
      expect(donneesService.donnees()?.referentiels.groupes).toHaveLength(0);
    });

    it('ne supprime pas si id inexistant', () => {
      service.ajouterGroupe(groupe);
      service.supprimerGroupe({ id: 'Z', libelle: 'Inconnu' });
      expect(donneesService.donnees()?.referentiels.groupes).toHaveLength(1);
    });
  });

  // ── CRUD Statuts élève ────────────────────────────────────────────────────

  describe('CRUD statuts élève', () => {
    const statut: StatutEleve = { id: 'DC', libelle: 'Dans la classe' };

    beforeEach(() => donneesService.charger(creerDonneesVides()));

    it('ajoute, modifie et supprime un statut élève', () => {
      service.ajouterStatutEleve(statut);
      expect(donneesService.donnees()?.referentiels.statutsEleve).toHaveLength(1);
      service.modifierStatutEleve(statut, { id: 'DC', libelle: 'En classe' });
      expect(donneesService.donnees()?.referentiels.statutsEleve[0].libelle).toBe('En classe');
      service.supprimerStatutEleve(statut);
      expect(donneesService.donnees()?.referentiels.statutsEleve).toHaveLength(0);
    });
  });

  // ── CRUD Types de contact ─────────────────────────────────────────────────

  describe('CRUD types de contact', () => {
    const type: TypeContact = { id: 'P', libelle: 'Père' };

    beforeEach(() => donneesService.charger(creerDonneesVides()));

    it('ajoute, modifie et supprime un type de contact', () => {
      service.ajouterTypeContact(type);
      expect(donneesService.donnees()?.referentiels.typesContact).toHaveLength(1);
      service.modifierTypeContact(type, { id: 'P', libelle: 'Papa' });
      expect(donneesService.donnees()?.referentiels.typesContact[0].libelle).toBe('Papa');
      service.supprimerTypeContact(type);
      expect(donneesService.donnees()?.referentiels.typesContact).toHaveLength(0);
    });
  });

  // ── CRUD Périodes ─────────────────────────────────────────────────────────

  describe('CRUD périodes', () => {
    const periode: Periode = { id: 'p1', nom: 'Période 1', debut: '2025-09-01', fin: '2025-10-18' };

    beforeEach(() => donneesService.charger(creerDonneesVides()));

    it('ajoute une période', () => {
      service.ajouterPeriode(periode);
      expect(donneesService.donnees()?.referentiels.periodes).toHaveLength(1);
    });

    it('modifie une période', () => {
      service.ajouterPeriode(periode);
      service.modifierPeriode(periode, { id: 'p1', nom: 'Période 1', debut: '2025-09-02', fin: '2025-10-18' });
      expect(donneesService.donnees()?.referentiels.periodes[0].debut).toBe('2025-09-02');
    });

    it('ne modifie pas si id inconnu', () => {
      service.ajouterPeriode(periode);
      service.modifierPeriode({ id: 'inconnu', nom: 'Inconnue', debut: '', fin: '' }, { id: 'inconnu', nom: 'X', debut: '', fin: '' });
      expect(donneesService.donnees()?.referentiels.periodes[0].nom).toBe('Période 1');
    });

    it('supprime une période', () => {
      service.ajouterPeriode(periode);
      service.supprimerPeriode(periode);
      expect(donneesService.donnees()?.referentiels.periodes).toHaveLength(0);
    });

    it('supporte l\'annulation UNDO', () => {
      service.ajouterPeriode(periode);
      donneesService.annuler();
      expect(donneesService.donnees()?.referentiels.periodes).toHaveLength(0);
    });
  });

  // ── CRUD Jours fériés ─────────────────────────────────────────────────────

  describe('CRUD jours fériés', () => {
    const jourFerie: JourFerie = { id: 'jf1', nom: 'Toussaint', date: '2025-11-01' };

    beforeEach(() => donneesService.charger(creerDonneesVides()));

    it('ajoute un jour férié', () => {
      service.ajouterJourFerie(jourFerie);
      expect(donneesService.donnees()?.referentiels.joursFeries).toHaveLength(1);
    });

    it('modifie un jour férié', () => {
      service.ajouterJourFerie(jourFerie);
      service.modifierJourFerie(jourFerie, { id: 'jf1', nom: 'Armistice', date: '2025-11-11' });
      expect(donneesService.donnees()?.referentiels.joursFeries[0].nom).toBe('Armistice');
    });

    it('supprime un jour férié', () => {
      service.ajouterJourFerie(jourFerie);
      service.supprimerJourFerie(jourFerie);
      expect(donneesService.donnees()?.referentiels.joursFeries).toHaveLength(0);
    });

    it('ne supprime pas si id introuvable', () => {
      service.ajouterJourFerie(jourFerie);
      service.supprimerJourFerie({ id: 'jf-noel', nom: 'Noël', date: '2025-12-25' });
      expect(donneesService.donnees()?.referentiels.joursFeries).toHaveLength(1);
    });
  });

  // ── Configuration EDT ─────────────────────────────────────────────────────

  describe('modifierConfigEmploiDuTemps', () => {
    it('remplace la configuration et supporte le UNDO', () => {
      const d = creerDonneesVides();
      donneesService.charger(d);
      const ancienne: ConfigEmploiDuTemps = d.referentiels.configEmploiDuTemps;
      const nouvelle: ConfigEmploiDuTemps = {
        joursOuvres: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'],
        heureDebutJournee: '08:00',
        heureFinJournee: '17:00',
      };

      service.modifierConfigEmploiDuTemps(ancienne, nouvelle);
      expect(donneesService.donnees()?.referentiels.configEmploiDuTemps.heureDebutJournee).toBe('08:00');

      donneesService.annuler();
      expect(donneesService.donnees()?.referentiels.configEmploiDuTemps.heureDebutJournee).toBe('08:30');
    });
  });

  // ── CRUD Raisons et fréquences d'absence ─────────────────────────────────

  describe('CRUD raisons et fréquences d\'absence', () => {
    beforeEach(() => donneesService.charger(creerDonneesVides()));

    it('ajoute et supprime une raison d\'absence', () => {
      const raison = { id: 'M', libelle: 'Maladie' };
      service.ajouterRaisonAbsence(raison);
      expect(donneesService.donnees()?.referentiels.raisonsAbsence).toHaveLength(1);
      service.supprimerRaisonAbsence(raison);
      expect(donneesService.donnees()?.referentiels.raisonsAbsence).toHaveLength(0);
    });

    it('modifie une raison d\'absence', () => {
      const raison = { id: 'M', libelle: 'Maladie' };
      service.ajouterRaisonAbsence(raison);
      service.modifierRaisonAbsence(raison, { id: 'M', libelle: 'Médical' });
      expect(donneesService.donnees()?.referentiels.raisonsAbsence[0].libelle).toBe('Médical');
    });

    it('ajoute et supprime une fréquence d\'absence', () => {
      const freq = { id: 'SP', libelle: 'Semaines paires' };
      service.ajouterFrequenceAbsence(freq);
      expect(donneesService.donnees()?.referentiels.frequencesAbsence).toHaveLength(1);
      service.supprimerFrequenceAbsence(freq);
      expect(donneesService.donnees()?.referentiels.frequencesAbsence).toHaveLength(0);
    });

    it('ne supprime pas raison si id inconnu', () => {
      service.ajouterRaisonAbsence({ id: 'M', libelle: 'Maladie' });
      service.supprimerRaisonAbsence({ id: 'X', libelle: 'Inconnu' });
      expect(donneesService.donnees()?.referentiels.raisonsAbsence).toHaveLength(1);
    });
  });

  // ── CRUD Statuts d'acquisition ────────────────────────────────────────────

  describe('CRUD statuts d\'acquisition', () => {
    beforeEach(() => donneesService.charger(creerDonneesVides()));

    it('ajoute, modifie et supprime un statut d\'acquisition', () => {
      const statut = { id: 'A', glyphe: '✓', libelle: 'Acquis', couleur: 'green', fond: 'lightgreen' };
      service.ajouterStatutAcquisition(statut);
      expect(donneesService.donnees()?.referentiels.statutsAcquisition).toHaveLength(1);
      service.modifierStatutAcquisition(statut, { ...statut, libelle: 'Maîtrisé' });
      expect(donneesService.donnees()?.referentiels.statutsAcquisition[0].libelle).toBe('Maîtrisé');
      service.supprimerStatutAcquisition(statut);
      expect(donneesService.donnees()?.referentiels.statutsAcquisition).toHaveLength(0);
    });

    it('ne supprime pas si id inconnu', () => {
      service.ajouterStatutAcquisition({ id: 'A', glyphe: '✓', libelle: 'Acquis', couleur: 'green', fond: 'lightgreen' });
      service.supprimerStatutAcquisition({ id: 'Z', glyphe: '?', libelle: 'Inconnu', couleur: '', fond: '' });
      expect(donneesService.donnees()?.referentiels.statutsAcquisition).toHaveLength(1);
    });
  });

  // ── estStatutAcquisitionUtilise ───────────────────────────────────────────

  describe('estStatutAcquisitionUtilise', () => {
    it('retourne false sans données', () => {
      expect(service.estStatutAcquisitionUtilise('A')).toBe(false);
    });

    it('retourne true si statut utilisé dans un PPI', () => {
      const d = creerDonneesVides();
      d.ppi.push({
        id: 'ppi1', eleveId: 'e1',
        competencesEntrees: [{
          competenceId: 'c1', dateInitiale: '2025-09-01', constatInitial: '',
          actionsInitiales: '', evaluation: 'A', dateMaj: '2025-10-01',
          constatMaj: '', actionsMaj: '',
        }],
      });
      donneesService.charger(d);
      expect(service.estStatutAcquisitionUtilise('A')).toBe(true);
    });

    it('retourne true si statut utilisé dans un bulletin', () => {
      const d = creerDonneesVides();
      d.bulletins.push({
        id: 'b1', eleveId: 'e1', periode: 'P1',
        competencesEvaluees: [{ competenceId: 'c1', evaluation: 'EC', appreciationPublique: '', appreciationPrivee: '' }],
      });
      donneesService.charger(d);
      expect(service.estStatutAcquisitionUtilise('EC')).toBe(true);
    });
  });
});
