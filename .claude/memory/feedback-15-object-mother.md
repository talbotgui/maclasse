---
name: feedback-15-object-mother
description: Pattern Object Mother — description, règle d'utilisation et structure dans src/app/tests/
metadata:
  type: feedback
---

## Pattern Object Mother (Martin Fowler)

Une classe statique par type de données de test qui produit des objets **valides par défaut**, surchargés via `Partial<T>`. Les tests ne précisent que les champs qui importent pour eux.

### Principe
```typescript
export class EdtMother {
  static base(surcharge: Partial<EmploiDuTemps> = {}): EmploiDuTemps {
    return { id: 'edt1', nom: 'Semaine complète', ..., ...surcharge };
  }
}

// Dans le test : ne préciser que ce qui compte
service.creerEdt(EdtMother.base({ frequence: 'paire' }));
```

### Fichiers existants dans `src/app/tests/`
| Fichier | Exports |
|---|---|
| `donnees.mother.ts` | `DonneesMother.base()` |
| `eleve.mother.ts` | `EleveMother.base(id, nom, prenom, surcharge?)` |
| `competence.mother.ts` | `CompetenceMother.arbreSimple()` |
| `emploi-du-temps.mother.ts` | `EdtMother.base()`, `CreneauMother.lundi9h10()` |
| `cahier-journal.mother.ts` | `DATES_TEST` (lundiPaire/lundiImpaire/samedi), `SeanceMother.pedagogique()`, `SeanceMother.recreation()` |
| `projet.mother.ts` | `ProjetMother.base()`, `PeriodeMother.base()` |

## Règle de conception des tests

Toute donnée de test réutilisée dans plus d'un test doit passer par un Object Mother.
Interdire les fonctions `creerXxx()` ou les constantes de module dans les spec files.

**Why:** Avant ce pattern, chaque spec file redéfinissait ses propres données (`creerDonneesVides()`, `creerEleve()`, etc.) avec des valeurs légèrement différentes, rendant les tests fragiles et difficiles à lire. Le Mother centralise les valeurs neutres et rend visible ce qui est vraiment testé.

**How to apply:**
- Nouveau type testé → créer `src/app/tests/<domaine>.mother.ts` avant d'écrire les tests
- Données locales à un seul test → objet inline acceptable ; dès qu'un second test en a besoin, extraire dans le Mother
- Surcharge : `ProjetMother.base({ nom: 'X' })` plutôt que `{ ...ProjetMother.base(), nom: 'X' }`
- Voir [[feedback-08-tests]] pour les autres règles de tests (Vitest, TestBed, pas de mocks)
