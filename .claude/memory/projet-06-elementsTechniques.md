---
name: projet-06-elementsTechniques
description: Éléments purement techniques de MaClasse — gardes, directives, utilitaires, pipes, pattern commande, persistance
metadata:
  type: project
  updated: 2026-06-09
related:
  - projet-05-services
  - feedback-01-angular
  - feedback-02-conventions
---

## Gardes de navigation

### `DonneesChargeesGarde`

- Bloque l'accès à tout écran applicatif si aucune donnée n'est chargée en mémoire
- Redirige vers la popin de démarrage (chargement ou création de fichier)
- Seul garde prévu dans l'application

---

## Directives

### `mcAutoFocus`

- Applique le focus sur l'élément hôte à l'ouverture d'une modale/popin
- Garantit la conformité RGAA (focus géré programmatiquement, pas via autofocus HTML natif)
- Usage : `<input [mcAutoFocus]="true" ...>`

---

## Classes utilitaires (méthodes statiques)

### `DateUtils`

- Calcul de J±1, J±7 à partir d'une ISO date
- Détermination du jour de semaine d'une date (pour filtrage EDT)
- Formatage d'affichage des dates (français : "lundi 9 juin 2026")
- Comparaison de plages horaires (détection de chevauchement, utilisée pour la cohérence absences)
- Calcul de la parité d'une semaine (paire/impaire)

> `CompetenceService` est enrichi directement pour le parcours de l'arbre — pas de classe `CompetenceUtils` séparée.

---

## Pattern Commande (UNDO/REDO)

Interface et implémentations pour toutes les mutations transitant par `DonneesService`.

### Interface `Commande`

```typescript
interface Commande {
  executer(donnees: DonneesApplication): DonneesApplication;
  annuler(donnees: DonneesApplication): DonneesApplication;
}
```

### Implémentations prévues (une par type de mutation)

- `CommandeSauvegarderEleve` (création + modification)
- `CommandeSupprimerEleve`
- `CommandeSauvegarderProjet`
- `CommandeSupprimerProjet`
- `CommandeSauvegarderCreneauEdt`
- `CommandeSupprimerCreneauEdt`
- `CommandeInitialiserJournee`
- `CommandeSauvegarderSeance`
- `CommandeSupprimerSeance`
- `CommandeDeplacerSeance` (réorganisation haut/bas)

---

## Pipes Angular

### `FormatDatePipe`

- Formate une ISO date en libellé français lisible
- Exemples : `"2026-06-09"` → `"lundi 9 juin 2026"` ou `"09/06/2026"` selon le contexte
- Utilisé dans les templates du cahier journal, de l'accueil, des fiches élèves

> D'autres pipes pourront être ajoutés (ex. résolution d'un ID compétence en libellé) au fil des besoins.

---

## Persistance locale

| Donnée | Mécanisme | Justification |
|---|---|---|
| Thème actif | `localStorage` | Préférence visuelle, indépendante du fichier de données |
| Dernier élève sélectionné | `ContextService` (mémoire session) | Perdu à la fermeture — non critique |
| Dernier jour CJ consulté | `ContextService` (mémoire session) | Perdu à la fermeture — non critique |

> Toutes les données métier sont exclusivement portées par le fichier ZIP chiffré.
