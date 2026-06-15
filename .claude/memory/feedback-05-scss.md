---
name: feedback-05-scss
description: Règles CSS spécifiques au projet Ma classe pour générer du code de qualité cohérent avec l'architecture existante
metadata:
  type: feedback
  updated: 2026-06-05
related:
  - projet-06-elementsTechniques
---

## Règle 1 - Généralité SCAA

SCSS pur sans bibliothèque UI externe (pas Tailwind)

## Règle 2 — Préfixe et globalisation

Toute classe `mc-` utilisée dans plus d'un composant doit être définie dans `styles.scss`.
Ne jamais redéfinir localement une classe déjà présente dans `styles.scss` (ni `mc-btn-xs`, ni `mc-btn-danger`, ni aucune autre).

**Why:** Des redéfinitions locales ont créé des divergences silencieuses (couleurs hardcodées vs variables, padding différent) découvertes lors d'un audit CSS.

**How to apply:** Avant d'écrire une classe dans un `.scss` de composant, vérifier qu'elle n'existe pas déjà dans `styles.scss`. Si elle existe dans deux composants, la déplacer dans `styles.scss`.

---

## Règle 3 — Boutons : composition, pas duplication

Toujours composer `base + modificateurs` : `mc-btn-fantome mc-btn-sm`, jamais créer une nouvelle classe "tout-en-un" qui encode à la fois le style et la taille.
Si une combinaison revient souvent, c'est le signe qu'un modificateur manque — pas qu'il faut une nouvelle classe de base.

Hiérarchie :
- Bases : `mc-btn-primaire`, `mc-btn-fantome`, `mc-btn-icone`
- Taille : `mc-btn-sm`, `mc-btn-xs`
- Couleur : `mc-btn-danger`

**Why:** La classe `mc-btn-secondaire` était en réalité `mc-btn-fantome mc-btn-sm` — un doublon de 21 lignes qui divergeait subtilement.

**How to apply:** À chaque nouveau bouton, choisir une base existante et ajouter les modificateurs nécessaires. Ne jamais créer de nouvelle classe de base bouton sans discussion.

---

## Règle 4 — Pas de couleurs hardcodées

Toujours utiliser les variables CSS du projet : `var(--erreur)`, `var(--primaire)`, `var(--bordure)`, etc.
Jamais de valeur hex en dur (`#c0392b`, `#ef4444`…) dans un fichier de composant.

**Why:** Des `#c0392b` hardcodés dans `fiche-projet.scss` ignoraient le thème et cassaient la cohérence visuelle avec les autres composants utilisant `var(--erreur)`.

**How to apply:** Systématiquement remplacer tout hex par la variable correspondante. Si la variable n'existe pas, la créer dans le thème plutôt que d'hardcoder.

---

## Règle 5 — Classes utilitaires globales à réutiliser

Avant de créer une classe dans un composant, vérifier l'existence dans `styles.scss` :

| Classe(s) | Usage |
|-----------|-------|
| `mc-chip` / `mc-chip-actif` / `mc-chip-disc` / `mc-chip-point` | Boutons de filtre sélectionnables |
| `mc-popover-entete/titre/sous-titre/carte/check/pied` | Popovers de sélection |
| `mc-liste-*` | Colonnes latérales avec recherche |
| `mc-fiche-*` | Panneaux de détail (élève, projet…) |
| `mc-section-*` | Accordéons |
| `mc-textarea` | Zone de texte standalone (bordure + focus) |
| `mc-disc-pill` | Badge statique de discipline (non interactif) |
| `mc-btn-ajouter` / `mc-btn-supprimer` | Boutons inline d'ajout/suppression de sous-éléments |

**Why:** Audit CSS a révélé que `mc-liste-*`, `mc-fiche-*`, `mc-section-*`, `mc-popover-*` étaient dupliqués quasi à l'identique dans chaque composant élève/projet.

**How to apply:** Consulter cette liste avant tout nouveau CSS de composant. En cas de doute, chercher dans `styles.scss` avec grep.

---

## Règle 6 — Règles d'impression

Le bloc `@media print` de `styles.scss` liste les classes globales à masquer à l'impression.
Toute nouvelle classe globale cachable doit y être ajoutée.
Ne jamais gérer l'impression dans les SCSS de composant.

**Why:** Centralisation garantit que l'impression est cohérente et que les règles ne sont pas dispersées dans 20 fichiers.

**How to apply:** Après ajout d'une nouvelle classe de bouton ou d'action dans `styles.scss`, vérifier si elle doit figurer dans le bloc `@media print`.

