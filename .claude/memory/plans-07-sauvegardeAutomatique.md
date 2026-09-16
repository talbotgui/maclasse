---
name: plans-07-sauvegardeAutomatique
description: Plan d'évolution — sauvegarde automatique déclenchée après première sauvegarde ou chargement de ZIP, toutes les 5mn si une modification a été faite
metadata:
  type: project
  updated: 2026-09-16
related:
  - projet-05-services
  - projet-14-ecran-parametrage
  - projet-07-ecran-demarrage
  - projet-17-libelles
---

# Plan d'évolution — Sauvegarde automatique (C1)

## Contexte

`SauvegardeAutoService` existe déjà (timer, chiffrement, téléchargement du ZIP) mais son déclenchement est incomplet par rapport au besoin : *« après une première sauvegarde ou un chargement de fichier, toutes les 5mn, se déclenche une sauvegarde automatique si une modification a été faite »*. Aujourd'hui : (a) le timer ne démarre jamais au chargement d'un ZIP, seulement après la première sauvegarde manuelle ; (b) le tick du timer sauvegarde inconditionnellement, sans vérifier qu'une modification est en attente ; (c) le délai n'a pas de bornes et son défaut est 2 min au lieu de 5 ; (d) changer le délai en cours de session ne relance pas le timer actif.

## Décisions validées

| # | Question | Décision |
|---|---|---|
| 1 | Délai | Reste configurable (Paramétrage > Préférences), défaut changé de 2 à 5 minutes. |
| 2 | Bornes du délai | 1 à 60 minutes — aucune borne n'existait auparavant. |
| 3 | Flux déclenchant l'auto-save au chargement | Uniquement « Charger un ZIP existant » (mot de passe déjà connu à ce moment). Ni « Créer un nouveau fichier » ni « Accéder au référentiel » (mode consultation) ne déclenchent l'auto-save. |
| 4 | Changement du délai en session | Si un timer est déjà actif, il est relancé immédiatement avec le nouveau délai. |
| 5 | Validation des bornes | Reste cohérente avec le style Template-driven/`ngModel` déjà utilisé dans tout l'écran Paramétrage — migrer vers Reactive Forms est hors périmètre (dette technique préexistante, pas introduite par cette évolution). |

## Conception

### 1. `SauvegardeAutoService` — sauvegarde conditionnelle sur le tick automatique

Fichier : `src/app/services/sansEtat/sauvegarde-auto.service.ts`

- `sauvegarder()` (publique, inconditionnelle) n'est pas modifiée : elle reste utilisée telle quelle par `McEnteteComponent.surSauvegarder()`/`surConfirmationSauvegarde()` (le bouton SAUVEGARDER est déjà `disabled` quand `!aDonneesModifiees()`).
- Nouvelle méthode privée dédiée au tick du minuteur :
  ```ts
  private async sauvegarderSiModifie(): Promise<void> {
    if (!this.donneesService.aDonneesModifiees()) return;
    await this.sauvegarder();
  }
  ```
- Dans `demarrer()`, `setInterval(() => void this.sauvegarder(), ...)` devient `setInterval(() => void this.sauvegarderSiModifie(), ...)`.
- Défaut du délai : `?? 2` → `?? 5` (fallback de lecture de `configuration.delaiSauvegardeAutoMinutes`). JSDoc mis à jour en conséquence.

### 2. Démarrage de l'auto-save après chargement d'un ZIP existant

Fichier : `src/app/ecrans/demarrage/ecran-demarrage.component.ts`

- Injection de `SauvegardeAutoService`.
- Seule `surDemarrageTermine()` (flux « Charger ») appelle `this.sauvegardeAutoService.demarrer();`, après `chargerEtNaviguerAccueil(...)`. Ni `surCreationDemandee()` ni `surReferentielDemande()` ne sont modifiées.
- Pas d'appel à `sauvegarder()` avant `demarrer()` : `donneesService.charger()` remet déjà `aDonneesModifiees()` à `false`, rien à sauvegarder immédiatement.
- L'appel est placé dans `EcranDemarrageComponent` (déjà l'orchestrateur du chargement/navigation) plutôt que dans `PopinDemarrageComponent`, pour rester cohérent avec le pattern déjà en place dans `McEnteteComponent`.

### 3. Relance du timer si le délai change en cours de session

Fichier : `src/app/ecrans/parametrage/ecran-parametrage.component.ts`

- Injection de `SauvegardeAutoService`.
- Dans `enregistrerPreferences()`, après l'exécution de la `CommandeRemplacement`, si `this.sauvegardeAutoService.timerActif` est vrai, rappel de `this.sauvegardeAutoService.demarrer();` (le getter `timerActif` existe déjà).

### 4. Bornes 1-60 minutes sur le délai

