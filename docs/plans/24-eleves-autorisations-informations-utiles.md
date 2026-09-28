---
name: 24-eleves-autorisations-informations-utiles
description: Plan d'évolution — fiche élève, autorisations structurées (droit à l'image, baignade, sortie régulière avec réponse Accepté / Refusé / Sans réponse et précision) et nouvelle section « Informations utiles » (port de lunettes, notification AESH, latéralité)
metadata:
  type: project
  updated: 2026-09-28
related:
  - specification/ecrans/eleves
  - specification/modeles-donnees
  - specification/elements-techniques
  - specification/composants-partages
---

# Plan 24 — Élèves : autorisations structurées et informations utiles

**Statut : en cours.** Besoin reformulé, décisions 1 à 4 et plan validés le 2026-09-28. Incrément 1 terminé le 2026-09-28.

## Contexte

La section *Notes administratives* de la fiche élève compte quatre `mc-textarea` : Droit à l'image, Autorisation baignade, PPA et ESS. Le modèle `Eleve` stocke les deux premières en texte libre (`notesDroitImage`, `notesAutorisationBaignade`). Une autorisation n'a donc pas de réponse exploitable. On ne peut pas voir d'un coup d'œil si elle est accordée.

Besoin exprimé :

1. **Droit à l'image** et **Autorisation baignade** deviennent chacune un groupe de boutons radio **Accepté / Refusé / Sans réponse**, suivi à droite d'un champ `input` d'une ligne. Ce champ remplace le `textarea`.
2. Une troisième autorisation, construite sur le même modèle, est ajoutée : **Autorisation de sortie régulière**.
3. Une nouvelle section **Informations utiles** est ajoutée en dernier dans la fiche. Elle contient une case à cocher **Port de lunettes**, une case à cocher **Notification AESH** et un groupe de boutons radio **Latéralité** avec les options **Gaucher / Droitier**.

PPA et ESS ne changent pas.

Point d'historique : l'étape de migration `2026.09.5` a retiré le champ `manualite` (`'D' | 'G' | 'A'`), car aucun écran ne permettait de le saisir. La latéralité est un nouveau champ. Elle ne récupère rien de l'ancien.

## Décisions

