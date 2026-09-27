---
name: 2026-09-27-lint-initial
description: Premier passage d'ESLint (angular-eslint 22) sur src/ et e2e/ après la mise en place du lint — 387 erreurs, dont 369 de visibilité explicite manquante
metadata:
  type: project
  updated: 2026-09-27
related:
  - specification/elements-techniques
---

# Lint initial — 2026-09-27

Premier passage de `npm run lint` après la mise en place d'ESLint (`eslint.config.js`, cible `lint` de `angular.json`).
Le lint est **bloquant** : toutes les règles sont en `error`. Tant que ces constats ne sont pas corrigés, `npm run lint` échoue.

Les corrections n'ont pas été faites lors de la mise en place : `src/` et `e2e/` étaient en cours de modification par une autre session.

## Synthèse

**387 erreurs dans 33 fichiers**, dont 12 corrigeables automatiquement (`npm run lint:corriger`).

| Règle | Nombre | Zone |
|---|---|---|
| `@typescript-eslint/explicit-member-accessibility` | 333 | `e2e/selecteurs/*` (propriétés `readonly` des classes de sélecteurs) |
| `@typescript-eslint/explicit-member-accessibility` | 36 | `src/app/tests/*.mother.ts` (méthodes `static`), hôtes de test dans 2 specs |
| `@angular-eslint/prefer-signals` | 7 | `ecran-parametrage.component.ts` : signaux non `readonly` |
| `@typescript-eslint/no-unused-vars` | 4 | imports inutilisés (`eleve.service.ts`, `emploi-du-temps.service.ts`), variables inutilisées dans 2 specs |
| `@typescript-eslint/consistent-type-definitions` | 3 | `e2e/fixtures/*.fixture.ts` : `type` au lieu d'`interface` |
| `@typescript-eslint/array-type` | 2 | `ecran-parametrage.component.spec.ts` : `Array<T>` au lieu de `T[]` |
| `@angular-eslint/template/interactive-supports-focus` | 2 | `mc-entete.component.html:114`, `ecran-emploi-du-temps.component.html:16` |

## Constats à examiner de près

- **`interactive-supports-focus`** (RGAA) : un élément porte un gestionnaire d'événement sans être focusable. Vérifier s'il faut un `<button>` natif ou si le gestionnaire n'est qu'un relais (ex. `(click)` de fermeture sur un conteneur) à déplacer.
- **`prefer-signals`** : un signal réassignable peut être remplacé par erreur au lieu d'être mis à jour avec `set()`.

## Réglages retenus pour éviter les faux positifs

- Constructeurs dispensés de modificateur de visibilité.
- Méthodes et fonctions fléchées vides autorisées : callbacks no-op de `ControlValueAccessor`, points d'extension de `PopinBase`, `mockImplementation(() => {})` dans les specs.
- Specs : `any` autorisé (`(component as any)`), composants hôtes en `ChangeDetectionStrategy.Eager` autorisés (voir `tests-code.md`).
- `e2e/fixtures/` : motif `({}, use)` autorisé, car imposé par Playwright.
