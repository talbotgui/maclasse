---
name: plans-01-generationInitiale
description: Plan détaillé de génération initiale du code — 9 étapes séquentielles, de la configuration jusqu'aux écrans
metadata:
  type: project
  updated: 2026-06-16
related:
  - projet-15-architectureApplicative
  - projet-02-modelesDonnees
  - projet-04-composantsPartages
  - projet-05-services
  - projet-06-elementsTechniques
  - feedback-01-angular
  - feedback-02-conventions
  - feedback-03-doc
  - feedback-05-scss
  - feedback-10-composant-base
---

# Plan de génération initiale du code

Chaque étape doit être validée avant de passer à la suivante.
Les fichiers présents mais vides (app.ts, app.routes.ts, styles.scss…) sont à **réécrire entièrement**.

---

## État des lieux au démarrage

| Fichier | État |
|---|---|
| `src/index.html` | Présent — `lang="en"` à corriger en `"fr"`, titre à corriger |
| `src/app/app.ts` | Présent — minimal, à réécrire |
| `src/app/app.config.ts` | Présent — minimal, à enrichir |
| `src/app/app.routes.ts` | Présent — vide, à réécrire |
| `src/app/app.html` | Présent — vide |
| `src/app/app.scss` | Présent — vide |
| `src/styles.scss` | Présent — vide |
| `public/donnees-defaut.json` | Présent — à ne pas modifier |
| `public/fonts/` | **Absent** — à créer avec les polices locales |
| Modèles, services, composants | **Absents** — à créer |

---

## Étape 0 — Pré-requis avant toute génération

Vérifications et décisions à prendre **avant d'écrire la moindre ligne de code applicatif**.

### 0.1 Correction de `src/index.html`
- `lang="en"` → `lang="fr"`
- `<title>Classe</title>` → `<title>MaClasse</title>`

### 0.2 Dépendances npm à installer
- **`fflate`** : bibliothèque ZIP légère, compatible navigateur, pour `ChiffrementService`
- `@angular/forms` est déjà présent — OK
- Web Crypto API (`crypto.subtle`) est native — aucune dépendance supplémentaire

### 0.3 Configuration Vitest
- Le `package.json` déclare `vitest` en devDependency mais aucun fichier de config n'existe
- Configuration Vitest dans **`angular.json`** (section `test` du projet)
- Mettre à jour le script `"test"` dans `package.json` : `"ng test"`
- Activer la **couverture de code** : seuil minimum **80%** sur lignes, branches, fonctions et statements
  - Configuré dans `angular.json` via `codeCoverage: true` et `codeCoverageExclude` (exclure les fichiers de modèles, guards, app.ts)

### 0.4 Polices locales
- Police retenue : **Roboto** (Regular 400 + Medium 500 + Bold 700)
- Dossier `public/fonts/` à créer
- Fichiers `.woff2` à télécharger depuis Google Fonts (hors ligne, puis copiés localement)
- Déclaration dans `styles.scss` via `@font-face`

---

## Étape 1 — Squelette Angular et configuration

### Fichiers à produire

| Fichier | Action |
|---|---|
| `src/index.html` | Corriger `lang` et `title` |
| `src/app/libelles.ts` | Créer — constante `LIBELLES as const` complète |
| `src/app/composant-base.ts` | Créer — classe abstraite `ComposantBase` |
| `src/app/app.ts` | Réécrire — `OnPush`, sans `mc-entete` (ajouté étape 9) |
| `src/app/app.html` | Réécrire — layout : `<router-outlet>` uniquement pour l'instant |
| `src/app/app.scss` | Réécrire — styles globaux du composant racine |
| `src/app/app.config.ts` | Réécrire — providers complets |
| `src/app/app.routes.ts` | Réécrire — redirect `/` → `/demarrage` + composant inline temporaire |
| `src/styles.scss` | Réécrire — variables CSS, thèmes, utilitaires, print |

### Détail de chaque fichier

#### `src/app/libelles.ts`
- Constante `LIBELLES` exportée `as const`
- Structure complète telle que définie dans `projet-17-libelles.md` (toutes les sections)
- JSDoc sur la constante et sur chaque sous-objet de section
- Doit inclure **toutes** les clés dès l'étape 1 — les écrans ne doivent pas ajouter de clés non déclarées ici

#### `src/app/composant-base.ts`
- Classe abstraite `ComposantBase`
- `protected readonly LIBELLES = LIBELLES` — import depuis `'./libelles'`
- JSDoc sur la classe et le membre

#### `src/app/app.ts`
- `changeDetection: ChangeDetectionStrategy.OnPush`
- Injecte `ContexteService` (future étape 3) — mais à l'étape 1 : préparer le signal d'effet thème en placeholder commenté
- Pas de `standalone: true` explicite
- Imports : `RouterOutlet`

#### `src/app/app.config.ts`
- `provideBrowserGlobalErrorListeners()`
- `provideRouter(routes, withComponentInputBinding())`
- `provideAnimationsAsync()`

#### `src/app/app.routes.ts`
Les routes sont **ajoutées au fil des étapes** (étape 8 pour chaque écran). À l'étape 1, seule la route `/demarrage` est déclarée (le composant squelette est créé à l'étape 8.1 mais la route est câblée dès l'étape 1 avec un composant temporaire minimal).

