---
name: architecture-applicative
description: Architecture applicative de MaClasse — structure des dossiers, conventions de nommage, fichiers racine, décisions techniques
metadata:
  type: project
  updated: 2026-09-27
related:
  - specification/description-generale
  - specification/services
  - specification/elements-techniques
---

## Principe général

Application Angular **standalone**, sans `NgModule`. Les versions d'Angular, de TypeScript et des dépendances sont celles de `package.json`. Chaque composant et chaque directive est standalone par défaut, et `standalone: true` n'est jamais écrit. Les services sont `providedIn: 'root'`.

---

## Structure des dossiers

L'arborescence ci-dessous ne liste pas les fichiers de test (`*.spec.ts`). Chaque composant a ses trois fichiers `.ts`, `.html` et `.scss`, détaillés une seule fois pour `mc-entete`.

```
maclasse/
├── public/
│   ├── fonts/                        # Polices locales Roboto (@font-face dans styles.scss)
│   ├── donnees-defaut.json           # Données d'exemple (création d'une classe, consultation du référentiel)
│   ├── favicon.ico
│   └── maclasse-logo-*.png
│
├── e2e/                              # Tests Playwright (sélecteurs, fixtures, jeu de données figé)
│
└── src/
    ├── index.html
    ├── main.ts
    ├── styles.scss                   # Variables CSS des 5 thèmes, @font-face, classes mc-* globales, @media print
    │
    └── app/
        ├── app.ts                    # Composant racine (layout : entête + <router-outlet>)
        ├── app.html
        ├── app.scss
        ├── app.config.ts             # ApplicationConfig (routeur, providers)
        ├── app.routes.ts             # Routes lazy (loadComponent) + gardes
        ├── composant-base.ts         # ComposantBase — expose LIBELLES dans les templates
        ├── champ-base.ts             # ChampBase — ControlValueAccessor commun des champs mc-*
        ├── popin-base.ts             # PopinBase — synchronise <dialog> et l'input visible
        ├── ecran-edition-gardee-base.ts # EcranEditionGardeeBase — mode édition + garde de navigation
        ├── libelles.ts               # Constantes de libellés UI centralisées
        │
        ├── modeles/                  # Interfaces et types TypeScript (pas de logique)
        │   ├── donnees-application.modele.ts   # Structure racine du JSON, ConfigApplication, Enseignant, Classe
        │   ├── referentiels.modele.ts          # Competence, Periode, Groupe, StatutAcquisition, StatutEleve, TypeContact, JourFerie…
        │   ├── eleve.modele.ts
        │   ├── projet.modele.ts
        │   ├── emploi-du-temps.modele.ts       # EDT, créneaux, temps, types communs (JourSemaine, ElevesConcernes…)
        │   ├── emploi-du-temps-calcule.modele.ts # Définition d'EDT calculé, CreneauCalcule (non persisté)
        │   ├── cahier-journal.modele.ts
        │   ├── ppi-bulletin.modele.ts          # Ppi, Bulletin (phase 2)
        │   ├── migration.modele.ts             # Étape de migration, ancien format de créneau
        │   ├── recherche.modele.ts             # ResultatRecherche
        │   ├── composants.modele.ts            # DTO d'affichage des composants (options, cases de calendrier, nœuds d'arbre…)
        │   └── commande.modele.ts              # Interface Commande (executer/annuler/libelle)
        │
        ├── services/
        │   ├── avecEtat/             # Services portant un état (signal)
        │   │   ├── donnees.service.ts
        │   │   └── contexte.service.ts
        │   └── sansEtat/             # Services sans état propre (algorithmes, I/O)
        │       ├── chiffrement.service.ts
        │       ├── migration.service.ts
        │       ├── sauvegarde-auto.service.ts
        │       ├── recherche-globale.service.ts
        │       ├── eleve.service.ts
        │       ├── projet.service.ts
        │       ├── competence.service.ts
        │       ├── emploi-du-temps.service.ts
        │       ├── emploi-du-temps-calcule.service.ts
        │       ├── cahier-journal.service.ts
        │       └── referentiel.service.ts
        │
        ├── commandes/                # Implémentations génériques du pattern Commande
        │   ├── commande-creation.ts
        │   ├── commande-modification.ts
        │   ├── commande-suppression.ts
        │   └── commande-remplacement.ts
        │
        ├── gardes/
        │   ├── donnees-chargees.garde.ts              # Redirige vers /demarrage si pas de données
        │   ├── referentiel-seul.garde.ts              # Bloque les écrans hors Compétences en mode consultation du référentiel
        │   └── modifications-non-enregistrees.garde.ts # canDeactivate : confirmation si un formulaire est modifié
        │
        ├── utilitaires/
        │   ├── date.utils.ts         # DateUtils (J±n, parité, formatage, chevauchements)
        │   ├── eleve.utils.ts        # EleveUtils (résolution d'un périmètre ElevesConcernes)
        │   ├── texte.utils.ts        # TexteUtils (normalisation casse/accents)
        │   ├── objet.utils.ts        # ObjetUtils (égalité profonde)
        │   └── formulaire.utils.ts   # FormulaireUtils (validateurs partagés des formulaires réactifs)
        │
        ├── directives/
        │   └── mc-auto-focus.directive.ts
        │
        ├── composants/               # Composants mc-* partagés (≥ 2 écrans ou usage global)
        │   ├── mc-entete/            # En-tête de l'application (instancié dans app.html)
        │   │   ├── mc-entete.component.ts
        │   │   ├── mc-entete.component.html
        │   │   └── mc-entete.component.scss
        │   ├── mc-input/
        │   ├── mc-textarea/
        │   ├── mc-select/
        │   ├── mc-radio-group/
        │   ├── mc-champ-heure/
        │   ├── mc-chip-filtre/
        │   ├── mc-badge-statut/
        │   ├── mc-champ-recherche/
        │   ├── mc-bouton-destruction/
        │   ├── mc-mini-calendrier/
        │   ├── mc-selecteur-competences/
        │   ├── mc-arbre-competences/
        │   ├── mc-eleves-concernes/
        │   ├── mc-pastilles-eleves-concernes/
        │   └── popins/
        │       ├── popin-demarrage/
        │       ├── popin-sauvegarde/
        │       ├── popin-warnings-absences/
        │       ├── popin-avertissement/
        │       └── popin-export-competences/
        │
        ├── ecrans/
        │   ├── _mixins.scss          # Mixins SCSS partagés par les écrans
        │   ├── demarrage/
        │   ├── accueil/
        │   ├── eleves/
        │   │   ├── fe-fiche-eleve/
        │   │   └── fe-formulaire-eleve/
        │   ├── projets/
        │   │   ├── fp-fiche-projet/
        │   │   └── fp-formulaire-projet/
        │   ├── competences/
        │   ├── emploi-du-temps/
        │   │   ├── edt-formulaire/   # Propriétés d'un EDT et formulaire de créneau
        │   │   └── edtc-formulaire/  # Définition d'un EDT calculé
        │   ├── cahier-journal/
        │   │   └── cj-formulaire-seance/
        │   └── parametrage/
        │
        └── tests/                    # Object Mothers des tests unitaires (*.mother.ts)
```

