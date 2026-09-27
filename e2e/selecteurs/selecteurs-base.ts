import { type Page, type Locator } from '@playwright/test';

/** Sélecteurs communs à toutes les pages : entête, navigation, popins transverses. */
export class SelecteursBase {
  /** Bouton de sauvegarde manuelle dans l'entête. */
  public readonly btnSauvegarder: Locator;
  /** Bouton ANNULER (undo) dans l'entête. */
  public readonly btnAnnuler: Locator;
  /** Bouton REFAIRE (redo) dans l'entête. */
  public readonly btnRefaire: Locator;
  /** Bouton de changement de thème. */
  public readonly btnTheme: Locator;
  /** Boîte de dialogue modale actuellement ouverte. */
  public readonly dialogueOuvert: Locator;

  /** Lien de navigation vers l'accueil. */
  public readonly navAccueil: Locator;
  /** Lien de navigation vers les élèves. */
  public readonly navEleves: Locator;
  /** Lien de navigation vers les projets. */
  public readonly navProjets: Locator;
  /** Lien de navigation vers les compétences. */
  public readonly navCompetences: Locator;
  /** Lien de navigation vers l'emploi du temps. */
  public readonly navEmploiDuTemps: Locator;
  /** Lien de navigation vers le cahier journal. */
  public readonly navCahierJournal: Locator;
  /** Lien de navigation vers le paramétrage. */
  public readonly navParametrage: Locator;

  /** Champ de recherche globale dans l'entête. */
  public readonly champRechercheGlobale: Locator;
  /** Liste des résultats de la recherche globale. */
  public readonly listeResultatsRecherche: Locator;

  /** Bouton ANNULER de la popin d'avertissement. */
  public readonly btnAvertissementAnnuler: Locator;
  /** Bouton CONFIRMER de la popin d'avertissement. */
  public readonly btnAvertissementConfirmer: Locator;

  /** Bouton MOT DE PASSE de la popin de sauvegarde. */
  public readonly champMotDePasseSauvegarde: Locator;
  /** Bouton CONFIRMER de la popin de sauvegarde. */
  public readonly btnSauvegardeConfirmer: Locator;
  /** Bouton ANNULER de la popin de sauvegarde. */
  public readonly btnSauvegardeAnnuler: Locator;

  /** Select de destination principale dans la popin d'export de compétences (projet ou séance). */
  public readonly exportSelectPrimaire: Locator;
  /** Select de destination secondaire dans la popin d'export de compétences. */
  public readonly exportSelectSecondaire: Locator;
  /** Bouton ANNULER de la popin d'export de compétences. */
  public readonly btnExportAnnuler: Locator;
  /** Bouton EXPORTER (confirmer) de la popin d'export de compétences. */
  public readonly btnExportConfirmer: Locator;

  constructor(protected readonly page: Page) {
    this.btnSauvegarder = page.locator('#btnSauvegarder');
    this.btnAnnuler = page.locator('#btnAnnuler');
    this.btnRefaire = page.locator('#btnRefaire');
    this.btnTheme = page.locator('#btnTheme');
    this.dialogueOuvert = page.locator('dialog[open]');

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

    this.exportSelectPrimaire = page.locator('#exportSelectPrimaire');
    this.exportSelectSecondaire = page.locator('#exportSelectSecondaire');
    this.btnExportAnnuler = page.locator('#btnExportAnnuler');
    this.btnExportConfirmer = page.locator('#btnExportConfirmer');
  }

  /** Retourne le premier résultat de la liste de recherche globale. */
  public get premierResultatRecherche(): Locator {
    return this.listeResultatsRecherche.locator('button').first();
  }
}
