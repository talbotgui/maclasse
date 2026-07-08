/**
 * Utilitaires de manipulation et formatage des dates et heures.
 * Toutes les méthodes sont statiques — la classe n'a pas vocation à être instanciée.
 * Les dates ISO `YYYY-MM-DD` sont toujours traitées en heure locale pour éviter
 * les décalages UTC lors du formatage.
 */

import { LIBELLES } from '../libelles';
import { JourSemaine } from '../modeles/emploi-du-temps.modele';

/**
 * Classe utilitaire pour la manipulation et le formatage de dates ISO (`YYYY-MM-DD`)
 * et d'heures (`HH:MM`). Tous les traitements s'effectuent en heure locale.
 */
export class DateUtils {
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
    return LIBELLES.dates.nomsJours[new Date(annee, mois - 1, jour).getDay()];
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
   * Retourne la date du lundi de la semaine ISO contenant la date donnée.
   * @param date Date au format `YYYY-MM-DD`.
   * @returns Date du lundi correspondant au format `YYYY-MM-DD`.
   */
  public static lundiDeLaSemaine(date: string): string {
    const [annee, mois, jour] = date.split('-').map(Number);
    const jourSemaine = new Date(annee, mois - 1, jour).getDay();
    return DateUtils.ajouterJours(date, -((jourSemaine + 6) % DateUtils.JOURS_PAR_SEMAINE));
  }

  /**
   * Calcule le nombre de jours entre deux dates ISO (`fin - debut`).
   * Le résultat est positif si `fin` est après `debut`, négatif sinon.
   * @param debut Date de départ au format `YYYY-MM-DD`.
   * @param fin Date de fin au format `YYYY-MM-DD`.
   * @returns Nombre entier de jours entre les deux dates.
   */
  public static differenceEnJours(debut: string, fin: string): number {
    const [ay, am, ad] = debut.split('-').map(Number);
    const [by, bm, bd] = fin.split('-').map(Number);
    return Math.round(
      (new Date(by, bm - 1, bd).getTime() - new Date(ay, am - 1, ad).getTime()) /
        DateUtils.MS_PAR_JOUR,
    );
  }

  /**
   * Retourne la date du jour au format ISO `YYYY-MM-DD` en heure locale.
   * @returns Date du jour sans décalage UTC.
   */
  public static dateAujourdhui(): string {
    const d = new Date();
    return [
      String(d.getFullYear()),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0'),
    ].join('-');
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

  /**
   * Ajoute un nombre d'heures entières à une heure `HH:MM`, avec wrap modulo 24h.
   * Exemple : `'23:00'` + 1 → `'00:00'`.
   * @param hhmm Heure de départ au format `HH:MM`.
   * @param heures Nombre d'heures à ajouter.
   * @returns Nouvelle heure au format `HH:MM`.
   */
  public static ajouterHeures(hhmm: string, heures: number): string {
    const [h, m] = hhmm.split(':').map(Number);
    const totalMinutes = (((h * 60 + m + heures * 60) % (24 * 60)) + 24 * 60) % (24 * 60);
    return [
      String(Math.floor(totalMinutes / 60)).padStart(2, '0'),
      String(totalMinutes % 60).padStart(2, '0'),
    ].join(':');
  }
}
