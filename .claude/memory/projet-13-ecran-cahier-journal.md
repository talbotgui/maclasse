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
- Calculé à l'**ENREGISTRER** d'une séance (warning non bloquant, affiché après enregistrement)

---

## Colonne droite — Formulaire de séance

Affiché au clic sur une séance ou sur un bouton intercalaire "+". Vide à l'ouverture de l'écran.

### Boutons d'action

| Bouton | Comportement |
|---|---|
| **ENREGISTRER** | Soumet la commande à `DonneesService`, ferme le formulaire ; déclenche le contrôle des absences récurrentes (warning non bloquant) |
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
| Élèves concernés | `mc-eleves-concernes` — en mode élèves, le chip d'un élève ayant une `AbsencePonctuelle` pour ce jour est **désactivé** | Type pédagogique |

### Duplication de séance

Dans la colonne droite, sous le formulaire de séance :
- Bouton **DUPLIQUER VERS UN AUTRE JOUR**
- Affiche un `mc-input` type date pour choisir le jour cible
- Au clic sur **CONFIRMER DUPLICATION** : copie la séance courante (telle qu'enregistrée) vers le jour sélectionné via `CahierJournalService`
- Si aucune journée n'existe pour le jour cible, elle est créée automatiquement

---

## Bas de la zone centrale — Actions globales de journée

### Bouton SUPPRIMER LA JOURNÉE

- Positionné en bas de la liste des séances (zone centrale)
- `mc-bouton-destruction` : supprime l'intégralité de la journée (toutes les séances)
- Uniquement visible si une journée existe pour le jour courant

### Duplication de journée

- Bouton **DUPLIQUER LA JOURNÉE VERS UN AUTRE JOUR** en bas de la zone centrale
- Affiche un `mc-input` type date pour choisir le jour cible
- Copie l'intégralité des séances de la journée courante vers le jour sélectionné via `CahierJournalService`
- Si une journée existe déjà pour le jour cible, elle est remplacée (après confirmation `mc-bouton-destruction`)

---

## Bouton IMPRIMER

- Positionné en haut ou bas de la zone centrale
- Déclenche l'impression via le navigateur (`window.print()`)
- **La colonne gauche n'est pas imprimée** (masquée via `@media print`)

---

## Contrainte métier

- Un élève ne peut pas être affecté à plus d'une séance simultanée (même plage horaire)
- Validation dans `CahierJournalService` à l'ENREGISTRER
