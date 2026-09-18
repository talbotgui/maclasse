import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { EmploiDuTempsCalculeService } from './emploi-du-temps-calcule.service';
import { DonneesService } from '../avecEtat/donnees.service';
import { DonneesMother } from '../../tests/donnees.mother';
import { EdtCalculeMother } from '../../tests/emploi-du-temps-calcule.mother';
import { EleveMother, AbsenceRecurrenteMother } from '../../tests/eleve.mother';
import { EdtMother, CreneauMother, TempsCreneauMother } from '../../tests/emploi-du-temps.mother';
import { LIBELLES } from '../../libelles';

describe('EmploiDuTempsCalculeService', () => {
  let service: EmploiDuTempsCalculeService;
  let donneesService: DonneesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmploiDuTempsCalculeService);
    donneesService = TestBed.inject(DonneesService);
    donneesService.charger(DonneesMother.base());
  });

  describe('creerEdtCalcule', () => {
    it('ajoute une définition', () => {
      service.creerEdtCalcule(EdtCalculeMother.base());
      expect(donneesService.donnees()?.emploisDuTempsCalcules).toHaveLength(1);
    });

    it('supporte le UNDO', () => {
      service.creerEdtCalcule(EdtCalculeMother.base());
      donneesService.annuler();
      expect(donneesService.donnees()?.emploisDuTempsCalcules).toHaveLength(0);
    });
  });

  describe('modifierEdtCalcule', () => {
    it('remplace la définition existante', () => {
      service.creerEdtCalcule(EdtCalculeMother.base());
      service.modifierEdtCalcule(EdtCalculeMother.base({ nom: 'Renommé' }));
      expect(service.obtenirEdtCalcule('edtc1')?.nom).toBe('Renommé');
    });

    it("est sans effet si l'id est inconnu", () => {
      service.modifierEdtCalcule(EdtCalculeMother.base({ id: 'inconnu' }));
      expect(donneesService.donnees()?.emploisDuTempsCalcules).toHaveLength(0);
    });

    it('supporte le UNDO', () => {
      service.creerEdtCalcule(EdtCalculeMother.base());
      service.modifierEdtCalcule(EdtCalculeMother.base({ nom: 'Renommé' }));
      donneesService.annuler();
      expect(service.obtenirEdtCalcule('edtc1')?.nom).toBe('Vue calculée');
    });
  });

  describe('supprimerEdtCalcule', () => {
    it('supprime la définition', () => {
      service.creerEdtCalcule(EdtCalculeMother.base());
      service.supprimerEdtCalcule('edtc1');
      expect(donneesService.donnees()?.emploisDuTempsCalcules).toHaveLength(0);
    });

    it("est sans effet si l'id est inconnu", () => {
      service.creerEdtCalcule(EdtCalculeMother.base());
      service.supprimerEdtCalcule('inconnu');
      expect(donneesService.donnees()?.emploisDuTempsCalcules).toHaveLength(1);
    });

    it('est sans effet sans données chargées', () => {
      TestBed.resetTestingModule();
      const sansDonnees = TestBed.inject(EmploiDuTempsCalculeService);
      expect(() => sansDonnees.supprimerEdtCalcule('x')).not.toThrow();
    });

    it('supporte le UNDO', () => {
      service.creerEdtCalcule(EdtCalculeMother.base());
      service.supprimerEdtCalcule('edtc1');
      donneesService.annuler();
      expect(service.obtenirEdtCalcule('edtc1')).toBeDefined();
    });
  });

  describe('obtenirEdtCalcule', () => {
    it("retourne undefined si l'id est inconnu", () => {
      expect(service.obtenirEdtCalcule('inconnu')).toBeUndefined();
    });
  });

  describe('calculerCreneaux — sans données', () => {
    it('retourne une liste vide', () => {
      TestBed.resetTestingModule();
      const sansDonnees = TestBed.inject(EmploiDuTempsCalculeService);
      expect(sansDonnees.calculerCreneaux(EdtCalculeMother.base())).toEqual([]);
    });
  });

  describe('calculerCreneaux — source recreation', () => {
    it('produit un créneau par temps de récréation, en ignorant les concernés', () => {
      donneesService.charger(
        DonneesMother.avecEleves([EleveMother.base('e1', 'MARTIN', 'Alice')], {
          emploisDuTemps: [
            EdtMother.base({
              creneaux: [
                CreneauMother.avecHoraire('10:00', '10:15', { id: 'r1', type: 'recreation' }),
                CreneauMother.avecHoraire('11:00', '12:00', { id: 'p1' }),
              ],
            }),
          ],
        }),
      );
      const resultat = service.calculerCreneaux(
        EdtCalculeMother.base({
          sources: ['recreation'],
          elevesConcernes: { type: 'eleves', groupes: [], elevesIds: ['e1'] },
        }),
      );
      expect(resultat).toEqual([
        {
          jour: 'lundi',
          heureDebut: '10:00',
          heureFin: '10:15',
          source: 'recreation',
          libelle: LIBELLES.edt.libelleRecreation,
        },
      ]);
    });
  });

  describe('calculerCreneaux — source tempsClasse', () => {
    it('produit un créneau par temps pédagogique avec son titre', () => {
      donneesService.charger(
        DonneesMother.base({
          emploisDuTemps: [
            EdtMother.base({
              creneaux: [
                CreneauMother.lundi9h10({
                  temps: [
                    TempsCreneauMother.base({ id: 't1', titre: 'Maths' }),
                    TempsCreneauMother.base({ id: 't2', heureDebut: '09:30', heureFin: '10:30' }),
                  ],
                }),
                CreneauMother.avecHoraire('10:00', '10:15', { id: 'r1', type: 'recreation' }),
              ],
            }),
          ],
        }),
      );
      const resultat = service.calculerCreneaux(
        EdtCalculeMother.base({ sources: ['tempsClasse'] }),
      );
      expect(resultat.map((c) => c.libelle)).toEqual([
        'Maths',
        LIBELLES.edt.libelleTempsClasseSansTitre,
      ]);
      expect(resultat.every((c) => c.source === 'tempsClasse')).toBe(true);
    });

    it('ne garde que les temps concernant un des élèves choisis (intersection)', () => {
      donneesService.charger(
        DonneesMother.avecEleves(
          [
            EleveMother.base('e1', 'MARTIN', 'Alice', { groupes: ['A'] }),
            EleveMother.base('e2', 'DUPONT', 'Bob', { groupes: ['B'] }),
          ],
          {
            emploisDuTemps: [
              EdtMother.base({
                creneaux: [
                  CreneauMother.lundi9h10({
                    temps: [
                      TempsCreneauMother.base({
                        id: 'tA',
                        titre: 'Groupe A',
                        elevesConcernes: { type: 'groupes', groupes: ['A'], elevesIds: [] },
                      }),
                      TempsCreneauMother.base({
                        id: 'tB',
                        titre: 'Groupe B',
                        elevesConcernes: { type: 'groupes', groupes: ['B'], elevesIds: [] },
                      }),
                      TempsCreneauMother.base({ id: 'tC', titre: 'Toute la classe' }),
                    ],
                  }),
                ],
              }),
            ],
          },
        ),
      );
      const resultat = service.calculerCreneaux(
        EdtCalculeMother.base({
          sources: ['tempsClasse'],
          elevesConcernes: { type: 'eleves', groupes: [], elevesIds: ['e2'] },
        }),
      );
      expect(resultat.map((c) => c.libelle)).toEqual(['Groupe B', 'Toute la classe']);
    });
  });

  describe('calculerCreneaux — source absencesRegulieres', () => {
    it('produit une entrée par absence des élèves choisis', () => {
      donneesService.charger(
        DonneesMother.avecEleves([
          EleveMother.base('e1', 'MARTIN', 'Alice', {
            absencesRecurrentes: [AbsenceRecurrenteMother.base({ id: 'a1' })],
          }),
          EleveMother.base('e2', 'DUPONT', 'Bob', {
            absencesRecurrentes: [AbsenceRecurrenteMother.base({ id: 'a2', libelle: 'Kiné' })],
          }),
        ]),
      );
      const resultat = service.calculerCreneaux(
        EdtCalculeMother.base({
          sources: ['absencesRegulieres'],
          elevesConcernes: { type: 'eleves', groupes: [], elevesIds: ['e2'] },
        }),
      );
      expect(resultat).toEqual([
        {
          jour: 'lundi',
          heureDebut: '09:00',
          heureFin: '10:00',
          source: 'absenceReguliere',
          libelle: 'DUPONT Bob — Kiné',
          eleveConcerneId: 'e2',
        },
      ]);
    });

    it('ignore les absences de parité incompatible', () => {
      donneesService.charger(
        DonneesMother.avecEleves([
          EleveMother.base('e1', 'MARTIN', 'Alice', {
            absencesRecurrentes: [AbsenceRecurrenteMother.base({ paritesSemaine: 'impaire' })],
          }),
        ]),
      );
      expect(
        service.calculerCreneaux(
          EdtCalculeMother.base({ sources: ['absencesRegulieres'], frequence: 'paire' }),
        ),
      ).toEqual([]);
    });
  });

  describe('calculerCreneaux — filtrage des EDT sources', () => {
    beforeEach(() => {
      donneesService.charger(
        DonneesMother.base({
          emploisDuTemps: [
            EdtMother.base({
              dateDebut: '2026-01-01',
              dateFin: '2026-03-31',
              frequence: 'paire',
              creneaux: [CreneauMother.lundi9h10()],
            }),
          ],
        }),
      );
    });

    it('retient un EDT dont la plage chevauche et la fréquence est compatible', () => {
      const resultat = service.calculerCreneaux(
        EdtCalculeMother.base({
          sources: ['tempsClasse'],
          dateDebut: '2026-03-01',
          dateFin: '2026-06-30',
          frequence: 'lesDeux',
        }),
      );
      expect(resultat).toHaveLength(1);
    });

    it('écarte un EDT dont la plage est disjointe', () => {
      const resultat = service.calculerCreneaux(
        EdtCalculeMother.base({
          sources: ['tempsClasse'],
          dateDebut: '2026-04-01',
          dateFin: '2026-06-30',
        }),
      );
      expect(resultat).toEqual([]);
    });

    it('écarte un EDT dont la fréquence est incompatible', () => {
      const resultat = service.calculerCreneaux(
        EdtCalculeMother.base({ sources: ['tempsClasse'], frequence: 'impaire' }),
      );
      expect(resultat).toEqual([]);
    });
  });

  describe('calculerCreneaux — combinaison et tri', () => {
    it('combine plusieurs sources triées par heure de début', () => {
      donneesService.charger(
        DonneesMother.avecEleves(
          [
            EleveMother.base('e1', 'MARTIN', 'Alice', {
              absencesRecurrentes: [
                AbsenceRecurrenteMother.base({ heureDebut: '08:00', heureFin: '08:30' }),
              ],
            }),
          ],
          {
            emploisDuTemps: [
              EdtMother.base({
                creneaux: [
                  CreneauMother.avecHoraire('10:00', '10:15', { id: 'r1', type: 'recreation' }),
                  CreneauMother.avecHoraire('09:00', '10:00', { id: 'p1' }),
                ],
              }),
            ],
          },
        ),
      );
      const resultat = service.calculerCreneaux(
        EdtCalculeMother.base({ sources: ['recreation', 'tempsClasse', 'absencesRegulieres'] }),
      );
      expect(resultat.map((c) => c.source)).toEqual([
        'absenceReguliere',
        'tempsClasse',
        'recreation',
      ]);
    });

    it("retourne une liste vide si aucune source n'est cochée", () => {
      donneesService.charger(
        DonneesMother.base({
          emploisDuTemps: [EdtMother.base({ creneaux: [CreneauMother.lundi9h10()] })],
        }),
      );
      expect(service.calculerCreneaux(EdtCalculeMother.base())).toEqual([]);
    });
  });
});
