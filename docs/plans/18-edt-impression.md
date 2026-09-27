---
name: 18-edt-impression
description: Plan d'évolution — impression de l'emploi du temps en paysage, grille seule, titre du document porteur des métadonnées de l'EDT, contenu ramené sur une page unique
metadata:
  type: project
  updated: 2026-09-27
related:
  - specification/ecrans/emploi-du-temps
  - specification/elements-techniques
  - plans/12-edt-emplois-calcules
---

# Plan d'évolution — Impression de l'emploi du temps

## Contexte

L'impression de l'écran Emploi du temps n'était pas satisfaisante :

- orientation portrait par défaut ;
- colonnes gauche (liste des EDT) et droite (formulaire) imprimées malgré les règles `@media print` de `styles.scss` ;
- aucune indication des métadonnées de l'EDT imprimé ;
- grille coupée à la hauteur de l'écran ou répartie sur plusieurs pages.

**Cause du masquage inopérant** : les règles globales `.edt__gauche { display: none }` ont une spécificité (0,1,0) inférieure aux règles du composant, suffixées par Angular d'un attribut `[_ngcontent-xxx]` (0,2,0). Les mêmes conflits touchent `.edt { display: grid }` et les `overflow: hidden` / `height: 100%` du conteneur.

## Décisions validées

| # | Question | Décision |
|---|---|---|
| 1 | Orientation | Page nommée `edt-paysage` (`@page edt-paysage { size: A4 landscape }`), appliquée à `body:has(.edt)` (sur `.edt` même, le changement de page nommée ajoutait des pages portrait vides autour de la grille). Chrome/Edge imposent alors le paysage (sélecteur d'orientation masqué). |
| 2 | Titre | Uniquement dans `document.title`, remplacé au `beforeprint` et restauré au `afterprint` (fonctionne aussi avec Ctrl+P). Repris dans l'en-tête d'impression du navigateur et le nom du PDF proposé. |
| 3 | Format du titre | `nom (JJ/MM/AAAA-JJ/MM/AAAA / fréquence)`. Début seul : `nom (à partir du JJ/MM/AAAA / fréquence)`. Fin seule : `nom (jusqu'au JJ/MM/AAAA / fréquence)`. Aucune date : `nom (fréquence)`. Fréquence : libellés `LIBELLES.edt.frequence*`. Même règle pour un EDT calculé. |
| 4 | Page unique | Option B : facteur `zoom` ≤ 1 calculé au `beforeprint`, porté par la variable CSS `--edt-echelle-impression`, remis à 1 au `afterprint`. Les styles compacts envisagés se sont révélés inutiles : la réduction suffit. |

## Mise en œuvre

### `styles.scss` — bloc `@media print`

- `@page edt-paysage { size: A4 landscape; margin: 10mm; }` et `body:has(.edt) { page: edt-paysage; }`.
- `!important` sur le masquage de `.edt__gauche`, `.edt__droite`, `.edt__bandeau-absences`, `.edt__btn-icone-conflit`, et ajout de `.edt__btn-ajouter-creneau`, `.edt__grille-ligne-ajout`.
- Levée des contraintes de hauteur et de débordement : `ecran-emploi-du-temps`, `.edt`, `.edt__grille-conteneur`, `.edt__grille-defilement` en `display: block`, `height: auto`, `overflow: visible`.
- En-têtes de colonnes non collants (`position: static`).
- `zoom: var(--edt-echelle-impression, 1)` sur `.edt__grille-conteneur`.

### Composant `EcranEmploiDuTempsComponent`

- `titreImpression` (`computed`) : titre formaté de l'EDT ou de l'EDT calculé affiché, chaîne vide sinon.
- `host: { '(window:beforeprint)': 'preparerImpression()', '(window:afterprint)': 'terminerImpression()' }`.
- `preparerImpression()` : mémorise `document.title`, le remplace par `titreImpression()` s'il est non vide, puis mesure la grille à la largeur imprimable (277 mm ≈ 1047 px) et calcule `zoom = min(1, 718 px / hauteur)` (190 mm de hauteur imprimable). La mesure se fait avec les styles écran (lignes d'ajout encore visibles, espacements plus larges) : l'estimation est prudente.
- `terminerImpression()` : restaure le titre et remet l'échelle à 1.
- Nouveaux libellés `LIBELLES.edt.prefixeImpressionDepuis` / `prefixeImpressionJusquau`.

## Tests

- Unitaires : `titreImpression` (4 combinaisons de dates, 3 fréquences, EDT calculé, aucune sélection) ; `preparerImpression` / `terminerImpression` (titre remplacé puis restauré, titre inchangé sans sélection, échelle) ; calcul du facteur d'échelle (hauteur nulle, contenu plus petit, contenu plus grand).
- E2E : en média `print`, les colonnes gauche et droite sont masquées et la grille visible.

## Bilan

Terminé le 2026-09-27. PDF Chromium de l'EDT « Semaine paire » du jeu de test (11 créneaux/jour) : une page A4 paysage, facteur de réduction ≈ 0,85.
