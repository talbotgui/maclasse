---
name: feedback-08-tests
description: Conventions de tests unitaires — Vitest sans TestBed, instanciation directe, structure describe/it
metadata:
  type: feedback
  updated: 2026-06-05
related:
  - project-04-json-historique-pattern
---

## Règle 1 - Tests des services
Utiliser Vitest. Pas de TestBed Angular dans les tests de services — instanciation directe (`new MonService()`).

**Why:** Les services sont des classes TypeScript pures (pas de dépendances Angular injectées via DI dans les tests). TestBed alourdit inutilement.

**How to apply:** Pour chaque nouveau service, créer un fichier `*.spec.ts` adjacent au service. Structurer les `describe` par fonctionnalité (pas par méthode). Un `beforeEach` recrée une instance fraîche.

## Règle 2 - Structure type

```typescript
describe('MonService', () => {
  let service: MonService;

  beforeEach(() => {
    service = new MonService();
  });

  describe('fonctionnalité X', () => {
    it('cas nominal', () => { ... });
    it('cas limite', () => { ... });
  });
});
```

## Règle 3 - Ce qui est testé / pas testé

- **Testé :** Tous les services
- **Jamais testé :** Tous les composants Angular

## Règle 4 - Imports habituels

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { MonService } from './mon.service';
// Importer les classes de modification si besoin
import { AjouterNoeudObjet, ModifierNoeud, ... } from './modifications/...';
```

## Règle 5 - Pas de mocks

Les dépendances sont passées en paramètre ou le service est autonome. Ne pas mocker `JsonHistoriqueService` — l'instancier directement.
