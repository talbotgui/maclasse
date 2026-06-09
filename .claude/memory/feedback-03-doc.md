---
name: feedback-03-doc
description: JSDoc complète et rédigée sur toutes les classes, membres et méthodes — sans exception
metadata:
  type: feedback
  updated: 2026-06-07
---

## Règle — JSDoc complète

Toute classe, interface, type exporté, champ (public, protégé ET privé), propriété, constante exportée et méthode doit porter une JSDoc rédigée — jamais vide (`/** */`).

**Why:** La JSDoc vide ne sert à rien. Une JSDoc rédigée permet la navigation, l'auto-complétion et la revue de code sans avoir à lire l'implémentation.

**How to apply:**
- `/** Description courte. */` pour les membres simples dont le nom ne suffit pas.
- Bloc multi-lignes pour les classes, interfaces et méthodes complexes.
- `@param nomParam Description du paramètre.` pour chaque paramètre de méthode.
- `@returns Description de la valeur retournée.` dès que le retour n'est pas `void`.
- `@throws NomErreur Condition de levée.` si une erreur peut être levée.
- Les champs privés préfixés `_` doivent aussi avoir une JSDoc (ils font partie du contrat interne).
- Les constantes exportées (`export const`) doivent avoir une JSDoc décrivant leur rôle et leur contenu.
