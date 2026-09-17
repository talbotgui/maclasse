import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { EcranCahierJournalComponent } from './ecran-cahier-journal.component';
import { DonneesService } from '../../services/avecEtat/donnees.service';
import { ContexteService } from '../../services/avecEtat/contexte.service';
import { CahierJournalService } from '../../services/sansEtat/cahier-journal.service';
import { DonneesMother } from '../../tests/donnees.mother';
import { SeanceMother } from '../../tests/cahier-journal.mother';
import { EleveMother } from '../../tests/eleve.mother';
import { DateUtils } from '../../utilitaires/date.utils';
import type { Seance } from '../../modeles/cahier-journal.modele';

describe('EcranCahierJournalComponent', () => {
  let fixture: ComponentFixture<EcranCahierJournalComponent>;
  let component: EcranCahierJournalComponent;
  let donneesService: DonneesService;

  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();
  });

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
    it('ouvre le formulaire de création à la position donnée', () => {
      (component as any).seanceEditeeId.set(seance1.id);

      (component as any).creerSeance(1);

      expect((component as any).enCreationSeance()).toBe(true);
      expect((component as any).seanceEditee()).toBeNull();
      expect((component as any).positionCreation()).toBe(1);
    });
  });

  describe('positionnement du formulaire de création', () => {
    it('affiche le formulaire de création avant la première séance à la position 0', () => {
      (component as any).creerSeance(0);
      fixture.detectChanges();

      const elements = Array.from(
        fixture.nativeElement.querySelectorAll('.cj__seance, cj-formulaire-seance'),
      ) as Element[];
      expect(elements.map((e) => e.tagName.toLowerCase())).toEqual([
        'cj-formulaire-seance',
        'article',
        'article',
      ]);
    });

    it('affiche le formulaire de création entre les deux séances à la position 1', () => {
      (component as any).creerSeance(1);
      fixture.detectChanges();

      const elements = Array.from(
        fixture.nativeElement.querySelectorAll('.cj__seance, cj-formulaire-seance'),
      ) as Element[];
      expect(elements.map((e) => e.tagName.toLowerCase())).toEqual([
        'article',
        'cj-formulaire-seance',
        'article',
      ]);
    });

    it('affiche le formulaire de création après la dernière séance à la position finale', () => {
      (component as any).creerSeance(2);
      fixture.detectChanges();

      const elements = Array.from(
        fixture.nativeElement.querySelectorAll('.cj__seance, cj-formulaire-seance'),
      ) as Element[];
      expect(elements.map((e) => e.tagName.toLowerCase())).toEqual([
        'article',
        'article',
        'cj-formulaire-seance',
      ]);
    });
  });

  describe('calculerHeuresParDefaut', () => {
    it('position 0 sans séance précédente → utilise l’heure de début de la journée scolaire', () => {
      const heures = (component as any).calculerHeuresParDefaut(0);

      expect(heures.heureDebut).toBe('08:30');
    });

    it('position en fin de liste sans séance suivante → utilise l’heure de fin de la journée scolaire', () => {
      const heures = (component as any).calculerHeuresParDefaut(2);

      expect(heures.heureFin).toBe('16:30');
    });

    it('position entre deux séances → comble l’écart entre la précédente et la suivante', () => {
      const heures = (component as any).calculerHeuresParDefaut(1);

      expect(heures.heureDebut).toBe(seance1.heureFin);
      expect(heures.heureFin).toBe(seance2.heureDebut);
    });
  });

  describe('heuresCreationParDefaut', () => {
    it('reflète calculerHeuresParDefaut à la position de création courante', () => {
      (component as any).creerSeance(0);

      expect((component as any).heuresCreationParDefaut()).toEqual(
        (component as any).calculerHeuresParDefaut(0),
      );
    });
  });

  describe('dateMinCalendrier / dateMaxCalendrier', () => {
    it('retournent null si aucune période n’est configurée', () => {
      expect((component as any).dateMinCalendrier()).toBeNull();
      expect((component as any).dateMaxCalendrier()).toBeNull();
    });

    it('retournent les bornes min/max des périodes configurées', () => {
      const base = DonneesMother.base();
      donneesService.charger(
        DonneesMother.base({
          referentiels: {
            ...base.referentiels,
            periodes: [
              { id: 'p1', nom: 'Trimestre 1', debut: '2025-09-01', fin: '2025-12-19' },
              { id: 'p2', nom: 'Trimestre 2', debut: '2026-01-05', fin: '2026-03-27' },
            ],
          },
        }),
      );
      fixture.detectChanges();

      expect((component as any).dateMinCalendrier()).toBe('2025-09-01');
      expect((component as any).dateMaxCalendrier()).toBe('2026-03-27');
    });
  });

  describe('editerSeance', () => {
    it('passe la séance en mode édition', () => {
      (component as any).editerSeance(seance1);

      expect((component as any).seanceEditee()).toEqual(seance1);
      expect((component as any).enCreationSeance()).toBe(false);
    });
  });

  describe('deplacerSeance', () => {
    it('régression SOU-037 : seanceEditee reflète l’échange d’heures d’une séance adjacente réordonnée', () => {
      (component as any).editerSeance(seance1);
      expect((component as any).seanceEditee().heureDebut).toBe('09:00');

      // Échange seance1 (index 0) avec seance2 (index 1) : seance1 prend les heures de seance2.
      (component as any).deplacerSeance(0, 1);

      expect((component as any).seanceEditee().id).toBe('s1');
      expect((component as any).seanceEditee().heureDebut).toBe('10:00');
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

    it('régression SOU-033 : marque conflitDetecte=true si un conflit est détecté', () => {
      donneesService.charger(
        DonneesMother.base({
          classe: {
            ...DonneesMother.base().classe,
            eleves: [
              EleveMother.base('e1', 'M', 'A', {
                absencesRecurrentes: [
                  {
                    id: 'ar1',
                    libelle: 'Orthophonie',
                    jour: 'lundi',
                    heureDebut: '09:00',
                    heureFin: '10:00',
                    paritesSemaine: 'lesDeux',
                  },
                ],
              }),
            ],
          },
          cahierJournal: [{ id: 'j1', date: dateTest, seances: [seance1, seance2] }],
        }),
      );
      (component as any).dateSelectionnee.set(dateTest);
      fixture.detectChanges();

      (component as any).onEnregistrerSeance(seance1);

      const journee = donneesService.donnees()?.cahierJournal.find((j) => j.date === dateTest);
      expect(journee?.seances.find((s) => s.id === 's1')?.conflitDetecte).toBe(true);
      expect((component as any).popinConflitsVisible()).toBe(true);
    });

    it('régression SOU-033 : marque conflitDetecte=false si aucun conflit', () => {
      (component as any).onEnregistrerSeance(seance1);

      const journee = donneesService.donnees()?.cahierJournal.find((j) => j.date === dateTest);
      expect(journee?.seances.find((s) => s.id === 's1')?.conflitDetecte).toBe(false);
    });
  });

  describe('afficherConflitsSeance', () => {
    it('recalcule et affiche les conflits pour une séance déjà marquée', () => {
      donneesService.charger(
        DonneesMother.base({
          classe: {
            ...DonneesMother.base().classe,
            eleves: [
              EleveMother.base('e1', 'M', 'A', {
                absencesRecurrentes: [
                  {
                    id: 'ar1',
                    libelle: 'Orthophonie',
                    jour: 'lundi',
                    heureDebut: '09:00',
                    heureFin: '10:00',
                    paritesSemaine: 'lesDeux',
                  },
                ],
              }),
            ],
          },
          cahierJournal: [
            { id: 'j1', date: dateTest, seances: [{ ...seance1, conflitDetecte: true }] },
          ],
        }),
      );
      (component as any).dateSelectionnee.set(dateTest);
      fixture.detectChanges();

      (component as any).afficherConflitsSeance({ ...seance1, conflitDetecte: true });

      expect((component as any).popinConflitsVisible()).toBe(true);
      expect((component as any).conflits()).toEqual(['M A — Orthophonie']);
    });
  });

  describe('supprimerSeance', () => {
    it('retire la séance du store', () => {
      (component as any).supprimerSeance('s1');

      const journee = donneesService.donnees()?.cahierJournal.find((j) => j.date === dateTest);
      expect(journee?.seances.some((s) => s.id === 's1')).toBe(false);
    });

    it('ferme le formulaire si la séance éditée est supprimée', () => {
      (component as any).seanceEditeeId.set(seance1.id);
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
      (component as any).seanceEditeeId.set(seance1.id);
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

  describe('notes de la journée', () => {
    it('affiche le titre de date dès qu’une journée existe, même sans séance', () => {
      donneesService.charger(
        DonneesMother.base({ cahierJournal: [{ id: 'j1', date: dateTest, seances: [] }] }),
      );
      fixture.detectChanges();

      const titre = fixture.nativeElement.querySelector('.cj__titre-journee');
      expect(titre?.textContent?.trim()).toBe(DateUtils.formaterDateLong(dateTest));
    });

    it('masque la zone de notes tant qu’aucune séance n’existe', () => {
      donneesService.charger(
        DonneesMother.base({ cahierJournal: [{ id: 'j1', date: dateTest, seances: [] }] }),
      );
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.cj__notes')).toBeNull();
    });

    it('affiche la zone de notes dès qu’une séance existe', () => {
      expect(fixture.nativeElement.querySelector('.cj__notes')).not.toBeNull();
    });

    it('notesJournee et notesControl reflètent les notes de la journée sélectionnée', () => {
      donneesService.charger(
        DonneesMother.base({
          cahierJournal: [
            { id: 'j1', date: dateTest, seances: [seance1], notes: 'Sortie piscine' },
          ],
        }),
      );
      fixture.detectChanges();

      expect((component as any).notesJournee()).toBe('Sortie piscine');
      expect((component as any).notesControl.value).toBe('Sortie piscine');
    });

    it('notesJournee est vide si la journée n’a pas de notes', () => {
      expect((component as any).notesJournee()).toBe('');
      expect((component as any).notesControl.value).toBe('');
    });

    it('notesControl se resynchronise au changement de date', () => {
      donneesService.charger(
        DonneesMother.base({
          cahierJournal: [
            { id: 'j1', date: dateTest, seances: [seance1], notes: 'Notes A' },
            {
              id: 'j2',
              date: DateUtils.ajouterJours(dateTest, 1),
              seances: [seance1],
              notes: 'Notes B',
            },
          ],
        }),
      );
      fixture.detectChanges();
      expect((component as any).notesControl.value).toBe('Notes A');

      (component as any).naviguerJour(1);
      fixture.detectChanges();

      expect((component as any).notesControl.value).toBe('Notes B');
    });

    it('enregistrerNotes délègue au service avec la date et la valeur courante', () => {
      const cahierJournalService = TestBed.inject(CahierJournalService);
      const spy = vi.spyOn(cahierJournalService, 'modifierNotesJournee');

      (component as any).notesControl.setValue('Réunion 17h');
      (component as any).enregistrerNotes();

      expect(spy).toHaveBeenCalledWith(dateTest, 'Réunion 17h');
    });

    it('persiste les notes saisies dans le store', () => {
      (component as any).notesControl.setValue('Prévoir les tablettes');
      (component as any).enregistrerNotes();

      const journee = donneesService.donnees()?.cahierJournal.find((j) => j.date === dateTest);
      expect(journee?.notes).toBe('Prévoir les tablettes');
    });

    it('conserve la zone de notes visible pour une journée sans séance mais avec des notes', () => {
      donneesService.charger(
        DonneesMother.base({
          cahierJournal: [{ id: 'j1', date: dateTest, seances: [], notes: 'Mémo important' }],
        }),
      );
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.cj__notes')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.cj__notes-impression')?.textContent).toContain(
        'Mémo important',
      );
    });
  });

  describe('confirmerNavigation (garde de navigation)', () => {
    it('retourne true immédiatement si aucun formulaire de séance n’est ouvert', async () => {
      expect(await component.confirmerNavigation()).toBe(true);
    });

    it('retourne true immédiatement si le formulaire ouvert n’a pas été modifié', async () => {
      (component as any).creerSeance(0);
      fixture.detectChanges();

      expect(await component.confirmerNavigation()).toBe(true);
    });

    it('ouvre la popin d’avertissement si le formulaire a été modifié, et confirme la navigation', async () => {
      (component as any).creerSeance(0);
      fixture.detectChanges();
      const formulaire = (component as any).formulaireSeance();
      formulaire.form.controls.titre.markAsDirty();
      fixture.detectChanges();

      const promesse = component.confirmerNavigation();
      fixture.detectChanges();
      expect((component as any).popinNavigationVisible()).toBe(true);

      (component as any).confirmerAbandonNavigation();
      expect(await promesse).toBe(true);
      expect((component as any).popinNavigationVisible()).toBe(false);
    });

    it('annule la navigation et laisse le formulaire ouvert si l’utilisateur refuse', async () => {
      (component as any).creerSeance(0);
      fixture.detectChanges();
      const formulaire = (component as any).formulaireSeance();
      formulaire.form.controls.titre.markAsDirty();
      fixture.detectChanges();

      const promesse = component.confirmerNavigation();
      (component as any).annulerAbandonNavigation();

      expect(await promesse).toBe(false);
      expect((component as any).enCreationSeance()).toBe(true);
    });
  });

  describe('jourCourantCahierJournal (ContexteService) — SOU-015', () => {
    it('initialise dateSelectionnee depuis ContexteService.jourCourantCahierJournal si déjà renseigné', () => {
      const contexteService = TestBed.inject(ContexteService);
      contexteService.jourCourantCahierJournal.set('2026-03-02');

      const fixtureDediee = TestBed.createComponent(EcranCahierJournalComponent);

      expect((fixtureDediee.componentInstance as any).dateSelectionnee()).toBe('2026-03-02');
    });

    it('répercute tout changement de dateSelectionnee vers ContexteService.jourCourantCahierJournal', () => {
      const contexteService = TestBed.inject(ContexteService);

      (component as any).dateSelectionnee.set('2026-04-10');
      fixture.detectChanges();

      expect(contexteService.jourCourantCahierJournal()).toBe('2026-04-10');
    });
  });
});
