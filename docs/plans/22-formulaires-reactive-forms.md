---
name: 22-formulaires-reactive-forms
description: Plan d'évolution — migration des trois derniers formulaires écrits avec ngModel (fp-formulaire-projet, fe-formulaire-eleve, ecran-parametrage) vers les Reactive Forms, en trois incréments, sans changement fonctionnel visible ; corrige au passage le suivi des lignes par index ou par identifiant éditable
metadata:
  type: project
  updated: 2026-09-27
related:
  - specification/ecrans/projets
  - specification/ecrans/eleves
  - specification/ecrans/parametrage
  - specification/composants-partages
  - plans/21-edt-formulaire-reactive-forms
---

# Plan 22 — Formulaires Élèves, Projets et Paramétrage en Reactive Forms

**Statut : terminé le 2026-09-27.** Notes de réalisation :
- liaisons par `[formControl]="groupe.controls.xxx"` (comme au plan 21) plutôt que `formControlName` / `formArrayName` ; dans le Paramétrage, chaque ligne est un `FormGroup` `{ idOrigine, valeur }` ;
- `CursusAnnee.annee` (décision 6) : ENREGISTRER reste actif ; un champ année vidé émet l'année enregistrée de l'entrée (ou l'année de création d'une entrée nouvelle) ;
- ENREGISTRER d'une ligne du Paramétrage fixe son `idOrigine` à l'identifiant enregistré, pour que la réconciliation qui suit réutilise la même instance de ligne ;
- la perte de focus à la frappe dans l'« Identifiant » (contexte, 2e défaut) **ne se reproduisait pas** : le `@for` n'est réévalué que lorsque la référence du tableau change, ce que la saisie ne faisait pas. Le suivi par instance supprime ce risque latent (réévaluation après ajout, suppression ou rechargement) ; les tests unitaires et l'E2E-135 servent de non-régression mais passent aussi sur l'ancien code.

## Contexte

La règle `.claude/rules/angular-typescript.md` impose les Reactive Forms. Le [plan 21](21-edt-formulaire-reactive-forms.md) traite `edt-formulaire` ; trois formulaires restent écrits en **template-driven** (`FormsModule`, `[(ngModel)]` sur des objets mutables clonés depuis les données), relevé du 2026-09-27 :

| Formulaire | Liaisons `ngModel` | Structure |
|---|---|---|
| `ecrans/projets/fp-formulaire-projet/` | 6 | Projet (`nom`, `description`), élèves associés (chips), périodes (liste : nom, dates, description, compétences) |
| `ecrans/eleves/fe-formulaire-eleve/` | 30 | Identité et notes (18 champs), groupes (chips), 4 listes : contacts, absences récurrentes, absences ponctuelles, cursus |
| `ecrans/parametrage/ecran-parametrage` | 22 | 3 sections formulaire (Enseignant & Classe, Semaine & Horaires, Préférences) et 6 sections liste (périodes, groupes, barème, statuts élève, types de contact, jours fériés) |

Points communs :
- chargement par un `effect` qui clone les données (`structuredClone`) ; pour Élèves et Projets, garde d'identité (`idFormulaireCharge`) pour ne pas écraser la saisie lors d'un UNDO/REDO global ; pour le Paramétrage, rechargement de la section active à **chaque** changement des données ;
- validation manuelle (`estFormulaireValide()` : nom / prénom non vides) qui désactive ENREGISTRER ;
- listes manipulées par réaffectation de tableaux, focus du nouvel élément par un signal `indexAFocaliser…` + `[mcAutoFocus]`.

Deux défauts de suivi des lignes (`track` des boucles `@for`) sont liés à ce modèle mutable :
- `fp-formulaire-projet` suit les périodes par `$index` alors qu'elles ont un `id` ; `fe-formulaire-eleve` suit contacts et cursus par `$index`. Supprimer une ligne au milieu réattribue les éléments DOM (focus, état interne de `mc-selecteur-competences`) aux lignes suivantes ;
- dans le Paramétrage, le barème, les statuts élève et les types de contact suivent leurs lignes par leur `id`, **champ éditable de la ligne** (« Identifiant ») : chaque frappe dans ce champ change la clé de suivi, Angular recrée la ligne et le focus est perdu.

