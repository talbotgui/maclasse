import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Composant racine de l'application MaClasse.
 * Layout : en-tête (intégré à l'étape 9) + vue courante via `<router-outlet>`.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  // TODO étape 3 : injecter ContexteService et câbler l'effet d'application du thème
  // protected readonly _contexte = inject(ContexteService);
  // constructor() { effect(() => this._contexte.appliquerTheme(this._contexte.themeActif())); }
}
