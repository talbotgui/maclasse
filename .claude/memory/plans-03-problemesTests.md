---
name: plans-03-problemesTests
description: Inventaire des incohérences dans les tests automatisés — faux positifs, anti-patterns, gaps de couverture
metadata:
  type: project
---

# Problèmes identifiés dans les tests automatisés

Analyse complète des 49 fichiers `.spec.ts` (services + composants + directives).
Chaque entrée indique le fichier, les lignes concernées et le risque concret.

---

## CAT-1 CRITIQUE — Anti-pattern `.subscribe()` sur les outputs Angular (25 occurrences, 8 fichiers)

**Règle violée :** `tests.md` — `OutputEmitterRef.subscribe()` ne déclenche jamais les callbacks hors contexte d'injection ; utiliser exclusivement `vi.spyOn((component as any).output, 'emit')`.

**Pattern correct :**
```typescript
const spy = vi.spyOn((component as any).monOutput, 'emit');
component['methodeQuiEmet']();
expect(spy).toHaveBeenCalledWith(valeurAttendue);
```

**Fichiers et lignes :**

| Fichier | Lignes `.subscribe()` | Tests "n'émet pas" — faux positif potentiel |
|---|---|---|
| `src/app/composants/mc-champ-recherche/mc-champ-recherche.component.spec.ts` | 34, 43, 72, 81, 91, 111, 130 | L70-76 : "n'émet pas avant le délai" ; L128-137 : "pas d'émission tardive après destroy" |
| `src/app/composants/mc-mini-calendrier/mc-mini-calendrier.component.spec.ts` | 222, 233, 246 | L219-228 : "clic samedi n'émet rien" ; L230-240 : "clic jour férié n'émet rien" |
| `src/app/composants/popins/popin-demarrage/popin-demarrage.component.spec.ts` | 36, 75, 91, 102, 118 | L72-81 : "appel pendant enChargement → ignoré" ; L87-95 : "sans fichier → ne fait rien" ; L98-106 : "sans mdp → ne fait rien" |
| `src/app/composants/popins/popin-export-competences/popin-export-competences.component.spec.ts` | 156, 170 | L168-175 : "peutConfirmer=false → n'émet pas" |
| `src/app/ecrans/cahier-journal/cj-formulaire-seance/cj-formulaire-seance.component.spec.ts` | 105, 125 | aucun test "n'émet pas" — mais subscribe ne notifie pas → tests qui **attendent une valeur** échouent silencieusement |
| `src/app/ecrans/eleves/fe-formulaire-eleve/fe-formulaire-eleve.component.spec.ts` | 175 | L172-182 : attend `emis.length === 1` → pourrait passer vacuitement si subscribe ne déclenche pas |
| `src/app/ecrans/projets/fp-formulaire-projet/fp-formulaire-projet.component.spec.ts` | 133 | L130-140 : attend `emis.length === 1` — même risque |
| `src/app/ecrans/emploi-du-temps/edt-formulaire/edt-formulaire.component.spec.ts` | 157, 171, 186, 200 | L166-176 : "n'émet pas si formEdt=null" ; L195-206 : "n'émet pas si formCreneau=null" |

**Impact :** les tests de type "l'output N'est PAS émis" passent vacuitement → un bug d'émission parasite (ex. debounce ignoré, garde de formulaire null absente) ne serait jamais détecté.

---

## CAT-2 MAJEUR ✅ RÉSOLU (2026-06-21) — Tests tautologiques d'outputs (emit direct, 2 fichiers)

**Cause racine :** double violation — les templates appelaient `modifier.emit()` directement (violation `angular-typescript.md`) ET les tests appelaient `(component as any).modifier.emit()` directement (tautologie `tests.md`). Les méthodes `onModifier/onSupprimer/onImprimer` n'existaient pas dans les composants.

**Correction appliquée :**
- `fe-fiche-eleve.component.ts` et `fp-fiche-projet.component.ts` : ajout de `onModifier()`, `onSupprimer()`, `onImprimer()`
- Templates : `(click)="modifier.emit()"` → `(click)="onModifier()"` (× 2 composants × 3 outputs)
- Specs : `(component as any).modifier.emit()` → `component['onModifier']()` (× 2 fichiers × 3 tests)
- Règles `angular-typescript.md` et `tests.md` complétées avec la convention `onXxx()`

---

## CAT-3 MAJEUR ✅ RÉSOLU (2026-06-21) — Branche non couverte dans `referentiel.service.spec.ts`

**Correction appliquée :** ajout du test `'retourne true si groupe utilisé dans un créneau EDT'` dans le `describe('estGroupeUtilise')` + import de `EdtMother, CreneauMother`. La branche `d.emploisDuTemps.some(edt => edt.creneaux.some(c => c.elevesConcernes?.groupes.includes(id)))` est désormais couverte.

---

## CAT-4 MODÉRÉ — Mocks de services réels dans `mc-entete.component.spec.ts`

**Fichier :** `src/app/composants/mc-entete/mc-entete.component.spec.ts`

