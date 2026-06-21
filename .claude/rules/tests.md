---
globs: "**/*.spec.ts"
---

# Tests unitaires — Conventions

## Framework et instanciation

Vitest pour tous les tests de services.

- Service **sans `inject()`** dans le corps → instanciation directe `new MonService()`
- Service **avec `inject()`** → `TestBed.configureTestingModule({})` + `TestBed.inject(MonService)`

**Jamais de mocks** — instancier ou injecter les dépendances réellement.

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

## Composants avec `<dialog>`

Tout spec d'un composant contenant un `<dialog>` — directement ou via un composant enfant (`popin-*`) — doit déclarer en `beforeAll` :

```typescript
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});
```

Sans ce mock, tout `fixture.detectChanges()` qui rend la dialog visible (`[visible]="true"`) lève `TypeError: el.showModal is not a function`.

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
