---
name: plans-11-edtTempsMultiples
description: Plan d'évolution — 1 à 4 "temps" indépendants par créneau (groupes en parallèle ou activités décalées), chaque temps portant son propre horaire, refonte du modèle CreneauEdt et migration de données
metadata:
  type: project
  updated: 2026-09-16
related:
  - projet-12-ecran-emploi-du-temps
  - projet-02-modelesDonnees
  - projet-04-composantsPartages
  - plans-10-edtAbsencesRegulieres
  - plans-12-edtEmploisCalcules
---

# Plan d'évolution — Créneaux à plusieurs "temps" indépendants (B4)

## Contexte

Aujourd'hui un `CreneauEdt` porte un seul contenu (un seul `heureDebut`/`heureFin`, et si `type === 'pedagogique'`, un seul `titre`/`disciplinesIds`/`elevesConcernes`). Objectif : permettre de saisir et afficher 1 à 4 "temps" pour représenter des groupes travaillant en parallèle (ou des activités décalées dans le temps) sur un même créneau.

**Décisions obtenues après plusieurs corrections successives lors de la conception** (à ne pas rouvrir sans raison forte) :
- Un temps n'est pas contraint à un horaire partagé avec les autres temps du même créneau : chaque temps porte son propre `heureDebut`/`heureFin`, totalement indépendant.
- Cette structure s'applique **uniformément à tous les types de créneau** (`pedagogique`, `recreation`, `pauseDejeuner`) — pas de cas particulier dans le modèle. Le créneau n'a donc plus d'horaire propre du tout ; seul chaque temps en a un.
- Discipline/titre/élèves concernés restent des champs pertinents seulement pour les temps dont le créneau parent est `pedagogique` (l'UI continue de les masquer pour `recreation`/`pauseDejeuner`, comme c'est déjà le cas aujourd'hui pour les champs à plat).

## Décisions validées

| # | Question | Décision |
|---|---|---|
| 1 | Partage d'horaire entre temps | Chaque temps a son propre `heureDebut`/`heureFin`, indépendant des autres temps du même créneau. |
| 2 | Application par type de créneau | Uniforme sur les 3 types — pas de cas particulier ; le créneau perd son horaire propre pour tous les types. |
| 3 | Nombre de temps | 1 à 4 par créneau. |

## Conception

### Modèle (`src/app/modeles/emploi-du-temps.modele.ts`)

```ts
export interface TempsCreneau {
  id: string;
  heureDebut: string;                 // "HH:MM" — propre à ce temps
  heureFin: string;                   // "HH:MM"
  disciplinesIds?: string[];          // pertinent seulement si le créneau parent est 'pedagogique'
  titre?: string;                     // idem
  elevesConcernes?: ElevesConcernes;  // idem
}

export interface CreneauEdt {
  id: string;
  jour: JourSemaine;
  type: TypeCreneau;
  temps: TempsCreneau[];   // 1 à 4 éléments, quel que soit le type — plus d'horaire au niveau du créneau
}
```

Le créneau devient un conteneur logique (jour + type + regroupement d'édition), sans horaire propre. La borne 1-4 n'est pas représentable en TypeScript ; elle est appliquée côté formulaire (UI) et, en garde-fou, dans le service au moment de la sauvegarde.

### Migration des données existantes — prérequis architectural

**Vérifié dans le code** : aucun mécanisme de migration de version n'existe dans le projet. Le champ `DonneesApplication.version` (`src/app/modeles/donnees-application.modele.ts`) est purement documentaire — `DonneesService.charger()` assigne les données telles quelles, sans étape de transformation. Il n'existe pas de `migration.service.ts` ni d'équivalent.

**Deux options à trancher avec l'utilisateur avant tout code** :
- **(a) Mécanisme de migration versionné** : nouveau `src/app/services/sansEtat/migration.service.ts` avec `migrer(donnees: DonneesApplication): DonneesApplication`, appliquant une chaîne ordonnée d'étapes selon `donnees.version`, invoqué dans `DonneesService.charger()` avant que les données n'entrent dans le store. Plus robuste, réutilisable pour de futures évolutions de modèle, mais chantier transverse plus large que B4 lui-même.
- **(b) Normalisation légère à la lecture** : une fonction qui complète `temps` depuis d'éventuels champs à plat (`heureDebut`/`heureFin`/`disciplinesIds`/`titre`/`elevesConcernes`) si absent, sans jamais persister la transformation ni bumper `version`. Plus léger, mais les deux représentations coexistent indéfiniment dans un JSON déjà sauvegardé une fois avec l'ancien format tant qu'il n'est pas resauvegardé.

Migration concrète (quelle que soit l'option) : pour chaque `CreneauEdt` sans `temps`, construire `temps: [{ id: crypto.randomUUID(), heureDebut: creneau.heureDebut, heureFin: creneau.heureFin, disciplinesIds: creneau.disciplinesIds, titre: creneau.titre, elevesConcernes: creneau.elevesConcernes }]`, puis retirer les champs à plat si l'option (a) est retenue.

### Impact sur le rendu de la grille — risque principal

La grille actuelle (`lignesGrille`/`indexCreneaux` dans `ecran-emploi-du-temps.component.ts`) déduit ses lignes à partir d'un couple `heureDebut`/`heureFin` unique par créneau. Avec des temps indépendants et uniformes, les lignes doivent être déduites de l'ensemble **aplati** de tous les horaires réellement utilisés, c'est-à-dire de chaque `TempsCreneau` individuellement (`recreation`/`pauseDejeuner` inclus). Conséquences :
- Un même `CreneauEdt` peut apparaître sur plusieurs lignes distinctes de la grille (une par horaire de temps différent).
- Plusieurs temps de créneaux différents partageant le même horaire se retrouvent naturellement dans la même cellule (cas "groupes en parallèle").
- `ajouterCreneauPourJour(jour)` (calcul de l'heure de départ par défaut du nouveau créneau, aujourd'hui basé sur le dernier `heureFin` du jour) doit être réécrit pour raisonner sur les temps existants du jour plutôt que sur les créneaux.

**Point ouvert à valider avec l'utilisateur avant codage** : si les temps sont totalement indépendants en horaire, la notion de "créneau" comme regroupement perd sa justification visuelle dans la grille (un créneau n'est plus une ligne, ni même un bloc temporel cohérent). Il reste néanmoins une unité d'édition (le formulaire ajoute/retire des temps à l'intérieur d'un même créneau) et de persistance (toujours remplacé en bloc via `CommandeModification` sur l'EDT entier, cf. pattern existant). Il faut confirmer si le bouton intercalaire "+"/"Ajouter" de la grille doit continuer à créer un **créneau** (avec un premier temps par défaut), ou s'il doit directement créer un **temps** — une maquette ou un échange rapide avec l'utilisateur est recommandé avant d'implémenter cette partie.

### Logique métier (`EmploiDuTempsService`)

- `calculerConflitsAbsences(creneauId)` : itérer sur `creneau.temps`, résoudre les `elevesConcernes` de chaque temps (via l'utilitaire `EleveUtils.resoudreElevesConcernes` s'il a déjà été extrait par `plans-10-edtAbsencesRegulieres.md` ou une évolution ultérieure — sinon dupliquer la logique existante comme aujourd'hui) et comparer `abs.jour`/`chevauchementHoraire` à l'horaire propre de **chaque temps**, pas à un horaire de créneau qui n'existe plus.
- `ajouterCreneau`/`modifierCreneau`/`supprimerCreneau` : signatures inchangées (ils manipulent déjà l'EDT complet) ; ajouter une vérification défensive `temps.length` dans `[1,4]` avant sauvegarde.
- Pas de nouvelle commande créneau/temps-level : garder le pattern existant (reconstruire l'EDT complet, `CommandeModification` globale).

### Formulaire `edt-formulaire`

Fichiers : `src/app/ecrans/emploi-du-temps/edt-formulaire/edt-formulaire.component.ts` / `.html`.

- `formCreneau.temps: TempsCreneau[]` remplace les champs à plat dans le state local (draft cloné via `structuredClone`, pattern déjà en place).
- Pattern répétable 1-4, calqué sur `ajouterPeriode`/`supprimerPeriode` de `fp-formulaire-projet.component.ts` :
  - `protected readonly indexAFocaliserTemps = signal<number | null>(null);`
  - `protected ajouterTemps(): void` — no-op si `formCreneau.temps.length >= 4` (bouton `[disabled]` au-delà), sinon push d'un `TempsCreneau` vide avec un horaire par défaut cohérent (ex. dernier `heureFin` des temps existants du créneau, ou `heureDebut` par défaut si aucun) et focalisation du nouvel index.
  - `protected supprimerTemps(index: number): void` — filtre par index ; bouton de suppression masqué si `temps.length === 1` (contrainte minimum 1, contrairement aux périodes/contacts qui n'ont pas de minimum).
  - Chaque bloc "temps" affiche désormais ses propres champs `mc-champ-heure` (début/fin), en plus de discipline/titre/élèves concernés (affichés seulement si `formCreneau.type === 'pedagogique'`).
  - `basculerDiscipline`/`surElevesConcernesChange` prennent un paramètre `indexTemps` supplémentaire.
  - `[mcAutoFocus]="indexAFocaliserTemps() === i"` sur le premier champ de chaque nouveau bloc temps (RGAA, pattern déjà utilisé pour périodes/contacts).

### Grille centrale

Fichier : `ecran-emploi-du-temps.component.html`. Dans la cellule de créneau, itérer `@for (t of creneau.temps; track t.id)` et afficher chaque temps empilé verticalement (plus lisible qu'un côte-à-côte dans une cellule de tableau HTML de largeur fixe).

### Impact hors périmètre à signaler

`CahierJournalService.initialiserDepuisEdt` copie aujourd'hui les champs à plat du `CreneauEdt` vers une `Seance`. Avec `temps[]`, il faudra générer une `Seance` par temps (avec l'horaire propre de chaque temps) pour ne pas perdre de groupes à l'import EDT → cahier journal. Extension de périmètre non demandée explicitement mais nécessaire pour la cohérence fonctionnelle — à confirmer avec l'utilisateur avant de l'inclure ou de la reporter.

## Tests

- `emploi-du-temps.service.spec.ts` : `calculerConflitsAbsences` avec un créneau à plusieurs temps ayant des horaires et des `elevesConcernes` différents ; garde-fou 1-4 sur `modifierCreneau`.
- Nouveau `migration.service.spec.ts` si l'option (a) est retenue : un test par étape de migration, cas "déjà migré" (idempotence).
- `edt-formulaire.component.spec.ts` : ajout/suppression de temps, bornes 1 et 4, focalisation du nouveau bloc.
- `src/app/tests/emploi-du-temps.mother.ts` : étendre pour générer des créneaux avec `temps` (nouveau `TempsCreneauMother`).

## Fichiers impactés

| Fichier | Nature |
|---|---|
| `src/app/modeles/emploi-du-temps.modele.ts` | Nouveau `TempsCreneau`, `CreneauEdt.temps` |
| `src/app/services/sansEtat/emploi-du-temps.service.ts` (+ `.spec.ts`) | `calculerConflitsAbsences` sur `temps`, garde-fou 1-4 |
| `src/app/services/sansEtat/cahier-journal.service.ts` | Impact `initialiserDepuisEdt` (à confirmer) |
| `src/app/services/avecEtat/donnees.service.ts` | Point d'accroche migration si option (a) |
| `src/app/services/sansEtat/migration.service.ts` (+ `.spec.ts`) | Nouveau, si option (a) |
| `src/app/ecrans/emploi-du-temps/edt-formulaire/edt-formulaire.component.ts` / `.html` / `.scss` | Pattern répétable 1-4, champs horaire par temps |
| `src/app/ecrans/emploi-du-temps/ecran-emploi-du-temps.component.ts` / `.html` / `.scss` | Grille : lignes/index recalculés sur les temps, `ajouterCreneauPourJour` réécrit |
| `src/app/tests/emploi-du-temps.mother.ts` | `TempsCreneauMother` |

## Points à valider avant implémentation (bloquants)

1. Option de migration (a) vs (b) — voir section dédiée.
2. Sémantique du bouton "+"/"Ajouter" de la grille une fois les temps indépendants en horaire (créer un créneau+premier temps, ou un temps directement).
3. Inclusion ou report de l'adaptation de `CahierJournalService.initialiserDepuisEdt`.

## Vérification

1. `ng test` — couverture ≥80% maintenue.
2. `ng serve` : créer un créneau avec 2 à 4 temps à des horaires différents → vérifier l'affichage sur plusieurs lignes de la grille ; créer 2 temps de créneaux différents au même horaire → vérifier qu'ils apparaissent dans la même cellule ; vérifier les bornes 1 et 4 dans le formulaire.
