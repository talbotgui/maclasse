import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DonneesService } from './donnees.service';
import { DonneesApplication } from '../../modeles/donnees-application.modele';
import { Commande } from '../../modeles/commande.modele';
import { DonneesMother } from '../../tests/donnees.mother';
import { JourneeMother } from '../../tests/cahier-journal.mother';
import { DateUtils } from '../../utilitaires/date.utils';

/**
 * Commande de test : ajoute le suffixe `-modifie` à `version` lors de l'exécution,
 * le supprime lors de l'annulation.
 */
class CommandeTest implements Commande {
  public readonly libelle = 'test';
  public executer(donnees: DonneesApplication): DonneesApplication {
    const clone = structuredClone(donnees);
    clone.version = clone.version + '-modifie';
    return clone;
  }

  public annuler(donnees: DonneesApplication): DonneesApplication {
    const clone = structuredClone(donnees);
    clone.version = clone.version.replace('-modifie', '');
    return clone;
  }
}

describe('DonneesService', () => {
  let service: DonneesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DonneesService);
  });

  /** Vérifie que toutes les propriétés réactives sont dans leur état par défaut avant tout chargement. */
  describe('état initial', () => {
    it('données nulles au démarrage', () => {
      expect(service.donnees()).toBeNull();
    });

    it('peutAnnuler est false au démarrage', () => {
      expect(service.peutAnnuler()).toBe(false);
    });

    it('peutRefaire est false au démarrage', () => {
      expect(service.peutRefaire()).toBe(false);
    });

    it('aDonneesModifiees est false au démarrage', () => {
      expect(service.aDonneesModifiees()).toBe(false);
    });
  });

  /** Charge les données dans le service, isole par clonage et réinitialise les piles UNDO/REDO. */
  describe('charger', () => {
    it('expose les données chargées', () => {
      service.charger(DonneesMother.base({ version: 'v1' }));
      expect(service.donnees()?.version).toBe('v1');
    });

    it('isole les données par clonage — mutation externe sans effet', () => {
      const original = DonneesMother.base({ version: 'v1' });
      service.charger(original);
      original.version = 'mutee';
      expect(service.donnees()?.version).toBe('v1');
    });

    it('vide la pile UNDO au rechargement', () => {
      service.charger(DonneesMother.base());
      service.executer(new CommandeTest());
      service.charger(DonneesMother.base());
      expect(service.peutAnnuler()).toBe(false);
    });

    it('vide la pile REDO au rechargement', () => {
      service.charger(DonneesMother.base());
      service.executer(new CommandeTest());
      service.annuler();
      service.charger(DonneesMother.base());
      expect(service.peutRefaire()).toBe(false);
    });

    it('remet aDonneesModifiees à false', () => {
      service.charger(DonneesMother.base());
      service.executer(new CommandeTest());
      service.charger(DonneesMother.base());
      expect(service.aDonneesModifiees()).toBe(false);
    });
  });

  /**
   * Le recentrage du cahier journal sur la semaine suivante n'est appliqué qu'à la demande
   * (données d'exemple). Un fichier importé doit conserver ses dates à l'identique.
   */
  describe('charger — recentrage du cahier journal', () => {
    it('recentrage demandé : la journée la plus ancienne passe à la semaine suivant aujourd’hui', () => {
      service.charger(
        DonneesMother.base({
          cahierJournal: [
            JourneeMother.base({ id: 'j1', date: '2020-01-08' }),
            JourneeMother.base({ id: 'j2', date: '2020-01-06' }),
          ],
        }),
        true,
      );

      const lundiCible = DateUtils.lundiDeLaSemaineSuivante(DateUtils.dateAujourdhui());
      const journeeLaPlusAncienne = service.donnees()!.cahierJournal[1];
      expect(DateUtils.lundiDeLaSemaine(journeeLaPlusAncienne.date)).toBe(lundiCible);
    });

    it('recentrage demandé : jour de semaine et écarts relatifs conservés', () => {
      service.charger(
        DonneesMother.base({
          cahierJournal: [
            JourneeMother.base({ id: 'j1', date: '2020-01-06' }),
            JourneeMother.base({ id: 'j2', date: '2020-01-08' }),
          ],
        }),
        true,
      );

      const [lundi, mercredi] = service.donnees()!.cahierJournal;
      expect(DateUtils.obtenirJourSemaine(lundi.date)).toBe('lundi');
      expect(DateUtils.obtenirJourSemaine(mercredi.date)).toBe('mercredi');
      expect(DateUtils.differenceEnJours(lundi.date, mercredi.date)).toBe(2);
    });

    it('recentrage demandé, cahier déjà dans la semaine cible : aucun décalage (delta = 0)', () => {
      const lundiCible = DateUtils.lundiDeLaSemaineSuivante(DateUtils.dateAujourdhui());
      const mardiCible = DateUtils.ajouterJours(lundiCible, 1);
      service.charger(
        DonneesMother.base({ cahierJournal: [JourneeMother.base({ date: mardiCible })] }),
        true,
      );
      expect(service.donnees()!.cahierJournal[0].date).toBe(mardiCible);
    });

    it('recentrage demandé, cahier sur plusieurs semaines : écart inter-semaines conservé', () => {
      service.charger(
        DonneesMother.base({
          cahierJournal: [
            JourneeMother.base({ id: 'j1', date: '2020-01-06' }),
            JourneeMother.base({ id: 'j2', date: '2020-01-15' }),
          ],
        }),
        true,
      );

      const [semaine1, semaine2] = service.donnees()!.cahierJournal;
      expect(DateUtils.differenceEnJours(semaine1.date, semaine2.date)).toBe(9);
      expect(DateUtils.obtenirJourSemaine(semaine2.date)).toBe('mercredi');
      expect(DateUtils.lundiDeLaSemaine(semaine2.date)).toBe(
        DateUtils.lundiDeLaSemaineSuivante(semaine1.date),
      );
    });

    it('sans recentrage (défaut) : les dates du cahier journal sont conservées', () => {
      service.charger(
        DonneesMother.base({ cahierJournal: [JourneeMother.base({ date: '2020-01-06' })] }),
      );
      expect(service.donnees()!.cahierJournal[0].date).toBe('2020-01-06');
    });

    it('recentrage demandé sur un cahier journal vide : sans effet', () => {
      service.charger(DonneesMother.base({ cahierJournal: [] }), true);
      expect(service.donnees()!.cahierJournal).toEqual([]);
    });
  });

  /** Exécute une commande, met à jour les données, active UNDO et marque les données comme modifiées. */
  describe('executer', () => {
    it('met à jour les données via la commande', () => {
      service.charger(DonneesMother.base({ version: 'v1' }));
      service.executer(new CommandeTest());
      expect(service.donnees()?.version).toBe('v1-modifie');
    });

    it('active peutAnnuler après exécution', () => {
      service.charger(DonneesMother.base());
      service.executer(new CommandeTest());
      expect(service.peutAnnuler()).toBe(true);
    });

    it('vide la pile REDO après exécution', () => {
      service.charger(DonneesMother.base());
      service.executer(new CommandeTest());
      service.annuler();
      service.executer(new CommandeTest());
      expect(service.peutRefaire()).toBe(false);
    });

    it('active aDonneesModifiees après exécution', () => {
      service.charger(DonneesMother.base());
      service.executer(new CommandeTest());
      expect(service.aDonneesModifiees()).toBe(true);
    });

    it('sans données chargées, ne fait rien', () => {
      service.executer(new CommandeTest());
      expect(service.donnees()).toBeNull();
      expect(service.peutAnnuler()).toBe(false);
    });
  });

  /** Annule la dernière commande, restaure l'état précédent et déplace la commande vers la pile REDO. */
  describe('annuler', () => {
    it("restaure l'état précédant la commande", () => {
      service.charger(DonneesMother.base({ version: 'v1' }));
      service.executer(new CommandeTest());
      service.annuler();
      expect(service.donnees()?.version).toBe('v1');
    });

    it('déplace la commande dans la pile REDO', () => {
      service.charger(DonneesMother.base());
      service.executer(new CommandeTest());
      service.annuler();
      expect(service.peutRefaire()).toBe(true);
      expect(service.peutAnnuler()).toBe(false);
    });

    it('sans commande dans la pile, ne fait rien', () => {
      service.charger(DonneesMother.base({ version: 'v1' }));
      service.annuler();
      expect(service.donnees()?.version).toBe('v1');
    });

    it('sans données chargées, ne fait rien', () => {
      service.annuler();
      expect(service.donnees()).toBeNull();
    });
  });

  /** Ré-applique une commande annulée, met à jour les données et déplace la commande vers la pile UNDO. */
  describe('refaire', () => {
    it('ré-applique la commande annulée', () => {
      service.charger(DonneesMother.base({ version: 'v1' }));
      service.executer(new CommandeTest());
      service.annuler();
      service.refaire();
      expect(service.donnees()?.version).toBe('v1-modifie');
    });

    it('déplace la commande dans la pile UNDO', () => {
      service.charger(DonneesMother.base());
      service.executer(new CommandeTest());
      service.annuler();
      service.refaire();
      expect(service.peutAnnuler()).toBe(true);
      expect(service.peutRefaire()).toBe(false);
    });

    it('sans commande dans la pile REDO, ne fait rien', () => {
      service.charger(DonneesMother.base({ version: 'v1' }));
      service.refaire();
      expect(service.donnees()?.version).toBe('v1');
    });

    it('sans données chargées, ne fait rien', () => {
      service.refaire();
      expect(service.donnees()).toBeNull();
    });
  });

  /** Remet aDonneesModifiees à false sans altérer ni les données ni les piles UNDO/REDO. */
  describe('marquerCommeSauvegarde', () => {
    it('remet aDonneesModifiees à false', () => {
      service.charger(DonneesMother.base());
      service.executer(new CommandeTest());
      service.marquerCommeSauvegarde();
      expect(service.aDonneesModifiees()).toBe(false);
    });
  });

  /** Vérifie la cohérence des cycles complets exécuter/annuler/refaire sur plusieurs commandes enchaînées. */
  describe('enchaînements UNDO/REDO', () => {
    it('cycle complet : exécuter → annuler → refaire', () => {
      service.charger(DonneesMother.base({ version: 'v1' }));
      service.executer(new CommandeTest());
      service.executer(new CommandeTest());
      service.annuler();
      service.annuler();
      expect(service.donnees()?.version).toBe('v1');
      service.refaire();
      service.refaire();
      expect(service.donnees()?.version).toBe('v1-modifie-modifie');
    });
  });
});
