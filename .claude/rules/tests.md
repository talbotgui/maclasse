---
globs: "**/*.spec.ts"
---

# Tests unitaires — Conventions

## Framework et instanciation

Vitest pour tous les tests de services.

- Service **sans `inject()`** dans le corps → instanciation directe `new MonService()`
- Service **avec `inject()`** → `TestBed.configureTestingModule({})` + `TestBed.inject(MonService)`

**Jamais de mocks** — instancier ou injecter les dépendances réellement.

## Structure

```typescript
describe('MonService', () => {
  let service: MonService;

  beforeEach(() => {
    service = new MonService(); // ou TestBed
  });

  describe('fonctionnalité X', () => {
    it('cas nominal', () => { ... });
    it('cas limite', () => { ... });
  });
});
```

`describe` par fonctionnalité (pas par méthode). Un `beforeEach` recrée une instance fraîche.

## Imports habituels

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
```

## Ce qui est testé

- **Testé :** tous les services
- **Jamais testé :** les composants Angular

## Couverture minimale

80% minimum sur les quatre métriques (lignes, branches, fonctions, statements) sur l'ensemble des services.
Lancer `ng test --code-coverage` et corriger avant de passer à l'étape suivante si une métrique est sous le seuil.

Fichiers exclus : `modeles/`, `gardes/`, `libelles.ts`, `composant-base.ts`, `app.ts`.

## Pattern Object Mother

Toute donnée de test réutilisée dans plus d'un test doit passer par un Object Mother dans `src/app/tests/`.
Interdire les fonctions `creerXxx()` ou constantes de module dans les spec files.

```typescript
// Fichiers existants dans src/app/tests/
// donnees.mother.ts      → DonneesMother.base()
// eleve.mother.ts        → EleveMother.base(id, nom, prenom, surcharge?)
// competence.mother.ts   → CompetenceMother.arbreSimple()
// emploi-du-temps.mother.ts → EdtMother.base(), CreneauMother.lundi9h10()
// cahier-journal.mother.ts  → SeanceMother.pedagogique(), SeanceMother.recreation()
// projet.mother.ts       → ProjetMother.base(), PeriodeMother.base()

// Surcharge via Partial<T>
service.creerEdt(EdtMother.base({ frequence: 'paire' }));
```

Nouveau type testé → créer `src/app/tests/<domaine>.mother.ts` avant d'écrire les tests.
