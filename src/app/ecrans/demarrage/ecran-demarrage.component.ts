/**
 * Écran de démarrage : affiche la popin obligatoire puis navigue vers l'accueil.
 */

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DonneesService } from '../../services/avecEtat/donnees.service';
import { ContexteService } from '../../services/avecEtat/contexte.service';
import { PopinDemarrageComponent } from '../../composants/popins/popin-demarrage/popin-demarrage.component';
import { LIBELLES } from '../../libelles';
import type { DonneesApplication } from '../../modeles/donnees-application.modele';

/**
 * Écran de démarrage de l'application.
 * Affiche uniquement `<popin-demarrage>` (non fermable) et redirige vers `/accueil`
 * (Créer/Charger) ou `/competences` (consultation seule du référentiel) au succès.
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

  /** Service de contexte : bascule le mode consultation référentiel seul. */
  private readonly contexteService = inject(ContexteService);

  /** Router Angular pour la navigation après chargement. */
  private readonly router = inject(Router);

  /**
   * Reçoit les données d'exemple depuis la popin (bouton "Créer"), les charge dans le service
   * en recentrant le cahier journal sur la semaine suivante, quitte le mode consultation
   * référentiel s'il était actif, et navigue vers l'écran d'accueil.
   * @param donnees Données issues du fichier d'exemple `donnees-defaut.json`.
   */
  protected async surCreationDemandee(donnees: DonneesApplication): Promise<void> {
    await this.chargerEtNaviguerAccueil(donnees, true);
  }

  /**
   * Reçoit les données déchiffrées d'un fichier ZIP importé par l'utilisateur, les charge
   * dans le service sans modifier les dates, quitte le mode consultation référentiel s'il
   * était actif, et navigue vers l'écran d'accueil.
   * @param donnees Données déchiffrées issues du fichier importé.
   */
  protected async surDemarrageTermine(donnees: DonneesApplication): Promise<void> {
    await this.chargerEtNaviguerAccueil(donnees, false);
  }

  /**
   * Charge les données, désactive le mode consultation référentiel et navigue vers l'accueil.
   * @param donnees Données à charger.
   * @param recentrerCahierJournalSurSemaineSuivante `true` pour décaler le cahier journal vers
   * la semaine suivante (données d'exemple), `false` pour conserver les dates (fichier importé).
   */
  private async chargerEtNaviguerAccueil(
    donnees: DonneesApplication,
    recentrerCahierJournalSurSemaineSuivante: boolean,
  ): Promise<void> {
    this.donneesService.charger(donnees, recentrerCahierJournalSurSemaineSuivante);
    this.contexteService.modeConsultationReferentiel.set(false);
    await this.router.navigate(['/accueil']);
  }

  /**
   * Reçoit les données d'exemple depuis la popin (bouton "Accéder aux programmes"),
   * les charge dans le service, active le mode consultation référentiel seul
   * et navigue vers l'écran des compétences.
   * @param donnees Données d'exemple chargées pour la consultation.
   */
  protected async surReferentielDemande(donnees: DonneesApplication): Promise<void> {
    this.donneesService.charger(donnees, true);
    this.contexteService.modeConsultationReferentiel.set(true);
    await this.router.navigate(['/competences']);
  }
}
