---
name: feedback-12-constantes-statiques
description: Toute constante doit être static readonly dans une classe — jamais au niveau module ; les valeurs numériques significatives doivent être nommées
metadata:
  type: feedback
---

## Constantes : static readonly dans leur classe

Toute constante doit être déclarée `private static readonly` (ou `public` si elle doit être accessible de l'extérieur) à l'intérieur de la classe qui l'utilise. Aucune constante ne doit exister au niveau du module (hors d'une classe).

**Why:** Les constantes module-level fuient hors de leur contexte, ne bénéficient pas de la visibilité TypeScript et nuisent à la lisibilité — on ne sait pas à quelle classe elles appartiennent.

**How to apply:**
- Dans une classe utilitaire (`DateUtils`, `TexteUtils`) → `private static readonly NOM = valeur`
- Dans un service → `private static readonly NOM = valeur`
- Dans un composant → `private static readonly NOM = valeur`
- Référencer ensuite via `NomClasse.NOM` dans les méthodes statiques, ou directement `this.NOM` dans les méthodes d'instance

## Valeurs numériques : constantes nommées obligatoires

Toute valeur numérique dont la signification n'est pas évidente doit être nommée par une constante `static readonly`.

**Why:** Les nombres "magiques" rendent le code opaque — `86_400_000` ne dit rien sans son nom `MS_PAR_JOUR`.

**How to apply:** Dans la même classe, déclarer `private static readonly MS_PAR_JOUR = 86_400_000` et utiliser `DateUtils.MS_PAR_JOUR` partout. Exception : `0`, `1`, `-1`, `2` sont acceptables quand leur rôle est évident (index, incrément, négation).
