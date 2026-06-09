---
name: feedback-09-polices
description: Toutes les polices doivent être hébergées localement dans public/fonts/ — aucune dépendance à un CDN externe (Google Fonts, etc.)
metadata:
  type: feedback
---

Ne jamais charger de polices depuis un CDN externe (Google Fonts, Bunny Fonts, cdnjs…).

**Why:** L'application est offline-first ; une dépendance réseau pour les polices casserait le rendu hors ligne. C'est aussi une règle de confidentialité (pas de requêtes vers des tiers).

**How to apply:**
- Toutes les polices sont dans `public/fonts/` (servi automatiquement via le glob `public/**/*` dans angular.json).
- Déclarer chaque police avec `@font-face` dans `styles.scss`, url `/fonts/<fichier>.woff2`.
- Pour les polices variables : `font-weight: 100 900` + `format('woff2-variations')`.
- Pour les polices à sous-ensembles (latin, latin-ext) : un bloc `@font-face` par fichier avec `unicode-range` approprié.
- Ne jamais ajouter de `<link>` Google Fonts dans `index.html`, ni de `@import url(...)` vers un domaine externe dans le SCSS.
- Ne pas ajouter d'entrées `node_modules` dans les assets de `angular.json` pour des polices déjà présentes dans `public/fonts/`.
