---
name: 23-parametrage-saisies-identifiants-absences
description: Plan d'évolution — Paramétrage (conservation des saisies non enregistrées au rechargement, identifiants des référentiels figés et uniques, avertissement avant de quitter une section modifiée) et contrôle de la plage horaire des absences récurrentes d'un élève
metadata:
  type: project
  updated: 2026-09-27
related:
  - specification/ecrans/parametrage
  - specification/ecrans/eleves
  - specification/elements-techniques
  - plans/22-formulaires-reactive-forms
---

# Plan 23 — Paramétrage : saisies, identifiants, navigation ; absences récurrentes

**Statut : en cours.** Décisions 3, 4, 8 et 9 arbitrées le 2026-09-27 (la 9 passe par une migration de nettoyage). Incréments 1 (conservation des saisies) et 2 (identifiants) terminés le 2026-09-27, incrément 3 (avertissement de navigation) le 2026-09-28.

## Contexte

Quatre points relevés lors de la rédaction du [plan 22](22-formulaires-reactive-forms.md), laissés hors de son périmètre car ils changent le comportement :

| # | Constat (code du 2026-09-27) |
|---|---|
| A | **Saisies écrasées** : dans `ecran-parametrage`, un `effect` recharge la section active depuis les données à **chaque** changement de `DonneesService.donnees()`. Enregistrer une ligne, ou faire ANNULER / REFAIRE depuis l'entête, efface les saisies non enregistrées des autres lignes de la section et les lignes ajoutées non enregistrées. |
| B | **Identifiant modifiable** : le barème (`StatutAcquisition.id`), les statuts élève (`StatutEleve.id`) et les types de contact (`TypeContact.id`) ont un champ « Identifiant » éditable. `enregistrerXxx(i)` retrouve l'entrée par l'`id` saisi : modifier l'identifiant d'une entrée enregistrée **crée une nouvelle entrée** et laisse l'ancienne en place (les élèves et contacts continuent de pointer vers l'ancienne). À l'inverse, une nouvelle ligne dont l'identifiant existe déjà **remplace** l'entrée existante. Un identifiant vide est accepté. |
| C | **Pas d'avertissement** : `/parametrage` n'a pas de `canDeactivate`, et changer de section recharge la nouvelle section sans rien conserver de l'ancienne. Quitter l'écran ou changer de section avec des modifications non enregistrées les perd sans avertissement, contrairement aux écrans Élèves, Projets, EDT et Cahier journal. |
| D | **Absences récurrentes sans contrôle horaire** : dans `fe-formulaire-eleve`, une absence récurrente peut être enregistrée sans heure, ou avec une heure de fin antérieure à l'heure de début. Ces absences alimentent les conflits de l'EDT et du cahier journal (`DateUtils.chevauchementHoraire`) et les notes pré-remplies du cahier journal. |

## Prérequis

Le **plan 22** est réalisé : le Paramétrage et `fe-formulaire-eleve` sont en Reactive Forms, les lignes des sections liste sont réconciliées par `idOrigine` au rechargement (plan 22, décision 9), et `FormulaireUtils` existe (plan 21 ou 22).

## Décisions

