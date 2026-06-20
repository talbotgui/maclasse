---
globs: ["**/*.scss", "**/*.html"]
---

# SCSS / CSS — Règles de style

## Généralités

SCSS pur — aucune bibliothèque UI externe (pas Tailwind, pas Bootstrap).

## Préfixe et globalisation

Toute classe `mc-` utilisée dans plus d'un composant doit être définie dans `styles.scss`.
Ne jamais redéfinir localement une classe déjà présente dans `styles.scss`.

Avant d'écrire une classe dans un `.scss` de composant, vérifier qu'elle n'existe pas déjà dans `styles.scss`.

## Boutons : composition, pas duplication

Composer `base + modificateurs` — jamais créer une nouvelle classe "tout-en-un".

- Bases : `mc-btn-primaire`, `mc-btn-fantome`, `mc-btn-icone`
- Taille : `mc-btn-sm`, `mc-btn-xs`
- Couleur : `mc-btn-danger`

Exemple : `class="mc-btn-fantome mc-btn-sm"` — pas de nouvelle classe de base sans discussion.

## Quand utiliser `mc-btn-sm`

**Taille normale (aucun modificateur)** — actions primaires isolées dans une fiche ou un formulaire à pleine largeur :
MODIFIER, ENREGISTRER, ANNULER, IMPRIMER, SUPPRIMER JOURNÉE, DUPLIQUER JOURNÉE.

**`mc-btn-sm`** — boutons dans un contexte compact (ligne de liste, formulaire inline) :
boutons ENREGISTRER/ANNULER dans les lignes de référentiels du paramétrage, mini-formulaire de duplication du CJ, boutons AJOUTER inline dans les sections de formulaire.

**`mc-bouton-destruction`** : utiliser `[petit]="true"` quand le composant est dans un formulaire ou une liste (même règle que `mc-btn-sm`). Sans cet attribut, il prend la taille normale (usage dans les fiches, à côté de MODIFIER).

## Pas de couleurs hardcodées

Utiliser exclusivement les variables CSS du projet : `var(--erreur)`, `var(--primaire)`, `var(--bordure)`…
Jamais de valeur hex en dur (`#c0392b`, `#ef4444`…) dans un fichier de composant.
Si la variable n'existe pas, la créer dans le thème.

## Classes utilitaires globales à réutiliser

Vérifier dans `styles.scss` avant d'écrire du CSS de composant :

| Classe(s) | Usage |
|---|---|
| `mc-chip` / `mc-chip-actif` / `mc-chip-disc` / `mc-chip-point` | Boutons de filtre sélectionnables |
| `mc-popover-entete/titre/sous-titre/carte/check/pied` | Popovers de sélection |
| `mc-liste-*` | Colonnes latérales avec recherche |
| `mc-fiche-*` | Panneaux de détail (élève, projet…) |
| `mc-section-*` | Accordéons |
| `mc-textarea` | Zone de texte standalone |
| `mc-disc-pill` | Badge statique de discipline |
| `mc-btn-ajouter` / `mc-btn-supprimer` | Boutons inline d'ajout/suppression |

## Règles d'impression

Le bloc `@media print` de `styles.scss` est la seule source de vérité pour l'impression.
Ne jamais gérer l'impression dans les SCSS de composant.
Après ajout d'une nouvelle classe globale, vérifier si elle doit figurer dans `@media print`.

## Polices locales uniquement

Ne jamais charger de polices depuis un CDN externe (Google Fonts, Bunny Fonts, cdnjs…).

- Toutes les polices dans `public/fonts/`
- Déclarer avec `@font-face` dans `styles.scss`, url `/fonts/<fichier>.woff2`
- Polices variables : `font-weight: 100 900` + `format('woff2-variations')`
- Pas de `<link>` Google Fonts dans `index.html`, ni `@import url(...)` externe dans le SCSS
