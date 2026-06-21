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

  constructor(page: Page) {
    super(page);
    this.btnInitialiserVide = page.locator('#btnInitialiserVide');
    this.btnEnregistrerSeance = page.locator('#btnEnregistrerSeance');
    this.btnAjouterSeance = page.locator('#btnAjouterSeance');
  }
}
