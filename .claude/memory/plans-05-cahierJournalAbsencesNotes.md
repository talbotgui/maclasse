---
name: plans-05-cahierJournalAbsencesNotes
description: Plan d'évolution — pré-remplissage automatique de la note de journée du cahier journal avec les absences (régulières + ponctuelles) du jour
metadata:
  type: project
  updated: 2026-09-16
related:
  - projet-13-ecran-cahier-journal
  - projet-05-services
  - projet-02-modelesDonnees
  - projet-17-libelles
  - plans-06-cahierJournalPastillesElevesConcernes
---

# Plan d'évolution — Pré-remplissage de la note de journée avec les absences du jour (A1)

## Contexte

À l'initialisation d'une journée du cahier journal, l'enseignant doit aujourd'hui ressaisir manuellement dans la note libre les élèves absents ce jour-là. Objectif : pré-remplir automatiquement `JourneeJournal.notes` avec la liste des absences (régulières et ponctuelles) correspondant au jour, sous forme de liste à puces textuelle.

## Décisions validées

| # | Question | Décision |
|---|---|---|
| 1 | Déclenchement | Uniquement si `notes` est vide au moment de l'initialisation — ne jamais écraser une note déjà saisie. Garanti structurellement : `initialiserJourneeVide`/`initialiserDepuisEdt` ne s'exécutent jamais sur une journée déjà existante, donc `notes` n'a jamais pu être renseigné avant l'appel. |
| 2 | Parité des absences récurrentes | Filtrer par `paritesSemaine` (nouveauté : le champ existe dans le modèle mais n'est utilisé nulle part actuellement dans l'app, y compris dans `calculerConflitsAbsences` qui l'ignore explicitement). |
| 3 | Portée du déclenchement | Les deux méthodes d'initialisation (`initialiserJourneeVide` ET `initialiserDepuisEdt`). |

## Conception

### Nouvelle méthode — `EleveService.genererLibellesAbsencesDuJour`

Fichier : `src/app/services/sansEtat/eleve.service.ts`, à côté de `calculerConflitsAbsences` (même domaine élève/absences).

```
public genererLibellesAbsencesDuJour(date: string): string[]
```

- `[]` si aucune donnée chargée.
- `jourSemaine = DateUtils.obtenirJourSemaine(date)`, `parite = DateUtils.calculerParite(date)`.
- Élèves triés `NOM Prénom` (`localeCompare(..., 'fr')`, même pattern que `rechercherEleves`).
- Absences récurrentes retenues si `abs.jour === jourSemaine` ET (`abs.paritesSemaine === 'lesDeux'` OU `=== parite`).
- Absences ponctuelles retenues si `abs.date === date`.
- Une ligne par absence retenue :
  - Récurrente : `` `- ${eleve.nom} ${eleve.prenom} : ${abs.libelle} (${abs.heureDebut}-${abs.heureFin})` ``
  - Ponctuelle : `` `- ${eleve.nom} ${eleve.prenom} : ${abs.justification}` ``
- Format du nom aligné sur celui déjà produit par `CahierJournalService.calculerConflitsAbsences` (pas de nouvelle convention de casse dans ce fichier).

### Nouvelle méthode privée — `CahierJournalService.genererNotesInitiales`

Fichier : `src/app/services/sansEtat/cahier-journal.service.ts`.

- Injecter `private readonly eleveService = inject(EleveService);` (pas de cycle : `EleveService` n'importe pas `CahierJournalService`).
- `private genererNotesInitiales(date: string): string | undefined` :
  - Appelle `eleveService.genererLibellesAbsencesDuJour(date)`.
  - `[]` → `undefined` (aucune note générée, cas "0 absence").
  - Sinon → `[LIBELLES.cahierJournal.enteteAbsencesJour, ...lignes].join('\n')`.
- Appelée dans `initialiserJourneeVide` (lignes 29-40) et `initialiserDepuisEdt` (lignes 49-94), juste avant la construction de l'objet passé à `CommandeCreation`, avec le spread conditionnel déjà utilisé ailleurs dans ce fichier (ex. `dupliquerJournee`, lignes 322-326) : `...(notesInitiales ? { notes: notesInitiales } : {})`.
- Mettre à jour le JSDoc des deux méthodes modifiées (mentionner le pré-remplissage et expliquer pourquoi aucune garde `if (journee.notes)` supplémentaire n'est nécessaire).

Le rendu est automatique côté écran : `mc-textarea` est lié à `notesControl` (resynchronisé par un `effect()`), et le bloc `.cj__notes` s'affiche dès que `seances().length > 0 || notesJournee()` est vrai — donc aussi pour `initialiserJourneeVide` sans séance si des absences existent ce jour-là.

### Format du texte généré

```
Absences du jour :
- MARTIN Paul : Orthophonie (09:30-10:30)
- DUPONT Marie : Rendez-vous médical
```

Récurrente vs ponctuelle distinguées naturellement par la présence ou non de la plage horaire entre parenthèses (pas de libellé "récurrente"/"ponctuelle" explicite requis).

### Libellé à ajouter

`src/app/libelles.ts`, section `cahierJournal` (près de `labelNotes`/`placeholderNotes`, ligne ~246) :

```ts
enteteAbsencesJour: 'Absences du jour :',
```

## Tests

- `src/app/tests/eleve.mother.ts` : ajouter `AbsenceRecurrenteMother.base(surcharge?)` et `AbsencePonctuelleMother.base(surcharge?)` — actuellement ces structures sont inlinées en littéraux dans les specs existants ; elles deviennent réutilisées dans ≥2 fichiers de specs avec cette évolution, donc les mothers sont requises (`tests-code.md`).
- `eleve.service.spec.ts` — `describe('genererLibellesAbsencesDuJour', ...)`, un test par branche :
  - aucune donnée chargée → `[]`
  - récurrente `paritesSemaine: 'lesDeux'` → incluse
  - récurrente parité identique (`'paire'`/`'impaire'`) → incluse
  - récurrente parité différente → **exclue** (nouveau comportement, absent de `calculerConflitsAbsences`)
  - récurrente jour différent → exclue
  - ponctuelle date identique → incluse
  - ponctuelle date différente → exclue
  - plusieurs élèves → tri NOM Prénom respecté
  - élève avec récurrente + ponctuelle simultanément → les deux lignes, bon ordre
  - assertion sur la chaîne exacte générée (pas `toBeTruthy`, cf. `tests-code.md`)
- `cahier-journal.service.spec.ts` — étendre `initialiserJourneeVide`/`initialiserDepuisEdt` :
  - cas nominal : `notes` contient l'en-tête + la ligne attendue
  - cas 0 absence : `notes` reste `undefined`
  - branche parité dédiée dans `initialiserDepuisEdt`, en réutilisant `DatesTest.lundiPaire`/`lundiImpaire` déjà présents dans `cahier-journal.mother.ts`
  - vérifier que les tests existants "sans effet si une entrée existe déjà" restent verts

## Fichiers impactés

| Fichier | Nature |
|---|---|
| `src/app/services/sansEtat/eleve.service.ts` | Nouvelle méthode `genererLibellesAbsencesDuJour` |
| `src/app/services/sansEtat/cahier-journal.service.ts` | Méthode privée `genererNotesInitiales`, appels dans les 2 méthodes d'initialisation, injection `EleveService` |
| `src/app/libelles.ts` | Clé `cahierJournal.enteteAbsencesJour` |
| `src/app/tests/eleve.mother.ts` | Mothers `AbsenceRecurrenteMother`, `AbsencePonctuelleMother` |
| `src/app/services/sansEtat/eleve.service.spec.ts` | Nouveaux tests |
| `src/app/services/sansEtat/cahier-journal.service.spec.ts` | Nouveaux tests |

## Vérification

1. `ng test` — couverture ≥80% (lignes/branches/fonctions/statements) sur `eleve.service.ts` et `cahier-journal.service.ts`.
2. `ng serve` — sur l'écran cahier journal :
   - Initialiser une journée (vide et depuis EDT) pour un jour où au moins un élève a une absence récurrente compatible en parité et/ou une absence ponctuelle → vérifier le contenu généré.
   - Vérifier qu'une journée déjà annotée n'est jamais écrasée (les boutons d'initialisation ne s'affichent que si la journée n'existe pas encore).
