---
name: plans-12-edtEmploisCalcules
description: Plan d'évolution — nouvelle entité persistée "emploi du temps calculé" (lecture seule), calcul à la volée de créneaux à partir des récréations, temps de classe et absences régulières existants
metadata:
  type: project
  updated: 2026-09-16
related:
  - projet-12-ecran-emploi-du-temps
  - projet-02-modelesDonnees
  - projet-04-composantsPartages
  - plans-09-edtTitreListeEdt
  - plans-10-edtAbsencesRegulieres
  - plans-11-edtTempsMultiples
---

# Plan d'évolution — Emplois du temps calculés (B3)

## Contexte

Sous la liste "Mes emplois du temps" (`plans-09-edtTitreListeEdt.md`), ajouter une seconde liste d'« emplois du temps calculés » : des vues en lecture seule, non éditables créneau par créneau, dont le contenu est recalculé à partir des données existantes (récréations et/ou temps de classe des EDT réels, et/ou absences régulières des élèves) selon une définition saisie par l'utilisateur (nom, dates, fréquence, sources, concernés).

**Dépendance forte à `plans-11-edtTempsMultiples.md` (B4)** : si B4 est implémenté avant B3, la source "temps de classe" doit itérer sur `CreneauEdt.temps[]` (chaque temps ayant son propre horaire) plutôt que sur les champs à plat `heureDebut`/`heureFin` d'aujourd'hui. Ce plan est rédigé en supposant B4 déjà en place (ordre recommandé : B2 → B1 → B4 → B3) ; si l'ordre est inversé, adapter l'algorithme de la section "Source `tempsClasse`" pour lire les champs à plat de `CreneauEdt` à la place.

## Décisions validées

| # | Question | Décision |
|---|---|---|
| 1 | Persistance | La définition (`EmploiDuTempsCalcule`) est persistée dans le JSON (nouveau tableau racine). Le contenu calculé (créneaux) n'est jamais persisté — recalculé à la volée. |
| 2 | Champ "concernés" | Réutilise tel quel le type/composant `ElevesConcernes`/`mc-eleves-concernes` existant (sélection multiple possible, pas de restriction à un seul élève/groupe). |

## Modèle de données

Nouveau fichier `src/app/modeles/emploi-du-temps-calcule.modele.ts` :

```ts
export type SourceEdtCalcule = 'recreation' | 'tempsClasse' | 'absencesRegulieres';

export interface EmploiDuTempsCalcule {
  id: string;
  nom: string;
  dateDebut: string | null;
  dateFin: string | null;
  frequence: FrequenceSemaine;        // réutilise le type existant (paire/impaire/lesDeux) par cohérence
  sources: SourceEdtCalcule[];        // sélection multiple, non exclusive
  elevesConcernes: ElevesConcernes;   // réutilisation directe, décision validée
}
```

**Point à confirmer avec l'utilisateur** : l'énoncé initial ne mentionnait que paire/impaire pour cette entité (pas `lesDeux`). Recommandation : réutiliser `FrequenceSemaine` intégralement par cohérence de type et pour éviter un 3ᵉ type de fréquence quasi-identique dans le modèle. Si l'utilisateur veut restreindre, créer `FrequenceEdtCalcule = 'paire' | 'impaire'` à la place.

Type de rendu calculé, **non persisté** :
```ts
export type TypeSourceCalculee = 'recreation' | 'tempsClasse' | 'absenceReguliere';

export interface CreneauCalcule {
  jour: JourSemaine;
  heureDebut: string;
  heureFin: string;
  source: TypeSourceCalculee;
  libelle: string;             // discipline/titre du temps source, libellé d'absence, ou "Récréation"
  eleveConcerneId?: string;    // pertinent seulement pour source === 'absenceReguliere'
}
```
Pas d'`id` stable (non persisté, recalculé à chaque affichage) — `track` dans le template sur une clé composite (`jour-heureDebut-heureFin-source-libelle`), comme `indexCreneaux` le fait déjà pour les vrais créneaux.

### Évolution de `DonneesApplication`

`src/app/modeles/donnees-application.modele.ts` : ajouter `emploisDuTempsCalcules: EmploiDuTempsCalcule[];` au niveau racine. Mettre à jour `src/app/tests/donnees.mother.ts` (tableau `[]` par défaut) et toute donnée par défaut (`public/donnees-defaut.json`). Si un mécanisme de migration a été construit par `plans-11-edtTempsMultiples.md`, il doit aussi couvrir l'ajout de ce nouveau tableau (`donnees.emploisDuTempsCalcules ?? []`).

### Commandes

Réutilisation directe du pattern CRUD générique existant, aucune nouvelle classe de commande : `CommandeCreation<EmploiDuTempsCalcule>`, `CommandeModification<EmploiDuTempsCalcule>`, `CommandeSuppression<EmploiDuTempsCalcule>`, paramétrées avec `(d) => d.emploisDuTempsCalcules`.

## Nouveau service `EmploiDuTempsCalculeService`

