import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { App } from './app';
import { ImpressionService } from './services/sansEtat/impression.service';
import { LIBELLES } from './libelles';

describe('App', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    });
    TestBed.createComponent(App).detectChanges();
  });

  afterEach(() => {
    window.dispatchEvent(new Event('afterprint'));
    document.documentElement.style.removeProperty(ImpressionService.VARIABLE_ENTETE);
    document.documentElement.style.removeProperty(ImpressionService.VARIABLE_DATE);
  });

  describe("préparation de l'impression", () => {
    it('alimente les marges des pages imprimées au beforeprint', () => {
      window.dispatchEvent(new Event('beforeprint'));
      expect(
        document.documentElement.style.getPropertyValue(ImpressionService.VARIABLE_ENTETE),
      ).toBe(`"${LIBELLES.impression.entete}"`);
      expect(
        document.documentElement.style.getPropertyValue(ImpressionService.VARIABLE_DATE),
      ).not.toBe('');
    });

    it("restaure le titre du document à l'afterprint", () => {
      document.title = 'MaClasse';
      const titre = signal('Projet Sciences');
      TestBed.runInInjectionContext(() => TestBed.inject(ImpressionService).suivreTitre(titre));
      window.dispatchEvent(new Event('beforeprint'));
      expect(document.title).toBe('Projet Sciences');
      window.dispatchEvent(new Event('afterprint'));
      expect(document.title).toBe('MaClasse');
    });
  });
});
