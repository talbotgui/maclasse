---
name: feedback-11-couverture-tests
description: Exigence de couverture de code à 80% minimum sur les services — vérifiée après les étapes 3 et 4
metadata:
  type: feedback
  updated: 2026-06-16
related:
  - feedback-08-tests
  - plans-01-generationInitiale
---

## Règle — Couverture minimale de 80% sur les services

Après chaque étape de génération de services (étapes 3 et 4 du plan), la couverture de code doit atteindre **80% minimum** sur les quatre métriques : lignes, branches, fonctions et statements.

**Why:** Exigence explicite du développeur pour garantir la qualité et la non-régression des services métier.

**How to apply:**
- Lancer `ng test --code-coverage` après avoir terminé l'étape 3 (services de contexte) et à nouveau après l'étape 4 (services métier)
- Consulter le rapport de couverture généré
- Si une métrique est sous 80%, écrire des tests supplémentaires ciblant les branches non couvertes avant de passer à l'étape suivante
- Fichiers exclus du calcul : `modeles/`, `gardes/`, `libelles.ts`, `composant-base.ts`, `app.ts`
- La configuration Vitest/coverage est dans `angular.json` (section `test` du projet)
- Seuil 80% s'applique à l'ensemble cumulé des services (pas service par service isolément)
