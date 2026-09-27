---
name: cahier-journal
description: Spécification détaillée de l'écran Cahier journal — navigation par date, liste de séances, formulaire de séance inséré dans la liste
metadata:
  type: project
  updated: 2026-09-27
related:
  - specification/ecrans/vue-ensemble
  - specification/modeles-donnees
  - specification/services
  - specification/composants-partages
  - specification/ecrans/emploi-du-temps
---

## Maquette

![08-cahier-journal](../../../.maquettes/08-cahier-journal.png)

La maquette est antérieure à l'implémentation : elle montre un formulaire de séance dans une colonne de droite. L'écran implémenté a **deux zones** et ouvre le formulaire dans la liste des séances (voir ci-dessous).

---

## Layout général

Deux zones (une seule colonne empilée sous 768 px) :
- **Colonne gauche** (18rem) : navigation temporelle et actions de journée
- **Zone centrale** : contenu de la journée sélectionnée ; le formulaire de création ou de modification d'une séance s'ouvre **dans la liste**, à l'emplacement de la séance concernée

---

## Colonne gauche — Navigation et actions de journée

| Élément | Détail |
|---|---|
| Bouton **«** (J−7) | Recule d'une semaine |
| Bouton **‹** (J−1) | Recule d'un jour |
| Date courante | Format long (ex. « lundi 9 juin 2026 ») |
| Bouton **›** (J+1) | Avance d'un jour |
| Bouton **»** (J+7) | Avance d'une semaine |
| `mc-mini-calendrier` | Calendrier mensuel miniature ; met en évidence les jours ayant une entrée, les jours fériés et non ouvrés ; clic sur un jour → chargé dans la zone centrale |
| **INITIALISER UNE JOURNÉE VIDE** | Crée une entrée vide pour ce jour ; **désactivé** si une entrée existe (description `sr-only` associée) |
| **INITIALISER DEPUIS L'EMPLOI DU TEMPS** | Pré-remplit la journée avec les créneaux de l'EDT applicable (jour de la semaine, parité) ; **désactivé** si une entrée existe |
| **DUPLIQUER LA JOURNÉE** | Si une journée existe ; ouvre le formulaire inline de duplication |
| **IMPRIMER** | Si une journée existe ; `window.print()` |
| **SUPPRIMER LA JOURNÉE** | Si une journée existe ; confirmation via `popin-avertissement` |
| Formulaire inline de duplication | Champ date « jour cible » + CONFIRMER / ANNULER ; sert à la duplication de journée **et** de séance |

- Navigation (flèches ou calendrier) : ferme le formulaire de séance ouvert
- Le jour consulté est mémorisé dans `ContexteService.jourCourantCahierJournal` et rechargé à l'ouverture de l'écran

---

## Zone centrale — Journée sélectionnée

### Aucune entrée pour ce jour

Message « aucune séance » et bouton **INITIALISER UNE JOURNÉE VIDE** (`btnInitialiserVidePrincipal`).

### En-tête

- `<h2 class="cj__titre-journee">` : date formatée (format long), affichée dès qu'une journée existe (même sans séance) — nécessaire à l'impression, la colonne gauche étant masquée en `@media print`

### Notes de la journée

