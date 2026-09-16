---
name: plans-09-edtTitreListeEdt
description: Plan d'évolution — titre "Mes emplois du temps" au-dessus de la liste des EDT existante, en préparation de la future liste des emplois du temps calculés
metadata:
  type: project
  updated: 2026-09-16
related:
  - projet-12-ecran-emploi-du-temps
  - projet-17-libelles
  - plans-12-edtEmploisCalcules
---

# Plan d'évolution — Titre "Mes emplois du temps" (B2)

## Contexte

La colonne gauche de l'écran emploi du temps affiche aujourd'hui un `<h1>` "Emploi du temps" (titre d'écran) suivi directement de la liste des EDT, sans titre de section propre à cette liste. Objectif : ajouter un titre "Mes emplois du temps" au-dessus de la liste existante. Cette évolution est volontairement conçue pour anticiper `plans-12-edtEmploisCalcules.md` (B3), qui ajoutera une seconde liste ("Emplois du temps calculés") juste en dessous — la structure de titres doit donc rester extensible dès ce lot.

## Conception

Fichier : `src/app/ecrans/emploi-du-temps/ecran-emploi-du-temps.component.html`.

- Ajouter `<h2 class="edt__titre-section">{{ LIBELLES.edt.titreListeEdt }}</h2>` dans `.edt__gauche`, juste après `.edt__gauche-entete` (qui contient déjà le `<h1 class="edt__titre-ecran">` + bouton CRÉER) et avant le `@if (edts().length === 0)`/`<ul class="edt__liste">`. Le titre s'affiche aussi bien sur liste vide que remplie.
- Utiliser une classe générique `edt__titre-section` (pas `edt__titre-liste-edt`) pour que `plans-12-edtEmploisCalcules.md` puisse réutiliser exactement la même classe pour son propre titre "Emplois du temps calculés", sans dupliquer de règle CSS.
- RGAA : `<h1>` déjà présent = titre d'écran, ce nouveau `<h2>` respecte la hiérarchie sans saut de niveau.

Fichier : `src/app/libelles.ts`, section `edt` : ajouter `titreListeEdt: 'Mes emplois du temps'`.

Fichier : `src/app/ecrans/emploi-du-temps/ecran-emploi-du-temps.component.scss` : règle minimale pour `.edt__titre-section` (espacement cohérent avec le reste de la colonne gauche).

## Tests

- `ecran-emploi-du-temps.component.spec.ts` : test de présence du texte du titre dans le DOM rendu (liste vide et liste remplie).

## Fichiers impactés

| Fichier | Nature |
|---|---|
| `src/app/ecrans/emploi-du-temps/ecran-emploi-du-temps.component.html` | Ajout du titre de section |
| `src/app/ecrans/emploi-du-temps/ecran-emploi-du-temps.component.scss` | Classe `edt__titre-section` |
| `src/app/libelles.ts` | Clé `edt.titreListeEdt` |
| `src/app/ecrans/emploi-du-temps/ecran-emploi-du-temps.component.spec.ts` | Nouveau test |

## Vérification

1. `ng test`.
2. `ng serve` : contrôle visuel + contrôle AXE (hiérarchie de titres `<h1>`/`<h2>`).
