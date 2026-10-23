---
name: 25-eleves-onglets-bilans
description: Plan d'évolution — pluriels « Emplois du temps » / « Cahiers journaux » ; écran Élèves en onglets (Fiche administrative / Bilans), bilans par sous-domaine de compétences avec textes riches Tiptap et tableau d'évaluations ; suppression des modèles PPI et bulletins
metadata:
  type: project
  updated: 2026-10-23
related:
  - specification/ecrans/eleves
  - specification/modeles-donnees
  - specification/services
  - specification/composants-partages
---

# Plan 25 — Menu au pluriel + écran Élèves en onglets (Fiche administrative / Bilans)

**Statut : terminé le 2026-10-23.** Analyse, décisions et plan validés le 2026-10-23 ; incréments 1 à 5 réalisés le 2026-10-23. Écarts au plan : `mc-onglets` et `mc-editeur-riche` dans `composants/` à la demande de l'utilisateur ; un nouveau bilan reste un brouillon d'écran jusqu'à VALIDER (`BilanService.enregistrerBilan`) ; dans un sous-arbre, la liste des compétences s'ouvre au clic ou à ↓ et non au focus (contrôle AXE) ; le cadre de sous-domaine est intégré à `fe-onglet-bilans` (pas de composant `fe-sous-domaine`) ; le sélecteur d'une ligne propose aussi les compétences déjà évaluées, le doublon étant bloqué par un message à VALIDER. Les bilans ajoutent environ 330 kB (90 kB compressés) au chunk paresseux de l'écran Élèves (Tiptap/ProseMirror).

## Contexte

Deux demandes :
1. **Pluriels** : « Emploi du temps » → « Emplois du temps », « Cahier journal » → « Cahiers journaux ». Le changement s'applique au menu **et** aux titres des deux écrans.
2. **Écran Élèves** :
   - La liste des élèves reste à gauche.
   - La colonne droite passe en deux onglets. **Fiche administrative** reprend la fiche et le formulaire actuels, avec les boutons MODIFIER / SUPPRIMER / IMPRIMER. **Bilans** est nouveau.
   - Dans l'onglet Bilans, les bilans sont regroupés par sous-domaine (compétence de niveau 3). Chaque bilan a une date, un titre, trois textes riches (Tiptap) et un tableau d'évaluations.


---

## 1. Ce qui existe dans l'application

- **Libellés** :
  - menu : `LIBELLES.navigation.emploiDuTemps` / `cahierJournal` (`src/app/libelles.ts:63-64`) ;
  - titres d'écran : `LIBELLES.emploiDuTemps.titre` (l.220) et `LIBELLES.cahierJournal.titre` (l.290).
  - Il faut vérifier les E2E qui ciblent ces textes (`e2e/`).
