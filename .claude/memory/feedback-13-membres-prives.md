---
name: feedback-13-membres-prives
description: Les membres privés et protégés de classe ne doivent PAS être préfixés par un underscore — simplement camelCase
metadata:
  type: feedback
---

## Pas d'underscore sur les membres privés/protégés

Les membres `private` ou `protected` (champs, méthodes) ne doivent pas être préfixés par `_`. On utilise simplement le camelCase.

```typescript
// INTERDIT
private _donneesService = inject(DonneesService);
private _timer: ReturnType<typeof setInterval> | null = null;
private _normaliser(texte: string): string { ... }

// CORRECT
private donneesService = inject(DonneesService);
private timer: ReturnType<typeof setInterval> | null = null;
private normaliser(texte: string): string { ... }
```

**Why:** TypeScript exprime déjà la visibilité via `private`/`protected`. L'underscore est un héritage de langages sans visibilité native (Python, JS ES5) ; il est redondant et visuellement bruyant.

**How to apply:** Exception légitime : paramètres **volontairement non utilisés** dans une signature (`estRaisonAbsenceUtilisee(_id: string)` → le `_` signale que le paramètre est intentionnellement ignoré, convention TypeScript/ESLint). Cela concerne uniquement les **paramètres**, jamais les membres de classe.

**Cas particulier `WritableSignal`** : quand un signal privé écritable coexiste avec un signal public en lecture seule, distinguer les noms sans underscore. Exemple :
```typescript
private readonly donneesModifiables: WritableSignal<...> = signal(null);
public readonly donnees: Signal<...> = this.donneesModifiables.asReadonly();
```
