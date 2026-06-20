import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { McBoutonDestructionComponent } from './mc-bouton-destruction.component';

describe('McBoutonDestructionComponent', () => {
  let fixture: ComponentFixture<McBoutonDestructionComponent>;
  let component: McBoutonDestructionComponent;

  const btnSupprimer = () =>
    fixture.debugElement.query(By.css('#Base'))?.nativeElement as HTMLButtonElement | undefined;
  const btnConfirmer = () =>
    fixture.debugElement.query(By.css('#Base_confirmer'))?.nativeElement as HTMLButtonElement | undefined;
  const btnAnnuler = () =>
    fixture.debugElement.query(By.css('#Base_annuler'))?.nativeElement as HTMLButtonElement | undefined;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(McBoutonDestructionComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'Base');
    fixture.detectChanges();
  });

  describe('état normal (avant confirmation)', () => {
    it('affiche le bouton SUPPRIMER', () => {
      expect(btnSupprimer()).toBeTruthy();
    });

    it('n\'affiche pas CONFIRMER ni ANNULER', () => {
      expect(btnConfirmer()).toBeFalsy();
      expect(btnAnnuler()).toBeFalsy();
    });
  });

  describe('demande de confirmation', () => {
    it('clic SUPPRIMER bascule en mode confirmation', () => {
      btnSupprimer()!.click();
      fixture.detectChanges();

      expect((component as any).etatConfirmation()).toBe(true);
    });

    it('en mode confirmation, affiche CONFIRMER et ANNULER', () => {
      btnSupprimer()!.click();
      fixture.detectChanges();

      expect(btnConfirmer()).toBeTruthy();
      expect(btnAnnuler()).toBeTruthy();
    });

    it('en mode confirmation, masque SUPPRIMER', () => {
      btnSupprimer()!.click();
      fixture.detectChanges();

      expect(btnSupprimer()).toBeFalsy();
    });
  });

  describe('annulation', () => {
    it('clic ANNULER repasse en état normal', () => {
      btnSupprimer()!.click();
      fixture.detectChanges();
      btnAnnuler()!.click();
      fixture.detectChanges();

      expect((component as any).etatConfirmation()).toBe(false);
      expect(btnSupprimer()).toBeTruthy();
    });

    it('ANNULER n\'émet pas confirme', () => {
      const spy = vi.spyOn((component as any).confirme, 'emit');

      btnSupprimer()!.click();
      fixture.detectChanges();
      btnAnnuler()!.click();

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('confirmation', () => {
    it('clic CONFIRMER émet l\'output confirme', () => {
      const spy = vi.spyOn((component as any).confirme, 'emit');

      btnSupprimer()!.click();
      fixture.detectChanges();
      btnConfirmer()!.click();

      expect(spy).toHaveBeenCalled();
    });

    it('clic CONFIRMER repasse en état normal', () => {
      btnSupprimer()!.click();
      fixture.detectChanges();
      btnConfirmer()!.click();
      fixture.detectChanges();

      expect((component as any).etatConfirmation()).toBe(false);
    });
  });

  describe('désactivation', () => {
    it('desactive=true désactive le bouton SUPPRIMER', () => {
      fixture.componentRef.setInput('desactive', true);
      fixture.detectChanges();

      expect(btnSupprimer()!.disabled).toBe(true);
    });

    it('desactive=false laisse le bouton SUPPRIMER actif', () => {
      fixture.componentRef.setInput('desactive', false);
      fixture.detectChanges();

      expect(btnSupprimer()!.disabled).toBe(false);
    });

    it('tooltipDesactive renseigné → span sr-only présent', () => {
      fixture.componentRef.setInput('desactive', true);
      fixture.componentRef.setInput('tooltipDesactive', 'Valeur utilisée');
      fixture.detectChanges();

      const srOnly = fixture.debugElement.query(By.css('.sr-only'));
      expect(srOnly).toBeTruthy();
      expect(srOnly.nativeElement.textContent).toContain('Valeur utilisée');
    });

    it('tooltipDesactive vide → aucun span sr-only', () => {
      fixture.componentRef.setInput('desactive', true);
      fixture.componentRef.setInput('tooltipDesactive', '');
      fixture.detectChanges();

      const srOnly = fixture.debugElement.query(By.css('.sr-only'));
      expect(srOnly).toBeFalsy();
    });
  });

  describe('taille réduite', () => {
    it('petit=true applique mc-btn-sm au bouton SUPPRIMER', () => {
      fixture.componentRef.setInput('petit', true);
      fixture.detectChanges();

      expect(btnSupprimer()!.classList.contains('mc-btn-sm')).toBe(true);
    });
  });
});