**Lignes concernées :**
- L49 : `vi.spyOn(sauvegardeAutoService, 'sauvegarder').mockResolvedValue(undefined)`
- L61-62 : `vi.spyOn(sauvegardeAutoService, 'demarrer').mockImplementation(() => {})`
- L79-80 : identique à L61-62
- L101 : `vi.spyOn(sauvegardeAutoService, 'sauvegarder').mockResolvedValue(undefined)` (répété)
- L110 : `vi.spyOn(rechercheGlobaleService, 'rechercher').mockReturnValue([RechercheGlobaleService.FIN_DES_RESULTATS])`

**Règle :** `tests.md` — "Jamais de mocks — instancier ou injecter les dépendances réellement."

**Nuance :** le mock de `sauvegarder` peut se justifier (opération de chiffrement+téléchargement réel non souhaitable en test). Le mock de `rechercher` est plus discutable : `RechercheGlobaleService` est injectable sans effets de bord.

**Impact :** si `sauvegarder` ou `rechercher` changent de signature ou de comportement, les tests de l'entête ne le détecteront pas.

---

## CAT-5 MODÉRÉ — Tests trop faibles sur `dateFormatee`

**Fichier 1 :** `src/app/ecrans/cahier-journal/ecran-cahier-journal.component.spec.ts` — ligne 249
```typescript
expect((component as any).dateFormatee()).toBeTruthy();
```
Vérifie seulement non-vide/non-falsy. Un retour `"undefined"` ou un format anglais `"6/20/2026"` passerait.

**Fichier 2 :** `src/app/ecrans/accueil/ecran-accueil.component.spec.ts` — lignes 136-138
```typescript
expect((component as any).dateFormatee()).toBeTruthy();
expect(typeof (component as any).dateFormatee()).toBe('string');
```
Même constat : `"undefined"` est falsy mais `String(undefined)` vaut `"undefined"` qui est truthy.

**Correction attendue :** vérifier le format réel, ex. `expect(result).toMatch(/^\w+ \d{1,2} \w+ \d{4}$/)` ou une valeur fixe via une date mockée.

---

## CAT-6 MINEUR — Code mort dans `mc-badge-statut.component.spec.ts`

**Fichier :** `src/app/composants/mc-badge-statut/mc-badge-statut.component.spec.ts` — ligne 21

```typescript
const badge = fixture.debugElement.query(By.css('[class*="badge"]')) ?? By.css('span');
```

`By.css(...)` retourne une fonction (jamais `null`/`undefined`), donc `??` prend toujours l'opérande gauche. La fallback `By.css('span')` est du code mort. Par ailleurs, la variable `badge` ne semble pas utilisée dans les assertions qui suivent.

---

## CAT-7 MINEUR — Commentaires de bug obsolètes dans `mc-mini-calendrier.component.spec.ts`

**Fichier :** `src/app/composants/mc-mini-calendrier/mc-mini-calendrier.component.spec.ts`

**Commentaire 1** — lignes 117-120 (describe "en-têtes de colonnes") :
> "BUG : LIBELLES.dates.initialeJours est indexé dimanche-en-premier ['D','L','M','M','J','V','S'] mais la grille est lundi-en-premier. Les en-têtes affichent D en colonne 1."

**Réalité :** `mc-mini-calendrier.component.ts` ligne 23 déclare `private static readonly ENTETES_COLONNES = ['L', 'M', 'M', 'J', 'V', 'S', 'D']`. Le composant n'utilise pas `LIBELLES.dates.initialeJours` pour les en-têtes. Bug décrit = inexistant.

**Commentaire 2** — lignes 193-196 et 205-207 (describe "navigation — clic") :
> "BUG : l'effect lit this.moisAffiche() et crée une dépendance. Fix attendu : untracked."

**Réalité :** `mc-mini-calendrier.component.ts` ligne 133 utilise déjà `untracked(() => this.moisAffiche())`. Le fix a été appliqué. Le commentaire devrait être retiré.

---

## Récapitulatif prioritaire

| # | Catégorie | Sévérité | Fichiers touchés | Action |
|---|---|---|---|---|
| 1 | `.subscribe()` interdit | CRITIQUE | 8 fichiers, 25 occurrences | Remplacer par `vi.spyOn(..., 'emit')` |
| 2 | Tests tautologiques emit direct | ~~MAJEUR~~ ✅ RÉSOLU | `fe-fiche-eleve.spec.ts`, `fp-fiche-projet.spec.ts` | Méthodes `onXxx()` ajoutées, templates + specs corrigés |
| 3 | Branche EDT non couverte | ~~MAJEUR~~ ✅ RÉSOLU | `referentiel.service.spec.ts` | Test `EstGroupeUtilise` + EDT ajouté |
| 4 | Mocks de services réels | MODÉRÉ | `mc-entete.component.spec.ts` | Évaluer si contournable |
| 5 | Tests dateFormatee trop faibles | MODÉRÉ | `ecran-accueil.spec.ts`, `ecran-cahier-journal.spec.ts` | Assertion de format précis |
| 6 | Commentaires de bug obsolètes | MINEUR | `mc-mini-calendrier.component.spec.ts` | Supprimer les commentaires |
| 7 | Code mort `??` sur fonction | MINEUR | `mc-badge-statut.component.spec.ts` | Supprimer la fallback |
