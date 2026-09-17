import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { McEnteteComponent } from './composants/mc-entete/mc-entete.component';

/**
 * Composant racine de l'application MaClasse.
 * Layout : en-tête (intégré à l'étape 9) + vue courante via `<router-outlet>`.
 * Le thème actif est appliqué par `ContexteService` lui-même (construction et `basculerTheme()`),
 * ce composant n'a donc aucune logique propre.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, McEnteteComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
