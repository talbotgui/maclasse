---
name: plans-06-cahierJournalPastillesElevesConcernes
description: Plan d'évolution — pastilles statiques (groupe/élève/tous) affichant les élèves concernés dans chaque cadre TEMPS du cahier journal et de l'emploi du temps
metadata:
  type: project
  updated: 2026-09-16
related:
  - projet-13-ecran-cahier-journal
  - projet-12-ecran-emploi-du-temps
  - projet-04-composantsPartages
  - projet-17-libelles
  - plans-05-cahierJournalAbsencesNotes
---

# Plan d'évolution — Pastilles élèves/groupes dans les cadres TEMPS (A2)

## Contexte

`Seance.elevesConcernes` et `CreneauEdt.elevesConcernes` (type `ElevesConcernes` : `'classe' | 'groupes' | 'eleves'`) sont déjà saisis via `<mc-eleves-concernes>` dans les formulaires de séance et de créneau, mais **jamais affichés** dans le cadre séance du cahier journal ni dans la grille EDT. Objectif : afficher, dans chaque cadre "TEMPS", une pastille par groupe/élève concerné (ou une pastille "Toute la classe").

## Décisions validées

| # | Question | Décision |
|---|---|---|
| 1 | Interactivité | Pastilles statiques, non cliquables — basées sur `.mc-disc-pill` (existante dans `styles.scss` mais actuellement inutilisée dans le code), pas `.mc-chip`/`.mc-chip-filtre` (interactifs). |
| 2 | Portée | Cahier journal ET emploi du temps — même donnée `elevesConcernes` non affichée aujourd'hui dans les deux écrans. |

## Conception

### Nouveau composant partagé

Utilisé par ≥2 écrans → `composants/` (`conventions-nommage.md`).

- Répertoire : `src/app/composants/mc-pastilles-eleves-concernes/`
- Fichiers : `.ts`, `.html`, `.scss` (quasi vide, layout local uniquement), `.spec.ts`
- Classe `McPastillesElevesConcernesComponent extends ComposantBase`, `OnPush`, sélecteur `mc-pastilles-eleves-concernes`
- Input : `public readonly elevesConcernes = input<ElevesConcernes | undefined>(undefined);` (non `required` : `undefined` pour les créneaux non-pédagogiques `recreation`/`pauseDejeuner`)
- Injecte `DonneesService` pour résoudre `referentiels.groupes` et `classe.eleves`
- `protected readonly pastilles = computed(...)` → `{ id: string; libelle: string }[]` (interface locale au `.ts`, pas dans `modeles/` — objet de présentation non persisté, précédent : `SeanceResumee` dans `ecran-accueil.component.ts`) :
  - `undefined` → `[]`
  - `type === 'classe'` → une pastille `{ id: 'classe', libelle: LIBELLES.elevesConcernes.modeClasse }` (réutilise le libellé existant `'Toute la classe'`, pas de nouvelle clé)
  - `type === 'groupes'` → une pastille par id résolu dans `referentiels.groupes` (id inconnu ignoré silencieusement), triées par libellé
  - `type === 'eleves'` → une pastille par id résolu dans `classe.eleves`, libellé `` `${nom.toUpperCase()} ${prenom}` `` (aligné sur le format déjà utilisé dans `mc-eleves-concernes.component.html`, ligne 84), triées par nom+prénom

### Template

```html
@if (pastilles().length > 0) {
  <div class="..." [attr.aria-label]="LIBELLES.elevesConcernes.ariaListePastilles">
    @for (p of pastilles(); track p.id) {
      <span class="mc-disc-pill">{{ p.libelle }}</span>
    }
  </div>
}
```

Aucun `id` HTML requis : les pastilles sont des `<span>` statiques, la règle `html-ids.md` vise `button`/`input`/`select`/`textarea`, pas des éléments passifs.

### Intégration cahier journal

