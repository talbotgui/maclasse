---
name: competences
description: Spécification détaillée de l'écran Compétences — arbre filtrable, panier et export vers projet/cahier journal
metadata:
  type: project
  updated: 2026-09-27
related:
  - specification/ecrans/vue-ensemble
  - specification/modeles-donnees
  - specification/composants-partages
  - specification/services
---

## Maquette

![06-competences](../../../.maquettes/06-competences.png)

**Cohérence globale** : 3 colonnes (filtres, arbre replié par défaut, panier persistant), indicateur "au panier" sur les compétences sélectionnées, boutons VIDER + "Envoyer vers un projet" / "Envoyer vers une séance", popin d'export avec sélects en cascade (projet puis période) — tout correspond.

**Note mobile** : la maquette mobile affiche un panneau "Panier – N compétences ^" en bas de l'écran (tiroir). Ce comportement n'est pas explicitement décrit dans la doc mais est cohérent avec la contrainte responsive.

---

## Layout général

Deux zones côte à côte :
- **Zone gauche** : composant `mc-arbre-competences` (filtres + arbre intégrés)
- **Zone droite** : panier de compétences sélectionnées

Écran en **lecture seule** — aucune modification des compétences dans cette version.

C'est le seul écran accessible en **mode consultation du référentiel** (voir [démarrage](demarrage.md#zone-référentiel-de-compétences)).

---

## Zone gauche — `mc-arbre-competences`

Le composant `mc-arbre-competences` intègre les trois sous-zones suivantes :

| Sous-zone | Détail |
|---|---|
| Champ `mc-champ-recherche` | Filtre textuel en temps réel sur les libellés (tous niveaux de l'arbre) |
| Chips `mc-chip-filtre` par domaine | Un chip par entrée de niveau 1 de l'arbre ; sélection/désélection cumulative |
| Arbre des compétences | Voir ci-dessous |

- Les deux filtres sont **cumulatifs** (ET logique)
- Pas de bouton "Réinitialiser les filtres"

### Domaines actifs

- L'arbre et les chips de domaine ne montrent que les **domaines actifs** : `CompetenceService.obtenirDomaines()` filtre l'arbre selon `configuration.domainesActifs` (tous les domaines si la liste est absente ou vide ; voir [services](../services.md#competenceservice))
- Sous l'arbre, un paragraphe d'information renvoie au Paramétrage : *« Tous les domaines sont disponibles et activables dans l'écran Paramétrage. »* (`LIBELLES.competences.infoDomainesParametrage`) — les domaines se choisissent dans la section « Domaines de compétences » du [paramétrage](parametrage.md#section-domaines-de-compétences)

### Arbre des compétences

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

### Interaction avec une compétence

- Le libellé de la compétence n'est **pas cliquable** (navigation clavier uniquement via flèches ARIA)
- Chaque ligne expose un **bouton "+"** à droite du libellé
  - Clic → ajout au panier si la compétence n'y est pas déjà
  - **Désactivé** (`disabled`) si la compétence est déjà dans le panier
  - `aria-label` = "Ajouter au panier : {libellé}"
  - `id` = `btnAjouterPanier_{id}`
- Indicateur visuel (couleur primaire + gras) sur les compétences déjà dans le panier (classe `--dans-panier`)
- Aucun indicateur d'utilisation dans les projets ou séances

---

## Colonne droite — Panier

- **Persisté** entre les accès à l'écran via `ContexteService`
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
Après un export réussi, le panier est **automatiquement vidé**.

Les deux exports passent par `popin-export-competences` (voir [composants-partages](../composants-partages.md#popin-export-competences)). CONFIRMER n'est actif qu'une fois les deux listes renseignées.

**Échec de l'export** : si la période ou la séance ciblée n'existe plus au moment de l'export, un message s'affiche au-dessus des boutons (`role="alert"`) : *« L'export a échoué : la période ou la séance ciblée n'existe plus. Le panier a été conservé. »* ; le panier n'est **pas** vidé. Le message disparaît au prochain export réussi.

#### Bouton "Envoyer vers un projet"

Au clic, ouvre une **popin** contenant :
1. Liste déroulante `mc-select` — *Choisir un projet* (liste de tous les projets)
2. Liste déroulante `mc-select` — *Choisir une période* (périodes du projet sélectionné)
- Bouton **ANNULER** : ferme la popin sans action
- Bouton **CONFIRMER** : ajoute les compétences du panier à la `ProjetPeriode` sélectionnée (sans doublon) via `ProjetService.modifierPeriode`, puis **vide le panier**

#### Bouton "Envoyer vers une séance"

Au clic, ouvre une **popin** contenant :
1. Liste déroulante `mc-select` — *Jour* : les journées du cahier journal qui ont **au moins une séance pédagogique**, dates affichées au format **JJ/MM/AAAA**
2. Liste déroulante `mc-select` — *Séance* : séances pédagogiques de la journée choisie (titre, ou « hh:mm – hh:mm » sans titre)
- Bouton **ANNULER** : ferme la popin sans action
- Bouton **CONFIRMER** : ajoute les compétences du panier à la séance sélectionnée (sans doublon) via `CahierJournalService.modifierSeance`, puis **vide le panier**
