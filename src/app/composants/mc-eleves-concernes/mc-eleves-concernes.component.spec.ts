import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { McElevesConcernesComponent } from './mc-eleves-concernes.component';
import { DonneesService } from '../../services/avecEtat/donnees.service';
import { DonneesMother } from '../../tests/donnees.mother';
import { EleveMother } from '../../tests/eleve.mother';
import type { ElevesConcernes } from '../../modeles/emploi-du-temps.modele';
import { LIBELLES } from '../../libelles';

describe('McElevesConcernesComponent', () => {
  let fixture: ComponentFixture<McElevesConcernesComponent>;
  let component: McElevesConcernesComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    const donneesService = TestBed.inject(DonneesService);
    donneesService.charger(
      DonneesMother.base({
        referentiels: {
          ...DonneesMother.base().referentiels,
          groupes: [
            { id: 'GA', libelle: 'Groupe A' },
            { id: 'GB', libelle: 'Groupe B' },
          ],
        },
        classe: {
          niveau: 'CM2',
          annee: 'CM2',
          eleves: [
            EleveMother.base('e1', 'MARTIN', 'Alice'),
            EleveMother.base('e2', 'DUPONT', 'Bob'),
            EleveMother.base('e3', 'ADAM', 'Claire'),
          ],
        },
      }),
    );
    fixture = TestBed.createComponent(McElevesConcernesComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'elevesConcernes');
    fixture.detectChanges();
  });

  describe('computed groupes', () => {
    it('renvoie la liste des groupes du référentiel', () => {
      expect((component as any).groupes()).toEqual([
        { id: 'GA', libelle: 'Groupe A' },
        { id: 'GB', libelle: 'Groupe B' },
      ]);
    });
  });

  describe('computed eleves', () => {
    it('renvoie les élèves triés par NOM puis prénom', () => {
      const eleves = (component as any).eleves() as { nom: string; prenom: string }[];
      expect(eleves.map((e) => e.nom)).toEqual(['ADAM', 'DUPONT', 'MARTIN']);
    });
  });

  describe('writeValue', () => {
    it('null → valeur défaut { type: "classe", groupes: [], elevesIds: [] }', () => {
      component.writeValue(null);
      const v = (component as any).valeurInterne() as ElevesConcernes;

      expect(v.type).toBe('classe');
      expect(v.groupes).toEqual([]);
      expect(v.elevesIds).toEqual([]);
    });

    it('valeur existante → stockée dans valeurInterne', () => {
      const val: ElevesConcernes = { type: 'groupes', groupes: ['GA'], elevesIds: [] };
      component.writeValue(val);

      expect((component as any).valeurInterne()).toEqual(val);
    });
  });

  describe('groupe de boutons radio (mc-radio-group)', () => {
    it('conserve les identifiants des radios attendus par les E2E', () => {
      for (const mode of ['classe', 'groupes', 'eleves']) {
        expect(fixture.nativeElement.querySelector(`#elevesConcernes_${mode}`)).not.toBeNull();
      }
    });

    it('coche le radio correspondant à la valeur reçue', () => {
      component.writeValue({ type: 'eleves', groupes: [], elevesIds: ['e1'] });
      fixture.detectChanges();

      const radio = fixture.nativeElement.querySelector(
        '#elevesConcernes_eleves',
      ) as HTMLInputElement;
      expect(radio.checked).toBe(true);
    });

    it('le choix d’un radio change de mode et notifie Angular Forms', () => {
      const onChange = vi.fn();
      component.registerOnChange(onChange);

      const radio = fixture.nativeElement.querySelector(
        '#elevesConcernes_groupes',
      ) as HTMLInputElement;
      radio.click();
      fixture.detectChanges();

      expect((component as any).valeurInterne().type).toBe('groupes');
      expect(onChange).toHaveBeenCalledWith({ type: 'groupes', groupes: [], elevesIds: [] });
      expect(fixture.nativeElement.querySelector('#elevesConcernes_groupe_GA')).not.toBeNull();
    });
  });

  describe('surChangementMode', () => {
    it('bascule vers "groupes" → type=groupes, groupes=[], elevesIds=[]', () => {
      component['surChangementMode']('groupes');

      const v = (component as any).valeurInterne() as ElevesConcernes;
      expect(v.type).toBe('groupes');
      expect(v.groupes).toEqual([]);
      expect(v.elevesIds).toEqual([]);
    });

    it('bascule vers "eleves" → type=eleves', () => {
      component['surChangementMode']('eleves');

      expect((component as any).valeurInterne().type).toBe('eleves');
    });

    it('bascule vers "classe" → réinitialise tout', () => {
      component.writeValue({ type: 'groupes', groupes: ['GA'], elevesIds: [] });
      component['surChangementMode']('classe');

      const v = (component as any).valeurInterne() as ElevesConcernes;
      expect(v.type).toBe('classe');
      expect(v.groupes).toEqual([]);
    });

    it('appelle onChange et onTouched', () => {
      const onChange = vi.fn();
      const onTouched = vi.fn();
      component.registerOnChange(onChange);
      component.registerOnTouched(onTouched);

      component['surChangementMode']('groupes');

      expect(onChange).toHaveBeenCalled();
      expect(onTouched).toHaveBeenCalled();
    });
  });

  describe('basculerGroupe', () => {
    beforeEach(() => {
      component['surChangementMode']('groupes');
    });

    it('ajoute un groupe absent de la sélection', () => {
      component['basculerGroupe']('GA');

      expect((component as any).valeurInterne().groupes).toContain('GA');
    });

    it('retire un groupe déjà présent', () => {
      component['basculerGroupe']('GA');
      component['basculerGroupe']('GA');

      expect((component as any).valeurInterne().groupes).not.toContain('GA');
    });

    it('appelle onChange et onTouched', () => {
      const onChange = vi.fn();
      const onTouched = vi.fn();
      component.registerOnChange(onChange);
      component.registerOnTouched(onTouched);

      component['basculerGroupe']('GA');

      expect(onChange).toHaveBeenCalled();
      expect(onTouched).toHaveBeenCalled();
    });
  });

  describe('basculerEleve', () => {
    beforeEach(() => {
      component['surChangementMode']('eleves');
    });

    it('ajoute un élève absent de la sélection', () => {
      component['basculerEleve']('e1');

      expect((component as any).valeurInterne().elevesIds).toContain('e1');
    });

    it('retire un élève déjà présent', () => {
      component['basculerEleve']('e1');
      component['basculerEleve']('e1');

      expect((component as any).valeurInterne().elevesIds).not.toContain('e1');
    });

    it('appelle onChange et onTouched', () => {
      const onChange = vi.fn();
      const onTouched = vi.fn();
      component.registerOnChange(onChange);
      component.registerOnTouched(onTouched);

      component['basculerEleve']('e1');

      expect(onChange).toHaveBeenCalled();
      expect(onTouched).toHaveBeenCalled();
    });
  });

  describe('élèves indisponibles', () => {
    beforeEach(() => {
      component['surChangementMode']('eleves');
    });

    it('sans input, aucun chip élève n’est désactivé (cas de l’emploi du temps)', () => {
      fixture.detectChanges();

      const chips = fixture.nativeElement.querySelectorAll('[id^="elevesConcernes_eleve_"]');
      expect(Array.from(chips as NodeListOf<HTMLButtonElement>).some((c) => c.disabled)).toBe(
        false,
      );
    });

    it('désactive le chip d’un élève indisponible non sélectionné, avec sa mention', () => {
      fixture.componentRef.setInput('elevesIndisponiblesIds', ['e2']);
      fixture.detectChanges();

      const chip = fixture.nativeElement.querySelector(
        '#elevesConcernes_eleve_e2',
      ) as HTMLButtonElement;
      expect(chip.disabled).toBe(true);
      expect(chip.title).toBe(LIBELLES.elevesConcernes.mentionEleveAbsent);
      expect(chip.querySelector('.sr-only')?.textContent).toBe(
        `(${LIBELLES.elevesConcernes.mentionEleveAbsent})`,
      );
      expect(
        (fixture.nativeElement.querySelector('#elevesConcernes_eleve_e1') as HTMLButtonElement)
          .disabled,
      ).toBe(false);
    });

    it('laisse actif le chip d’un élève indisponible déjà sélectionné pour pouvoir le retirer', () => {
      component['basculerEleve']('e2');
      fixture.componentRef.setInput('elevesIndisponiblesIds', ['e2']);
      fixture.detectChanges();

      const chip = fixture.nativeElement.querySelector(
        '#elevesConcernes_eleve_e2',
      ) as HTMLButtonElement;
      expect(chip.disabled).toBe(false);
      expect(chip.hasAttribute('title')).toBe(false);
    });
  });
});
