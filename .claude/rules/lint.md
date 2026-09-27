---
globs: "**/*"
---

# Lint — ESLint bloquant

ESLint (angular-eslint) est configuré dans `eslint.config.js` et couvre `src/**/*.ts`, `src/**/*.html`, `e2e/**/*.ts` et `playwright.config.ts`. Toutes les règles sont en `error` : le lint est bloquant.

```bash
npm run lint           # ng lint
npm run lint:corriger  # ng lint --fix (corrections automatiques)
```

## Règles impératives

- Un incrément n'est pas terminé tant que `npm run lint` signale une erreur dans un fichier de cet incrément.
- Ne jamais désactiver une règle localement (`eslint-disable`, `eslint-disable-next-line`) sans l'accord explicite de l'utilisateur. Si une règle produit un faux positif récurrent, proposer un réglage dans `eslint.config.js`.
- Toute nouvelle convention vérifiable par ESLint et ajoutée dans `.claude/rules/` doit aussi être ajoutée à `eslint.config.js`.
- `npm run lint:corriger` peut modifier des fichiers hors de l'incrément : ne l'utiliser que sur les fichiers de l'incrément (`npx eslint --fix <fichiers>`) quand d'autres sessions travaillent en parallèle.

## Correspondance avec les autres règles

| Règle ESLint | Convention |
|---|---|
| `explicit-member-accessibility` | visibilité explicite (`angular-typescript.md`) |
| `naming-convention` (underscore interdit sur `private`/`protected`) | `conventions-nommage.md` |
| `no-explicit-any` (hors specs) | `strict`, pas de `any` (`angular-typescript.md`) |
| `prefer-on-push-component-change-detection` (hors specs) | `OnPush` (`angular-typescript.md`) |
| `prefer-signals` | signaux `readonly`, `input()` signal |
| `no-restricted-imports` (`Input`, `Output`, `HostBinding`, `HostListener`, `NgClass`, `NgStyle`, `NgIf`, `NgFor`, `NgSwitch`) | `angular-typescript.md` |
| `template/prefer-control-flow` | `@if`/`@for`/`@switch` |
| `component-selector` / `directive-selector` (préfixes `mc`, `app`, `ecran`, `popin`, `fe`, `fp`, `edt`, `edtc`, `cj`) | `conventions-nommage.md` |
| preset `templateAccessibility` | `rgaa-accessibilite.md` |

Nouveau préfixe de sous-composant d'écran → l'ajouter à `PREFIXES_SELECTEURS` dans `eslint.config.js`.
