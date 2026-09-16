---
name: plans-08-conflitEdtParite
description: Plan de correction — bug de détection de conflit EDT ignorant la parité de semaine entre un créneau et une absence récurrente
metadata:
  type: project
  updated: 2026-09-16
related:
  - projet-12-ecran-emploi-du-temps
  - projet-02-modelesDonnees
  - plans-05-cahierJournalAbsencesNotes
---

# Plan de correction — Bug conflit EDT / parité de semaine ignorée (D)

## Contexte

La détection de conflit dans l'emploi du temps remonte un conflit entre un créneau en semaine paire et une absence récurrente en semaine impaire. **Confirmé par exploration du code** : `EmploiDuTempsService.calculerConflitsAbsences` compare uniquement le jour et le chevauchement horaire, en ignorant complètement la parité de semaine — le bug est même documenté comme limitation connue dans le JSDoc actuel de la méthode. Une fonction de comparaison de parité (`verifierCompatibiliteFrequences`) existe déjà dans le même service et est utilisée par la méthode sœur `validerChevauchement` (conflits entre deux EDT), mais jamais par `calculerConflitsAbsences` (conflits EDT/absence récurrente).

Le modèle de données porte déjà toute l'information nécessaire : `EmploiDuTemps.frequence` et `AbsenceRecurrente.paritesSemaine`, tous deux typés `FrequenceSemaine` (`'paire' | 'impaire' | 'lesDeux'`).

## Décisions validées

| # | Question | Décision |
|---|---|---|
| 1 | Existence du bug | Confirmée par lecture du code et du JSDoc existant de `calculerConflitsAbsences`. |
| 2 | Correctif | Réutiliser la méthode privée `verifierCompatibiliteFrequences` déjà existante, sans créer de nouvelle logique de comparaison. |

## Conception

Fichier : `src/app/services/sansEtat/emploi-du-temps.service.ts`, méthode `calculerConflitsAbsences` (lignes 193-238).

- Conserver la référence à l'EDT contenant le créneau trouvé (actuellement perdue après la boucle `for (const edt of donnees.emploisDuTemps)` — seul `creneau` est gardé). Capturer aussi l'EDT parent :
  ```ts
  let creneau: CreneauEdt | undefined;
  let edtTrouve: EmploiDuTemps | undefined;
  for (const edt of donnees.emploisDuTemps) {
    creneau = edt.creneaux.find((c) => c.id === creneauId);
    if (creneau) { edtTrouve = edt; break; }
  }
  if (!creneau || !edtTrouve) return [];
  ```
- Dans la boucle sur `eleve.absencesRecurrentes`, ajouter la condition de compatibilité de parité :
  ```ts
  if (
    abs.jour === creneauTrouve.jour &&
    this.verifierCompatibiliteFrequences(edtTrouve.frequence, abs.paritesSemaine) &&
    DateUtils.chevauchementHoraire(
      abs.heureDebut,
      abs.heureFin,
      creneauTrouve.heureDebut,
      creneauTrouve.heureFin,
    )
  ) { ... }
  ```
- Mettre à jour le JSDoc de la méthode : retirer la mention actuelle qui documente l'absence de prise en compte de la parité comme limitation connue.

## Tests

Dans `emploi-du-temps.service.spec.ts`, `describe('calculerConflitsAbsences', ...)` : tous les cas existants utilisent `paritesSemaine: 'lesDeux'` et ne couvrent pas ce scénario. Un test par branche (`tests-code.md`) :

- EDT `frequence: 'paire'` + absence `paritesSemaine: 'impaire'`, même jour/horaire → **aucun conflit retourné** (cas du bug signalé).
- EDT `frequence: 'paire'` + absence `paritesSemaine: 'paire'`, même jour/horaire → conflit détecté (non-régression).
- EDT `frequence: 'impaire'` + absence `paritesSemaine: 'lesDeux'`, même jour/horaire → conflit détecté (`lesDeux` compatible avec tout).

## Fichiers impactés

| Fichier | Nature |
|---|---|
| `src/app/services/sansEtat/emploi-du-temps.service.ts` | Correction `calculerConflitsAbsences`, JSDoc |
| `src/app/services/sansEtat/emploi-du-temps.service.spec.ts` | Nouveaux tests parité |

## Vérification

1. `ng test` — couverture ≥80% maintenue sur `EmploiDuTempsService`.
2. `ng serve` : créer un EDT en fréquence paire avec un créneau, ajouter une absence récurrente d'un élève concerné en fréquence impaire sur le même jour/horaire → vérifier qu'aucun conflit n'est remonté ; refaire avec la même parité → conflit bien remonté.
