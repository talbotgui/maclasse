import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { EcranEmploiDuTempsComponent } from './ecran-emploi-du-temps.component';
import { DonneesService } from '../../services/avecEtat/donnees.service';
import { DonneesMother } from '../../tests/donnees.mother';
import { EdtMother, CreneauMother } from '../../tests/emploi-du-temps.mother';
import { EleveMother, AbsenceRecurrenteMother } from '../../tests/eleve.mother';
import type { EmploiDuTemps, CreneauEdt } from '../../modeles/emploi-du-temps.modele';

describe('EcranEmploiDuTempsComponent', () => {
  let fixture: ComponentFixture<EcranEmploiDuTempsComponent>;
  let component: EcranEmploiDuTempsComponent;
  let donneesService: DonneesService;

  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();
  });

  const creneauLundi = CreneauMother.lundi9h10({ id: 'c1' });
  const edtBase = EdtMother.base({ id: 'edt1', creneaux: [creneauLundi] });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    donneesService = TestBed.inject(DonneesService);
    donneesService.charger(DonneesMother.base({ emploisDuTemps: [edtBase] }));
    fixture = TestBed.createComponent(EcranEmploiDuTempsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('edts', () => {
    it('retourne les EDT depuis le store', () => {
      const edts = (component as any).edts() as EmploiDuTemps[];
      expect(edts).toHaveLength(1);
      expect(edts[0].id).toBe('edt1');
    });
  });

  describe('titre de la liste des EDT', () => {
    it('affiche le titre "Mes emplois du temps" quand la liste est remplie', () => {
      const titre = fixture.nativeElement.querySelector('.edt__gauche .edt__titre-section');
      expect(titre?.textContent?.trim()).toBe('Mes emplois du temps');
    });

    it('affiche le titre "Mes emplois du temps" quand la liste est vide', () => {
      donneesService.charger(DonneesMother.base({ emploisDuTemps: [] }));
      fixture.detectChanges();

      const titre = fixture.nativeElement.querySelector('.edt__gauche .edt__titre-section');
      expect(titre?.textContent?.trim()).toBe('Mes emplois du temps');
    });
  });

  describe('selectionnerEdt', () => {
    it('met à jour edtSelectionne, formEdt et reset creneauEdite', () => {
      (component as any).creneauEdite.set(creneauLundi);

      (component as any).selectionnerEdt(edtBase);

      expect((component as any).edtSelectionne()).toBe(edtBase);
      expect((component as any).formEdt()).toBe(edtBase);
      expect((component as any).creneauEdite()).toBeNull();
    });
  });

  describe('creerEdt', () => {
    it('réinitialise edtSelectionne et crée un formEdt vide', () => {
      (component as any).edtSelectionne.set(edtBase);

      (component as any).creerEdt();

      expect((component as any).edtSelectionne()).toBeNull();
      expect((component as any).formEdt()).not.toBeNull();
      expect((component as any).formEdt()!.nom).toBe('');
      expect((component as any).creneauEdite()).toBeNull();
    });
  });

  describe('selectionnerCreneau', () => {
    it('met creneauEdite et reset formEdt', () => {
      (component as any).formEdt.set(edtBase);

      (component as any).selectionnerCreneau(creneauLundi);

      expect((component as any).formEdt()).toBeNull();
      expect((component as any).creneauEdite()).toBe(creneauLundi);
    });
  });

  describe('ajouterCreneauPourJour', () => {
    it('initialise à 08:00/09:00 si le jour est vide', () => {
      (component as any).ajouterCreneauPourJour('mardi');

      const creneau = (component as any).creneauEdite() as CreneauEdt;
      expect(creneau.jour).toBe('mardi');
      expect(creneau.temps[0].heureDebut).toBe('08:00');
      expect(creneau.temps[0].heureFin).toBe('09:00');
      expect((component as any).formEdt()).toBeNull();
    });

    it('initialise heureDebut à la heureFin du dernier créneau du jour', () => {
      (component as any).edtSelectionne.set(edtBase);
      fixture.detectChanges();

      (component as any).ajouterCreneauPourJour('lundi');

      const creneau = (component as any).creneauEdite() as CreneauEdt;
      expect(creneau.jour).toBe('lundi');
      expect(creneau.temps[0].heureDebut).toBe('10:00');
      expect(creneau.temps[0].heureFin).toBe('11:00');
    });

    it('prend la heureFin la plus tardive si plusieurs créneaux existent pour le jour', () => {
      const edt = EdtMother.base({
        id: 'edt2',
        creneaux: [
          CreneauMother.avecHoraire('08:00', '09:00', { id: 'ca' }),
          CreneauMother.avecHoraire('11:00', '12:30', { id: 'cb' }),
          CreneauMother.avecHoraire('09:30', '10:30', { id: 'cc' }),
        ],
      });
      (component as any).edtSelectionne.set(edt);
      fixture.detectChanges();

      (component as any).ajouterCreneauPourJour('lundi');

      const creneau = (component as any).creneauEdite() as CreneauEdt;
      expect(creneau.temps[0].heureDebut).toBe('12:30');
      expect(creneau.temps[0].heureFin).toBe('13:30');
    });
  });

  describe('lignesGrille', () => {
    it("retourne les plages horaires uniques de l'EDT sélectionné", () => {
      (component as any).edtSelectionne.set(edtBase);
      fixture.detectChanges();

      const lignes = (component as any).lignesGrille();
      expect(lignes).toHaveLength(1);
      expect(lignes[0].heureDebut).toBe('09:00');
    });

    it("retourne [] si pas d'EDT sélectionné", () => {
      (component as any).edtSelectionne.set(null);
      fixture.detectChanges();

      expect((component as any).lignesGrille()).toEqual([]);
    });
  });

  describe('obtenirTempsDeGrille', () => {
    beforeEach(() => {
      (component as any).edtSelectionne.set(edtBase);
      fixture.detectChanges();
    });

    it('retourne le créneau correspondant', () => {
      const result = (component as any).obtenirTempsDeGrille('lundi', {
        heureDebut: '09:00',
        heureFin: '10:00',
      });
      expect(result).toHaveLength(1);
      expect(result[0].creneau.id).toBe('c1');
    });

    it('retourne [] pour une cellule vide', () => {
      const result = (component as any).obtenirTempsDeGrille('mardi', {
        heureDebut: '09:00',
        heureFin: '10:00',
      });
      expect(result).toEqual([]);
    });
  });

  describe('onEdtEnregistre', () => {
    it("crée un EDT s'il n'existe pas encore", () => {
      const nouvelEdt = EdtMother.base({ id: 'edt99', nom: 'Nouveau' });

      (component as any).onEdtEnregistre(nouvelEdt);

      const edts = donneesService.donnees()?.emploisDuTemps ?? [];
      expect(edts.some((e) => e.id === 'edt99')).toBe(true);
    });

    it('modifie un EDT existant', () => {
      (component as any).edtSelectionne.set(edtBase);
      fixture.detectChanges();
      const modifie = EdtMother.base({ id: 'edt1', nom: 'Modifié' });

      (component as any).onEdtEnregistre(modifie);

      const edts = donneesService.donnees()?.emploisDuTemps ?? [];
      expect(edts.find((e) => e.id === 'edt1')?.nom).toBe('Modifié');
    });
  });

  describe('onEdtSupprime', () => {
    it("supprime l'EDT sélectionné et réinitialise l'interface", () => {
      (component as any).edtSelectionne.set(edtBase);
      fixture.detectChanges();

      (component as any).onEdtSupprime();

      const edts = donneesService.donnees()?.emploisDuTemps ?? [];
      expect(edts.some((e) => e.id === 'edt1')).toBe(false);
      expect((component as any).edtSelectionne()).toBeNull();
      expect((component as any).formEdt()).toBeNull();
    });
  });

  describe('onCreneauEnregistre', () => {
    it("ne fait rien si pas d'EDT sélectionné", () => {
      (component as any).edtSelectionne.set(null);

      expect(() => (component as any).onCreneauEnregistre(creneauLundi)).not.toThrow();
    });

    it("ajoute un créneau nouveau dans l'EDT sélectionné", () => {
      (component as any).edtSelectionne.set(edtBase);
      fixture.detectChanges();
      const nouveauCreneau = CreneauMother.avecHoraire('11:00', '12:00', { id: 'c99' });

      (component as any).onCreneauEnregistre(nouveauCreneau);

      const edtApres = donneesService.donnees()?.emploisDuTemps.find((e) => e.id === 'edt1');
      expect(edtApres?.creneaux.some((c) => c.id === 'c99')).toBe(true);
    });

    it('déplace un créneau existant vers un autre jour', () => {
      (component as any).edtSelectionne.set(edtBase);
      fixture.detectChanges();
      const creneauDeplace: CreneauEdt = { ...creneauLundi, jour: 'mardi' };

      (component as any).onCreneauEnregistre(creneauDeplace);
      fixture.detectChanges();

      expect(
        (component as any).obtenirTempsDeGrille('mardi', {
          heureDebut: '09:00',
          heureFin: '10:00',
        })[0]?.creneau.id,
      ).toBe('c1');
      expect(
        (component as any).obtenirTempsDeGrille('lundi', {
          heureDebut: '09:00',
          heureFin: '10:00',
        }),
      ).toEqual([]);
    });
  });

  describe('edtsAvecConflits après déplacement de créneau', () => {
    it('signale un conflit créé par le déplacement vers un jour/horaire occupé par un autre EDT', () => {
      const edtA = EdtMother.base({
        id: 'edtA',
        creneaux: [CreneauMother.lundi9h10({ id: 'ca', jour: 'mardi' })],
      });
      const edtB = EdtMother.base({
        id: 'edtB',
        creneaux: [CreneauMother.lundi9h10({ id: 'cb', jour: 'lundi' })],
      });
      donneesService.charger(DonneesMother.base({ emploisDuTemps: [edtA, edtB] }));
      (component as any).edtSelectionne.set(edtB);
      fixture.detectChanges();
      expect((component as any).edtsAvecConflits().has('edtB')).toBe(false);

      (component as any).onCreneauEnregistre({ ...edtB.creneaux[0], jour: 'mardi' });
      fixture.detectChanges();

      expect((component as any).edtsAvecConflits().has('edtB')).toBe(true);
    });

    it('résout un conflit existant en déplaçant un créneau vers un jour libre chez les autres EDT', () => {
      const edtA = EdtMother.base({
        id: 'edtA',
        creneaux: [CreneauMother.lundi9h10({ id: 'ca', jour: 'lundi' })],
      });
      const edtB = EdtMother.base({
        id: 'edtB',
        creneaux: [CreneauMother.lundi9h10({ id: 'cb', jour: 'lundi' })],
      });
      donneesService.charger(DonneesMother.base({ emploisDuTemps: [edtA, edtB] }));
      (component as any).edtSelectionne.set(edtB);
      fixture.detectChanges();
      expect((component as any).edtsAvecConflits().has('edtB')).toBe(true);

      (component as any).onCreneauEnregistre({ ...edtB.creneaux[0], jour: 'mardi' });
      fixture.detectChanges();

      expect((component as any).edtsAvecConflits().has('edtB')).toBe(false);
    });
  });

  describe('onCreneauSupprime', () => {
    it("ne fait rien si pas d'EDT sélectionné", () => {
      (component as any).edtSelectionne.set(null);

      expect(() => (component as any).onCreneauSupprime('c1')).not.toThrow();
    });

    it("supprime le créneau de l'EDT sélectionné", () => {
      (component as any).edtSelectionne.set(edtBase);
      fixture.detectChanges();

      (component as any).onCreneauSupprime('c1');

      const edtApres = donneesService.donnees()?.emploisDuTemps.find((e) => e.id === 'edt1');
      expect(edtApres?.creneaux.some((c) => c.id === 'c1')).toBe(false);
    });
  });

  describe('onAnnule', () => {
    it('ferme le formulaire créneau et réaffiche formEdt', () => {
      (component as any).edtSelectionne.set(edtBase);
      (component as any).creneauEdite.set(creneauLundi);
      (component as any).formEdt.set(null);

      (component as any).onAnnule();

      expect((component as any).creneauEdite()).toBeNull();
      expect((component as any).formEdt()).toBeNull();
    });
  });

  describe('confirmerNavigation (garde de navigation)', () => {
    it('retourne true immédiatement si aucun formulaire n’est ouvert', async () => {
      expect(await component.confirmerNavigation()).toBe(true);
    });

    it('retourne true immédiatement si le formulaire ouvert n’a pas été modifié', async () => {
      (component as any).selectionnerEdt(edtBase);
      fixture.detectChanges();

      expect(await component.confirmerNavigation()).toBe(true);
    });

    it('ouvre la popin d’avertissement si le formulaire a été modifié, et confirme la navigation', async () => {
      (component as any).selectionnerEdt(edtBase);
      fixture.detectChanges();
      const formulaire = (component as any).formulaireEdt();
      formulaire.formEdt.nom = 'Nom modifié';

      const promesse = component.confirmerNavigation();
      fixture.detectChanges();
      expect((component as any).popinNavigationVisible()).toBe(true);

      (component as any).confirmerAbandonNavigation();
      expect(await promesse).toBe(true);
      expect((component as any).popinNavigationVisible()).toBe(false);
    });

    it('annule la navigation si l’utilisateur refuse', async () => {
      (component as any).selectionnerEdt(edtBase);
      fixture.detectChanges();
      const formulaire = (component as any).formulaireEdt();
      formulaire.formEdt.nom = 'Nom modifié';

      const promesse = component.confirmerNavigation();
      (component as any).annulerAbandonNavigation();

      expect(await promesse).toBe(false);
    });
  });

  describe('afficherConflitsEdt / fermerConflitsEdt', () => {
    it('affiche les EDT en conflit avec des messages préfixés', () => {
      const edtConflit = EdtMother.base({
        id: 'edt2',
        nom: 'EDT en conflit',
        creneaux: [CreneauMother.lundi9h10({ id: 'c2' })],
      });
      donneesService.charger(DonneesMother.base({ emploisDuTemps: [edtBase, edtConflit] }));
      fixture.detectChanges();

      (component as any).afficherConflitsEdt(edtBase);

      expect((component as any).popinConflitsEdtVisible()).toBe(true);
      expect((component as any).conflitsEdt()).toEqual(['Chevauche : EDT en conflit']);
    });

    it('fermerConflitsEdt masque la popin et vide les conflits', () => {
      (component as any).popinConflitsEdtVisible.set(true);
      (component as any).conflitsEdt.set(['Chevauche : X']);

      (component as any).fermerConflitsEdt();

      expect((component as any).popinConflitsEdtVisible()).toBe(false);
      expect((component as any).conflitsEdt()).toEqual([]);
    });

    it('régression relecture : le bouton d’icône de conflit reste atteignable au clavier (pas de tabindex=-1 forcé)', () => {
      const edtConflit = EdtMother.base({
        id: 'edt2',
        nom: 'EDT en conflit',
        creneaux: [CreneauMother.lundi9h10({ id: 'c2' })],
      });
      donneesService.charger(DonneesMother.base({ emploisDuTemps: [edtBase, edtConflit] }));
      fixture.detectChanges();

      const boutonConflit = fixture.nativeElement.querySelector(
        '#btnConflitEdt' + edtBase.id,
      ) as HTMLButtonElement;

      expect(boutonConflit).not.toBeNull();
      expect(boutonConflit.getAttribute('tabindex')).toBeNull();

      boutonConflit.click();
      expect((component as any).popinConflitsEdtVisible()).toBe(true);
    });
  });

  describe('absencesPertinentes', () => {
    it('retourne [] quand aucun EDT n’est sélectionné', () => {
      expect((component as any).absencesPertinentes()).toEqual([]);
    });

    it('retourne les absences pertinentes pour l’EDT sélectionné', () => {
      const absence = AbsenceRecurrenteMother.base();
      const eleve = EleveMother.base('e1', 'MARTIN', 'Paul', {
        absencesRecurrentes: [absence],
      });
      donneesService.charger(DonneesMother.avecEleves([eleve], { emploisDuTemps: [edtBase] }));
      fixture.detectChanges();

      (component as any).selectionnerEdt(edtBase);

      expect((component as any).absencesPertinentes()).toEqual([{ eleve, absence }]);
    });

    it('exclut les absences dont la parité est incompatible avec l’EDT sélectionné', () => {
      const eleve = EleveMother.base('e1', 'MARTIN', 'Paul', {
        absencesRecurrentes: [AbsenceRecurrenteMother.base({ paritesSemaine: 'impaire' })],
      });
      const edtPaire = EdtMother.base({
        id: 'edtPaire',
        frequence: 'paire',
        creneaux: [CreneauMother.lundi9h10({ id: 'cPaire' })],
      });
      donneesService.charger(DonneesMother.avecEleves([eleve], { emploisDuTemps: [edtPaire] }));
      fixture.detectChanges();

      (component as any).selectionnerEdt(edtPaire);

      expect((component as any).absencesPertinentes()).toEqual([]);
    });

    it('n’affiche pas le bandeau quand aucun EDT n’est sélectionné', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.edt__bandeau-absences')).toBeNull();
    });

    it('affiche le bandeau avec les absences pertinentes quand l’EDT sélectionné en a', () => {
      const eleve = EleveMother.base('e1', 'MARTIN', 'Paul', {
        absencesRecurrentes: [AbsenceRecurrenteMother.base()],
      });
      donneesService.charger(DonneesMother.avecEleves([eleve], { emploisDuTemps: [edtBase] }));
      fixture.detectChanges();
      (component as any).selectionnerEdt(edtBase);
      fixture.detectChanges();

      const bandeau = fixture.nativeElement.querySelector('.edt__bandeau-absences');
      expect(bandeau).not.toBeNull();
      expect(bandeau.textContent).toContain('MARTIN Paul');
      expect(bandeau.textContent).toContain('Orthophonie');
    });
  });

  describe('creneauxAvecConflits / afficherConflitsAbsences / fermerConflitsAbsences', () => {
    it('retourne un ensemble vide quand aucun EDT n’est sélectionné', () => {
      expect((component as any).creneauxAvecConflits()).toEqual(new Set());
    });

    it('identifie les créneaux en conflit avec une absence élève', () => {
      const eleve = EleveMother.base('e1', 'MARTIN', 'Paul', {
        absencesRecurrentes: [AbsenceRecurrenteMother.base()],
      });
      donneesService.charger(DonneesMother.avecEleves([eleve], { emploisDuTemps: [edtBase] }));
      fixture.detectChanges();

      (component as any).selectionnerEdt(edtBase);

      expect((component as any).creneauxAvecConflits()).toEqual(new Set(['c1']));
    });

    it('affiche les conflits du créneau et arrête la propagation du clic', () => {
      const eleve = EleveMother.base('e1', 'MARTIN', 'Paul', {
        absencesRecurrentes: [AbsenceRecurrenteMother.base()],
      });
      donneesService.charger(DonneesMother.avecEleves([eleve], { emploisDuTemps: [edtBase] }));
      fixture.detectChanges();
      (component as any).selectionnerEdt(edtBase);

      const stopPropagation = vi.fn();
      (component as any).afficherConflitsAbsences(creneauLundi, { stopPropagation });

      expect(stopPropagation).toHaveBeenCalled();
      expect((component as any).popinConflitsAbsencesVisible()).toBe(true);
      expect((component as any).conflitsAbsences()).toEqual(['MARTIN Paul — Orthophonie']);
    });

    it('fermerConflitsAbsences masque la popin et vide les conflits', () => {
      (component as any).popinConflitsAbsencesVisible.set(true);
      (component as any).conflitsAbsences.set(['MARTIN Paul — Orthophonie']);

      (component as any).fermerConflitsAbsences();

      expect((component as any).popinConflitsAbsencesVisible()).toBe(false);
      expect((component as any).conflitsAbsences()).toEqual([]);
    });

    it('affiche le bouton icône de conflit uniquement sur les créneaux concernés', () => {
      const eleve = EleveMother.base('e1', 'MARTIN', 'Paul', {
        absencesRecurrentes: [AbsenceRecurrenteMother.base()],
      });
      donneesService.charger(DonneesMother.avecEleves([eleve], { emploisDuTemps: [edtBase] }));
      fixture.detectChanges();
      (component as any).selectionnerEdt(edtBase);
      fixture.detectChanges();

      const boutonConflit = fixture.nativeElement.querySelector(
        '#btnConflitCreneau' + creneauLundi.id + creneauLundi.temps[0].id,
      ) as HTMLButtonElement;
      expect(boutonConflit).not.toBeNull();

      boutonConflit.click();
      expect((component as any).popinConflitsAbsencesVisible()).toBe(true);
    });

    it('n’affiche pas le bouton icône de conflit quand il n’y a pas de conflit', () => {
      fixture.detectChanges();
      (component as any).selectionnerEdt(edtBase);
      fixture.detectChanges();

      const boutonConflit = fixture.nativeElement.querySelector(
        '#btnConflitCreneau' + creneauLundi.id + creneauLundi.temps[0].id,
      );
      expect(boutonConflit).toBeNull();
    });
  });

  describe('naviguerListeEdt (roving tabindex)', () => {
    beforeEach(() => {
      const edt2 = EdtMother.base({ id: 'edt2', nom: 'Deuxième EDT', creneaux: [] });
      donneesService.charger(DonneesMother.base({ emploisDuTemps: [edtBase, edt2] }));
      fixture.detectChanges();
    });

    const boutonsEdt = () =>
      Array.from(fixture.nativeElement.querySelectorAll('.edt__btn-edt')) as HTMLButtonElement[];

    const liste = () => fixture.nativeElement.querySelector('.edt__liste') as HTMLUListElement;

    it('ArrowDown déplace le focus sur l’EDT suivant', () => {
      boutonsEdt()[0].focus();

      liste().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      fixture.detectChanges();

      expect(document.activeElement).toBe(boutonsEdt()[1]);
      expect((component as any).indexEdtFocalise()).toBe(1);
    });

    it('End puis Home ramène au premier EDT', () => {
      boutonsEdt()[0].focus();
      liste().dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
      fixture.detectChanges();
      expect(document.activeElement).toBe(boutonsEdt()[1]);

      liste().dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
      fixture.detectChanges();

      expect(document.activeElement).toBe(boutonsEdt()[0]);
    });

    it('ArrowUp depuis le premier EDT ne déplace pas le focus', () => {
      boutonsEdt()[0].focus();

      liste().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
      fixture.detectChanges();

      expect(document.activeElement).toBe(boutonsEdt()[0]);
    });
  });

  describe('redemanderFocusFormulaire (SOU-023)', () => {
    it('pulse focusDemandeFormulaire à false puis true lors d’une nouvelle sélection', async () => {
      (component as any).selectionnerEdt(edtBase);

      expect((component as any).focusDemandeFormulaire()).toBe(false);

      await new Promise((resolve) => setTimeout(resolve));

      expect((component as any).focusDemandeFormulaire()).toBe(true);
    });
  });
});
