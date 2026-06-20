---
globs: "**/*"
---

# Conventions de nommage — Français & Organisation

## Nommage en français

Tout ce qui est nommé dans le projet l'est en français : fichiers, classes, méthodes, variables, types, interfaces, routes.

- Classes : `BarreSuperieure`, `EcranCompetences`, `ContexteService`, `ChiffrementService`
- Fichiers : `barre-superieure.ts`, `contexte.service.ts`, `donnees-chargees.garde.ts`
- Méthodes : commencer par un verbe à l'infinitif — `filtrerCompetences()`, `chargerFichier()`, `reinitialiser()`
- Propriétés/variables : `competencesSelectionnees`, `vueActive`, `requeteRecherche`
- Suffixes Angular francisés : `.garde.ts` (jamais `.guard.ts`), `.tuyau.ts` (jamais `.pipe.ts`)

**Exceptions** : ce qu'impose Angular/TypeScript/les librairies reste en anglais (`@Component`, `signal`, `RouterOutlet`…) ainsi que les acronymes techniques (`JsonValue`, `JsonPath`).

## Pas d'underscore sur les membres privés/protégés

Les membres `private` ou `protected` s'écrivent en camelCase simple, sans préfixe `_`.

```typescript
// INTERDIT
private _donneesService = inject(DonneesService);

// CORRECT
private donneesService = inject(DonneesService);
```

Exception légitime : paramètre **volontairement non utilisé** dans une signature (`_id: string`) — uniquement pour les paramètres, jamais pour les membres.

**Cas WritableSignal** : distinguer les noms sans underscore :
```typescript
private readonly donneesModifiables: WritableSignal<...> = signal(null);
public readonly donnees: Signal<...> = this.donneesModifiables.asReadonly();
```

## Organisation des répertoires sous `src/app/`

| Nature | Répertoire | Suffixe | Classe |
|---|---|---|---|
| Services | `services/` | `.service.ts` | `XxxService` |
| Gardes | `gardes/` | `.garde.ts` | `XxxGarde` |
| Directives | `directives/` | `.directive.ts` | `XxxDirective` |
| Tuyaux (pipes) | `tuyaux/` | `.tuyau.ts` | `XxxTuyau` |
| Modèles | `modeles/` | `.modele.ts` | interfaces/types uniquement |
| Utilitaires | `utilitaires/` | `.ts` | classes avec méthodes statiques |
| Écrans (routes) | `ecrans/` | — | un répertoire par écran |
| Composants partagés | `composants/` | — | utilisés par ≥ 2 écrans |

**Sous-composants d'un écran :** préfixe abrégé dérivé du parent (`fe-` pour fiche-eleve, `fp-` pour fiche-projet).
**Composants partagés :** dans `composants/` uniquement si utilisé par au moins deux écrans différents.
