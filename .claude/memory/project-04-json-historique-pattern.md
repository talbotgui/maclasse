---
name: project-04-json-historique-pattern
description: Contrat et usage de JsonHistoriqueService — pattern Redux immutable avec undo/redo
metadata:
  type: project
  updated: 2026-06-05
related:
  - project-03-modeles
  - project-02-architecture
  - feedback-08-tests
---

`JsonHistoriqueService` est la **source de vérité unique** pour toutes les données métier. Toute modification passe par `appliquer()`. Aucune mutation directe du JSON.

**Why:** Pattern Redux garantissant l'immutabilité, le undo/redo et la traçabilité de chaque changement.

**How to apply:** Pour toute écriture de données, créer ou réutiliser une classe `Modification` et appeler `service.appliquer(modification)`. Ne jamais modifier `etat()` directement.

## API publique

```typescript
etat: Signal<JsonValue>                          // état courant (lecture seule)
etatTypee<T>(): T                                // état casté
journal: Signal<ReadonlyArray<Modification>>     // historique chronologique
peutAnnuler: Signal<boolean>                     // computed
peutRefaire: Signal<boolean>                    // computed

appliquer(modification: Modification): void
annuler(): void                                  // UNDO
refaire(): void                                 // REDO
reinitialiser(etatInitial?: JsonValue): void
```

## Types de modifications disponibles

| Classe | Action | Inverse |
|--------|--------|---------|
| `AjouterNoeudObjet` | Ajoute un objet dans un attribut | `SupprimerNoeudAttribut` |
| `AjouterNoeudTableauVide` | Ajoute un tableau vide dans un attribut | `SupprimerNoeudAttribut` |
| `AjouterNoeudQuelconque` | Ajoute n'importe quelle valeur *(réservé undo/redo)* | — |
| `ModifierNoeud` | Modifie plusieurs attributs primitifs d'un objet | `ModifierNoeud` (valeurs précédentes) |
| `SupprimerNoeudAttribut` | Supprime un attribut d'un objet | `AjouterNoeudQuelconque` |
| `AjouterElementTableau` | Insère un objet à un index dans un tableau | `SupprimerElementTableau` |
| `SupprimerElementTableau` | Retire un élément par index | `AjouterElementTableau` |
| `AjouterValeurTableau` | Insère une valeur primitive à un index | `SupprimerValeurTableau` |
| `SupprimerValeurTableau` | Retire une valeur primitive par index | `AjouterValeurTableau` |
| `DeplacerElementTableau` | Déplace un élément d'un index à un autre | `DeplacerElementTableau` (inversé) |

## Ajouter un nouveau type de modification

1. Créer une classe dans `services/modifications/` qui étend `Modification`
2. Déclarer `readonly action: string` (identifiant unique, ex. `'ajouterDiscipline'`)
3. Implémenter `appliquer(json: JsonValue): JsonValue` — **immutable**, retourner un nouvel objet
4. Implémenter `inverser(): Modification` — retourner la modification opposée avec les anciennes valeurs
5. Optionnel : `readonly reserveUndoRedo = true` si la modification est interne au mécanisme undo/redo

```typescript
export class MaModification extends Modification {
  readonly action = 'maModification';

  constructor(private readonly chemin: string, private readonly valeur: unknown) {
    super();
  }

  public appliquer(json: JsonValue): JsonValue {
    // retourner une copie modifiée, jamais muter json
  }

  public inverser(): Modification {
    return new ModificationInverse(this.chemin, /* ancienne valeur */);
  }
}
```

## Chemins JSON

Les chemins utilisent la notation pointée : `'classe.eleves'`, `'referentiels.periodes'`, `'cahierJournal'`.