| # | Sujet | Décision |
|---|---|---|
| 1 | Libellé du radio Gaucher / Droitier — **validé le 2026-09-28** | **Latéralité**. Libellés écartés : « Main dominante » et « Main d'écriture ». |
| 2 | Valeur par défaut — **validé le 2026-09-28** | Aucune option cochée par défaut, que ce soit pour les trois autorisations ou pour la latéralité. La réponse vaut `null` : elle n'est **pas renseignée**. « Non renseignée » est différent de « Sans réponse », qui signifie que la famille n'a pas répondu. |
| 3 | Mode lecture — **validé le 2026-09-28** | Autorisation : « Accepté — *précision* ». Si la précision est vide, la réponse s'affiche seule. Si la réponse n'est pas renseignée mais qu'une précision existe, la précision s'affiche seule. Si les deux sont vides, rien ne s'affiche. Informations utiles : seules les cases cochées s'affichent (« Port de lunettes », « Notification AESH »), plus « Latéralité : Gaucher » si la latéralité est renseignée. Une section est masquée quand elle n'a rien à afficher, comme aujourd'hui pour les Notes administratives. |
| 4 | Revenir à « non renseigné » — **validé le 2026-09-28** | Un groupe radio coché peut être remis à « non renseigné ». Un radio natif ne permet pas de décocher. `mc-radio-group` reçoit donc un nouvel `input()` optionnel, `effacable` (faux par défaut), qui affiche un bouton **EFFACER** (`mc-btn-fantome mc-btn-xs`) dans le `fieldset`. Ce bouton n'est présent que si une option est cochée. Il remet la valeur à `null` et rend le focus à la première option. Son `aria-label` est « Effacer la réponse : *libellé du groupe* ». L'option est activée sur les trois autorisations et sur la latéralité. Le sexe et `mc-eleves-concernes` ne changent pas. |
| 5 | Modèle | Nouveaux types dans `eleve.modele.ts` : `ReponseAutorisation = 'accepte' \| 'refuse' \| 'sansReponse'`, `Autorisation { reponse: ReponseAutorisation \| null; precision: string }` et `Lateralite = 'gaucher' \| 'droitier'`. Dans `Eleve`, `notesDroitImage` et `notesAutorisationBaignade` sont remplacés par `droitImage: Autorisation`, `autorisationBaignade: Autorisation` et `autorisationSortieReguliere: Autorisation`. Trois champs sont ajoutés : `portLunettes: boolean`, `notificationAesh: boolean` et `lateralite: Lateralite \| null`. |
| 6 | Migration des données existantes | Nouvelle étape dans `MigrationService`, qui prend la version suivant la dernière étape au moment de l'implémentation (`2026.09.7` à ce jour). Pour chaque élève, l'ancien texte `notesDroitImage` devient `droitImage.precision` et l'ancien texte `notesAutorisationBaignade` devient `autorisationBaignade.precision`, avec une réponse `null`. Les anciens champs sont supprimés. `autorisationSortieReguliere` est créée vide, `portLunettes` et `notificationAesh` valent `false`, `lateralite` vaut `null`. **Limite acceptée** : un ancien texte sur plusieurs lignes est conservé tel quel dans les données, mais un `input` l'affiche sur une seule ligne. Les retours à la ligne sont conservés tant que le champ n'est pas modifié. |
| 7 | Disposition du formulaire | Chaque autorisation est une ligne de la grille : le groupe radio à gauche, puis l'`input` de précision (`mc-input`). Le libellé de l'autorisation est la `legend` du `fieldset`. L'`input` porte le libellé visible « Précision » et le nom complet de l'autorisation via `aria-label` (« Précision : Droit à l'image »). Les trois lignes sont produites par un `@for` sur un tableau `static readonly` de descripteurs (clé du `FormGroup`, libellé, préfixe d'`id`), ce qui évite de répéter le bloc trois fois. Cet ensemble reste dans `fe-formulaire-eleve` : aucun autre écran ne l'utilise, il ne devient donc pas un composant partagé. |
| 8 | Cases à cocher | `<input type="checkbox">` natif lié par `[formControl]`, avec la classe globale existante `mc-champ mc-champ--checkbox` (`styles.scss`). Aucun nouveau composant partagé n'est créé, car un seul écran s'en sert. |
| 9 | Libellés | Nouvelles clés dans `LIBELLES.eleve` : `labelAutorisationSortieReguliere` (« Autorisation de sortie régulière »), `labelPrecision` (« Précision »), `sectionInformationsUtiles` (« Informations utiles »), `labelPortLunettes` (« Port de lunettes »), `labelNotificationAesh` (« Notification AESH »), `labelLateralite` (« Latéralité »), `reponsesAutorisation` (Accepté / Refusé / Sans réponse) et `lateralites` (Gaucher / Droitier). Nouvelles clés dans `LIBELLES.commun` : `effacer` (« EFFACER ») et `ariaEffacerReponse` (« Effacer la réponse : »). |

## Modifications

Deux incréments, chacun relu par `revue-increment` puis committé séparément.

### Incrément 1 — `mc-radio-group` effaçable (décision 4)

- `champ-base.ts` : le type de `onChange` accepte `null`, pour qu'un champ puisse notifier une valeur vidée.
- `mc-radio-group.component.ts` : nouvel `input()` `effacable` et méthode `effacer()`. Elle vide la valeur (`writeValue(null)`), appelle `onChange(null)` et `onTouched()`, puis donne le focus à la première option via `viewChildren`.
- `mc-radio-group.component.html` : bouton `[id]="'btnEffacer_' + id()"` (préfixe `btn` de `html-ids.md`), présent si `effacable()` est vrai et qu'une valeur est cochée, désactivé si le champ est désactivé.
- `mc-radio-group.component.scss` : alignement du bouton avec les options.
- `libelles.ts` : `commun.effacer` et `commun.ariaEffacerReponse`.
- Tests (`mc-radio-group.component.spec.ts`) :
  - sans `effacable`, pas de bouton ;
  - avec `effacable` et aucune valeur, pas de bouton ;
  - avec `effacable` et une valeur, le bouton est présent et un clic émet `null` et décoche toutes les options ;
  - `writeValue(null)` décoche toutes les options.
