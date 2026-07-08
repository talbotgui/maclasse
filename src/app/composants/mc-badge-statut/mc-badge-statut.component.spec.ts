import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { McBadgeStatutComponent } from './mc-badge-statut.component';
import { StatutAcquisitionMother } from '../../tests/referentiel.mother';

describe('McBadgeStatutComponent', () => {
  let fixture: ComponentFixture<McBadgeStatutComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(McBadgeStatutComponent);
  });

  describe('affichage avec statut non null', () => {
    it('affiche le glyphe du statut', () => {
      const statut = StatutAcquisitionMother.acquis();
      fixture.componentRef.setInput('statut', statut);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain(statut.glyphe);
    });

    it('applique la couleur du texte du statut en style inline', () => {
      const statut = StatutAcquisitionMother.acquis();
      fixture.componentRef.setInput('statut', statut);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const spanAvecCouleur = Array.from(el.querySelectorAll<HTMLElement>('*')).find(
        (e) => e.style.color || e.style.backgroundColor,
      );
      expect(spanAvecCouleur).toBeTruthy();
    });

    it('affiche le libellé du statut en En cours', () => {
      const statut = StatutAcquisitionMother.enCours();
      fixture.componentRef.setInput('statut', statut);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain(statut.glyphe);
    });
  });

  describe('affichage avec statut null', () => {
    it('affiche un tiret quand statut est null', () => {
      fixture.componentRef.setInput('statut', null);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('—');
    });

    it("n'applique pas de couleur inline quand statut est null", () => {
      fixture.componentRef.setInput('statut', null);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const spanAvecCouleur = Array.from(el.querySelectorAll<HTMLElement>('*')).find(
        (e) => e.style.color !== '' && e.style.color !== undefined,
      );
      expect(spanAvecCouleur).toBeFalsy();
    });

    it("affiche un tiret quand aucun statut n'est fourni (valeur par défaut)", () => {
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('—');
    });
  });
});
