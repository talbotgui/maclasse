import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { McEnteteComponent } from './composants/mc-entete/mc-entete.component';
import { ImpressionService } from './services/sansEtat/impression.service';

/**
 * Composant racine de l'application MaClasse.
 * Layout : en-tête (intégré à l'étape 9) + vue courante via `<router-outlet>`.
 * Le thème actif est appliqué par `ContexteService` lui-même (construction et `basculerTheme()`).
 * Avant toute impression (bouton IMPRIMER ou Ctrl+P), alimente les marges des pages imprimées.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, McEnteteComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:beforeprint)': 'preparerImpression()',
  },
})
export class App {
  /** Service qui alimente l'entête et le pied de page des impressions. */
  private readonly impressionService = inject(ImpressionService);

  /** Pose le libellé d'entête et l'horodatage lus par les marges `@page` de `styles.scss`. */
  protected preparerImpression(): void {
    this.impressionService.preparerMarges();
  }
}
