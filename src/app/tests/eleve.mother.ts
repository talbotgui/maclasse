import { Eleve } from '../modeles/eleve.modele';

/** Fournit des instances de {@link Eleve} prêtes à l'emploi pour les tests. */
export class EleveMother {
  /**
   * Retourne un {@link Eleve} minimal valide avec des valeurs neutres.
   * Passer un `Partial` pour surcharger uniquement les champs pertinents au test.
   */
  static base(id: string, nom: string, prenom: string, surcharge: Partial<Eleve> = {}): Eleve {
    return {
      id,
      prenom,
      nom,
      sexe: 'M',
      niveau: 'CM2',
      groupes: [],
      dateNaissance: '2015-01-01',
      dateArrivee: '2025-09-01',
      statut: 'DC',
      bilans: '',
      accueil: '',
      inclusion: null,
      contacts: [],
      absencesRecurrentes: [],
      absencesPonctuelles: [],
      cursus: [],
      notesDroitImage: '',
      notesAutorisationBaignade: '',
      notesPPA: null,
      notesESS: null,
      ...surcharge,
    };
  }
}