| # | Sujet | Décision |
|---|---|---|
| 1 | Rechargement d'une section formulaire (point A) | Enseignant & Classe, Semaine & Horaires, Préférences **et Domaines de compétences** (sélection `copieDomainesActifs`) : à un changement des données, le formulaire n'est rechargé **que s'il n'est pas modifié** par rapport aux valeurs enregistrées **avant** ce changement. Sinon, la saisie est conservée et la pastille « Non enregistré » reste affichée. |
| 2 | Rechargement d'une section liste (point A) | La réconciliation du plan 22 est affinée ligne par ligne : une ligne **non modifiée** reçoit la nouvelle valeur enregistrée ; une ligne **modifiée** garde sa saisie ; une ligne ajoutée non enregistrée est **conservée** ; une ligne dont l'entrée a disparu des données (suppression, ANNULER d'un ajout) est retirée, sauf si elle est modifiée : elle redevient alors une ligne non enregistrée, dont l'identifiant redevient éditable (décision 3). La comparaison « modifiée » se fait avec la valeur enregistrée **avant** le changement (valeur mémorisée à chaque chargement). |
| 3 | Identifiant figé (point B) — **validé le 2026-09-27** | Le champ « Identifiant » n'est éditable que sur une ligne **jamais enregistrée**. Une fois l'entrée enregistrée, il est en lecture seule (nouvel input `lectureSeule` de `mc-input`, avec une infobulle et un texte `sr-only` expliquant pourquoi) : c'est une clé de référence ; le libellé, le glyphe et les couleurs restent modifiables. **Option écartée** : renommage en cascade (mise à jour de `Eleve.statut`, `Contact.type`, et à terme des PPI et bulletins), plus lourde (commande composite pour un seul pas d'UNDO) pour un besoin rare — un identifiant mal saisi se corrige en supprimant l'entrée tant qu'elle n'est pas utilisée. |
| 4 | Identifiant obligatoire et unique (point B) — **validé le 2026-09-27** | Sur une ligne non enregistrée, l'identifiant est obligatoire (`FormulaireUtils.validerTexteNonVide`) et doit être **unique** dans sa section, comparaison sans tenir compte des espaces en bordure ni de la casse, face aux identifiants **enregistrés et à ceux des autres lignes de la section** (deux lignes nouvelles « X » sont toutes deux en erreur : sinon, enregistrer la seconde remplacerait la première). **Réalisation** : contrôle calculé par une méthode de l'écran (`obtenirErreurIdentifiant`, `TexteUtils.normaliserIdentifiant`) plutôt que par un validateur du `FormArray`, qui ne serait pas réévalué quand les identifiants enregistrés changent (ANNULER / REFAIRE) ; « obligatoire » n'est affiché qu'une fois le champ modifié ou quitté ; les espaces en bordure sont retirés à l'ENREGISTRER. ENREGISTRER de la ligne est désactivé tant que la ligne est invalide ; message `role="alert"` sous le champ. |
| 5 | Navigation hors de l'écran (point C) | `EcranParametrageComponent` implémente `AvecNavigationGardee` et la route `/parametrage` reçoit `canDeactivate: [modificationsNonEnregistreesGarde]`. `confirmerNavigation()` résout `true` si la section active n'a ni modification de formulaire ni ligne modifiée ou non enregistrée ; sinon il ouvre `popin-avertissement` (`LIBELLES.commun.avertissementModifications`), comme l'écran Emploi du temps. |
| 6 | Changement de section (point C) | Même avertissement au clic sur une autre section de la colonne gauche quand la section active est modifiée ; CONFIRMER change de section (les saisies sont abandonnées), ANNULER reste sur la section. Seule la section active peut donc porter des saisies non enregistrées. |
| 7 | Mode de détection | « Section modifiée » réutilise les méthodes existantes `estXxxModifie()` et `estXxxLigneModifiee(i)` (pastilles « Non enregistré »), regroupées dans une méthode `verifierSectionActiveModifiee()`. La section « Domaines de compétences » est incluse (`estDomainesCompetencesModifie()`). |
| 8 | Plage horaire des absences récurrentes (point D) — **validé le 2026-09-27** | Dans `fe-formulaire-eleve`, chaque absence récurrente exige une heure de début et une heure de fin (`Validators.required`) et une fin **strictement postérieure** au début (`FormulaireUtils.validerPlageHoraire`). Message `LIBELLES.commun.erreurPlageHoraire` (`role="alert"`) sous l'absence concernée, affiché dès que les deux heures sont saisies et incohérentes, ou après une tentative d'enregistrement pour les heures manquantes. ENREGISTRER de la fiche est désactivé tant qu'une absence est invalide, comme pour un prénom ou un nom vide. |
| 9 | Données existantes (point D) — **validé le 2026-09-27 : migration** | Étape de migration `2026.09.6` dans `MigrationService` : pour chaque absence récurrente de chaque élève, si les deux heures sont saisies et que la fin est **antérieure** au début, elles sont **inversées** ; si une heure manque ou si les deux sont **égales**, l'absence est **supprimée**. Une absence valide n'est pas modifiée. Chaque fichier ne passe l'étape qu'une fois (version) et la validation de la décision 8 empêche ensuite toute nouvelle absence invalide : aucune fiche n'est donc bloquée à l'ouverture. Les calculs de conflits ne changent pas. **Option écartée** : pas de migration, la fiche étant bloquée à l'enregistrement tant que l'absence n'est pas corrigée (gênant pour une modification sans rapport, un numéro de téléphone par exemple). |
| 10 | Libellés | Nouvelles clés dans `LIBELLES.parametrage` : `erreurIdentifiantObligatoire`, `erreurIdentifiantDejaUtilise`, `tooltipIdentifiantFige`. Réutilisation de `commun.avertissementModifications` et `commun.erreurPlageHoraire`. |

