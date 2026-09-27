---
name: emploi-du-temps
description: Spécification détaillée de l'écran Emploi du temps — colonne gauche liste EDT, grille hebdomadaire centrale, formulaire contextuel droit
metadata:
  type: project
  updated: 2026-09-27
related:
  - specification/ecrans/vue-ensemble
  - specification/modeles-donnees
  - specification/services
  - specification/composants-partages
  - specification/ecrans/eleves
---

## Maquette

![07-emploi-du-temps](../../../.maquettes/07-emploi-du-temps.png)

**Cohérence globale** : 3 colonnes (liste des EDT, grille hebdomadaire par jours ouvrés, formulaire contextuel EDT ou créneau), icône warning sur créneaux conflictuels, boutons ENREGISTRER / ANNULER / SUPPRIMER dans le formulaire — tout correspond.

**Grille et formulaire** : la maquette est antérieure aux créneaux à temps multiples et à la grille par plages horaires ; la spécification fait foi.

**Select d'EDT** : la maquette utlise un `mc-select` en haut de la colonne gauche pour choisir l'EDT actif par son nom ("Semaine complète" dans l'exemple) — Ceci n'est pas cohérent avec la spécification. La spécification fait foi.

---

## Layout général

Trois colonnes — homogène avec les autres écrans :
- **Colonne gauche** : liste des EDT + bouton CRÉER, puis liste des EDT calculés
- **Zone centrale** : grille hebdomadaire de l'EDT sélectionné
- **Colonne droite** : formulaire contextuel (propriétés EDT ou créneau)

---

## Colonne gauche — Liste des EDT

### Bouton CRÉER

- Positionné en haut de la colonne (`btnCreerEdt`)
- **N'ajoute rien aux données** : désélectionne l'EDT courant et ouvre un formulaire de propriétés **vierge** dans la colonne droite (fréquence « Toutes les semaines » par défaut)
- L'EDT n'est créé qu'à l'**ENREGISTRER** du formulaire ; il apparaît alors dans la liste et devient l'EDT sélectionné

### Liste des EDT

- Titre « Mes emplois du temps »
- Chaque EDT est un bouton sur deux lignes :
  - le **nom**
  - dessous, une ligne secondaire : **fréquence** puis **dates**, séparées par « · » — ex. « Semaines paires · 01/09/2026 → 18/10/2026 » ; une seule date : « à partir du 01/09/2026 » ou « jusqu'au 18/10/2026 » ; sans date, la fréquence seule
- Clic sur un EDT → charge sa grille dans la zone centrale + ouvre ses propriétés dans la colonne droite ; l'EDT sélectionné porte `aria-current="true"`
- **Navigation clavier** : la liste a un **tabindex itinérant** — un seul EDT est dans l'ordre de tabulation ; ↓ / ↑ déplacent le focus vers l'EDT suivant / précédent ; Début / Fin sautent au premier / dernier EDT
- **Icône warning ⚠** sur un EDT en conflit (`EmploiDuTempsService.validerChevauchement`, warning non bloquant) :
  - avec un autre EDT : fréquences compatibles **et** plages de dates qui se chevauchent **et** au moins un temps qui se chevauche le même jour
  - ou à l'intérieur de l'EDT : deux de ses créneaux se chevauchent le même jour
  - Tabulable et cliquable (RGAA)
  - Au clic : ouvre `popin-warnings-absences` listant le ou les EDT en conflit

---

## Zone centrale — Grille hebdomadaire

Affichée uniquement quand un EDT est sélectionné dans la colonne gauche.

### En-tête de la zone centrale

- Nom de l'EDT affiché et bouton **IMPRIMER** (voir plus bas)

### Bandeau des absences régulières

- Placé en tête de la **zone centrale uniquement**, entre l'en-tête (nom + IMPRIMER) et la grille ; les colonnes gauche et droite ne sont pas concernées
- Affiché si un EDT (non calculé) est sélectionné et qu'au moins une absence récurrente d'élève est pertinente pour lui (jour ouvré utilisé + parité compatible)
- **Repliable** : le titre « Absences régulières sur cette période » est un bouton (`btnBasculerAbsences`, `aria-expanded`, `aria-controls`) précédé d'un chevron ▾ / ▸
  - Déplié à l'arrivée sur l'écran ; l'état n'est pas mémorisé
  - Déplié : une ligne par absence — « NOM Prénom — libellé (Jour hh:mm-hh:mm) »
  - Replié : la liste est masquée, le bouton affiche le nombre d'absences (« — 3 »)
- Non imprimé

### Structure

Tableau (`<table>`) :
- **Première colonne « Heure »** : la plage horaire de la ligne (« 08:30–10:00 »)
- **Colonnes suivantes** : jours ouvrés (`referentiels.configEmploiDuTemps.joursOuvres`), en-tête = nom du jour
- **Lignes** : **plages horaires alignées entre les jours** — une ligne par couple (heure de début, heure de fin) distinct parmi tous les temps de tous les créneaux de l'EDT, triées par heure de début. Pas de lignes horaires fixes prédéfinies
- Une cellule contient les temps du jour dont la plage est celle de la ligne ; plusieurs temps parallèles s'y empilent

### Ajout d'un créneau

- **Ligne de pied AJOUTER** : dernière ligne du tableau, un bouton **AJOUTER** (`btnNouveauCreneauJour{jour}`) par jour
- **« + » dans les cellules vides** : chaque cellule vide d'une ligne affiche un bouton « + » (`btnAjouterCreneau{jour}{heure}`, `aria-label` « Ajouter » + jour), visible en permanence (RGAA)
- Les deux boutons font la même chose : ouvrir dans la colonne droite le formulaire d'un **nouveau créneau pour ce jour**, sans position particulière. Le créneau a un premier temps qui commence à la fin du dernier temps existant du jour (08:00 à défaut) et dure une heure ; il n'est ajouté qu'à l'ENREGISTRER

### Cellule de créneau (lecture seule dans la grille)

Chaque temps d'une cellule est un bouton qui ouvre le formulaire de son créneau.

| Élément | Condition |
|---|---|
| Type | Toujours : libellé du type (`LIBELLES.edt.typesCreneau`) — « Pédagogique », « Récréation », « Pause déjeuner » |
| Titre | Type pédagogique, si renseigné |
| Pastilles des élèves concernés (`mc-pastilles-eleves-concernes`) | Type pédagogique |
| Icône warning ⚠ | Type pédagogique, si conflit avec une absence récurrente d'un élève |

L'horaire est porté par la colonne « Heure ». Les disciplines ne sont pas affichées dans la cellule.

Couleur de fond selon le type : pédagogique, récréation, pause déjeuner (`--texte-secondaire` à 16 %).

#### Icône warning créneau (triangle orange)

- Tabulable et cliquable (RGAA)
- Au clic : ouvre `popin-warnings-absences` listant les conflits du créneau
- Calculé à l'**ouverture** de l'écran et au **chargement d'un EDT** dans la grille
- **Créneaux pédagogiques uniquement** : une absence pendant une récréation ou une pause déjeuner (ex. élève qui déjeune chez lui) n'est pas un conflit

---

## Colonne droite — Formulaire contextuel

Vide si aucun EDT n'est sélectionné. Pas de mode lecture intermédiaire — toujours en mode formulaire.

### État 1 : propriétés de l'EDT sélectionné

Affiché au clic sur un EDT dans la colonne gauche, au clic sur CRÉER (formulaire vierge), ou après ANNULER / ENREGISTRER / SUPPRIMER d'un créneau.

#### Boutons d'action

| Bouton | Comportement |
|---|---|
| **ENREGISTRER** | Valide le formulaire, puis crée l'EDT (après CRÉER) ou le modifie via `DonneesService` |
| **ANNULER** | EDT déjà enregistré : **restaure les valeurs enregistrées** dans le formulaire. EDT jamais enregistré (après CRÉER) : vide la colonne droite |
| **SUPPRIMER** | `mc-bouton-destruction` : supprime l'EDT et tous ses créneaux |

#### Champs

| Champ | Composant | Obligatoire |
|---|---|---|
| Nom | `mc-input` | Oui |
| Date de début | `mc-input` type date | Non |
| Date de fin | `mc-input` type date | Non |
| Fréquence | `mc-select` (semaines paires / semaines impaires / toutes les semaines) | Oui |

#### Validation

- **Nom obligatoire** : à l'ENREGISTRER, un nom vide (ou fait d'espaces) affiche le message `LIBELLES.edt.erreurNomObligatoire` (« Le nom est obligatoire. », `role="alert"`) et rien n'est enregistré ; le message disparaît dès que le nom est renseigné

