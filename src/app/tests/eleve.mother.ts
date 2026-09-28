import {
  AbsencePonctuelle,
  AbsenceRecurrente,
  Autorisation,
  Contact,
  CursusAnnee,
  Eleve,
} from '../modeles/eleve.modele';

/** Fournit des instances de {@link Eleve} prêtes à l'emploi pour les tests. */
export class EleveMother {
  /**
   * Retourne un {@link Eleve} minimal valide avec des valeurs neutres.
   * Passer un `Partial` pour surcharger uniquement les champs pertinents au test.
   */
  public static base(
    id: string,
    nom: string,
    prenom: string,
    surcharge: Partial<Eleve> = {},
  ): Eleve {
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
      droitImage: AutorisationMother.vide(),
      autorisationBaignade: AutorisationMother.vide(),
      autorisationSortieReguliere: AutorisationMother.vide(),
      notesPPA: null,
      notesESS: null,
      portLunettes: false,
      notificationAesh: false,
      lateralite: null,
      ...surcharge,
    };
  }

  /**
   * Retourne trois élèves : MARTIN Paul (e1) et DUPONT Léa (e2) dans le groupe `GA`,
   * ADAM Zoé (e3) sans groupe. Sert aux tests de résolution du périmètre d'une séance.
   */
  public static trioAvecGroupeGA(): Eleve[] {
    return [
      EleveMother.base('e1', 'MARTIN', 'Paul', { groupes: ['GA'] }),
      EleveMother.base('e2', 'DUPONT', 'Léa', { groupes: ['GA'] }),
      EleveMother.base('e3', 'ADAM', 'Zoé'),
    ];
  }
}

/** Fournit des instances de {@link AbsenceRecurrente} prêtes à l'emploi pour les tests. */
export class AbsenceRecurrenteMother {
  /** Retourne une absence récurrente le lundi de 9h à 10h (id='ar1'), surchargée par {@link surcharge}. */
  public static base(surcharge: Partial<AbsenceRecurrente> = {}): AbsenceRecurrente {
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
  public static base(surcharge: Partial<AbsencePonctuelle> = {}): AbsencePonctuelle {
    return {
      id: 'ap1',
      date: '2026-01-05',
      justification: 'Rendez-vous médical',
      ...surcharge,
    };
  }
}

/** Fournit des instances de {@link CursusAnnee} prêtes à l'emploi pour les tests. */
export class CursusAnneeMother {
  /** Retourne une entrée de cursus de CE2 en 2024 (id='cu1'), surchargée par {@link surcharge}. */
  public static base(surcharge: Partial<CursusAnnee> = {}): CursusAnnee {
    return {
      id: 'cu1',
      annee: 2024,
      niveau: 'CE2',
      etablissement: 'École Jean Jaurès',
      accompagnement: '',
      ...surcharge,
    };
  }
}

/** Fournit des instances de {@link Contact} prêtes à l'emploi pour les tests. */
export class ContactMother {
  /** Retourne un contact de type père (`P`), surchargé par {@link surcharge}. */
  public static base(surcharge: Partial<Contact> = {}): Contact {
    return {
      type: 'P',
      nom: 'Jean MARTIN',
      email: 'jean.martin@exemple.fr',
      telephone: '0600000000',
      adressePostale: '1 rue des Écoles',
      ...surcharge,
    };
  }
}

/** Fournit des instances d'{@link Autorisation} prêtes à l'emploi pour les tests. */
export class AutorisationMother {
  /** Retourne une autorisation non renseignée, sans précision, surchargée par {@link surcharge}. */
  public static vide(surcharge: Partial<Autorisation> = {}): Autorisation {
    return { reponse: null, precision: '', ...surcharge };
  }
}
