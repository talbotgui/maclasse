---
name: reference-commandes-dev
description: Commandes npm pour démarrer l'app, lancer les tests unitaires (Vitest) et les tests E2E (Playwright)
metadata:
  type: reference
---

Commandes définies dans `package.json` à la racine du projet.

## Démarrer l'application

```bash
npm start
```
Équivaut à `ng serve`. Application servie sur `http://localhost:4200`.

## Tests unitaires

```bash
npm test
```
Équivaut à `ng test`. Builder `@angular/build:unit-test` avec `runner: vitest` (voir `angular.json`, section `test`). Couverture activée par défaut (4 métriques : lignes, branches, fonctions, statements). Seuil minimal et conventions détaillées dans `.claude/rules/tests-code.md`.

Fichiers exclus de la couverture (config `angular.json`) : `src/app/modeles/*.modele.ts`, `src/app/gardes/**`, `src/app/commandes/**`, `src/**/libelles.ts`, `src/**/composant-base.ts`, `src/app/app.ts`, `src/main.ts`, `**/*.html`.

## Tests E2E (Playwright)

```bash
npm run e2e              # exécution headless standard
npm run e2e:avec-visu    # mode headed (navigateur visible)
npm run e2e:ui           # UI interactive Playwright
npm run e2e:rapport      # ouvre le dernier rapport HTML généré
npm run e2e:couverture   # exécution avec couverture V8 (variable COUVERTURE_E2E=1)
```

Config dans `playwright.config.ts` :
- `testDir: ./e2e/tests`
- `baseURL: http://localhost:4200`
- `webServer.command: npm start` — Playwright démarre l'app automatiquement (`reuseExistingServer: true`) si elle n'est pas déjà lancée sur le port 4200 ; pas besoin de lancer `npm start` séparément avant les E2E
- `workers: 1`, `fullyParallel: false`
- Rapport HTML dans `.e2e/playwright-report/`, couverture dans `.e2e/coverage-e2e/index.html`

**Why:** évite de re-chercher dans `package.json`/`angular.json`/`playwright.config.ts` à chaque session de travail.
**How to apply:** utiliser ces commandes directement pour lancer build/tests pendant le développement ou la revue.
