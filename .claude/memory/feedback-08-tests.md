---
name: feedback-08-tests
description: Conventions de tests unitaires — Vitest, structure describe/it, pas de mocks
metadata:
  type: feedback
  updated: 2026-06-13
---

## Règle 1 - Tests des services

Utiliser Vitest pour tous les tests de services.

- Pour les services **sans dépendances Angular** (sans `inject()` dans le corps) : instanciation directe (`new MonService()`).
- Pour les services **utilisant `inject()`** : utiliser `TestBed` pour fournir le contexte d'injection Angular.

**Why:** L'instanciation directe est préférable quand elle est possible (plus rapide, plus lisible). TestBed est nécessaire dès que le service utilise `inject()` dans son corps — Angular doit gérer l'injection.

**How to apply:** Pour chaque nouveau service, créer un fichier `*.spec.ts` adjacent au service. Structurer les `describe` par fonctionnalité (pas par méthode). Un `beforeEach` recrée une instance fraîche (ou réinitialise le TestBed).

## Règle 2 - Structure type (instanciation directe)

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

## Règle 3 - Structure type (avec TestBed)

```typescript
describe('MonService', () => {
  let service: MonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MonService);
  });

  describe('fonctionnalité X', () => {
    it('cas nominal', () => { ... });
  });
});
```

## Règle 4 - Ce qui est testé / pas testé

- **Testé :** Tous les services
- **Jamais testé :** Tous les composants Angular

## Règle 5 - Imports habituels

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MonService } from './mon.service';
```

## Règle 6 - Pas de mocks

Les dépendances sont instanciées réellement. Ne jamais mocker un service — l'instancier ou l'injecter directement via TestBed.
