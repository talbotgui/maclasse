---
name: 19-cahier-journal-densification
description: Plan d'évolution — densification de l'écran Cahier journal (bouton « + » en bout de ligne, actions plus lisibles avec infobulles, notes repliables, récréations en ligne fine, en-tête compact, boutons d'initialisation masqués) et implémentation de deux règles de la spec restées en attente (élève absent non sélectionnable, élève sur deux séances simultanées)
metadata:
  type: project
  updated: 2026-09-27
related:
  - specification/ecrans/cahier-journal
  - plans/05-cahier-journal-absences-notes
  - plans/06-cahier-journal-pastilles-eleves
---

# Plan d'évolution — Densification du cahier journal

## Contexte

### Densification

Dans l'écran Cahier journal, beaucoup d'espace est perdu et la densité d'information est trop faible :

- un bouton intercalaire « + » pleine largeur précède chaque séance et ajoute une ligne par séance ;
- les boutons d'action d'une séance (↑ ↓ ✎ ⎘ ✕) sont très petits (`mc-btn-xs`) et n'ont pas d'infobulle ;
- la zone de notes de la journée (3 lignes) occupe en permanence le haut de la zone centrale ;
- les récréations et pauses déjeuner occupent une carte complète alors qu'elles ne portent aucun contenu pédagogique ;
- la date est affichée deux fois (colonne gauche et titre `<h2>`), en format long ;
- les boutons « Initialiser… » restent affichés, grisés, dans la colonne gauche quand la journée existe ;
- un pied « + Ajouter une séance » fait doublon avec les boutons « + ».

### Règles de la spec non implémentées

La correction de la spec du 2026-09-27 a relevé deux règles décrites mais absentes du code :

- **Élève absent ce jour-là** : dans « Élèves concernés » (mode élèves), le chip d'un élève ayant une `AbsencePonctuelle` à la date de la journée devrait être désactivé ;
- **Élève sur deux séances simultanées** : un élève ne devrait pas être affecté à deux séances dont les plages horaires se chevauchent ; validation à l'ENREGISTRER.

## Décisions validées

| # | Sujet | Décision |
|---|---|---|
| 1 | Bouton « + » | Placé **à droite de chaque séance, hors de sa carte**, dans un cadre de même bordure et même arrondi que la carte. Il insère une séance **après** celle de sa ligne. L'intercalaire actuel disparaît. |
| 2 | Insertion en début de journée | Une **ligne « + » dédiée en tête de liste** (même cadre, alignée sur la colonne des « + ») insère en position 0. Elle reste le seul moyen d'ajouter une séance dans une journée existante sans séance. |
| 3 | Boutons ↑ ↓ ✎ ⎘ | Un peu plus gros (retrait de `mc-btn-xs`, taille par défaut de `mc-btn-icone`) et dotés d'une infobulle (`[title]`). |
| 4 | Bouton ✕ supprimer | **Taille inchangée** (`mc-btn-xs`), mais doté d'une infobulle. |
| 5 | Notes de la journée | Repliables, sur le modèle d'un accordéon. **Pas de mémorisation de l'état** ni de règle d'ouverture automatique : dépliées à l'arrivée sur l'écran comme aujourd'hui, repliables par l'utilisateur pendant la durée de vie de l'écran. |
| 6 | Récréations et pauses (piste C) | Affichées en **ligne fine** sans carte : « 10:00 – 10:15 · Récréation », actions conservées, « + » conservé. |
| 7 | En-tête (piste F) | Date et notes sur **une même ligne** : date **en gras au format `JJ/MM/AAAA`** (`DateUtils.formaterDateCourt`), suivie du bouton de repli des notes. Replié, le bouton affiche le début des notes (première ligne, tronquée par une ellipse). |
| 8 | Boutons d'initialisation (piste H) | **Masqués** au lieu d'être désactivés. Retirés de la colonne gauche : sur une journée vide, les deux boutons (« Initialiser une journée vide » et « Initialiser depuis l'emploi du temps ») sont proposés dans la zone centrale. |
| 9 | Pied « + Ajouter une séance » (piste I) | Supprimé. |
| 10 | Élève absent ce jour-là | Dans `mc-eleves-concernes`, **mode élèves uniquement**, le chip d'un élève ayant une `AbsencePonctuelle` à la date de la journée est **désactivé** et porte la mention « absent ce jour » (infobulle + texte `sr-only`). Exception : s'il est **déjà sélectionné** (absence saisie après la séance), le chip reste actif pour pouvoir le retirer. Modes classe et groupes non concernés. L'EDT, qui utilise aussi le composant, n'est pas impacté (nouvel input facultatif, vide par défaut). |
| 11 | Élève sur deux séances simultanées | **Bloquant** à l'ENREGISTRER du formulaire de séance : message d'erreur listant les élèves en cause (« NOM Prénom »), aucune émission tant que le conflit subsiste. Périmètre : seules les séances **pédagogiques** comptent (récréations et pauses ignorées) ; chevauchement **strict** au sens de `DateUtils.chevauchementHoraire` (séances adjacentes autorisées) ; mode classe = tous les élèves, mode groupes = élèves membres d'au moins un groupe sélectionné ; la séance modifiée est exclue de la comparaison. Hors périmètre : échange d'heures (↑ ↓), duplication de séance ou de journée, initialisation depuis l'EDT. |

Pistes écartées : séance sur une seule ligne (A), colonnes alignées (B), type remplacé par la couleur de discipline (D), espacements resserrés (E), barre d'actions de journée dans l'en-tête (G), actions visibles au survol seulement (non conforme RGAA).

## Mise en œuvre

### Template `ecran-cahier-journal.component.html`

**Colonne gauche**
- Suppression de `btnInitialiserVide`, `btnInitialiserEdt` et du `<span id="descInitialisation">`.
- Les boutons DUPLIQUER, IMPRIMER, SUPPRIMER LA JOURNÉE et le formulaire inline de duplication restent en place.

**Zone centrale — journée vide**
- `cj__droite-vide` propose `btnInitialiserVidePrincipal` et `btnInitialiserEdt` (l'id est conservé : le sélecteur E2E ne change pas).

**Zone centrale — en-tête**
- Nouvelle ligne `cj__entete` (flex) contenant :
  - `<h2 class="cj__titre-journee">` : date au format `JJ/MM/AAAA`, en gras (nouveau `computed` `dateCourte`) ;
  - si `seances().length > 0 || notesJournee()` : `<button id="btnBasculerNotes" type="button" [attr.aria-expanded]="notesDepliees()" aria-controls="zoneNotesJournee">` avec un chevron ▸/▾, le libellé « Notes de la journée » et, replié, un aperçu `cj__notes-apercu` (première ligne de `notesJournee()`, ellipse CSS).
- Sous la ligne, `@if (notesDepliees())` : `<div id="zoneNotesJournee">` contenant le `mc-textarea` actuel (inchangé : `(focusout)` → `enregistrerNotes()`). Replier après saisie déclenche d'abord le `focusout`, donc l'enregistrement.
- Le `<p class="cj__notes-impression">` reste **hors** du `@if (notesDepliees())` : les notes s'impriment qu'elles soient repliées ou non.

**Zone centrale — liste des séances**
- Ligne de tête `cj__ligne-ajout-debut` : `<button id="btnAjouterSeanceDebut">` → `creerSeance(0)`.
- Chaque séance devient une ligne `cj__ligne` (grille `1fr auto`) : la carte `cj__seance` + `<button [id]="'btnAjouterSeanceApres' + seance.id">` → `creerSeance(i + 1)`.
- Formulaire de création : la condition devient « `positionCreation() === i + 1` » placée **après** la séance `i` (et après son éventuel formulaire de modification) ; le bloc « position === seances().length » en fin de liste disparaît, il est couvert par la dernière séance. La ligne de tête garde son propre bloc pour la position 0.
- Récréation / pause déjeuner : `[class.cj__seance--fine]="seance.type !== 'pedagogique'"` ; le type est affiché avec les libellés `LIBELLES.edt.typeRecreation` / `typePauseDejeuner` (au lieu de la valeur brute `seance.type`, qui affiche aujourd'hui « PauseDejeuner »). Pour une séance pédagogique, le type n'est plus affiché : le titre suffit.
- Boutons ↑ ↓ ✎ ⎘ : `class="mc-btn-icone"` + `[title]`. Bouton ✕ : `mc-btn-xs` conservé + `[title]`.
- Suppression du bloc `cj__ajouter-seance` (`btnAjouterSeance`).

### Composant `ecran-cahier-journal.component.ts`

- `notesDepliees = signal(true)` et `basculerNotes()`.
- `dateCourte = computed(() => DateUtils.formaterDateCourt(this.dateSelectionnee()))`. `dateFormatee` (format long) reste utilisé par la colonne gauche.
- `libelleType(type: TypeCreneau)` ou `computed` équivalent pour le libellé du type d'une séance non pédagogique.
- `apercuNotes = computed(...)` : première ligne des notes persistées.

### `ecran-cahier-journal.component.scss`

- `cj__entete` (flex, `align-items: baseline`), `cj__notes-apercu` (ellipse), styles du bouton de repli.
- `cj__ligne` (grille `1fr auto`, `gap`) ; cadre du « + » : `border: 1px solid var(--bordure)`, `border-radius: var(--rayon, 4px)`, hauteur alignée sur la carte (`align-self: stretch`).
- `cj__seance--fine` : pas de bordure ni de fond, `padding` réduit, texte `var(--texte-secondaire)`.
- Suppression de `cj__intercalaire` et `cj__ajouter-seance`.
- Vérifier le bloc `@media print` de `styles.scss` : masquer les « + » (déjà couverts par `.mc-btn-ajouter` s'ils gardent cette classe), le bouton de repli des notes et l'aperçu ; le `<h2>` au format court reste imprimé.

### Règle 10 — élève absent ce jour-là

- `EleveService.listerIdsElevesAbsents(date: string): string[]` : UUID des élèves ayant une `AbsencePonctuelle` à cette date (lecture pure).
- `McElevesConcernesComponent` : nouvel input `public readonly elevesIndisponiblesIds = input<string[]>([])` et méthode `estEleveIndisponible(eleveId)` (indisponible **et** non sélectionné). Chip élève : `[disabled]`, `[title]` et `<span class="sr-only">` « absent ce jour ».
- `CjFormulaireSeanceComponent` : injecte `EleveService`, `computed` `elevesAbsentsIds` depuis `journee()?.date`, passé à `<mc-eleves-concernes [elevesIndisponiblesIds]="elevesAbsentsIds()">`.

### Règle 11 — élève sur deux séances simultanées

- `CahierJournalService` :
  - extraction d'une méthode privée `resoudreElevesIds(seance, eleves): string[]` (classe / groupes / élèves), aujourd'hui inline dans `calculerConflitsPourSeance`, qui la réutilise ;
  - nouvelle `detecterElevesSurSeancesSimultanees(date: string, seance: Seance): string[]` : pour une séance pédagogique, libellés « NOM Prénom » des élèves également concernés par une autre séance pédagogique de la journée qui la chevauche (séance de même id exclue) ; tableau vide sinon.
- `CjFormulaireSeanceComponent` :
  - injecte `CahierJournalService` ; signal `elevesEnConflit = signal<string[]>([])` ;
  - `onEnregistrer()` : après la validation du formulaire, appelle `detecterElevesSurSeancesSimultanees(journee().date, seance)` ; si non vide → `elevesEnConflit.set(...)` et pas d'émission ;
  - `messageErreur` : ajoute le cas `LIBELLES.cahierJournal.erreurEleveSeanceSimultanee` + liste des noms, prioritaire sur l'absence d'erreur mais après les erreurs de validation existantes ;
  - `elevesEnConflit` remis à `[]` à toute modification du formulaire (`valueChanges`) et des sélections hors formulaire.

### `libelles.ts` (`cahierJournal`)

- Ajout : `ariaAjouterSeanceDebut` (« Ajouter une séance en début de journée »), `ariaAjouterSeanceApres` (« Ajouter une séance après celle-ci »), `ariaBasculerNotes` si nécessaire.
- Réutilisation pour les `[title]` des libellés `aria*Seance` existants (`ariaMonterSeance`, `ariaDescendreSeance`, `ariaModifierSeance`, `boutonDupliquerSeance`, `ariaSupprimerSeance`).
- Ajout : `erreurEleveSeanceSimultanee` (« Ces élèves sont déjà concernés par une séance sur la même plage horaire : »), `mentionEleveAbsent` (« absent ce jour », section `elevesConcernes`).
- Suppression : `ariaAjouterSeanceAPosition`, `tooltipJourneeDejaInitialisee`, `boutonAjouterSeance` s'ils ne sont plus utilisés.

## Tests

**Unitaires** (`ecran-cahier-journal.component.spec.ts`)
- `basculerNotes()` : bascule de `notesDepliees` ; textarea absent quand replié, `<p class="cj__notes-impression">` toujours présent si des notes existent.
- `apercuNotes` : notes vides, une ligne, plusieurs lignes (seule la première est retenue).
- `dateCourte` : valeur exacte via `DateUtils.formaterDateCourt`.
- `btnAjouterSeanceDebut` → `positionCreation() === 0` ; `btnAjouterSeanceApres{id}` de la séance `i` → `positionCreation() === i + 1`, formulaire rendu juste après cette séance.
- Journée vide : `btnInitialiserVidePrincipal` et `btnInitialiserEdt` présents dans la zone centrale, absents de la colonne gauche ; journée existante : aucun des deux dans le DOM.
- Récréation : classe `cj__seance--fine` et libellé `LIBELLES.edt.typeRecreation`.
- Adapter le test existant sur `.cj__titre-journee` (format court).

**Unitaires — règle 10**
- `EleveService.listerIdsElevesAbsents` : aucun absent, un absent à la date, absence à une autre date ignorée.
- `McElevesConcernesComponent` : chip désactivé pour un élève indisponible non sélectionné ; chip actif pour un élève indisponible déjà sélectionné ; aucun effet sans l'input (cas EDT).
- `CjFormulaireSeanceComponent` : `elevesAbsentsIds` calculé depuis la date de la journée (données réelles via `DonneesMother` / `EleveMother`).

**Unitaires — règle 11** (`cahier-journal.service.spec.ts`, un test par branche)
- Conflit via mode élèves, via mode groupes, via mode classe (chaque fois seule cette source peuplée).
- Pas de conflit : séances adjacentes ; autre séance non pédagogique ; séance candidate non pédagogique ; même séance (modification) ; élèves disjoints.
- `calculerConflitsPourSeance` : non-régression après extraction de `resoudreElevesIds`.
- Formulaire : ENREGISTRER bloqué avec message exact et noms attendus, `enregistrer` non émis (`vi.spyOn(...emit)` + `not.toHaveBeenCalled()`) ; message effacé après modification du formulaire.
- Couverture ≥ 80 % sur les services modifiés.

**E2E** (`selecteurs-cahier-journal.ts`, `cahier-journal.spec.ts`)
- Remplacer `btnAjouterSeance` (8 usages) par `btnAjouterSeanceDebut` (propriété `readonly`, sans paramètre).
- Ajouter `btnBasculerNotes` ; scénario : replier les notes, vérifier que le champ disparaît et que l'aperçu affiche le début des notes, déplier.
- Vérifier que les scénarios utilisant `btnInitialiserEdt` fonctionnent sur la journée vide (bouton déplacé au centre).
- `accessibilite.spec.ts` : contrôle AXE vert sur l'écran avec notes repliées.
- Règle 10 : sur une journée du jeu de test où un élève a une absence ponctuelle, le chip de cet élève est désactivé (sinon, ajouter l'absence dans `maclasse-test.zip`).
- Règle 11 : créer deux séances qui se chevauchent avec un même élève → message d'erreur affiché, séance non enregistrée.

## Documentation

- `docs/specification/ecrans/cahier-journal.md` : en-tête, notes repliables, liste des séances (« + » en bout de ligne, ligne de tête, lignes fines), colonne gauche sans boutons d'initialisation ; retrait des mentions « non implémenté à ce jour » des deux règles, avec leur périmètre exact.
- `docs/specification/services.md` : `EleveService.listerIdsElevesAbsents`, `CahierJournalService.detecterElevesSurSeancesSimultanees`.
- `docs/specification/composants-partages.md` : input `elevesIndisponiblesIds` de `mc-eleves-concernes`.
- `docs/README.md` : statut du plan.

## Bilan

Terminé le 2026-09-27.

- Écart au plan : aucun libellé `ariaBasculerNotes` (le bouton porte le libellé visible « Notes de la journée ») ; condition d'affichage des notes centralisée dans un `computed` `notesAffichables` ; `aria-controls` posé seulement quand la zone de notes est dans le DOM.
- Correctif induit : dans `cj-formulaire-seance`, `formInvalide` (auparavant `toSignal(statusChanges)`) restait « invalide » après le chargement d'une séance par `reset(..., { emitEvent: false })` ; il est désormais resynchronisé après le chargement. Le défaut était masqué tant qu'un formulaire valide se fermait aussitôt à l'ENREGISTRER.
- Tests E2E existants adaptés à la règle 11 : E2E-69 et E2E-117 créent leur séance à 16:00–17:00 (les séances du lundi de test concernent toute la classe de 08:30 à 15:30). Nouveaux scénarios : E2E-127 (repli des notes), E2E-128 (élève absent), E2E-129 (séances simultanées) ; RGAA-07 contrôle aussi l'écran notes repliées.
