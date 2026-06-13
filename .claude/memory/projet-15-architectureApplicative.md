---
name: projet-15-architectureApplicative
description: Architecture applicative de MaClasse — structure des dossiers, conventions de nommage, ordre d'implémentation
metadata:
  type: project
  updated: 2026-06-13
related:
  - projet-01-descriptionGenerale
  - projet-05-services
  - projet-06-elementsTechniques
  - feedback-01-angular
  - feedback-02-conventions
---

## Principe général

Application Angular 21 **standalone** : pas de `NgModule`. Chaque composant, directive et pipe est déclaré `standalone: true`. Les services sont `providedIn: 'root'`.

---

## Structure des dossiers

```
maclasse/
├── public/
│   ├── fonts/                        # Polices locales (@font-face dans styles.scss)
│   └── donnees-defaut.json           # Données d'exemple (bootstrap "Nouveau fichier")
│
└── src/
    ├── index.html
    ├── main.ts
    ├── styles.scss                   # Variables CSS, @font-face, @media print, classes utilitaires
    │
    └── app/
        ├── app.ts                    # Composant racine (layout : entête + <router-outlet>)
        ├── app.html
        ├── app.scss
        ├── app.config.ts             # ApplicationConfig (routes, providers)
        ├── app.routes.ts             # Routes + DonneesChargeesGarde
        │
        ├── modeles/                  # Interfaces et types TypeScript
        │   ├── donnees-application.modele.ts   # Structure racine du JSON
        │   ├── eleve.modele.ts
        │   ├── projet.modele.ts
        │   ├── emploi-du-temps.modele.ts
        │   ├── cahier-journal.modele.ts
        │   ├── referentiels.modele.ts
        │   └── commande.modele.ts    # Interface Commande (executer/annuler)
        │
        ├── services/
        │   ├── avecEtat/
        │   │   |── donnees.service.ts
        │   │   └── contexte.service.ts
        │   └── sansEtat/
        │       ├── sauvegarde-auto.service.ts
        │       ├── chiffrement.service.ts
        │       ├── recherche-globale.service.ts
        │       ├── eleve.service.ts
        │       ├── projet.service.ts
        │       ├── competence.service.ts
        │       ├── emploi-du-temps.service.ts
        │       ├── cahier-journal.service.ts
        │       └── referentiel.service.ts
        │
        ├── commandes/                # Implémentations du pattern Commande (génériques)
        │   ├── commande-creation.ts
        │   ├── commande-modification.ts
        │   ├── commande-suppression.ts
        │   ├── commande-deplacement.ts
        │   └── commande-initialisation-journee.ts
        │
        ├── gardes/
        │   └── donnees-chargees.garde.ts   # Redirige vers /demarrage si pas de données
        │
        ├── utilitaires/
        │   └── date.utils.ts               # DateUtils (J±1, J±7, parité, formatage)
        │
        ├── partage/
        │   ├── composant-base.ts           # ComposantBase (LIBELLES accessible dans templates)
        │   │
        │   ├── composants/                 # Composants mc-* réutilisables
        │   │   ├── mc-input/
        │   │   │   ├── mc-input.component.ts
        │   │   │   ├── mc-input.component.html
        │   │   │   └── mc-input.component.scss
        │   │   ├── mc-textarea/
        │   │   ├── mc-checkbox/
        │   │   ├── mc-select/
        │   │   ├── mc-radio-group/
        │   │   ├── mc-champ-heure/
        │   │   ├── mc-chip-filtre/
        │   │   ├── mc-badge-statut/
        │   │   ├── mc-champ-recherche/
        │   │   ├── mc-bouton-destruction/
        │   │   ├── mc-mini-calendrier/
        │   │   ├── mc-selecteur-competences/
        │   │   └── mc-eleves-concernes/
        │   │
        │   ├── directives/
        │   │   └── mc-auto-focus.directive.ts
        │   │
        │   ├── pipes/
        │   │   └── format-date.pipe.ts
        │   │
        │   └── popins/
        │       ├── popin-demarrage/
        │       ├── popin-sauvegarde/
        │       ├── popin-warnings-absences/
        │       ├── popin-avertissement/
        │       └── popin-export-competences/
        │
        └── ecrans/
            ├── demarrage/
            ├── accueil/
            ├── eleves/
            ├── projets/
            ├── competences/
            ├── emploi-du-temps/
            ├── cahier-journal/
            └── parametrage/
```

---

## Conventions de nommage des fichiers

