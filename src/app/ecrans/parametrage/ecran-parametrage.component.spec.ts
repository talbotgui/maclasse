import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { EcranParametrageComponent } from './ecran-parametrage.component';
import { DonneesService } from '../../services/avecEtat/donnees.service';
import { SauvegardeAutoService } from '../../services/sansEtat/sauvegarde-auto.service';
import { DonneesMother } from '../../tests/donnees.mother';
import { CompetenceMother } from '../../tests/competence.mother';
import { GroupeMother } from '../../tests/referentiel.mother';
import { ReferentielService } from '../../services/sansEtat/referentiel.service';
import { LIBELLES } from '../../libelles';

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

    it('charge les lignes de la section activée', () => {
      (component as any).activerSection('periodes');
      fixture.detectChanges();

      const lignes = (component as any).lignesPeriodes.getRawValue();
      expect(lignes).toEqual([
        {
          idOrigine: 'p1',
          valeur: donnees.referentiels.periodes[0],
          reference: donnees.referentiels.periodes[0],
        },
      ]);
    });
  });

  describe('section enseignantClasse', () => {
    beforeEach(() => {
      (component as any).activerSection('enseignantClasse');
      fixture.detectChanges();
    });

    it('formEnseignantClasse chargé depuis le store', () => {
      expect((component as any).formEnseignantClasse.controls.prenom.value).toBe('Marie');
      expect((component as any).formEnseignantClasse.controls.niveauClasse.value).toBe('CM2');
    });

    it('enregistrerEnseignantClasse met à jour le store', () => {
      (component as any).formEnseignantClasse.controls.prenom.setValue('Sophie');
      (component as any).formEnseignantClasse.controls.nom.setValue('MARTIN');
      (component as any).formEnseignantClasse.controls.niveauClasse.setValue('CM1');

      (component as any).enregistrerEnseignantClasse();

      const d = donneesService.donnees();
      expect(d?.enseignant.prenom).toBe('Sophie');
      expect(d?.classe.niveau).toBe('CM1');
    });

    it('annulerEnseignantClasse recharge depuis le store', () => {
      (component as any).formEnseignantClasse.controls.prenom.setValue('Modifié');

      (component as any).annulerEnseignantClasse();

      expect((component as any).formEnseignantClasse.controls.prenom.value).toBe('Marie');
    });
  });

  describe('section semaineHoraires', () => {
    beforeEach(() => {
      (component as any).activerSection('semaineHoraires');
      fixture.detectChanges();
    });

    it('formSemaineHoraires chargé depuis le store', () => {
      expect((component as any).formSemaineHoraires.controls.joursOuvres.value).toContain('lundi');
    });

    it('enregistrerSemaineHoraires met à jour le store', () => {
      (component as any).formSemaineHoraires.controls.joursOuvres.setValue(['lundi', 'mardi']);

      (component as any).enregistrerSemaineHoraires();

      const d = donneesService.donnees();
      expect(d?.referentiels.configEmploiDuTemps.joursOuvres).toEqual(['lundi', 'mardi']);
    });

    it('annulerSemaineHoraires recharge depuis le store', () => {
      (component as any).formSemaineHoraires.controls.heureDebutJournee.setValue('09:15');
      (component as any).retirerJourOuvre('lundi');

      (component as any).annulerSemaineHoraires();

      expect((component as any).formSemaineHoraires.getRawValue()).toEqual(
        donnees.referentiels.configEmploiDuTemps,
      );
      expect((component as any).estSemaineHorairesModifie()).toBe(false);
    });

    it("ajouterJourOuvre ajoute un jour dans l'ordre canonique", () => {
      (component as any).formSemaineHoraires.controls.joursOuvres.setValue(['lundi']);

      (component as any).ajouterJourOuvre('mercredi');

      expect((component as any).formSemaineHoraires.controls.joursOuvres.value).toEqual([
        'lundi',
        'mercredi',
      ]);
    });

    it('retirerJourOuvre retire un jour', () => {
      (component as any).formSemaineHoraires.controls.joursOuvres.setValue(['lundi', 'mercredi']);

      (component as any).retirerJourOuvre('lundi');

      expect((component as any).formSemaineHoraires.controls.joursOuvres.value).not.toContain(
        'lundi',
      );
    });
  });

  describe('section préférences', () => {
    beforeEach(() => {
      (component as any).activerSection('preferences');
      fixture.detectChanges();
    });

    it('formPreferences chargé depuis le store', () => {
      expect((component as any).formPreferences.controls.delaiSauvegardeAutoMinutes.value).toBe(5);
    });

    it('enregistrerPreferences met à jour le store', () => {
      (component as any).formPreferences.controls.delaiSauvegardeAutoMinutes.setValue(10);

      (component as any).enregistrerPreferences();

      expect(donneesService.donnees()?.configuration.delaiSauvegardeAutoMinutes).toBe(10);
    });

    it('annulerPreferences recharge depuis le store', () => {
      (component as any).formPreferences.controls.delaiSauvegardeAutoMinutes.setValue(99);

      (component as any).annulerPreferences();

      expect((component as any).formPreferences.controls.delaiSauvegardeAutoMinutes.value).toBe(5);
    });

    describe('preferencesValides', () => {
      it('borne minimale (1) valide', () => {
        (component as any).formPreferences.controls.delaiSauvegardeAutoMinutes.setValue(1);

        expect((component as any).preferencesValides()).toBe(true);
      });

      it('borne maximale (60) valide', () => {
        (component as any).formPreferences.controls.delaiSauvegardeAutoMinutes.setValue(60);

        expect((component as any).preferencesValides()).toBe(true);
      });

      it('0 invalide (sous la borne minimale)', () => {
        (component as any).formPreferences.controls.delaiSauvegardeAutoMinutes.setValue(0);

        expect((component as any).preferencesValides()).toBe(false);
      });

      it('61 invalide (au-dessus de la borne maximale)', () => {
        (component as any).formPreferences.controls.delaiSauvegardeAutoMinutes.setValue(61);

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
      (component as any).formPreferences.controls.delaiSauvegardeAutoMinutes.setValue(61);

      (component as any).enregistrerPreferences();

      expect(donneesService.donnees()?.configuration.delaiSauvegardeAutoMinutes).toBe(5);
    });

    describe('relance du timer de sauvegarde automatique', () => {
      it('timer inactif → demarrer() non rappelé', () => {
        const spy = vi.spyOn(sauvegardeAutoService, 'demarrer');
        (component as any).formPreferences.controls.delaiSauvegardeAutoMinutes.setValue(10);

        (component as any).enregistrerPreferences();

        expect(spy).not.toHaveBeenCalled();
      });

      it('timer actif → demarrer() rappelé pour appliquer le nouveau délai', () => {
        sauvegardeAutoService.demarrer();
        const spy = vi.spyOn(sauvegardeAutoService, 'demarrer');
        (component as any).formPreferences.controls.delaiSauvegardeAutoMinutes.setValue(10);

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

      const lignes = (component as any).lignesPeriodes;
      expect(lignes.length).toBe(2);
      expect(lignes.at(1).controls.valeur.controls.nom.value).toBe('');
      expect(lignes.at(1).controls.idOrigine.value).toBeNull();
      expect((component as any).indexAFocaliserPeriode()).toBe(1);
    });

    it('enregistrerPeriode modifie une période existante', () => {
      (component as any).lignesPeriodes.at(0).controls.valeur.controls.nom.setValue('Modifié');

      (component as any).enregistrerPeriode(0);

      expect(donneesService.donnees()?.referentiels.periodes[0].nom).toBe('Modifié');
    });

    it('supprimerPeriode retire la ligne et la période du store', () => {
      (component as any).supprimerPeriode(0);

      expect((component as any).lignesPeriodes.length).toBe(0);
      expect(donneesService.donnees()?.referentiels.periodes).toHaveLength(0);
      expect((component as any).indexAFocaliserPeriode()).toBeNull();
    });

    it('supprimerPeriode ne fait rien pour un index inexistant', () => {
      (component as any).supprimerPeriode(5);

      expect(donneesService.donnees()?.referentiels.periodes).toHaveLength(1);
    });

    it('ajout puis enregistrement d’une nouvelle période', () => {
      (component as any).ajouterPeriode();
      (component as any).lignesPeriodes.at(1).controls.valeur.controls.nom.setValue('Période 2');

      (component as any).enregistrerPeriode(1);

      expect(donneesService.donnees()?.referentiels.periodes[1].nom).toBe('Période 2');
    });
  });

  describe('section groupes', () => {
    beforeEach(() => {
      (component as any).activerSection('groupes');
      fixture.detectChanges();
    });

    it('ajouterGroupe ajoute un groupe vide', () => {
      (component as any).ajouterGroupe();

      expect((component as any).lignesGroupes.length).toBe(2);
      expect((component as any).indexAFocaliserGroupe()).toBe(1);
    });

    it('enregistrerGroupe modifie un groupe existant', () => {
      (component as any).lignesGroupes
        .at(0)
        .controls.valeur.controls.libelle.setValue('Groupe Modifié');

      (component as any).enregistrerGroupe(0);

      expect(donneesService.donnees()?.referentiels.groupes[0].libelle).toBe('Groupe Modifié');
    });

    it('supprimerGroupe retire la ligne', () => {
      (component as any).supprimerGroupe(0);

      expect((component as any).lignesGroupes.length).toBe(0);
    });

    it('ajout puis enregistrement d’un nouveau groupe', () => {
      (component as any).ajouterGroupe();
      (component as any).lignesGroupes.at(1).controls.valeur.controls.libelle.setValue('Groupe B');

      (component as any).enregistrerGroupe(1);

      expect(donneesService.donnees()?.referentiels.groupes[1].libelle).toBe('Groupe B');
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
        (component as any).formEnseignantClasse.controls.prenom.setValue('Sophie');

        expect((component as any).estEnseignantClasseModifie()).toBe(true);
      });

      it('revient à non modifié après annulation', () => {
        (component as any).formEnseignantClasse.controls.nom.setValue('AUTRE');
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
        (component as any).formEnseignantClasse.controls.prenom.setValue('Sophie');
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
        (component as any).formSemaineHoraires.controls.heureDebutJournee.setValue('09:00');

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
        (component as any).formPreferences.controls.delaiSauvegardeAutoMinutes.setValue(10);

        expect((component as any).estPreferencesModifie()).toBe(true);
      });

      it('régression SOU-039 : ressaisir la même valeur via le champ DOM ne signale pas de modification', () => {
        const champ = fixture.nativeElement.querySelector(
          '#champDelaiSauvegarde-input',
        ) as HTMLInputElement;

        champ.value = '5';
        champ.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        expect((component as any).formPreferences.controls.delaiSauvegardeAutoMinutes.value).toBe(
          5,
        );
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
      const cas: {
        section: string;
        detection: string;
        ajout: string;
        muter: () => void;
      }[] = [
        {
          section: 'periodes',
          detection: 'estPeriodeLigneModifiee',
          ajout: 'ajouterPeriode',
          muter: () =>
            (component as any).lignesPeriodes
              .at(0)
              .controls.valeur.controls.nom.setValue('Renommée'),
        },
        {
          section: 'groupes',
          detection: 'estGroupeLigneModifiee',
          ajout: 'ajouterGroupe',
          muter: () =>
            (component as any).lignesGroupes
              .at(0)
              .controls.valeur.controls.libelle.setValue('Groupe B'),
        },
        {
          section: 'bareme',
          detection: 'estStatutAcquisitionLigneModifiee',
          ajout: 'ajouterStatutAcquisition',
          muter: () =>
            (component as any).lignesBareme
              .at(0)
              .controls.valeur.controls.libelle.setValue('Autre'),
        },
        {
          section: 'statutsEleve',
          detection: 'estStatutEleveLigneModifiee',
          ajout: 'ajouterStatutEleve',
          muter: () =>
            (component as any).lignesStatutsEleve
              .at(0)
              .controls.valeur.controls.libelle.setValue('Autre'),
        },
        {
          section: 'typesContact',
          detection: 'estTypeContactLigneModifiee',
          ajout: 'ajouterTypeContact',
          muter: () =>
            (component as any).lignesTypesContact
              .at(0)
              .controls.valeur.controls.libelle.setValue('Autre'),
        },
        {
          section: 'joursFeries',
          detection: 'estJourFerieLigneModifiee',
          ajout: 'ajouterJourFerie',
          muter: () =>
            (component as any).lignesJoursFeries
              .at(0)
              .controls.valeur.controls.nom.setValue('Autre'),
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
    const cas: {
      section: string;
      lignes: string;
      liste: string;
      enregistrer: string;
      supprimer: string;
      champ: string;
    }[] = [
      {
        section: 'periodes',
        lignes: 'lignesPeriodes',
        liste: 'periodes',
        enregistrer: 'enregistrerPeriode',
        supprimer: 'supprimerPeriode',
        champ: 'nom',
      },
      {
        section: 'groupes',
        lignes: 'lignesGroupes',
        liste: 'groupes',
        enregistrer: 'enregistrerGroupe',
        supprimer: 'supprimerGroupe',
        champ: 'libelle',
      },
      {
        section: 'bareme',
        lignes: 'lignesBareme',
        liste: 'statutsAcquisition',
        enregistrer: 'enregistrerStatutAcquisition',
        supprimer: 'supprimerStatutAcquisition',
        champ: 'libelle',
      },
      {
        section: 'statutsEleve',
        lignes: 'lignesStatutsEleve',
        liste: 'statutsEleve',
        enregistrer: 'enregistrerStatutEleve',
        supprimer: 'supprimerStatutEleve',
        champ: 'libelle',
      },
      {
        section: 'typesContact',
        lignes: 'lignesTypesContact',
        liste: 'typesContact',
        enregistrer: 'enregistrerTypeContact',
        supprimer: 'supprimerTypeContact',
        champ: 'libelle',
      },
      {
        section: 'joursFeries',
        lignes: 'lignesJoursFeries',
        liste: 'joursFeries',
        enregistrer: 'enregistrerJourFerie',
        supprimer: 'supprimerJourFerie',
        champ: 'nom',
      },
    ];

    for (const { section, lignes, liste, enregistrer, supprimer, champ } of cas) {
      describe(section, () => {
        beforeEach(() => {
          (component as any).activerSection(section);
          fixture.detectChanges();
        });

        it('enregistre la modification de la ligne existante dans le store', () => {
          (component as any)[lignes]
            .at(0)
            .controls.valeur.controls[champ].setValue('Valeur modifiée');

          (component as any)[enregistrer](0);

          const listeStore = (donneesService.donnees()?.referentiels as any)[liste];
          expect(listeStore[0][champ]).toBe('Valeur modifiée');
        });

        it('supprime la ligne du store', () => {
          (component as any)[supprimer](0);

          expect((donneesService.donnees()?.referentiels as any)[liste]).toHaveLength(0);
          expect((component as any)[lignes].length).toBe(0);
        });

        it('ne fait rien pour un index de ligne inexistant', () => {
          (component as any)[enregistrer](5);
          (component as any)[supprimer](5);

          expect((donneesService.donnees()?.referentiels as any)[liste]).toHaveLength(1);
        });
      });
    }
  });

  describe('suivi des lignes par instance de FormGroup', () => {
    const casIdentifiant: { section: string; champ: string }[] = [
      { section: 'bareme', champ: '#champStatutId0-input' },
      { section: 'statutsEleve', champ: '#champStatutEleveId0-input' },
      { section: 'typesContact', champ: '#champTypeContactId0-input' },
    ];

    for (const { section, champ } of casIdentifiant) {
      it(`${section} : saisir dans l'identifiant ne recrée pas la ligne et garde le focus`, () => {
        (component as any).activerSection(section);
        fixture.detectChanges();
        const input = fixture.nativeElement.querySelector(champ) as HTMLInputElement;
        input.focus();

        input.value = 'XY';
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector(champ)).toBe(input);
        expect(document.activeElement).toBe(input);
      });
    }

    describe('réconciliation au rechargement de la section', () => {
      beforeEach(() => {
        (component as any).activerSection('bareme');
        fixture.detectChanges();
      });

      it("enregistrement d'une autre ligne → mêmes instances pour les lignes toujours présentes", () => {
        const lignes = (component as any).lignesBareme;
        const premiere = lignes.at(0);
        (component as any).ajouterStatutAcquisition();
        const nouvelle = lignes.at(1);
        nouvelle.controls.valeur.controls.id.setValue('EC');
        nouvelle.controls.valeur.controls.libelle.setValue('En cours');

        (component as any).enregistrerStatutAcquisition(1);
        fixture.detectChanges();

        expect(lignes.length).toBe(2);
        expect(lignes.at(0)).toBe(premiere);
        expect(lignes.at(1)).toBe(nouvelle);
        expect(nouvelle.controls.idOrigine.value).toBe('EC');
        expect((component as any).estStatutAcquisitionLigneModifiee(1)).toBe(false);
      });

      it('ANNULER global → ligne retirée, instance des autres lignes conservée', () => {
        const lignes = (component as any).lignesBareme;
        const premiere = lignes.at(0);
        (component as any).ajouterStatutAcquisition();
        lignes.at(1).controls.valeur.controls.id.setValue('EC');
        (component as any).enregistrerStatutAcquisition(1);
        fixture.detectChanges();

        donneesService.annuler();
        fixture.detectChanges();

        expect(lignes.length).toBe(1);
        expect(lignes.at(0)).toBe(premiere);
      });

      it('entrée modifiée ailleurs → la ligne réutilisée reçoit la valeur enregistrée', () => {
        const lignes = (component as any).lignesBareme;
        const premiere = lignes.at(0);
        const statut = donnees.referentiels.statutsAcquisition[0];
        TestBed.inject(ReferentielService).modifierStatutAcquisition(statut, {
          ...statut,
          libelle: 'Maîtrisé',
        });
        fixture.detectChanges();

        expect(lignes.at(0)).toBe(premiere);
        expect(premiere.controls.valeur.controls.libelle.value).toBe('Maîtrisé');
      });
    });
  });

  describe('conservation des saisies au rechargement des données', () => {
    const groupeA = GroupeMother.base('GA', 'Groupe A');
    const groupeB = GroupeMother.base('GB', 'Groupe B');
    let referentielService: ReferentielService;

    beforeEach(() => {
      referentielService = TestBed.inject(ReferentielService);
      donneesService.charger(
        DonneesMother.base({
          ...donnees,
          referentiels: { ...donnees.referentiels, groupes: [groupeA, groupeB] },
        }),
      );
      fixture.detectChanges();
    });

    describe('section liste', () => {
      beforeEach(() => {
        (component as any).activerSection('groupes');
        fixture.detectChanges();
      });

      it('ligne B modifiée, enregistrement de la ligne A → saisie de B conservée', () => {
        const lignes = (component as any).lignesGroupes;
        lignes.at(1).controls.valeur.controls.libelle.setValue('Saisie B');
        lignes.at(0).controls.valeur.controls.libelle.setValue('Groupe A2');

        (component as any).enregistrerGroupe(0);
        fixture.detectChanges();

        expect(lignes.at(0).controls.valeur.controls.libelle.value).toBe('Groupe A2');
        expect(lignes.at(1).controls.valeur.controls.libelle.value).toBe('Saisie B');
        expect((component as any).estGroupeLigneModifiee(0)).toBe(false);
        expect((component as any).estGroupeLigneModifiee(1)).toBe(true);
      });

      it("ligne ajoutée non enregistrée, enregistrement d'une autre ligne → ligne ajoutée conservée", () => {
        const lignes = (component as any).lignesGroupes;
        (component as any).ajouterGroupe();
        const ajoutee = lignes.at(2);
        ajoutee.controls.valeur.controls.libelle.setValue('Groupe C');
        lignes.at(0).controls.valeur.controls.libelle.setValue('Groupe A2');

        (component as any).enregistrerGroupe(0);
        fixture.detectChanges();

        expect(lignes.length).toBe(3);
        expect(lignes.at(2)).toBe(ajoutee);
        expect(ajoutee.controls.valeur.controls.libelle.value).toBe('Groupe C');
        expect(ajoutee.controls.idOrigine.value).toBeNull();
      });

      it("UNDO d'une modification de la ligne A pendant que A est modifiée → saisie de A conservée", () => {
        const lignes = (component as any).lignesGroupes;
        referentielService.modifierGroupe(groupeA, { ...groupeA, libelle: 'Groupe A2' });
        fixture.detectChanges();
        lignes.at(0).controls.valeur.controls.libelle.setValue('Saisie A');

        donneesService.annuler();
        fixture.detectChanges();

        expect(lignes.at(0).controls.valeur.controls.libelle.value).toBe('Saisie A');
      });

      it("UNDO d'une modification de la ligne A non modifiée → A reprend l'ancienne valeur", () => {
        const lignes = (component as any).lignesGroupes;
        referentielService.modifierGroupe(groupeA, { ...groupeA, libelle: 'Groupe A2' });
        fixture.detectChanges();
        expect(lignes.at(0).controls.valeur.controls.libelle.value).toBe('Groupe A2');

        donneesService.annuler();
        fixture.detectChanges();

        expect(lignes.at(0).controls.valeur.controls.libelle.value).toBe('Groupe A');
      });

      it('suppression → ligne retirée ; ANNULER de la suppression → ligne rétablie', () => {
        const lignes = (component as any).lignesGroupes;

        (component as any).supprimerGroupe(1);
        fixture.detectChanges();
        expect(lignes.getRawValue().map((l: any) => l.idOrigine)).toEqual(['GA']);

        donneesService.annuler();
        fixture.detectChanges();
        expect(lignes.getRawValue().map((l: any) => l.idOrigine)).toEqual(['GA', 'GB']);
        expect(lignes.at(1).controls.valeur.controls.libelle.value).toBe('Groupe B');
      });

      it('ligne enregistrée puis modifiée, UNDO de son ajout → ligne conservée et redevenue non enregistrée', () => {
        const lignes = (component as any).lignesGroupes;
        (component as any).ajouterGroupe();
        const ajoutee = lignes.at(2);
        ajoutee.controls.valeur.controls.libelle.setValue('Groupe C');
        (component as any).enregistrerGroupe(2);
        fixture.detectChanges();
        ajoutee.controls.valeur.controls.libelle.setValue('Groupe C2');

        donneesService.annuler();
        fixture.detectChanges();

        expect(lignes.length).toBe(3);
        expect(lignes.at(2)).toBe(ajoutee);
        expect(ajoutee.controls.valeur.controls.libelle.value).toBe('Groupe C2');
        expect(ajoutee.controls.idOrigine.value).toBeNull();
        expect(ajoutee.controls.reference.value).toBeNull();
      });

      it('ligne enregistrée non modifiée, UNDO de son ajout → ligne retirée', () => {
        const lignes = (component as any).lignesGroupes;
        (component as any).ajouterGroupe();
        lignes.at(2).controls.valeur.controls.libelle.setValue('Groupe C');
        (component as any).enregistrerGroupe(2);
        fixture.detectChanges();

        donneesService.annuler();
        fixture.detectChanges();

        expect(lignes.length).toBe(2);
      });

      it('changement de section → saisies et lignes non enregistrées abandonnées', () => {
        const lignes = (component as any).lignesGroupes;
        lignes.at(0).controls.valeur.controls.libelle.setValue('Saisie A');
        (component as any).ajouterGroupe();

        (component as any).activerSection('periodes');
        fixture.detectChanges();
        (component as any).activerSection('groupes');
        fixture.detectChanges();

        expect(lignes.length).toBe(2);
        expect(lignes.at(0).controls.valeur.controls.libelle.value).toBe('Groupe A');
      });
    });

    describe('sections formulaire', () => {
      it("Enseignant & Classe modifiée + UNDO d'une autre commande → saisie conservée", () => {
        referentielService.ajouterGroupe(GroupeMother.base('GC', 'Groupe C'));
        fixture.detectChanges();
        (component as any).formEnseignantClasse.controls.prenom.setValue('Sophie');

        donneesService.annuler();
        fixture.detectChanges();

        expect((component as any).formEnseignantClasse.controls.prenom.value).toBe('Sophie');
        expect((component as any).estEnseignantClasseModifie()).toBe(true);
      });

      it('Enseignant & Classe non modifiée + UNDO de son enregistrement → ancienne valeur', () => {
        (component as any).formEnseignantClasse.controls.prenom.setValue('Sophie');
        (component as any).enregistrerEnseignantClasse();
        fixture.detectChanges();

        donneesService.annuler();
        donneesService.annuler();
        fixture.detectChanges();

        expect((component as any).formEnseignantClasse.controls.prenom.value).toBe('Marie');
      });

      it("Semaine & Horaires modifiée + UNDO d'une autre commande → saisie conservée", () => {
        (component as any).activerSection('semaineHoraires');
        fixture.detectChanges();
        referentielService.ajouterGroupe(GroupeMother.base('GC', 'Groupe C'));
        fixture.detectChanges();
        (component as any).formSemaineHoraires.controls.heureDebutJournee.setValue('08:30');

        donneesService.annuler();
        fixture.detectChanges();

        expect((component as any).formSemaineHoraires.controls.heureDebutJournee.value).toBe(
          '08:30',
        );
      });

      it('Semaine & Horaires non modifiée → reçoit la valeur enregistrée ailleurs', () => {
        (component as any).activerSection('semaineHoraires');
        fixture.detectChanges();
        const config = donnees.referentiels.configEmploiDuTemps;

        referentielService.modifierConfigEmploiDuTemps(config, {
          ...config,
          heureFinJournee: '17:00',
        });
        fixture.detectChanges();

        expect((component as any).formSemaineHoraires.controls.heureFinJournee.value).toBe('17:00');
      });

      it("Préférences modifiée + UNDO d'une autre commande → saisie conservée", () => {
        (component as any).activerSection('preferences');
        fixture.detectChanges();
        referentielService.ajouterGroupe(GroupeMother.base('GC', 'Groupe C'));
        fixture.detectChanges();
        (component as any).formPreferences.controls.delaiSauvegardeAutoMinutes.setValue(10);

        donneesService.annuler();
        fixture.detectChanges();

        expect((component as any).formPreferences.controls.delaiSauvegardeAutoMinutes.value).toBe(
          10,
        );
      });

      it("Domaines de compétences modifiée + UNDO d'une autre commande → sélection conservée", () => {
        const domaineN1 = CompetenceMother.domaineAvecSousDomaines();
        donneesService.charger(
          DonneesMother.base({
            ...donnees,
            referentiels: { ...donnees.referentiels, competences: [domaineN1] },
            configuration: { delaiSauvegardeAutoMinutes: 5, domainesActifs: ['d1-1'] },
          }),
        );
        fixture.detectChanges();
        (component as any).activerSection('domainesCompetences');
        fixture.detectChanges();
        referentielService.ajouterGroupe(GroupeMother.base('GC', 'Groupe C'));
        fixture.detectChanges();
        (component as any).basculerSousDomaine(domaineN1, domaineN1.enfants![1], true);

        donneesService.annuler();
        fixture.detectChanges();

        expect([...(component as any).copieDomainesActifs()].sort()).toEqual(['d1-1', 'd1-2']);
        expect((component as any).estDomainesCompetencesModifie()).toBe(true);
      });

      it('Domaines de compétences non modifiée → reçoit la sélection enregistrée ailleurs', () => {
        const domaineN1 = CompetenceMother.domaineAvecSousDomaines();
        donneesService.charger(
          DonneesMother.base({
            ...donnees,
            referentiels: { ...donnees.referentiels, competences: [domaineN1] },
            configuration: { delaiSauvegardeAutoMinutes: 5, domainesActifs: ['d1-1'] },
          }),
        );
        fixture.detectChanges();
        (component as any).activerSection('domainesCompetences');
        fixture.detectChanges();
        (component as any).basculerSousDomaine(domaineN1, domaineN1.enfants![1], true);
        (component as any).enregistrerDomainesCompetences();
        fixture.detectChanges();

        donneesService.annuler();
        fixture.detectChanges();

        expect([...(component as any).copieDomainesActifs()]).toEqual(['d1-1']);
      });
    });
  });

  describe('bornes du délai de sauvegarde', () => {
    const saisir = (valeur: string) => {
      const input = fixture.nativeElement.querySelector(
        '#champDelaiSauvegarde-input',
      ) as HTMLInputElement;
      input.value = valeur;
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    };

    beforeEach(() => {
      (component as any).activerSection('preferences');
      fixture.detectChanges();
    });

    for (const valeur of ['0', '61', '']) {
      it(`délai « ${valeur} » → ENREGISTRER désactivé et message affiché`, () => {
        saisir(valeur);

        const btn = fixture.nativeElement.querySelector(
          '#btnEnregistrerPreferences',
        ) as HTMLButtonElement;
        const erreur = fixture.nativeElement.querySelector('.parametrage__erreur') as HTMLElement;
        expect(btn.disabled).toBe(true);
        expect(erreur.getAttribute('role')).toBe('alert');
        expect(erreur.textContent?.trim()).toBe(
          LIBELLES.parametrage.erreurDelaiSauvegardeHorsBornes,
        );
      });
    }

    it('délai saisi émis en nombre', () => {
      saisir('12');

      (component as any).enregistrerPreferences();

      expect(donneesService.donnees()?.configuration.delaiSauvegardeAutoMinutes).toBe(12);
    });
  });
});
