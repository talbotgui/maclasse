---
name: 16-site-documentaire
description: Plan du site documentaire (vitrine d'une page) publié en /maclasse/doc/ à côté de l'application — pied de page dans l'app, captures Playwright, site généré avec Claude Design, workflow GitHub Actions, README
metadata:
  type: project
  updated: 2026-09-19
related:
  - plans/14-completer-tests-e2e
  - specification/composants-partages
  - specification/themes
---

# Plan 16 — Site documentaire `/maclasse/doc/`

**Statut : proposé le 2026-09-19, en attente de validation. Aucune modification de code effectuée.**

## Décisions déjà prises

- Chemin de publication : `/maclasse/doc/` (l'URL de l'application ne change pas).
- Build et déploiement par GitHub Actions.
- Projet ouvert à tous les enseignants du primaire.
- Site très succinct, une seule page, aux couleurs de l'application (thème Océan).
- **Aucun jargon technique** dans le site (pas d'AES-256, RGPD, JSON…). Il faut dire qu'un mot de passe est nécessaire.
- Message clé : le stockage des données des élèves est de la responsabilité de l'enseignant (pas de copie ailleurs, fichier perdu ou mot de passe oublié = irrécupérable).
- Le site indique qu'il n'y a ni communication (familles) ni IA dans l'application.
- Fonctionnalités présentées en **grille** (recommandé, plus accessible qu'un carrousel) avec agrandissement de la capture au clic dans un `<dialog>`.
- Le lien vers le site est dans un **pied de page à construire** dans l'application, avec le lien vers le code source (dépôt GitHub : `github.com/talbotgui/maclasse`, l'utilisateur avait écrit « gitlab » par erreur de plume probable).
- Aucun comparatif avec d'autres outils dans le site.

## Constats sur le dépôt

- Routage en `#/` (`/maclasse/#/demarrage`), pas de service worker : `/maclasse/doc/index.html` est servi tel quel par GitHub Pages, sans conflit avec Angular.
- `public/fonts/` et `maclasse-logo-*.png` sont déjà déployés sous `/maclasse/` : le site les référence en `../fonts/…` et `../maclasse-logo-512.png`, sans duplication.
- `e2e/fixtures/avec-screenshots.fixture.ts` prend des captures pleine page pour le débogage : ne convient pas pour la vitrine, d'où une spec dédiée.
- `app.html` = `<mc-entete />` + `<router-outlet />`, host en flex colonne `min-height: 100vh` : un pied de page se place naturellement en bas.
- **Aucun `.github/` dans le dépôt ni dans l'historique git** : le workflow existe ailleurs ou reste à créer (à clarifier, voir questions).
- `e2e/donnees/maclasse-test.zip` est suivi par git malgré une entrée dans `.gitignore`.

## Phase 1 — Pied de page dans l'application

1. Créer `composants/mc-pied-de-page/` : `<footer>` (repère `contentinfo`), étend `ComposantBase`, `OnPush`.
2. Deux liens (`target="_blank" rel="noopener"`, ids `lienPresentation` et `lienCodeSource`) : « Présentation » vers `/maclasse/doc/`, « Code source » vers le dépôt GitHub. URLs en `static readonly` dans la classe, textes dans `LIBELLES`.
3. L'ajouter dans `app.html` sous le `router-outlet` (visible sur tous les écrans, `/demarrage` inclus).
4. Le masquer dans le bloc `@media print` de `styles.scss`.
5. Tests : unitaire du composant ; E2E avec `selecteurs-pied-de-page.ts` et un test « pied de page présent avec ses deux liens » ; l'audit AXE existant couvre le reste.

Limite : en `ng serve`, `/maclasse/doc/` renvoie 404 (site non construit). À documenter.

## Phase 2 — Captures d'écran

1. `e2e/tests/captures-documentation.spec.ts`, exclue de `npm run e2e` (projet ou tag dédié), lancée par `npm run documentation:captures`.
2. Viewport fixe 1440×900, thème Océan, zone utile (pas de `fullPage`), sélecteurs dans les classes de `e2e/selecteurs/`.
3. Jeu de données `maclasse-test.zip` : vérifier qu'il est assez riche et présentable (noms fictifs plausibles, plusieurs élèves, cahier journal rempli, EDT calculé). Sinon l'enrichir.
4. Captures dans `docs-site/images/` : `01-demarrage` (création/ouverture du coffre-fort avec mot de passe), `02-accueil`, `03-eleves`, `04-projets`, `05-competences`, `06-emploi-du-temps`, `07-emploi-du-temps-calcule`, `08-cahier-journal`, `09-recherche`, `10-impression` (`emulateMedia print`).
5. Format : PNG optimisé ou WebP selon le poids (cible < 150 Ko/image), `alt` rédigé pour chacune.
6. Images **versionnées** (choix éditorial relu à l'œil, CI plus rapide) et regénérées à la main quand l'interface change ; à noter dans le README.

## Phase 3 — Le site

1. Génération avec Claude Design (prompt validé le 2026-09-19 : one-page HTML/CSS/JS natif, sans CDN, sans jargon, sections accroche / 3 promesses / grille des fonctionnalités / 3 étapes / responsabilité des données / « ce que Ma classe n'est pas » / pied de page), relecture puis intégration dans `docs-site/index.html`.
2. Contrôles : aucun terme technique, message de responsabilité présent, aucun appel externe, couleurs = tokens du thème Océan (valeurs recopiées de `styles.scss` dans le `:root` du site, duplication assumée, commentaire indiquant la source).
3. Audit AXE du site par une spec Playwright sur `docs-site/` servi en statique ; contrôle à 320 px et sans JavaScript.

## Phase 4 — Build et déploiement

Créer ou modifier le workflow GitHub Actions :
1. Checkout, Node 24, `npm ci`, `ng build` (production, baseHref `/maclasse/`).
2. Copier `docs-site/` dans `<sortie du build>/doc/` ; vérifier dans le workflow que `doc/index.html` existe.
3. `upload-pages-artifact` puis `deploy-pages` ; source Pages du dépôt = « GitHub Actions » (l'URL ne change pas).
4. Script `npm run documentation` : copie le site dans un dossier de prévisualisation avec les bons chemins relatifs.

## Phase 5 — README et documentation

- README : en tête deux liens (« Ouvrir l'application », « Présentation »), suppression de la description fonctionnelle (renvoi vers le site), conservation des sections installation/développement, note sur la régénération des captures.
- Documentation : ajouter une ligne sur le pied de page dans `docs/specification/composants-partages.md` à l'implémentation.

## Ordre et validation

| Étape | Livrable | Validation |
|---|---|---|
| 1 | Pied de page | utilisateur + `revue-increment` |
| 2 | Captures | utilisateur, sur les images |
| 3 | Site | utilisateur, sur le rendu |
| 4 | Workflow | exécution réelle |
| 5 | README + documentation | utilisateur |

Chaque étape commence par une reformulation et un accord explicite (règle `collaboration.md`). Phases 1 et 2 indépendantes, réalisables en parallèle.

## Concurrents vérifiés (2026-09-19)

- **PrimSchool** : concurrent direct. Gratuit sans limite (version Essentiel), logiciel à installer (Windows/macOS/Linux), données locales et hors ligne, synchro cloud optionnelle, export LSU, livrets, statistiques ; aucune mention de chiffrement.
- **Teetsh** : essai 1 mois puis payant, programmes officiels, partage entre binômes, **assistant IA**.
- **Classyc** : 3,99 €/mois, serveurs AWS Paris, chiffrement, partage de l'EDT avec les parents.
- **Edujournal (Edumoov)** : 18 €/an, hébergé en France, bibliothèque de préparations partagées, lien avec Educartable (cahier de textes/liaison familles).
- **Beneylu School** : ENT vendu aux écoles, ~20 applications, profils élèves/parents/enseignants.
- **MonCahierJournal, cahier journal gratuit de professeurs-des-ecoles.com** : gratuits avec compte, en ligne.
- Différenciation possible : rien à installer (navigateur), coffre-fort à mot de passe, aucune synchro cloud même optionnelle, RGAA, code ouvert, aucune IA ni communication. Point faible face à PrimSchool : pas d'export LSU ni de livrets — ne pas se comparer point par point.

## Risques

- Captures qui vieillissent (mise à jour manuelle).
- Lien mort en développement.
- Jeu de données pauvre = captures peu convaincantes.
- Le message de responsabilité est une aide de lecture, sans valeur juridique : aucune affirmation de conformité légale dans le site.

## Questions ouvertes

1. Où est le workflow de déploiement (autre branche/dépôt) ou faut-il le créer ?
2. Mot de passe de `maclasse-test.zip` pour juger s'il est présentable ?
3. Images en PNG optimisé ou WebP ?
4. Commencer par la phase 1 (pied de page) ou la phase 2 (captures) ?
