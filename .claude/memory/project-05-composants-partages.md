---
name: project-05-composants-partages
description: Catalogue des composants partagés et directives réutilisables — API inputs/outputs
metadata:
  type: project
  updated: 2026-06-05
related:
  - feedback-04-rgaa
  - feedback-07-html
---

Tous les composants partagés sont dans `Sources/src/app/composants/`, les directives dans `Sources/src/app/directives/`.

**Why:** Éviter de recréer ce qui existe déjà et respecter les contrats d'interface définis.

**How to apply:** Avant de créer un nouveau composant, vérifier si un composant partagé couvre le besoin. Mettre à jour ce fichier à chaque ajout.

## Composants

### `BarreSuperieure` — `app-barre-superieure`

Barre de navigation persistante en haut de l'app. Masquée si aucun fichier chargé.

- Inputs : aucun
- Outputs : aucun
- Contient : `BoutonTheme`, boutons UNDO/REDO, sauvegarde automatique (toutes les 5 min), bouton impression

### `BoutonTheme` — `app-bouton-theme`

Popover de sélection parmi les 9 thèmes. Persiste le choix en localStorage (`'ma-classe:theme'`).

- Inputs : aucun
- Outputs : aucun

### `SelecteurCompetences` — `app-selecteur-competences`

Sélecteur de compétences avec tags, champ de recherche et navigation clavier (↑↓ Enter Esc).

- `competencesIds = input<string[]>([])` — ids sélectionnés
- `toutesCompetences = input<CompetenceAplatie[]>([])` — liste à plat des compétences disponibles (type `CompetenceAplatie` dans `modeles/noeud-competence.ts`)
- `contexteId = input<string>('')` — suffixe pour les ids HTML (obligatoire si plusieurs instances simultanées)
- `disabled = input<boolean>(false)` — mode lecture seule (chips sans × ni champ de recherche)
- `competencesModifiees = output<string[]>()` — émis à chaque changement de sélection

### `Separateur` — `app-separateur`

Séparateur visuel horizontal (`<hr>` stylée). Aucun input/output.

### `BarreActionsDetail` — `app-barre-actions-detail`

Barre d'actions pour les pages maître-détail. Affiche Modifier (mode lecture) ou Annuler + Enregistrer (mode édition).

- `modeEdition = input.required<boolean>()` — mode courant
- `aSelection = input.required<boolean>()` — masque la barre si faux
- `modifier = output<void>()`, `annuler = output<void>()`, `enregistrer = output<void>()`

## Directives

### `AutoFocusDirective` — `[mcAutoFocus]`

Applique le focus sur l'élément hôte au `ngAfterViewInit`. Utilisée sur le premier élément focusable à l'ouverture de toute modale ou panneau.

- Inputs : aucun
- Outputs : aucun

Voir [[feedback-04-rgaa]] pour la règle d'utilisation.
