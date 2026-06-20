---
globs: "**/*.ts"
---

# JSDoc — Documentation obligatoire

Toute classe, interface, type exporté, champ (public, protégé ET privé), propriété, constante exportée et méthode doit porter une JSDoc rédigée. Jamais de JSDoc vide (`/** */`).

## Format

- Membres simples : `/** Description courte. */`
- Classes, interfaces, méthodes complexes : bloc multi-lignes
- `@param nomParam Description.` pour chaque paramètre
- `@returns Description.` dès que le retour n'est pas `void`
- `@throws NomErreur Condition.` si une erreur peut être levée

## Ce qui est couvert

- Classes et interfaces
- Champs `public`, `protected` et `private`
- Constantes exportées (`export const`) — décrire leur rôle et contenu
- Toutes les méthodes, y compris privées
