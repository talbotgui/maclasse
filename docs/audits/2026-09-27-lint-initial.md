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

**Statut : traité le 2026-09-27.** Après les commits de réalignement doc/code, il restait 385 erreurs : l'import inutilisé d'`eleve.service.ts` et la variable inutilisée de `popin-export-competences.component.spec.ts` avaient déjà disparu. Toutes ont été corrigées, et `npm run lint` passe sans erreur (voir « Corrections apportées »).

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

## Corrections apportées

- **Visibilité explicite** : ajout de `public` aux propriétés des classes de sélecteurs E2E et des composants hôtes de test, et de `public static` aux méthodes des Object Mothers.
- **`prefer-signals`** : les 7 signaux `copie*` d'`ecran-parametrage` sont déclarés `readonly` (ils ne sont jamais réassignés, seulement mis à jour par `set()`/`update()`).
- **`interactive-supports-focus`** : le `(keydown)` de navigation clavier est déplacé du `<ul>` vers chaque `<button>` de la liste (résultats de recherche de l'entête, liste des EDT). Le comportement ne change pas, car les gestionnaires s'appuient sur l'index focalisé. Les specs envoient désormais l'événement sur le bouton focalisé.
- **`no-unused-vars`** : suppression de l'import `Eleve` d'`emploi-du-temps.service.ts` et de l'accesseur inutilisé `btnReinitialiser` dans le spec de `mc-champ-recherche`.
- **Corrections automatiques** : `interface` au lieu de `type` dans les fixtures E2E, `T[]` au lieu d'`Array<T>` dans le spec du paramétrage.

Vérifications : `npm run lint` sans erreur, 1204 tests unitaires et 154 E2E verts.
