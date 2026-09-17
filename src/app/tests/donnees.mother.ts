import { DonneesApplication } from '../modeles/donnees-application.modele';
import { Eleve } from '../modeles/eleve.modele';

/** Fournit des instances de {@link DonneesApplication} prêtes à l'emploi pour les tests. */
export class DonneesMother {
  /**
   * Retourne un objet {@link DonneesApplication} minimal valide avec des valeurs neutres.
   * Passer un `Partial` pour surcharger uniquement les champs pertinents au test.
   */
  static base(surcharge: Partial<DonneesApplication> = {}): DonneesApplication {
    return {
      version: '1.0',
      configuration: { delaiSauvegardeAutoMinutes: 5 },
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

  /**
   * Retourne un {@link DonneesApplication} avec la classe peuplée des {@link eleves} fournis.
   * @param eleves Élèves à placer dans `classe.eleves`.
   * @param surcharge Surcharge additionnelle des autres champs.
   */
  static avecEleves(
    eleves: Eleve[],
    surcharge: Partial<DonneesApplication> = {},
  ): DonneesApplication {
    const donnees = DonneesMother.base(surcharge);
    return { ...donnees, classe: { ...donnees.classe, eleves } };
  }
}
