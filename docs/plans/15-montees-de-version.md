---
name: 15-montees-de-version
description: Plan de montée de version des dépendances (analyse du 2026-09-19) — correctifs mineurs, jsdom 30, Angular 22 avec TypeScript 6.0 ; Vitest 5 et TypeScript 7 reportés
metadata:
  type: project
  updated: 2026-09-19
related:
  - plans/14-completer-tests-e2e
---

# Plan 15 — Montées de version des dépendances

**Statut : validé le 2026-09-20, en cours.** Étape 1 réalisée le 2026-09-20 (`npm update` : seul `package-lock.json` change, `package.json` inchangé car plages `^` ; `ng test` 1144/1144, couverture ≥ 90 % ; E2E 147/147). Non commitée. `npx playwright install` échoue sur les dépendances système du codespace (sans impact, navigateurs existants OK). Étape 2 (jsdom 30.1) réalisée le 2026-09-20, non commitée : `ng test` 1144/1144 après correction du polyfill `URL.createObjectURL` dans `sauvegarde-auto.service.spec.ts` (rendu inconditionnel, car le `createObjectURL` de Vitest 4.1.11 lit des internes du Blob jsdom disparus en v30 ; à revoir quand Vitest 5 sera possible). Étape 3 (Angular 22.1.7/8 + TS 6.0.3) réalisée le 2026-09-20 sur la branche `montee-angular-22`, non commitée : `ng update --allow-dirty` (dépôt non propre) ; la migration avait mis `nullishCoalescingNotNullable` et `optionalChainNotNullable` à `suppress` dans les tsconfig ; **annulé** : le build et `ng test` passent sans cette suppression, aucun avertissement à corriger ; `Eager` ajouté par la migration sur 4 hôtes de spec, conservé et documenté dans `tests-code.md` ; mentions « Angular 21 » passées en 22 (CLAUDE.md, angular-typescript.md, revue-increment.md) ; `ng build` OK (avertissement de budget SCSS EDT préexistant), `ng test` 1144/1144, E2E 147/147. Migrations optionnelles Karma/application-builder non pertinentes.

Environnement : Node v24.20.0 (compatible avec toutes les cibles ci-dessous), npm 11.9.0, vite 7.3.2 à l'analyse (8.1.5 installé après les étapes 1 et 3 ; le peer `vite ^6 || ^7 || ^8` de vitest 4.1.11 reste satisfait).

## Constats

### Correctifs et mineures (déjà dans les plages `^`)

| Paquet | Actuel | Cible |
|---|---|---|
| @angular/* (core, common, compiler, forms, platform-browser, router, compiler-cli) | 21.2.16 | 21.2.23 |
| @angular/build, @angular/cli | 21.2.14 | 21.2.24 |
| @playwright/test | 1.61.0 | 1.63.0 |
| @types/node | 26.0.0 | 26.6.2 |
| vitest, @vitest/coverage-v8 | 4.1.9 | 4.1.11 |
| monocart-reporter | 2.12.2 | 2.13.1 |
| prettier | 3.8.4 | 3.9.8 |

### Majeures

| Paquet | Actuel | Dernière | Décision |
|---|---|---|---|
| Angular (core, cli, build…) | 21.2.x | 22.1.x | Oui, avec TypeScript 6.0 (étape 3) |
| typescript | 5.9.3 | 7.0.2 | Non : `@angular/build@22` exige `>=6.0 <6.1` → cible TS 6.0 |
| vitest, @vitest/coverage-v8 | 4.1.x | 5.0.1 | Non : `@angular/build@22` déclare `vitest: ^4.0.8` en peer |
| jsdom | 28.1.0 | 30.1.0 | Oui (étape 2) |

Sans changement : rxjs (`~7.8.0`, dernière 7.8.2), fflate 0.8.3, tslib 2.8.1, angular-cli-ghpages 3.1.0.

## Étapes

Chaque étape se termine par `ng test` (couverture ≥ 80 % sur les quatre métriques) et `npm run e2e` ; corriger avant de passer à la suivante. Un commit par étape.

### Étape 1 — Correctifs et mineures

- `npm update`, puis vérifier `package.json` / `package-lock.json`.
- `npx playwright install` pour aligner les navigateurs sur Playwright 1.63.
- Prettier 3.9 : si des fichiers sont reformatés, les isoler dans un commit séparé.
- Impact code attendu : aucun.

### Étape 2 — jsdom 30

- `npm install -D jsdom@^30.0.0`.
- Surveiller les specs de composants avec `<dialog>` : les mocks `showModal` / `close` en `beforeAll` (voir `tests-code.md`) peuvent devenir inutiles si jsdom les implémente ; les laisser tant qu'ils ne gênent pas.
- Risque : régressions DOM dans les specs. Faible à moyen.

### Étape 3 — Angular 22 + TypeScript 6.0

- Travailler sur une branche dédiée, après lecture des notes de version Angular 22.
- `ng update @angular/core@22 @angular/cli@22` (applique les migrations automatiques).
- Ajuster `typescript` à `~6.0.0` (contrainte imposée par `@angular/build@22`).
- Points à traiter au premier `ng build` :
  - erreurs de types plus strictes liées à TS 6.0 (`strict: true` déjà actif) ;
  - APIs Angular dépréciées ou retirées signalées par le compilateur ;
  - options du builder `@angular/build:unit-test` dans `angular.json` (runner vitest, couverture, `coverageExclude`) ;
  - règles du projet à recontrôler si les notes de version le justifient (`angular-typescript.md` : OnPush, signals, `host:`).
- zone.js absent du projet : rien à faire de ce côté.
- Risque : moyen. C'est l'étape structurante.

### Reportées

- **Vitest 5** : reprendre quand `@angular/build` acceptera `vitest@5` en peer.
- **TypeScript 7** : reprendre quand `@angular/build` acceptera TS 7.
- Ré-exécuter `npm outdated` à chaque mise à jour mineure d'Angular pour détecter le levée de ces blocages.

## Précautions

- Une autre session travaille sur le dépôt et `package.json` porte déjà des modifications locales (ajout de `@axe-core/playwright` du plan 14) : attendre qu'elle soit terminée, ou utiliser une branche dédiée, pour éviter les conflits sur `package.json` et `package-lock.json`.
- Après l'incrément complet : relecture par l'agent `revue-increment` (voir `collaboration.md`).
