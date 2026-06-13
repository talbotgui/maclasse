---
name: projet-14-ecran-parametrage
description: Spécification détaillée de l'écran Paramétrage — enseignant, classe, référentiels éditables
metadata:
  type: project
  updated: 2026-06-10
related:
  - projet-02-modelesDonnees
  - projet-03-ecrans
  - projet-04-composantsPartages
  - projet-05-services
---

## Contexte

Écran de gestion des données de configuration : enseignant, classe, référentiels et données non manipulables depuis les autres écrans.
Accessible uniquement après chargement des données (`DonneesChargeesGarde`).

---

## Layout général

Deux colonnes :
- **Colonne gauche** : liste fixe des sections de paramétrage
- **Zone droite** : contenu de la section sélectionnée

---

## Colonne gauche — Navigation par section

Liste fixe cliquable (pas de CRÉER, pas de filtre, pas de SUPPRIMER) :

1. Enseignant & Classe
2. Périodes scolaires
3. Semaine & Horaires
4. Groupes
5. Barème d'évaluation
6. Statuts d'élève
7. Types de contact
8. Raisons d'absence
9. Fréquences d'absence
10. Jours fériés

La section active est mise en évidence (même convention que le bouton de navigation actif dans l'entête).

---

## Zone droite — Sections formulaire simple

Ces sections affichent un formulaire directement éditable avec **ENREGISTRER** / **ANNULER** en haut.

### Section "Enseignant & Classe"

| Champ | Composant |
|---|---|
| Prénom | `mc-input` |
| Nom | `mc-input` |
| Année scolaire | `mc-input` (ex. "2025-2026") |
| Niveau de la classe | `mc-input` (ex. "CM1") |

### Section "Semaine & Horaires"

| Champ | Composant |
|---|---|
| Jours ouvrés | Chips sélectionnables (lundi à samedi, sélection multiple) |
| Heure de début de journée | `mc-champ-heure` |
| Heure de fin de journée | `mc-champ-heure` |

---

## Zone droite — Sections liste éditable

Ces sections affichent une liste d'éléments éditables inline.

### Comportement commun

- Bouton **AJOUTER** en haut de la liste : crée un nouvel élément vide en bas de liste
- Chaque élément est **éditable directement dans la liste** (champs inline)
- Chaque élément dispose d'un bouton **SUPPRIMER** (`mc-bouton-destruction`) avec comportement conditionnel :
  - **Si la valeur est utilisée** dans les données (élèves, séances, projets, absences…) :
    - Bouton désactivé (`disabled`)
    - Tooltip affiché au survol/focus : *"Cette valeur est utilisée et ne peut pas être supprimée"*
    - Attribut `aria-describedby` pointant vers un message masqué visuellement (conformité RGAA)
  - **Si la valeur n'est pas utilisée** : comportement standard `mc-bouton-destruction` (ANNULER + CONFIRMER)
- Un bouton **ENREGISTRER** global (ou par ligne — à décider à l'implémentation) valide les modifications via `DonneesService`

### Section "Périodes scolaires"

| Champ | Composant |
|---|---|
| Nom | `mc-input` |
| Date de début | `mc-input` type date |
| Date de fin | `mc-input` type date |

> Utilisé par : `ProjetPeriode` (via `periodeNom`), `Bulletin` (via `periode`)

### Section "Barème d'évaluation" (`statutsAcquisition`)

| Champ | Composant |
|---|---|
| Identifiant | `mc-input` (ex. "A", "EC") |
| Glyphe | `mc-input` (ex. "✓", "~") |
| Libellé | `mc-input` (ex. "Acquis") |
| Couleur texte | `mc-input` type color |
| Couleur fond | `mc-input` type color |
| Aperçu | `mc-badge-statut` en temps réel (mis à jour à la frappe) |

> Utilisé par : `PpiCompetence.evaluation`, `BulletinCompetence.evaluation`

### Section "Groupes"

| Champ | Composant |
|---|---|
| Libellé | `mc-input` |

> Utilisé par : `Eleve.groupes`, `elevesConcernes.groupes` (séances, créneaux EDT)

### Section "Statuts d'élève"

| Champ | Composant |
|---|---|
| Identifiant | `mc-input` (ex. "DC") |
| Libellé | `mc-input` (ex. "Dans la classe") |

> Utilisé par : `Eleve.statut`

### Section "Types de contact"

| Champ | Composant |
|---|---|
| Identifiant | `mc-input` (ex. "P") |
| Libellé | `mc-input` (ex. "Père") |

> Utilisé par : `Contact.type`

### Section "Raisons d'absence"

| Champ | Composant |
|---|---|
| Libellé | `mc-input` |

> Utilisé par : `AbsenceRecurrente` (si lié — à confirmer)

### Section "Fréquences d'absence"

| Champ | Composant |
|---|---|
| Libellé | `mc-input` |

> Utilisé par : `AbsenceRecurrente` (si lié — à confirmer)

### Section "Jours fériés"

| Champ | Composant |
|---|---|
| Nom | `mc-input` |
| Date | `mc-input` type date |

> Utilisé par : logique de navigation du cahier journal (jours non travaillés)
