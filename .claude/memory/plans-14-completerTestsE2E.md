---
name: plans-14-completerTestsE2E
description: Plan pour compléter les tests E2E existants, créer les scénarios manquants (EDT calculés, temps multiples, pastilles, sauvegarde auto…) et ajouter les contrôles RGAA/AXE
metadata:
  type: project
  updated: 2026-09-19
related:
  - plans-04-testsE2E
  - plans-10-edtAbsencesRegulieres
  - plans-11-edtTempsMultiples
  - plans-12-edtEmploisCalcules
  - plans-06-cahierJournalPastillesElevesConcernes
  - plans-07-sauvegardeAutomatique
---

# Plan 14 — Compléter les tests E2E, créer les manquants, ajouter le RGAA

**Statut : validé le 2026-09-19, en cours.**

Décisions : (1) numérotation refondue (voir Phase 0) ; (2) `@axe-core/playwright` accepté ; (3) audit complet en Phase 1 ; (4) les anomalies AXE sont corrigées dans ce plan, pas dans un plan séparé.

## Avancement (2026-09-19)

**Numérotation décidée** : les tests d'accessibilité forment une série propre `RGAA-xx` (fichier `e2e/tests/accessibilite.spec.ts`), ce qui libère E2E-98 et suivants pour les scénarios fonctionnels. Les anciens E2E-99 à E2E-102 (focus, piège du focus, Échap) sont absorbés par RGAA-11 à RGAA-15. Le doublon E2E-31 est levé (projet → E2E-104). Nouveaux scénarios fonctionnels à partir de E2E-105.

