---
name: project-01-overview
description: Vue d'ensemble de l'application Ma classe — SPA Angular pour enseignant·e du primaire
metadata:
  type: project
  updated: 2026-06-05
related:
  - project-02-architecture
  - project-07-npm
---

## Règle 1 - Objectif de l'application

**Application Ma classe** — SPA Angular de gestion de classe pour enseignant·e du primaire (CP–CM2).

**Why:** Outil personnel pour un·e enseignant·e, sans backend. Toutes les données vivent côté client (localStorage / export JSON). Aucun appel API.

**How to apply:** Toutes les décisions d'architecture doivent tenir compte du mode SPA offline-first. Toute persistance passe par `JsonHistoriqueService`.

## Règle 2 - Utilisateurs

L'application est utilisée par un enseignant sans compétence technique particulière. 
L'ergonomie de l'application doit donc être simple et compréhensible.

## Règle 3 - Stack technique

- Angular 21.2 (standalone, Signals, control flow natif)
- TypeScript 5.9 strict
- SCSS + CSS custom properties (pas Tailwind, pas de lib UI externe)
- Google Fonts : Newsreader (titres italiques) + Geist (UI) + Geist Mono (codes)
- Vitest pour les tests, Prettier pour le formatage
