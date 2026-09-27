---
name: 21-edt-formulaire-reactive-forms
description: Plan d'évolution — migration du formulaire edt-formulaire (propriétés d'un EDT et formulaire de créneau) de FormsModule / ngModel vers les Reactive Forms (FormGroup des propriétés, FormGroup du créneau avec FormArray des temps), en conservant les validations « nom obligatoire » et « heure de fin postérieure à l'heure de début »
metadata:
  type: project
  updated: 2026-09-27
related:
  - specification/ecrans/emploi-du-temps
  - specification/composants-partages
  - plans/11-edt-temps-multiples
  - plans/20-edt-pause-meridienne
---

# Plan 21 — EDT : formulaire en Reactive Forms

**Statut : proposé le 2026-09-27, en attente de validation.** Aucune modification de code effectuée.

## Contexte

`edt-formulaire` (`src/app/ecrans/emploi-du-temps/edt-formulaire/`) porte deux formulaires : les propriétés de l'EDT sélectionné et le formulaire d'un créneau (jour, type, 1 à 4 temps). Il est écrit en **template-driven** :

- import de `FormsModule`, champs liés par `[(ngModel)]` sur deux objets mutables (`formEdt`, `formCreneau`) clonés depuis les inputs ;
- soumission par `(ngSubmit)` ;
- validation manuelle, ajoutée par l'écart E13 du relevé du 2026-09-27 : signaux `soumissionEdtTentee` / `soumissionCreneauTentee`, méthodes `verifierNomEdtRenseigne()` et `verifierPlageHoraire(temps)`, messages `LIBELLES.edt.erreurNomObligatoire` et `LIBELLES.commun.erreurPlageHoraire` ;
- détection des modifications par comparaison `JSON.stringify` avec une copie d'origine (`estModifie()`, utilisé par la garde de navigation de l'écran) ;
- manipulation des temps (ajout, suppression, disciplines, élèves concernés) par réaffectation de `formCreneau.temps`.

La règle `.claude/rules/angular-typescript.md` impose les Reactive Forms. Les formulaires voisins du même écran et du cahier journal (`edtc-formulaire`, `cj-formulaire-seance`) les utilisent déjà : ce plan aligne `edt-formulaire` sur eux, **sans changement fonctionnel visible**.

## Décisions

