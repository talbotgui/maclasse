import { describe, it, expect } from 'vitest';
import { CommandeModification } from './commande-modification';
import { DonneesMother } from '../tests/donnees.mother';
import { ProjetMother } from '../tests/projet.mother';
import { Projet } from '../modeles/projet.modele';

describe('CommandeModification', () => {
  const ancien = ProjetMother.base({ nom: 'Avant' });
  const nouveau = ProjetMother.base({ nom: 'Après' });
  const commande = new CommandeModification<Projet>((d) => d.projets, ancien, nouveau, 'Test');

  describe('exécution et annulation', () => {
    it("remplace l'ancienne valeur par la nouvelle sans muter l'original", () => {
      const donnees = DonneesMother.base({ projets: [ancien] });
      const resultat = commande.executer(donnees);
      expect(resultat.projets[0].nom).toBe('Après');
      expect(resultat.projets[0]).not.toBe(nouveau);
      expect(donnees.projets[0].nom).toBe('Avant');
    });

    it("restaure l'ancienne valeur à l'annulation", () => {
      const donnees = DonneesMother.base({ projets: [nouveau] });
      expect(commande.annuler(donnees).projets[0].nom).toBe('Avant');
    });

    it("laisse les données inchangées si l'identifiant est introuvable", () => {
      const donnees = DonneesMother.base({ projets: [ProjetMother.base({ id: 'autre' })] });
      expect(commande.executer(donnees).projets).toEqual(donnees.projets);
    });
  });
});
