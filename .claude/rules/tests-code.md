---
globs: "src/**/*.spec.ts"
---

# Tests unitaires — Conventions

## Framework et instanciation

Vitest pour tous les tests de services.

- Service **sans `inject()`** dans le corps → instanciation directe `new MonService()`
- Service **avec `inject()`** → `TestBed.configureTestingModule({})` + `TestBed.inject(MonService)`

**Jamais de mocks** — instancier ou injecter les dépendances réellement.

**Exception unique — APIs navigateur absentes de jsdom :** une méthode qui appelle `URL.createObjectURL`, déclenche un téléchargement (`<a>.click()`), ou utilise `SubtleCrypto` ne peut pas s'exécuter dans jsdom. Mocker *uniquement cette méthode* est alors justifié. Ne jamais mocker le service entier ni une méthode sans effet de bord.

## Structure

```typescript
describe('MonService', () => {
  let service: MonService;

  beforeEach(() => {
    service = new MonService(); // ou TestBed
  });

  describe('fonctionnalité X', () => {
    it('cas nominal', () => { ... });
    it('cas limite', () => { ... });
  });
});
```

`describe` par fonctionnalité (pas par méthode). Un `beforeEach` recrée une instance fraîche.

## Imports habituels

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
```

## Ce qui est testé

- **Tester tous les services** à plus de 80% de couverture de code (lignes, branches, fonctions, statements).
- **Tester tous les composants Angular** sur leurs fonctionnalités.

## Couverture minimale

80% minimum sur les quatre métriques (lignes, branches, fonctions, statements) sur l'ensemble des services.
Lancer `ng test` (la couverture est activée par défaut dans `angular.json`) et corriger avant de passer à l'étape suivante si une métrique est sous le seuil.

Fichiers exclus de la couverture (configurés dans `angular.json`) : `modeles/`, `gardes/`, `libelles.ts`, `composant-base.ts`, `app.ts`, `**/*.html`.
Les templates HTML sont exclus car Angular les compile en fonctions JavaScript internes non testables unitairement via V8 coverage.

## Couverture des branches dans les expressions `||` / `&&`

Toute méthode contenant une expression `||` ou `&&` multi-branches doit avoir un test dédié pour chaque branche, dans lequel **seule** cette branche est vraie — les autres sources de données restant vides.

Piège fréquent : `DonneesMother.base()` initialise les tableaux à `[]`. Si un test pousse une donnée dans `cahierJournal` mais laisse `emploisDuTemps = []`, la branche EDT ne sera jamais atteinte même si le test passe.

```typescript
// ✅ Un test par branche — chaque branche est isolée
it('retourne true via la branche élève', () => { /* ne peuple QUE eleves */ });
it('retourne true via la branche EDT',   () => { /* ne peuple QUE emploisDuTemps */ });
it('retourne true via la branche CJ',    () => { /* ne peuple QUE cahierJournal */ });
```

## Tester les outputs Angular

`OutputEmitterRef.subscribe()` ne déclenche pas les callbacks hors contexte d'injection — ne jamais l'utiliser dans les tests.
Interdire aussi le tableau intermédiaire `const emis: T[] = []` combiné à `.subscribe()`.

Patterns obligatoires selon le cas :

```typescript
// ✅ Output émis avec une valeur simple
const spy = vi.spyOn((component as any).monOutput, 'emit');
component['methodeQuiEmet']();
expect(spy).toHaveBeenCalledWith(valeurAttendue);

// ✅ Output émis : vérifier le payload avec plusieurs assertions
const spy = vi.spyOn((component as any).monOutput, 'emit');
component['methodeQuiEmet']();
expect(spy).toHaveBeenCalledTimes(1);
const emis = spy.mock.calls[0][0] as MonType;
expect(emis.champ).toBe('valeur');
expect(emis).not.toBe(objetOriginal); // clone

// ✅ Output N'est PAS émis (garde, condition false…)
const spy = vi.spyOn((component as any).monOutput, 'emit');
component['methodeAvecGarde']();
expect(spy).not.toHaveBeenCalled();

// ✅ Vérifier la DERNIÈRE émission quand une action préalable émet déjà
const spy = vi.spyOn((component as any).monOutput, 'emit');
component['actionPrelim']();          // émet une 1re fois
component['reinitialiser']();         // émet une 2e fois avec ''
expect(spy).toHaveBeenLastCalledWith('');

// ❌ INTERDIT — le callback n'est jamais déclenché
(component as any).monOutput.subscribe((v) => emis.push(v));

// ❌ INTERDIT — appel direct à emit() depuis le test (tautologie)
(component as any).monOutput.emit();
expect(spy).toHaveBeenCalled(); // toujours vrai, ne teste rien

