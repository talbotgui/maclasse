---
name: 17-cahier-journal-regroupement-absences
description: Plan d'évolution — regroupement par élève des lignes d'absences pré-remplies dans la note de journée du cahier journal
metadata:
  type: project
  updated: 2026-09-27
related:
  - plans/05-cahier-journal-absences-notes
---

# Plan d'évolution — Regroupement des absences par élève dans la note du cahier journal

## Contexte

`EleveService.genererLibellesAbsencesDuJour` (introduit par [plan 05](05-cahier-journal-absences-notes.md)) génère aujourd'hui **une ligne par absence** dans la note pré-remplie du cahier journal. Un élève ayant plusieurs absences le même jour (ex. une récurrente le matin + une ponctuelle l'après-midi) apparaît donc sur plusieurs puces distinctes.

Objectif : **une puce par élève concerné**, listant toutes ses absences du jour séparées par `" ; "`.

## Décisions validées

| # | Question | Décision |
|---|---|---|
| 1 | Ordre des élèves | Inchangé : NOM Prénom (`trierElevesParNomPrenom`) |
| 2 | Ordre des absences d'un même élève | Récurrentes triées par heure de début croissante (`localeCompare`, même pattern que `cahier-journal.service.ts`), puis les ponctuelles (sans horaire) en dernier |
| 3 | Séparateur entre absences d'un même élève | `" ; "` |
| 4 | Distinction récurrente / ponctuelle en texte brut | Récurrente : `libellé (début-fin)` (inchangé) ; ponctuelle : `JUSTIFICATION EN MAJUSCULES` (le champ note est du texte brut, aucune mise en forme — gras — n'est rendue par l'interpolation Angular) |
| 5 | Mention du format | Ajoutée à la fin de la ligne d'en-tête : « Absences du jour (horaire entre parenthèses = récurrente, MAJUSCULES = ponctuelle) : » |

## Conception

### `EleveService.genererLibellesAbsencesDuJour`

Fichier : `src/app/services/sansEtat/eleve.service.ts`.

Remplacer la double boucle (une ligne poussée par absence) par, pour chaque élève trié :

1. Filtrer les absences récurrentes retenues (jour + parité, logique inchangée), les trier par `heureDebut.localeCompare`, les mapper en `` `${libelle} (${heureDebut}-${heureFin})` ``.
2. Filtrer les absences ponctuelles retenues (date exacte, logique inchangée), les mapper en `justification.toUpperCase()`.
3. Concaténer récurrentes puis ponctuelles ; si le tableau résultant est non vide, pousser une seule ligne `` `- ${nom} ${prenom} : ${absences.join(' ; ')}` ``.
4. Si le tableau est vide pour cet élève, ne rien pousser (élève non concerné ce jour-là).

Pas de nouvelle constante nécessaire : `' ; '` reste un littéral inline, comme `.join(' › ')` dans `competence.service.ts`.

### Libellé — `src/app/libelles.ts`

Remplacer la valeur de `cahierJournal.enteteAbsencesJour` :

```ts
enteteAbsencesJour: 'Absences du jour (horaire entre parenthèses = récurrente, MAJUSCULES = ponctuelle) :',
```

`CahierJournalService.genererNotesInitiales` n'est pas modifié : il consomme déjà `LIBELLES.cahierJournal.enteteAbsencesJour` comme première ligne, sans dépendre de son contenu exact.

### Format du texte généré

```
Absences du jour (horaire entre parenthèses = récurrente, MAJUSCULES = ponctuelle) :
- DUPONT Marie : RENDEZ-VOUS MÉDICAL
- MARTIN Paul : Orthophonie (09:30-10:30) ; Rendez-vous médical (11:00-12:00) ; SUIVI PSYCHOLOGUE
```

## Tests

- `eleve.service.spec.ts`, `describe('genererLibellesAbsencesDuJour', ...)` :
  - Mettre à jour les tests existants impactés par le changement de format :
    - absence ponctuelle seule → justification en MAJUSCULES
    - élève avec récurrente + ponctuelle → une seule ligne groupée (`... ; ...`)
  - Nouveaux tests par branche :
    - deux absences récurrentes du même élève dans le désordre → triées par heure de début dans la ligne
    - récurrente + ponctuelle du même élève → ponctuelle toujours après, même si ajoutée en premier dans les données
    - deux élèves concernés → une ligne par élève (pas de ligne pour un élève sans absence retenue ce jour-là)
- `cahier-journal.service.spec.ts` : mettre à jour les 3 assertions exactes sur `notes` (nouvel intitulé d'en-tête, ponctuelle en majuscules) dans `initialiserJourneeVide` et `initialiserDepuisEdt`.

## Fichiers impactés

| Fichier | Nature |
|---|---|
| `src/app/services/sansEtat/eleve.service.ts` | Regroupement par élève dans `genererLibellesAbsencesDuJour` |
| `src/app/libelles.ts` | Nouveau texte de `cahierJournal.enteteAbsencesJour` |
| `src/app/services/sansEtat/eleve.service.spec.ts` | Tests mis à jour + nouveaux tests de tri/regroupement |
| `src/app/services/sansEtat/cahier-journal.service.spec.ts` | Assertions `notes` mises à jour |

## Vérification

1. `ng test` (couverture ≥ 80% sur `eleve.service.ts` et `cahier-journal.service.ts`).
2. `ng serve` : initialiser une journée avec un élève ayant plusieurs absences ce jour-là, contrôler visuellement le regroupement dans la note.
