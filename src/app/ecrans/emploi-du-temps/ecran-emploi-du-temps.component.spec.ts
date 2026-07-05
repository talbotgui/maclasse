import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { EcranEmploiDuTempsComponent } from './ecran-emploi-du-temps.component';
import { DonneesService } from '../../services/avecEtat/donnees.service';
import { DonneesMother } from '../../tests/donnees.mother';
import { EdtMother, CreneauMother } from '../../tests/emploi-du-temps.mother';
import type { EmploiDuTemps, CreneauEdt } from '../../modeles/emploi-du-temps.modele';

describe('EcranEmploiDuTempsComponent', () => {
  let fixture: ComponentFixture<EcranEmploiDuTempsComponent>;
  let component: EcranEmploiDuTempsComponent;
  let donneesService: DonneesService;

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
      expect(creneau.heureDebut).toBe('08:00');
      expect(creneau.heureFin).toBe('09:00');
      expect((component as any).formEdt()).toBeNull();
    });

    it('initialise heureDebut à la heureFin du dernier créneau du jour', () => {
      (component as any).edtSelectionne.set(edtBase);
      fixture.detectChanges();

      (component as any).ajouterCreneauPourJour('lundi');

      const creneau = (component as any).creneauEdite() as CreneauEdt;
      expect(creneau.jour).toBe('lundi');
      expect(creneau.heureDebut).toBe('10:00');
      expect(creneau.heureFin).toBe('11:00');
    });

    it('prend la heureFin la plus tardive si plusieurs créneaux existent pour le jour', () => {
      const edt = EdtMother.base({
        id: 'edt2',
        creneaux: [
          CreneauMother.lundi9h10({ id: 'ca', heureDebut: '08:00', heureFin: '09:00' }),
          CreneauMother.lundi9h10({ id: 'cb', heureDebut: '11:00', heureFin: '12:30' }),
          CreneauMother.lundi9h10({ id: 'cc', heureDebut: '09:30', heureFin: '10:30' }),
        ],
      });
      (component as any).edtSelectionne.set(edt);
      fixture.detectChanges();

      (component as any).ajouterCreneauPourJour('lundi');

      const creneau = (component as any).creneauEdite() as CreneauEdt;
      expect(creneau.heureDebut).toBe('12:30');
      expect(creneau.heureFin).toBe('13:30');
    });
  });

  describe('lignesGrille', () => {
    it('retourne les plages horaires uniques de l\'EDT sélectionné', () => {
      (component as any).edtSelectionne.set(edtBase);
      fixture.detectChanges();

      const lignes = (component as any).lignesGrille();
      expect(lignes).toHaveLength(1);
      expect(lignes[0].heureDebut).toBe('09:00');
    });

    it('retourne [] si pas d\'EDT sélectionné', () => {
      (component as any).edtSelectionne.set(null);
      fixture.detectChanges();

      expect((component as any).lignesGrille()).toEqual([]);
    });
  });

  describe('obtenirCreneauDeGrille', () => {
    beforeEach(() => {
      (component as any).edtSelectionne.set(edtBase);
      fixture.detectChanges();
    });

    it('retourne le créneau correspondant', () => {
      const result = (component as any).obtenirCreneauDeGrille('lundi', { heureDebut: '09:00', heureFin: '10:00' });
      expect(result?.id).toBe('c1');
    });

    it('retourne undefined pour une cellule vide', () => {
      const result = (component as any).obtenirCreneauDeGrille('mardi', { heureDebut: '09:00', heureFin: '10:00' });
      expect(result).toBeUndefined();
    });
  });

  describe('onEdtEnregistre', () => {
    it('crée un EDT s\'il n\'existe pas encore', () => {
      const nouvelEdt = EdtMother.base({ id: 'edt99', nom: 'Nouveau' });

      (component as any).onEdtEnregistre(nouvelEdt);

      const edts = donneesService.donnees()?.emploisDuTemps ?? [];
      expect(edts.some(e => e.id === 'edt99')).toBe(true);
    });

    it('modifie un EDT existant', () => {
      (component as any).edtSelectionne.set(edtBase);
      fixture.detectChanges();
      const modifie = EdtMother.base({ id: 'edt1', nom: 'Modifié' });

      (component as any).onEdtEnregistre(modifie);

      const edts = donneesService.donnees()?.emploisDuTemps ?? [];
      expect(edts.find(e => e.id === 'edt1')?.nom).toBe('Modifié');
    });
  });

  describe('onEdtSupprime', () => {
    it('supprime l\'EDT sélectionné et réinitialise l\'interface', () => {
      (component as any).edtSelectionne.set(edtBase);
      fixture.detectChanges();

      (component as any).onEdtSupprime();

      const edts = donneesService.donnees()?.emploisDuTemps ?? [];
      expect(edts.some(e => e.id === 'edt1')).toBe(false);
      expect((component as any).edtSelectionne()).toBeNull();
      expect((component as any).formEdt()).toBeNull();
    });
  });

  describe('onCreneauEnregistre', () => {
    it('ne fait rien si pas d\'EDT sélectionné', () => {
      (component as any).edtSelectionne.set(null);

      expect(() => (component as any).onCreneauEnregistre(creneauLundi)).not.toThrow();
    });

    it('ajoute un créneau nouveau dans l\'EDT sélectionné', () => {
      (component as any).edtSelectionne.set(edtBase);
      fixture.detectChanges();
      const nouveauCreneau = CreneauMother.lundi9h10({ id: 'c99', heureDebut: '11:00', heureFin: '12:00' });

      (component as any).onCreneauEnregistre(nouveauCreneau);

      const edtApres = donneesService.donnees()?.emploisDuTemps.find(e => e.id === 'edt1');
      expect(edtApres?.creneaux.some(c => c.id === 'c99')).toBe(true);
    });
  });

  describe('onCreneauSupprime', () => {
    it('ne fait rien si pas d\'EDT sélectionné', () => {
      (component as any).edtSelectionne.set(null);

      expect(() => (component as any).onCreneauSupprime('c1')).not.toThrow();
    });

    it('supprime le créneau de l\'EDT sélectionné', () => {
      (component as any).edtSelectionne.set(edtBase);
      fixture.detectChanges();

      (component as any).onCreneauSupprime('c1');

      const edtApres = donneesService.donnees()?.emploisDuTemps.find(e => e.id === 'edt1');
      expect(edtApres?.creneaux.some(c => c.id === 'c1')).toBe(false);
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
});