---

### État 2 : formulaire d'un créneau

Affiché au clic sur un temps de la grille, sur un bouton AJOUTER de la ligne de pied ou sur un « + » de cellule vide. Titre : « Créer un créneau » ou « Modifier un créneau ».

Un créneau porte un **jour**, un **type** et **1 à 4 temps** (`EmploiDuTempsService.NOMBRE_TEMPS_MAX`) : chaque temps a son horaire et, pour un créneau pédagogique, ses propres disciplines, titre et élèves concernés (ex. deux groupes en parallèle, ou deux demi-séances décalées). Voir le [plan 11](../../plans/11-edt-temps-multiples.md).

#### Boutons d'action

| Bouton | Comportement |
|---|---|
| **ENREGISTRER** | Valide le formulaire, puis ajoute ou modifie le créneau via `DonneesService` et revient à l'état 1 (propriétés EDT). Aucune popin ne s'ouvre : un conflit avec une absence récurrente n'est signalé que par l'icône ⚠ de la grille |
| **ANNULER** | Abandonne les saisies et **revient aux propriétés de l'EDT** sélectionné (état 1) |
| **SUPPRIMER** | Créneau déjà enregistré uniquement. `mc-bouton-destruction` : supprime le créneau, revient à l'état 1 |

#### Champs du créneau

