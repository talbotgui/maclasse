import { type Page, type Locator } from '@playwright/test';

/** Sélecteurs communs à toutes les pages : entête, navigation, popins transverses. */
export class SelecteursBase {
  /** Bouton de sauvegarde manuelle dans l'entête. */
  readonly btnSauvegarder: Locator;
  /** Bouton ANNULER (undo) dans l'entête. */
  readonly btnAnnuler: Locator;
  /** Bouton REFAIRE (redo) dans l'entête. */
  readonly btnRefaire: Locator;
  /** Bouton de changement de thème. */
  readonly btnTheme: Locator;

  /** Lien de navigation vers l'accueil. */
  readonly navAccueil: Locator;
  /** Lien de navigation vers les élèves. */
  readonly navEleves: Locator;
  /** Lien de navigation vers les projets. */
  readonly navProjets: Locator;
  /** Lien de navigation vers les compétences. */
  readonly navCompetences: Locator;
  /** Lien de navigation vers l'emploi du temps. */
  readonly navEmploiDuTemps: Locator;
  /** Lien de navigation vers le cahier journal. */
  readonly navCahierJournal: Locator;
  /** Lien de navigation vers le paramétrage. */
  readonly navParametrage: Locator;

  /** Champ de recherche globale dans l'entête. */
  readonly champRechercheGlobale: Locator;
  /** Liste des résultats de la recherche globale. */
  readonly listeResultatsRecherche: Locator;

  /** Bouton ANNULER de la popin d'avertissement. */
  readonly btnAvertissementAnnuler: Locator;
  /** Bouton CONFIRMER de la popin d'avertissement. */
  readonly btnAvertissementConfirmer: Locator;

  /** Bouton MOT DE PASSE de la popin de sauvegarde. */
  readonly champMotDePasseSauvegarde: Locator;
  /** Bouton CONFIRMER de la popin de sauvegarde. */
  readonly btnSauvegardeConfirmer: Locator;
  /** Bouton ANNULER de la popin de sauvegarde. */
  readonly btnSauvegardeAnnuler: Locator;

  constructor(protected readonly page: Page) {
    this.btnSauvegarder = page.locator('#btnSauvegarder');
    this.btnAnnuler = page.locator('#btnAnnuler');
    this.btnRefaire = page.locator('#btnRefaire');
    this.btnTheme = page.locator('#btnTheme');

    this.navAccueil = page.locator('#navAccueil');
    this.navEleves = page.locator('#navEleves');
    this.navProjets = page.locator('#navProjets');
    this.navCompetences = page.locator('#navCompetences');
    this.navEmploiDuTemps = page.locator('#navEmploiDuTemps');
    this.navCahierJournal = page.locator('#navCahierJournal');
    this.navParametrage = page.locator('#navParametrage');

    this.champRechercheGlobale = page.locator('#rechercheGlobale input');
    this.listeResultatsRecherche = page.locator('#listeResultatsRecherche');

    this.btnAvertissementAnnuler = page.locator('#btnAvertissementAnnuler');
    this.btnAvertissementConfirmer = page.locator('#btnAvertissementConfirmer');

    this.champMotDePasseSauvegarde = page.locator('#motDePasseSauvegarde');
    this.btnSauvegardeConfirmer = page.locator('#btnSauvegardeConfirmer');
    this.btnSauvegardeAnnuler = page.locator('#btnSauvegardeAnnuler');
  }

  /** Retourne le premier résultat de la liste de recherche globale. */
  get premierResultatRecherche(): Locator {
    return this.listeResultatsRecherche.locator('[role="option"]').first();
  }
}
