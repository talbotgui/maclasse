---
name: projet-12-ecran-emploi-du-temps
description: Spécification détaillée de l'écran Emploi du temps — colonne gauche liste EDT, grille hebdomadaire centrale, formulaire contextuel droit
metadata:
  type: project
  updated: 2026-06-10
related:
  - projet-03-ecrans
  - projet-02-modelesDonnees
  - projet-05-services
  - projet-04-composantsPartages
  - projet-09-ecran-eleves
---

## Layout général

Trois colonnes — homogène avec les autres écrans :
- **Colonne gauche** : liste des EDT + bouton CRÉER
- **Zone centrale** : grille hebdomadaire de l'EDT sélectionné
- **Colonne droite** : formulaire contextuel (propriétés EDT ou créneau)

---

## Colonne gauche — Liste des EDT

### Bouton CRÉER

- Positionné en haut de la colonne
- Crée un EDT vide, le sélectionne dans la liste, ouvre ses propriétés dans la colonne droite

### Liste des EDT

- Affiche pour chaque EDT : **nom** + **fréquence** (paire / impaire / les deux) + plage de dates si renseignée
- Clic sur un EDT → charge sa grille dans la zone centrale + ouvre ses propriétés dans la colonne droite
- **Icône warning ⚠** sur un EDT si son chevauchement avec un autre EDT est détecté (même plage de dates ET même parité)
  - Tabulable et cliquable (RGAA)
  - Au clic : ouvre `popin-warnings-absences` listant le ou les EDT en conflit

---

## Zone centrale — Grille hebdomadaire

Affichée uniquement quand un EDT est sélectionné dans la colonne gauche.

### Structure

- **Colonnes** : jours ouvrés (`referentiels.configEmploiDuTemps.joursOuvres`)
- **Lignes** : créneaux de l'EDT sélectionné, triés par heure de début ascendante
- Créneaux libres (pas de lignes horaires fixes prédéfinies)

### En-tête de colonne (par jour)

| Élément | Détail |
|---|---|
| Nom du jour | Ex. "Lundi" |
| Bouton **AJOUTER** | Crée un créneau vide en fin de liste pour ce jour, l'ouvre dans la colonne droite |

### Bouton intercalaire "+"

- Visible en permanence entre chaque créneau de la colonne (RGAA)
- Au clic : crée un créneau vide inséré à cette position, l'ouvre dans la colonne droite

### Cellule de créneau (lecture seule dans la grille)

| Élément | Condition |
|---|---|
| Heure début – heure fin | Toujours |
| Type | Toujours (pédagogique / récréation / pause déjeuner) |
| Titre | Type pédagogique |
| Disciplines | Type pédagogique |
| Icône warning ⚠ | Si conflit avec une absence récurrente d'un élève |

#### Icône warning créneau (triangle orange)

- Tabulable et cliquable (RGAA)
- Au clic : ouvre `popin-warnings-absences` listant les conflits du créneau
- Calculé à l'**ouverture** de l'écran et au **chargement d'un EDT** dans la grille

---

## Colonne droite — Formulaire contextuel

Vide si aucun EDT n'est sélectionné. Pas de mode lecture intermédiaire — toujours en mode formulaire.

### État 1 : propriétés de l'EDT sélectionné

Affiché au clic sur un EDT dans la colonne gauche, ou après ANNULER/ENREGISTRER d'un créneau.

#### Boutons d'action

| Bouton | Comportement |
|---|---|
| **ENREGISTRER** | Soumet la commande à `DonneesService` |
| **ANNULER** | Restaure les valeurs initiales de l'EDT |
| **SUPPRIMER** | `mc-bouton-destruction` : supprime l'EDT et tous ses créneaux |

#### Champs

| Champ | Composant | Obligatoire |
|---|---|---|
| Nom | `mc-input` | Oui |
| Date de début | `mc-input` type date | Non |
| Date de fin | `mc-input` type date | Non |
| Fréquence | `mc-radio-group` (paire / impaire / les deux) | Oui |

---

### État 2 : formulaire d'un créneau

Affiché au clic sur une cellule ou sur un bouton AJOUTER / intercalaire "+".

#### Boutons d'action

| Bouton | Comportement |
|---|---|
| **ENREGISTRER** | Soumet la commande à `DonneesService`, revient à l'état 1 (propriétés EDT) |
| **ANNULER** | Abandonne les saisies, revient à l'état 1 |
| **SUPPRIMER** | `mc-bouton-destruction` : supprime le créneau, revient à l'état 1 |

#### Champs

| Champ | Composant | Condition |
|---|---|---|
| Heure de début | `mc-champ-heure` | Toujours |
| Heure de fin | `mc-champ-heure` | Toujours |
| Type | `mc-select` (pédagogique / récréation / pause déjeuner) | Toujours |
| Disciplines | Chips sélectionnables (un chip par domaine de niveau 1) — sélection multiple | Type pédagogique |
| Titre | `mc-input` | Type pédagogique |
| Élèves concernés | `mc-eleves-concernes` | Type pédagogique |

---

## Bouton IMPRIMER

- Positionné dans la colonne droite (ou en haut de la zone centrale)
- Déclenche l'impression via le navigateur (`window.print()`)
- **La colonne gauche n'est pas imprimée** (masquée via `@media print`)

---

## Référentiel EDT

Les jours ouvrés et horaires de début/fin de journée sont configurés dans l'**écran de paramétrage** (section Semaine & Horaires).
