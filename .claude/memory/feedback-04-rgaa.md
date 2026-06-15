---
name: feedback-04-rgaa
description: Règle RGAA — focus automatique à l'ouverture de toute modale + préférer les balises natives aux rôles ARIA
metadata:
  type: feedback
  updated: 2026-06-05
related:
  - feedback-01-angular
  - projet-04-composantsPartages
---

## Règle 1 — Focus automatique sur les modales

À l'ouverture de toute modale, le focus doit être déplacé automatiquement vers le premier élément focusable affiché.

**Why:** Exigence RGAA (accessibilité). Sans cela, les utilisateurs clavier et lecteurs d'écran restent piégés derrière la modale.

**How to apply:** Utiliser la directive `mcAutoFocus` (sélecteur `[mcAutoFocus]`, dans `src/app/directives/mc-auto-focus.directive.ts`) sur le premier `<input>`, `<button>` ou élément focusable de chaque modale. Cette règle s'applique à TOUTE nouvelle modale créée dans le projet.

## Règle 2 — Balises natives plutôt que rôles ARIA

Toujours préférer la balise HTML native plutôt qu'un rôle ARIA équivalent :

| À éviter | À utiliser |
|----------|-----------|
| `<div role="dialog">` | `<dialog open>` |
| `<div role="listbox">` | `<ul>` |
| `<button role="option">` | `<li><button>` |
| `<div role="menu">` | Supprimer le rôle, structurer sémantiquement |

**Why:** Sonar remonte "Prefer tag over Aria role" ; les balises natives sont mieux supportées par les technologies d'assistance.

**How to apply:** Lors d'un refactoring ARIA, vérifier avec Sonar qu'aucune occurrence de `role="listbox"`, `role="option"`, `role="dialog"`, `role="menu"`, `role="menuitem"` ne subsiste.
