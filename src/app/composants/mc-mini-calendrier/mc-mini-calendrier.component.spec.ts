import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { McMiniCalendrierComponent } from './mc-mini-calendrier.component';
import { CalendrierMother } from '../../tests/calendrier.mother';

describe('McMiniCalendrierComponent', () => {
  let fixture: ComponentFixture<McMiniCalendrierComponent>;
  let component: McMiniCalendrierComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [McMiniCalendrierComponent] });
    fixture = TestBed.createComponent(McMiniCalendrierComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('joursOuvres', CalendrierMother.joursOuvresComplets());
    fixture.componentRef.setInput('joursFeries', []);
    fixture.componentRef.setInput('journeesAvecEntrees', []);
    // Ancre le mois affiché en juin 2026 (1er = lundi, 30 jours, 0 cases vides)
    fixture.componentRef.setInput('jourSelectionne', '2026-06-01');
    fixture.detectChanges();
  });

  // ─── Structure de la grille ───────────────────────────────────────────────

  describe('grille — structure du mois', () => {
    it('juin 2026 : 0 cases vides et 30 boutons de jours', () => {
      const vides = fixture.nativeElement.querySelectorAll('.mc-mini-calendrier__vide');
      const jours = fixture.nativeElement.querySelectorAll('.mc-mini-calendrier__jour');
      expect(vides.length).toBe(0);
      expect(jours.length).toBe(30);
    });

    it('mars 2026 : 6 cases vides et 31 boutons de jours', () => {
      // 1er mars 2026 = dimanche → offset (0+6)%7 = 6
      fixture.componentRef.setInput('jourSelectionne', '2026-03-01');
      fixture.detectChanges();
      const vides = fixture.nativeElement.querySelectorAll('.mc-mini-calendrier__vide');
      const jours = fixture.nativeElement.querySelectorAll('.mc-mini-calendrier__jour');
      expect(vides.length).toBe(6);
      expect(jours.length).toBe(31);
    });
  });

  // ─── Grisage ─────────────────────────────────────────────────────────────

  describe('grille — grisage des jours', () => {
    it('samedi et dimanche sont grisés et désactivés', () => {
      // 6 juin 2026 = samedi, 7 juin 2026 = dimanche
      const samedi = fixture.nativeElement.querySelector('#calendrierJour_2026-06-06') as HTMLButtonElement;
      const dimanche = fixture.nativeElement.querySelector('#calendrierJour_2026-06-07') as HTMLButtonElement;
      expect(samedi.classList.contains('mc-mini-calendrier__jour--grise')).toBe(true);
      expect(samedi.disabled).toBe(true);
      expect(dimanche.classList.contains('mc-mini-calendrier__jour--grise')).toBe(true);
      expect(dimanche.disabled).toBe(true);
    });

    it('jour férié est grisé et désactivé', () => {
      // 3 juin 2026 = mercredi, normalement ouvré
      fixture.componentRef.setInput('joursFeries', [CalendrierMother.jourFerie('2026-06-03')]);
      fixture.detectChanges();
      const mercrediFerie = fixture.nativeElement.querySelector('#calendrierJour_2026-06-03') as HTMLButtonElement;
      expect(mercrediFerie.classList.contains('mc-mini-calendrier__jour--grise')).toBe(true);
      expect(mercrediFerie.disabled).toBe(true);
    });

    it('jour de semaine absent de joursOuvres est grisé', () => {
      // Lundi retiré des jours ouvrés → 1er juin (lundi) doit être grisé
      fixture.componentRef.setInput('joursOuvres', ['mardi', 'mercredi', 'jeudi', 'vendredi']);
      fixture.detectChanges();
      const lundi = fixture.nativeElement.querySelector('#calendrierJour_2026-06-01') as HTMLButtonElement;
      expect(lundi.classList.contains('mc-mini-calendrier__jour--grise')).toBe(true);
    });

    it('jour de semaine dans joursOuvres est actif', () => {
      // 2 juin 2026 = mardi, présent dans joursOuvres
      const mardi = fixture.nativeElement.querySelector('#calendrierJour_2026-06-02') as HTMLButtonElement;
      expect(mardi.classList.contains('mc-mini-calendrier__jour--grise')).toBe(false);
      expect(mardi.disabled).toBe(false);
    });
  });

  // ─── Marqueurs visuels ───────────────────────────────────────────────────

  describe('grille — marqueurs visuels', () => {
    it('date dans journeesAvecEntrees a la classe --entree', () => {
      fixture.componentRef.setInput('journeesAvecEntrees', ['2026-06-10']);
      fixture.detectChanges();
      const avecEntree = fixture.nativeElement.querySelector('#calendrierJour_2026-06-10') as HTMLButtonElement;
      const sansEntree = fixture.nativeElement.querySelector('#calendrierJour_2026-06-11') as HTMLButtonElement;
      expect(avecEntree.classList.contains('mc-mini-calendrier__jour--entree')).toBe(true);
      expect(sansEntree.classList.contains('mc-mini-calendrier__jour--entree')).toBe(false);
    });

    it('jourSelectionne a la classe --selectionne et aria-pressed=true', () => {
      fixture.componentRef.setInput('jourSelectionne', '2026-06-10');
      fixture.detectChanges();
      const selectionne = fixture.nativeElement.querySelector('#calendrierJour_2026-06-10') as HTMLButtonElement;
      const autre = fixture.nativeElement.querySelector('#calendrierJour_2026-06-11') as HTMLButtonElement;
      expect(selectionne.classList.contains('mc-mini-calendrier__jour--selectionne')).toBe(true);
      expect(selectionne.getAttribute('aria-pressed')).toBe('true');
      expect(autre.classList.contains('mc-mini-calendrier__jour--selectionne')).toBe(false);
    });

    it('date du jour a la classe --aujourdhui', () => {
      const d = new Date();
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      fixture.componentRef.setInput('jourSelectionne', iso);
      fixture.detectChanges();
      const btnAujourdhui = fixture.nativeElement.querySelector(`#calendrierJour_${iso}`) as HTMLButtonElement;
      expect(btnAujourdhui.classList.contains('mc-mini-calendrier__jour--aujourdhui')).toBe(true);
    });
  });

  // ─── En-têtes de colonnes ────────────────────────────────────────────────

  describe('en-têtes de colonnes', () => {
    it('affiche les initiales du lundi au dimanche (L M M J V S D)', () => {
      // BUG : LIBELLES.dates.initialeJours est indexé dimanche-en-premier ['D','L','M','M','J','V','S']
      // mais la grille est lundi-en-premier (offset = (getDay()+6)%7).
      // Les en-têtes affichent donc D en colonne 1 alors que cette colonne contient les lundis.
      const entetes = Array.from(
        fixture.nativeElement.querySelectorAll('.mc-mini-calendrier__entete-col') as NodeListOf<HTMLElement>,
      ).map(el => el.textContent?.trim());
      expect(entetes).toEqual(['L', 'M', 'M', 'J', 'V', 'S', 'D']);
    });
  });

  // ─── Libellé du mois ─────────────────────────────────────────────────────

  describe('libellé du mois', () => {
    it('affiche le mois et l\'année en français', () => {
      const libelle = (fixture.nativeElement.querySelector('.mc-mini-calendrier__libelle-mois') as HTMLElement)
        .textContent?.trim();
      expect(libelle).toContain('juin');
      expect(libelle).toContain('2026');
    });

    it('change quand le mois affiché change', () => {
      fixture.componentRef.setInput('jourSelectionne', '2026-03-15');
      fixture.detectChanges();
      const libelle = (fixture.nativeElement.querySelector('.mc-mini-calendrier__libelle-mois') as HTMLElement)
        .textContent?.trim();
      expect(libelle).toContain('mars');
      expect(libelle).toContain('2026');
    });
  });

  // ─── Limites de navigation ────────────────────────────────────────────────

  describe('navigation — limites', () => {
    it('sans dateMin le bouton précédent est activé', () => {
      const btn = fixture.nativeElement.querySelector('#btnMoisPrecedent') as HTMLButtonElement;
      expect(btn.disabled).toBe(false);
    });

    it('dateMin au même mois désactive le bouton précédent', () => {
      fixture.componentRef.setInput('dateMin', '2026-06-15');
      fixture.detectChanges();
      const btn = fixture.nativeElement.querySelector('#btnMoisPrecedent') as HTMLButtonElement;
      expect(btn.disabled).toBe(true);
    });

    it('dateMin au mois précédent laisse le bouton précédent activé', () => {
      fixture.componentRef.setInput('dateMin', '2026-05-01');
      fixture.detectChanges();
      const btn = fixture.nativeElement.querySelector('#btnMoisPrecedent') as HTMLButtonElement;
      expect(btn.disabled).toBe(false);
    });

    it('sans dateMax le bouton suivant est activé', () => {
      const btn = fixture.nativeElement.querySelector('#btnMoisSuivant') as HTMLButtonElement;
      expect(btn.disabled).toBe(false);
    });

    it('dateMax au même mois désactive le bouton suivant', () => {
      fixture.componentRef.setInput('dateMax', '2026-06-01');
      fixture.detectChanges();
      const btn = fixture.nativeElement.querySelector('#btnMoisSuivant') as HTMLButtonElement;
      expect(btn.disabled).toBe(true);
    });

    it('dateMax au mois suivant laisse le bouton suivant activé', () => {
      fixture.componentRef.setInput('dateMax', '2026-07-31');
      fixture.detectChanges();
      const btn = fixture.nativeElement.querySelector('#btnMoisSuivant') as HTMLButtonElement;
      expect(btn.disabled).toBe(false);
    });
  });

  // ─── Clic de navigation ───────────────────────────────────────────────────

  describe('navigation — clic', () => {
    it('clic mois précédent affiche le mois précédent', () => {
      // BUG : l\'effect lit this.moisAffiche() et crée une dépendance dessus.
      // Quand le bouton ← change moisAffiche, l\'effect se ré-exécute et voit que
      // jourSelectionne (juin) ≠ moisAffiche (mai), puis remet moisAffiche à juin.
      // Fix attendu : utiliser untracked(() => this.moisAffiche()) dans l\'effect.
      const btn = fixture.nativeElement.querySelector('#btnMoisPrecedent') as HTMLButtonElement;
      btn.click();
      fixture.detectChanges();
      const libelle = (fixture.nativeElement.querySelector('.mc-mini-calendrier__libelle-mois') as HTMLElement)
        .textContent?.trim();
      expect(libelle).toContain('mai 2026');
    });

    it('clic mois suivant affiche le mois suivant', () => {
      // Même bug : jourSelectionne (juin) force le retour à juin après navigation vers juillet.
      const btn = fixture.nativeElement.querySelector('#btnMoisSuivant') as HTMLButtonElement;
      btn.click();
      fixture.detectChanges();
      const libelle = (fixture.nativeElement.querySelector('.mc-mini-calendrier__libelle-mois') as HTMLElement)
        .textContent?.trim();
      expect(libelle).toContain('juillet 2026');
    });
  });

  // ─── Sélection d'un jour ─────────────────────────────────────────────────

  describe('sélection d\'un jour', () => {
    it('clic sur un jour ouvrable émet la date ISO via jourChange', () => {
      const emis: string[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).jourChange.subscribe((d: string) => emis.push(d));
      // 9 juin 2026 = mardi ouvré
      const btn = fixture.nativeElement.querySelector('#calendrierJour_2026-06-09') as HTMLButtonElement;
      btn.click();
      fixture.detectChanges();
      expect(emis).toEqual(['2026-06-09']);
    });

    it('clic sur un samedi n\'émet rien', () => {
      const emis: string[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).jourChange.subscribe((d: string) => emis.push(d));
      // 6 juin 2026 = samedi grisé
      const btn = fixture.nativeElement.querySelector('#calendrierJour_2026-06-06') as HTMLButtonElement;
      btn.click();
      fixture.detectChanges();
      expect(emis).toHaveLength(0);
    });

    it('clic sur un jour férié n\'émet rien', () => {
      fixture.componentRef.setInput('joursFeries', [CalendrierMother.jourFerie('2026-06-03')]);
      fixture.detectChanges();
      const emis: string[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).jourChange.subscribe((d: string) => emis.push(d));
      // 3 juin 2026 = mercredi transformé en férié
      const btn = fixture.nativeElement.querySelector('#calendrierJour_2026-06-03') as HTMLButtonElement;
      btn.click();
      fixture.detectChanges();
      expect(emis).toHaveLength(0);
    });
  });

  // ─── Synchronisation jourSelectionne → moisAffiche ───────────────────────

  describe('synchronisation jourSelectionne → moisAffiche', () => {
    it('jourSelectionne dans un autre mois met à jour le mois affiché', () => {
      fixture.componentRef.setInput('jourSelectionne', '2026-03-15');
      fixture.detectChanges();
      const libelle = (fixture.nativeElement.querySelector('.mc-mini-calendrier__libelle-mois') as HTMLElement)
        .textContent?.trim();
      expect(libelle).toContain('mars 2026');
    });

    it('jourSelectionne null ne change pas le mois affiché', () => {
      fixture.componentRef.setInput('jourSelectionne', null);
      fixture.detectChanges();
      const libelle = (fixture.nativeElement.querySelector('.mc-mini-calendrier__libelle-mois') as HTMLElement)
        .textContent?.trim();
      expect(libelle).toContain('juin 2026');
    });
  });
});
