---
name: feedback-14-modeles-dto
description: Toute interface ou classe décrivant une donnée (DTO) doit être dans src/app/modeles/ — jamais dans un service ou composant
metadata:
  type: feedback
---

## DTOs et interfaces de données dans src/app/modeles/

Toute `interface` ou `class` décrivant une structure de données métier (DTO) doit être déclarée dans un fichier dédié du répertoire `src/app/modeles/`, nommé `*.modele.ts`.

**Why:** Déclarer un DTO dans un service mélange la couche de données et la couche métier. Cela crée des dépendances de sens inverse (d'autres services devant importer le service "propriétaire" du DTO pour obtenir son type).

**How to apply:**
- Créer ou compléter le fichier `src/app/modeles/<domaine>.modele.ts` correspondant
- Exemples existants : `ResultatRecherche` → `src/app/modeles/recherche.modele.ts`
- L'import dans le service devient : `import { ResultatRecherche } from '../../modeles/recherche.modele'`
- Les classes utilitaires (`DateUtils`, `TexteUtils`) ne sont pas des DTOs — elles restent dans `src/app/utilitaires/`
