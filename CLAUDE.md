# Configuration Claude Code — Ma classe

## Répertoire de mémoire

Le répertoire de mémoire persistante de ce projet est **`/workspaces/maclasse/.claude/memory/`** (versionné dans git).

**Règles impératives :**
- Lire la mémoire depuis `/workspaces/maclasse/.claude/memory/MEMORY.md` et les fichiers associés
- Écrire toute nouvelle mémoire **uniquement** dans `/workspaces/maclasse/.claude/memory/`
- Ne **jamais** écrire dans `~/.claude/projects/` ou tout autre chemin hors du répertoire de travail
- Mettre à jour `/workspaces/maclasse/.claude/memory/MEMORY.md` à chaque ajout ou modification de mémoire

## Règles de code

Les règles de codage du projet sont dans **`/workspaces/maclasse/.claude/rules/`** (versionné dans git). Elles sont injectées automatiquement par Claude Code selon le type de fichier traité (via le frontmatter `globs:`).

| Fichier | Contenu | Fichiers ciblés |
|---|---|---|
| `angular-typescript.md` | Conventions Angular 21, Signals, OnPush, templates | `**/*.ts` |
| `architecture.md` | ComposantBase, DTOs dans modeles/, constantes static readonly | `**/*.ts` |
| `collaboration.md` | Reformuler et valider avant toute écriture de code | `**/*` |
| `conventions-nommage.md` | Nommage français, organisation des répertoires, pas d'underscore | `**/*` |
| `html-ids.md` | `id` lowerCamelCase sur tout élément interactif | `**/*.html` |
| `jsdoc.md` | JSDoc rédigée obligatoire sur tous les membres | `**/*.ts` |
| `rgaa-accessibilite.md` | Focus modales, balises natives, `focusDemande` | `**/*.html`, `**/*.ts` |
| `scss-css.md` | Préfixe `mc-`, composition boutons, pas de hex, polices locales | `**/*.scss`, `**/index.html` |
| `tests.md` | Vitest, TestBed, pas de mocks, Object Mother, couverture 80% | `**/*.spec.ts` |

**Règle impérative :** toute nouvelle règle de code va dans un fichier de `rules/`, pas dans la mémoire.
