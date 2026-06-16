import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Routes } from '@angular/router';

/** Composant temporaire — remplacé par EcranDemarrageComponent à l'étape 8.1. */
@Component({ template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class ComposantDemarrageTemporaire {}

/** Routes de l'application. Chaque route d'écran est câblée au fil des étapes. */
export const routes: Routes = [
  { path: '', redirectTo: 'demarrage', pathMatch: 'full' },
  { path: 'demarrage', component: ComposantDemarrageTemporaire },
];
