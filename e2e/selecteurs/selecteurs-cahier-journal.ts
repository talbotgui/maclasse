import { type Page, type Locator } from '@playwright/test';
import { SelecteursBase } from './selecteurs-base';

/** Sélecteurs de l'écran Cahier Journal. */
export class SelecteursCahierJournal extends SelecteursBase {
  /** Bouton "Initialiser une journée vide" (bandeau haut). */
  readonly btnInitialiserVide: Locator;
  /** Bouton ENREGISTRER d'une séance dans le formulaire de séance. */
  readonly btnEnregistrerSeance: Locator;
  /** Bouton AJOUTER UNE SÉANCE dans la journée courante. */
  readonly btnAjouterSeance: Locator;
  /** Champ Heure de début de la première séance du formulaire. */
  readonly champHeureDebutSeance: Locator;
  /** Champ Heure de fin de la première séance du formulaire. */
  readonly champHeureFinSeance: Locator;
  /** Champ Titre de la première séance du formulaire. */
  readonly champTitreSeance: Locator;

  constructor(page: Page) {
    super(page);
    this.btnInitialiserVide = page.locator('#btnInitialiserVide');
    this.btnEnregistrerSeance = page.locator('#btnEnregistrerSeance');
    this.btnAjouterSeance = page.locator('#btnAjouterSeance');
    this.champHeureDebutSeance = page.locator('#champHeureDebut input, [id*="HeureDebut"] input').first();
    this.champHeureFinSeance = page.locator('#champHeureFin input, [id*="HeureFin"] input').first();
    this.champTitreSeance = page.locator('#champTitreSeance input, [id*="Titre"] input').first();
  }
}
