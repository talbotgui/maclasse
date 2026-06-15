---
name: feedback-07-html
description: Tout bouton et tout champ de saisie doit avoir un attribut id en lowerCamelCase
metadata:
  type: feedback
  updated: 2026-06-05
related:
  - projet-04-composantsPartages
---

## Règle 1 - ID

Tout `<button>`, `<input>`, `<select>` et `<textarea>` doit porter un attribut `id` en lowerCamelCase.

**Why:** Les IDs permettent de cibler les éléments sans fragile dépendance aux classes CSS ou au contenu textuel, notamment dans `test-console.js` et pour les tests automatisés en général.

**How to apply:**
- IDs statiques pour les singletons : `id="btnEnregistrer"`, `id="rechercheEleves"`
- IDs dynamiques avec `[id]` pour les boucles `@for` : `[id]="'btnItem' + item.id"` ou `[id]="'champNom' + $index"`
- Convention : préfixe sémantique selon le type — `btn` pour les boutons, nom du champ pour les inputs (`fichePrenom`, `rechercheComp`, etc.)
- Unicité obligatoire : si un composant peut être instancié plusieurs fois simultanément (ex. accordéon ouvert sur plusieurs panneaux), utiliser un suffixe contextuel via un `input()` `contexteId`
- Mettre à jour `[for]` et `[attr.aria-*]` associés lors du renommage d'un ID
