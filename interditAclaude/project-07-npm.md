---
name: project-07-npm
description: Scripts npm disponibles et workflow de développement
metadata:
  type: project
  updated: 2026-06-05
---

Toutes les commandes npm s'exécutent depuis le répertoire racine du dépôt.

## Scripts

| Script | Commande | Usage |
|--------|----------|-------|
| `npm start` | `ng serve` | Serveur de développement avec rechargement automatique |
| `npm test` | `ng test` | Tests unitaires Vitest |
| `npm run build` | `ng build` | Build de production |
| `npm run watch` | `ng build --watch --configuration development` | Build continu en mode dev |

## Stack technique (versions fixes)

- Angular `21.x`
- TypeScript `~5.x`
- Vitest `^4.x` + jsdom `^28.x`
- Prettier `^3.x`
- `@angular/cdk ^21.x` (drag & drop)
- `geist ^1.x` (polices Geist/Geist Mono)
- Package manager : npm `11.x`
