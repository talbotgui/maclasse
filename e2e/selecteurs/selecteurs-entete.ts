import { type Page } from '@playwright/test';
import { SelecteursBase } from './selecteurs-base';

/** Sélecteurs de l'entête — identiques à SelecteursBase, exposés via un alias dédié. */
export class SelecteursEntete extends SelecteursBase {
  constructor(page: Page) {
    super(page);
  }

  /** Recherche un terme et attend l'apparition de la liste de résultats. */
  async rechercherEtAttendre(terme: string): Promise<void> {
    await this.champRechercheGlobale.fill(terme);
    await this.listeResultatsRecherche.waitFor({ state: 'visible' });
  }
}
