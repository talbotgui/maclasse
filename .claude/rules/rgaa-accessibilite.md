---
globs: ["**/*.html", "**/*.ts"]
---

# RGAA — Accessibilité

## Focus automatique sur les modales

À l'ouverture de toute modale, le focus doit être déplacé automatiquement vers le premier élément focusable.

Utiliser la directive `[mcAutoFocus]` (dans `src/app/directives/mc-auto-focus.directive.ts`) sur le premier `<input>`, `<button>` ou élément focusable de chaque modale. S'applique à **toute** nouvelle modale.

## Balises natives plutôt que rôles ARIA

| À éviter | À utiliser |
|---|---|
| `<div role="dialog">` | `<dialog open>` |
| `<div role="listbox">` | `<ul>` |
| `<button role="option">` | `<li><button>` |
| `<div role="menu">` | Structurer sémantiquement sans rôle |

Utiliser `<button>` pour toutes les interactions cliquables — jamais `<div>` ou `<span>`.

## Focus à la création d'un formulaire

Au clic sur CRÉER, le focus doit se placer sur le premier champ éditable.

Pattern obligatoire sur tout composant formulaire :
- Exposer un `input()` booléen nommé `focusDemande`
- Mettre `[mcAutoFocus]="focusDemande"` sur le premier champ éditable

Le parent gère la valeur :
- **Formulaire sous `@if`** (Élèves, Projets, EDT) : `[focusDemande]="true"` (statique — le composant est recréé)
- **Formulaire toujours dans le DOM** (Cahier Journal) : signal réactif, ex. `[focusDemande]="enCreationSeance()"`

## Contrôle qualité

- Tous les contrôles AXE doivent passer au vert
- Respecter WCAG AA : contraste des couleurs, gestion du focus, attributs ARIA
- Focus visible préservé sur tous les éléments interactifs
