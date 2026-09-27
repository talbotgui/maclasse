---
name: elements-techniques
description: Éléments purement techniques de MaClasse — gardes, classes de base, directives, utilitaires, pattern commande, versions du JSON, persistance, routing
metadata:
  type: project
  updated: 2026-09-27
related:
  - specification/services
  - specification/architecture-applicative
---

## Gardes de navigation

Les gardes sont des fonctions (`CanActivateFn`, `CanDeactivateFn`) dans `gardes/`.

### `donneesChargeesGarde` (canActivate)

- Bloque l'accès à tout écran applicatif si aucune donnée n'est chargée en mémoire (`DonneesService.donnees()` vaut `null`)
- Redirige alors vers `/demarrage`

### `referentielSeulGarde` (canActivate)

- Bloque l'accès aux écrans autres que Compétences quand `ContexteService.modeConsultationReferentiel()` vaut `true` (voir [démarrage](ecrans/demarrage.md#zone-référentiel-de-compétences))
- Redirige alors vers `/demarrage`
- Posée sur toutes les routes applicatives sauf `/competences`

### `modificationsNonEnregistreesGarde` (canDeactivate)

- Appelle `confirmerNavigation()` du composant d'écran, qui implémente l'interface `AvecNavigationGardee` (déclarée dans le fichier de la garde)
- `confirmerNavigation()` résout `true` s'il n'y a pas de modification en cours ; sinon il ouvre une `popin-avertissement` et résout selon le choix de l'utilisateur (abandonner ou rester)
- Posée sur Élèves, Projets, Emploi du temps et Cahier journal

---

## Classes de base

Les classes de base des composants partagés (`ComposantBase`, `ChampBase`, `PopinBase`) sont décrites dans [composants-partages](composants-partages.md).

### `EcranEditionGardeeBase`

Classe abstraite (`ecran-edition-gardee-base.ts`) des écrans « liste + fiche/formulaire » : **Élèves** et **Projets**. Elle implémente `AvecNavigationGardee`.

| Membre | Rôle |
|---|---|
| `enModeEdition` | Signal : un formulaire de création ou de modification est ouvert |
| `popinAvertissementVisible` | Signal : visibilité de la `popin-avertissement` |
| `executerOuAvertir(action)` | Exécute l'action (sélection d'un autre élément, CRÉER) immédiatement, ou après confirmation de la popin si une édition est en cours |
| `confirmerAvertissement()` / `annulerAvertissement()` | Réponses à la popin : exécute l'action en attente (ou autorise la navigation), ou reste sur le formulaire |
| `activerEdition()` | Passe en mode édition |
| `imprimer()` | `window.print()` |
| `confirmerNavigation()` | Implémentation de la garde canDeactivate |

Les écrans Emploi du temps et Cahier journal implémentent directement `AvecNavigationGardee` : leur notion de « formulaire modifié » est propre à chacun (formulaire d'EDT, d'EDT calculé ou de créneau ; formulaire de séance).

---

## Directives

### `mcAutoFocus`

- Applique le focus sur l'élément hôte quand la valeur liée passe à `true` (ouverture d'une popin, création d'un formulaire)
- Garantit la conformité RGAA (focus géré programmatiquement, pas via `autofocus` HTML natif)
- Usage : `<input [mcAutoFocus]="true" ...>`, `[mcAutoFocus]="visible()"` dans les popins, `[mcAutoFocus]="focusDemande()"` dans les formulaires

---

## Classes utilitaires (méthodes statiques)

### `DateUtils`

- Calcul de J±n à partir d'une date ISO (`ajouterJours`), différence en jours, lundi de la semaine (courante ou suivante)
- Jour de semaine d'une date (pour le filtrage par l'EDT)
- Formatage d'affichage : long (« lundi 9 juin 2026 »), court (« 09/06/2026 »), heure
- Chevauchement de plages horaires et de plages de dates
- Parité d'une semaine (paire/impaire, numéro de semaine ISO)
- Constante `JOURS_PAR_SEMAINE`

