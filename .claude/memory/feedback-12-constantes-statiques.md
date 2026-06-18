---
name: feedback-12-constantes-statiques
description: Chercher les constantes existantes avant d'en créer une nouvelle ; toute constante dans sa classe en static readonly ; valeurs numériques significatives nommées
metadata:
  type: feedback
---

## Chercher avant de créer

Avant de déclarer une nouvelle constante, vérifier qu'elle n'existe pas déjà ailleurs dans le projet : dans `LIBELLES` (libelles.ts), dans les classes utilitaires (`DateUtils`, `TexteUtils`…), dans les services ou les modèles.

**Why:** Les doublons de constantes se produisent naturellement lors de la génération de nouveaux fichiers. Les noms des jours de la semaine ont été dupliqués dans `DateUtils` et `McMiniCalendrierComponent` avant d'être factorisés dans `LIBELLES.dates.nomsJours`.

**How to apply:**
- Pour toute chaîne de caractères affichée à l'écran → chercher d'abord dans `LIBELLES`
- Pour toute valeur numérique ou tableau réutilisable → chercher dans les classes utilitaires et les services
- Si la constante existe déjà, l'importer et la réutiliser ; ne jamais la redéclarer localement
- Si elle n'existe pas encore dans un endroit partagé, l'y créer plutôt que de la déclarer dans la classe courante

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
