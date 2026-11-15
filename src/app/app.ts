import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { McEnteteComponent } from './composants/mc-entete/mc-entete.component';
import { ImpressionService } from './services/sansEtat/impression.service';

/**
 * Composant racine de l'application MaClasse.
 * Layout : en-tête (intégré à l'étape 9) + vue courante via `<router-outlet>`.
 * Le thème actif est appliqué par `ContexteService` lui-même (construction et `basculerTheme()`).
 * Avant toute impression (bouton IMPRIMER ou Ctrl+P), alimente les marges des pages imprimées
 * et le titre du document ; le restaure après.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, McEnteteComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:beforeprint)': 'preparerImpression()',
    '(window:afterprint)': 'terminerImpression()',
  },
})
export class App {
  /** Service qui alimente l'entête et le pied de page des impressions. */
  private readonly impressionService = inject(ImpressionService);

  /** Pose l'entête, la date et le titre du document lus à l'impression. */
  protected preparerImpression(): void {
    this.impressionService.preparerImpression();
  }

  /** Restaure le titre du document après l'impression. */
  protected terminerImpression(): void {
    this.impressionService.terminerImpression();
  }
}
