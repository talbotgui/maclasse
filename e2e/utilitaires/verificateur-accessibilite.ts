import AxeBuilder from '@axe-core/playwright';
import type { Locator, Page } from '@playwright/test';

/** Outil d'audit d'accessibilité AXE (WCAG 2 A/AA) pour les tests E2E. */
export class VerificateurAccessibilite {
  /** Étiquettes AXE : WCAG 2.0 et 2.1, niveaux A et AA. */
  private static readonly ETIQUETTES: string[] = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

  /**
   * Analyse la page courante avec AXE.
   * @param page Page Playwright à auditer.
   * @returns Une ligne lisible par violation (règle, impact, cibles), vide si la page est conforme.
   */
  public static async lister(page: Page): Promise<string[]> {
    const resultat = await new AxeBuilder({ page })
      .withTags(VerificateurAccessibilite.ETIQUETTES)
      .analyze();
    return resultat.violations.map((violation) => {
      const cibles = violation.nodes
        .map((noeud) => {
          const detail = (noeud.failureSummary ?? '').replace(/\s+/g, ' ');
          return `${noeud.target.join(' ')} : ${detail}`;
        })
        .join(' | ');
      return `${violation.id} [${violation.impact}] ${violation.help} → ${cibles}`;
    });
  }

  /**
   * Recherche les attributs `id` présents plusieurs fois dans le DOM de la page courante.
   * @param page Page Playwright à inspecter.
   * @returns La liste des identifiants dupliqués, vide si chaque `id` est unique.
   */
  public static async listerIdentifiantsDupliques(page: Page): Promise<string[]> {
    return page.evaluate(() => {
      const compteurs = new Map<string, number>();
      document.querySelectorAll('[id]').forEach((el) => {
        compteurs.set(el.id, (compteurs.get(el.id) ?? 0) + 1);
      });
      return [...compteurs].filter(([, nombre]) => nombre > 1).map(([id]) => id);
    });
  }

  /**
   * Indique si le focus est piégé dans la boîte de dialogue ouverte.
   * Le focus sur `body` est admis : il correspond au passage par l'interface du navigateur,
   * comportement normal d'un `<dialog>` modal, pendant lequel la page reste inerte.
   * @param dialogue Locator de la boîte de dialogue ouverte.
   * @returns `true` si le focus est dans la boîte de dialogue ou sur `body`, `false` s'il a atteint la page inerte.
   */
  public static async verifierFocusPiege(dialogue: Locator): Promise<boolean> {
    return dialogue.evaluate(
      (d) => d.contains(document.activeElement) || document.activeElement === document.body,
    );
  }

  /**
   * Mesure le débordement horizontal de la page (WCAG 1.4.10 « Redimensionnement du contenu »).
   * @param page Page Playwright à inspecter.
   * @returns Nombre de pixels dépassant la largeur visible, `0` si la page ne défile pas horizontalement.
   */
  public static async mesurerDebordementHorizontal(page: Page): Promise<number> {
    return page.evaluate(() =>
      Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
    );
  }
}
