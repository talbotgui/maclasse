import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import type { InputSignal, Signal } from '@angular/core';
import { ComposantBase } from '../../composant-base';
import { DonneesService } from '../../services/avecEtat/donnees.service';
import type { ElevesConcernes } from '../../modeles/emploi-du-temps.modele';

/** Pastille de présentation affichant un groupe ou un élève concerné (non persistée). */
interface Pastille {
  /** Identifiant unique de la pastille (id du groupe, de l'élève, ou `'classe'`). */
  id: string;
  /** Libellé affiché dans la pastille. */
  libelle: string;
}

/**
 * Affiche, sous forme de pastilles statiques `.mc-disc-pill`, le périmètre des élèves
 * concernés par une séance de cahier journal ou un créneau d'emploi du temps.
 * Injecte `DonneesService` pour résoudre les libellés des groupes et des élèves.
 */
@Component({
  selector: 'mc-pastilles-eleves-concernes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mc-pastilles-eleves-concernes.component.html',
  styleUrl: './mc-pastilles-eleves-concernes.component.scss',
})
export class McPastillesElevesConcernesComponent extends ComposantBase {
  /** Périmètre des élèves concernés, `undefined` pour les créneaux non pédagogiques. */
  public readonly elevesConcernes: InputSignal<ElevesConcernes | undefined> = input<
    ElevesConcernes | undefined
  >(undefined);

  /** Accès aux données de l'application pour résoudre groupes et élèves. */
  private readonly donneesService = inject(DonneesService);

  /** Pastilles à afficher, dérivées du périmètre courant. */
  protected readonly pastilles: Signal<Pastille[]> = computed(() => {
    const concernes = this.elevesConcernes();
    if (!concernes) {
      return [];
    }

    if (concernes.type === 'classe') {
      return [{ id: 'classe', libelle: this.LIBELLES.elevesConcernes.modeClasse }];
    }

    const donnees = this.donneesService.donnees();

    if (concernes.type === 'groupes') {
      const groupes = donnees?.referentiels.groupes ?? [];
      return concernes.groupes
        .map((id) => groupes.find((groupe) => groupe.id === id))
        .filter((groupe): groupe is NonNullable<typeof groupe> => !!groupe)
        .map((groupe) => ({ id: groupe.id, libelle: groupe.libelle }))
        .sort((a, b) => a.libelle.localeCompare(b.libelle));
    }

    const eleves = donnees?.classe.eleves ?? [];
    return concernes.elevesIds
      .map((id) => eleves.find((eleve) => eleve.id === id))
      .filter((eleve): eleve is NonNullable<typeof eleve> => !!eleve)
      .map((eleve) => ({ id: eleve.id, libelle: `${eleve.nom.toUpperCase()} ${eleve.prenom}` }))
      .sort((a, b) => a.libelle.localeCompare(b.libelle));
  });
}
