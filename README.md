# Ma classe

SPA Angular destinée aux enseignants du primaire (CP–CM2) pour gérer leur classe au quotidien.

Fonctionne entièrement **sans backend** : toutes les données sont stockées dans un fichier JSON chiffré (AES-256-GCM) que l'enseignant télécharge et recharge à chaque session.

## 1/ Installation et démarrage

### 1.1/ Prérequis

- Node.js ≥ 20
- npm 11.x

### 1.2/ Commandes

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm start

# Lancer les tests unitaires (Vitest)
npm test

# Build de production
npm run build
```

L'application est accessible sur `http://localhost:4200`.

## 2/ Stack technique

| Domaine | Technologie |
|---------|-------------|
| Framework | Angular 21.2 (standalone, Signals, control flow natif) |
| Langage | TypeScript 5.9 strict |
| Styles | SCSS + CSS custom properties — 9 thèmes interchangeables |
| Tests | Vitest 4.x + jsdom |
| Drag & drop | @angular/cdk |
| Polices | Geist, Geist Mono, Newsreader (Google Fonts) |

## 3/ PIC

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=talbotgui_maclasse&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=talbotgui_maclasse)

Analyse de qualité via SonarCloud, intégrée au dépôt (`sonar-project.properties`).

## 4/ Configuration de Claude Code sur un nouveau poste de développement

*Dans Github CodeSpace, ces actions sont réalisées automatiquement.*

La mémoire de Claude (contexte projet, conventions, règles) est versionnée dans git sous `.claude/memory/`.
Après le premier `git clone`, une seule commande suffit pour que Claude y accède automatiquement :

```bash
# Créer le répertoire harness si nécessaire
mkdir -p ~/.claude/projects/-workspaces-maclasse

# Remplacer le répertoire mémoire local par un lien symbolique vers le répertoire git-tracké
rm -rf ~/.claude/projects/-workspaces-maclasse/memory
ln -s /workspaces/maclasse/.claude/memory ~/.claude/projects/-workspaces-maclasse/memory
```

> **Pourquoi ?** Claude Code stocke sa mémoire dans `~/.claude/projects/<chemin-projet>/memory/` (local à la machine).
> Le lien symbolique redirige ce chemin vers `.claude/memory/` dans le dépôt,
> ce qui garantit que toutes les conventions, règles et le contexte projet sont partagés entre postes et persistent dans git.
