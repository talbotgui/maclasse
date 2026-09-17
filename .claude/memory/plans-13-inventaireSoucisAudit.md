---
name: plans-13-inventaireSoucisAudit
description: Inventaire complet (audit expert Angular/Signals/RGAA-WCAG) des bugs, anomalies et fonctionnalités peu exploitables du code actuel — 43 constats identifiés SOU-001 à SOU-043
metadata:
  type: project
  updated: 2026-09-17
related:
  - plans-03-problemesTests
  - plans-08-conflitEdtParite
  - plans-10-edtAbsencesRegulieres
  - projet-04-composantsPartages
  - projet-05-services
  - projet-06-elementsTechniques
  - projet-09-ecran-eleves
  - projet-10-ecran-projets
  - projet-11-ecran-competences
  - projet-12-ecran-emploi-du-temps
  - projet-13-ecran-cahier-journal
  - projet-14-ecran-parametrage
---

# Inventaire des soucis de code — Audit expert Angular/Signals/RGAA-WCAG (SOU-XXX)

## Contexte et méthode

Audit demandé le 2026-09-17 : revue complète du code applicatif (`src/app/**`) sous trois angles combinés — expert Angular 21, expert Signals, expert RGAA/WCAG — pour lister tous les bugs, anomalies et fonctionnalités non exploitables ou peu utilisables présentes dans le code **actuel** (y compris les fichiers avec modifications non committées au moment de l'audit : `mc-input.*`, `ecran-parametrage.component.ts`, `libelles.ts`, `sauvegarde-auto.service.*`).

L'audit a été mené en 4 revues indépendantes en lecture seule, chacune vérifiant systématiquement les règles du projet (`.claude/rules/*.md`) et les fiches mémoire (`projet-*.md`) avant de qualifier un constat de "bug" :

1. **Services, commandes, gardes, directives, app racine** — `services/avecEtat`, `services/sansEtat`, `commandes/`, `gardes/`, `directives/`, `utilitaires/`, `tuyaux/`, `app.ts`/`app.routes.ts`.
2. **Composants partagés et popins** — `composants/**`.
3. **Écrans Élèves / Projets / Compétences / Emploi du temps**.
4. **Écrans Cahier Journal / Paramétrage / Accueil / Démarrage**.

Chaque revue a exclu ce qui est déjà tracé par un plan existant. Sont donc **volontairement absents de cet inventaire** :
- Le bug de parité déjà corrigé/tracé dans `EmploiDuTempsService.calculerConflitsAbsences` ([[plans-08-conflitEdtParite]]).
- L'icône ⚠ par créneau EDT prévue mais jamais câblée ([[plans-10-edtAbsencesRegulieres]]).
- Les évolutions déjà planifiées (temps multiples EDT, EDT calculés — [[plans-11-edtTempsMultiples]]/[[plans-12-edtEmploisCalcules]]).
- Les problèmes déjà inventoriés côté tests automatisés ([[plans-03-problemesTests]]).

Deux constats remontés indépendamment par deux revues différentes mais désignant le même défaut ont été fusionnés (SOU-012, SOU-006).

**Numérotation** : chaque constat porte un identifiant unique `SOU-XXX`, stable dans le temps — à citer dans les commits/PR qui le corrigent.

---

## Récapitulatif par sévérité

| Sévérité | Nombre | IDs |
|---|---|---|
| CRITIQUE | 6 | SOU-001, SOU-018, SOU-019, SOU-020, SOU-021 |
| MAJEUR | 15 | SOU-002 à SOU-005, SOU-012, SOU-013, SOU-022 à SOU-024, SOU-031 à SOU-035 |
| MODÉRÉ | 13 | SOU-006 à SOU-009, SOU-014, SOU-015, SOU-025 à SOU-027, SOU-036 à SOU-039 |
| MINEUR | 9 | SOU-010, SOU-011, SOU-016, SOU-017, SOU-028 à SOU-030, SOU-040 à SOU-043 |

*(4 sévérités × comptage détaillé dans les tableaux ci-dessous ; total 43 constats.)*

---

## 1. Composants partagés et popins (SOU-001 à SOU-011)

| ID | Sévérité | Catégorie | Fichier:Ligne(s) | Description | Scénario concret d'échec |
|---|---|---|---|---|---|
| **SOU-001** | CRITIQUE | Bug fonctionnel | `mc-entete/mc-entete.component.html:55` | Le lien de navigation "Compétences" porte `title="coucou"` — texte de test resté en dur (visible sur toutes les pages), au lieu du binding `[title]` utilisé par tous les autres liens. | Tout utilisateur survolant "Compétences" dans l'en-tête voit la bulle d'aide "coucou". |
| **SOU-002** | MAJEUR | RGAA | `mc-arbre-competences/mc-arbre-competences.component.html:25,30-36,54-63` + `.ts:191-237` | Pas de roving tabindex sur l'arbre `role="tree"` (chaque bouton toggle/libellé/"+" est un stop Tab séparé) ; les attributs `role="treeitem"`/`aria-selected`/`aria-expanded` sont portés par un `<div>` parent différent de l'élément réellement focalisé ; le conteneur `role="tree"` n'a pas de `aria-label`. | Un utilisateur clavier doit Tabuler à travers tous les boutons de tous les nœuds visibles pour sortir de l'arbre ; un lecteur d'écran n'annonce jamais l'état "développé/sélectionné" de l'élément focalisé. |
| **SOU-003** | MAJEUR | RGAA | `mc-arbre-competences/mc-arbre-competences.component.ts:191-237` | Le bouton libellé (focalisable via les flèches) ne gère ni `Enter` ni `Espace` dans `naviguerClavier()` — seul le bouton séparé "+" ajoute au panier. | Après avoir navigué aux flèches jusqu'à une compétence, impossible de l'ajouter au panier avec Entrée/Espace ; il faut Tabuler en plus vers le bouton "+". |
| **SOU-004** | MAJEUR | RGAA | `mc-entete/mc-entete.component.html:114-136` | Le panneau de résultats de recherche globale (`role="listbox"`/`role="option"`) n'a aucune navigation clavier ↓/↑/Début/Fin câblée, contrairement à `rgaa-accessibilite.md` et à `mc-selecteur-competences` qui, lui, l'implémente. | Un utilisateur clavier doit Tabuler résultat par résultat au lieu d'utiliser les flèches ; un lecteur d'écran annonce une interaction listbox qui ne répond pas aux flèches. |
| **SOU-005** | MAJEUR | RGAA / Ergonomie | `mc-bouton-destruction/mc-bouton-destruction.component.html:1-37` | Au clic sur SUPPRIMER, le bouton disparaît (`@if`/`@else`) et bascule vers ANNULER/CONFIRMER sans `[mcAutoFocus]`, contrairement à `popin-avertissement`. Composant très réutilisé (fiches, référentiels de paramétrage). | Un utilisateur clavier appuie sur Entrée sur SUPPRIMER : le focus tombe sur `<body>`, il doit re-Tabuler depuis le début de la page pour trouver CONFIRMER/ANNULER. |
| **SOU-006** | MODÉRÉ | RGAA / Convention | `composants/popins/popin-demarrage/popin-demarrage.component.html:25-32` et `.ts` | Le bouton "Créer" utilise l'attribut natif `autofocus` au lieu de `[mcAutoFocus]` imposée par `rgaa-accessibilite.md` pour toute modale ; `McAutoFocusDirective` n'est même pas importée — seule popin du projet à dévier du pattern uniforme et testable des 5 autres popins. | Un futur changement du bouton "Créer" (ex. `disabled` initial) pourrait casser silencieusement le focus initial sans qu'aucun test `mcAutoFocus` ne l'attrape. |
| **SOU-007** | MODÉRÉ | RGAA | `mc-mini-calendrier/mc-mini-calendrier.component.html:44-49` | `[attr.aria-label]="caseCalendrier.date"` expose la date brute ISO (`"2026-06-15"`) au lieu d'un libellé lisible ; les états "entrée CJ existante" (pastille CSS) et "aujourd'hui" (bordure CSS) ne sont véhiculés que visuellement. | Un lecteur d'écran énonce "deux mille vingt-six tiret zéro six tiret un cinq" et ne restitue jamais quels jours ont déjà une séance ou lequel est "aujourd'hui". |
| **SOU-008** | MODÉRÉ | Signals / CVA | `mc-select/mc-select.component.ts:60-62` (`writeValue`) | `writeValue` ne vérifie pas que la valeur reçue correspond à une option de `options()` ; si aucune ne matche, le navigateur affiche la première option alors que le signal interne garde la valeur d'origine. | Un select initialisé avec une valeur absente de `options()` (ex. options chargées de façon asynchrone) affiche une option visuelle différente de la valeur réellement retenue par le modèle, sans que l'utilisateur ne s'en rende compte. |
| **SOU-009** | MODÉRÉ | Ergonomie | `mc-selecteur-competences/mc-selecteur-competences.component.ts:166-169,217-222` | La touche Échap ferme le panneau ET vide entièrement le champ de saisie en une seule étape (`this.saisie.set('')` dans `fermer()`). | Un utilisateur appuyant sur Échap par réflexe pour juste fermer la liste de suggestions perd instantanément tout son texte saisi. |
| **SOU-010** | MINEUR | RGAA | `mc-selecteur-competences/mc-selecteur-competences.component.html:17-34` + `.ts:143-171` | Pas de gestion `Home`/`End` pour aller à la première/dernière suggestion ; pas d'`aria-haspopup="listbox"` sur l'input. | Avec une longue liste de suggestions, impossible de sauter directement au premier/dernier résultat. |
| **SOU-011** | MINEUR | RGAA | `mc-pastilles-eleves-concernes/mc-pastilles-eleves-concernes.component.html:2-5` | Le conteneur `<div>` porte un `[attr.aria-label]` sans rôle explicite (`role="group"`), contrairement à `mc-eleves-concernes.component.html:43-47` pour un cas similaire. | Selon le lecteur d'écran utilisé, le regroupement de pastilles peut être parcouru sans que son intitulé de groupe ne soit jamais annoncé. |

---

## 2. Services, commandes, gardes, directives, app racine (SOU-012 à SOU-017)

| ID | Sévérité | Catégorie | Fichier:Ligne(s) | Description | Scénario concret d'échec |
|---|---|---|---|---|---|
| **SOU-012** | MAJEUR | Bug fonctionnel | `services/sansEtat/cahier-journal.service.ts:392-436` (`calculerConflitsAbsences`) | Contrairement à `EleveService.genererLibellesAbsencesDuJour` (qui filtre par `abs.paritesSemaine`), cette méthode ne compare que `abs.jour === jourSemaine` + chevauchement horaire, sans jamais vérifier la parité de semaine. Bug **distinct** de celui déjà tracé par [[plans-08-conflitEdtParite]] (qui ne concerne que `EmploiDuTempsService`, un autre service). Aucun test ne couvre la branche parité-incompatible (`cahier-journal.service.spec.ts:644-813` n'utilise que `'lesDeux'`). | Un élève a une absence récurrente le lundi 09:00-10:00 seulement en semaine impaire. Créer une séance CJ le concernant un lundi de semaine **paire**, même horaire : la popin de conflits s'ouvre à tort alors qu'il n'y a aucun conflit réel ce jour précis. |
| **SOU-013** | MAJEUR | Bug fonctionnel / Perte de données | `app.routes.ts:50-65` (routes `emploi-du-temps`, `cahier-journal`) | Ces deux routes n'ont pas `canDeactivate: [modificationsNonEnregistreesGarde]`, contrairement à `eleves`/`projets`. Or `edt-formulaire` et `cj-formulaire-seance` suivent le même pattern "édition locale + ENREGISTRER explicite" que les formulaires Élèves/Projets, sans implémenter `AvecNavigationGardee`. | L'utilisateur édite un créneau EDT (ou une séance CJ) puis clique un lien de navigation sans ENREGISTRER : la saisie est perdue silencieusement, sans la popin d'avertissement pourtant présente pour Élèves/Projets. |
| **SOU-014** | MODÉRÉ | Fonctionnalité non exploitable (code mort) | `commandes/commande-deplacement.ts`, `commandes/commande-par-index.ts:14-49` (`CommandeSuppressionParIndex`) | Ces 2 classes du pattern Commande n'ont aucun appelant dans `src/app` ni aucun test ; `LIBELLES.commandes` ne contient aucune entrée de type "déplacement". Aucune fonctionnalité de réordonnancement par déplacement d'index n'a jamais été câblée (le réordonnancement CJ existant utilise une logique d'échange différente). | Code mort à 0% de couverture ; risque de confusion pour un futur développeur qui croirait cette commande utilisée, ou de duplication si une fonctionnalité de drag & drop est ajoutée sans réutiliser ce code déjà écrit. |
| **SOU-015** | MODÉRÉ | Fonctionnalité non exploitable (état demi-câblé) | `services/avecEtat/contexte.service.ts:29-30` (`jourCourantCahierJournal`) | Le signal est déclaré et documenté comme conservant le dernier jour consulté du cahier journal entre changements d'écran, au même titre que `eleveSelectionne`/`projetSelectionne` (bien câblés eux). `EcranCahierJournalComponent` n'injecte même pas `ContexteService`. | L'utilisateur consulte le CJ au 12 juin, va sur Élèves puis revient sur Cahier Journal : la date sélectionnée n'est pas restaurée (retombe sur la date par défaut), contrairement au comportement analogue attendu pour élève/projet sélectionné. |
| **SOU-016** | MINEUR | Signals/Angular (redondance) | `app.ts:23-25` | `App` enregistre un `effect()` qui réapplique le thème (`contexte.appliquerTheme(...)`) alors que `ContexteService` l'applique déjà lui-même à la construction et dans `basculerTheme()`. Redondant mais idempotent aujourd'hui. | Si `appliquerTheme` devient coûteuse ou a un effet de bord (animation, mesure de layout), chaque changement de thème déclenche deux applications DOM au lieu d'une. |
| **SOU-017** | MINEUR | RGAA / Robustesse | `directives/mc-auto-focus.directive.ts:32-39` | La branche de repli (`querySelector` puis `?? el`) — systématiquement utilisée en production pour `[mcAutoFocus]` posé sur `<mc-input>` — n'est jamais testée. Si le champ ciblé est désactivé quand `mcAutoFocus` devient `true`, aucun sélecteur ne matche et `.focus()` sur l'hôte `<mc-input>` (sans `tabindex`) est un no-op silencieux. | Si un champ visé par `focusDemande` est conditionnellement désactivé, le focus RGAA exigé ne se déplace nulle part, sans erreur ni log détectable. |

---

## 3. Écrans Élèves / Projets / Compétences / Emploi du temps (SOU-018 à SOU-030)

| ID | Sévérité | Catégorie | Fichier:Ligne(s) | Description | Scénario concret d'échec |
|---|---|---|---|---|---|
| **SOU-018** | CRITIQUE | Bug fonctionnel / Perte de données | `services/sansEtat/projet.service.ts:128-149,157-174` (`modifierPeriode`/`supprimerPeriode`) | `ProjetPeriode` n'a pas de champ `id` ; ces méthodes retrouvent la période par égalité de `periodeNom`, pas par index/id. | Un projet a 2 périodes homonymes (ex. laissées à `''` par défaut). Exporter des compétences vers la 1ʳᵉ depuis l'écran Compétences : `modifierPeriode` remplace **toutes** les périodes du même nom → les compétences de la 2ᵉ période sont silencieusement écrasées. Idem pour une suppression. |
| **SOU-019** | CRITIQUE | Bug Angular (`@for`) | `ecrans/eleves/fe-fiche-eleve/fe-fiche-eleve.component.html:129` (`track annee.annee`), `ecrans/projets/fp-fiche-projet/fp-fiche-projet.component.html:47` (`track periode.periodeNom`) | Clés de `track` non garanties uniques : `ajouterCursus()` initialise `annee: new Date().getFullYear()`, `ajouterPeriode()` initialise `periodeNom: ''`. | Cliquer 2 fois sur AJOUTER (cursus élève ou période projet) sans changer la valeur par défaut, puis ENREGISTRER : Angular lève `NG0955` (clés dupliquées) et le rendu de la fiche plante. |
| **SOU-020** | CRITIQUE | Signals | `fe-formulaire-eleve.component.ts:123-129`, `fp-formulaire-projet.component.ts:79-85`, `edt-formulaire.component.ts:124-135` | L'`effect()` qui synchronise la copie locale (`formEleve`/`formProjet`/`formEdt`/`formCreneau`) depuis l'`input()` se redéclenche sans condition dès que `donneesService.donnees()` change de référence — ce qui arrive à chaque commande UNDO/REDO globale (rendue partout via `mc-entete`), même sans rapport avec l'entité éditée. | Ouvrir une fiche élève en MODIFIER, taper du texte sans ENREGISTRER, puis cliquer UNDO global pour annuler une action sur un autre écran : la saisie non enregistrée disparaît silencieusement. Même mécanisme pour Projets et les 2 formulaires EDT. |
| **SOU-021** | CRITIQUE | Ergonomie-usabilité / RGAA | `ecrans/emploi-du-temps/ecran-emploi-du-temps.component.html:26-34` | L'icône de conflit **au niveau de la liste des EDT** (chevauchement entre deux EDT) est un simple `<span role="img" title="...">` : ni bouton, ni `tabindex`, ni `(click)`. `popin-warnings-absences` existe et est utilisé par le CJ mais n'est jamais importé dans l'écran EDT. Distinct de l'icône par créneau déjà tracée en [[plans-10-edtAbsencesRegulieres]]. | Deux EDT se chevauchent (même dates + même parité) : l'icône ⚠ apparaît mais est totalement inerte, impossible à activer au clic ou au clavier pour voir le détail. |
| **SOU-022** | MAJEUR | RGAA | `ecrans/emploi-du-temps/ecran-emploi-du-temps.component.html:14,17-24` | La liste des EDT utilise `<ul role="listbox">`/`<li><button role="option">` — anti-pattern documenté par `rgaa-accessibilite.md` — sans navigation clavier ↓/↑/Début/Fin. | L'annonce ("liste, N options") laisse attendre une navigation par flèches ; seule la tabulation fonctionne, en contradiction avec le rôle annoncé. |
| **SOU-023** | MAJEUR | RGAA | `ecrans/emploi-du-temps/edt-formulaire/edt-formulaire.component.html:13,71` + `ecran-emploi-du-temps.component.html:138` (`[focusDemande]="true"` statique) | Le composant `edt-formulaire` n'est pas recréé quand on bascule d'un créneau à un autre créneau (ou d'un EDT à un autre) sans repasser par `@if(!creneau())` en mode différent : `focusDemande()` toujours `true` ne redéclenche pas l'effet de focus, contrairement à Élèves/Projets où le formulaire est toujours recréé. | Sélectionner un créneau A (focus va sur "Jour"), puis cliquer directement sur un créneau B sans annuler : le formulaire se met à jour avec les données de B mais le focus reste sur le bouton de la grille cliqué. |
| **SOU-024** | MAJEUR | Angular-typescript (convention) | `fp-formulaire-projet.component.html:14` (`annuler.emit()`), `edt-formulaire.component.html:44,50,141,149` (`edtAnnule.emit()`, `edtSupprime.emit()`, `creneauSupprime.emit(...)`) | Violation de `angular-typescript.md` : `output().emit()` appelé directement dans le template, sans méthode `onXxx()` de délégation — contrairement à `fe-formulaire-eleve.component.ts:252-254` qui, elle, délègue via `onAnnuler()`. | Le pattern "identique" entre Élèves et Projets/EDT est rompu : impossible d'intercepter/tester ces actions de la même façon sur les deux écrans. |
| **SOU-025** | MODÉRÉ | Bug fonctionnel | `fp-fiche-projet.component.html:47`, `fp-formulaire-projet.component.html:58`, `projet.service.ts` | La fiche mémoire ([[projet-10-ecran-projets]]) documente des périodes triées par date de début ascendante ; aucun tri n'est implémenté (ni composant, ni service) : affichage dans l'ordre brut d'insertion. | Ajouter "Trimestre 2" (mars) puis "Trimestre 1" (janvier) dans cet ordre : la fiche affiche "Trimestre 2" avant "Trimestre 1", contrairement à l'attendu chronologique. |
| **SOU-026** | MODÉRÉ | Ergonomie-usabilité | `ecrans/competences/ecran-competences.component.ts:112-142` (`confirmerExport`) | Le panier est vidé (`panierCompetences.set([])`) inconditionnellement, même si le projet/période ou la séance visée est introuvable (ex. supprimée entre l'ouverture de la popin et la confirmation) — sans aucun message d'erreur. | L'export échoue silencieusement (période supprimée entre-temps) mais le panier est vidé comme si tout s'était bien passé : l'utilisateur croit l'export réussi et doit reconstituer son panier. |
| **SOU-027** | MODÉRÉ | SCSS/CSS | `ecrans/emploi-du-temps/ecran-emploi-du-temps.component.scss:279-289` | Violation de `scss-css.md` ("le bloc `@media print` de `styles.scss` est la seule source de vérité") : l'écran EDT définit son propre `@media print` local, masquant aussi `.edt__droite` (au-delà de ce que fait la règle globale pour Élèves/Projets). | Toute évolution globale des règles d'impression devra être répercutée manuellement ici en plus de `styles.scss`, avec risque de divergence silencieuse. |
| **SOU-028** | MINEUR | Ergonomie-usabilité | `ecrans/emploi-du-temps/ecran-emploi-du-temps.component.html` (classes `.edt__gauche`/`.edt__droite`) | L'écran EDT ne réutilise pas les classes de layout partagées (`mc-colonne-gauche`/`mc-colonne-droite`) utilisées par Élèves et Projets ; il définit sa propre grille CSS. | Un changement de design global appliqué sur `.mc-colonne-gauche` (ex. largeur, fond) ne s'applique pas à l'écran EDT, créant une incohérence visuelle silencieuse. |
| **SOU-029** | MINEUR | Angular-typescript (architecture) | `fe-fiche-eleve.component.ts:49-55`, `fp-fiche-projet.component.ts:46-52`, `fp-formulaire-projet.component.ts:64-67`, `edt-formulaire.component.ts:79-91` | Tous les `output()` de ces sous-composants sont déclarés `public readonly` au lieu de `protected` (règle `angular-typescript.md`). | Aucun impact d'exécution ; violation systématique de la règle de visibilité sur tout le périmètre audité. |
| **SOU-030** | MINEUR | Angular-typescript / Signals | `fe-formulaire-eleve.component.ts:108,152-158`, `fp-formulaire-projet.component.ts:73,92-98`, `edt-formulaire.component.ts:113-116,142-146` | `formEleve`/`formProjet`/`formEdt`/`formCreneau` sont de simples champs de classe mutés directement (pas des signaux), avec `cdr.markForCheck()` manuel dans l'effet de synchronisation — fonctionne uniquement grâce à zone.js actif. | Si le projet passe un jour à `provideZonelessChangeDetection()`, ces 4 formulaires cesseraient de se rafraîchir à la saisie, faute de détection de changement déclenchée par la mutation directe. |

---

## 4. Écrans Cahier Journal / Paramétrage / Accueil / Démarrage (SOU-031 à SOU-043)

| ID | Sévérité | Catégorie | Fichier:Ligne(s) | Description | Scénario concret d'échec |
|---|---|---|---|---|---|
| **SOU-031** | MAJEUR | Bug fonctionnel / Fonctionnalité non exploitable | `ecrans/parametrage/ecran-parametrage.component.html:482-488,537-543` | Les sections "Raisons d'absence" et "Fréquences d'absence" passent `[desactive]="false"` en dur, sans méthode `est*Utilisee` (contrairement aux 5 autres référentiels-listes). En creusant : ces deux référentiels ne sont référencés **nulle part ailleurs** dans l'app — les champs d'absence sont en texte libre, et le select de parité côté élève est câblé sur des libellés EDT en dur, pas sur ces référentiels. | L'enseignant configure ces référentiels en pensant qu'ils alimenteront les formulaires d'absence des élèves — ils n'apparaissent jamais nulle part et peuvent être supprimés sans contrôle. |
| **SOU-032** | MAJEUR | Ergonomie / Bug fonctionnel | `ecrans/cahier-journal/ecran-cahier-journal.component.html:53-66` | Les boutons INITIALISER VIDE et INITIALISER DEPUIS L'EDT n'ont aucun `[disabled]`, alors que la spec exige leur inactivité si une entrée existe déjà pour le jour ; le service fait un early-return silencieux sans message. | Sur un jour ayant déjà des séances, cliquer sur "Initialiser depuis l'EDT" ne fait rien, sans message, donnant l'impression d'un bouton cassé. |
| **SOU-033** | MAJEUR | RGAA / Fonctionnalité non exploitable | `modeles/cahier-journal.modele.ts` (`Seance`), `ecrans/cahier-journal/ecran-cahier-journal.component.html:168-225,261-276` | Aucun champ ne persiste l'état de conflit sur `Seance` ; la liste de séances n'affiche aucune icône warning persistante. Le conflit n'est calculé qu'à l'ENREGISTRER et affiché une seule fois via une popin transitoire sans trace. | Après avoir fermé la popin de conflit à l'enregistrement, impossible de savoir visuellement, en revenant plus tard sur le jour, quelles séances ont un conflit non résolu. |
| **SOU-034** | MAJEUR | RGAA | `composants/popins/popin-demarrage/popin-demarrage.component.html:50-58`, `styles.scss:454-463` (`.sr-only`) | Le champ `<input type="file" class="sr-only">` reste dans l'ordre de tabulation sans que son `<label>` associé ne soit focusable ; aucune règle `.sr-only:focus` ne restaure un indicateur visuel. Violation de "Focus visible préservé sur tous les éléments interactifs". | Sur l'unique écran non contournable de l'application, tabuler jusqu'au champ fichier ne montre aucun indicateur visuel de focus — perte totale de repère pour un utilisateur clavier. |
| **SOU-035** | MAJEUR | Signals / Bug Angular (`@for`) | `ecrans/accueil/ecran-accueil.component.ts:11-21` (`SeanceResumee`, sans `id`), `.html:12` (`track seance.heureDebut`) | La spec CJ autorise explicitement plusieurs séances chevauchant le même horaire (ex. deux groupes en parallèle). `SeanceResumee` ne conserve pas l'`id` source, et le tracking se fait sur `heureDebut`, une clé non garantie unique. | Deux séances du jour démarrant toutes deux à 09:00 : Angular lève `NG0955` ou produit un rendu incohérent sur l'écran d'accueil. |
| **SOU-036** | MODÉRÉ | Bug fonctionnel / Ergonomie | `ecrans/cahier-journal/ecran-cahier-journal.component.html:267-272` | La popin de confirmation "SUPPRIMER JOURNÉE" passe le libellé du bouton lui-même comme message, au lieu d'un vrai texte d'avertissement (contrairement à Élèves/Projets qui utilisent `LIBELLES.commun.avertissementModifications`). | La confirmation affiche juste "Avertissement / Supprimer la journée" sans préciser que l'action est irréversible ni ce qui sera perdu, avant une suppression définitive de toutes les séances du jour. |
| **SOU-037** | MODÉRÉ | Signals | `ecrans/cahier-journal/ecran-cahier-journal.component.ts:251-254` (`editerSeance`), `:304-313` (`deplacerSeance`) | `seanceEditee` est un signal figé sur l'objet capturé au clic "modifier", jamais resynchronisé si les données changent par un autre biais (réordonnancement ↑/↓ resté actif) pendant l'édition. | Ouvrir l'édition de la séance A, puis cliquer la flèche ↑ d'une séance adjacente pour échanger les horaires avec A : le formulaire ouvert garde les anciennes heures de A ; ENREGISTRER sans y toucher annule silencieusement l'échange qui venait d'être fait. |
| **SOU-038** | MODÉRÉ | Ergonomie / Écart au spec | `composants/popins/popin-demarrage/popin-demarrage.component.html:68-78` | Le "bouton œil" documenté ([[projet-07-ecran-demarrage]]) pour basculer l'affichage du mot de passe ZIP (`password`↔`text`) est totalement absent du code. | Impossible de vérifier visuellement la saisie du mot de passe ZIP sur l'unique écran de démarrage avant de cliquer CHARGER. |
| **SOU-039** | MODÉRÉ | Signals / Bug de type | `composants/mc-input/mc-input.component.ts:94-97` (`surChangement`), `ecrans/parametrage/ecran-parametrage.component.html:640-647` (`type="number"`, `delaiSauvegardeAutoMinutes`) | `McInputComponent` ne fait aucune coercition numérique : `surChangement` transmet toujours une chaîne, même pour `type="number"`. `estPreferencesModifie()` compare alors une chaîne à un nombre (`!==`). | Retaper la même valeur "5" dans le champ délai active à tort le bouton ENREGISTRER (`"5" !== 5`) ; si l'utilisateur enregistre, `delaiSauvegardeAutoMinutes` devient la chaîne `"5"` dans les données/export ZIP au lieu d'un `number`. |
| **SOU-040** | MINEUR | Angular-typescript (convention) | `ecrans/cahier-journal/cj-formulaire-seance/cj-formulaire-seance.component.html:123` | `(click)="annuler.emit()"` appelle directement l'output dans le template, sans méthode `onAnnuler()` — violation explicite de `angular-typescript.md`. | Casse la convention testable `onXxx()` imposée par `tests-code.md` ; aucune méthode à spyer pour un futur test conforme. |
| **SOU-041** | MINEUR | Angular (convention) | `ecrans/cahier-journal/cj-formulaire-seance/cj-formulaire-seance.component.html` (entier) | Le formulaire de séance utilise `[(ngModel)]`/Template-driven Forms partout, alors que `angular-typescript.md` impose Reactive Forms — pattern déjà répandu ailleurs (ex. Paramétrage, dette acceptée en [[plans-07-sauvegardeAutomatique]]) mais non documenté comme accepté pour cet écran précis. | Pas d'échec fonctionnel direct ; dette de cohérence qui complique une future migration Reactive Forms. |
| **SOU-042** | MINEUR | Fonctionnalité non exploitable (code mort) | `composants/mc-mini-calendrier/mc-mini-calendrier.component.ts:50-56` | Les inputs `dateMin`/`dateMax` (censés limiter la navigation mensuelle) ne sont bindés nulle part dans toute l'application. | Aucun symptôme utilisateur actuel ; code écrit mais jamais exploité. |
| **SOU-043** | MINEUR | Écart au spec / Documentation | `ecrans/cahier-journal/ecran-cahier-journal.component.html:239-260` | La fiche mémoire ([[projet-13-ecran-cahier-journal]]) documente un bouton intercalaire "+" entre chaque séance pour insertion à une position précise ; le code n'a qu'un bouton "+ Ajouter séance" en bas de liste (ajout en fin, réordonnancement ensuite via ↑/↓). | Pas de perte de fonctionnalité (réordonnancement possible en compensation), simple divergence entre le document de référence et le comportement réel. |

---

## Constats vérifiés et écartés (pas de régression)

Pour mémoire, les points suivants ont été spécifiquement vérifiés pendant l'audit et **ne sont pas des bugs** :
- Les 5 popins hors `popin-demarrage` (`popin-avertissement`, `popin-export-competences`, `popin-sauvegarde`, `popin-warnings-absences`) : `<dialog>` natif + `aria-modal` + `[mcAutoFocus]` corrects.
- `mc-badge-statut` : information transmise par glyphe + `title`/`aria-label`, pas uniquement par couleur.
- `mc-input`, `mc-checkbox`, `mc-radio-group`, `mc-textarea`, `mc-champ-heure` : CVA bien implémentés, labels associés, `(input)` utilisé correctement.
- `mc-selecteur-competences` (hors SOU-009/010) : bon exemple de pattern combobox (`aria-activedescendant`, `aria-controls`, `aria-expanded`).
- `mc-chip-filtre` : bouton natif avec `aria-pressed`.
- Duplication de séance/journée (`dupliquerSeance`/`dupliquerJournee`) : `structuredClone` + nouvel UUID, pas de référence partagée.
- Bornes 1-60 du délai de sauvegarde auto : validation logique correcte (hors défaut de typage SOU-039).

## Suite à donner

**Mise à jour 2026-09-17 (soir) : traité.** SOU-001 à SOU-027, SOU-029, SOU-031 à SOU-039 ainsi que SOU-040 à SOU-043 ont été implémentés en deux incréments successifs (revus par l'agent `revue-increment`, 4 anomalies remontées et corrigées : accessibilité clavier de l'icône de conflit EDT, visibilité `public` oubliée sur `fe-formulaire-eleve`, références E2E résiduelles après SOU-031, couverture manquante SOU-015). Suite complète `ng test` verte (1023 tests, 51 fichiers), couverture ≥ 90 % sur les 4 métriques, `ng build` (dev + prod) et `tsc` E2E propres.

**Deux constats volontairement écartés, non corrigés :**
- **SOU-028** (réutiliser `mc-colonne-gauche`/`mc-colonne-droite` sur l'écran EDT) : layout EDT à 3 colonnes avec scroll imbriqué incompatible avec les classes flex globales sans risque de régression visuelle non vérifiable en CLI.
- **SOU-030** (convertir `formEleve`/`formProjet`/`formEdt`/`formCreneau` en signaux) : nécessiterait une migration complète vers Reactive Forms par formulaire (à l'image de SOU-041) ; jugé disproportionné pour un souci MINEUR purement latent (pas de bug actuel, ne se manifeste qu'en cas de passage futur à `provideZonelessChangeDetection()`).

**Reste à faire, hors du périmètre de cet incrément :**
- Nettoyer les deux clés orphelines `raisonsAbsence`/`frequencesAbsence` dans `public/donnees-defaut.json` (laissées telles quelles pour éviter un reformatage complet du fichier par un script — inertes, plus aucun code ne les lit).
- Mettre à jour [[plans-04-testsE2E]] : les scénarios E2E-93 et E2E-94 (raison/fréquence d'absence) ont été supprimés avec SOU-031, E2E-80 a été réduit d'autant.