- Champ `notes?: string` sur `JourneeJournal` (mémo libre : rappels, événements, effectif…), indépendant des séances
- `mc-textarea` sous le titre, **au-dessus de la liste des séances**, visible dès qu'une séance existe **ou** que des notes sont déjà enregistrées (`@if (seances().length > 0 || notesJournee())`)
- Enregistrement **au blur** (`(focusout)` sur le `mc-textarea`) via `CahierJournalService.modifierNotesJournee(date, notes)` → `CommandeModification` (UNDO/REDO) ; le service **trim** la valeur (vide → `undefined`) et ignore l'appel si elle est inchangée
- Champ réactif `notesControl = new FormControl('', { nonNullable: true })` (Reactive Forms — pas de `ngModel`), resynchronisé par un `effect` (`setValue(..., { emitEvent: false })` + `cdr.markForCheck()`) sur `notesJournee()` — jamais pendant la frappe
- `notesJournee = computed(() => journeeSelectionnee()?.notes ?? '')` : version persistée, utilisée pour le `<p>` d'impression et la condition d'affichage
- Impression : un `<p class="cj__notes-impression">` (masqué à l'écran) remplace le textarea ; bascule gérée dans le `@media print` de `styles.scss` (`.cj__notes-saisie` masquée, `.cj__notes-impression` affichée `white-space: pre-wrap`)
- `dupliquerJournee` reporte les notes de la source vers la cible (création **et** remplacement) ; `dupliquerSeance` ne les touche pas (notes = niveau journée)
- Libellés : `cahierJournal.labelNotes`, `cahierJournal.placeholderNotes`, `commandes.modificationNotesJournee`

### Liste des séances

Séances triées par heure, chacune précédée d'un bouton intercalaire **+**, et suivie en bas de zone d'un bouton **+ AJOUTER UNE SÉANCE** (fin de journée).

#### Bouton intercalaire « + »

- Visible en permanence avant chaque séance (RGAA : toujours visible), désactivé pendant une création
- Au clic : ouvre le formulaire de création à cette position ; les heures proposées comblent l'écart entre les séances voisines (bornes de la journée scolaire de `configEmploiDuTemps` à défaut de voisine)

#### Séance en lecture seule

| Élément | Condition |
|---|---|
| Heure début – heure fin | Toujours |
| Type (valeur brute du modèle) | Toujours |
| Titre | Si renseigné |
| Icône warning ⚠ | Si `conflitDetecte` (conflit avec une absence récurrente d'un élève concerné) |
| Pastilles élèves/groupes (`mc-pastilles-eleves-concernes`) | Si des élèves sont concernés |
| Objectifs | Si renseignés, sous l'en-tête de la carte |
| ↑ monter / ↓ descendre | Toujours ; désactivés respectivement sur la première et la dernière séance ; **échangent les heures** avec la séance voisine |
| ✎ modifier | Ouvre le formulaire de modification sous la séance ; la carte est surlignée |
| ⎘ dupliquer | Ouvre le formulaire inline de duplication (colonne gauche) pour cette séance |
| ✕ supprimer | Suppression immédiate (sans confirmation, annulable par UNDO) |

Les disciplines ne sont pas affichées dans la liste.

#### Icône warning (triangle orange)

- Tabulable et cliquable (RGAA)
- Au clic : ouvre `popin-warnings-absences` listant les conflits (recalculés)
- `conflitDetecte` est calculé à l'**ENREGISTRER** d'une séance ; s'il y a des conflits, la popin s'ouvre aussitôt (warning non bloquant)

---

## Formulaire de séance (`cj-formulaire-seance`)

Inséré dans la liste : à la position d'insertion pour une création, sous la séance pour une modification. Un seul formulaire ouvert à la fois. Focus sur l'heure de début à l'ouverture (`focusDemande`).

### Boutons d'action

| Bouton | Comportement |
|---|---|
| **ENREGISTRER** | Ajoute ou modifie la séance via `CahierJournalService`, calcule les conflits d'absences (warning non bloquant), ferme le formulaire |
| **ANNULER** | Abandonne les saisies, ferme le formulaire |

La suppression se fait depuis la liste (✕), pas depuis le formulaire.

Messages d'erreur (`role="alert"`) : champs obligatoires manquants, plage horaire incohérente.

### Champs

| Champ | Composant | Condition |
|---|---|---|
| Heure de début | `mc-champ-heure` (obligatoire) | Toujours |
| Heure de fin | `mc-champ-heure` (obligatoire) | Toujours |
| Type | `mc-select` (pédagogique / récréation / pause déjeuner) | Toujours |
| Disciplines | Chips `mc-chip-filtre` (un par domaine de niveau 1) — sélection multiple | Type pédagogique |
| Titre | `mc-input` | Type pédagogique |
| Objectifs | `mc-textarea` | Type pédagogique |
| Déroulement | `mc-textarea` | Type pédagogique |
| Ressources | `mc-textarea` | Type pédagogique |
| Description | `mc-textarea` | Type pédagogique |
| Compétences | `mc-selecteur-competences` (multi-sélection) | Type pédagogique |
| Élèves concernés | `mc-eleves-concernes` | Type pédagogique |

**Non implémenté à ce jour** : désactivation du chip d'un élève ayant une `AbsencePonctuelle` ce jour-là.

### Navigation avec formulaire modifié

L'écran implémente `AvecNavigationGardee` : quitter l'écran avec un formulaire de séance modifié ouvre une `popin-avertissement` (abandon ou retour).

---

## Duplication

Formulaire inline de la colonne gauche (champ date + CONFIRMER / ANNULER), ouvert par DUPLIQUER LA JOURNÉE ou par ⎘ sur une séance :
- **Séance** : copie la séance enregistrée vers le jour cible (`dupliquerSeance`)
- **Journée** : copie toutes les séances et les notes vers le jour cible (`dupliquerJournee`) ; une journée existante est **remplacée sans confirmation** (annulable par UNDO)
- Si aucune journée n'existe au jour cible, elle est créée

---

## Impression

- Bouton IMPRIMER de la colonne gauche → `window.print()`
- Colonne gauche, contrôles des séances et bouton d'ajout masqués (`@media print`) ; les notes sont imprimées sous forme de paragraphe

---

## Contrainte métier

- Un élève ne peut pas être affecté à plus d'une séance simultanée (même plage horaire) — **non implémenté à ce jour** : aucune validation dans `CahierJournalService`
