import { AbsencePonctuelle, AbsenceRecurrente, Eleve } from '../modeles/eleve.modele';

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

/** Fournit des instances de {@link AbsenceRecurrente} prêtes à l'emploi pour les tests. */
export class AbsenceRecurrenteMother {
  /** Retourne une absence récurrente le lundi de 9h à 10h (id='ar1'), surchargée par {@link surcharge}. */
  static base(surcharge: Partial<AbsenceRecurrente> = {}): AbsenceRecurrente {
    return {
      id: 'ar1',
      libelle: 'Orthophonie',
      jour: 'lundi',
      heureDebut: '09:00',
      heureFin: '10:00',
      paritesSemaine: 'lesDeux',
      ...surcharge,
    };
  }
}

/** Fournit des instances de {@link AbsencePonctuelle} prêtes à l'emploi pour les tests. */
export class AbsencePonctuelleMother {
  /** Retourne une absence ponctuelle datée du 5 janvier 2026 (id='ap1'), surchargée par {@link surcharge}. */
  static base(surcharge: Partial<AbsencePonctuelle> = {}): AbsencePonctuelle {
    return {
      id: 'ap1',
      date: '2026-01-05',
      justification: 'Rendez-vous médical',
      ...surcharge,
    };
  }
}
