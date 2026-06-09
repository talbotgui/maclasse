---
name: project-06-scss
description: Variables CSS custom properties des thèmes et catalogue des classes utilitaires globales
metadata:
  type: project
  updated: 2026-06-05
related:
  - feedback-05-scss
---

Les thèmes injectent dynamiquement des variables CSS via `varsTheme()` (modèle `theme.ts`) sur l'élément racine. Tout le design s'appuie sur ces variables — jamais de couleurs hexadécimales hardcodées.

**Why:** 9 thèmes interchangeables à chaud. Coder une couleur en dur casserait le thème.

**How to apply:** Toujours utiliser `var(--nom-variable)` en SCSS. Ne jamais écrire de valeur hex directement. Voir [[feedback-05-scss]].

## Variables CSS disponibles

| Variable | Rôle |
|----------|------|
| `--papier` | Fond principal de la page |
| `--papier2` | Fond secondaire |
| `--carte` | Fond des cartes / panneaux |
| `--carte2` | Fond cartes variante |
| `--encre` | Texte principal (foncé) |
| `--encre2` | Texte secondaire |
| `--milieu` | Ton intermédiaire |
| `--discret` | Éléments peu saillants |
| `--bordure` | Bordures principales |
| `--bordure2` | Bordures variante |
| `--primaire` | Accentuation principale |
| `--primaire-sombre` | Primaire pour hover/focus |
| `--primaire-leger` | Primaire à 13% d'opacité |
| `--surbrillance` | Mise en évidence résultats de recherche |
| `--accent` | Accent secondaire |
| `--erreur` | Rouge danger (`#c0392b` en fallback) |

## 9 identifiants de thème (`IdentifiantTheme`)

`'cahier'` `'encre'` `'preau'` `'ardoise'` `'rosier'` `'recre'` `'mandarine'` `'lavande'` `'menthe'`

## Classes utilitaires globales (définies dans `styles.scss`)

### Accessibilité (RGAA)
- `.mc-lien-evitement` — lien d'accès rapide (skip nav)
- `.mc-visually-hidden` — masqué visuellement, accessible au lecteur d'écran

### Boutons
- `.mc-btn-primaire` — bouton plein (couleur primaire)
- `.mc-btn-fantome` — bouton contour
- `.mc-btn-icone` — bouton icône seule (sans label)
- `.mc-btn-ajouter` — bouton inline d'ajout de sous-élément
- `.mc-btn-supprimer` — bouton inline de suppression de sous-élément
- `.mc-btn-supprimer-inclusion` — variante suppression pour les inclusions
- Modifieurs : `-sm`, `-xs`, `-danger`

### Formulaires
- `.mc-input` — champ texte avec focus personnalisé
- `.mc-checkbox` — case à cocher
- `.mc-textarea` — zone de texte

### Composants UI
- `.mc-chip` / `.mc-chip-actif` / `.mc-chip-disc` / `.mc-chip-point` — tags / puces (disc = style discret, point = point coloré)
- `.mc-disc-pill` — pilule discrète (Geist Mono, 10px)

### Layouts maître-détail
- `.mc-liste-entete` / `.mc-liste-recherche` / `.mc-liste-corps` / `.mc-liste-items` — colonne liste
- `.mc-fiche-entete` / `.mc-fiche-titre` / `.mc-fiche-actions` / `.mc-fiche-corps` — panneau détail

### Accordéons
- `.mc-section-titre` / `.mc-section-chevron` / `.mc-section-icone` / `.mc-section-corps`

### Popovers
- `.mc-popover-entete` / `.mc-popover-titre` / `.mc-popover-cartes` / `.mc-popover-pied`

### Impression (`@media print`)
Palette neutre (noir/blanc), masquage de la barre supérieure, des listes et des boutons, layouts en flux simple, débordements visibles. Toute règle d'impression doit être centralisée dans `styles.scss`.

## Polices

- **Geist** (Variable, 100–900) — UI générale
- **Geist Mono** (Variable, 100–900) — codes, pilules
- **Newsreader** (normal & italic, 400–600) — titres