| Champ | Composant | Condition |
|---|---|---|
| Jour | `mc-select` (jours ouvrés) — focus à l'ouverture | Toujours |
| Type | `mc-select` (pédagogique / récréation / pause déjeuner) | Toujours |

#### Champs de chaque temps (fieldset « Temps n »)

| Champ | Composant | Condition |
|---|---|---|
| Heure de début | `mc-champ-heure` (obligatoire) | Toujours |
| Heure de fin | `mc-champ-heure` (obligatoire) | Toujours |
| Disciplines | Chips `mc-chip-filtre` (un par domaine actif de niveau 1) — sélection multiple | Type pédagogique |
| Titre | `mc-input` | Type pédagogique |
| Élèves concernés | `mc-eleves-concernes` | Type pédagogique |
| SUPPRIMER le temps | `mc-bouton-destruction` (petit) | S'il y a plus d'un temps |

- Bouton **AJOUTER UN TEMPS** (`btnAjouterTemps`) sous les temps : ajoute un temps et y place le focus ; désactivé quand 4 temps sont atteints
- Un créneau récréation ou pause déjeuner n'affiche pas les champs pédagogiques et est enregistré **sans** titre, disciplines ni élèves concernés

#### Validation

- **Heure de fin postérieure à l'heure de début** pour chaque temps : sinon, message `LIBELLES.commun.erreurPlageHoraire` (« L'heure de fin doit être postérieure à l'heure de début. », `role="alert"`) et rien n'est enregistré

### Navigation avec formulaire modifié

L'écran implémente `AvecNavigationGardee` : quitter l'écran alors que le formulaire des propriétés, d'un créneau ou d'un EDT calculé est modifié ouvre une `popin-avertissement` (abandon ou retour).

---

## Emplois du temps calculés

Seconde liste de la colonne gauche (bouton de création `btnCreerEdtCalcule`), même présentation que la liste des EDT (nom, puis fréquence et dates sur une ligne secondaire) : vues en lecture seule recalculées à partir des EDT et des absences (`EmploiDuTempsCalculeService.calculerCreneaux`). Définition (`edtc-formulaire`) : nom, dates, fréquence (`mc-select`), élèves concernés et **sources** (chips, sélection multiple, au moins une ; nom et source obligatoires) :

| Source | Créneaux produits |
|---|---|
| Temps hors classe | Un par temps des créneaux récréation et pause déjeuner des EDT retenus, libellé et couleur de leur type ; « élèves concernés » ignoré |
| Temps de classe | Un par temps pédagogique concernant au moins un des élèves choisis, libellé = titre du temps |
| Absences régulières | Une par absence récurrente des élèves choisis, de parité compatible |

EDT retenus : plage de dates qui chevauche celle de la définition et fréquence compatible.

La grille d'un EDT calculé a la même structure (colonne Heure, plages horaires alignées), sans ligne AJOUTER ni « + » ; la couleur d'une cellule dépend de sa source (`TypeSourceCalculee`).

---

## Bouton IMPRIMER

- Positionné en haut de la zone centrale, à droite du nom de l'EDT affiché
- Déclenche l'impression via le navigateur (`window.print()`) ; tout ce qui suit s'applique aussi à Ctrl+P
- **Seule la grille est imprimée** : colonne gauche, colonne droite, bandeau des absences, icônes de conflit, boutons « + » et ligne AJOUTER sont masqués (`@media print` de `styles.scss`)
- **Orientation paysage** imposée (A4, marges 10 mm) via la page nommée `edt-paysage`, propre à cet écran
- **Page unique** : au `beforeprint`, la grille est mesurée à la largeur imprimable et réduite par un facteur `zoom` ≤ 1 (variable CSS `--edt-echelle-impression`) pour tenir en hauteur ; facteur remis à 1 au `afterprint`
- **Titre du document** (`document.title`) remplacé pendant l'impression, puis restauré. Il apparaît dans l'en-tête d'impression du navigateur et comme nom du PDF proposé :

| Dates renseignées | Titre |
|---|---|
| Début et fin | `nom (01/09/2026-18/10/2026 / Semaines paires)` |
| Début seul | `nom (à partir du 01/09/2026 / Semaines paires)` |
| Fin seule | `nom (jusqu'au 18/10/2026 / Semaines paires)` |
| Aucune | `nom (Semaines paires)` |

S'applique aussi aux EDT calculés. Sans EDT affiché, le titre n'est pas modifié.

---

## Référentiel EDT

Les jours ouvrés et horaires de début/fin de journée sont configurés dans l'**écran de paramétrage** (section Semaine & Horaires).