- **Écran Élèves** :
  - `ecran-eleves.component` (hérite d'`EcranEditionGardeeBase`) affiche soit `fe-fiche-eleve` (lecture, avec les boutons), soit `fe-formulaire-eleve` (Reactive Forms).
  - Aucun composant d'onglets n'existe. Aucun éditeur riche n'existe.
- **Compétences** :
  - L'arbre a 4 niveaux. Le niveau 2 est un **cycle**. Le niveau 3 compte 126 nœuds : ce sont les sous-domaines. Le niveau 4 contient les compétences évaluables.
  - Exemple : `Activités physiques > Cycle 1 > Agir dans l'espace… > Courir, sauter…`
  - `CompetenceService` fournit `obtenirDomaines()` (respecte `domainesActifs`), `obtenirChemin(id)`, `resoudreLibelle`, `rechercherCompetences`.
  - `mc-selecteur-competences` (autocomplétion, `multiSelection`) cherche dans tout l'arbre.
- **Modèles « phase 2 » jamais alimentés** :
  - `ppi: Ppi[]` et `bulletins: Bulletin[]` dans `DonneesApplication` (`ppi-bulletin.modele.ts`) ;
  - ils sont lus par `ReferentielService.estStatutAcquisitionUtilise` et `estPeriodeUtilisee`.
- **Champ texte existant** : `Eleve.bilans: string`, dans la section Identité.

---

## 2. Modèle de données

### Nouveau `src/app/modeles/bilan.modele.ts`

```ts
/** Évaluation d'une compétence (niveau 4) dans un bilan. */
export interface EvaluationBilan {
  id: string;                          // UUID (track des lignes)
  competenceId: string;                // feuille du sous-domaine
  statutAcquisitionId: string | null;  // réf. StatutAcquisition ; null = non renseignée
  commentaire: string;
}

/** Bilan d'un élève sur un sous-domaine. */
export interface Bilan {
  id: string;                  // UUID
  date: string;                // ISO, aujourd'hui par défaut
  titre: string;               // pas de valeur par défaut
  bilans: string;              // HTML Tiptap
  besoinsSpecifiques: string;  // HTML Tiptap
  moyens: string;              // HTML Tiptap
  evaluations: EvaluationBilan[];
}

/** Bilans d'un élève pour un sous-domaine (compétence de niveau 3). */
export interface SuiviSousDomaine {
  sousDomaineId: string;
  bilans: Bilan[];             // ordre du tableau = ordre affiché (Monter/Descendre)
}
```

### Modifications de l'existant

**`Eleve`**
- Ajout de `suivisSousDomaines: SuiviSousDomaine[]`.
- `bilans: string` est renommé **`bilansExternes`**, libellé « Bilans externes ». Il reste dans la fiche administrative.

**Suppression complète de `ppi` et `bulletins`**
- Fichier `ppi-bulletin.modele.ts`.
- Clés de `DonneesApplication` et `donnees-defaut.json`.
- `DonneesMother`.
- Vérifications de `ReferentielService` :
  - `estStatutAcquisitionUtilise` lit désormais les évaluations des bilans ;
  - `estPeriodeUtilisee` ne lit plus que les projets.
- Spécification (`modeles-donnees.md`, `description-generale.md`, mentions de « phase 2 »).

**Migration `2026.10.1`** (`MigrationService`)
- Ajouter `suivisSousDomaines: []` à chaque élève.
- Renommer `bilans` en `bilansExternes`.
- Supprimer `ppi` et `bulletins`.

### Nouveau `BilanService` (sansEtat)

Une opération produit une seule Commande sur l'élève, donc une entrée UNDO :
- `ajouterBilan(eleveId, sousDomaineId)` : crée le suivi s'il n'existe pas, puis ajoute un bilan vierge en dernière position ;
- `modifierBilan`, `supprimerBilan` (supprime le suivi quand il devient vide), `dupliquerBilan` (copie ajoutée en fin, nouveaux UUID), `deplacerBilan(±1)` ;
- `obtenirSousDomaines()` : nœuds de niveau 3 des domaines actifs, avec le libellé `N1 > N2 > N3`.

---

## 3. Comportement de l'onglet Bilans

### Cadre « Ajouter un sous-domaine » (en haut)

- Contient `mc-selecteur-competences` en **sélection unique, limité aux compétences de niveau 3**, affichées avec le libellé `N1 > N2 > N3`, et un bouton **Ajouter**.
- C'est le **seul point d'entrée** pour créer un bilan.
- Si le sous-domaine a déjà des bilans, le nouveau bilan s'ajoute à la fin de son cadre. Sinon, un cadre de sous-domaine est créé.
- *Interprétation* : vous aviez d'abord demandé de n'afficher que les sous-domaines « non encore utilisés ». Ce filtre est abandonné, puisque ce cadre sert aussi à ajouter un 2e bilan à un sous-domaine déjà présent.
- Le nouveau bilan s'ouvre **en édition**, sans titre, date du jour, focus sur le champ titre.

### Cadre de sous-domaine

- Titre : `N1 > N2 > N3`.
- Boutons **Tout déplier / Tout replier**.
- Contient ensuite la liste des bilans.
- Le cadre disparaît quand son dernier bilan est supprimé.

### Bilan en lecture

C'est une zone repliable, repliée par défaut. La barre de titre contient :
- le bouton de bascule (`aria-expanded`), avec la date et le titre ;
- **Modifier** ;
- **Dupliquer** ;
- **Monter** et **Descendre** (désactivés aux extrémités) ;
- **Supprimer** (`mc-bouton-destruction [petit]="true"`).

Le corps contient :
- trois cadres **Bilans / Besoins spécifiques / Moyens** sur une ligne en écran large, empilés en écran étroit ;
- le tableau Compétence / Évaluation / Commentaire, sans colonne d'actions.

### Bilan en édition

C'est un `<fieldset>` dont la légende contient les champs **date** et **titre** (le titre est obligatoire : Valider est désactivé s'il est vide).
- En haut : **Valider** et **Annuler** (Annuler abandonne le brouillon).
- Trois `mc-editeur-riche` sur une ligne en écran large, empilés en écran étroit.
- Le tableau des évaluations :
  - l'entête de la colonne d'actions porte **Ajouter** ;
  - chaque ligne est directement éditable : compétence (sélecteur limité aux feuilles du sous-domaine, sans doublon dans le bilan), évaluation (`mc-select` sur `statutsAcquisition`), commentaire (`mc-textarea`), **Supprimer**.
- **Un seul bilan en édition à la fois** : les autres boutons Modifier/Dupliquer/Monter/Descendre/Supprimer et le bouton Ajouter du haut sont désactivés.

### Garde de navigation

