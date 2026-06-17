/**
 * Utilitaires de manipulation et formatage des dates et heures.
 * Toutes les méthodes sont statiques — la classe n'a pas vocation à être instanciée.
 * Les dates ISO `YYYY-MM-DD` sont toujours traitées en heure locale pour éviter
 * les décalages UTC lors du formatage.
 */

import { JourSemaine } from '../modeles/emploi-du-temps.modele';

/**
 * Classe utilitaire pour la manipulation et le formatage de dates ISO (`YYYY-MM-DD`)
 * et d'heures (`HH:MM`). Tous les traitements s'effectuent en heure locale.
 */
export class DateUtils {
  /** Noms français des jours, indexés comme `Date.getDay()` (0 = dimanche). */
  private static readonly NOMS_JOURS = [
    'dimanche',
    'lundi',
    'mardi',
    'mercredi',
    'jeudi',
    'vendredi',
    'samedi',
  ] as const;

  /** Formateur de date longue en français (ex. : `"lundi 9 juin 2026"`). */
  private static readonly FORMATEUR_DATE_LONG = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  /** Millisecondes dans un jour calendaire. */
  private static readonly MS_PAR_JOUR = 86_400_000;

  /** Offset du jeudi dans l'algorithme ISO de calcul du numéro de semaine (lundi = 1). */
  private static readonly INDEX_JEUDI_ISO = 4;

  /** Nombre de jours dans une semaine. */
  private static readonly JOURS_PAR_SEMAINE = 7;

  /**
   * Ajoute un nombre de jours (positif ou négatif) à une date ISO.
   * @param date Date de départ au format `YYYY-MM-DD`.
   * @param jours Nombre de jours à ajouter (négatif pour soustraire).
   * @returns Nouvelle date au format `YYYY-MM-DD`.
   */
  public static ajouterJours(date: string, jours: number): string {
    const [annee, mois, jour] = date.split('-').map(Number);
    const d = new Date(annee, mois - 1, jour);
    d.setDate(d.getDate() + jours);
    return [
      String(d.getFullYear()),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0'),
    ].join('-');
  }

  /**
   * Retourne le nom français du jour de la semaine pour une date ISO.
   * @param date Date au format `YYYY-MM-DD`.
   * @returns Nom du jour en minuscules (`'lundi'`…`'dimanche'`).
   */
  public static obtenirJourSemaine(date: string): JourSemaine | 'samedi' | 'dimanche' {
    const [annee, mois, jour] = date.split('-').map(Number);
    return DateUtils.NOMS_JOURS[new Date(annee, mois - 1, jour).getDay()];
  }

  /**
   * Formate une date ISO en libellé long français.
   * Exemple : `"2026-06-15"` → `"lundi 15 juin 2026"`.
   * @param date Date au format `YYYY-MM-DD`.
   * @returns Date en toutes lettres.
   */
  public static formaterDateLong(date: string): string {
    const [annee, mois, jour] = date.split('-').map(Number);
    return DateUtils.FORMATEUR_DATE_LONG.format(new Date(annee, mois - 1, jour));
  }

  /**
   * Formate une date ISO au format court français.
   * Exemple : `"2026-06-09"` → `"09/06/2026"`.
   * @param date Date au format `YYYY-MM-DD`.
   * @returns Date au format `DD/MM/YYYY`.
   */
  public static formaterDateCourt(date: string): string {
    const [annee, mois, jour] = date.split('-');
    return `${jour}/${mois}/${annee}`;
  }

  /**
   * Calcule la parité du numéro de semaine ISO pour une date donnée.
   * Utilisé pour filtrer les emplois du temps en alternance semaine A / semaine B.
   * @param date Date au format `YYYY-MM-DD`.
   * @returns `'paire'` si le numéro ISO de semaine est pair, `'impaire'` sinon.
   */
  public static calculerParite(date: string): 'paire' | 'impaire' {
    const [annee, mois, jour] = date.split('-').map(Number);
    // Calcul ISO : on se place au jeudi de la même semaine pour obtenir le numéro correct.
    const d = new Date(Date.UTC(annee, mois - 1, jour));
    const jourSemaine = d.getUTCDay() || DateUtils.JOURS_PAR_SEMAINE; // lundi = 1, dimanche = 7
    d.setUTCDate(d.getUTCDate() + DateUtils.INDEX_JEUDI_ISO - jourSemaine);
    const debutAnnee = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const numeroSemaine = Math.ceil(
      ((d.getTime() - debutAnnee.getTime()) / DateUtils.MS_PAR_JOUR + 1) /
        DateUtils.JOURS_PAR_SEMAINE,
    );
    return numeroSemaine % 2 === 0 ? 'paire' : 'impaire';
  }

  /**
   * Détermine si deux créneaux horaires `HH:MM` se chevauchent.
   * Le chevauchement est strict : deux créneaux adjacents (fin du premier = début du second)
   * ne se chevauchent pas.
   * @param debut1 Heure de début du premier créneau.
   * @param fin1 Heure de fin du premier créneau.
   * @param debut2 Heure de début du second créneau.
   * @param fin2 Heure de fin du second créneau.
   * @returns `true` si les créneaux se chevauchent.
   */
  public static chevauchementHoraire(
    debut1: string,
    fin1: string,
    debut2: string,
    fin2: string,
  ): boolean {
    return debut1 < fin2 && debut2 < fin1;
  }

  /**
   * Formate un objet `Date` en heure `HH:MM` (heure locale).
   * @param date Objet `Date` à formater.
   * @returns Heure au format `HH:MM` avec zéro initial.
   */
  public static formaterHeure(date: Date): string {
    return [
      String(date.getHours()).padStart(2, '0'),
      String(date.getMinutes()).padStart(2, '0'),
    ].join(':');
  }
}