```
Étape 1 :
  /  → redirige vers /demarrage
  /demarrage → composant temporaire (remplacé à l'étape 8.1)

Étape 8.1 : /demarrage → EcranDemarrageComponent (lazy, sans garde)
Étape 8.2 : /accueil → EcranAccueilComponent (lazy, DonneesChargeesGarde)
Étape 8.3 : /parametrage → EcranParametrageComponent (lazy, DonneesChargeesGarde)
Étape 8.4 : /eleves → EcranElevesComponent (lazy, DonneesChargeesGarde)
Étape 8.5 : /projets → EcranProjetsComponent (lazy, DonneesChargeesGarde)
Étape 8.6 : /competences → EcranCompetencesComponent (lazy, DonneesChargeesGarde)
Étape 8.7 : /emploi-du-temps → EcranEmploiDuTempsComponent (lazy, DonneesChargeesGarde)
Étape 8.8 : /cahier-journal → EcranCahierJournalComponent (lazy, DonneesChargeesGarde)
```

#### `src/styles.scss`
Contenu organisé en blocs séparés :
1. `@font-face` — polices locales depuis `public/fonts/`
2. Reset minimal + base (`box-sizing`, `font-family`, marges)
3. Variables CSS thème Océan (défaut sur `:root`)
4. Variables CSS thèmes alternatifs (`[data-theme="foret"]`, `[data-theme="crepuscule"]`, `[data-theme="terre"]`, `[data-theme="contraste"]`)
5. Classes boutons : `mc-btn-primaire`, `mc-btn-fantome`, `mc-btn-icone`, `mc-btn-sm`, `mc-btn-xs`, `mc-btn-danger`
6. Classes utilitaires : `mc-chip`, `mc-chip-actif`, `mc-chip-disc`, `mc-chip-point`
7. Classes layout : `mc-layout-liste-detail`, `mc-colonne-gauche`, `mc-colonne-droite`
8. Classes formulaire : `mc-fiche-*`, `mc-liste-*`, `mc-section-*`, `mc-popover-*`
9. Classes accessibilité : `sr-only`
10. `mc-disc-pill`, `mc-btn-ajouter`, `mc-btn-supprimer`
11. `@media print` — masque `.mc-colonne-gauche`, boutons non imprimables
12. `@media (max-width: 768px)` — responsive : `.mc-layout-liste-detail` passe en `flex-direction: column` ; `.mc-colonne-gauche` : `flex: 0 0 auto`, `max-height: 40vh`, `overflow-y: auto`, `border-right: none`, `border-bottom: 1px solid var(--bordure)`

**Note :** `vitest.config.ts` n'est pas créé — la configuration Vitest est déjà complète dans `angular.json` (`runner: "vitest"`, seuils 80%, exclusions). Un fichier séparé créerait des conflits.
**Note :** `src/app/gardes/donnees-chargees.garde.ts` est reporté à l'**étape 3** — la garde dépend de `DonneesService` qui n'existe qu'à cette étape.

**Critère de validation étape 1 :** `ng serve` compile sans erreur TypeScript. L'app démarre à blanc (page vide ou router-outlet vide).

---

## Étape 2 — Modèles TypeScript

**Dossier :** `src/app/modeles/`

Règles absolues :
- Aucune logique (pas de méthode) — uniquement `interface`, `type`, `enum` si pertinent
- Chaque interface, type et propriété porte une JSDoc rédigée
- Typage strict — pas de `any`

### Fichiers à créer

#### `donnees-application.modele.ts`
- `DonneesApplication` (racine JSON)
- `ConfigApplication`
- `Enseignant`
- `Classe`

#### `eleve.modele.ts`
- `Eleve`, `Contact`, `CursusAnnee`
- `AbsenceRecurrente`, `AbsencePonctuelle`
- Types : `JourSemaine`, `Manualite = 'D' | 'G' | 'A'`, `Sexe = 'M' | 'F'`

#### `referentiels.modele.ts`
- `Referentiels`
- `Competence` (récursif : `enfants?: Competence[]`)
- `StatutAcquisition`, `Periode`
- `StatutEleve`, `TypeContact`, `Groupe`
- `JourFerie`, `RaisonAbsence`, `FrequenceAbsence`
- `ConfigEmploiDuTemps`

#### `emploi-du-temps.modele.ts`
- `EmploiDuTemps`, `CreneauEdt`
- `ElevesConcernes` (interface nommée, réutilisée dans cahier-journal)
- Types : `TypeCreneau = 'pedagogique' | 'recreation' | 'pauseDejeuner'`
- Type : `FrequenceEdt = 'paire' | 'impaire' | 'lesDeux'`

#### `cahier-journal.modele.ts`
- `JourneeJournal`, `Seance`
- Réutilise `ElevesConcernes` depuis `emploi-du-temps.modele.ts`

#### `projet.modele.ts`
- `Projet`, `ProjetPeriode`

#### `ppi-bulletin.modele.ts`
- `Ppi`, `PpiCompetence`
- `Bulletin`, `BulletinCompetence`

