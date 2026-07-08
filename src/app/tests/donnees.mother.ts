import { DonneesApplication } from '../modeles/donnees-application.modele';

/** Fournit des instances de {@link DonneesApplication} prêtes à l'emploi pour les tests. */
export class DonneesMother {
  /**
   * Retourne un objet {@link DonneesApplication} minimal valide avec des valeurs neutres.
   * Passer un `Partial` pour surcharger uniquement les champs pertinents au test.
   */
  static base(surcharge: Partial<DonneesApplication> = {}): DonneesApplication {
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
          joursOuvres: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'],
          heureDebutJournee: '08:30',
          heureFinJournee: '16:30',
        },
      },
      emploisDuTemps: [],
      projets: [],
      cahierJournal: [],
      ppi: [],
      bulletins: [],
      ...surcharge,
    };
  }
}
