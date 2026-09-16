---
name: plans-10-edtAbsencesRegulieres
description: Plan d'évolution — bandeau des absences régulières pertinentes pour l'EDT sélectionné + câblage de l'icône de conflit par créneau déjà prévue dans la spec mais jamais implémentée
metadata:
  type: project
  updated: 2026-09-16
related:
  - projet-12-ecran-emploi-du-temps
  - projet-02-modelesDonnees
  - projet-05-services
  - plans-08-conflitEdtParite
  - plans-09-edtTitreListeEdt
  - plans-11-edtTempsMultiples
---

# Plan d'évolution — Bandeau d'absences régulières + icône de conflit par créneau (B1)

## Contexte

Deux besoins regroupés dans le même lot car ils portent tous deux sur le croisement EDT/absences régulières des élèves :

1. Ajouter, en haut de l'écran emploi du temps, une zone listant les absences régulières pertinentes pour l'EDT actuellement sélectionné dans la colonne de gauche.
2. Câbler une fonctionnalité déjà décrite dans `projet-12-ecran-emploi-du-temps.md` (icône ⚠ par créneau signalant un conflit avec une absence récurrente d'un élève concerné) mais jamais implémentée côté écran : le service `EmploiDuTempsService.calculerConflitsAbsences(creneauId)` existe et est testé, mais aucun composant ne l'appelle, et `popin-warnings-absences` (déjà utilisée dans le cahier journal) n'est pas câblée sur cet écran.

**Dépendance** : `calculerConflitsAbsences` ignore aujourd'hui la parité de semaine (bug documenté et déjà planifié séparément dans `plans-08-conflitEdtParite.md`). Ce correctif doit être appliqué avant ou en même temps que le câblage de l'icône ⚠ de ce lot, sinon l'icône affichera des faux positifs de parité dès sa mise en service.

## Décisions validées

| # | Question | Décision |
|---|---|---|
| 1 | Portée du bandeau | Lié à l'EDT sélectionné dans la colonne gauche — recalculé à chaque sélection, vide si aucun EDT sélectionné. |
| 2 | Filtre du bandeau | Absences dont le jour correspond à un jour effectivement utilisé par un créneau de l'EDT sélectionné, ET dont `paritesSemaine` est compatible avec `edt.frequence` (règle `paire`/`impaire` jamais compatibles, `lesDeux` toujours compatible). |
| 3 | Périmètre du lot | Inclut le câblage de l'icône ⚠ par créneau déjà prévue dans la spec mais jamais implémentée (gain rapide, code sous-jacent existant). |

## Conception

### 1. Bandeau d'absences pertinentes

Nouvelle méthode publique dans `EmploiDuTempsService` (`src/app/services/sansEtat/emploi-du-temps.service.ts`), à côté de `calculerConflitsAbsences`/`validerChevauchement` :

```ts
public obtenirAbsencesPertinentes(
  edt: EmploiDuTemps,
): { eleve: Eleve; absence: AbsenceRecurrente }[]
```

- `[]` si aucune donnée chargée.
- `joursUtilises = new Set(edt.creneaux.map((c) => c.jour))` — un EDT sans créneau produit un ensemble vide, donc un bandeau vide (comportement assumé, pas de repli sur les jours ouvrés configurés).
- Pour chaque élève de `donnees.classe.eleves` (triés NOM Prénom, même tri que `rechercherEleves`), pour chaque `absencesRecurrentes` : retenue si `joursUtilises.has(abs.jour)` ET `this.verifierCompatibiliteFrequences(edt.frequence, abs.paritesSemaine)`. Pas besoin de changer la visibilité de `verifierCompatibiliteFrequences` : `obtenirAbsencesPertinentes` est ajoutée dans la même classe `EmploiDuTempsService`, elle peut appeler la méthode privée directement (elle reste `private`, aucune raison de l'exposer publiquement).
- Retourne une liste de paires `{ eleve, absence }` plutôt que des chaînes pré-formatées (contrairement à `calculerConflitsAbsences`, qui produit des strings pour `popin-warnings-absences`) — ici il n'y a pas de popin, l'écran compose librement l'affichage.

UI, `ecran-emploi-du-temps.component.ts` :
```ts
protected readonly absencesPertinentes = computed(() => {
  const edt = this.edtSelectionne();
  return edt ? this.emploiDuTempsService.obtenirAbsencesPertinentes(edt) : [];
});
```

UI, `ecran-emploi-du-temps.component.html` : ajouter un `<div class="edt__bandeau-absences">` **avant** `<div class="edt">` (le fichier n'a aujourd'hui qu'une seule racine `<div class="edt">` — Angular n'impose pas un élément racine unique par template, il suffit d'ajouter le bandeau comme frère précédent). Affiché seulement si `edtSelectionne()` est non nul et `absencesPertinentes().length > 0` (bandeau masqué s'il n'y a rien à signaler, plus simple qu'un état "aucune absence"). Contenu : `<h2 class="edt__titre-section">` + `<ul>` de puces au format `` `${eleve.nom} ${eleve.prenom} — ${absence.libelle} (${LIBELLES.edt.joursLibelles[absence.jour]} ${absence.heureDebut}-${absence.heureFin})` ``.

Nouveaux libellés `src/app/libelles.ts`, section `edt` : `titreAbsencesPertinentes` (ex. "Absences régulières sur cette période").

### 2. Icône ⚠ de conflit par créneau (câblage de l'existant)

`ecran-emploi-du-temps.component.ts` :
- Importer `PopinWarningsAbsencesComponent`.
- `protected readonly popinConflitsVisible = signal(false);`
- `protected readonly conflits = signal<string[]>([]);`
- `protected readonly creneauxAvecConflits = computed<Set<string>>(() => { const edt = this.edtSelectionne(); if (!edt) return new Set(); const ids = new Set<string>(); for (const c of edt.creneaux) { if (this.emploiDuTempsService.calculerConflitsAbsences(c.id).length > 0) ids.add(c.id); } return ids; });` — recalculé uniquement au changement d'EDT sélectionné (dépendance `edtSelectionne()`), pas à chaque cycle de détection.
- `protected afficherConflits(creneau: CreneauEdt, event: Event): void { event.stopPropagation(); this.conflits.set(this.emploiDuTempsService.calculerConflitsAbsences(creneau.id)); this.popinConflitsVisible.set(true); }`
- `protected fermerConflits(): void { this.popinConflitsVisible.set(false); this.conflits.set([]); }`

`ecran-emploi-du-temps.component.html` — **restructuration nécessaire de la cellule de créneau** : aujourd'hui `edt__btn-creneau` est un `<button>` unique couvrant toute la cellule (vérifié dans le template actuel), on ne peut pas y imbriquer un second `<button>` icône (HTML invalide, deux boutons imbriqués). Remplacer par une structure à deux boutons frères dans la `<td>` :
```html
@if (creneau) {
  <div class="edt__creneau-cellule">
    <button [id]="'btnCreneau' + creneau.id" class="edt__btn-creneau" (click)="selectionnerCreneau(creneau)">
      <span class="edt__creneau-type">{{ creneau.type }}</span>
      @if (creneau.titre) { <span class="edt__creneau-titre">{{ creneau.titre }}</span> }
    </button>
    @if (creneauxAvecConflits().has(creneau.id)) {
      <button
        [id]="'btnConflitCreneau' + creneau.id"
        class="edt__btn-icone-conflit"
        [attr.aria-label]="LIBELLES.edt.avertissementConflitAbsence"
        title="{{ LIBELLES.edt.avertissementConflitAbsence }}"
        (click)="afficherConflits(creneau, $event)"
      >⚠</button>
    }
  </div>
}
```
Ajouter en fin de template : `<popin-warnings-absences [visible]="popinConflitsVisible()" [conflits]="conflits()" (annule)="fermerConflits()" />` — pattern identique à `ecran-cahier-journal.component.html`.

Nouveau libellé `LIBELLES.edt.avertissementConflitAbsence` (distinct de `avertissementChevauchement`, qui concerne le chevauchement inter-EDT, pas les absences élèves).

Différence de pattern par rapport au cahier journal (à noter, pas forcément à corriger dans ce lot) : dans `ecran-cahier-journal.component.ts`, la popin s'ouvre automatiquement après sauvegarde d'une séance ; ici l'icône est permanente et cliquable sur chaque créneau de la grille, plus proche du pattern déjà existant de `edt__icone-conflit` sur la liste des EDT à gauche (chevauchement inter-EDT) mais rendue actionnable.

## Points à valider avant implémentation

- **EDT sans créneau** : bandeau vide par construction (`joursUtilises` vide) — comportement assumé, à confirmer visuellement.
- **Pas de filtre horaire ni `elevesConcernes` dans le bandeau** : volontairement plus large qu'un conflit précis (vision globale de l'EDT, pas un conflit par créneau) — à confirmer que ce n'est pas perçu comme trop bruyant à l'usage réel.
- **Granularité de l'icône ⚠** : par créneau agrégé dans ce lot. `plans-11-edtTempsMultiples.md` (B4) introduit des créneaux à plusieurs "temps" avec chacun son propre horaire — une fois B4 en place, une granularité par temps individuel sera probablement plus pertinente ; à revoir à ce moment plutôt que d'anticiper ici.

## Tests

- `emploi-du-temps.service.spec.ts` : `describe('obtenirAbsencesPertinentes', ...)`, un test par branche (jour non utilisé par l'EDT → exclue ; parité incompatible → exclue ; `lesDeux` → toujours incluse ; EDT sans créneau → `[]` ; tri NOM Prénom).
- `ecran-emploi-du-temps.component.spec.ts` : rendu du bandeau (présent/absent selon sélection et résultat), ouverture/fermeture de la popin de conflits sur clic de l'icône (pattern output/spy conforme à `tests-code.md`), non-affichage de l'icône quand `creneauxAvecConflits()` ne contient pas le créneau.

## Fichiers impactés

| Fichier | Nature |
|---|---|
| `src/app/services/sansEtat/emploi-du-temps.service.ts` | Nouvelle méthode `obtenirAbsencesPertinentes` |
| `src/app/services/sansEtat/emploi-du-temps.service.spec.ts` | Nouveaux tests |
| `src/app/ecrans/emploi-du-temps/ecran-emploi-du-temps.component.ts` | Signals/computed bandeau + conflits, méthodes `afficherConflits`/`fermerConflits` |
| `src/app/ecrans/emploi-du-temps/ecran-emploi-du-temps.component.html` | Bandeau, restructuration cellule créneau, popin |
| `src/app/ecrans/emploi-du-temps/ecran-emploi-du-temps.component.scss` | Classes `edt__bandeau-absences`, `edt__creneau-cellule`, `edt__btn-icone-conflit` |
| `src/app/ecrans/emploi-du-temps/ecran-emploi-du-temps.component.spec.ts` | Nouveaux tests |
| `src/app/libelles.ts` | Clés `edt.titreAbsencesPertinentes`, `edt.avertissementConflitAbsence` |

## Séquencement recommandé

1. `plans-08-conflitEdtParite.md` (correctif de parité, prérequis pour que l'icône ⚠ soit fiable dès sa mise en service).
2. `obtenirAbsencesPertinentes` + tests.
3. Bandeau UI.
4. Restructuration de la cellule créneau + icône ⚠ + popin + tests.

## Vérification

1. `ng test` — couverture ≥80% sur `EmploiDuTempsService` et l'écran.
2. `ng serve` : sélectionner un EDT ayant des créneaux sur des jours où au moins un élève a une absence récurrente de parité compatible → vérifier le contenu du bandeau ; créer un créneau concernant un élève avec une absence récurrente en conflit → vérifier l'icône ⚠ et l'ouverture de la popin au clic, sans déclencher l'ouverture du formulaire créneau.
3. Contrôle AXE / focus visible sur la nouvelle structure de cellule (deux boutons frères).
