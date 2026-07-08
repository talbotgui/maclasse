import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { EcranCahierJournalComponent } from './ecran-cahier-journal.component';
import { DonneesService } from '../../services/avecEtat/donnees.service';
import { DonneesMother } from '../../tests/donnees.mother';
import { SeanceMother } from '../../tests/cahier-journal.mother';
import { EleveMother } from '../../tests/eleve.mother';
import { DateUtils } from '../../utilitaires/date.utils';
import type { Seance } from '../../modeles/cahier-journal.modele';

describe('EcranCahierJournalComponent', () => {
  let fixture: ComponentFixture<EcranCahierJournalComponent>;
  let component: EcranCahierJournalComponent;
  let donneesService: DonneesService;

  const dateTest = DateUtils.ajouterJours(
    DateUtils.lundiDeLaSemaine(DateUtils.dateAujourdhui()),
    7,
  );
  const seance1 = SeanceMother.pedagogique({ id: 's1', heureDebut: '09:00', heureFin: '10:00' });
  const seance2 = SeanceMother.recreation({ id: 's2', heureDebut: '10:00', heureFin: '10:30' });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    donneesService = TestBed.inject(DonneesService);
    donneesService.charger(
      DonneesMother.base({
        classe: { ...DonneesMother.base().classe, eleves: [EleveMother.base('e1', 'M', 'A')] },
        cahierJournal: [{ id: 'j1', date: dateTest, seances: [seance1, seance2] }],
      }),
    );
    fixture = TestBed.createComponent(EcranCahierJournalComponent);
    component = fixture.componentInstance;
    (component as any).dateSelectionnee.set(dateTest);
    fixture.detectChanges();
  });

  describe('seances (computed)', () => {
    it('retourne les séances triées par heure de début', () => {
      const seances = (component as any).seances() as Seance[];
      expect(seances).toHaveLength(2);
      expect(seances[0].heureDebut).toBe('09:00');
    });

    it('retourne [] si pas de journée à la date', () => {
      (component as any).dateSelectionnee.set('2000-01-01');
      fixture.detectChanges();

      expect((component as any).seances()).toEqual([]);
    });
  });

  describe('journeesAvecEntrees', () => {
    it('retourne les dates des journées présentes dans le CJ', () => {
      const journees = (component as any).journeesAvecEntrees() as string[];
      expect(journees).toContain(dateTest);
    });
  });

  describe('naviguerJour', () => {
    it("avance la date d'un jour", () => {
      (component as any).naviguerJour(1);

      const attendu = DateUtils.ajouterJours(dateTest, 1);
      expect((component as any).dateSelectionnee()).toBe(attendu);
    });

    it("recule la date d'une semaine", () => {
      (component as any).naviguerJour(-7);

      const attendu = DateUtils.ajouterJours(dateTest, -7);
      expect((component as any).dateSelectionnee()).toBe(attendu);
    });

    it('ferme le formulaire', () => {
      (component as any).enCreationSeance.set(true);

      (component as any).naviguerJour(1);

      expect((component as any).enCreationSeance()).toBe(false);
    });
  });

  describe('surChangementDate', () => {
    it('met à jour la date sélectionnée', () => {
      (component as any).surChangementDate('2026-09-01');

      expect((component as any).dateSelectionnee()).toBe('2026-09-01');
    });

    it('ferme le formulaire', () => {
      (component as any).enCreationSeance.set(true);

      (component as any).surChangementDate('2026-09-01');

      expect((component as any).enCreationSeance()).toBe(false);
    });
  });

  describe('creerSeance', () => {
    it('ouvre le formulaire de création', () => {
      (component as any).seanceEditee.set(seance1);

      (component as any).creerSeance();

      expect((component as any).enCreationSeance()).toBe(true);
      expect((component as any).seanceEditee()).toBeNull();
    });
  });

  describe('editerSeance', () => {
    it('passe la séance en mode édition', () => {
      (component as any).editerSeance(seance1);

      expect((component as any).seanceEditee()).toBe(seance1);
      expect((component as any).enCreationSeance()).toBe(false);
    });
  });

  describe('onEnregistrerSeance', () => {
    it('ajoute une nouvelle séance', () => {
      const nouvelle = SeanceMother.pedagogique({ id: 's99' });

      (component as any).onEnregistrerSeance(nouvelle);

      const journee = donneesService.donnees()?.cahierJournal.find((j) => j.date === dateTest);
      expect(journee?.seances.some((s) => s.id === 's99')).toBe(true);
    });

    it('modifie une séance existante', () => {
      const modifiee = { ...seance1, heureDebut: '08:00' };

      (component as any).onEnregistrerSeance(modifiee);

      const journee = donneesService.donnees()?.cahierJournal.find((j) => j.date === dateTest);
      expect(journee?.seances.find((s) => s.id === 's1')?.heureDebut).toBe('08:00');
    });

    it('ferme le formulaire après enregistrement', () => {
      (component as any).enCreationSeance.set(true);

      (component as any).onEnregistrerSeance(SeanceMother.pedagogique({ id: 's99' }));

      expect((component as any).enCreationSeance()).toBe(false);
    });
  });

  describe('supprimerSeance', () => {
    it('retire la séance du store', () => {
      (component as any).supprimerSeance('s1');

      const journee = donneesService.donnees()?.cahierJournal.find((j) => j.date === dateTest);
      expect(journee?.seances.some((s) => s.id === 's1')).toBe(false);
    });

    it('ferme le formulaire si la séance éditée est supprimée', () => {
      (component as any).seanceEditee.set(seance1);
      (component as any).enCreationSeance.set(false);

      (component as any).supprimerSeance('s1');

      expect((component as any).seanceEditee()).toBeNull();
    });
  });

  describe('demanderSuppressionJournee / confirmerSuppressionJournee / annulerSuppression', () => {
    it('demanderSuppressionJournee affiche la popin', () => {
      (component as any).demanderSuppressionJournee();

      expect((component as any).popinSupprimerVisible()).toBe(true);
    });

    it('confirmerSuppressionJournee supprime la journée', () => {
      (component as any).demanderSuppressionJournee();

      (component as any).confirmerSuppressionJournee();

      const journee = donneesService.donnees()?.cahierJournal.find((j) => j.date === dateTest);
      expect(journee).toBeUndefined();
      expect((component as any).popinSupprimerVisible()).toBe(false);
    });

    it('annulerSuppression ferme la popin sans supprimer', () => {
      (component as any).demanderSuppressionJournee();

      (component as any).annulerSuppression();

      expect((component as any).popinSupprimerVisible()).toBe(false);
      const journee = donneesService.donnees()?.cahierJournal.find((j) => j.date === dateTest);
      expect(journee).toBeDefined();
    });
  });

  describe('demanderDuplication / confirmerDuplication / annulerDuplication', () => {
    it('demanderDuplication ouvre la popin', () => {
      (component as any).demanderDuplication(null);

      expect((component as any).popinDuplicationVisible()).toBe(true);
      expect((component as any).seanceIdDuplication()).toBeNull();
    });

    it('confirmerDuplication sans date ne duplique pas', () => {
      (component as any).demanderDuplication(null);
      (component as any).dateDuplication.set('');

      (component as any).confirmerDuplication();

      expect((component as any).popinDuplicationVisible()).toBe(true);
    });

    it('confirmerDuplication journée avec date cible ferme la popin', () => {
      (component as any).demanderDuplication(null);
      (component as any).dateDuplication.set('2026-09-01');

      (component as any).confirmerDuplication();

      expect((component as any).popinDuplicationVisible()).toBe(false);
    });

    it('annulerDuplication ferme la popin', () => {
      (component as any).demanderDuplication(null);

      (component as any).annulerDuplication();

      expect((component as any).popinDuplicationVisible()).toBe(false);
    });
  });

  describe('fermerConflits', () => {
    it('ferme la popin de conflits et vide les conflits', () => {
      (component as any).conflits.set(['Conflit A']);
      (component as any).popinConflitsVisible.set(true);

      (component as any).fermerConflits();

      expect((component as any).popinConflitsVisible()).toBe(false);
      expect((component as any).conflits()).toEqual([]);
    });
  });

  describe('fermerFormulaire', () => {
    it('reset seanceEditee et enCreationSeance', () => {
      (component as any).seanceEditee.set(seance1);
      (component as any).enCreationSeance.set(true);

      (component as any).fermerFormulaire();

      expect((component as any).seanceEditee()).toBeNull();
      expect((component as any).enCreationSeance()).toBe(false);
    });
  });

  describe('dateFormatee', () => {
    it('retourne la date sélectionnée formatée en français long', () => {
      expect((component as any).dateFormatee()).toBe(DateUtils.formaterDateLong(dateTest));
    });
  });
});
