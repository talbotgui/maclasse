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

Application Angular 21 **standalone** : pas de `NgModule`. Chaque composant, directive et tuyau est déclaré `standalone: true` (valeur par défaut depuis Angular v20, ne pas écrire `standalone: true` explicitement). Les services sont `providedIn: 'root'`.

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
        ├── app.routes.ts             # Routes avec loadComponent (lazy) + DonneesChargeesGarde
        ├── composant-base.ts         # ComposantBase — expose LIBELLES dans les templates
        ├── libelles.ts               # Constantes de libellés UI centralisées
        │
        ├── modeles/                  # Interfaces et types TypeScript (pas de logique)
        │   ├── donnees-application.modele.ts   # Structure racine du JSON
        │   ├── eleve.modele.ts
        │   ├── projet.modele.ts
        │   ├── emploi-du-temps.modele.ts
        │   ├── cahier-journal.modele.ts
        │   ├── referentiels.modele.ts
        │   └── commande.modele.ts    # Interface Commande (executer/annuler)
        │
        ├── services/
        │   ├── avecEtat/             # Services portant un état (signal)
        │   │   ├── donnees.service.ts
        │   │   └── contexte.service.ts
        │   └── sansEtat/             # Services stateless (algorithmes, I/O)
        │       ├── chiffrement.service.ts
        │       ├── sauvegarde-auto.service.ts
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
        ├── composants/               # Composants mc-* partagés (≥ 2 écrans ou usage global)
        │   ├── mc-entete/            # En-tête de l'application (instancié dans app.ts)
        │   │   ├── mc-entete.component.ts
        │   │   ├── mc-entete.component.html
        │   │   └── mc-entete.component.scss
        │   ├── mc-input/
        │   │   ├── mc-input.component.ts
        │   │   ├── mc-input.component.html
        │   │   └── mc-input.component.scss
        │   ├── mc-textarea/
        │   ├── mc-checkbox/
        │   ├── mc-select/
        │   ├── mc-radio-group/
        │   ├── mc-champ-heure/
        │   ├── mc-chip-filtre/
        │   ├── mc-badge-statut/
        │   ├── mc-champ-recherche/
        │   ├── mc-bouton-destruction/
        │   ├── mc-mini-calendrier/
        │   ├── mc-selecteur-competences/
        │   ├── mc-eleves-concernes/
        │   └── popins/
        │       ├── popin-demarrage/
        │       ├── popin-sauvegarde/
        │       ├── popin-warnings-absences/
        │       ├── popin-avertissement/
        │       └── popin-export-competences/
        │
        ├── directives/
        │   └── mc-auto-focus.directive.ts
        │
        ├── tuyaux/
        │   └── format-date.tuyau.ts
        │
        └── ecrans/
            ├── demarrage/
            │   ├── ecran-demarrage.component.ts
            │   ├── ecran-demarrage.component.html
            │   └── ecran-demarrage.component.scss
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
| Service (avec état) | `donnees.service.ts` | `DonneesService` |
| Service (sans état) | `eleve.service.ts` | `EleveService` |
| Garde | `donnees-chargees.garde.ts` | `DonneesChargeesGarde` |
| Directive | `mc-auto-focus.directive.ts` | `McAutoFocusDirective` |
| Tuyau (pipe) | `format-date.tuyau.ts` | `FormatDateTuyau` |
| Interface modèle | `eleve.modele.ts` | `Eleve`, `Contact`, `AbsenceRecurrente`… |
| Commande | `commande-creation.ts` | `CommandeCreation` |
| Classe utilitaire | `date.utils.ts` | `DateUtils` |

> Le suffixe `.tuyau.ts` remplace `.pipe.ts` (convention française du projet — voir feedback-02).

---

## Fichiers racine de `app/`

| Fichier | Rôle |
|---|---|
| `app.ts` | Composant racine : entête + `<router-outlet>` |
| `app.config.ts` | `ApplicationConfig` : providers, withRouter |
| `app.routes.ts` | Toutes les routes avec `loadComponent` (lazy) + `DonneesChargeesGarde` |
| `composant-base.ts` | Classe de base pour les composants partagés — expose `LIBELLES` |
| `libelles.ts` | Constantes de libellés centralisées (chaînes UI), importé par `composant-base.ts` |

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
- `app.routes.ts` (routes lazy + `DonneesChargeesGarde`)
- `gardes/donnees-chargees.garde.ts`
- `styles.scss` (variables CSS + thèmes)
- `libelles.ts` + `composant-base.ts`

### Étape 2 — Modèles TypeScript

- Tous les fichiers de `modeles/` (interfaces uniquement, pas de logique)

### Étape 3 — Services de contexte et chiffrement

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

### Étape 5 — Directive et tuyau

- `directives/mc-auto-focus.directive.ts`
- `tuyaux/format-date.tuyau.ts`

### Étape 6 — Composants partagés simples

Dans cet ordre (des plus simples aux plus complexes) :
`mc-input` → `mc-textarea` → `mc-champ-heure` → `mc-checkbox` → `mc-select` → `mc-radio-group` → `mc-chip-filtre` → `mc-badge-statut` → `mc-champ-recherche` → `mc-bouton-destruction`

### Étape 7 — Composants partagés riches et popins

- `mc-mini-calendrier` → `mc-selecteur-competences` → `mc-eleves-concernes`
- `popin-avertissement` → `popin-sauvegarde` → `popin-warnings-absences` → `popin-export-competences` → `popin-demarrage`

### Étape 8 — Écrans (du plus simple au plus complexe)

`ecran-demarrage` → `ecran-accueil` → `ecran-parametrage` → `ecran-eleves` → `ecran-projets` → `ecran-competences` → `ecran-emploi-du-temps` → `ecran-cahier-journal`

### Étape 9 — Composant d'en-tête

- `composants/mc-entete/` (voir [[projet-04-composantsPartages]] pour le détail)
- Intégration de `<mc-entete>` dans `app.ts`
- Couvre : navigation, SAUVEGARDER (+ tooltip), ANNULER/REFAIRE, recherche globale, bascule de thème

---

## Décisions techniques structurantes

| Sujet | Décision |
|---|---|
| Modules Angular | Aucun — `standalone: true` est le défaut (ne pas l'écrire) |
| Lazy loading | `loadComponent` sur toutes les routes d'écrans |
| State management | Signal unique dans `DonneesService` (pas de NgRx ni autre store) |
| Formulaires | `ControlValueAccessor` dans les composants `mc-*` |
| Détection de changement | `ChangeDetectionStrategy.OnPush` sur tous les composants |
| Injection | `inject()` dans le corps de la classe (pas de constructeur à injection) |
| Inputs/Outputs | `input()` / `output()` (pas de `@Input` / `@Output`) |
| Tests | Vitest — instanciation directe si possible, `TestBed` si `inject()` requis |
| Polices | Locales dans `public/fonts/`, jamais de CDN |
| Couleurs | Variables CSS uniquement, jamais de couleur hardcodée |
