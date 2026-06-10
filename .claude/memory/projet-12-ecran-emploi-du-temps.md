---
name: projet-12-ecran-emploi-du-temps
description: Spécification détaillée de l'écran Emploi du temps — multi-EDT, grille hebdomadaire éditable, colonne droite contextuelle
metadata:
  type: project
  updated: 2026-06-09
related:
  - projet-03-ecrans
  - projet-02-modelesDonnees
  - projet-05-services
  - projet-04-composantsPartages
---

## Layout général

Trois zones :
- **Barre de sélection** (haut) : sélection et création d'un EDT
- **Zone principale** : grille hebdomadaire de l'EDT sélectionné
- **Colonne droite** : formulaire contextuel (EDT ou créneau selon la sélection)

---

## Barre de sélection (haut)

| Élément | Détail |
|---|---|
| `mc-select` | Liste de tous les EDT (affiche le nom). Sélection charge la grille et le formulaire EDT dans la colonne droite |
| Bouton **CRÉER** | Crée un nouvel EDT vide, le sélectionne dans le `mc-select`, ouvre son formulaire dans la colonne droite |

---

## Zone principale — Grille hebdomadaire

### Structure

- **Colonnes** : jours ouvrés (`referentiels.configEmploiDuTemps.joursOuvres`)
- **Lignes** : créneaux de l'EDT sélectionné, triés par heure de début ascendante
- Créneaux libres (pas de lignes horaires fixes)

### En-tête de colonne (par jour)

| Élément | Détail |
|---|---|
| Nom du jour | Ex. "Lundi" |
| Bouton **AJOUTER** | Crée un créneau vide en fin de liste pour ce jour, l'ouvre dans la colonne droite |

### Bouton intercalaire "+"

- Un bouton **+** visible en permanence entre chaque créneau de la colonne (RGAA : toujours visible)
- Au clic : crée un créneau vide inséré à cette position, l'ouvre dans la colonne droite

### Cellule de créneau (lecture seule dans la grille)

| Élément | Condition |
|---|---|
| Heure début – heure fin | Toujours |
| Type | Toujours (pédagogique / récréation / pause déjeuner) |
| Titre | Type pédagogique uniquement |
| Disciplines | Type pédagogique uniquement |
| Icône warning ⚠ | Si conflit avec absence récurrente d'un élève |

#### Icône warning (triangle orange)

- Tabulable et cliquable (RGAA)
- Au clic : ouvre `popin-warnings-absences` listant les conflits du créneau
- Calculé à l'**ouverture** de l'écran et **avant la sauvegarde** (`EmploiDuTempsService`)

### Sélection d'un créneau

- Clic sur une cellule → charge le formulaire du créneau dans la colonne droite
- Le formulaire EDT (colonne droite) est remplacé par le formulaire du créneau

---

## Colonne droite — Formulaire contextuel

### État 1 : formulaire de l'EDT actif

Affiché quand aucun créneau n'est sélectionné (ou après ANNULER/ENREGISTRER d'un créneau).

#### Boutons d'action

| Bouton | Comportement |
|---|---|
| **ENREGISTRER** | Soumet la commande à `DonneesService` |
| **ANNULER** | Abandonne les saisies, restaure les valeurs de l'EDT |
| **SUPPRIMER** | `mc-bouton-destruction` : supprime l'EDT entier (créneaux inclus) |

#### Champs

| Champ | Composant | Obligatoire |
|---|---|---|
| Nom | `mc-input` | Oui |
| Date de début | `mc-input` type date | Non |
| Date de fin | `mc-input` type date | Non |
| Fréquence | `mc-radio-group` (paire / impaire / les deux) | Oui |

---

### État 2 : formulaire d'un créneau

Affiché au clic sur une cellule de la grille ou sur un bouton AJOUTER.

#### Boutons d'action

| Bouton | Comportement |
|---|---|
| **ENREGISTRER** | Soumet la commande à `DonneesService`, revient au formulaire EDT |
| **ANNULER** | Abandonne les saisies, revient au formulaire EDT |
| **SUPPRIMER** | `mc-bouton-destruction` : supprime le créneau, revient au formulaire EDT |

#### Champs

| Champ | Composant | Condition |
|---|---|---|
| Heure de début | `mc-champ-heure` | Toujours |
| Heure de fin | `mc-champ-heure` | Toujours |
| Type | `mc-select` (pédagogique / récréation / pause déjeuner) | Toujours |
| Disciplines | Chips sélectionnables (un chip par domaine de niveau 1) — sélection multiple | Type pédagogique |
| Titre | `mc-input` | Type pédagogique |
| Élèves concernés | `type: 'classe' \| 'groupes' \| 'eleves'` + sélection | Type pédagogique |

---

## Référentiel EDT

Les jours ouvrés et horaires de début/fin de journée sont configurés dans l'**écran de paramétrage de la classe** (phase 2).