| # | Sujet | Décision |
|---|---|---|
| 1 | Découpage | Deux formulaires typés distincts, puisque les deux vues ne sont jamais affichées ensemble : `formEdt: FormGroup<FormulaireProprietesEdt>` et `formCreneau: FormGroup<FormulaireCreneau>`. |
| 2 | Propriétés de l'EDT | `FormulaireProprietesEdt` : `nom` (validateur `FormulaireUtils.validerTexteNonVide`, qui couvre aussi le champ vide), `dateDebut`, `dateFin` (chaînes, `''` ↔ `null` à la conversion), `frequence` (`FrequenceSemaine`). Tous `nonNullable`. L'`id` **et les `creneaux`** de l'EDT, non édités par ce formulaire, restent des champs privés du composant (comme `idCourant` dans `edtc-formulaire`) et sont recopiés dans l'EDT émis : `modifierEdt()` remplace l'EDT entier (`CommandeModification`), un EDT émis sans ses créneaux les effacerait. |
| 3 | Créneau | `FormulaireCreneau` : `jour` (`JourSemaine`), `type` (`TypeCreneau`), `temps: FormArray<FormGroup<FormulaireTemps>>`. L'`id` du créneau reste un champ privé. |
| 4 | Temps | `FormulaireTemps` : `id`, `heureDebut`, `heureFin` (`Validators.required`), `disciplinesIds` (`FormControl<string[]>`, piloté par les chips), `titre`, `elevesConcernes` (`FormControl<ElevesConcernes>`, lié à `mc-eleves-concernes` par `formControlName`). Validateur de groupe « plage horaire » sur chaque temps. `disciplinesIds` est **dans** le `FormGroup`, alors que `edtc-formulaire` (`sourcesCochees`) et `cj-formulaire-seance` (`disciplinesIdsInternes`) gardent ce type de sélection dans un signal à part : ici, il y a une sélection **par temps**, et la placer dans le `FormGroup` du temps évite un tableau de signaux parallèle au `FormArray`, à resynchroniser à chaque ajout ou suppression. |
| 5 | Validateur de plage horaire | `cj-formulaire-seance` a déjà un `validerPlageHoraire` statique privé. Pour ne pas le dupliquer (règle « chercher avant de créer »), il est déplacé dans une nouvelle classe utilitaire **`FormulaireUtils`** (`utilitaires/formulaire.utils.ts`), avec le validateur « texte non vide » du nom. Les deux composants l'utilisent. |
| 6 | Nombre de temps | Bornes 1 à `EmploiDuTempsService.NOMBRE_TEMPS_MAX` inchangées ; `ajouterTemps()` pousse un `FormGroup` dans le `FormArray` (heure de début = fin du dernier temps, durée 1 h) ; `supprimerTemps(i)` fait un `removeAt(i)`, sans effet s'il ne reste qu'un seul temps. |
| 7 | Affichage des erreurs | Même mécanique que `edtc-formulaire` : signal `soumissionTentee` par formulaire + statut exposé en signal (`toSignal(form.statusChanges)`). Les messages s'affichent après une tentative d'ENREGISTRER et disparaissent dès que le champ devient valide. Libellés et `id` des messages inchangés, `role="alert"`. |
| 8 | Détection des modifications | `estModifie()` conserve sa signature publique. Il compare `getRawValue()` à la valeur chargée avec `ObjetUtils.sontEgaux` plutôt qu'avec `form.dirty` : revenir à la valeur d'origine n'est pas une modification, et les changements programmatiques (chips, ajout ou suppression d'un temps) sont couverts sans `markAsDirty`. `edtc-formulaire` et `cj-formulaire-seance` gardent `form.dirty` (voir Hors périmètre). |
| 9 | Chargement depuis les inputs | Même garde d'identité qu'aujourd'hui (`idEdtCharge`, `idCreneauCharge`) : le formulaire n'est rechargé que si l'`id` de l'EDT ou du créneau change, pour ne pas écraser une saisie lors d'un UNDO/REDO global. Pour le créneau, `reset()` ne redimensionne pas un `FormArray` : le `FormArray` des temps est d'abord vidé (`clear({ emitEvent: false })`) puis reconstruit avec un `FormGroup` par temps (`push(…, { emitEvent: false })`), et `reset()` ne porte que sur `jour` et `type`. La valeur chargée (`getRawValue()`) est mémorisée comme valeur d'origine (décision 8). |
| 10 | Champs pédagogiques | Comportement du plan 20 conservé : les champs restent dans le formulaire quand le type change (basculer pédagogique → pause → pédagogique ne perd rien avant ENREGISTRER) et sont retirés de chaque temps à l'émission d'un créneau non pédagogique. |
| 11 | ANNULER | Comportement de l'écart E12 conservé : ANNULER sur les propriétés recharge la valeur d'origine (`reset`) avant d'émettre `edtAnnule` ; ANNULER sur un créneau émet `creneauAnnule` (retour aux propriétés, géré par l'écran). |
| 12 | Contrat avec l'écran | Inputs, outputs, `estModifie()`, `id` HTML des champs et des boutons **inchangés** : `ecran-emploi-du-temps` et les sélecteurs E2E ne bougent pas. |
| 13 | Interfaces de typage | `FormulaireProprietesEdt`, `FormulaireCreneau`, `FormulaireTemps` sont déclarées dans le fichier du composant, comme `FormulaireEdtCalcule` et `FormulaireSeance` : ce sont des types d'interface utilisateur, pas des DTO métier. |
| 14 | Focus (RGAA) | Le signal `indexAFocaliserTemps` est conservé : `ajouterTemps()` le fixe sur l'index du temps ajouté (focus sur son heure de début via `[mcAutoFocus]`), `supprimerTemps()` le remet à `null`. Focus initial inchangé : `[mcAutoFocus]="focusDemande()"` sur le nom (propriétés) et sur le jour (créneau). |

## Modifications

### Utilitaires

- `utilitaires/formulaire.utils.ts` (nouveau) : classe `FormulaireUtils`, méthodes statiques documentées :
  - `validerPlageHoraire(groupe)` : erreur `{ plageHoraireInvalide: true }` (clé actuelle de `cj-formulaire-seance`, conservée) si les deux heures sont renseignées et que la fin n'est pas strictement postérieure au début ;
  - `validerTexteNonVide(controle)` : erreur `{ texteVide: true }` si la valeur, une fois les espaces retirés, est vide.

### Composants

