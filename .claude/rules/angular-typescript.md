---
globs: "**/*.ts"
---

# Règles Angular & TypeScript

## TypeScript

- `strict: true` obligatoire — pas de `any`, utiliser `unknown` si le type est incertain
- Visibilité explicite sur **tous** les membres et méthodes (`public`, `protected` ou `private`) — jamais implicite
- Toute logique utilitaire va dans une classe avec méthodes statiques — les fonctions standalone sont interdites
- Pas de commentaire de séparation de zone (`// ─── Section ───`, `/* === Bloc === */`)

## Architecture Angular

- Angular 21 : composants standalone uniquement, ne PAS écrire `standalone: true` (défaut depuis v20)
- Lazy loading obligatoire pour toutes les routes
- `providedIn: 'root'` pour les services singleton
- `inject()` à la place de l'injection constructeur

## Composants

- `changeDetection: ChangeDetectionStrategy.OnPush` dans chaque `@Component`
- `input()` et `output()` (fonctions) — jamais `@Input`/`@Output`
- **Visibilité des inputs :** `input()` et `model()` liés depuis un template parent → `public readonly` ; `output()`, `computed()`, signaux locaux → `protected`
- Interdire `@HostBinding` et `@HostListener` → utiliser l'objet `host:` du décorateur

## État & réactivité

- `signal()` pour tout état local, `computed()` pour l'état dérivé
- Interdire `mutate()` → utiliser `update()` ou `set()`

## Templates

- Contrôle de flux natif : `@if`, `@for`, `@switch` — jamais `*ngIf`, `*ngFor`, `*ngSwitch`
- Interdire `ngClass` → `[class.foo]="..."` ; interdire `ngStyle` → `[style.color]="..."`
- Pas de `new Date()` ni de globaux dans les templates
- **Ne jamais appeler `output().emit()` directement dans un template** — toujours déléguer à une méthode `protected` du composant :
  ```typescript
  // INTERDIT dans le template
  (click)="annuler.emit()"
  // CORRECT
  (click)="onAnnuler()"
  // avec dans le composant :
  protected onAnnuler(): void { this.annuler.emit(); }
  ```
  **Convention de nommage :** la méthode de délégation s'appelle `on` + nom de l'output avec première lettre en majuscule (`modifier` → `onModifier()`, `annuler` → `onAnnuler()`). Tout output déclaré dans un composant **doit** avoir son `onXxx()` correspondant — sans quoi le template n'a aucun autre moyen légal de le déclencher.

## Formulaires

- Reactive Forms — pas de Template-driven Forms

## Composants ControlValueAccessor

Dans tout composant implémentant `ControlValueAccessor` qui encapsule un `<input>` ou `<textarea>` :

- Lier `(input)` (pas `(change)`) pour notifier Angular Forms en temps réel :
  ```html
  <!-- CORRECT — retour immédiat -->
  (input)="surChangement($any($event.target).value)"
  <!-- INTERDIT — retour différé au blur -->
  (change)="surChangement($any($event.target).value)"
  ```
- `(blur)` reste correct pour `onTouched()`
