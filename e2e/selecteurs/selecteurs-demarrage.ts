import { type Page, type Locator } from '@playwright/test';
import { SelecteursBase } from './selecteurs-base';

/** Sélecteurs de la popin de démarrage. */
export class SelecteursDemarrage extends SelecteursBase {
  /** Bouton "Créer ma classe à partir d'un jeu de données d'exemple". */
  readonly btnCreer: Locator;
  /** Input de sélection du fichier ZIP. */
  readonly inputFichierZip: Locator;
  /** Input du mot de passe de chargement. */
  readonly champMotDePasse: Locator;
  /** Bouton CHARGER. */
  readonly btnCharger: Locator;
  /** Message d'erreur affiché en cas d'échec. */
  readonly messageErreur: Locator;

  constructor(page: Page) {
    super(page);
    this.btnCreer = page.locator('#btnCreer');
    this.inputFichierZip = page.locator('#fichierZip');
    this.champMotDePasse = page.locator('#motDePasseChargement');
    this.btnCharger = page.locator('#btnCharger');
    this.messageErreur = page.locator('.mc-popin__erreur');
  }

  /** Charge un fichier ZIP avec le mot de passe donné. */
  async chargerZip(cheminFichier: string, motDePasse: string): Promise<void> {
    await this.inputFichierZip.setInputFiles(cheminFichier);
    await this.champMotDePasse.fill(motDePasse);
    await this.btnCharger.click();
  }
}