Aucun de ces formulaires n'a de `estModifie()` : Élèves et Projets s'appuient sur `EcranEditionGardeeBase.enModeEdition` (tout formulaire ouvert compte comme modifié), le Paramétrage sur ses méthodes `estXxxModifie()` / `estXxxLigneModifiee()` (pastille « Non enregistré »).

## Décisions

| # | Sujet | Décision |
|---|---|---|
| 1 | Découpage | Un **incrément par formulaire**, chacun relu (`revue-increment`) et committé séparément, dans l'ordre de complexité croissante : **Projets** → **Élèves** → **Paramétrage**. |
| 2 | Dépendance au plan 21 | Réutilisation de `FormulaireUtils` (`utilitaires/formulaire.utils.ts`, créée par le plan 21 : `validerTexteNonVide`, `validerPlageHoraire`). Si le plan 21 n'est pas encore réalisé au démarrage, le premier incrément crée cette classe telle que le plan 21 la décrit, et le plan 21 la réutilise. |
| 3 | Comportement | **Aucun changement fonctionnel visible** : mêmes champs, `id` HTML, libellés, conditions d'activation d'ENREGISTRER, pastilles « Non enregistré », focus. Seules différences : le suivi des lignes (décision 5) et la conversion explicite des types à l'émission (décision 6). |
| 4 | Listes | Chaque liste devient un `FormArray<FormGroup<…>>`. Ajout : `push()` puis `indexAFocaliser…` sur le nouvel index (signaux conservés) ; suppression : `removeAt(i)` puis `indexAFocaliser…` à `null`. |
| 5 | Suivi des lignes | Les boucles `@for` sur un `FormArray` suivent **l'instance du `FormGroup`** (`track groupe`), stable pendant toute la vie de la ligne, qu'elle ait un `id` ou non (contacts), et même si un champ de la ligne sert d'identifiant métier (barème, statuts élève, types de contact). Corrige les défauts décrits dans le contexte. |
| 6 | Types à l'émission | La valeur émise est reconstruite depuis `getRawValue()` : champs `string \| null` du modèle (`Eleve.inclusion`, `notesPPA`, `notesESS`) → `null` si vides. `mc-input` de type `number` convertit déjà la saisie en nombre ; pour `CursusAnnee.annee` et le délai de sauvegarde, seul le cas d'un champ vidé (le contrôle reçoit alors `''`) reste à traiter : champ invalide (délai) ou valeur non émise tant qu'elle n'est pas un nombre (année). Les champs non édités par le formulaire (`id` de l'élève ou du projet) restent des champs privés du composant, recopiés dans l'objet émis. |
| 7 | Sélections par chips | Groupes d'un élève, élèves d'un projet, jours ouvrés : `FormControl<string[]>` (ou `FormControl<JourSemaine[]>`) dans le `FormGroup`, mis à jour par `setValue` depuis les chips ; compétences d'une période de projet : `FormControl<string[]>` alimenté par l'output de `mc-selecteur-competences`, qui n'implémente pas `ControlValueAccessor` (inchangé). |
| 8 | Validation | Élève : `prenom` et `nom` avec `FormulaireUtils.validerTexteNonVide`. Projet : `nom` idem. Préférences : `Validators.required`, `Validators.min` / `Validators.max` sur les constantes existantes `DELAI_SAUVEGARDE_MIN` / `DELAI_SAUVEGARDE_MAX`. ENREGISTRER reste **désactivé** tant que le formulaire est invalide (statut exposé en signal par `toSignal(form.statusChanges)`) ; le message des Préférences reste affiché dès que la valeur est hors bornes. |
| 9 | Chargement | Élèves et Projets : garde d'identité conservée ; `reset(…, { emitEvent: false })` sur les champs simples, chaque `FormArray` vidé (`clear()`) puis reconstruit (`push()`), car `reset()` ne redimensionne pas un `FormArray` (le formulaire n'est rechargé qu'au changement d'élève ou de projet : aucune ligne en cours de saisie n'est concernée). Paramétrage : rechargement de la section active au même moment qu'aujourd'hui (même `effect`), mais par **réconciliation** et non par reconstruction : chaque ligne porte l'identifiant de l'entrée chargée (`idOrigine`, contrôle non affiché), le `FormGroup` d'une entrée toujours présente est **réutilisé** (`reset` avec les valeurs enregistrées), un `FormGroup` est créé pour une entrée nouvelle et retiré pour une entrée disparue. Les instances de `FormGroup` restent donc stables d'un rechargement à l'autre, et avec elles le `track` et le focus (décision 5). Comme aujourd'hui, les lignes ajoutées non enregistrées et les saisies non enregistrées des autres lignes sont écrasées (voir Hors périmètre). |
| 10 | Paramétrage — détection des modifications | Les méthodes `estXxxModifie()` et `estXxxLigneModifiee(i)` conservent leur logique (`ObjetUtils.sontEgaux` entre la valeur du formulaire ou de la ligne et les données enregistrées, lignes retrouvées par `id`) ; elles lisent `getRawValue()` au lieu des objets mutables. |
| 11 | Paramétrage — domaines | La section « Domaines de compétences » (cases à cocher natives, signal `copieDomainesActifs`) n'utilise pas `ngModel` : **inchangée**. |
| 12 | Options de jour | `fe-formulaire-eleve` déclare en dur les libellés « Lundi »… « Vendredi » des absences récurrentes : le tableau `{ valeur, libelle }[]` attendu par `mc-select` est dérivé du `Record` `LIBELLES.edt.joursLibelles`, dans l'ordre des jours (règle « chercher avant de créer »), puisque le tableau d'options est réécrit. |
| 13 | Interfaces de typage | Les interfaces des formulaires (`FormulaireProjet`, `FormulairePeriodeProjet`, `FormulaireEleve`, `FormulaireContact`…, `FormulaireEnseignantClasse`…) sont déclarées dans le fichier du composant, comme `FormulaireEdtCalcule` et `FormulaireSeance` : types d'interface utilisateur, pas DTO métier. |
| 14 | Contrat avec les écrans | Inputs, outputs et `id` HTML inchangés : `ecran-eleves`, `ecran-projets` et les sélecteurs E2E ne bougent pas. |

## Modifications

### Incrément 1 — `fp-formulaire-projet`

- `fp-formulaire-projet.component.ts` : `ReactiveFormsModule` ; `form: FormGroup<FormulaireProjet>` (`nom`, `description`, `elevesIds`, `periodes: FormArray<FormGroup<FormulairePeriodeProjet>>` avec `id`, `periodeNom`, `debut`, `fin`, `description`, `competencesIds`) ; `ajouterEleve` / `retirerEleve`, `ajouterPeriode` / `supprimerPeriode`, `surSelectionCompetences` réécrites sur les contrôles ; `onEnregistrer()` reconstruit le `Projet` (décision 6).
- `fp-formulaire-projet.component.html` : `[formGroup]`, `formControlName`, `formArrayName="periodes"` + `[formGroupName]="i"`, `track groupe`.
- `fp-formulaire-projet.component.spec.ts` : tests adaptés (lecture par `form.controls` / `getRawValue()`), plus : nom fait d'espaces → ENREGISTRER désactivé ; suppression de la période du milieu parmi trois → les deux restantes gardent leurs valeurs et leurs compétences ; UNDO/REDO global (nouvel input de même `id`) → saisie conservée.

### Incrément 2 — `fe-formulaire-eleve`

- `fe-formulaire-eleve.component.ts` : `form: FormGroup<FormulaireEleve>` avec les champs d'identité et de notes, `groupes`, et quatre `FormArray` (`contacts`, `absencesRecurrentes`, `absencesPonctuelles`, `cursus`) ; méthodes d'ajout / suppression réécrites ; options de jour depuis `LIBELLES` (décision 12) ; `onEnregistrer()` reconstruit l'`Eleve` (décision 6).
- `fe-formulaire-eleve.component.html` : liaisons réactives, `track groupe` sur les quatre listes ; `mc-radio-group` (sexe), `mc-select` (statut, type de contact, jour, parité) en `formControlName`.
- `fe-formulaire-eleve.component.spec.ts` : tests adaptés, plus : prénom ou nom vide → ENREGISTRER désactivé ; `inclusion` vide émis à `null` ; `annee` du cursus émise en `number` ; suppression du contact du milieu (sans `id`) → contacts restants intacts ; libellés des jours issus de `LIBELLES.edt.joursLibelles`.

### Incrément 3 — `ecran-parametrage`

- `ecran-parametrage.component.ts` : `FormGroup` pour Enseignant & Classe, Semaine & Horaires (`joursOuvres` en `FormControl<JourSemaine[]>`) et Préférences ; un `FormArray` par section liste, à la place des signaux `copiePeriodes`, `copieGroupes`, `copieBareme`, `copieStatutsEleve`, `copieTypesContact`, `copieJoursFeries` ; `effect` de rechargement, méthodes `enregistrerXxx(i)` / `supprimerXxx`, `estXxxModifie()` et `estXxxLigneModifiee(i)` réécrits sur les contrôles (décision 10) ; `preferencesValides()` remplacée par la validité du `FormGroup`.
- `ecran-parametrage.component.html` : liaisons réactives, `track groupe` sur les six listes ; l'aperçu `mc-badge-statut` du barème lit la valeur courante de la ligne.
- `ecran-parametrage.component.spec.ts` : tests adaptés, plus :
  - saisie dans l'« Identifiant » d'une ligne du barème, des statuts élève et des types de contact → la ligne n'est pas recréée et le champ garde le focus (régression du suivi par `id`) ;
  - rechargement de section (enregistrement d'une autre ligne, UNDO/REDO) → les `FormGroup` des entrées toujours présentes sont les **mêmes instances** qu'avant ; entrée ajoutée ou supprimée → `FormArray` réconcilié (décision 9) ;
  - délai 0, 61 ou vide → ENREGISTRER désactivé et message affiché ; délai émis en `number` ;
  - enregistrement d'une ligne → pastilles « Non enregistré » mises à jour comme aujourd'hui.

### Tests E2E

- Aucun sélecteur ne change (décision 14). Relancer à chaque incrément le spec de l'écran touché (`projets.spec.ts`, `eleves.spec.ts`, `parametrage.spec.ts`) ainsi que `accessibilite.spec.ts` et `annuler-refaire.spec.ts`.
- Incrément 3 : nouveau scénario (numéro à attribuer au démarrage, après le dernier E2E existant) — dans une nouvelle ligne du barème, puis d'un type de contact, saisir au clavier un identifiant de plusieurs caractères et vérifier la valeur complète (non-régression du focus).

### Documentation

- `specification/ecrans/eleves.md`, `projets.md`, `parametrage.md` : aucune règle fonctionnelle ne change ; vérifier que les descriptions restent exactes.
- `specification/architecture-applicative.md` : la ligne « Formulaires » des décisions techniques annonce déjà les Reactive Forms ; elle devient exacte une fois les plans 21 et 22 terminés, sans modification.
- `docs/README.md` : statut du plan 22.

## Hors périmètre

- **Paramétrage — rechargement des sections liste** : l'`effect` recharge la section active à chaque changement des données ; enregistrer une ligne (ou un UNDO/REDO) efface donc les saisies non enregistrées des **autres** lignes de la section. Comportement conservé (décision 9) ; à traiter séparément si besoin.
- **Paramétrage — identifiant éditable** : modifier l'identifiant d'un statut du barème, d'un statut élève ou d'un type de contact déjà enregistré crée une nouvelle entrée au lieu de renommer l'existante (lignes retrouvées par `id`), et laisse les références existantes pointer vers l'ancien identifiant. À spécifier (identifiant figé après création, ou renommage en cascade).
- **Paramétrage — navigation gardée** : l'écran n'a pas de `canDeactivate` ; quitter l'écran avec une section modifiée perd les saisies sans avertissement.
- **Paramétrage — libellés des jours** : `LIBELLES_JOURS` (« L », « Ma », « Me »…) et `JOURS_SEMAINE` sont déclarés en dur dans le composant, sans `static readonly` : à déplacer dans `LIBELLES` avec la correction des règles d'architecture du Paramétrage.
- **Absences récurrentes d'un élève** : aucune validation de plage horaire (fin > début). `FormulaireUtils.validerPlageHoraire` le permettrait, mais c'est un changement fonctionnel : à décider séparément.
- Détection des modifications d'Élèves et Projets (`enModeEdition` = formulaire ouvert) : inchangée.

## Vérification

Pour chaque incrément :
1. `ng test` : tous verts, couverture ≥ 80 % sur les quatre métriques des services.
2. E2E de l'écran touché, accessibilité et annuler-refaire verts.
3. Contrôle manuel : création, modification, ajout et suppression d'une ligne au milieu d'une liste, ANNULER, UNDO/REDO pendant une saisie.
4. Revue `revue-increment`, puis commit de l'incrément.
