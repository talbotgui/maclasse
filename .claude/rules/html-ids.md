---
globs: "**/*.html"
---

# IDs HTML — Règle d'identification

Tout `<button>`, `<input>`, `<select>` et `<textarea>` doit porter un attribut `id` en lowerCamelCase.

## Convention de nommage

- Préfixe `btn` pour les boutons : `id="btnEnregistrer"`, `id="btnAnnuler"`
- Nom du champ pour les inputs : `id="fichePrenom"`, `id="rechercheComp"`

## IDs dynamiques dans les boucles

Dans un `@for`, utiliser le binding `[id]` :
```html
[id]="'btnItem' + item.id"
[id]="'champNom' + $index"
```

## Unicité

Si un composant peut être instancié plusieurs fois simultanément (accordéon ouvert sur plusieurs panneaux), ajouter un suffixe contextuel via un `input()` nommé `contexteId`.

Mettre à jour `[for]` et `[attr.aria-*]` associés lors du renommage d'un ID.
