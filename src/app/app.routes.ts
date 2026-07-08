import { Routes } from '@angular/router';
import { donneesChargeesGarde } from './gardes/donnees-chargees.garde';
import { modificationsNonEnregistreesGarde } from './gardes/modifications-non-enregistrees.garde';
import { referentielSeulGarde } from './gardes/referentiel-seul.garde';

/** Routes de l'application. Chaque route d'écran est câblée en lazy loading. */
export const routes: Routes = [
  { path: '', redirectTo: 'demarrage', pathMatch: 'full' },
  {
    path: 'demarrage',
    loadComponent: () =>
      import('./ecrans/demarrage/ecran-demarrage.component').then((m) => m.EcranDemarrageComponent),
  },
  {
    path: 'accueil',
    loadComponent: () =>
      import('./ecrans/accueil/ecran-accueil.component').then((m) => m.EcranAccueilComponent),
    canActivate: [donneesChargeesGarde, referentielSeulGarde],
  },
  {
    path: 'parametrage',
    loadComponent: () =>
      import('./ecrans/parametrage/ecran-parametrage.component').then(
        (m) => m.EcranParametrageComponent,
      ),
    canActivate: [donneesChargeesGarde, referentielSeulGarde],
  },
  {
    path: 'eleves',
    loadComponent: () =>
      import('./ecrans/eleves/ecran-eleves.component').then((m) => m.EcranElevesComponent),
    canActivate: [donneesChargeesGarde, referentielSeulGarde],
    canDeactivate: [modificationsNonEnregistreesGarde],
  },
  {
    path: 'projets',
    loadComponent: () =>
      import('./ecrans/projets/ecran-projets.component').then((m) => m.EcranProjetsComponent),
    canActivate: [donneesChargeesGarde, referentielSeulGarde],
    canDeactivate: [modificationsNonEnregistreesGarde],
  },
  {
    path: 'competences',
    loadComponent: () =>
      import('./ecrans/competences/ecran-competences.component').then(
        (m) => m.EcranCompetencesComponent,
      ),
    canActivate: [donneesChargeesGarde],
  },
  {
    path: 'emploi-du-temps',
    loadComponent: () =>
      import('./ecrans/emploi-du-temps/ecran-emploi-du-temps.component').then(
        (m) => m.EcranEmploiDuTempsComponent,
      ),
    canActivate: [donneesChargeesGarde, referentielSeulGarde],
  },
  {
    path: 'cahier-journal',
    loadComponent: () =>
      import('./ecrans/cahier-journal/ecran-cahier-journal.component').then(
        (m) => m.EcranCahierJournalComponent,
      ),
    canActivate: [donneesChargeesGarde, referentielSeulGarde],
  },
];
