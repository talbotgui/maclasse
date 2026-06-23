---
globs: "e2e/**/*.spec.ts"
---

# Tests End to End (E2E) — Conventions

## Tests E2E — Navigation avec `page.goto()`

`page.goto()` en Playwright est une **navigation HTTP complète** (équivalent à saisir l'URL dans la barre d'adresse). Elle recharge l'application Angular depuis zéro, effaçant toutes les données en mémoire (`DonneesService`). Après un rechargement vers un écran protégé, la `donneesChargeesGarde` redirige vers `/demarrage` — les sélecteurs de l'écran cible ne sont jamais rendus, et les locators timeout.

**Règle :** dans les tests utilisant `testAvecDonnees`, ne jamais appeler `page.goto()` vers un écran protégé. Naviguer via les liens Angular (SPA navigation) :

```typescript
// ❌ INTERDIT — reload HTTP, données perdues, garde redirige vers /demarrage
await appAvecDonnees.goto('/eleves');

// ✅ CORRECT — navigation SPA, données conservées en mémoire
await entete.navEleves.click();
```

Cas légitimes de `page.goto()` :
- Dans les **fixtures** pour démarrer l'application depuis zéro (`goto('/demarrage')`)
- Dans les **tests de la garde** qui vérifient précisément le comportement de redirection (ex. E2E-01)
- La fixture `testAvecDonnees` démarre déjà à `/accueil` : inutile d'appeler `goto('/accueil')` dans le corps du test

## Tests E2E — Classes de sélecteurs Playwright

Les classes de sélecteurs dans `e2e/selecteurs/` suivent des règles strictes :

- Tout sélecteur est une propriété `readonly` de la classe, ciblant un `id` HTML ou une classe CSS stable.
- **Aucune méthode ne doit accepter de paramètre.** Un sélecteur paramétré dans un test est une règle cassée : l'extraire comme propriété fixe de la classe.
- Un appel inline (`page.getByRole(...)`, `page.locator(...)`) dans un fichier `*.spec.ts` est interdit : le déplacer dans la classe de sélecteurs correspondante.

```typescript
// ❌ INTERDIT — paramètre dans la méthode de sélecteur
boutonEleveParNom(nom: RegExp): Locator {
  return this.listeEleves.getByRole('button', { name: nom });
}

// ❌ INTERDIT — sélecteur inline dans le test
const btn = page.locator('button').filter({ hasText: /^\+$/ }).first();

// ✅ CORRECT — propriété readonly fixe
readonly btnAjouterSeance: Locator = page.locator('#btnAjouterSeance');
```

Ne jamais calculer dynamiquement l'index d'un élément de formulaire dans un test E2E. Utiliser toujours un index littéral fixe.

**Why:** Le jeu de données de test est fixe et immuable (`maclasse-test.zip`). Le nombre d'éléments dans chaque section (contacts, absences récurrentes, absences ponctuelles…) est connu à l'avance. Calculer `count() - 1` est inutile, plus fragile à lire, et viole la règle « aucune logique dans les sélecteurs ».

**How to apply:** Quand un test ajoute un élément puis doit interagir avec lui, cibler directement l'index connu (ex. `0` si la section est vide au départ, `1` si un élément pré-existait dans les données fixture). Utiliser `.nth(n)` sur le locator, ou l'index littéral directement dans le sélecteur `[id]`.

```typescript
// ❌ INTERDIT — index calculé dynamiquement
const indexContact = await appAvecDonnees.locator('[id^="champContactNom"]').count() - 1;
await appAvecDonnees.locator(`#champContactNom${indexContact} input`).fill('René');

// ✅ CORRECT — index fixe connu grâce au jeu de données figé
await appAvecDonnees.locator('#champContactNom0 input').fill('René');
```
