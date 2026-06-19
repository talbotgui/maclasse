/**
 * Écran de démarrage : affiche la popin obligatoire puis navigue vers l'accueil.
 */

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DonneesService } from '../../services/avecEtat/donnees.service';
import { PopinDemarrageComponent } from '../../composants/popins/popin-demarrage/popin-demarrage.component';
import { LIBELLES } from '../../libelles';
import type { DonneesApplication } from '../../modeles/donnees-application.modele';

/**
 * Écran de démarrage de l'application.
 * Affiche uniquement `<popin-demarrage>` (non fermable) et redirige vers `/accueil` au succès.
 * Accessible sans `DonneesChargeesGarde`.
 */
@Component({
  selector: 'ecran-demarrage',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PopinDemarrageComponent],
  templateUrl: './ecran-demarrage.component.html',
  styleUrl: './ecran-demarrage.component.scss',
})
export class EcranDemarrageComponent {
  /** Constante centralisée des libellés. */
  protected readonly LIBELLES = LIBELLES;

  /** Service de données : chargement des données au démarrage. */
  private readonly donneesService = inject(DonneesService);

  /** Router Angular pour la navigation vers l'accueil après chargement. */
  private readonly router = inject(Router);

  /**
   * Reçoit les données chargées depuis la popin, les charge dans le service
   * et navigue immédiatement vers l'écran d'accueil.
   * @param donnees Données déchiffrées ou issues du fichier d'exemple.
   */
  protected async surDemarrageTermine(donnees: DonneesApplication): Promise<void> {
    this.donneesService.charger(donnees);
    await this.router.navigate(['/accueil']);
  }
}
