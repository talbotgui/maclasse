import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { EcranParametrageComponent } from './ecran-parametrage.component';
import { DonneesService } from '../../services/avecEtat/donnees.service';
import { SauvegardeAutoService } from '../../services/sansEtat/sauvegarde-auto.service';
import { DonneesMother } from '../../tests/donnees.mother';
import { CompetenceMother } from '../../tests/competence.mother';

describe('EcranParametrageComponent', () => {
  let fixture: ComponentFixture<EcranParametrageComponent>;
  let component: EcranParametrageComponent;
  let donneesService: DonneesService;
  let sauvegardeAutoService: SauvegardeAutoService;

  const donnees = DonneesMother.base({
    enseignant: { prenom: 'Marie', nom: 'DUPONT', annee: '2025-2026' },
    classe: { ...DonneesMother.base().classe, niveau: 'CM2' },
    referentiels: {
      ...DonneesMother.base().referentiels,
      periodes: [{ id: 'p1', nom: 'Période 1', debut: '2025-09-01', fin: '2025-10-31' }],
      groupes: [{ id: 'GA', libelle: 'Groupe A' }],
      statutsAcquisition: [
        { id: 'A', glyphe: '✓', libelle: 'Acquis', couleur: '#000000', fond: '#ffffff' },
      ],
      statutsEleve: [{ id: 'DC', libelle: 'Dans la classe' }],
      typesContact: [{ id: 'P', libelle: 'Père' }],
      joursFeries: [{ id: 'jf1', nom: 'Toussaint', date: '2025-11-01' }],
      configEmploiDuTemps: {
        joursOuvres: ['lundi', 'mardi', 'mercredi'],
        heureDebutJournee: '08:00',
        heureFinJournee: '16:30',
      },
    },
    configuration: { delaiSauvegardeAutoMinutes: 5 },
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    donneesService = TestBed.inject(DonneesService);
    donneesService.charger(donnees);
    sauvegardeAutoService = TestBed.inject(SauvegardeAutoService);
    fixture = TestBed.createComponent(EcranParametrageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    sauvegardeAutoService.arreter();
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

    it("ajouterJourOuvre ajoute un jour dans l'ordre canonique", () => {
      (component as any).formSemaineHoraires.joursOuvres = ['lundi'];

      (component as any).ajouterJourOuvre('mercredi');

      expect((component as any).formSemaineHoraires.joursOuvres).toEqual(['lundi', 'mercredi']);
    });

    it('retirerJourOuvre retire un jour', () => {
      (component as any).formSemaineHoraires.joursOuvres = ['lundi', 'mercredi'];

      (component as any).retirerJourOuvre('lundi');

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

    describe('preferencesValides', () => {
      it('borne minimale (1) valide', () => {
        (component as any).formPreferences.delaiSauvegardeAutoMinutes = 1;

        expect((component as any).preferencesValides()).toBe(true);
      });

      it('borne maximale (60) valide', () => {
        (component as any).formPreferences.delaiSauvegardeAutoMinutes = 60;

        expect((component as any).preferencesValides()).toBe(true);
      });

      it('0 invalide (sous la borne minimale)', () => {
        (component as any).formPreferences.delaiSauvegardeAutoMinutes = 0;

        expect((component as any).preferencesValides()).toBe(false);
      });

      it('61 invalide (au-dessus de la borne maximale)', () => {
        (component as any).formPreferences.delaiSauvegardeAutoMinutes = 61;

        expect((component as any).preferencesValides()).toBe(false);
      });
    });

    describe('rendu du bouton Enregistrer (composition modifié || invalide)', () => {
      const saisir = (valeur: string) => {
        const input = fixture.nativeElement.querySelector(
          '#champDelaiSauvegarde-input',
        ) as HTMLInputElement;
        input.value = valeur;
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();
      };

      const btn = () =>
        fixture.nativeElement.querySelector('#btnEnregistrerPreferences') as HTMLButtonElement;

      it('modifié et valide → actif', () => {
        saisir('10');

        expect(btn().disabled).toBe(false);
      });

      it('modifié mais invalide → reste désactivé', () => {
        saisir('61');

        expect(btn().disabled).toBe(true);
      });

      it('non modifié (valeur initiale valide) → désactivé', () => {
        expect(btn().disabled).toBe(true);
      });
    });

    it('enregistrerPreferences ne modifie pas le store si le délai est hors bornes', () => {
      (component as any).formPreferences.delaiSauvegardeAutoMinutes = 61;

      (component as any).enregistrerPreferences();

      expect(donneesService.donnees()?.configuration.delaiSauvegardeAutoMinutes).toBe(5);
    });

    describe('relance du timer de sauvegarde automatique', () => {
      it('timer inactif → demarrer() non rappelé', () => {
        const spy = vi.spyOn(sauvegardeAutoService, 'demarrer');
        (component as any).formPreferences.delaiSauvegardeAutoMinutes = 10;

        (component as any).enregistrerPreferences();

        expect(spy).not.toHaveBeenCalled();
      });

      it('timer actif → demarrer() rappelé pour appliquer le nouveau délai', () => {
        sauvegardeAutoService.demarrer();
        const spy = vi.spyOn(sauvegardeAutoService, 'demarrer');
        (component as any).formPreferences.delaiSauvegardeAutoMinutes = 10;

        (component as any).enregistrerPreferences();

        expect(spy).toHaveBeenCalled();
      });
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
    const domaineN1 = CompetenceMother.domaineAvecSousDomaines();

    beforeEach(() => {
      donneesService.charger(
        DonneesMother.base({
          ...donnees,
          referentiels: { ...donnees.referentiels, competences: [domaineN1] },
          configuration: { delaiSauvegardeAutoMinutes: 5 },
        }),
      );
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

      (component as any).basculerSousDomaine(domaineN1, domaineN1.enfants![0], true);

      const actifs = (component as any).copieDomainesActifs() as Set<string>;
      expect(actifs.has('d1-1')).toBe(true);
    });

    it('basculerSousDomaine désactive un N2 depuis un N1 entier', () => {
      (component as any).copieDomainesActifs.set(new Set(['d1']));

      (component as any).basculerSousDomaine(domaineN1, domaineN1.enfants![0], false);

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

  describe('indicateur de modification', () => {
    describe('section enseignantClasse', () => {
      beforeEach(() => {
        (component as any).activerSection('enseignantClasse');
        fixture.detectChanges();
      });

      it('non modifié tant que le formulaire correspond au store', () => {
        expect((component as any).estEnseignantClasseModifie()).toBe(false);
      });

      it('modifié dès qu un champ diffère', () => {
        (component as any).formEnseignantClasse.prenom = 'Sophie';

        expect((component as any).estEnseignantClasseModifie()).toBe(true);
      });

      it('revient à non modifié après annulation', () => {
        (component as any).formEnseignantClasse.nom = 'AUTRE';
        (component as any).annulerEnseignantClasse();

        expect((component as any).estEnseignantClasseModifie()).toBe(false);
      });

      it('bouton Enregistrer désactivé et libellé Enregistré à l état initial', () => {
        const btn = fixture.nativeElement.querySelector(
          '#btnEnregistrerEnseignantClasse',
        ) as HTMLButtonElement;
        expect(btn.disabled).toBe(true);
        expect(btn.textContent?.trim()).toBe('Enregistré');
        expect(fixture.nativeElement.querySelector('.parametrage__pastille-modif')).toBeNull();
      });

      it('bouton actif, libellé Enregistrer et pastille visible après modification', () => {
        const input = fixture.nativeElement.querySelector(
          '#champPrenomEnseignant-input',
        ) as HTMLInputElement;
        input.value = 'Sophie';
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        const btn = fixture.nativeElement.querySelector(
          '#btnEnregistrerEnseignantClasse',
        ) as HTMLButtonElement;
        const btnAnnuler = fixture.nativeElement.querySelector(
          '#btnAnnulerEnseignantClasse',
        ) as HTMLButtonElement;
        expect(btn.disabled).toBe(false);
        expect(btn.textContent?.trim()).toBe('Enregistrer');
        expect(btnAnnuler.disabled).toBe(false);
        expect(fixture.nativeElement.querySelector('.parametrage__pastille-modif')).not.toBeNull();
      });

      it('repasse non modifié après enregistrement', () => {
        (component as any).formEnseignantClasse.prenom = 'Sophie';
        (component as any).enregistrerEnseignantClasse();
        fixture.detectChanges();

        expect((component as any).estEnseignantClasseModifie()).toBe(false);
      });
    });

    describe('section semaineHoraires', () => {
      beforeEach(() => {
        (component as any).activerSection('semaineHoraires');
        fixture.detectChanges();
      });

      it('non modifié à l état initial', () => {
        expect((component as any).estSemaineHorairesModifie()).toBe(false);
      });

      it('modifié quand une heure change', () => {
        (component as any).formSemaineHoraires.heureDebutJournee = '09:00';

        expect((component as any).estSemaineHorairesModifie()).toBe(true);
      });

      it('modifié quand la liste des jours ouvrés change', () => {
        (component as any).ajouterJourOuvre('jeudi');

        expect((component as any).estSemaineHorairesModifie()).toBe(true);
      });
    });

    describe('section préférences', () => {
      beforeEach(() => {
        (component as any).activerSection('preferences');
        fixture.detectChanges();
      });

      it('non modifié à l état initial', () => {
        expect((component as any).estPreferencesModifie()).toBe(false);
      });

      it('modifié quand le délai change', () => {
        (component as any).formPreferences.delaiSauvegardeAutoMinutes = 10;

        expect((component as any).estPreferencesModifie()).toBe(true);
      });

      it('régression SOU-039 : ressaisir la même valeur via le champ DOM ne signale pas de modification', () => {
        const champ = fixture.nativeElement.querySelector(
          '#champDelaiSauvegarde-input',
        ) as HTMLInputElement;

        champ.value = '5';
        champ.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        expect((component as any).formPreferences.delaiSauvegardeAutoMinutes).toBe(5);
        expect((component as any).estPreferencesModifie()).toBe(false);
      });
    });

    describe('section domainesCompetences', () => {
      const domaineN1 = CompetenceMother.domaineAvecSousDomaines();

      beforeEach(() => {
        donneesService.charger(
          DonneesMother.base({
            ...donnees,
            referentiels: { ...donnees.referentiels, competences: [domaineN1] },
            configuration: { delaiSauvegardeAutoMinutes: 5 },
          }),
        );
        fixture.detectChanges();
        (component as any).activerSection('domainesCompetences');
        fixture.detectChanges();
      });

      it('non modifié quand tout est actif (équivaut à la config vide)', () => {
        expect((component as any).estDomainesCompetencesModifie()).toBe(false);
      });

      it('modifié après désélection partielle', () => {
        (component as any).basculerSousDomaine(domaineN1, domaineN1.enfants![0], false);

        expect((component as any).estDomainesCompetencesModifie()).toBe(true);
      });

      it('revient à non modifié après annulation', () => {
        (component as any).basculerSousDomaine(domaineN1, domaineN1.enfants![0], false);
        (component as any).annulerDomainesCompetences();

        expect((component as any).estDomainesCompetencesModifie()).toBe(false);
      });
    });

    describe('sections liste', () => {
      const cas: Array<{
        section: string;
        detection: string;
        ajout: string;
        muter: () => void;
      }> = [
        {
          section: 'periodes',
          detection: 'estPeriodeLigneModifiee',
          ajout: 'ajouterPeriode',
          muter: () =>
            (component as any).copiePeriodes.update((l: any[]) => [
              { ...l[0], nom: 'Renommée' },
              ...l.slice(1),
            ]),
        },
        {
          section: 'groupes',
          detection: 'estGroupeLigneModifiee',
          ajout: 'ajouterGroupe',
          muter: () =>
            (component as any).copieGroupes.update((l: any[]) => [
              { ...l[0], libelle: 'Groupe B' },
              ...l.slice(1),
            ]),
        },
        {
          section: 'bareme',
          detection: 'estStatutAcquisitionLigneModifiee',
          ajout: 'ajouterStatutAcquisition',
          muter: () =>
            (component as any).copieBareme.update((l: any[]) => [
              { ...l[0], libelle: 'Autre' },
              ...l.slice(1),
            ]),
        },
        {
          section: 'statutsEleve',
          detection: 'estStatutEleveLigneModifiee',
          ajout: 'ajouterStatutEleve',
          muter: () =>
            (component as any).copieStatutsEleve.update((l: any[]) => [
              { ...l[0], libelle: 'Autre' },
              ...l.slice(1),
            ]),
        },
        {
          section: 'typesContact',
          detection: 'estTypeContactLigneModifiee',
          ajout: 'ajouterTypeContact',
          muter: () =>
            (component as any).copieTypesContact.update((l: any[]) => [
              { ...l[0], libelle: 'Autre' },
              ...l.slice(1),
            ]),
        },
        {
          section: 'joursFeries',
          detection: 'estJourFerieLigneModifiee',
          ajout: 'ajouterJourFerie',
          muter: () =>
            (component as any).copieJoursFeries.update((l: any[]) => [
              { ...l[0], nom: 'Autre' },
              ...l.slice(1),
            ]),
        },
      ];

      for (const { section, detection, ajout, muter } of cas) {
        describe(section, () => {
          beforeEach(() => {
            (component as any).activerSection(section);
            fixture.detectChanges();
          });

          it('ligne existante non modifiée puis modifiée', () => {
            expect((component as any)[detection](0)).toBe(false);

            muter();

            expect((component as any)[detection](0)).toBe(true);
          });

          it('nouvelle ligne considérée comme modifiée', () => {
            (component as any)[ajout]();

            expect((component as any)[detection](1)).toBe(true);
          });
        });
      }

      it('bouton de ligne désactivé et libellé Enregistré pour une période inchangée', () => {
        (component as any).activerSection('periodes');
        fixture.detectChanges();

        const btn = fixture.nativeElement.querySelector(
          '#btnEnregistrerPeriode0',
        ) as HTMLButtonElement;
        expect(btn.disabled).toBe(true);
        expect(btn.textContent?.trim()).toBe('Enregistré');
      });
    });

    describe('sans données chargées', () => {
      beforeEach(() => {
        (donneesService as any).donneesModifiables.set(null);
      });

      it('toutes les méthodes de détection retournent false', () => {
        const c = component as any;
        expect(c.estEnseignantClasseModifie()).toBe(false);
        expect(c.estSemaineHorairesModifie()).toBe(false);
        expect(c.estPreferencesModifie()).toBe(false);
        expect(c.estDomainesCompetencesModifie()).toBe(false);
        expect(c.estPeriodeLigneModifiee(0)).toBe(false);
        expect(c.estGroupeLigneModifiee(0)).toBe(false);
        expect(c.estStatutAcquisitionLigneModifiee(0)).toBe(false);
        expect(c.estStatutEleveLigneModifiee(0)).toBe(false);
        expect(c.estTypeContactLigneModifiee(0)).toBe(false);
        expect(c.estJourFerieLigneModifiee(0)).toBe(false);
      });
    });
  });

  describe('CRUD des sections liste', () => {
    const cas: Array<{
      section: string;
      copie: string;
      liste: string;
      enregistrer: string;
      supprimer: string;
      champ: string;
    }> = [
      {
        section: 'bareme',
        copie: 'copieBareme',
        liste: 'statutsAcquisition',
        enregistrer: 'enregistrerStatutAcquisition',
        supprimer: 'supprimerStatutAcquisition',
        champ: 'libelle',
      },
      {
        section: 'statutsEleve',
        copie: 'copieStatutsEleve',
        liste: 'statutsEleve',
        enregistrer: 'enregistrerStatutEleve',
        supprimer: 'supprimerStatutEleve',
        champ: 'libelle',
      },
      {
        section: 'typesContact',
        copie: 'copieTypesContact',
        liste: 'typesContact',
        enregistrer: 'enregistrerTypeContact',
        supprimer: 'supprimerTypeContact',
        champ: 'libelle',
      },
      {
        section: 'joursFeries',
        copie: 'copieJoursFeries',
        liste: 'joursFeries',
        enregistrer: 'enregistrerJourFerie',
        supprimer: 'supprimerJourFerie',
        champ: 'nom',
      },
    ];

    for (const { section, copie, liste, enregistrer, supprimer, champ } of cas) {
      describe(section, () => {
        beforeEach(() => {
          (component as any).activerSection(section);
          fixture.detectChanges();
        });

        it('enregistre la modification de la ligne existante dans le store', () => {
          (component as any)[copie].update((l: any[]) => [
            { ...l[0], [champ]: 'Valeur modifiée' },
            ...l.slice(1),
          ]);

          (component as any)[enregistrer](0);

          const listeStore = (donneesService.donnees()?.referentiels as any)[liste];
          expect(listeStore[0][champ]).toBe('Valeur modifiée');
        });

        it('supprime la ligne du store', () => {
          const entite = (component as any)[copie]()[0];

          (component as any)[supprimer](entite);

          expect((donneesService.donnees()?.referentiels as any)[liste]).toHaveLength(0);
        });
      });
    }
  });
});
