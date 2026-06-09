---
name: feedback-10-composant-base
description: Tous les composants partagés héritent de ComposantBase pour accéder à LIBELLES dans les templates sans redéclaration
metadata:
  type: feedback
---

Tout composant partagé (dans `src/app/composants/`) doit étendre `ComposantBase` (`src/app/composant-base.ts`).

**Why:** `ComposantBase` expose `protected readonly LIBELLES` qui donne accès aux libellés de l'application dans les templates. Sans héritage, chaque composant devrait redéclarer ce membre. L'héritage garantit aussi la cohérence future : un nouveau besoin transverse (ex. ContexteService injecté) s'ajoute une seule fois dans la base.

**How to apply:**
- Tout nouveau composant dans `composants/` commence par `export class MonComposant extends ComposantBase`.
- Importer `ComposantBase` depuis `'../../composant-base'` (chemin relatif depuis le sous-répertoire du composant).
- Dans les templates, utiliser directement `LIBELLES.section.cle` — pas de redéclaration dans le `.ts`.
- Si le composant utilise `LIBELLES` pour une valeur par défaut d'`input()`, conserver l'import direct de `LIBELLES` depuis `'../../libelles'` (les valeurs par défaut sont évaluées au niveau module, pas à l'instance). L'héritage reste obligatoire malgré ce double import.