**Fait**
- Phase 0 : `@axe-core/playwright` installé ; `e2e/utilitaires/verificateur-accessibilite.ts` (AXE WCAG 2 A/AA + détection d'`id` dupliqués).
- Phase 4 (partielle), 16 tests RGAA-01 à RGAA-16 : AXE sur démarrage, 7 écrans, formulaires (élève, projet, EDT, créneau, séance), 10 sections du paramétrage, 5 thèmes (accueil, élèves, EDT), popins (export, avertissement, sauvegarde) ; focus de la popin de démarrage, focus des formulaires, piège du focus, Échap ; unicité des `id`.
- Anomalies corrigées dans l'application :
  - arbre des compétences : `role="tree"` vide et enfants non autorisés (boutons toggle/+ en `aria-hidden`, doublons des touches → et Entrée) ;
  - `aria-controls` du sélecteur de compétences vers un élément absent ;
  - contrastes : `mc-chip-actif` (texte en `--texte-principal`), thème Forêt (primaire `#15803d`), `--erreur` `#b91c1c`, `--texte-secondaire` du thème Terre ;
  - `id` dupliqués : `rechercheGlobale` (et autres `mc-champ-recherche`, input en `-input`), popins d'avertissement du cahier journal (`contexteId`).
- Phase 1 (début) : 8 tests E2E existants en échec avant ce plan corrigés (E2E-56 à 60 : ids des temps du créneau ; E2E-65 : le dernier jour est désormais mémorisé ; E2E-77 : doublon d'`id` ; E2E-96 : délai par défaut à 5). Suite complète : 111 tests verts.

**Anomalie applicative constatée, non corrigée (à valider)** : `creerCreneauVide()` affecte un `id` dès la création, donc `estEditionCreneau()` est vrai pour un nouveau créneau : le formulaire affiche « Modifier créneau » (et probablement SUPPRIMER) au lieu de « Créer ».

**Fait ensuite (2026-09-19)**
- Projet Playwright `mobile` (Pixel 5) limité à `e2e/tests/responsive.spec.ts` ; le projet `chromium` l'ignore. RGAA-17 (démarrage) et RGAA-18 (7 écrans) : aucun débordement horizontal + AXE. E2E-98 (libellé mobile abrégé du bouton de démarrage) est obsolète : ce libellé n'existe plus dans la popin, remplacé par ces deux tests.
- Anomalie corrigée : l'entête débordait de 214 px en mobile (WCAG 1.4.10). `mc-entete.component.scss` passe en `flex-wrap` sous 768 px.
- Navigation clavier de l'arbre des compétences (seul widget ARIA avec rôle de l'application : aucun `grid`, `listbox` ni `combobox`) : RGAA-19 (↑ ↓ Début Fin), RGAA-20 (→ ← déplier, replier, remonter), RGAA-21 (Entrée ajoute au panier).
- Suite complète : 116 tests verts (chromium + mobile), 1122 tests unitaires verts.

**Phase 1 — audit et compléments (2026-09-19)**

Audit des 97 scénarios existants (mesure automatique du nombre d'actions et d'assertions par test, puis lecture des plus faibles). Faiblesses constatées :
1. **Aucune persistance vérifiée** : les tests de création/modification contrôlent l'écran juste après ENREGISTRER, jamais après un aller-retour de navigation.
2. **ANNULER/REFAIRE** : un seul test (E2E-14) portait sur l'état des boutons ; aucun ne vérifiait l'effet sur les données.
3. **Tests d'annulation sans assertion négative** : E2E-33, 55, 59 ne vérifiaient pas que la saisie abandonnée était absente.
4. **Test vacuous par course de timing** : E2E-59 passait parce que l'assertion s'exécutait avant le rendu ; l'application désélectionne l'EDT après ANNULER (`onAnnule`), la grille disparaît. Réécrit.
5. **Cas d'erreur** : aucun. Les formulaires élève et projet n'ont aucune validation (ENREGISTRER accepte un nom vide) : constat applicatif, pas de test écrit sur un comportement non défini. Seul le paramétrage valide (délai de sauvegarde 1–60).
6. ~70 tests ont une seule assertion « forte » (le reste est `toBeVisible`/`toBeEnabled`) : signalé, non renforcé en masse.

Compléments faits : aller-retour de navigation ajouté à E2E-19, 27, 28, 29, 31 (cursus), 32, 34, 83, 87, 90 et à la création de projet ; assertions négatives dans E2E-33, 55, 59 ; nouveaux tests E2E-98 à 102 (ANNULER/REFAIRE : élève, projet, EDT, groupe du paramétrage, journée du cahier journal) et E2E-103 (délai hors bornes). Le doublon E2E-31 est levé : « Créer un nouveau projet » devient E2E-104. Nouveaux IDs fonctionnels à partir de E2E-105. Suite complète : 122 tests verts.

**Correctifs applicatifs suite à l'audit (2026-09-19, validés par l'utilisateur)** : (1) le formulaire de créneau affiche « Créer » ou « Modifier » selon le cas (`creneauExistant`) ; (2) ANNULER dans l'EDT ne désélectionne plus l'EDT (`onAnnule`), le panneau de droite reste alors vide jusqu'à un clic sur l'EDT ; (3) validation : prénom et nom obligatoires (élève), nom obligatoire (projet), ENREGISTRER désactivé. Tests : E2E-105 (titre du créneau), E2E-106 (élève), E2E-107 (projet) ; suite E2E : 125 tests verts. Constat non traité : ENREGISTRER grisé sans message d'aide (RGAA) et un élève/projet déjà enregistré avec un nom vide devient non modifiable ; E2E-95 (jour férié) était instable (données par défaut avec 10 jours fériés), corrigé.

**Numérotation** : les IDs E2E-98 et suivants de `plans-04-testsE2E.md` (mobile, focus, migration…) sont périmés ; les IDs réels sont ceux des fichiers `e2e/tests/*.spec.ts`. Prochains scénarios fonctionnels à partir de E2E-108.