- `edt-formulaire.component.ts` :
  - `FormsModule` remplacé par `ReactiveFormsModule` ;
  - `formEdt` / `formCreneau` deviennent des `FormGroup` typés (décisions 1 à 4) ; getter `tempsFormArray` pour le template ;
  - `basculerDiscipline(i, id, actif)` et `surElevesConcernesChange` (supprimée : le contrôle est lié directement) travaillent sur les contrôles du `FormArray` ;
  - `onEnregistrerEdt()` / `onEnregistrerCreneau()` : `soumissionTentee` à `true`, arrêt si le formulaire est invalide, sinon conversion de `getRawValue()` en `EmploiDuTemps` / `CreneauEdt` (dates `''` → `null`, `id` et `creneaux` conservés pour l'EDT, `id` pour le créneau, nettoyage des champs pédagogiques) et émission ; la valeur émise devient la nouvelle valeur d'origine ;
  - suppression de `verifierNomEdtRenseigne()`, de `verifierPlageHoraire()` et des objets `edtOrigine` / `creneauOrigine` sous leur forme actuelle.
- `edt-formulaire.component.html` : `[formGroup]` et `(ngSubmit)` sur chaque `<form>`, `formControlName` sur les champs, `formArrayName="temps"` + `[formGroupName]="i"` dans la boucle des temps ; mêmes `id`, libellés et messages d'erreur. La boucle `@for` sur `tempsFormArray.controls` garde un `track` **stable** sur l'identifiant du temps (`track groupe.controls.id.value`), pas sur l'index : supprimer un temps au milieu ne doit pas réattribuer les éléments DOM (focus, chips) aux temps suivants.
- `cj-formulaire-seance.component.ts` : `validerPlageHoraire` privé remplacé par `FormulaireUtils.validerPlageHoraire` (aucun changement de comportement).

### Tests unitaires

- `utilitaires/formulaire.utils.spec.ts` (nouveau) : plage valide, fin égale au début, fin antérieure, heure manquante (pas d'erreur de plage) ; texte non vide, vide, fait d'espaces.
- `edt-formulaire.component.spec.ts` : tests existants adaptés aux `FormGroup` (lecture par `form.controls` / `getRawValue()` au lieu des objets mutables), plus :
  - nom vide ou fait d'espaces → message affiché, `edtEnregistre` non émis ; message retiré dès que le nom est saisi ;
  - temps dont la fin précède le début → message sur ce temps seul, `creneauEnregistre` non émis ;
  - ajout d'un temps jusqu'à 4 puis bouton désactivé ; suppression impossible sous un temps ;
  - `estModifie()` : `false` au chargement, `true` après saisie ou ajout d'un temps, `false` après retour à la valeur d'origine ;
  - UNDO/REDO global (nouvel input de même `id`) → saisie conservée ;
  - ENREGISTRER les propriétés d'un EDT **qui a des créneaux** (surcharge de `EdtMother.base()`, qui a `creneaux: []` par défaut) → l'EDT émis conserve ses créneaux ;
  - ajout d'un temps → `indexAFocaliserTemps` vaut l'index du nouveau temps ; suppression → `null` ;
  - suppression du temps du milieu parmi trois → les deux temps restants gardent leurs valeurs (contrôle du `track`) ;
  - basculement de type → champs pédagogiques conservés dans le formulaire, absents du créneau émis pour une pause.
- `cj-formulaire-seance.component.spec.ts` : tests de plage horaire existants inchangés et verts.
- `ecran-emploi-du-temps.component.spec.ts` : la suite « confirmerNavigation (garde de navigation) » modifie aujourd'hui l'objet interne du formulaire enfant (`formulaire.formEdt.nom = 'Nom modifié'`) ; la remplacer par `formulaire.formEdt.controls.nom.setValue('Nom modifié')`.

### Tests E2E

- Aucun sélecteur ne change (décision 12). Relancer `e2e/tests/emploi-du-temps.spec.ts` et `accessibilite.spec.ts`.

### Documentation

- `specification/ecrans/emploi-du-temps.md` : aucune règle fonctionnelle ne change ; vérifier seulement que la description des validations reste exacte.
- `specification/elements-techniques.md` : ajouter `FormulaireUtils` au § Classes utilitaires.
- `specification/architecture-applicative.md` : ajouter `formulaire.utils.ts` dans l'arborescence.
- `docs/README.md` : statut du plan 21.

## Hors périmètre

- Trois autres formulaires utilisent encore `ngModel` (relevé du 2026-09-27) : `fe-formulaire-eleve` (30 liaisons), `ecran-parametrage` (22) et `fp-formulaire-projet` (6). Leur migration relève de plans séparés ; `FormulaireUtils` pourra y être réutilisée.
- Aucune évolution fonctionnelle du formulaire de créneau (ordre des temps, glisser-déposer, contrôle de chevauchement entre temps d'un même créneau).
- `edtc-formulaire` et `cj-formulaire-seance` détectent les modifications avec `form.dirty` : revenir à la valeur d'origine y reste compté comme une modification (popin d'avertissement superflue). Les aligner sur la décision 8 relève d'un plan séparé.

## Vérification

1. `ng test` : tous verts, couverture ≥ 80 % sur les quatre métriques.
2. E2E Emploi du temps et accessibilité verts.
3. Contrôle manuel : créer un EDT sans nom, puis corriger ; créneau à 3 temps dont un invalide ; ANNULER sur les propriétés et sur un créneau ; quitter l'écran avec un formulaire modifié (popin d'avertissement).
4. Revue `revue-increment`.
