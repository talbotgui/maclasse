# Configuration Claude Code — Ma classe

## Répertoire de mémoire

Le répertoire de mémoire persistante de ce projet est **`/workspaces/maclasse/.claude/memory/`** (versionné dans git).

**Règles impératives :**
- Lire la mémoire depuis `/workspaces/maclasse/.claude/memory/MEMORY.md` et les fichiers associés
- Écrire toute nouvelle mémoire **uniquement** dans `/workspaces/maclasse/.claude/memory/`
- Ne **jamais** écrire dans `~/.claude/projects/` ou tout autre chemin hors du répertoire de travail
- Mettre à jour `/workspaces/maclasse/.claude/memory/MEMORY.md` à chaque ajout ou modification de mémoire

## Documentation

La documentation du projet est dans **`/workspaces/maclasse/docs/`** (versionnée dans git). Sommaire : `docs/README.md`.

| Répertoire | Contenu |
|---|---|
| `docs/specification/` | Description de l'application : modèles de données, services, thèmes, libellés, un fichier par écran dans `ecrans/` |
| `docs/plans/` | Un plan par évolution ou chantier, numéroté (`NN-sujet.md`) |
| `docs/audits/` | Audits et inventaires de constats, préfixés par la date |

**Règles impératives :**
- Lire la spécification concernée (`docs/specification/`) avant de modifier un écran, un modèle ou un service
- Écrire tout nouveau plan dans `docs/plans/` et tout audit dans `docs/audits/`, **jamais** dans la mémoire
- Mettre à jour la spécification quand une évolution change le comportement décrit, et `docs/README.md` à chaque ajout ou changement de statut d'un plan
- La mémoire (`.claude/memory/`) est réservée au profil de l'utilisateur, aux retours de collaboration et aux références (commandes, liens)

## Règles de code

Les règles de codage du projet sont dans **`/workspaces/maclasse/.claude/rules/`** (versionné dans git). Elles sont injectées automatiquement par Claude Code selon le type de fichier traité (via le frontmatter `globs:`).

| Fichier | Contenu | Fichiers ciblés |
|---|---|---|
| `angular-typescript.md` | Conventions Angular 22, Signals, OnPush, templates | `**/*.ts` |
| `architecture.md` | ComposantBase, DTOs dans modeles/, constantes static readonly | `**/*.ts` |
| `collaboration.md` | Reformuler et valider avant toute écriture de code | `**/*` |
| `conventions-nommage.md` | Nommage français, organisation des répertoires, pas d'underscore | `**/*` |
| `html-ids.md` | `id` lowerCamelCase sur tout élément interactif | `**/*.html` |
| `jsdoc.md` | JSDoc rédigée obligatoire sur tous les membres | `**/*.ts` |
| `lint.md` | ESLint bloquant (`npm run lint`), correspondance règles ESLint ↔ conventions | `**/*` |
| `rgaa-accessibilite.md` | Focus modales, balises natives, `focusDemande` | `**/*.html`, `**/*.ts` |
| `scss-css.md` | Préfixe `mc-`, composition boutons, pas de hex, polices locales | `**/*.scss`, `**/index.html` |
| `tests.md` | Vitest, TestBed, pas de mocks, Object Mother, couverture 80% | `**/*.spec.ts` |

**Règle impérative :** toute nouvelle règle de code va dans un fichier de `rules/`, pas dans la mémoire.