**Phase 2 — nouveaux scénarios fonctionnels (2026-09-19)** : E2E-108 (bandeau d'absences selon la parité), 109 (icône ⚠ et popin de conflit), 110 (parité respectée dans les conflits), 111 (créneau à temps multiples, jusqu'à 4, suppression), 112 à 116 (EDT calculés : création et lecture seule, validation, source absences, modifier/supprimer, annuler/refaire), 117 (pastilles du cahier journal), 118 (pastilles de l'EDT et renommage de groupe), 119 et 120 (sauvegarde automatique réelle avec `page.clock` : seulement si modifié, relance du timer par le délai), 121 (aller-retour d'un fichier sauvegardé), 122 (changer le jour d'un créneau le déplace), 123 (popin de navigation du cahier journal), 124 (notes pré-remplies avec les absences). Ajouts RGAA-22 à RGAA-24 (AXE : popin de conflits, popin d'export avec choix, EDT calculé). E2E-76 vérifie maintenant le contenu de la popin d'absences. Suite : 145 tests verts.
Anomalies corrigées : contraste du texte d'avertissement (nouvelle variable `--avertissement-texte`, 5 thèmes) ; E2E-95 réécrit (il modifiait en réalité la ligne 0 « Toussaint » et était instable : le nouveau jour férié est créé à l'index 10).
Limites connues : E2E-124 vise un vendredi à environ 2,5 semaines de la date d'exécution (pas de jour férié dans cette fenêtre tant que les données par défaut s'arrêtent en 2026) ; E2E-110 compare deux comptes de conflits sur les données par défaut.

**Reste à faire** : Phase 3 (migration, version incompatible), mise à jour de `plans-04-testsE2E.md`.

Note : `RGAA-xx` est réparti sur `accessibilite.spec.ts` (01-16, 19-21) et `responsive.spec.ts` (17-18).

## Constat de départ (analyse du 2026-09-19)

- `plans-04` prévoit 104 scénarios, 97 écrits (E2E-01 à E2E-97) dans `e2e/tests/*.spec.ts`.
- Non écrits : E2E-98 à E2E-104 (mobile, focus, piège du focus, Échap, migration, version incompatible).
- Aucun test pour les évolutions postérieures à juin 2026 (plans 05 à 12).
- Aucun contrôle AXE ni test au viewport mobile, alors que `rgaa-accessibilite.md` exige « tous les contrôles AXE au vert ».
- `@axe-core/playwright` n'est pas dans `package.json`.
- Doublon d'identifiant : E2E-31 sert à la fois aux élèves (cursus) et aux projets (créer un projet).
- E2E-93 et E2E-94 sont retirés volontairement (SOU-031).

## Contraintes à respecter (rules/tests-e2e.md, html-ids.md)

- Sélecteurs uniquement dans `e2e/selecteurs/` : propriétés `readonly`, aucune méthode à paramètre, aucun `page.locator()` inline dans un `*.spec.ts`.
- Index littéraux fixes, jamais calculés (jeu de données figé `maclasse-test.zip`).
- Pas de `page.goto()` vers un écran protégé avec `testAvecDonnees` : navigation SPA.
- Tout nouvel élément interactif du code applicatif doit avoir un `id` lowerCamelCase. Un sélecteur qui manque d'`id` impose de modifier le HTML : à valider séparément.

## Phase 0 — Préparation

1. Renuméroter : E2E-31 (projet) devient E2E-31b, ou renuméroter toute la suite. Recommandation : garder les IDs existants, nommer les nouveaux à partir de E2E-105, et corriger le doublon en E2E-31 (projets) → E2E-105.
2. Mettre à jour `plans-04-testsE2E.md` : ajouter les scénarios nouveaux et marquer 93/94 supprimés.
3. Ajouter `@axe-core/playwright` en devDependency et une fixture `avec-axe.fixture.ts` exposant une aide `verifierAccessibilite(page)` (classe statique, règles WCAG 2 A/AA).
4. Créer les jeux de données ZIP nécessaires (voir Phase 3).

## Phase 1 — Compléter les tests existants

Objectif : renforcer les tests écrits qui vérifient trop peu.

1. **Audit** (sortie : tableau écran → scénario → faiblesse). Critères de faiblesse :
   - un scénario qui ne vérifie que la visibilité (`toBeVisible()`) sans contrôler le contenu ou l'état obtenu ;
   - une action sans vérification du résultat persistant (données réellement modifiées après navigation aller-retour) ;
   - aucun cas d'erreur ou de limite (champ obligatoire vide, valeur hors bornes) ;
   - aucun test UNDO/REDO après l'action testée.
