import { type Page, type Locator } from '@playwright/test';
import { SelecteursBase } from './selecteurs-base';

/** Sélecteurs de l'entête — identiques à SelecteursBase, exposés via un alias dédié. */
export class SelecteursEntete extends SelecteursBase {
  /** Type affiché sur le premier résultat de la liste de recherche globale. */
  readonly typeDuPremierResultat: Locator;
  /** Titre affiché sur le premier résultat de la liste de recherche globale. */
  readonly titreDuPremierResultat: Locator;
  /** Résultat de recherche correspondant au projet Potager pédagogique. */
  readonly resultatPotager: Locator;
  /** Type affiché sur le résultat de recherche du projet Potager pédagogique. */
  readonly typeDuResultatPotager: Locator;

  constructor(page: Page) {
    super(page);
    this.typeDuPremierResultat = this.listeResultatsRecherche
      .locator('[role="option"]').first().locator('.mc-entete__resultat-type');
    this.titreDuPremierResultat = this.listeResultatsRecherche
      .locator('[role="option"]').first().locator('.mc-entete__resultat-titre');
    this.resultatPotager = this.listeResultatsRecherche
      .locator('[role="option"]').filter({ hasText: 'Potager' }).first();
    this.typeDuResultatPotager = this.listeResultatsRecherche
      .locator('[role="option"]').filter({ hasText: 'Potager' }).first().locator('.mc-entete__resultat-type');
  }

  /** Recherche un terme et attend l'apparition de la liste de résultats. */
  async rechercherEtAttendre(terme: string): Promise<void> {
    await this.champRechercheGlobale.fill(terme);
    await this.listeResultatsRecherche.waitFor({ state: 'visible' });
  }
}