| Type | Fichier | Classe |
|---|---|---|
| Composant racine | `app.ts` | `App` |
| Composant d'écran | `ecran-eleves.component.ts` | `EcranElevesComponent` |
| Composant partagé | `mc-input.component.ts` | `McInputComponent` |
| Popin | `popin-avertissement.component.ts` | `PopinAvertissementComponent` |
| Service | `donnees.service.ts` | `DonneesService` |
| Garde | `donnees-chargees.garde.ts` | `DonneesChargeesGarde` |
| Directive | `mc-auto-focus.directive.ts` | `McAutoFocusDirective` |
| Pipe | `format-date.pipe.ts` | `FormatDatePipe` |
| Interface modèle | `eleve.modele.ts` | `Eleve`, `Contact`, `AbsenceRecurrente`… |
| Commande | `commande-creation.ts` | `CommandeCreation` |
| Classe utilitaire | `date.utils.ts` | `DateUtils` |

> Pas de suffixe `.modele.ts` imposé par Angular — c'est une convention maison pour distinguer les fichiers de types.

---

## Styles globaux (`styles.scss`)

Le fichier `styles.scss` contient :

1. **`@font-face`** — déclarations des polices locales depuis `public/fonts/`
2. **Variables CSS** — sur `:root` pour le thème par défaut, surchargées sur `[data-theme="contraste"]` pour le thème fort contraste
3. **Classes utilitaires CSS** — layout, espacement, accessibilité (`sr-only`…)
4. **`@media print`** — masque la colonne gauche (`.mc-colonne-gauche`) dans tous les écrans

---

## Ordre d'implémentation recommandé

Chaque étape doit être validée avant de passer à la suivante.

### Étape 1 — Squelette et configuration

- `app.ts`, `app.html`, `app.scss`
- `app.config.ts` (providers, routing)
- `app.routes.ts` (routes + `DonneesChargeesGarde`)
- `gardes/donnees-chargees.garde.ts`
- `styles.scss` (variables CSS + thèmes)

### Étape 2 — Modèles TypeScript

- Tous les fichiers de `modeles/` (interfaces uniquement, pas de logique)

### Étape 3 — Services de contexte

- `commandes/` (5 classes, pur TypeScript)
- `services/avecEtat/donnees.service.ts`
- `services/avecEtat/contexte.service.ts`
- `services/sansEtat/chiffrement.service.ts`

### Étape 4 — Services métier

- `utilitaires/date.utils.ts`
- `services/sansEtat/referentiel.service.ts`
- `services/sansEtat/eleve.service.ts`
- `services/sansEtat/competence.service.ts`
- `services/sansEtat/projet.service.ts`
- `services/sansEtat/emploi-du-temps.service.ts`
- `services/sansEtat/cahier-journal.service.ts`
- `services/sansEtat/sauvegarde-auto.service.ts`
- `services/sansEtat/recherche-globale.service.ts`

### Étape 5 — Composants partagés simples

Dans cet ordre (des plus simples aux plus complexes) :
`mc-input` → `mc-textarea` → `mc-champ-heure` → `mc-checkbox` → `mc-select` → `mc-radio-group` → `mc-chip-filtre` → `mc-badge-statut` → `mc-champ-recherche` → `mc-bouton-destruction`

### Étape 6 — Directives et pipes

- `mc-auto-focus.directive.ts`
- `format-date.pipe.ts`

### Étape 7 — Composants partagés riches et popins

- `mc-mini-calendrier` → `mc-selecteur-competences` → `mc-eleves-concernes`
- `popin-avertissement` → `popin-sauvegarde` → `popin-warnings-absences` → `popin-export-competences` → `popin-demarrage`

### Étape 8 — Composant de base partagé

- `partage/composant-base.ts` (classe de base pour les composants partagés)

### Étape 9 — Écrans (du plus simple au plus complexe)

`ecran-demarrage` → `ecran-accueil` → `ecran-parametrage` → `ecran-eleves` → `ecran-projets` → `ecran-competences` → `ecran-emploi-du-temps` → `ecran-cahier-journal`

### Étape 10 — Entête

- Intégration de l'entête dans `app.ts` : navigation, SAUVEGARDER, ANNULER/REFAIRE, recherche globale, thème

---

## Décisions techniques structurantes

| Sujet | Décision |
|---|---|
| Modules Angular | Aucun — tout est `standalone: true` |
| State management | Signal unique dans `DonneesService` (pas de NgRx ni autre store) |
| Formulaires | `ControlValueAccessor` dans les composants `mc-*` |
| Détection de changement | `ChangeDetectionStrategy.OnPush` sur tous les composants |
| Injection | `inject()` (pas de constructeur à injection) |
| Inputs/Outputs | `input()` / `output()` (pas de `@Input` / `@Output`) |
| Tests | Vitest, sans TestBed, instanciation directe |
| Polices | Locales dans `public/fonts/`, jamais de CDN |
| Couleurs | Variables CSS uniquement, jamais de couleur hardcodée |
