import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ContexteService } from './services/avecEtat/contexte.service';

/**
 * Composant racine de l'application MaClasse.
 * Layout : en-tête (intégré à l'étape 9) + vue courante via `<router-outlet>`.
 * Applique le thème actif sur `<html>` en réaction au signal `themeActif`.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  /** Service de contexte global — utilisé pour l'application réactive du thème. */
  protected readonly contexte = inject(ContexteService);

  /** Câble l'effet d'application du thème dans le contexte d'injection du constructeur. */
  public constructor() {
    effect(() => this.contexte.appliquerTheme(this.contexte.themeActif()));
  }
}
