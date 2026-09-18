import { describe, it, expect } from 'vitest';
import { EleveUtils } from './eleve.utils';
import { EleveMother } from '../tests/eleve.mother';

describe('EleveUtils', () => {
  describe('resoudreElevesConcernes', () => {
    const eleves = [
      EleveMother.base('e1', 'MARTIN', 'Alice', { groupes: ['A'] }),
      EleveMother.base('e2', 'DUPONT', 'Bob', { groupes: ['B'] }),
      EleveMother.base('e3', 'DURAND', 'Chloé', { groupes: ['A', 'B'] }),
    ];

    it('retourne toute la classe si le périmètre est absent', () => {
      expect(EleveUtils.resoudreElevesConcernes(undefined, eleves)).toEqual(['e1', 'e2', 'e3']);
    });

    it('retourne toute la classe pour le type classe', () => {
      expect(
        EleveUtils.resoudreElevesConcernes({ type: 'classe', groupes: [], elevesIds: [] }, eleves),
      ).toEqual(['e1', 'e2', 'e3']);
    });

    it('retourne les élèves appartenant à au moins un des groupes', () => {
      expect(
        EleveUtils.resoudreElevesConcernes(
          { type: 'groupes', groupes: ['A'], elevesIds: [] },
          eleves,
        ),
      ).toEqual(['e1', 'e3']);
    });

    it('retourne les identifiants nommés pour le type eleves', () => {
      expect(
        EleveUtils.resoudreElevesConcernes(
          { type: 'eleves', groupes: [], elevesIds: ['e2'] },
          eleves,
        ),
      ).toEqual(['e2']);
    });
  });
});
