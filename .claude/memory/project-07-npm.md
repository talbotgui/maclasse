---
name: project-07-npm
description: Scripts npm disponibles et workflow de développement — répertoire Sources/
metadata:
  type: project
  updated: 2026-06-05
---

La racine de l'application Angular est `Sources/`. Toutes les commandes npm s'exécutent depuis ce répertoire.

**Why:** Le projet est dans un sous-répertoire, pas à la racine du dépôt.

**How to apply:** Toujours se placer dans `Sources/` avant de lancer un script, ou utiliser `--prefix Sources`.

## Scripts

| Script | Commande | Usage |
|--------|----------|-------|
| `npm start` | `ng serve` | Serveur de développement avec rechargement automatique |
| `npm test` | `ng test` | Tests unitaires Vitest |
| `npm run build` | `ng build` | Build de production |
| `npm run watch` | `ng build --watch --configuration development` | Build continu en mode dev |

## Stack technique (versions fixes)

- Angular `21.2.x`
- TypeScript `~5.9.2`
- Vitest `^4.0.8` + jsdom `^28.0.0`
- Prettier `^3.8.1`
- `@angular/cdk ^21.2.11` (drag & drop)
- `geist ^1.7.0` (polices Geist/Geist Mono)
- Package manager : npm `11.9.0`
