---
name: projet-10-ecran-projets
description: Spécification détaillée de l'écran Projets — structure similaire à l'écran Élèves
metadata:
  type: project
  updated: 2026-06-09
related:
  - projet-09-ecran-eleves
  - projet-03-ecrans
  - projet-02-modelesDonnees
  - projet-04-composantsPartages
---

## Layout général

Identique à l'écran Élèves : deux colonnes côte à côte.
- **Colonne gauche** : navigation dans la liste des projets
- **Colonne droite** : détail / formulaire (vide à l'ouverture de l'écran)

Mêmes comportements que l'écran Élèves : popin d'avertissement si formulaire non enregistré (au clic sur un autre projet, sur CRÉER, ou au changement d'écran).

---

## Colonne gauche

### Bouton CRÉER

- Positionné en haut, au-dessus du filtre textuel
- Comportement identique à l'écran Élèves (popin d'avertissement si formulaire ouvert)

### Filtre textuel

- Champ `mc-champ-recherche`, déclenchement à la frappe
- Filtre sur le nom du projet

### Chips de filtrage par domaine de compétence

- Une chip `mc-chip-filtre` par domaine (niveau 1 de l'arbre des compétences)
- Filtre sur les domaines des compétences associées aux projets
- Combiné avec le filtre textuel

### Liste des projets

- Affiche le **nom du projet** uniquement
- Au clic : affiche la fiche en lecture seule + mémorise dans `ContextService`

---

## Colonne droite — Bandeau supérieur

### Mode lecture seule

| Élément | Détail |
|---|---|
| Nom du projet | Affiché en titre |
| Bouton **MODIFIER** | Bascule en mode formulaire |
| Bouton **SUPPRIMER** | `mc-bouton-destruction` : ANNULER + CONFIRMER au premier clic |

### Mode formulaire (création ou modification)

| Élément | Détail |
|---|---|
| Champ Nom | `mc-input` éditable directement dans le bandeau |
| Bouton **ANNULER** | Revient en lecture seule sans modifier le JSON |
| Bouton **ENREGISTRER** | Soumet la commande à `DonneesService`, bascule en lecture seule |

---

## Colonne droite — Sections de la fiche

### Section Informations générales

| Champ | Mode lecture | Mode formulaire |
|---|---|---|
| Nom | Affiché dans le bandeau | Éditable dans le bandeau |
| Description | Texte libre | `mc-textarea` |
| Élèves associés | Liste de prénoms+noms séparés par une virgule | Chips sélectionnables/désélectionnables (un chip par élève de la classe) |

### Section Périodes

- Périodes triées par **date de début ascendante**
- Bouton **AJOUTER UNE PÉRIODE** (mode formulaire uniquement)
- Chaque période dispose d'un bouton **SUPPRIMER** (`mc-bouton-destruction`) en mode formulaire

#### Mode lecture — chaque période

| Élément | Détail |
|---|---|
| Nom de la période | Titre de la période |
| Dates | Début – Fin (format "jj/mm/aaaa") |
| Description | Texte affiché |
| Compétences | Liste des libellés complets des compétences sélectionnées |

#### Mode formulaire — chaque période (éditable inline)

| Champ | Composant |
|---|---|
| Nom de la période | `mc-input` texte |
| Date de début | `mc-input` type date |
| Date de fin | `mc-input` type date |
| Description | `mc-textarea` |
| Compétences | `mc-selecteur-competences` (arbre filtrable, sélection multiple) |

---

## Bouton IMPRIMER

- Positionné dans la colonne droite (bandeau ou bas de fiche)
- Déclenche l'impression via le navigateur (`window.print()`)
- **La colonne gauche n'est pas imprimée** (masquée via `@media print`)
- Uniquement disponible en mode lecture seule