2. Compléments déjà identifiés :
   - **Sauvegarde automatique** : E2E-96 ne teste que le réglage du délai. Ajouter le déclenchement réel (délai minimal de 1 min : utiliser `page.clock` de Playwright pour avancer le temps, sans `waitForTimeout`), la non-sauvegarde sans modification, la relance du timer après sauvegarde.
   - **UNDO/REDO** : vérifier l'annulation et le rétablissement sur au moins un cas par écran (élèves, projets, EDT, cahier journal, paramétrage).
   - **Cahier journal** : pré-remplissage des notes avec les absences du jour (plan 05), filtrage par parité de semaine, non-écrasement si les notes sont déjà remplies.
   - **Accueil** : résumé sans récréation ni pause.
   - **Entête** : cycle complet des 5 thèmes, persistance du thème après rechargement, tooltip de sauvegarde.
3. Livrable : les scénarios existants modifiés gardent leur ID ; ajouter les étapes ou assertions sans changer l'intitulé, sauf si le périmètre change.

## Phase 2 — Nouveaux scénarios fonctionnels

Nouveaux sélecteurs à ajouter dans `selecteurs-emploi-du-temps.ts`, `selecteurs-cahier-journal.ts` et un fichier `selecteurs-pastilles.ts` si nécessaire.