#### `commande.modele.ts`
- `interface Commande` avec :
  - `executer(donnees: DonneesApplication): DonneesApplication`
  - `annuler(donnees: DonneesApplication): DonneesApplication`

**Critère de validation étape 2 :** TypeScript strict compile sans erreur. Les modèles s'importent correctement entre eux.

---

## Étape 3 — Services de contexte, commandes et chiffrement

### 3.1 Commandes (`src/app/commandes/`)

#### `commande-creation.ts` — `CommandeCreation<T>`
- Constructeur : `accesseur (d: DonneesApplication) => T[]` + `element: T`
- `executer()` : clone le JSON, ajoute l'élément au tableau
- `annuler()` : clone le JSON, retire l'élément du tableau (par référence)

#### `commande-modification.ts` — `CommandeModification<T>`
- Constructeur : accesseur vers le tableau + `ancienneValeur: T` + `nouvelleValeur: T`
- `executer()` / `annuler()` : swap des valeurs dans le tableau

#### `commande-suppression.ts` — `CommandeSuppression<T>`
- Constructeur : accesseur + `element: T` + `index: number`
- `executer()` / `annuler()`

#### `commande-deplacement.ts` — `CommandeDeplacement<T>`
- Constructeur : accesseur + `indexSource: number` + `indexCible: number`
- `executer()` : déplace l'élément de `indexSource` à `indexCible`
- `annuler()` : inverse le déplacement

#### `commande-initialisation-journee.ts` — `CommandeInitialisationJournee`
- Commande spécifique (non générique)
- Constructeur : `journee: JourneeJournal`
- `executer()` : ajoute la journée dans `cahierJournal`
- `annuler()` : retire la journée

### 3.2 `DonneesService` (`src/app/services/avecEtat/donnees.service.ts`)

```
donneesModifiables: WritableSignal<DonneesApplication | null>   // signal privé (écriture réservée au service)
pileUndo: WritableSignal<Commande[]>                             // privé
pileRedo: WritableSignal<Commande[]>                             // privé
modifieeDepuisSauvegarde: WritableSignal<boolean>                // privé

// Signaux exposés
donnees: Signal<DonneesApplication | null>       // asReadonly() de donneesModifiables
peutAnnuler: Signal<boolean>                     // computed sur pileUndo().length
peutRefaire: Signal<boolean>                     // computed sur pileRedo().length
aDonneesModifiees: Signal<boolean>               // asReadonly() de modifieeDepuisSauvegarde

// Méthodes publiques
charger(donnees: DonneesApplication): void
executer(commande: Commande): void
annuler(): void
refaire(): void
marquerCommeSauvegarde(): void
```

Test : `donnees.service.spec.ts` — TestBed requis (`inject()` dans le corps)

### 3.3 `ContexteService` (`src/app/services/avecEtat/contexte.service.ts`)

```
themeActif: WritableSignal<string>               // lu depuis localStorage au démarrage
eleveSelectionne: WritableSignal<string | null>
jourCourantCahierJournal: WritableSignal<string | null>
panierCompetences: WritableSignal<string[]>
motDePasse: string | null                        // jamais persisté

basculerTheme(): void    // cycle : defaut → foret → crepuscule → terre → contraste → defaut
appliquerTheme(id: string): void  // modifie document.documentElement.dataset['theme']
```

Test : `contexte.service.spec.ts`

### 3.4 `DonneesChargeesGarde` (`src/app/gardes/donnees-chargees.garde.ts`)

Reportée de l'étape 1 — dépend de `DonneesService`.
- Fonction `CanActivateFn`
- Injecte `DonneesService` via `inject()`
- Retourne `true` si `DonneesService.donnees()` est non null, sinon `RedirectCommand` vers `/demarrage`

Test : aucun test requis — la garde est un composant infra simple, exclue de la couverture.

### 3.5 `ChiffrementService` (`src/app/services/sansEtat/chiffrement.service.ts`)

```
chiffrer(donnees: DonneesApplication, motDePasse: string): Promise<Blob>
dechiffrer(fichier: File, motDePasse: string): Promise<DonneesApplication>
```

Algorithme `chiffrer` :
1. `JSON.stringify(donnees)` → UTF-8 bytes
2. Compression via `fflate.deflateSync()`
3. Dériver la clé AES-GCM depuis `motDePasse` via `crypto.subtle.importKey` + `PBKDF2`
4. Chiffrer (`crypto.subtle.encrypt`, AES-GCM 256 bits)
5. Emballer dans un ZIP mono-fichier `donnees.json.enc`

Algorithme `dechiffrer` : inverse exact.

Test : `chiffrement.service.spec.ts` — instanciation directe possible (pas de `inject()`)

**Critère de validation étape 3 :**
- Le cycle chiffrement/déchiffrement est testé et valide
- `DonneesService` passe les tests UNDO/REDO
- `ng test --code-coverage` : couverture ≥ 80% sur les 3 services de cette étape (lignes, branches, fonctions, statements)
- Les fichiers de modèles (`modeles/`) et la garde (`gardes/`) sont exclus du calcul de couverture

---

