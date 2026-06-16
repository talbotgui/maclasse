import { describe, it, expect, beforeEach } from 'vitest';
import { ChiffrementService } from './chiffrement.service';
import { DonneesApplication } from '../../modeles/donnees-application.modele';

/** Construit un objet `DonneesApplication` minimal pour les tests. */
function creerDonnees(): DonneesApplication {
  return {
    version: '2026.09.1',
    configuration: { delaiSauvegardeAutoMinutes: 2 },
    enseignant: { prenom: 'Marie', nom: 'CURIE', annee: '2025-2026' },
    classe: { niveau: 'CM2', annee: 'Classe CM2', eleves: [] },
    referentiels: {
      competences: [],
      periodes: [],
      statutsAcquisition: [],
      statutsEleve: [],
      typesContact: [],
      groupes: [],
      joursFeries: [],
      raisonsAbsence: [],
      frequencesAbsence: [],
      configEmploiDuTemps: {
        joursOuvres: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'],
        heureDebutJournee: '08:30',
        heureFinJournee: '16:30',
      },
    },
    emploisDuTemps: [],
    projets: [],
    cahierJournal: [],
    ppi: [],
    bulletins: [],
  };
}

describe('ChiffrementService', () => {
  let service: ChiffrementService;

  beforeEach(() => {
    service = new ChiffrementService();
  });

  describe('chiffrer', () => {
    it('retourne un Blob non vide', async () => {
      const blob = await service.chiffrer(creerDonnees(), 'motDePasse123');
      expect(blob.size).toBeGreaterThan(0);
    });

    it('deux chiffrements du même contenu produisent des Blobs différents (salt/IV aléatoires)', async () => {
      const donnees = creerDonnees();
      const blob1 = await service.chiffrer(donnees, 'motDePasse123');
      const blob2 = await service.chiffrer(donnees, 'motDePasse123');
      const arr1 = new Uint8Array(await blob1.arrayBuffer());
      const arr2 = new Uint8Array(await blob2.arrayBuffer());
      const sontIdentiques = arr1.length === arr2.length && arr1.every((b, i) => b === arr2[i]);
      expect(sontIdentiques).toBe(false);
    });
  });

  describe('dechiffrer', () => {
    it('cycle complet restaure les données originales', async () => {
      const original = creerDonnees();
      const blob = await service.chiffrer(original, 'motDePasse123');
      const fichier = new File([blob], 'donnees.zip');
      const resultat = await service.dechiffrer(fichier, 'motDePasse123');
      expect(resultat.version).toBe(original.version);
      expect(resultat.enseignant.nom).toBe(original.enseignant.nom);
      expect(resultat.enseignant.prenom).toBe(original.enseignant.prenom);
      expect(resultat.classe.niveau).toBe(original.classe.niveau);
    });

    it('mauvais mot de passe lève une erreur', async () => {
      const blob = await service.chiffrer(creerDonnees(), 'motDePasse123');
      const fichier = new File([blob], 'donnees.zip');
      await expect(service.dechiffrer(fichier, 'mauvaisMotDePasse')).rejects.toBeDefined();
    });

    it('préserve les données complexes (tableaux imbriqués)', async () => {
      const original = creerDonnees();
      original.referentiels.competences = [
        { id: 'FC1', libelle: 'Français', enfants: [{ id: 'FC1-1', libelle: 'Lecture' }] },
      ];
      const blob = await service.chiffrer(original, 'secret');
      const fichier = new File([blob], 'donnees.zip');
      const resultat = await service.dechiffrer(fichier, 'secret');
      expect(resultat.referentiels.competences).toHaveLength(1);
      expect(resultat.referentiels.competences[0].enfants).toHaveLength(1);
    });
  });
});