### EDT — temps multiples (plan 11)
- E2E-105 : créer un créneau avec plusieurs temps (jusqu'à 4), chacun avec son horaire.
- E2E-106 : refus d'un cinquième temps.
- E2E-107 : supprimer un temps d'un créneau.
- E2E-108 : déplacer un temps vers une autre journée (commit `1e81ab7`).

### EDT — absences régulières et conflits (plan 10, plan 08)
- E2E-109 : le bandeau d'absences suit l'EDT sélectionné (jour et parité).
- E2E-110 : l'icône ⚠ de conflit apparaît sur le créneau concerné.
- E2E-111 : pas de conflit si les parités sont incompatibles (semaine paire / impaire).

### EDT — emplois du temps calculés (plan 12)
- E2E-112 : créer un EDT calculé (`btnCreerEdtCalcule`).
- E2E-113 : consulter un EDT calculé : lecture seule, pas de bouton MODIFIER.
- E2E-114 : le calcul intègre récréations, temps de classe et absences régulières.
- E2E-115 : supprimer un EDT calculé.
- E2E-116 : le titre « Mes emplois du temps » et la liste des EDT calculés s'affichent (plan 09).
- E2E-117 : limites connues du plan 12 : à lire dans `plans-12-edtEmploisCalcules.md` avant écriture.

### Pastilles élèves/groupes (plan 06)
- E2E-118 : pastilles statiques dans une séance du cahier journal.
- E2E-119 : pastilles dans un créneau de l'EDT.
- E2E-120 : le libellé d'une pastille suit le renommage d'un groupe.

### Popins
- E2E-121 : popin `popin-warnings-absences` (contenu et actions).
- E2E-122 : popin `popin-export-competences` (annulation, choix vide).

### Sauvegarde et données
- E2E-123 : sauvegarde automatique après modification (voir Phase 1).
- E2E-124 : rechargement d'un ZIP sauvegardé : les modifications sont retrouvées (aller-retour complet).

## Phase 3 — Scénarios prévus non écrits (E2E-98 à E2E-104)

- **E2E-103** (migration) : fabriquer un ZIP de version antérieure. Solution : script `e2e/donnees/generer-versions.ts` qui produit `maclasse-v-anterieure.zip` et `maclasse-v-future.zip` en réutilisant `ChiffrementService` (mot de passe de test connu). Vérifier avec `migration.service.ts` les versions réellement gérées.
- **E2E-104** : version incompatible → message bloquant et popin de démarrage toujours ouverte.
- **E2E-98** : viewport mobile, libellé du bouton de démarrage (voir Phase 4 pour le projet Playwright mobile).
- E2E-99 à E2E-102 sont traités en Phase 4 (RGAA).

## Phase 4 — RGAA / accessibilité

Nouveau fichier `e2e/tests/accessibilite.spec.ts`, avec une fixture partagée.

1. **Contrôles AXE** (WCAG 2 A/AA), un test par état d'écran :
   - démarrage (popin ouverte), accueil, élèves (liste, fiche, formulaire), projets, compétences, EDT (grille, formulaire créneau, formulaire EDT calculé), cahier journal (journée remplie, formulaire de séance), paramétrage (une passe par section).
   - Popins : avertissement, sauvegarde, export des compétences, warnings d'absences.
   - **Chaque thème** (Océan, Forêt, Crépuscule, Terre, Contraste) sur au moins un écran chargé, pour le contraste.
2. **Focus** (E2E-99, E2E-100, E2E-101, E2E-102) :
   - E2E-99 : focus sur la popin de démarrage à l'ouverture (`mcAutoFocus`).
   - E2E-100 : au clic sur CRÉER (élèves, projets, EDT, séance CJ), focus sur le premier champ éditable (`focusDemande`).
   - E2E-101 : le focus reste piégé dans une popin modale (Tab / Maj+Tab).
   - E2E-102 : Échap ferme la popin **si elle est fermable** ; la popin de démarrage ne se ferme pas.
   - Retour du focus sur l'élément déclencheur à la fermeture d'une popin (à vérifier : si le comportement n'existe pas, l'ajouter à la liste d'anomalies, pas au périmètre de tests).
3. **Navigation clavier** des widgets ARIA avancés (`rgaa-accessibilite.md`) : arbre des compétences (`role="tree"` : ↓ ↑ → ← Début Fin), tout `listbox` / `combobox` / `grid` présent, mini-calendrier.
4. **Contrôles transverses** : focus visible sur les éléments interactifs, lien d'évitement ou structure de titres (`h1` unique par écran), libellé associé à chaque champ.
5. **Responsive** (E2E-98) : ajouter dans `playwright.config.ts` un projet `mobile` (viewport 375×667) limité au fichier `accessibilite.spec.ts` et au scénario E2E-98 (via `testMatch`).

Les anomalies détectées par AXE ne sont pas corrigées dans ce plan : elles sont listées dans un fichier d'inventaire (comme `plans-13-inventaireSoucisAudit`) et traitées ensuite. Un test AXE en échec temporaire peut être marqué `test.fixme` avec la référence de l'anomalie, jamais désactivé sans trace.

## Ordre d'exécution proposé

1. Phase 0 (préparation + fixture axe).
2. Phase 4 (AXE) : donne tout de suite l'inventaire des anomalies d'accessibilité.
3. Phase 3 (scénarios prévus).
4. Phase 2 (nouveaux scénarios) écran par écran : EDT, puis cahier journal, puis pastilles et popins.
5. Phase 1 (compléments) : audit, puis renforcement.
6. Relecture avec l'agent `revue-increment` à la fin de chaque phase complète, pas entre deux scénarios.

## Vérification

- `npm run e2e` doit passer en entier après chaque phase.
- `npm run e2e:couverture` avant et après : comparer la couverture V8 pour confirmer l'apport (seuil visé : pas de régression, hausse mesurable sur les composants EDT et pastilles).
- Mettre à jour `plans-04-testsE2E.md` et `MEMORY.md` en fin de chaque phase.

## Points à trancher avec l'utilisateur

1. Renumérotation : nouveaux IDs à partir de E2E-105 (proposé) ou refonte complète.
2. Ajout de la dépendance `@axe-core/playwright`.
3. Périmètre de Phase 1 : audit complet d'abord (proposé), ou seulement les compléments déjà identifiés.
4. Traitement des anomalies AXE : inventaire puis correction dans un plan séparé (proposé).
5. Scénarios E2E-117 : lecture de `plans-12` pour figer les limites avant d'écrire le test.