// ✅ CORRECT — appeler la méthode onXxx() du composant (voir angular-typescript.md)
const spy = vi.spyOn((component as any).monOutput, 'emit');
component['onMonOutput']();
expect(spy).toHaveBeenCalled();
```

Corollaire : tester un output suppose toujours qu'il est émis via la méthode `onXxx()` du composant, jamais via un appel direct à `emit()` depuis le test. La convention de nommage `onXxx()` est définie dans `angular-typescript.md`.

## Services sans effets de bord

Un service qui lit des données et retourne un résultat (lecture pure) ne doit jamais être mocké, même si le test vise un comportement conditionnel. Charger les données adéquates dans le `beforeEach` via les Object Mothers suffit.

```typescript
// ❌ INTERDIT — service pur, aucun effet de bord, mock inutile
vi.spyOn(rechercheGlobaleService, 'rechercher').mockReturnValue([...]);

// ✅ CORRECT — les données réelles produisent le résultat attendu
donneesService.charger(DonneesMother.base({
  classe: { eleves: [EleveMother.base('e1', 'MARTIN', 'Alice')] },
}));
component['surRecherche']('Martin'); // retourne l'élève depuis les données réelles
```

## Nettoyage des timers — afterEach

Quand un test appelle réellement une méthode de service qui démarre un `setInterval` ou `setTimeout`, arrêter le timer en `afterEach`. Les services singleton (`providedIn: 'root'`) survivent entre les tests du même `describe` ; un timer actif peut déclencher des effets de bord dans les tests suivants.

```typescript
afterEach(() => {
  sauvegardeAutoService.arreter();
});
```

Ne jamais mocker la méthode de démarrage (`demarrer()`) pour contourner ce problème — annuler le timer dans `afterEach` est la bonne approche. Le spy sans `.mockImplementation` permet de vérifier l'appel tout en laissant la méthode s'exécuter réellement.

```typescript
// ❌ INTERDIT — masque l'exécution réelle pour éviter le timer
const spyDemarrer = vi.spyOn(sauvegardeAutoService, 'demarrer').mockImplementation(() => {});

// ✅ CORRECT — spy observateur uniquement, timer nettoyé en afterEach
const spyDemarrer = vi.spyOn(sauvegardeAutoService, 'demarrer');
```

## Composants avec `<dialog>`

Tout spec d'un composant contenant un `<dialog>` — directement ou via un composant enfant (`popin-*`) — doit déclarer en `beforeAll` :

```typescript
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});
```

Sans ce mock, tout `fixture.detectChanges()` qui rend la dialog visible (`[visible]="true"`) lève `TypeError: el.showModal is not a function`.

## Assertions sur les chaînes formatées

`toBeTruthy()` et `typeof x === 'string'` sont insuffisants pour tester une valeur textuelle :
- `"undefined"` est truthy
- `String(undefined)` vaut `"undefined"`, dont `typeof` est `'string'`

Ces assertions passent même si la méthode est cassée.

**Règle :** toujours asserter la valeur exacte attendue. Quand la valeur est calculée par un utilitaire, utiliser ce même utilitaire pour produire la valeur de référence dans le test.

```typescript
// ❌ INTERDIT — passe même si la méthode retourne "undefined" ou "06/15/2026"
expect((component as any).dateFormatee()).toBeTruthy();
expect(typeof (component as any).dateFormatee()).toBe('string');

// ✅ CORRECT — date fixe connue → valeur exacte
expect((component as any).dateFormatee()).toBe(DateUtils.formaterDateLong(dateTest));

// ✅ CORRECT — date dynamique → calculer la référence avec le même utilitaire
expect((component as any).dateFormatee).toBe(DateUtils.formaterDateLong(dateAujourdhui));
```

## Pattern Object Mother

Toute donnée de test réutilisée dans plus d'un test doit passer par un Object Mother dans `src/app/tests/`.
Interdire les fonctions `creerXxx()` ou constantes de module dans les spec files.

```typescript
// Fichiers existants dans src/app/tests/
// donnees.mother.ts      → DonneesMother.base()
// eleve.mother.ts        → EleveMother.base(id, nom, prenom, surcharge?)
// competence.mother.ts   → CompetenceMother.arbreSimple()
// emploi-du-temps.mother.ts → EdtMother.base(), CreneauMother.lundi9h10()
// cahier-journal.mother.ts  → SeanceMother.pedagogique(), SeanceMother.recreation()
// projet.mother.ts       → ProjetMother.base(), PeriodeMother.base()

// Surcharge via Partial<T>
service.creerEdt(EdtMother.base({ frequence: 'paire' }));
```

Nouveau type testé → créer `src/app/tests/<domaine>.mother.ts` avant d'écrire les tests.