## Modifications

Quatre incréments, chacun relu (`revue-increment`) et committé séparément.

### Incrément 1 — Conservation des saisies (point A)

- `ecran-parametrage.component.ts` : mémorisation des valeurs enregistrées de la section active à chaque chargement ; `effect` de rechargement appliquant les décisions 1 et 2.
- `ecran-parametrage.component.spec.ts` :
  - ligne B modifiée, enregistrement de la ligne A → la saisie de B est conservée, A affiche sa valeur enregistrée ;
  - ligne ajoutée non enregistrée, enregistrement d'une autre ligne → la ligne ajoutée est conservée ;
  - UNDO d'une modification de la ligne A pendant que A est modifiée → la saisie de A est conservée ; A non modifiée → A reprend l'ancienne valeur ;
  - suppression d'une entrée → sa ligne disparaît ; ANNULER de la suppression → elle réapparaît ;
  - section Enseignant & Classe modifiée + UNDO d'une autre commande → saisie conservée ;
  - sélection des Domaines de compétences modifiée + UNDO d'une autre commande → sélection conservée ;
  - ligne enregistrée, modifiée, puis son entrée supprimée par UNDO de son ajout → la ligne reste, non enregistrée, identifiant éditable.

### Incrément 2 — Identifiants (point B)

- `ecran-parametrage.component.ts` : indicateur « ligne enregistrée » (entrée présente dans les données par `idOrigine`) ; validateurs d'identifiant (décision 4) sur les lignes du barème, des statuts élève et des types de contact.
- `mc-input` : nouvel `input()` `lectureSeule` (faux par défaut) posant `readonly` sur l'`<input>` natif — le composant n'en a pas aujourd'hui ; un champ en lecture seule reste focalisable et lisible par les lecteurs d'écran, contrairement à `disabled`. Test du composant associé.
- `ecran-parametrage.component.html` : `[lectureSeule]` sur l'identifiant d'une ligne enregistrée, infobulle et `sr-only` (`aria-describedby`) ; messages d'erreur ; `[disabled]` d'ENREGISTRER tenant compte de la validité de la ligne.
- `libelles.ts` : clés de la décision 10.
- Tests unitaires : identifiant en lecture seule sur une ligne enregistrée, éditable sur une ligne nouvelle ; identifiant vide, en doublon d'une entrée enregistrée (« dc » face à « DC », « DC␠ »), en doublon d'une autre ligne non enregistrée, unique → état d'ENREGISTRER et messages ; plus aucune création d'entrée en doublon ni de remplacement d'une entrée existante.
- E2E (`parametrage.spec.ts`) : ajouter un statut élève avec un identifiant existant → ENREGISTRER désactivé et message ; un statut enregistré a son identifiant en lecture seule.

### Incrément 3 — Avertissement de navigation (point C)