Un bilan en édition non validé déclenche `popin-avertissement` dans trois cas : changement d'élève, changement d'onglet, changement d'écran (`EcranEditionGardeeBase`).

### Onglets

- Le composant `mc-onglets` suit le pattern WAI-ARIA *Tabs* : `tablist`/`tab`/`tabpanel`, touches ←/→/Début/Fin.
- L'onglet actif est conservé quand on change d'élève.
- Pendant la création d'un élève, l'onglet Bilans est désactivé et la Fiche administrative est affichée.

### Impression

- IMPRIMER, en lecture, imprime l'onglet affiché. Pour l'onglet Bilans : tous les bilans dépliés, sans boutons.
- Règles dans le `@media print` global.

---

## 4. Composants et fichiers

**Nouveaux**
- `composants/mc-onglets/`
- `composants/mc-editeur-riche/` : Tiptap (`@tiptap/core`, `@tiptap/starter-kit`, version stable de plus de deux semaines), `ControlValueAccessor` lié à `onUpdate` pour un retour immédiat. La barre d'outils (gras, italique, listes) utilise des `<button>` avec `id` et `aria-pressed`.
- `ecrans/eleves/fe-onglet-bilans/`, `fe-sous-domaine/`, `fe-bilan/`
- `modeles/bilan.modele.ts`, `services/sansEtat/bilan.service.ts`, `tests/bilan.mother.ts`

**Modifiés**
- `libelles.ts`
- `ecran-eleves.component.*`, `fe-fiche-eleve`, `fe-formulaire-eleve` (renommage `bilansExternes`)
- `eleve.modele.ts`, `donnees-application.modele.ts`
- `referentiel.service.ts`, `migration.service.ts`
- `mc-selecteur-competences` : inputs `niveau` (3) et `racineId` (feuilles d'un sous-domaine)
- `styles.scss` (print)
- `public/donnees-defaut.json`, jeu de données E2E `maclasse-test.zip`

**Règles et documentation**
- `rgaa-accessibilite.md` : ajout du pattern Tabs.
- `PREFIXES_SELECTEURS` : le préfixe `fe` existe déjà.
- Spécifications : `ecrans/eleves.md`, `modeles-donnees.md`, `services.md`, `composants-partages.md`, `libelles.md`, `elements-techniques.md` (versions).

---

## 5. Incréments (chacun : lint, tests ≥ 80 %, E2E, `revue-increment`, commit)

1. Pluriels du menu et des titres EDT / CJ.
2. Suppression de `ppi` et `bulletins`, renommage `bilansExternes`, `suivisSousDomaines`, migration `2026.10.1`, `BilanService` + `BilanMother`, spécifications du modèle.
3. `mc-onglets` + déplacement de la fiche et du formulaire dans l'onglet Fiche administrative, garde de navigation.
4. `mc-editeur-riche` (Tiptap) + extension de `mc-selecteur-competences`.
5. Onglet Bilans : ajout, cadres, lecture et édition, tableau, Tout déplier / Tout replier, impression, spécification de l'écran.

## Vérification

- `npm run lint`, `npm test` (couverture), `npm run e2e`.
- Nouveaux tests E2E :
  - ajouter un bilan, valider, annuler ;
  - dupliquer, monter, descendre ;
  - supprimer le dernier bilan, ce qui fait disparaître le cadre ;
  - navigation clavier dans les onglets ;
  - avertissement en quittant un bilan en édition.
- Charger un fichier antérieur pour contrôler la migration : `bilansExternes` est conservé, `ppi` et `bulletins` disparaissent.
- Contrôle manuel avec `npm start` : rendu en écran large et étroit, aperçu d'impression de l'onglet Bilans.

## Risques et points d'attention (relecture de l'incrément 2)

- **Séparateur des libellés** : les sous-domaines utilisent `>` (`BilanService.SEPARATEUR_LIBELLE`), comme dans la demande. `CompetenceService.resoudreLibelle` garde `›` pour les autres écrans.
- **Niveau du sous-domaine** : `BilanService` ne vérifie pas qu'un identifiant est bien de niveau 3. C'est l'écran qui garantit ce niveau, puisque le choix se fait parmi `obtenirSousDomaines()`.
- **Compétence désactivée ou supprimée** : un suivi ou une évaluation peut pointer vers une compétence hors des domaines actifs, ou retirée du référentiel. Le libellé résolu est alors vide. L'écran (incrément 5) affiche l'identifiant en repli.
- **Protection du référentiel** : rien n'empêche de modifier l'arbre des compétences alors que des bilans y font référence. Hors périmètre.

## Écartés
- Lien bilan ↔ période.
- Badges de statut dans la barre de titre.
- Pré-remplissage du tableau.
- Progression par compétence.
- Recherche globale dans les bilans et vue classe : non commentés, donc hors périmètre.
