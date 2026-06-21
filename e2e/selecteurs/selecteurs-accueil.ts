import { type Page, type Locator } from '@playwright/test';
import { SelecteursBase } from './selecteurs-base';

/** Sélecteurs de l'écran Accueil. */
export class SelecteursAccueil extends SelecteursBase {
  /** Titre affichant la date du jour. */
  readonly titreDateJour: Locator;
  /** Message affiché quand aucun journal n'existe pour aujourd'hui. */
  readonly messageAucunJournal: Locator;
  /** Liste des séances du jour dans le résumé. */
  readonly listeSeances: Locator;

  constructor(page: Page) {
    super(page);
    this.titreDateJour = page.locator('.accueil__titre');
    this.messageAucunJournal = page.locator('.accueil__vide');
    this.listeSeances = page.locator('.accueil__liste');
  }
}