- `app.routes.ts` : `canDeactivate: [modificationsNonEnregistreesGarde]` sur `/parametrage`.
- `ecran-parametrage.component.ts` : `implements AvecNavigationGardee`, `confirmerNavigation()`, `verifierSectionActiveModifiee()`, garde du changement de section (`activerSection`) ; signaux de la popin sur le modèle de l'écran Emploi du temps.
- `ecran-parametrage.component.html` : `popin-avertissement`.
- Tests unitaires : `confirmerNavigation()` résout `true` sans modification ; ouvre la popin puis résout selon CONFIRMER / ANNULER avec une section ou une ligne modifiée ; changement de section avec et sans modification ; section Domaines incluse. Mock `HTMLDialogElement` en `beforeAll` (règle `tests.md`).
- E2E : modifier le nom de l'enseignant, cliquer sur une autre section → popin ; ANNULER → saisie conservée ; CONFIRMER → section changée ; même scénario en cliquant sur un lien de navigation de l'entête.

### Incrément 4 — Absences récurrentes (point D)

- `migration.service.ts` : étape `2026.09.6` (décision 9).
- `fe-formulaire-eleve.component.ts` : validateurs de la décision 8 sur les `FormGroup` des absences récurrentes ; signal `soumissionTentee`.
- `fe-formulaire-eleve.component.html` : message d'erreur par absence (`[id]="'erreurAbsRec' + i"`, relié au champ par `aria-describedby`).
- Tests unitaires : heure de fin égale ou antérieure → message et ENREGISTRER désactivé ; heure manquante → message après tentative ; absence valide → aucun message ; suppression de l'absence invalide → ENREGISTRER réactivé.
- Tests de `MigrationService` : fin antérieure au début → heures inversées ; heure de début manquante, heure de fin manquante, heures égales → absence supprimée (un test par cas) ; absence valide inchangée ; élève sans absence récurrente ; fichier déjà en `2026.09.6` non modifié ; `obtenirVersionCourante()` vaut `2026.09.6`.
- Jeu de données E2E (`maclasse-test.zip`) : vérifier sa version et qu'il se charge toujours (migration appliquée au chargement).
- E2E (`eleves.spec.ts`) : saisir une absence récurrente 10:00–09:00 → message, ENREGISTRER désactivé ; corriger → ENREGISTRER actif.

### Documentation

- `specification/ecrans/parametrage.md` : comportement commun (saisies conservées, avertissement de navigation et de changement de section), identifiant figé et unique dans les sections Barème, Statuts élève, Types de contact.
- `specification/ecrans/eleves.md` : validation des absences récurrentes.
- `specification/elements-techniques.md` : `modificationsNonEnregistreesGarde` posée aussi sur `/parametrage` (§ Gardes et tableau des routes) ; ligne `2026.09.6` dans le tableau des versions du JSON.
- `specification/services.md` : étape `2026.09.6` de `MigrationService` si les étapes y sont détaillées.
- `specification/composants-partages.md` : usage de `popin-avertissement` dans le Paramétrage ; input `lectureSeule` de `mc-input`.
- `docs/README.md` : statut du plan 23.

## Hors périmètre

- **Nom d'une période scolaire** : `ProjetPeriode.periodeNom` et `Bulletin.periode` référencent une période par son **nom**, saisi librement dans le formulaire de projet. Renommer une période du Paramétrage ne met pas les projets à jour et `estPeriodeUtilisee` ne la voit plus comme utilisée. Problème de même nature que le point B, mais qui touche le modèle (référence par `id`) : plan séparé.
- Validation des absences ponctuelles (date obligatoire) et des autres champs de la fiche élève.
- Chevauchement de deux absences récurrentes d'un même élève.

## Vérification

Pour chaque incrément :
1. `ng test` : tous verts, couverture ≥ 80 % sur les quatre métriques des services.
2. E2E du Paramétrage (incréments 1 à 3) ou des Élèves (incrément 4), accessibilité et annuler-refaire verts.
3. Contrôle manuel : dans le Paramétrage, modifier deux lignes, en enregistrer une, faire ANNULER puis REFAIRE depuis l'entête ; changer de section et quitter l'écran avec une saisie en cours ; saisir un identifiant en doublon ; dans une fiche élève, saisir une absence récurrente 10:00–09:00 ; charger un fichier contenant une absence 10:00–09:00 et une absence sans heure de fin → la première est inversée, la seconde supprimée.
4. Revue `revue-increment`, puis commit de l'incrément.
