---
globs: "**/*.ts"
---

# Architecture — Règles structurelles

## ComposantBase pour les composants partagés

Tout composant dans `src/app/composants/` doit étendre `ComposantBase` (`src/app/composant-base.ts`).

```typescript
export class MonComposant extends ComposantBase { ... }
// import depuis '../../composant-base'
```

Dans les templates, utiliser directement `LIBELLES.section.cle` sans redéclaration dans le `.ts`.

Exception : si le composant utilise `LIBELLES` dans une valeur par défaut d'`input()`, conserver l'import direct de `LIBELLES` depuis `'../../libelles'` en plus de l'héritage.

## DTOs dans `src/app/modeles/`

Toute `interface` ou `class` décrivant une structure de données métier doit être dans `src/app/modeles/<domaine>.modele.ts`.

Jamais de DTO dans un service ou un composant.

```typescript
// Import dans le service
import { ResultatRecherche } from '../../modeles/recherche.modele';
```

## Constantes : static readonly dans leur classe

Toute constante doit être déclarée `static readonly` à l'intérieur de sa classe. Aucune constante au niveau du module (hors d'une classe).

```typescript
// Dans DateUtils, un service, ou un composant :
private static readonly MS_PAR_JOUR = 86_400_000;
```

Toute valeur numérique dont la signification n'est pas évidente doit être nommée.
Exception : `0`, `1`, `-1`, `2` quand leur rôle est évident.

## Chercher avant de créer

Avant de déclarer une nouvelle constante ou valeur :

1. Chercher dans `LIBELLES` (`libelles.ts`) pour toute chaîne affichée à l'écran
2. Chercher dans les classes utilitaires (`DateUtils`, `TexteUtils`…) pour les valeurs numériques ou tableaux
3. Chercher dans les services et modèles

Si la constante existe déjà → l'importer et la réutiliser, jamais la redéclarer localement.
Si elle n'existe pas dans un endroit partagé → la créer là-bas plutôt que dans la classe courante.
