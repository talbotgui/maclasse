---
name: feedback-02-conventions
description: Tout le code doit être nommé en français — variables, méthodes, classes, fichiers, routes, types, interfaces
metadata:
  type: feedback
  updated: 2026-06-05
related:
  - feedback-03-doc
---

## Règle 1 - nommage

Utiliser exclusivement des noms français pour tout ce qui est nommé dans le code du projet (noms de fichiers, classes, méthodes, variables).

Toute méthode commence par un verbe à l'infinitif

**Why:** Choix délibéré du développeur pour la cohérence et la lisibilité dans un projet 100% français.

**How to apply:**
- Noms de classes : `BarreSuperieure`, `PageCompetences`, `ContexteService`, `ChiffrementService`
- Noms de fichiers : `barre-superieure.ts`, `contexte.service.ts`, `donnees-chargees.garde.ts`
- Noms de méthodes : `filtrerCompetences()`, `chargerFichier()`, `reinitialiser()`
- Noms de propriétés/variables : `competencesSelectionnees`, `vueActive`, `requeteRecherche`
- Noms de types/interfaces : `DonneesEnseignant`, `BrancheCompetences`, `StatutAcquisition`
- Suffixes de fichiers Angular : garder les conventions techniques (`.service.ts`, `.ts`, `.html`, `.scss`) mais utiliser `.garde.ts` plutôt que `.guard.ts`, `.tuyau.ts` plutôt que `.pipe.ts`
- Exception : ce qu'impose Angular/TypeScript/les librairies (`@Component`, `@Injectable`, `signal`, `RouterOutlet`, etc.) reste en anglais
- Exception : noms propres techniques (`JsonValue`, `JsonPath`) qui sont des acronymes/termes propres

## Règle 2 — Organisation des répertoires

Toute nouvelle artefact doit être placé dans le répertoire correspondant à sa nature, sous `Sources/src/app/`.

**Why:** Conventions établies dès la création du projet et appliquées uniformément sur toute la base de code.

**How to apply:** Déterminer la nature de l'artefact, puis appliquer la règle de placement ci-dessous.

### 2.1/ Services — `services/`

Un fichier par service. Suffixe `.service.ts`. Classe `XxxService` avec `providedIn: 'root'`.

### 2.2/ Gardes — `gardes/`

Un fichier par garde. Suffixe `.garde.ts` (jamais `.guard.ts`). Classe `XxxGarde`.

### 2.3/ Directives — `directives/`

Un fichier par directive. Suffixe `.directive.ts`. Classe `XxxDirective`.

### 2.4/ Tuyaux (pipes) — `tuyaux/`

Un fichier par tuyau. Suffixe `.tuyau.ts` (jamais `.pipe.ts`). Classe `XxxTuyau`.

### 2.5/ Modèles — `modeles/`

Un fichier par domaine métier. Pas de logique — uniquement des interfaces, types et constantes de données.

### 2.6/ Utilitaires — `utilitaires/`

Classes avec méthodes statiques uniquement — jamais de fonctions standalone. Un fichier par thème fonctionnel.

### 2.7/ Pages — `pages/`

Un répertoire par page (route). La page elle-même (`xxx.ts/html/scss`) et ses composants propres dans des sous-répertoires

**Règle de préfixe pour les sous-composants d'une page :** utiliser un préfixe abrégé dérivé du composant parent (`fe-` pour fiche-eleve, `fp-` pour fiche-projet, `ds-` pour detail-seance). Cela évite les collisions de noms et rend l'appartenance immédiatement lisible.

### Composants partagés — `composants/`

Composants réutilisables entre plusieurs pages. Chaque composant dans son propre répertoire. Ses sous-composants directs sont des sous-répertoires du même répertoire.

**Critère de partage :** un composant va dans `composants/` uniquement s'il est utilisé par au moins deux pages différentes. Sinon, il va dans le répertoire de sa page.

