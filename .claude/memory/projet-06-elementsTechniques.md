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
- Redirige vers `/demarrage` si aucune donnée n'est chargée en mémoire
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

`DonneesService` est **agnostique du type de donnée modifiée** : il ne connaît que l'interface `Commande` et appelle `executer()` ou `annuler()` sans se soucier de ce qui change dans le JSON.

Chaque **service métier** est responsable d'instancier la commande appropriée avec les bonnes données avant de la soumettre à `DonneesService`.

### Interface `Commande`

```typescript
interface Commande {
  executer(donnees: DonneesApplication): DonneesApplication;
  annuler(donnees: DonneesApplication): DonneesApplication;
}
```

### Implémentations génériques (indépendantes du type d'entité)

| Classe | Rôle |
|---|---|
| `CommandeCreation` | Ajoute un élément dans un tableau du JSON (élève, EDT, séance, projet…) |
| `CommandeModification` | Remplace un élément existant dans le JSON |
| `CommandeSuppression` | Retire un élément d'un tableau du JSON |
| `CommandeDeplacement` | Déplace un élément dans un tableau (réorganisation des séances) |

> Il n'existe pas de commande spécifique par type d'entité (pas de `CommandeSauvegarderEleve`, `CommandeSauvegarderEdt`, etc.).

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
| Panier compétences | `ContextService` (mémoire session) | Perdu à la fermeture — non critique |
| Mot de passe | `ContextService` (mémoire session) | **Jamais persisté** (sécurité) — perdu à la fermeture |

> Toutes les données métier sont exclusivement portées par le fichier ZIP chiffré.

---

## Routing Angular

Toutes les routes fonctionnelles sont protégées par `DonneesChargeesGarde` qui redirige vers `/demarrage` si aucune donnée n'est chargée.

| Route | Composant | Garde |
|---|---|---|
| `/` | Redirige vers `/accueil` | — |
| `/demarrage` | `EcranDemarrageComponent` | Aucune (toujours accessible) |
| `/accueil` | `EcranAccueilComponent` | `DonneesChargeesGarde` |
| `/competences` | `EcranCompetencesComponent` | `DonneesChargeesGarde` |
| `/eleves` | `EcranElevesComponent` | `DonneesChargeesGarde` |
| `/projets` | `EcranProjetsComponent` | `DonneesChargeesGarde` |
| `/emploi-du-temps` | `EcranEmploiDuTempsComponent` | `DonneesChargeesGarde` |
| `/cahier-journal` | `EcranCahierJournalComponent` | `DonneesChargeesGarde` |

---

## Responsivité (mobile)

Règle générale : les colonnes s'empilent verticalement sur petit écran (gauche en haut, centre au milieu, droite en bas).

| Écran | Ordre d'empilement mobile |
|---|---|
| Démarrage | Zone Nouveau → Zone Charger |
| Élèves / Projets | Filtre+liste → Détail/formulaire |
| Compétences | Filtres → Arbre → Panier |
| Emploi du temps | Sélecteur EDT + grille → Formulaire |
| Cahier journal | Navigation calendrier → Liste séances → Formulaire |
