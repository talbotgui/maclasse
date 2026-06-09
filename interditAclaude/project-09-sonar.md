---
name: project-09-sonar
description: Configuration Sonar — exclusions et quality gates du projet
metadata:
  type: project
  updated: 2026-06-05
---

Sonar est configuré via `sonar-project.properties` à la racine du dépôt.

**Why:** Analyse de qualité du code intégrée au projet.

**How to apply:** Le répertoire `ClaudeDesign/` est exclu de l'analyse — c'est intentionnel (maquettes/design non soumis aux règles qualité).

## Configuration actuelle

```properties
sonar.exclusions=ClaudeDesign/**
```

Pas de quality gates personnalisés ni de seuils de couverture définis pour l'instant. À enrichir si des règles sont ajoutées.