### `EleveUtils`

- `resoudreElevesConcernes(elevesConcernes, tousEleves)` : résout un périmètre `ElevesConcernes` en identifiants d'élèves. Mode classe (ou périmètre absent) : tous les élèves ; mode groupes : élèves membres d'au moins un groupe ; mode élèves : la liste choisie
- Utilisé par `EmploiDuTempsService` et `EmploiDuTempsCalculeService`

### `TexteUtils`

- `normaliserPourRecherche(texte)` : minuscules et suppression des accents, pour les filtres insensibles à la casse et aux accents (recherche globale, élèves, projets, compétences)

### `ObjetUtils`

- `sontEgaux(a, b)` : égalité structurelle profonde (primitives, `Date`, tableaux ordonnés, objets JSON sans ordre de clés)
- Utilisé par le Paramétrage pour détecter les lignes et sections modifiées (pastille « Non enregistré »), et par `edt-formulaire` pour sa détection des modifications (`estModifie()`)

### `FormulaireUtils`

Validateurs partagés des formulaires réactifs :
- `validerPlageHoraire(groupe)` : validateur de groupe ; erreur `{ plageHoraireInvalide: true }` si `heureDebut` et `heureFin` sont renseignées et que la fin n'est pas strictement postérieure au début (une heure manquante relève de `Validators.required`)
- `validerTexteNonVide(controle)` : erreur `{ texteVide: true }` si la valeur, espaces retirés, est vide
- Utilisé par `edt-formulaire` (nom de l'EDT, plage de chaque temps) et `cj-formulaire-seance` (plage de la séance)

> `CompetenceService` porte directement le parcours de l'arbre : il n'y a pas de classe `CompetenceUtils`.

---

## Pattern Commande (UNDO/REDO)

`DonneesService` est **agnostique du type de donnée modifiée** : il ne connaît que l'interface `Commande` et appelle `executer()` ou `annuler()` sans se soucier de ce qui change dans le JSON.

Chaque **service métier** (ou l'écran Paramétrage pour les valeurs scalaires) instancie la commande appropriée, avec son libellé, avant de la soumettre à `DonneesService`.

### Interface `Commande`

```typescript
interface Commande {
  readonly libelle: string; // description courte, affichée dans les tooltips ANNULER / REFAIRE
  executer(donnees: DonneesApplication): DonneesApplication;
  annuler(donnees: DonneesApplication): DonneesApplication;
}
```

Chaque implémentation travaille sur un clone (`structuredClone`) et ne mute jamais les données reçues. Les libellés sont dans `LIBELLES.commandes`.

### Implémentations génériques (indépendantes du type d'entité)

| Classe | Fichier | Rôle |
|---|---|---|
| `CommandeCreation` | `commande-creation.ts` | Ajoute un élément (portant un `id`) en fin d'un tableau du JSON ; l'annulation le retire par son `id` |
| `CommandeModification` | `commande-modification.ts` | Remplace un élément d'un tableau, retrouvé par son `id` |
| `CommandeSuppression` | `commande-suppression.ts` | Retire l'élément situé à un index connu d'un tableau ; l'annulation le réinsère à ce même index |
| `CommandeRemplacement` | `commande-remplacement.ts` | Remplace une valeur **scalaire** (hors tableau) : enseignant, niveau de la classe, configuration de l'EDT, délai de sauvegarde, domaines actifs |

> Il n'existe pas de commande spécifique par type d'entité (pas de `CommandeSauvegarderEleve`, `CommandeSauvegarderEdt`, etc.). Les opérations composées (initialisation d'une journée, échange d'heures de deux séances, duplication) s'expriment avec ces quatre commandes.

---

## Gestion des versions du JSON

### Format de version

`"ANNÉE.MOIS_RENTREE.PATCH"` — exemple : `"2026.09.1"` (première version, rentrée septembre 2026, patch 1).

La version est stockée à la racine du JSON : `donnees.version`. La version courante de l'application est la version cible de la dernière étape de migration (`MigrationService.obtenirVersionCourante()`).

### Comportements à l'ouverture

Après le déchiffrement par `ChiffrementService`, `popin-demarrage` contrôle la version via `MigrationService.estVersionSupportee(version)`. `DonneesService.charger()` applique ensuite les migrations avant de mettre les données en mémoire.

| Cas | Comportement |
|---|---|
| Version identique à l'app | Chargement direct |
| Version antérieure | Migrations séquentielles appliquées en mémoire (le fichier ne change qu'à la prochaine sauvegarde) |
| Version future | Erreur bloquante dans la popin : `LIBELLES.demarrage.erreurVersionIncompatible` |
| Version illisible (non numérique) | Considérée comme égale à la version courante : ni refusée, ni migrée |

Les versions sont comparées segment par segment, numériquement (`2026.09.10` est postérieure à `2026.09.3`).

### Migrations

Chaîne ordonnée d'étapes dans `MigrationService` ; chaque étape amène les données à sa version cible et n'est appliquée que si `donnees.version` lui est antérieure.

| Version cible | Transformation |
|---|---|
| `2026.09.2` | Créneaux EDT à plat convertis en un `TempsCreneau` unique (`creneau.temps`) |
| `2026.09.3` | Ajout du tableau `emploisDuTempsCalcules` |
| `2026.09.4` | Source `recreation` des EDT calculés renommée `tempsHorsClasse` (sans doublon) ; champs pédagogiques retirés des temps des créneaux récréation et pause déjeuner |

Les migrations sont appliquées dans l'ordre jusqu'à atteindre la version courante de l'application.

`MigrationService` applique aussi, à **chaque chargement** et quelle que soit la version, une normalisation idempotente : attribution d'un `id` aux périodes de projet (`ProjetPeriode`) et aux entrées de cursus (`CursusAnnee`) qui n'en ont pas (fichiers antérieurs à l'introduction de ces champs).

---

## Persistance locale

| Donnée | Mécanisme | Justification |
|---|---|---|
| Thème actif | `localStorage` (clé `mc_theme`) | Préférence visuelle, indépendante du fichier de données |
| Dernier élève sélectionné | `ContexteService.eleveSelectionne` (mémoire session) | Perdu à la fermeture — non critique |
| Dernier projet sélectionné | `ContexteService.projetSelectionne` (mémoire session) | Perdu à la fermeture — non critique |
| Dernier jour CJ consulté | `ContexteService.jourCourantCahierJournal` (mémoire session) | Perdu à la fermeture — non critique |
| Panier compétences | `ContexteService.panierCompetences` (mémoire session) | Perdu à la fermeture — non critique |
| Mode consultation du référentiel | `ContexteService.modeConsultationReferentiel` (mémoire session) | Actif jusqu'au rechargement de la page ou au chargement d'une vraie classe |
| Mot de passe | `ContexteService.motDePasse` (mémoire session) | **Jamais persisté** (sécurité) — perdu à la fermeture |

> Toutes les données métier sont exclusivement portées par le fichier ZIP chiffré.

---

## Routing Angular

Le routeur utilise le **routage par fragment** (`withHashLocation`) et la liaison des paramètres de route aux inputs (`withComponentInputBinding`).

Tous les composants d'écran sont chargés en **lazy loading** via `loadComponent` (import dynamique). Le bundle initial ne contient que `app.ts`, `app.routes.ts`, les gardes et les services — les écrans sont chargés à la première navigation.

```typescript
// Exemple de route lazy
{
  path: 'eleves',
  loadComponent: () =>
    import('./ecrans/eleves/ecran-eleves.component').then((m) => m.EcranElevesComponent),
  canActivate: [donneesChargeesGarde, referentielSeulGarde],
  canDeactivate: [modificationsNonEnregistreesGarde],
}
```

| Route | Composant | canActivate | canDeactivate |
|---|---|---|---|
| `/` | Redirige vers `/demarrage` | — | — |
| `/demarrage` | `EcranDemarrageComponent` | — (toujours accessible) | — |
| `/accueil` | `EcranAccueilComponent` | `donneesChargeesGarde`, `referentielSeulGarde` | — |
| `/competences` | `EcranCompetencesComponent` | `donneesChargeesGarde` | — |
| `/eleves` | `EcranElevesComponent` | `donneesChargeesGarde`, `referentielSeulGarde` | `modificationsNonEnregistreesGarde` |
| `/projets` | `EcranProjetsComponent` | `donneesChargeesGarde`, `referentielSeulGarde` | `modificationsNonEnregistreesGarde` |
| `/emploi-du-temps` | `EcranEmploiDuTempsComponent` | `donneesChargeesGarde`, `referentielSeulGarde` | `modificationsNonEnregistreesGarde` |
| `/cahier-journal` | `EcranCahierJournalComponent` | `donneesChargeesGarde`, `referentielSeulGarde` | `modificationsNonEnregistreesGarde` |
| `/parametrage` | `EcranParametrageComponent` | `donneesChargeesGarde`, `referentielSeulGarde` | — |

---

## Impression (@media print)

- Les écrans Élèves, Projets, Emploi du temps et Cahier journal ont un bouton **IMPRIMER**
- L'impression passe par le mécanisme natif du navigateur (`window.print()`)
- Une règle CSS `@media print` **masque la colonne gauche** (navigation + filtres) et les champs et boutons de l'entête dans tous ces écrans
- Le bloc `@media print` de `styles.scss` est la seule source de vérité : les SCSS de composant ne gèrent pas l'impression
- Les règles globales qui masquent un élément stylé par un composant portent `!important` : sans cela, le sélecteur du composant (suffixé par Angular d'un attribut `[_ngcontent-xxx]`) est plus spécifique et l'emporte
- L'emploi du temps s'imprime en paysage sur une page unique (page nommée `edt-paysage`, voir [emploi-du-temps](ecrans/emploi-du-temps.md#bouton-imprimer))

---

## Composant de recherche globale

- Présent dans l'entête, visible une fois les données chargées, masqué en mode consultation du référentiel
- Saisie dans `mc-champ-recherche` avec une **recherche différée de 300 ms** (`delaiMs`) ; le filtrage est délégué à `RechercheGlobaleService`
- Chaque résultat affiche un **libellé de type accentué** issu de `LIBELLES` (« Élève », « Projet ») suivi du titre (« MARTIN Paul », « compostage ») ; le `type` technique du résultat (`'eleve'`, `'projet'`) ne s'affiche pas
- Liste de résultats (`<ul>` de `<button>`) navigable au clavier avec un tabindex itinérant : ↓ / ↑ résultat suivant / précédent, Début / Fin premier / dernier résultat
- La liste se ferme quand le focus quitte la zone de recherche
- Au clic sur un résultat : l'élève ou le projet est mémorisé dans `ContexteService` (`eleveSelectionne` / `projetSelectionne`), puis l'application navigue vers la route du résultat, où l'élément est sélectionné

---

## Responsivité (mobile)

Règle générale : les colonnes s'empilent verticalement sur petit écran (gauche en haut, centre au milieu, droite en bas).

| Écran | Ordre d'empilement mobile |
|---|---|
| Démarrage | Zone Nouveau → Zone Charger → Zone Référentiel |
| Élèves / Projets | Filtre+liste → Détail/formulaire |
| Compétences | Arbre (filtres inclus) → Panier |
| Emploi du temps | Listes des EDT → Grille → Formulaire |
| Cahier journal | Navigation calendrier → Liste séances (formulaire inclus) |