---

## Conventions de nommage des fichiers

| Type | Fichier | Classe |
|---|---|---|
| Composant racine | `app.ts` | `App` |
| Composant d'écran | `ecran-eleves.component.ts` | `EcranElevesComponent` |
| Sous-composant d'écran | `fe-fiche-eleve.component.ts` | `FeFicheEleveComponent` |
| Composant partagé | `mc-input.component.ts` | `McInputComponent` |
| Popin | `popin-avertissement.component.ts` | `PopinAvertissementComponent` |
| Service (avec état) | `donnees.service.ts` | `DonneesService` |
| Service (sans état) | `eleve.service.ts` | `EleveService` |
| Garde (fonction) | `donnees-chargees.garde.ts` | `donneesChargeesGarde` |
| Directive | `mc-auto-focus.directive.ts` | `McAutoFocusDirective` |
| Interface modèle | `eleve.modele.ts` | `Eleve`, `Contact`, `AbsenceRecurrente`… |
| Commande | `commande-creation.ts` | `CommandeCreation` |
| Classe utilitaire | `date.utils.ts` | `DateUtils` |
| Object Mother (tests) | `eleve.mother.ts` | `EleveMother` |

Les règles détaillées de nommage (français, suffixes `.garde.ts` et `.tuyau.ts`, préfixes des sous-composants) sont dans `.claude/rules/conventions-nommage.md`.

---

## Fichiers racine de `app/`

| Fichier | Rôle |
|---|---|
| `app.ts` | Composant racine : entête + `<router-outlet>` |
| `app.config.ts` | `ApplicationConfig` : `provideRouter(routes, withComponentInputBinding(), withHashLocation())`, écouteur global d'erreurs |
| `app.routes.ts` | Toutes les routes avec `loadComponent` (lazy) et leurs gardes (voir [elements-techniques](elements-techniques.md#routing-angular)) |
| `composant-base.ts` | Classe de base des composants partagés : expose `LIBELLES` |
| `champ-base.ts` | Classe de base des champs de formulaire `mc-*` (voir [composants-partages](composants-partages.md#classe-de-base-champbase)) |
| `popin-base.ts` | Classe de base des popins (voir [composants-partages](composants-partages.md#popins)) |
| `ecran-edition-gardee-base.ts` | Classe de base des écrans liste + fiche (voir [elements-techniques](elements-techniques.md#ecraneditiongardeebase)) |
| `libelles.ts` | Constantes de libellés centralisées (voir [libelles](libelles.md)) |

---

## Styles globaux (`styles.scss`)

Le fichier `styles.scss` contient :

1. **`@font-face`** : déclarations des polices locales depuis `public/fonts/`
2. **Variables CSS** : sur `:root` pour le thème par défaut, surchargées sur `:root[data-theme="…"]` pour les 4 autres thèmes (voir [themes](themes.md))
3. **Classes `mc-*` globales** : boutons, champs, listes, fiches, popins, chips, pastilles, accessibilité (`sr-only`…)
4. **`@media print`** : seule source de vérité de l'impression (voir [elements-techniques](elements-techniques.md#impression-media-print))

---

## Décisions techniques structurantes

| Sujet | Décision |
|---|---|
| Modules Angular | Aucun : `standalone` est le défaut (ne pas l'écrire) |
| Lazy loading | `loadComponent` sur toutes les routes d'écrans |
| URL | Routage par fragment (`withHashLocation`) : l'application fonctionne sur un hébergement statique sans réécriture d'URL |
| State management | Signal unique dans `DonneesService` (pas de NgRx ni autre store) |
| Formulaires | Reactive Forms ; `ControlValueAccessor` dans les composants `mc-*` |
| Détection de changement | `ChangeDetectionStrategy.OnPush` sur tous les composants |
| Injection | `inject()` dans le corps de la classe (pas de constructeur à injection) |
| Inputs/Outputs | `input()` / `output()` (pas de `@Input` / `@Output`) |
| Tests | Vitest ; instanciation directe si possible, `TestBed` si `inject()` requis ; Object Mothers dans `tests/` ; E2E Playwright |
| Polices | Locales dans `public/fonts/`, jamais de CDN |
| Couleurs | Variables CSS uniquement, jamais de couleur hardcodée |