## Étape 4 — Services métier

### 4.1 `DateUtils` (`src/app/utilitaires/date.utils.ts`)
Classe avec méthodes `static public` uniquement. JSDoc sur chaque méthode avec `@param` et `@returns`.

| Méthode | Signature | Description |
|---|---|---|
| `ajouterJours` | `(date: string, jours: number): string` | J±N en ISO date |
| `obtenirJourSemaine` | `(date: string): JourSemaine \| 'samedi' \| 'dimanche'` | Jour de la semaine |
| `formaterDateLong` | `(date: string): string` | "lundi 9 juin 2026" |
| `formaterDateCourt` | `(date: string): string` | "09/06/2026" |
| `calculerParite` | `(date: string): 'paire' \| 'impaire'` | Parité ISO week number |
| `chevauchementHoraire` | `(debut1, fin1, debut2, fin2: string): boolean` | Chevauchement HH:MM |
| `formaterHeure` | `(date: Date): string` | Date → "HH:MM" |

Test : `date.utils.spec.ts` — instanciation directe (`new DateUtils()` n'est pas nécessaire, méthodes statiques)

### 4.2 `ReferentielService` (`src/app/services/sansEtat/referentiel.service.ts`)
- Injecte `DonneesService`
- Méthodes `estUtilise*(id: string): boolean` pour chaque type de référentiel
- CRUD via `DonneesService.executer(new CommandeModification(...))`
- Test : `referentiel.service.spec.ts`

### 4.3 `EleveService` (`src/app/services/sansEtat/eleve.service.ts`)
- Injecte `DonneesService`
- `creerEleve(eleve: Eleve): void`
- `modifierEleve(eleve: Eleve): void`
- `supprimerEleve(id: string): void`
- `obtenirEleve(id: string): Eleve | undefined`
- `rechercherEleves(terme: string): Eleve[]` (insensible casse+accents)
- `calculerConflitsAbsences(eleveId: string, heureDebut: string, heureFin: string, jour: JourSemaine): string[]`
- Test : `eleve.service.spec.ts`

### 4.4 `CompetenceService` (`src/app/services/sansEtat/competence.service.ts`)
- Injecte `DonneesService`
- `obtenirDomaines(): Competence[]` — nœuds niveau 1
- `obtenirDomaineParId(id: string): Competence | undefined`
- `rechercherCompetences(terme: string): Competence[]` — liste aplatie de feuilles et nœuds correspondants
- `resoudreLibelle(id: string): string` — libellé complet du nœud
- `obtenirChemin(id: string): Competence[]` — du nœud racine jusqu'à l'ID
- Test : `competence.service.spec.ts`

### 4.5 `ProjetService` (`src/app/services/sansEtat/projet.service.ts`)
- Injecte `DonneesService`
- CRUD projet + gestion des périodes et des compétences associées
- `rechercherProjets(terme: string): Projet[]`
- Test : `projet.service.spec.ts`

### 4.6 `EmploiDuTempsService` (`src/app/services/sansEtat/emploi-du-temps.service.ts`)
- Injecte `DonneesService`
- CRUD EDT + CRUD créneaux
- `validerChevauchement(edt: EmploiDuTemps): boolean` — chevauchement entre EDT
- `calculerConflitsAbsences(creneauId: string): string[]`
- Test : `emploi-du-temps.service.spec.ts`

### 4.7 `CahierJournalService` (`src/app/services/sansEtat/cahier-journal.service.ts`)
- Injecte `DonneesService` + `EmploiDuTempsService` + `DateUtils` (méthodes statiques, pas d'injection nécessaire)
- `initialiserJourneeVide(date: string): void`
- `initialiserDepuisEdt(date: string): void` — algorithme parité ISO semaine
- `ajouterSeance(date: string, seance: Seance): void`
- `modifierSeance(date: string, seance: Seance): void`
- `supprimerSeance(date: string, seanceId: string): void`
- `deplacerSeance(date: string, indexSource: number, indexCible: number): void`
- `supprimerJournee(date: string): void`
- `dupliquerSeance(seanceId: string, dateSource: string, dateCible: string): void`
- `dupliquerJournee(dateSource: string, dateCible: string): void`
- `calculerConflitsAbsences(date: string, seanceId: string): string[]`
- Test : `cahier-journal.service.spec.ts`

### 4.8 `SauvegardeAutoService` (`src/app/services/sansEtat/sauvegarde-auto.service.ts`)
- Injecte `DonneesService`, `ContexteService`, `ChiffrementService`
- `private timer: ReturnType<typeof setInterval> | null`
- Signal `dateDerniereSauvegarde: WritableSignal<Date | null>`
- `demarrer(): void` — démarre le timer après première sauvegarde manuelle
- `sauvegarder(): Promise<void>` — appelée par le timer ET par le bouton SAUVEGARDER de l'entête
- Test : `sauvegarde-auto.service.spec.ts`

### 4.9 `RechercheGlobaleService` (`src/app/services/sansEtat/recherche-globale.service.ts`)
- Injecte `DonneesService`
- `interface ResultatRecherche { type: string; titre: string; id: string; route: string; }`
- `rechercher(terme: string): ResultatRecherche[]`
- Parcourt élèves (NOM Prénom) + projets (nom) — extensible
- Test : `recherche-globale.service.spec.ts`

**Critère de validation étape 4 :**
- Tous les tests de services passent
- TypeScript strict sans erreur
- `ng test --code-coverage` : couverture globale ≥ 80% sur l'ensemble des services (étapes 3 + 4 cumulées)
- Rapport de couverture consulté — toute branche non couverte sous le seuil doit être couverte par un test supplémentaire avant de passer à l'étape suivante

---

## Étape 5 — Directive et tuyau

### 5.1 `McAutoFocusDirective` (`src/app/directives/mc-auto-focus.directive.ts`)
- `input() public readonly mcAutoFocus: InputSignal<boolean>` (default `false`)
- Applique `(element as HTMLElement).focus()` via `effect()` ou `AfterViewInit`
- Utilise `ElementRef<HTMLElement>` injecté

### 5.2 `FormatDateTuyau` (`src/app/tuyaux/format-date.tuyau.ts`)
- `transform(valeur: string, format: 'long' | 'court' = 'long'): string`
- Délègue à `DateUtils.formaterDateLong()` ou `DateUtils.formaterDateCourt()`

---

## Étape 6 — Composants partagés simples

**Contraintes transverses à tous les composants de l'étape 6 :**
- Étend `ComposantBase`
- `changeDetection: ChangeDetectionStrategy.OnPush`
- Pas de `standalone: true` explicite
- CSS : uniquement variables CSS — zéro couleur hardcodée
- JSDoc sur la classe, tous les membres et toutes les méthodes
- ID HTML obligatoire sur tout élément interactif

### Composants de formulaire (CVA)
Chacun implémente `ControlValueAccessor` + fournit `NG_VALUE_ACCESSOR`.
Membres CVA communs : `onChange`, `onTouched` (callbacks `protected`, non préfixés), `writeValue()`, `registerOnChange()`, `registerOnTouched()`, `setDisabledState()` (méthodes `public` — imposé par l'interface Angular).

#### `mc-input`
- `input() public readonly id: InputSignal<string>`
- `input() public readonly label: InputSignal<string>`
- `input() public readonly type: InputSignal<string>` (défaut `'text'`)
- `input() public readonly placeholder: InputSignal<string>` (défaut `''`)
- `input() public readonly required: InputSignal<boolean>` (défaut `false`)
- Template : `<label [for]="id()">` + `<input [id]="id()" [type]="type()" ...>`

#### `mc-textarea`
- Mêmes inputs que `mc-input` sans `type`
- `input() public readonly lignes: InputSignal<number>` (défaut `3`)
- `<textarea [id]="id()" [rows]="lignes()">`

#### `mc-champ-heure`
- `<input type="time" [id]="id()">`
- Validation : valeur au format `HH:MM`

#### `mc-checkbox`
- `<input type="checkbox" [id]="id()">`
- Label cliquable associé via `[for]`

#### `mc-select`
- `input() public readonly options: InputSignal<{ valeur: string; libelle: string }[]>`
- `input() public readonly avecOptionVide: InputSignal<boolean>` (défaut `false`) — ajoute `<option value="">—</option>` en tête pour les champs non obligatoires
- `<select [id]="id()">` : `@if (avecOptionVide())` + `<option value="">—</option>` puis `@for (opt of options())`

#### `mc-radio-group`
- `input() public readonly options: InputSignal<{ valeur: string; libelle: string }[]>`
- IDs dynamiques : `[id]="id() + '_' + opt.valeur"`
- `<input type="radio">` groupé par `[name]="id()"`

### Composants d'affichage (non CVA)

#### `mc-chip-filtre`
- `input() public readonly id: InputSignal<string>`
- `input() public readonly libelle: InputSignal<string>`
- `input() public readonly actif: InputSignal<boolean>` (défaut `false`)
- `output() protected readonly selectionChange: OutputEmitterRef<boolean>`
- `<button [id]="id()" [class.mc-chip-actif]="actif()">`

#### `mc-badge-statut`
- `input() public readonly statut: InputSignal<StatutAcquisition | null>` (défaut `null`)
- Affichage conditionnel : `@if (statut())` → glyphe + `[style.color]="statut()!.couleur"` + `[style.background]="statut()!.fond"` ; sinon `—`

#### `mc-champ-recherche`
- `input() public readonly id: InputSignal<string>`
- `input() public readonly placeholder: InputSignal<string>`
- `input() public readonly delaiMs: InputSignal<number>` (défaut `0`) — debounce avant émission ; `0` = émission immédiate
- `output() protected readonly rechercheChange: OutputEmitterRef<string>`
- `<input type="search" [id]="id()">` + bouton reset
- Signal local `protected readonly valeurCourante = signal('')` ; `effect()` avec `setTimeout(delaiMs())` pour le debounce — annuler le timer précédent à chaque nouvelle valeur

#### `mc-bouton-destruction`
- Signal local `protected readonly etatConfirmation = signal(false)`
- `input() public readonly id: InputSignal<string>`
- `input() public readonly desactive: InputSignal<boolean>` (défaut `false`)
- `input() public readonly tooltipDesactive: InputSignal<string>` (défaut `''`)
- `output() protected readonly confirme: OutputEmitterRef<void>`
- État NORMAL : bouton SUPPRIMER visible
- État CONFIRMATION : SUPPRIMER masqué, ANNULER + CONFIRMER visibles
- Si `tooltipDesactive()` non vide : `[attr.aria-describedby]="id() + '_desc'"` sur le bouton + `<span [id]="id() + '_desc'" class="sr-only">{{ tooltipDesactive() }}</span>` (le `title` natif n'est pas fiable sur les boutons désactivés)

**Critère de validation étape 6 :** Chaque composant s'affiche correctement, le CVA fonctionne dans un `ReactiveForm` minimal.

---

## Étape 7 — Composants partagés riches et popins

### 7.1 `mc-mini-calendrier`
- `input() public readonly journeesAvecEntrees: InputSignal<string[]>` — ISO dates ayant une entrée CJ
- `input() public readonly joursFeries: InputSignal<JourFerie[]>`
- `input() public readonly joursOuvres: InputSignal<JourSemaine[]>`
- `input() public readonly jourSelectionne: InputSignal<string | null>`
- `output() protected readonly jourChange: OutputEmitterRef<string>`
- Signal local `protected readonly moisAffiche = signal<Date>(new Date())`
- `computed()` pour la grille de jours du mois
- Griser : weekends, fériés, non ouvrés
- Mettre en évidence : `journeesAvecEntrees`

### 7.2 `mc-selecteur-competences`
- Sélecteur de compétences **autocomplete** : 3 zones — chips de filtre par domaine (zone 1), champ de saisie avec liste `role="combobox"` affichant les suggestions en libellé complet (zone 2), chips des compétences sélectionnées avec bouton ✕ (zone 3)
- `input() public readonly competencesSelectionnees: InputSignal<string[]>`
- `input() public readonly multiSelection: InputSignal<boolean>` (défaut `true`)
- `output() protected readonly selectionChange: OutputEmitterRef<string[]>`
- Injecte `CompetenceService`
- Signals : `saisie`, `estOuvert`, `indexFocalise`, `domainesFiltres`
- Utilisé dans : Projets (périodes), Cahier journal (séances)

### 7.2b `mc-arbre-competences`
- Arbre de compétences filtrable (recherche textuelle + chips domaine + arbre repliable)
- `input() public readonly competencesSelectionnees: InputSignal<string[]>`
- `input() public readonly multiSelection: InputSignal<boolean>` (défaut `true`)
- `output() protected readonly selectionChange: OutputEmitterRef<string[]>`
- Injecte `CompetenceService`
- Signal local pour la recherche, les domaines actifs, l'état déplié de chaque nœud
- Navigation clavier WAI-ARIA Tree View (ArrowDown/Up/Left/Right/Home/End)
- Utilisé dans : **écran Compétences uniquement**

### 7.3 `mc-eleves-concernes`
- Implements `ControlValueAccessor`
- `input() public readonly id: InputSignal<string>` — pour les IDs des sous-éléments
- 3 modes radio (classe / groupes / élèves spécifiques)
- Injecte `DonneesService` pour obtenir la liste des groupes et des élèves
- Chips de groupes ou chips d'élèves selon le mode

### Popins

**Principe commun :**
- `<dialog>` natif ou `<div role="dialog">` avec trap de focus
- `[mcAutoFocus]` sur le premier élément focusable
- Gestion Échap si non obligatoire
- Accessibilité RGAA : `aria-modal="true"`, `aria-labelledby`, `aria-describedby`

#### `popin-demarrage`
- Non fermable (pas de bouton Fermer, pas de fermeture Échap)
- Affichée automatiquement si `DonneesService.donnees() === null`
- Zone "Première utilisation" : bouton `btnCreer`
- Zone "Charger" : `<input type="file" id="fichierZip" accept=".zip">` + `mc-input` mot de passe + bouton `btnCharger`
- Spinner pendant chargement — désactive tous les boutons
- `output() protected readonly demarrageTermine: OutputEmitterRef<void>`

#### `popin-sauvegarde`
- Saisie du mot de passe de chiffrement
- `input() public readonly visible: InputSignal<boolean>`
- `output() protected readonly confirme: OutputEmitterRef<string>` (mot de passe)
- `output() protected readonly annule: OutputEmitterRef<void>`

#### `popin-warnings-absences`
- Liste de conflits (affichage read-only)
- `input() public readonly conflits: InputSignal<string[]>`
- `input() public readonly visible: InputSignal<boolean>`
- Bouton `btnFermer` uniquement

#### `popin-avertissement`
- Message d'avertissement avant perte de données
- `input() public readonly message: InputSignal<string>`
- `input() public readonly visible: InputSignal<boolean>`
- `output() protected readonly confirme: OutputEmitterRef<void>`
- `output() protected readonly annule: OutputEmitterRef<void>`
- `[mcAutoFocus]` sur le bouton ANNULER (action la moins destructive)

#### `popin-export-competences`
- 2 `mc-select` en cascade
- Mode projet : `mc-select` projet → `mc-select` période
- Mode séance : `mc-select` jour → `mc-select` séance
- `input() public readonly competencesIds: InputSignal<string[]>`
- `output() protected readonly confirme: OutputEmitterRef<{ cibleType: 'projet' | 'seance'; cibleId: string; secondaireId: string }>`

---

## Étape 8 — Écrans

**Contraintes transverses à tous les écrans :**
- `changeDetection: ChangeDetectionStrategy.OnPush`
- `protected readonly LIBELLES = LIBELLES` (import direct — les écrans n'héritent pas de `ComposantBase`)
- Pas de logique métier dans le template — déléguer aux services
- IDs HTML sur tous les éléments interactifs
- Sous-composants propres à l'écran préfixés selon la règle de `feedback-02` (ex. `fe-` pour fiche-élève)

### 8.1 `ecran-demarrage`
- Affiche `<popin-demarrage>` plein écran (fond sans contenu derrière)
- À la confirmation : `DonneesService.charger()` → `Router.navigate(['/accueil'])`
- Pas de `DonneesChargeesGarde`

### 8.2 `ecran-accueil`
- Lecture seule
- `DateUtils.formaterDateLong(today)`
- Séances du jour depuis `DonneesService.donnees().cahierJournal` filtrées par date du jour
- Masque les récréations et pauses déjeuner dans le résumé
- Affiche heure début/fin, disciplines (via `CompetenceService.obtenirDomaineParId`), nombre d'élèves

### 8.3 `ecran-parametrage`
- 11 sections accordion côte-à-côte (sélecteur gauche + formulaire droite)
- Sections : Enseignant, Classe, Groupes, Périodes, Raisons d'absence, Statuts élève, Types de contact, Statuts d'acquisition, Configuration EDT, Jours fériés, Préférences
- Pour chaque section liste : AJOUTER + liste + MODIFIER inline + `mc-bouton-destruction`
- `mc-bouton-destruction` désactivé si `ReferentielService.estUtilise*(id)`
- **Responsive `≤ 768px`** : `.parametrage` → `grid-template-columns: 1fr` ; `.parametrage__nav` : `border-right: none`, `border-bottom: 1px solid var(--bordure)`

### 8.4 `ecran-eleves`
- Colonne gauche : bouton `btnCreerEleve` + `mc-champ-recherche` + liste élèves (NOM Prénom, triée)
- Zone droite : fiche élève en mode lecture (`fe-fiche-eleve`) ou édition (`fe-formulaire-eleve`)
- Sous-composants locaux dans `ecrans/eleves/` avec préfixe `fe-`
- `popin-avertissement` si navigation avec modifications non enregistrées
- Bouton IMPRIMER : `window.print()`

### 8.5 `ecran-projets`
- Pattern identique à élèves (colonne gauche + détail droite)
- Chips de filtrage par domaine de compétences
- `mc-selecteur-competences` (autocomplete) dans les périodes pour sélectionner des compétences
- Sous-composants avec préfixe `fp-`

### 8.6 `ecran-competences`
- Layout 2 zones : `mc-arbre-competences` (filtres intégrés + arbre) à gauche | panier à droite
- Zone gauche : composant `mc-arbre-competences` — filtres (champ recherche + chips domaines) + arbre repliable intégrés dans le composant
- Zone droite : liste du panier (depuis `ContexteService.panierCompetences`) + VIDER + boutons export vers projet/séance
- Panier auto-effacé si une compétence du panier est désélectionnée dans l'arbre
- **Responsive `≤ 768px`** : `.competences` → `grid-template-columns: 1fr` ; empilement arbre puis panier (ordre DOM naturel)

### 8.7 `ecran-emploi-du-temps`
- 3 colonnes : liste EDT gauche | grille hebdo centre | formulaire droit
- Grille hebdo : colonnes = jours ouvrés (lundi–vendredi par défaut), lignes = créneaux horaires
- Formulaire droit : propriétés de l'EDT ou formulaire de créneau selon sélection
- Warning chevauchement : icône sur l'EDT dans la liste, `popin-warnings-absences`
- **Responsive `≤ 768px`** : `.edt` → `grid-template-columns: 1fr` ; `.edt__gauche` : `max-height: 40vh`, `overflow-y: auto`, `border-right: none`, `border-bottom: 1px solid var(--bordure)` ; `.edt__grille-conteneur` : `border-right: none`

### 8.8 `ecran-cahier-journal`
- Colonne gauche : `mc-mini-calendrier` + boutons J−7/J−1/J+1/J+7
- Zone droite : liste séances + formulaire séance inline
- Boutons : Initialiser vide, Initialiser depuis EDT, Supprimer la journée, Dupliquer séance/journée
- Warning absences à l'ENREGISTRER d'une séance (non bloquant)
- Flèches réorganisation séances (haut / bas)
- **Responsive `≤ 768px`** : `.cj` → `grid-template-columns: 1fr` ; `.cj__gauche` : `max-height: 40vh`, `overflow-y: auto`, `border-right: none`, `border-bottom: 1px solid var(--bordure)`

**Critère de validation étape 8 :** Tous les écrans sont navigables. Les opérations CRUD fonctionnent. UNDO/REDO fonctionne sur au moins 2 écrans.

---

## Étape 9 — Composant d'en-tête

### `src/app/composants/mc-entete/`

Pas d'`input()` ni d'`output()` — injecte les services directement.

**Services injectés :**
- `DonneesService` → signals `peutAnnuler`, `peutRefaire`, `aDonneesModifiees`, `donnees`
- `ContexteService` → `themeActif`, `motDePasse`
- `SauvegardeAutoService` → `dateDerniereSauvegarde`, `sauvegarder()`
- `ChiffrementService` → utilisé par `sauvegarder()`
- `RechercheGlobaleService` → `rechercher()`
- `Router` → navigation au clic sur un résultat

**Zones internes :**

| Zone | Contenu | Condition |
|---|---|---|
| Logo | Image + "MaClasse" | Toujours |
| Navigation | `routerLink` + `routerLinkActive` par écran | `donnees() !== null` |
| Recherche | `mc-champ-recherche` + liste autocomplétion | `donnees() !== null` |
| Actions | `btnSauvegarder` (tooltip horodatage) + `btnAnnuler` + `btnRefaire` | `donnees() !== null` |
| Thème | Bouton cycle thème | Toujours |

**Logique SAUVEGARDER :**
- Premier clic + `motDePasse === null` → ouvre `popin-sauvegarde`
- Premier clic + `motDePasse` déjà présent (ou clics suivants) → `SauvegardeAutoService.sauvegarder()`
- Tooltip : `LIBELLES.entete.tooltipDerniereSauvegarde + dateDerniereSauvegarde` ou `LIBELLES.entete.tooltipAucuneSauvegarde`

**Intégration dans `app.ts` :** ajouter `<mc-entete>` dans le template au-dessus de `<router-outlet>`.

---

## Décisions arrêtées

Toutes les décisions préalables ont été validées.

| # | Question | Décision |
|---|---|---|
| 1 | Bibliothèque ZIP | **`fflate`** |
| 2 | Police(s) à utiliser | **Roboto** (Regular 400, Medium 500, Bold 700) |
| 3 | `provideAnimationsAsync()` | **Supprimé** — dépréciée dans Angular 21 (animations fournies automatiquement) |
| 4 | Config tests | **Dans `angular.json`** (section `test`) |
| 5 | Ajout des routes | **Au fil des étapes** (route câblée quand l'écran est créé) |
| 6 | Granularité des sessions | **Une étape entière par session** |
| 7 | Couverture de code | **80% minimum** sur services (étapes 3 et 4), vérifiée avant de passer à la suivante |
| 8 | `vitest.config.ts` | **Supprimé** — config déjà complète dans `angular.json` (runner, seuils, exclusions) |
| 9 | `DonneesChargeesGarde` | **Reporté à l'étape 3** — dépend de `DonneesService` inexistant à l'étape 1 |
| 10 | Composant temporaire `/demarrage` | **Inline dans `app.routes.ts`** — supprimé et remplacé par `EcranDemarrageComponent` à l'étape 8.1 |
| 11 | Underscore sur membres privés/protégés | **Interdit** — camelCase simple (`donneesModifiables`, `pileUndo`, `timer`…), cohérent avec `feedback-13` |
| 12 | `mc-select` — option vide | **`avecOptionVide: InputSignal<boolean>` (défaut `false`)** — `<option value="">—</option>` en tête si activé |
| 13 | `mc-champ-recherche` — debounce | **`delaiMs: InputSignal<number>` (défaut `0`)** — le composant gère le debounce via `setTimeout` + signal local |
| 14 | `mc-bouton-destruction` — tooltip accessible | **`<span class="sr-only">` + `aria-describedby`** — `title` natif non fiable sur bouton `disabled` |
| 15 | `mc-badge-statut` — valeur nulle | **`StatutAcquisition \| null` (défaut `null`)** — affichage conditionnel `@if (statut())`, sinon `—` |
| 16 | Responsive — breakpoint | **`768px`** — unique breakpoint ; colonne gauche passe au-dessus de la zone centrale, `max-height: 40vh` |

---

## Règles de génération (rappel synthétique)

Ces règles sont non négociables à chaque fichier généré :
- Pas de `standalone: true` explicite dans les décorateurs
- `changeDetection: ChangeDetectionStrategy.OnPush` sur tout composant
- `inject()` uniquement — jamais de constructeur avec paramètres injectés
- `input()` / `output()` — jamais `@Input` / `@Output`
- Visibilité explicite sur tout membre et méthode (`public`, `protected`, `private`)
- JSDoc rédigée sur toute classe, interface, membre et méthode
- Nommage 100% français (sauf impositions Angular/TS)
- Zéro couleur hardcodée — uniquement variables CSS
- Zéro `any` — `unknown` si type incertain
- IDs HTML obligatoires sur tous les éléments interactifs
- Composants partagés (`composants/`) → étend `ComposantBase`
- Membres `private`/`protected` en camelCase simple — jamais préfixés `_` (sauf paramètre de constructeur non utilisé)
- Tests Vitest pour tous les services — jamais pour les composants