- **`McInputComponent`** (`src/app/composants/mc-input/mc-input.component.ts` + `.html`) : deux `input()` optionnels `min`/`max` (`number | null`, défaut `null`), bindés en `[attr.min]`/`[attr.max]` sur le `<input>` natif — pattern cohérent avec `placeholder`/`required` déjà présents.
- **`EcranParametrageComponent`** :
  - `static readonly DELAI_SAUVEGARDE_MIN = 1;` et `DELAI_SAUVEGARDE_MAX = 60;`
  - `protected preferencesValides(): boolean` vérifiant que `formPreferences.delaiSauvegardeAutoMinutes` est dans les bornes.
  - `enregistrerPreferences()` : garde `if (!d || !this.preferencesValides()) return;`.
  - Template : `[min]="1" [max]="60"` sur le `mc-input`, bouton ENREGISTRER `[disabled]="!prefModifie || !prefValide"`, message d'erreur (`role="alert"`) si `!prefValide`.
  - Nouveau libellé `libelles.ts` (section `parametrage`) pour le message d'erreur.
- **Défaut 2 → 5** répercuté dans : `public/donnees-defaut.json`, JSDoc de `ConfigApplication.delaiSauvegardeAutoMinutes` (`modeles/donnees-application.modele.ts`), valeur initiale `formPreferences` dans `ecran-parametrage.component.ts`, `src/app/tests/donnees.mother.ts`. Contrôle après coup : `grep -rn "delaiSauvegardeAutoMinutes" src/app --include=*.spec.ts` pour repérer tout test dépendant implicitement de l'ancien défaut 2.

## Tests

- `sauvegarde-auto.service.spec.ts` : nouveau `describe` avec `vi.useFakeTimers()`/`vi.useRealTimers()` isolé des tests existants — deux branches de `sauvegarderSiModifie` (pas de sauvegarde si non modifié ; sauvegarde + remise à `false` de `aDonneesModifiees()` si modifié via une vraie commande `donneesService.executer(...)`), plus un test de non-répétition sur un second tick sans nouvelle modification. `service.arreter()` en `afterEach`.
- `ecran-parametrage.component.spec.ts` : `describe('preferencesValides', ...)` avec un test par borne (1 valide, 60 valide, 0 invalide, 61 invalide) ; test que `enregistrerPreferences()` ne modifie pas le store si hors bornes ; `describe` sur la relance du timer (inactif → `demarrer()` non rappelé ; actif → `demarrer()` rappelé), via `vi.spyOn` sans `.mockImplementation`. `sauvegardeAutoService.arreter()` en `afterEach`.
- `ecran-demarrage.component.spec.ts` : `surDemarrageTermine` démarre le timer (`timerActif === true`) ; `surCreationDemandee`/`surReferentielDemande` ne le démarrent pas (`timerActif === false`) — émission ET non-émission couvertes. `arreter()` en `afterEach`.
- `mc-input.component.spec.ts` : `min`/`max` rendus comme attributs natifs quand fournis, absents sinon.

## Fichiers impactés

| Fichier | Nature |
|---|---|
| `src/app/services/sansEtat/sauvegarde-auto.service.ts` | Méthode privée `sauvegarderSiModifie`, défaut délai 5 |
| `src/app/ecrans/demarrage/ecran-demarrage.component.ts` | Démarrage auto-save dans `surDemarrageTermine` |
| `src/app/ecrans/parametrage/ecran-parametrage.component.ts` + `.html` | Bornes, validation, relance du timer |
| `src/app/composants/mc-input/mc-input.component.ts` + `.html` | Inputs `min`/`max` |
| `src/app/libelles.ts` | Libellé message d'erreur bornes |
| `src/app/modeles/donnees-application.modele.ts` | JSDoc défaut délai |
| `public/donnees-defaut.json` | Défaut 2 → 5 |
| `src/app/tests/donnees.mother.ts` | Défaut 2 → 5 |
| `src/app/services/sansEtat/sauvegarde-auto.service.spec.ts` | Nouveaux tests |
| `src/app/ecrans/parametrage/ecran-parametrage.component.spec.ts` | Nouveaux tests |
| `src/app/ecrans/demarrage/ecran-demarrage.component.spec.ts` | Nouveaux tests |
| `src/app/composants/mc-input/mc-input.component.spec.ts` | Nouveaux tests |

## Séquencement recommandé

1. `SauvegardeAutoService` + tests.
2. `McInputComponent` (min/max) + tests.
3. `EcranParametrageComponent`/`.html` + `libelles.ts` + tests.
4. `EcranDemarrageComponent` + tests.
5. Défauts 2→5 partout, puis grep de contrôle et `ng test` complet (couverture 80%).

## Vérification

1. `ng test` — couverture ≥80% (lignes/branches/fonctions/statements) sur l'ensemble des services, en particulier `SauvegardeAutoService`.
2. `ng serve` : charger un ZIP existant → vérifier que le téléchargement automatique se déclenche après le délai configuré uniquement si une modification a été faite ; modifier le délai dans Paramétrage pendant qu'un timer tourne et vérifier qu'il est bien relancé ; saisir 0 ou 61 dans le champ délai et vérifier le blocage du bouton ENREGISTRER avec message d'erreur.
