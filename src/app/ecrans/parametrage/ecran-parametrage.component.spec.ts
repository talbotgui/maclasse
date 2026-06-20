import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { EcranParametrageComponent } from './ecran-parametrage.component';
import { DonneesService } from '../../services/avecEtat/donnees.service';
import { DonneesMother } from '../../tests/donnees.mother';

describe('EcranParametrageComponent', () => {
  let fixture: ComponentFixture<EcranParametrageComponent>;
  let component: EcranParametrageComponent;
  let donneesService: DonneesService;

  const donnees = DonneesMother.base({
    enseignant: { prenom: 'Marie', nom: 'DUPONT', annee: '2025-2026' },
    classe: { ...DonneesMother.base().classe, niveau: 'CM2' },
    referentiels: {
      ...DonneesMother.base().referentiels,
      periodes: [{ id: 'p1', nom: 'Période 1', debut: '2025-09-01', fin: '2025-10-31' }],
      groupes: [{ id: 'GA', libelle: 'Groupe A' }],
      configEmploiDuTemps: { joursOuvres: ['lundi', 'mardi', 'mercredi'], heureDebutJournee: '08:00', heureFinJournee: '16:30' },
    },
    configuration: { delaiSauvegardeAutoMinutes: 5 },
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    donneesService = TestBed.inject(DonneesService);
    donneesService.charger(donnees);
    fixture = TestBed.createComponent(EcranParametrageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('activerSection', () => {
    it('met à jour la section active', () => {
      (component as any).activerSection('periodes');

      expect((component as any).sectionActive()).toBe('periodes');
    });

    it('réinitialise les copies locales selon la section activée', () => {
      (component as any).activerSection('periodes');
      fixture.detectChanges();

      const periodes = (component as any).copiePeriodes();
      expect(periodes).toHaveLength(1);
      expect(periodes[0].id).toBe('p1');
    });
  });

  describe('section enseignantClasse', () => {
    beforeEach(() => {
      (component as any).activerSection('enseignantClasse');
      fixture.detectChanges();
    });

    it('formEnseignantClasse chargé depuis le store', () => {
      expect((component as any).formEnseignantClasse.prenom).toBe('Marie');
      expect((component as any).formEnseignantClasse.niveauClasse).toBe('CM2');
    });

    it('enregistrerEnseignantClasse met à jour le store', () => {
      (component as any).formEnseignantClasse.prenom = 'Sophie';
      (component as any).formEnseignantClasse.nom = 'MARTIN';
      (component as any).formEnseignantClasse.niveauClasse = 'CM1';

      (component as any).enregistrerEnseignantClasse();

      const d = donneesService.donnees();
      expect(d?.enseignant.prenom).toBe('Sophie');
      expect(d?.classe.niveau).toBe('CM1');
    });

    it('annulerEnseignantClasse recharge depuis le store', () => {
      (component as any).formEnseignantClasse.prenom = 'Modifié';

      (component as any).annulerEnseignantClasse();

      expect((component as any).formEnseignantClasse.prenom).toBe('Marie');
    });
  });

  describe('section semaineHoraires', () => {
    beforeEach(() => {
      (component as any).activerSection('semaineHoraires');
      fixture.detectChanges();
    });

    it('formSemaineHoraires chargé depuis le store', () => {
      expect((component as any).formSemaineHoraires.joursOuvres).toContain('lundi');
    });

    it('enregistrerSemaineHoraires met à jour le store', () => {
      (component as any).formSemaineHoraires.joursOuvres = ['lundi', 'mardi'];

      (component as any).enregistrerSemaineHoraires();

      const d = donneesService.donnees();
      expect(d?.referentiels.configEmploiDuTemps.joursOuvres).toEqual(['lundi', 'mardi']);
    });

    it('basculerJourOuvre ajoute un jour dans l\'ordre canonique', () => {
      (component as any).formSemaineHoraires.joursOuvres = ['lundi'];

      (component as any).basculerJourOuvre('mercredi', true);

      expect((component as any).formSemaineHoraires.joursOuvres).toEqual(['lundi', 'mercredi']);
    });

    it('basculerJourOuvre retire un jour', () => {
      (component as any).formSemaineHoraires.joursOuvres = ['lundi', 'mercredi'];

      (component as any).basculerJourOuvre('lundi', false);

      expect((component as any).formSemaineHoraires.joursOuvres).not.toContain('lundi');
    });
  });

  describe('section préférences', () => {
    beforeEach(() => {
      (component as any).activerSection('preferences');
      fixture.detectChanges();
    });

    it('formPreferences chargé depuis le store', () => {
      expect((component as any).formPreferences.delaiSauvegardeAutoMinutes).toBe(5);
    });

    it('enregistrerPreferences met à jour le store', () => {
      (component as any).formPreferences.delaiSauvegardeAutoMinutes = 10;

      (component as any).enregistrerPreferences();

      expect(donneesService.donnees()?.configuration.delaiSauvegardeAutoMinutes).toBe(10);
    });

    it('annulerPreferences recharge depuis le store', () => {
      (component as any).formPreferences.delaiSauvegardeAutoMinutes = 99;

      (component as any).annulerPreferences();

      expect((component as any).formPreferences.delaiSauvegardeAutoMinutes).toBe(5);
    });
  });

  describe('section périodes', () => {
    beforeEach(() => {
      (component as any).activerSection('periodes');
      fixture.detectChanges();
    });

    it('ajouterPeriode ajoute une période vide', () => {
      (component as any).ajouterPeriode();

      expect((component as any).copiePeriodes()).toHaveLength(2);
      expect((component as any).copiePeriodes()[1].nom).toBe('');
    });

    it('enregistrerPeriode modifie une période existante', () => {
      (component as any).copiePeriodes.update((l: any[]) => {
        const clone = [...l];
        clone[0] = { ...clone[0], nom: 'Modifié' };
        return clone;
      });

      (component as any).enregistrerPeriode(0);

      expect(donneesService.donnees()?.referentiels.periodes[0].nom).toBe('Modifié');
    });

    it('supprimerPeriode retire de la copie et du store', () => {
      const periode = (component as any).copiePeriodes()[0];

      (component as any).supprimerPeriode(periode);

      expect((component as any).copiePeriodes()).toHaveLength(0);
    });
  });

  describe('section groupes', () => {
    beforeEach(() => {
      (component as any).activerSection('groupes');
      fixture.detectChanges();
    });

    it('ajouterGroupe ajoute un groupe vide', () => {
      (component as any).ajouterGroupe();

      expect((component as any).copieGroupes()).toHaveLength(2);
    });

    it('enregistrerGroupe modifie un groupe existant', () => {
      (component as any).copieGroupes.update((l: any[]) => {
        const clone = [...l];
        clone[0] = { ...clone[0], libelle: 'Groupe Modifié' };
        return clone;
      });

      (component as any).enregistrerGroupe(0);

      expect(donneesService.donnees()?.referentiels.groupes[0].libelle).toBe('Groupe Modifié');
    });

    it('supprimerGroupe retire de la copie locale', () => {
      const groupe = (component as any).copieGroupes()[0];

      (component as any).supprimerGroupe(groupe);

      expect((component as any).copieGroupes()).toHaveLength(0);
    });
  });

  describe('section domainesCompetences', () => {
    const domaineN1 = { id: 'd1', libelle: 'Français', enfants: [{ id: 'd1-1', libelle: 'Lecture', enfants: [] }, { id: 'd1-2', libelle: 'Écriture', enfants: [] }] };

    beforeEach(() => {
      donneesService.charger(DonneesMother.base({
        ...donnees,
        referentiels: { ...donnees.referentiels, competences: [domaineN1] },
        configuration: { delaiSauvegardeAutoMinutes: 5 },
      }));
      fixture.detectChanges();
      (component as any).activerSection('domainesCompetences');
      fixture.detectChanges();
    });

    it('basculerDomaine active le N1 et ses enfants', () => {
      (component as any).copieDomainesActifs.set(new Set<string>());

      (component as any).basculerDomaine(domaineN1, true);

      const actifs = (component as any).copieDomainesActifs() as Set<string>;
      expect(actifs.has('d1')).toBe(true);
      expect(actifs.has('d1-1')).toBe(true);
      expect(actifs.has('d1-2')).toBe(true);
    });

    it('basculerDomaine désactive le N1 et ses enfants', () => {
      (component as any).copieDomainesActifs.set(new Set(['d1', 'd1-1', 'd1-2']));

      (component as any).basculerDomaine(domaineN1, false);

      const actifs = (component as any).copieDomainesActifs() as Set<string>;
      expect(actifs.has('d1')).toBe(false);
      expect(actifs.has('d1-1')).toBe(false);
    });

    it('basculerSousDomaine active un N2 individuellement', () => {
      (component as any).copieDomainesActifs.set(new Set<string>());

      (component as any).basculerSousDomaine(domaineN1, domaineN1.enfants[0], true);

      const actifs = (component as any).copieDomainesActifs() as Set<string>;
      expect(actifs.has('d1-1')).toBe(true);
    });

    it('basculerSousDomaine désactive un N2 depuis un N1 entier', () => {
      (component as any).copieDomainesActifs.set(new Set(['d1']));

      (component as any).basculerSousDomaine(domaineN1, domaineN1.enfants[0], false);

      const actifs = (component as any).copieDomainesActifs() as Set<string>;
      expect(actifs.has('d1')).toBe(false);
      expect(actifs.has('d1-1')).toBe(false);
      expect(actifs.has('d1-2')).toBe(true);
    });

    it('enregistrerDomainesCompetences sauvegarde la sélection', () => {
      (component as any).copieDomainesActifs.set(new Set(['d1-1']));

      (component as any).enregistrerDomainesCompetences();

      const actifs = donneesService.donnees()?.configuration.domainesActifs;
      expect(actifs).toContain('d1-1');
    });
  });
});
