# Ma classe

SPA Angular destinée aux enseignants du primaire (CP–CM2) pour gérer leur classe au quotidien.

Fonctionne entièrement **sans backend** : toutes les données sont stockées dans un fichier JSON chiffré (AES-256-GCM) que l'enseignant télécharge et recharge à chaque session.


## 1/ Installation et démarrage

### 1.1/ Prérequis

Il est nécessaire d'installer
* Node.js ≥ 24
* npm 11.x

### 1.2/ Commandes utiles

```bash
# Installer les dépendances
npm ci

# Démarrer le serveur de développement
npm start

# Lancer les tests unitaires (Vitest)
npm test

# Build de production
npm run build
```

L'application est accessible sur `http://localhost:4200`.

### 1.3/ Claude Code

ClaudeCode est à installer aussi sur le poste de développement

*Dans Github CodeSpace, les actions ci-dessous sont réalisées automatiquement.*

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

### 1.4/ Déploiement sur GitHub Pages

Le déploiement utilise [`angular-cli-ghpages`](https://github.com/angular-schule/angular-cli-ghpages), ajouté au projet via `ng add angular-cli-ghpages`.

```bash
# Build + publication sur la branche gh-pages du dépôt
ng deploy
```

Cette commande build l'application puis pousse le contenu de `dist/` sur la branche `gh-pages`, servie ensuite par GitHub Pages.

Points de configuration, dans `angular.json` (cible `deploy`) :
* `baseHref: "/maclasse/"` — l'application est servie sous `https://<utilisateur>.github.io/maclasse/` (nom du dépôt), pas à la racine du domaine. Sans ce `base-href`, les assets (JS/CSS/polices locales) ne se chargeraient pas.
* Le routing Angular utilise `withHashLocation()` (`src/app/app.config.ts`) : les URLs sont de la forme `/#/eleves`. GitHub Pages ne fait pas de rewrite serveur pour une SPA — un rafraîchissement sur une route en path routing renverrait un 404. Le hash routing évite ce problème sans configuration supplémentaire côté hébergement.

## 2/ Notes du (re/re/re)-démarrage du projet

### 2.1/ Initialisation du dépôt

Pour initialiser le projet :
* initialiser le répertoire .claude avec son contenu
  * .claude/memory avec les règles de conception du projet et les premiers éléments décrivant le projet (les fichiers feedback capitalisés)
  * .claude/settings.json avec le hook de sauvegarde des prompts
  * .claude/settings.local.json avec les permissions et interdictions
* initialiser le répertoire .devcontainer avec les configurations simplifiant l'initialisation du codespace
* initialiser la configuration SonarQube dans sonar-project.properties

### 2.2/ Création technique du projet

Initialisation de l'application Angular :
* ```npm install -g @angular/cli```
* ```ng new classe --ai-config=none --directory=. --skip-tests=false --ssr=false --style=scss --commit=false```

Personnaliser le contenu des éléments générés :
* renseigner le README.md
* renseigner le .gitignore
* vider le code généré dans src/app/*

### 2.3/ Création fonctionnelle du projet

A ce stade,
* le projet démarre mais l'application est vide.
* Claude a ses consignes mais ne sait rien de l'application
* le dépôt est dans un état stable (commit réalisé).



## 3/ PIC

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=talbotgui_maclasse&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=talbotgui_maclasse)

Analyse de qualité via SonarCloud, intégrée au dépôt (`sonar-project.properties`).