- `specification/composants-partages.md` : description de l'option `effacable`.

### Incrément 2 — Modèle, migration, fiche et formulaire

- `eleve.modele.ts` : types et champs de la décision 5, avec JSDoc.
- `migration.service.ts` : étape de la décision 6.
- `eleve.mother.ts` : nouveaux champs à leur valeur vide. Ajout d'une variante `EleveMother.avecAutorisations(...)` si plusieurs tests en ont besoin.
- `fe-formulaire-eleve.component.ts` :
  - un `FormGroup` `{ reponse, precision }` par autorisation ;
  - trois `FormControl` : `portLunettes`, `notificationAesh` et `lateralite` ;
  - un descripteur `static readonly` des trois autorisations ;
  - des options de radio construites depuis `LIBELLES` ;
  - la prise en compte des nouveaux champs par `construireEleve`, `chargerEleve` et la création d'un élève vide.
- `fe-formulaire-eleve.component.html` : section *Notes administratives* réorganisée (décision 7), avec PPA et ESS inchangés. Nouvelle section *Informations utiles* en dernier (`aria-labelledby="titreFormInfosUtiles"`). IDs : `champFormDroitImage`, `champFormDroitImagePrecision`, `champFormBaignade`, `champFormBaignadePrecision`, `champFormSortieReguliere`, `champFormSortieRegulierePrecision`, `champFormPortLunettes`, `champFormNotificationAesh` et `champFormLateralite`.
- `fe-formulaire-eleve.component.scss` : ligne « radio + précision », qui passe en colonne sur un écran étroit.
- `fe-fiche-eleve.component.ts` / `.html` : affichage en lecture (décision 3), avec une méthode de formatage d'une autorisation et une nouvelle section *Informations utiles*.
- `libelles.ts` : clés de la décision 9 dans `LIBELLES.eleve`.
- Tests unitaires :
  - `MigrationService` : ancien texte vers la précision avec une réponse `null` ; textes vides ; élève sans les anciens champs ; nouveaux champs initialisés ; fichier déjà à la nouvelle version non modifié ; `obtenirVersionCourante()` égale à la nouvelle version.
  - `fe-formulaire-eleve` : création sans aucune option cochée ; enregistrement des trois autorisations, des cases et de la latéralité ; rechargement d'un élève existant ; EFFACER qui remet `reponse` à `null` et marque le formulaire modifié.
  - `fe-fiche-eleve` : les quatre cas d'affichage d'une autorisation (décision 3) ; cases cochées seules affichées ; latéralité affichée ou absente ; sections masquées si elles sont vides.
- E2E (`eleves.spec.ts` et sélecteurs `selecteurs-eleves.ts`) :
  - modifier un élève, choisir « Refusé » pour le droit à l'image avec une précision, cocher « Port de lunettes » et choisir « Gaucher » ;
  - enregistrer, puis vérifier la fiche en lecture ;
  - effacer la latéralité, puis vérifier qu'elle n'est plus affichée.
- Jeu de données E2E `maclasse-test.zip` : il n'est pas régénéré, la migration s'applique au chargement. Vérifier qu'il se charge toujours. Il est actuellement modifié dans l'arbre de travail par une autre session : ne pas l'inclure dans le commit.
- Accessibilité : les contrôles AXE doivent rester verts (`accessibilite.spec.ts`) sur la fiche en lecture et en modification.

### Documentation

- `specification/ecrans/eleves.md` : tableau de la section *Notes administratives* réécrit (trois autorisations, PPA, ESS) ; nouvelle section *Informations utiles* ; règles d'affichage en lecture.
- `specification/modeles-donnees.md` : bloc `Eleve` et nouveaux types `Autorisation`, `ReponseAutorisation` et `Lateralite`.
- `specification/elements-techniques.md` : ligne de la nouvelle version dans le tableau des migrations.
- `specification/libelles.md` : nouvelles clés si le document les détaille.
- `docs/README.md` : ligne du plan 24, puis mise à jour de son statut à chaque incrément.

## Vérifications

- `npm run lint` sans erreur sur les fichiers des incréments.
- `ng test` : tous les tests passent et la couverture des services reste d'au moins 80 %.
- `npm run e2e` : scénarios Élèves et Accessibilité.
