---
name: projet-13-ecran-cahier-journal
description: Spécification détaillée de l'écran Cahier journal — navigation par date, liste de séances, formulaire contextuel
metadata:
  type: project
  updated: 2026-06-09
related:
  - projet-03-ecrans
  - projet-02-modelesDonnees
  - projet-05-services
  - projet-04-composantsPartages
  - projet-12-ecran-emploi-du-temps
---

## Layout général

Trois zones :
- **Colonne gauche** : navigation temporelle
- **Zone centrale** : contenu de la journée sélectionnée (lecture seule)
- **Colonne droite** : formulaire d'édition d'une séance (contextuel, vide par défaut)

---

## Colonne gauche — Navigation

| Élément | Détail |
|---|---|
| `mc-mini-calendrier` | Calendrier mensuel miniature ; met en évidence les jours ayant une entrée ; clic sur un jour le charge dans la zone centrale |
| Bouton **J−7** | Recule d'une semaine |
| Bouton **J−1** | Recule d'un jour |
| Bouton **J+1** | Avance d'un jour |
| Bouton **J+7** | Avance d'une semaine |

- Le dernier jour consulté est mémorisé dans `ContextService.jourCourantCahierJournal`
- À l'ouverture de l'écran, le dernier jour consulté est rechargé automatiquement

---

## Zone centrale — Journée sélectionnée

### En-tête

- **Date du jour** affiché en titre (ex. "Lundi 9 juin 2026")

### Cas 1 — Aucune entrée pour ce jour

| Élément | Détail |
|---|---|
| Bouton **INITIALISER VIDE** | Crée une entrée vide pour ce jour via `CahierJournalService` |
| Bouton **INITIALISER DEPUIS L'EDT** | Pré-remplit la journée avec les créneaux de l'EDT correspondant au jour de la semaine et à la parité |

- Ces deux boutons sont **inactifs** si une entrée existe déjà pour ce jour

### Cas 2 — Journée existante

Liste ordonnée des séances, séparées par des boutons intercalaires **+**.

#### Bouton intercalaire "+"

- Visible en permanence entre chaque séance (RGAA : toujours visible)
- Au clic : crée une séance vide insérée à cette position, l'ouvre dans la colonne droite

#### Séance en lecture seule (dans la liste)

| Élément | Condition |
|---|---|
| Heure début – heure fin | Toujours |
| Type | Toujours (pédagogique / récréation / pause déjeuner) |
| Titre | Type pédagogique |
| Disciplines | Type pédagogique |
| Nombre d'élèves concernés | Type pédagogique |
| Flèche ↑ (monter) | Toujours visible ; désactivée sur la première séance |
| Flèche ↓ (descendre) | Toujours visible ; désactivée sur la dernière séance |
| Icône warning ⚠ | Si conflit avec une absence récurrente d'un élève concerné |

#### Icône warning (triangle orange)

- Tabulable et cliquable (RGAA)
- Au clic : ouvre `popin-warnings-absences` listant les conflits
- Calculé à l'**ouverture** de l'écran et **avant la sauvegarde** (`CahierJournalService`)

---

## Colonne droite — Formulaire de séance

Affiché au clic sur une séance ou sur un bouton intercalaire "+". Vide à l'ouverture de l'écran.

### Boutons d'action

| Bouton | Comportement |
|---|---|
| **ENREGISTRER** | Soumet la commande à `DonneesService`, ferme le formulaire |
| **ANNULER** | Abandonne les saisies, ferme le formulaire |
| **SUPPRIMER** | `mc-bouton-destruction` : supprime la séance, ferme le formulaire |

### Champs

| Champ | Composant | Condition |
|---|---|---|
| Heure de début | `mc-champ-heure` | Toujours |
| Heure de fin | `mc-champ-heure` | Toujours |
| Type | `mc-select` (pédagogique / récréation / pause déjeuner) | Toujours |
| Disciplines | Chips sélectionnables (un chip par domaine de niveau 1) — sélection multiple | Type pédagogique |
| Titre | `mc-input` | Type pédagogique |
| Description | `mc-textarea` | Type pédagogique |
| Objectifs | `mc-textarea` | Type pédagogique |
| Déroulement | `mc-textarea` | Type pédagogique |
| Ressources | `mc-textarea` | Type pédagogique |
| Compétences | `mc-selecteur-competences` | Type pédagogique |
| Élèves concernés | `type: 'classe' \| 'groupes' \| 'eleves'` + sélection | Type pédagogique |

---

## Contrainte métier

- Un élève ne peut pas être affecté à plus d'une séance simultanée (même plage horaire)
- Validation dans `CahierJournalService` à l'ENREGISTRER
