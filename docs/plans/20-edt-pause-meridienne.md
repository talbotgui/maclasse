---
name: 20-edt-pause-meridienne
description: Plan d'évolution — prise en charge complète de la pause méridienne dans l'écran Emploi du temps (libellé du type dans la grille, couleur, source « Temps hors classe » des EDT calculés regroupant récréations et pauses déjeuner, conflits d'absences limités aux créneaux pédagogiques, nettoyage des champs pédagogiques, migration 2026.09.4)
metadata:
  type: project
  updated: 2026-09-27
related:
  - specification/ecrans/emploi-du-temps
  - specification/modeles-donnees
  - specification/elements-techniques
  - plans/12-edt-emplois-calcules
---

# Plan 20 — EDT : pause méridienne

**Statut : terminé le 2026-09-27.** `ng test` 1216/1216 ; E2E EDT, démarrage et accessibilité verts (E2E-132 inclus).

## Contexte

Le type de créneau `pauseDejeuner` existe (modèle, formulaire de créneau, libellé, classe CSS `--pause`), mais il est traité de façon incomplète :

- la cellule de la grille affiche la valeur brute du type (`pauseDejeuner`, `recreation`, `pedagogique`) au lieu de son libellé ;
- la couleur de la pause (`--texte-secondaire` à 8 %) se distingue à peine d'une case vide ;
- les EDT calculés ne proposent qu'une source « Récréations » : les pauses déjeuner n'y apparaissent jamais ;
- une pause déjeuner (ou une récréation) est signalée ⚠ en conflit dès qu'un élève a une absence récurrente sur le créneau (ex. élève qui déjeune chez lui), car un temps est créé avec `elevesConcernes: classe` par défaut ;
- les champs pédagogiques (`disciplinesIds`, `titre`, `elevesConcernes`) restent enregistrés sur un créneau non pédagogique, d'où une pastille « Classe » affichée sur les récréations et pauses de la grille.

## Décisions

| # | Sujet | Décision |
|---|---|---|
| 1 | Libellé du type dans la grille | Nouvelle table `LIBELLES.edt.typesCreneau: Record<TypeCreneau, string>`, sur le modèle de `joursLibelles`, lue directement dans le template et par les services. Remplace `typePedagogique`. `typeRecreation` et `typePauseDejeuner` sont conservées tant que le cahier journal (plan 19, en cours dans une autre session) les utilise ; les basculer sur `typesCreneau` une fois ce plan committé. |
| 2 | Couleur de la pause | `--texte-secondaire` passe de 8 % à 16 % : la cellule se distingue d'une case vide, le texte (`--texte-principal`) reste largement au-dessus de 4,5:1. Même classe `--pause` appliquée aux créneaux calculés issus d'une pause. |
| 3 | Source des EDT calculés | La source `recreation` devient **`tempsHorsClasse`** (« Temps hors classe »), qui regroupe les créneaux `recreation` et `pauseDejeuner`. Côté créneau calculé (non persisté), `TypeSourceCalculee` distingue `recreation` et `pauseDejeuner` pour conserver la couleur et le libellé propres à chacun. |
| 4 | Conflits avec les absences | `calculerConflitsAbsences` ne retourne des conflits que pour les créneaux `pedagogique`. Tout créneau hors classe est ignoré. |
| 5 | Champs pédagogiques | À l'enregistrement d'un créneau non pédagogique, `disciplinesIds`, `titre` et `elevesConcernes` sont retirés de chaque temps. Le formulaire conserve les saisies tant qu'il est ouvert (basculer pédagogique → pause → pédagogique ne perd rien avant ENREGISTRER). |
| 6 | Données existantes | Nouvelle étape de migration **`2026.09.4`** : remplace `recreation` par `tempsHorsClasse` dans `EmploiDuTempsCalcule.sources` (sans doublon), et retire les champs pédagogiques des temps des créneaux non pédagogiques. Idempotente. |

## Modifications

### Modèles

- `emploi-du-temps-calcule.modele.ts` : `SourceEdtCalcule = 'tempsHorsClasse' | 'tempsClasse' | 'absencesRegulieres'` ; `TypeSourceCalculee = 'recreation' | 'pauseDejeuner' | 'tempsClasse' | 'absenceReguliere'` ; JSDoc de `libelle` mise à jour.

### Libellés (`libelles.ts`)

- `edt.typesCreneau` (nouveau) ; suppression de `typePedagogique` ; `typeRecreation` et `typePauseDejeuner` conservées (décision 1).
- `edt.sourceRecreation` → `edt.sourceTempsHorsClasse: 'Temps hors classe'` ; suppression de `edt.libelleRecreation` (remplacé par `typesCreneau`).

### Services

- `EmploiDuTempsCalculeService` : `calculerRecreations` → `calculerTempsHorsClasse` (créneaux `recreation` et `pauseDejeuner`, `source` = type du créneau, `libelle` = `typesCreneau[type]`).
- `EmploiDuTempsService.calculerConflitsAbsences` : retour `[]` si le créneau n'est pas pédagogique.
- `MigrationService` : étape `2026.09.4` (décision 6).

### Composants

- `ecran-emploi-du-temps.component.html` : libellé du type via `typesCreneau` ; classe `--pause` sur les créneaux calculés `pauseDejeuner`.
- `ecran-emploi-du-temps.component.scss` : couleur `--pause` à 16 %.
- `edt-formulaire` : options de type depuis `typesCreneau` ; nettoyage des champs pédagogiques dans `onEnregistrerCreneau()`.
- `edtc-formulaire` : puce `tempsHorsClasse` (id `chipSourceEdtCalculetempsHorsClasse`).

### Tests unitaires

- `emploi-du-temps-calcule.service.spec.ts` : `tempsHorsClasse` produit récréations **et** pauses (source et libellé propres), n'inclut pas les créneaux pédagogiques ; les tests existants `recreation` passent à `tempsHorsClasse`.
- `emploi-du-temps.service.spec.ts` : aucun conflit pour une récréation ni pour une pause déjeuner chevauchant une absence ; conflit conservé pour un créneau pédagogique.
- `migration.service.spec.ts` : version courante `2026.09.4` ; renommage de la source, sans doublon si `tempsHorsClasse` est déjà présent ; nettoyage des champs pédagogiques des créneaux hors classe, champs conservés sur un créneau pédagogique.
- `edt-formulaire.component.spec.ts` : enregistrement d'une pause sans champs pédagogiques ; créneau pédagogique inchangé.
- `ecran-emploi-du-temps.component.spec.ts` : libellé exact du type dans la cellule ; classe `--pause` sur un créneau calculé issu d'une pause.
- Specs référençant `'2026.09.3'` comme version courante (`ecran-demarrage`, `migration`) : passage à `2026.09.4`.

### Tests E2E

- `selecteurs-emploi-du-temps.ts` : `chipSourceRecreation` → `chipSourceTempsHorsClasse`.
- Nouveau scénario **E2E-132** (E2E-131 est pris par une autre session) : créer un EDT, y ajouter un créneau de type pause déjeuner, vérifier le libellé « Pause déjeuner » dans la grille, puis créer un EDT calculé « Temps hors classe » et y retrouver la pause.
- Le jeu `maclasse-test.zip` n'est pas modifié (le scénario crée ses propres données).

### Documentation

- `specification/ecrans/emploi-du-temps.md` : libellé du type dans la cellule, pas de pastille ni de conflit hors créneau pédagogique, section EDT calculés (sources).
- `specification/modeles-donnees.md` : `CreneauEdt` / `TempsCreneau` à jour (temps multiples), `EmploiDuTempsCalcule`.
- `specification/elements-techniques.md` : liste des étapes de migration.
- `specification/libelles.md` : inchangé (exemple illustratif, sans la liste des clés EDT).
- `docs/README.md` : ligne du plan 20.

## Hors périmètre (constaté, non traité)

- `ecran-emploi-du-temps.component.scss` : `--pedagogique` utilise `var(--accent)` et `--recreation` `var(--succes, #27ae60)`, deux variables absentes des thèmes. La cellule pédagogique n'a donc pas de fond et la récréation retombe sur une couleur en dur. À corriger avec les thèmes (plan dédié).

- Cahier journal : `obtenirLibelleType()` pourra lire `typesCreneau` quand le plan 19 sera committé, ce qui permettra de supprimer `typeRecreation` et `typePauseDejeuner`.

## Vérification

1. `ng test` : tous verts, couverture ≥ 80 % sur les quatre métriques.
2. `npm run e2e` : tous verts, dont E2E-132.
3. Revue `revue-increment`.