Fichier : `src/app/services/sansEtat/emploi-du-temps-calcule.service.ts`.

CRUD (miroir de `EmploiDuTempsService`, sans gestion de créneaux à persister) :
- `creerEdtCalcule(edt: EmploiDuTempsCalcule): void`
- `modifierEdtCalcule(edt: EmploiDuTempsCalcule): void`
- `supprimerEdtCalcule(id: string): void`
- `obtenirEdtCalcule(id: string): EmploiDuTempsCalcule | undefined`

Calcul :
```ts
public calculerCreneaux(edtCalcule: EmploiDuTempsCalcule): CreneauCalcule[]
```
Suit le format **hebdomadaire type** de la grille EDT actuelle (pas d'ancrage sur une date précise), en s'inspirant du filtrage de `CahierJournalService.initialiserDepuisEdt` (plage de dates qui chevauche, compatibilité de fréquence) :

1. Filtrer les `EmploiDuTemps` sources dont la plage de dates chevauche celle de `edtCalcule` (comparaison d'intervalles, sur le modèle de `validerChevauchement`) ET dont la fréquence est compatible (`verifierCompatibiliteFrequences(edtCalcule.frequence, edt.frequence)` — méthode actuellement privée dans `EmploiDuTempsService`, à réutiliser en injectant `EmploiDuTempsService` dans ce nouveau service, ou à extraire en utilitaire partagé si la duplication devient gênante).
2. Si `'tempsClasse' ∈ sources` : parcourir les créneaux `pedagogique` des EDT retenus, puis chaque `TempsCreneau` de ces créneaux ; produire un `CreneauCalcule` par temps retenu, avec son propre `heureDebut`/`heureFin`.
3. Si `'recreation' ∈ sources` : parcourir les créneaux `recreation` des EDT retenus, puis chaque `TempsCreneau` (normalement un seul par créneau en pratique) ; produire un `CreneauCalcule` par temps.
4. Si `'absencesRegulieres' ∈ sources` : résoudre `edtCalcule.elevesConcernes` en liste d'élèves (via l'utilitaire `EleveUtils.resoudreElevesConcernes` s'il a été extrait par un lot précédent, sinon dupliquer la logique classe/groupes/eleves existante) puis, pour chaque élève, chaque `absencesRecurrentes` filtrée par `verifierCompatibiliteFrequences(edtCalcule.frequence, abs.paritesSemaine)`, produire un `CreneauCalcule` avec `source: 'absenceReguliere'`, `eleveConcerneId`.
5. Concaténer et trier par `heureDebut`.

Placer cette logique dans ce **nouveau service dédié**, pas dans `EmploiDuTempsService` (séparation par domaine déjà en place dans le projet, un service par entité/écran).

## UI

- Colonne gauche (`ecran-emploi-du-temps.component.html`) : sous "Mes emplois du temps", ajouter `<h2 class="edt__titre-section">{{ LIBELLES.edt.titreListeEdtCalcules }}</h2>` (réutilise la classe introduite par `plans-09-edtTitreListeEdt.md`) + `<ul>` similaire + bouton "Ajouter" ouvrant le nouveau formulaire.
- Nouveau composant formulaire `src/app/ecrans/emploi-du-temps/edtc-formulaire/` (préfixe `edtc` distinct de `edt-formulaire`, cf. convention "sous-composants d'écran" de `conventions-nommage.md`) : champs nom, dateDebut, dateFin, fréquence (`mc-select`, réutilisation d'`optionsFrequence`), sources (sélection multiple non exclusive — cases à cocher ou `mc-chip-filtre` en mode multi, cohérent visuellement avec les disciplines), `mc-eleves-concernes` réutilisé tel quel pour "concernés".
- **Affichage du calcul — décision structurante à confirmer avec l'utilisateur avant de coder**, deux options :
  - **Option A (recommandée)** : réutiliser la grille hebdomadaire centrale existante en mode lecture seule (pas de clic pour éditer, pas de bouton "+"), en lui faisant accepter soit un `EmploiDuTemps` réel, soit un `EmploiDuTempsCalcule` (créneaux calculés à la volée via un signal discriminant `modeAffichage: 'edt' | 'edtCalcule'`). Cohérence visuelle immédiate, aucun nouveau composant de grille à écrire/tester ; complexifie `EcranEmploiDuTempsComponent`, déjà chargé, avec une branche supplémentaire.
  - **Option B** : nouvelle vue dédiée en lecture seule, plus simple à isoler et tester, mais duplique le rendu de grille.
- Le formulaire contextuel à droite gère alors un 3ᵉ état (aujourd'hui 2 : propriétés EDT / créneau). Recommandation : composant séparé (`edtc-formulaire`) plutôt que surcharger `edt-formulaire` avec un 3ᵉ mode.

## Points à valider avant implémentation (non tranchés, à lever avec l'utilisateur)

1. **Sens de "concernés" pour la source `recreation`** : une récréation concerne en général toute la classe par construction. Proposition par défaut : ignorer `edtCalcule.elevesConcernes` pour cette source, toujours inclure la récréation telle quelle si la source est cochée.
2. **Sens de "concernés" pour `tempsClasse`** : croiser (intersection) avec le `elevesConcernes` du temps source, ou `edtCalcule.elevesConcernes` remplace-t-il le filtre du temps source ? Deux interprétations raisonnables, à trancher — change l'algorithme du point 2 de la section calcul.
3. **Fréquence à 2 ou 3 valeurs** (voir section modèle).
4. **Libellé exact souhaité** pour "temps de classe" dans `LIBELLES` (nom de code proposé : `tempsClasse`).
5. **Option A vs B** pour l'affichage du calcul (voir section UI).
6. **Ordre B4/B3** : si B3 est implémenté avant B4, adapter la source `tempsClasse` pour lire les champs à plat de `CreneauEdt` au lieu de `temps[]`.

## Duplication à surveiller

La résolution `ElevesConcernes → Eleve[]` serait utilisée ici une **3ᵉ fois** dans le projet (après `EmploiDuTempsService.calculerConflitsAbsences` et `CahierJournalService.calculerConflitsAbsences`) — c'est le signal, selon la règle "chercher avant de créer" du projet, qu'il faut l'extraire en utilitaire partagé (`EleveUtils.resoudreElevesConcernes`, `src/app/utilitaires/`) plutôt que la dupliquer une 3ᵉ fois. À faire dans ce lot si aucun lot précédent (`plans-10`) ne l'a déjà fait.

## Tests

- Nouveau `emploi-du-temps-calcule.mother.ts` (Object Mother).
- `emploi-du-temps-calcule.service.spec.ts` : chaque source isolément, combinaisons de sources, compatibilité/incompatibilité de fréquence, plages de dates disjointes/chevauchantes — un test par branche (`tests-code.md`).
- `edtc-formulaire.component.spec.ts` : sélection multiple des sources, validation des champs obligatoires.
- `ecran-emploi-du-temps.component.spec.ts` : nouveau mode d'affichage lecture seule si option A retenue.

## Fichiers impactés

| Fichier | Nature |
|---|---|
| `src/app/modeles/emploi-du-temps-calcule.modele.ts` | Nouveau |
| `src/app/modeles/donnees-application.modele.ts` | Champ `emploisDuTempsCalcules` |
| `src/app/services/sansEtat/emploi-du-temps-calcule.service.ts` (+ `.spec.ts`) | Nouveau |
| `src/app/utilitaires/eleve.utils.ts` | Nouveau, si pas déjà créé par un lot précédent |
| `src/app/ecrans/emploi-du-temps/ecran-emploi-du-temps.component.ts` / `.html` / `.scss` | 2ᵉ liste, mode lecture seule |
| `src/app/ecrans/emploi-du-temps/edtc-formulaire/` | Nouveau composant formulaire |
| `src/app/tests/donnees.mother.ts` | Tableau `emploisDuTempsCalcules` par défaut |
| `src/app/tests/emploi-du-temps-calcule.mother.ts` | Nouveau |
| `src/app/libelles.ts` | Clés `edt.titreListeEdtCalcules` et libellés du formulaire `edtc` |
| `public/donnees-defaut.json` | Champ par défaut |

## Vérification

1. `ng test` — couverture ≥80% sur le nouveau service.
2. `ng serve` : créer un EDT calculé combinant plusieurs sources et une cible (élève/groupe/classe), vérifier que les créneaux affichés correspondent bien aux récréations/temps de classe/absences régulières attendus, et qu'aucune modification n'est possible depuis cette vue (lecture seule).
3. Contrôle AXE / focus visible sur le nouveau formulaire `edtc-formulaire` (RGAA : `mcAutoFocus` sur le premier champ).

## Statut d'exécution

**Implémenté le 2026-09-18.** Décisions validées : option A (grille existante en lecture seule), fréquence à 3 valeurs, « concernés » = intersection pour `tempsClasse` (aucun filtre si la définition vise toute la classe), « concernés » ignorés pour `recreation`, libellé « Temps de classe ». Livré : modèle `emploi-du-temps-calcule.modele.ts`, migration `2026.09.3`, `EmploiDuTempsCalculeService`, `EleveUtils.resoudreElevesConcernes`, `DateUtils.chevauchementPlages`, composant `edtc-formulaire`, seconde liste dans l'écran EDT, `estGroupeUtilise` étendu. `ng test` : 1120 tests verts, `ng build` OK.

**Reste / limites connues (revue-increment) :**
- Budget SCSS de l'écran EDT dépassé (5,58 kB pour 5 kB), avertissement `ng build`.
- Suppression d'un élève : les `elevesIds` des EDT calculés (comme ceux des EDT) ne sont pas nettoyés.
- Pas de dédoublonnage si plusieurs EDT sources se chevauchent.
- Non vérifiés : rendu visuel, AXE, impression, E2E (aucun scénario ajouté dans [[plans-04-testsE2E]]).
