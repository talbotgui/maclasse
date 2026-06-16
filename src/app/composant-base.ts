import { LIBELLES } from './libelles';

/**
 * Classe de base abstraite pour tous les composants partagés (`src/app/composants/`).
 * Expose `LIBELLES` dans les templates sans redéclaration dans chaque composant.
 */
export abstract class ComposantBase {
  /** Constante centralisée des libellés de l'interface. Accessible directement dans les templates. */
  protected readonly LIBELLES = LIBELLES;
}