`src/app/ecrans/cahier-journal/ecran-cahier-journal.component.html`, dans `.cj__seance-entete` (lignes ~169-219) : insérer `<mc-pastilles-eleves-concernes [elevesConcernes]="seance.elevesConcernes" />` après le `@if (seance.titre)` et avant `.cj__seance-controles`. Le conteneur est déjà `flex-wrap: wrap`, aucun ajustement de layout nécessaire. Ajouter le composant aux `imports` de `EcranCahierJournalComponent`.

### Intégration emploi du temps

`src/app/ecrans/emploi-du-temps/ecran-emploi-du-temps.component.html`, dans `<button class="edt__btn-creneau">` (lignes ~80-90) : insérer `<mc-pastilles-eleves-concernes [elevesConcernes]="creneau.elevesConcernes" />` après le `@if (creneau.titre)`. Point de vigilance : `.edt__btn-creneau` est très compact (`padding: 0.25rem`, `font-size` ~0.75rem) — vérifier visuellement le rendu avec plusieurs pastilles ; ajuster si besoin via un scoping local (`.edt__btn-creneau .mc-pastilles-eleves-concernes { ... }` dans le `.scss` de l'écran EDT), jamais en redéfinissant `.mc-disc-pill` globalement (`scss-css.md`). Ajouter le composant aux `imports` de `EcranEmploiDuTempsComponent`.

### Impression

Aucune règle `@media print` supplémentaire a priori : ni `.cj__seance-entete` ni `.edt__btn-creneau` ne sont masqués à l'impression aujourd'hui, donc les pastilles s'impriment par défaut. À confirmer visuellement à l'implémentation.

### Libellé à ajouter

`src/app/libelles.ts`, section `elevesConcernes` (ligne ~360-368) :

```ts
ariaListePastilles: 'Élèves concernés',
```

## Tests

- Nouveau spec `mc-pastilles-eleves-concernes.component.spec.ts` : `TestBed`, données réelles via `DonneesMother`/`EleveMother`/`GroupeMother` (pas de mock), un test par branche (`undefined`, `classe`, `groupes` avec id inconnu ignoré, `eleves` avec id inconnu ignoré), vérification du rendu DOM (`.mc-disc-pill` présent/absent).
- `ecran-cahier-journal.component.spec.ts` / `ecran-emploi-du-temps.component.spec.ts` : vérifier a minima que l'ajout du composant enfant ne casse pas le rendu existant (`fixture.detectChanges()` sans erreur avec une séance/un créneau ayant `elevesConcernes` défini).

## Fichiers impactés

| Fichier | Nature |
|---|---|
| `src/app/composants/mc-pastilles-eleves-concernes/mc-pastilles-eleves-concernes.component.ts` | Nouveau |
| `src/app/composants/mc-pastilles-eleves-concernes/mc-pastilles-eleves-concernes.component.html` | Nouveau |
| `src/app/composants/mc-pastilles-eleves-concernes/mc-pastilles-eleves-concernes.component.scss` | Nouveau (minimal) |
| `src/app/composants/mc-pastilles-eleves-concernes/mc-pastilles-eleves-concernes.component.spec.ts` | Nouveau |
| `src/app/libelles.ts` | Clé `elevesConcernes.ariaListePastilles` |
| `src/app/ecrans/cahier-journal/ecran-cahier-journal.component.ts` + `.html` | Intégration |
| `src/app/ecrans/emploi-du-temps/ecran-emploi-du-temps.component.ts` + `.html` (+ `.scss` si besoin) | Intégration |

## Vérification

1. `ng test` — couverture ≥80% sur le nouveau composant.
2. `ng serve` — vérifier l'affichage des pastilles sur des séances/créneaux de type `classe`/`groupes`/`eleves`, et l'absence de pastille sur récréation/pause déjeuner, dans les deux écrans.
3. Contrôle AXE / focus visible sur les deux écrans modifiés (RGAA).
