---
name: feedback-01-angular
description: Règles strictes de codage TypeScript & Angular à appliquer sur ce projet sans exception
metadata:
  type: feedback
  updated: 2026-06-05
related:
  - feedback-04-rgaa
  - feedback-07-html
  - feedback-05-scss
---

## TypeScript

- Vérification stricte des types obligatoire (`strict: true`)
- Préférer l'inférence de type quand le type est évident
- Interdire `any` ; utiliser `unknown` quand le type est incertain
- **Visibilité obligatoire sur tous les membres et méthodes de classe**, y compris ceux qui sont `public` (ne jamais laisser la visibilité implicite)
- Toujours coder une méthode dans une classe TS (les fonctions utilitaires standalone sont interdites — les mettre dans une classe avec méthodes statiques)
- Ne jamais utiliser de commentaire pour délimiter une zone dans un fichier JS ou TS (pas de `// ─── Section ───`, `/* === Bloc === */`, etc.)

## Angular — Architecture

- Angular 21 (standalone, Signals, control flow natif) avec TypeScript strict
- Sensibilité forte à l'accessibilité : exige la conformité RGAA/WCAG AA (Sonar, AXE)
- Sensibilité forte à la qualité : Sonar sans erreurs, conventions strictes
- Vitest pour les tests — instanciation directe, sans TestBed ni mocks
- Toujours utiliser des composants standalone (jamais de NgModules)
- Ne PAS écrire `standalone: true` dans les décorateurs — c'est le défaut depuis Angular v20+
- Lazy loading obligatoire pour toutes les routes de fonctionnalités
- `providedIn: 'root'` pour les services singleton
- Utiliser `inject()` à la place de l'injection via constructeur

## Angular — Composants

- `changeDetection: ChangeDetectionStrategy.OnPush` dans chaque `@Component`
- Utiliser `input()` et `output()` (fonctions) — pas les décorateurs `@Input`/`@Output`
- **Visibilité des inputs Angular 21** : les `input()` et `model()` liés depuis un template PARENT doivent être `public readonly`. Les `output()`, `computed()` et signaux locaux utilisés uniquement dans le template propre du composant restent `protected`. Ne jamais laisser la visibilité implicite.
- Garder les composants petits, centrés sur une seule responsabilité
- Préférer les templates inline pour les petits composants
- Chemins templates/styles relatifs au fichier TS du composant (pas absolus)
- Interdire `@HostBinding` et `@HostListener` — utiliser l'objet `host` du décorateur

## Angular — État & réactivité

- Signals pour tout état local (`signal()`)
- `computed()` pour l'état dérivé
- Interdire `mutate()` sur les signals — utiliser `update()` ou `set()`
- Garder les transformations d'état pures et prévisibles

## Angular — Templates

- Garder les templates simples, sans logique complexe
- Contrôle de flux natif : `@if`, `@for`, `@switch` — jamais `*ngIf`, `*ngFor`, `*ngSwitch`
- Pipe `async` pour les observables dans les templates
- Ne pas supposer des globaux comme `new Date()` disponibles dans les templates
- Interdire `ngClass` — utiliser les bindings de classes (`[class.foo]="..."`)
- Interdire `ngStyle` — utiliser les bindings de styles (`[style.color]="..."`)

## Angular — Formulaires

- Préférer les Reactive Forms aux Template-driven Forms

## Accessibilité (RGAA / WCAG AA)

- Tous les contrôles AXE doivent passer au vert
- Respecter WCAG AA : contraste des couleurs, gestion du focus, attributs ARIA
- Focus visible préservé sur tous les éléments interactifs
- Utiliser `<button>` pour toutes les interactions cliquables (pas `<div>`)

**Why:** Conventions définies par l'utilisateur pour ce projet. Elles garantissent la maintenabilité, la performance et l'accessibilité de l'app.

**How to apply:** S'appliquent à chaque fichier TS/HTML/SCSS créé ou modifié dans `src/`.
