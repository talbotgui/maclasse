---
name: projet-11-ecran-competences
description: Spécification détaillée de l'écran Compétences — arbre filtrable, panier et export vers projet/cahier journal
metadata:
  type: project
  updated: 2026-06-09
related:
  - projet-03-ecrans
  - projet-02-modelesDonnees
  - projet-04-composantsPartages
  - projet-05-services
---

## Layout général

Trois colonnes côte à côte :
- **Colonne gauche** : filtres (recherche textuelle + chips de domaine)
- **Zone centrale** : arbre des compétences
- **Colonne droite** : panier de compétences sélectionnées

Écran en **lecture seule** — aucune modification des compétences dans cette version.

---

## Colonne gauche — Filtres

| Élément | Détail |
|---|---|
| Champ `mc-champ-recherche` | Filtre textuel en temps réel sur les libellés (tous niveaux de l'arbre) |
| Chips `mc-chip-filtre` par domaine | Un chip par entrée de niveau 1 de l'arbre ; sélection/désélection cumulative |

- Les deux filtres sont **cumulatifs** (ET logique)
- Pas de bouton "Réinitialiser les filtres"

---

## Zone centrale — Arbre des compétences

### Affichage par défaut

- Tous les nœuds sont **repliés** à l'ouverture
- Les nœuds intermédiaires (domaine, sous-domaine) sont **expandables/repliables** manuellement :
  - Clic sur le nœud
  - Clavier : Entrée / Espace pour basculer, flèches pour naviguer (conformité RGAA)

### Comportement avec filtre actif

- Seuls les nœuds correspondant au filtre textuel sont **affichés**
- Leurs **nœuds ascendants** sont affichés et automatiquement dépliés
- Les nœuds non correspondants sont **masqués** (pas grisés)
- Quand les filtres sont vidés, l'arbre revient à son état replié par défaut

### Interaction avec une compétence feuille

- **Clic** sur une compétence feuille → ajout au panier (si elle n'y est pas déjà)
- Indicateur visuel sur la compétence déjà présente dans le panier (ex. icône ou style distinct)
- Aucun indicateur d'utilisation dans les projets ou séances

---

## Colonne droite — Panier

- **Persisté** entre les accès à l'écran via `ContextService`
- **Pas de doublon** : une compétence ne peut être ajoutée qu'une seule fois

### Contenu

Pour chaque compétence dans le panier :

| Élément | Détail |
|---|---|
| Libellé | Libellé long complet de la compétence |
| Icône suppression | Retire la compétence du panier |

### Boutons d'action (en bas de la colonne)

#### Bouton "VIDER LA LISTE"

- Vide intégralement le panier (sans confirmation)
- Toujours visible, désactivé si le panier est vide

#### Boutons d'export

Les deux boutons d'export sont **désactivés** si le panier est vide.  
Après un export confirmé, le panier est **automatiquement vidé**.

#### Bouton "Envoyer vers un projet"

Au clic, ouvre une **popin** contenant :
1. Liste déroulante `mc-select` — *Choisir un projet* (liste de tous les projets)
2. Liste déroulante `mc-select` — *Choisir une période* (périodes du projet sélectionné)
- Bouton **ANNULER** : ferme la popin sans action
- Bouton **CONFIRMER** : ajoute les compétences du panier à la `ProjetPeriode` sélectionnée (sans doublon) via `ProjetService`, puis **vide le panier**

#### Bouton "Envoyer vers une séance"

Au clic, ouvre une **popin** contenant :
1. `mc-input` type date — *Choisir un jour* (date libre, ex. "2026-06-09")
2. Liste déroulante `mc-select` — *Choisir une séance* (séances pédagogiques du jour sélectionné, si entrée CJ existante)
- Bouton **ANNULER** : ferme la popin sans action
- Bouton **CONFIRMER** : ajoute les compétences du panier à la séance sélectionnée (sans doublon) via `CahierJournalService`, puis **vide le panier**
