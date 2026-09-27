---
name: vue-ensemble
description: Structure globale des écrans de MaClasse — entête, sauvegarde automatique, thèmes, responsive, UNDO/REDO, liens vers les spécifications d'écran
metadata:
  type: project
  updated: 2026-09-27
related:
  - specification/description-generale
  - specification/composants-partages
  - specification/services
---

Ce document décrit ce qui est commun à tous les écrans. Le détail de chaque écran est dans sa propre spécification.

## Écrans

| Écran | Route | Spécification |
|---|---|---|
| Démarrage | `/demarrage` | [demarrage](demarrage.md) |
| Accueil | `/accueil` | [accueil](accueil.md) |
| Élèves | `/eleves` | [eleves](eleves.md) |
| Projets | `/projets` | [projets](projets.md) |
| Compétences | `/competences` | [competences](competences.md) |
| Emploi du temps | `/emploi-du-temps` | [emploi-du-temps](emploi-du-temps.md) |
| Cahier journal | `/cahier-journal` | [cahier-journal](cahier-journal.md) |
| Paramétrage | `/parametrage` | [parametrage](parametrage.md) |

Écrans de phase 2, non implémentés : PPI (Projet Pédagogique Individuel), Bulletins, Tableau de bord de progression.

Gardes et routes : voir [elements-techniques](../elements-techniques.md#routing-angular).

---

## Structure globale

### Entête fixe

Composant `mc-entete` (voir [composants-partages](../composants-partages.md#mc-entete)).

- Logo + titre de l'application
- Liens de navigation vers chaque écran (visibles uniquement après chargement des données)
- **Champ de recherche globale** : recherche différée de 300 ms ; chaque résultat affiche un libellé de type accentué (« Élève », « Projet ») puis le titre (« MARTIN Paul », « compostage ») ; navigation clavier ↑ / ↓ / Début / Fin dans les résultats ; au clic sur un résultat, navigue vers l'écran concerné et sélectionne l'élément (détail : [elements-techniques](../elements-techniques.md#composant-de-recherche-globale))
- Bouton **SAUVEGARDER** : re-télécharge le ZIP chiffré ; popin de saisie du mot de passe si aucun mot de passe n'est connu (première sauvegarde d'une classe créée depuis les données d'exemple). **Désactivé tant qu'aucune modification n'est en attente** (`DonneesService.aDonneesModifiees`). Tooltip : date et heure de la dernière sauvegarde, ou « Aucune sauvegarde effectuée »
- Bouton **ANNULER** (undo, ↶) : désactivé si la pile undo est vide ; tooltip et `aria-label` « Annuler : » suivi du libellé de la commande au sommet de la pile (ex. « Annuler : Ajout d'un élève »), ou « Annuler » si la pile est vide
- Bouton **REFAIRE** (redo, ↷) : même principe avec « Refaire : » et la pile redo
- Bouton de changement de thème visuel (cycle parmi les 5 thèmes), toujours visible

#### État de l'entête

| Élément | Sans données (démarrage) | Données chargées | Mode consultation du référentiel |
|---|---|---|---|
| Logo + titre | Visible | Visible | Visible |
| Liens de navigation | Masqués | Visibles, lien actif mis en évidence | Visibles ; **tous désactivés sauf Compétences** |
| Recherche globale | Masquée | Visible | **Masquée** |
| SAUVEGARDER, ANNULER, REFAIRE | Masqués | Visibles | **Masqués** |
| Bouton de thème | Actif | Actif | Actif |

En mode consultation du référentiel (données d'exemple chargées par « Accéder aux programmes », voir [demarrage](demarrage.md)) :
- Les liens désactivés portent `aria-disabled="true"`, sont retirés de l'ordre de tabulation et affichent le tooltip `LIBELLES.entete.tooltipNavRestreinte`, également lu par les lecteurs d'écran (`aria-describedby`)
- La garde `referentielSeulGarde` bloque aussi l'accès direct à ces écrans
- Pour sortir de ce mode, l'utilisateur recharge la page et crée ou charge une classe

### Sauvegarde automatique

Service `SauvegardeAutoService` (voir [services](../services.md#sauvegardeautoservice)).

- Le minuteur démarre **au chargement d'un ZIP** (le mot de passe est connu) ou **après la première sauvegarde manuelle** d'une classe créée depuis les données d'exemple
- Une sauvegarde automatique se déclenche **toutes les N minutes** (N configuré dans Paramétrage > Préférences, **défaut : 5 minutes**, bornes 1–60), **uniquement si des modifications ont été effectuées** depuis la dernière sauvegarde
- Le délai est lu depuis `donnees.configuration.delaiSauvegardeAutoMinutes` ; enregistrer les Préférences redémarre le minuteur avec le nouveau délai s'il était actif
- La sauvegarde automatique utilise le mot de passe déjà conservé en mémoire (`ContexteService.motDePasse`) — aucune popin
- Le tooltip du bouton SAUVEGARDER est mis à jour après chaque sauvegarde (manuelle ou automatique)

### Thèmes visuels

Cinq thèmes, parcourus en cycle par le bouton de l'entête (détail des variables : [themes](../themes.md)) :

| Identifiant | Thème |
|---|---|
| `defaut` | Océan (bleu et blanc), thème par défaut |
| `foret` | Forêt (vert) |
| `crepuscule` | Crépuscule |
| `terre` | Terre |
| `contraste` | Contraste (noir et blanc, accessibilité fort contraste) |

- Implémentation : attribut `data-theme` sur `<html>` (absent pour le thème par défaut), variables CSS surchargées sur `:root[data-theme="…"]`
- Le thème choisi est mémorisé dans le `localStorage`
- Règle : aucune couleur hardcodée dans les composants, tout passe par les variables CSS

### Comportement responsive (petite largeur ≤ 768px)

- **Breakpoint unique : 768px** — en dessous de cette largeur, tous les layouts à colonnes basculent en empilement vertical
- La **colonne de gauche** s'affiche **au-dessus** de la zone centrale
- Hauteur max de la colonne gauche en mode empilé : **40vh** avec `overflow-y: auto`
- La bordure droite (séparation visuelle) devient une bordure basse
- Pour les layouts à 3 colonnes (EDT) : empilement dans l'ordre naturel du DOM (gauche → centre → droite)

**Implémentation par écran :**

| Écran | Fichier CSS concerné | Règle responsive |
|---|---|---|
| Élèves, Projets | `styles.scss` (`.mc-layout-liste-detail`) | `flex-direction: column` ; `.mc-colonne-gauche` : `flex: 0 0 auto`, `max-height: 40vh`, `border-right: none`, `border-bottom` |
| Cahier journal | `ecran-cahier-journal.component.scss` | `.cj` : `grid-template-columns: 1fr` ; `.cj__gauche` : `max-height: 40vh`, bordure basse |
| Compétences | `ecran-competences.component.scss` | `.competences` : `grid-template-columns: 1fr` ; empilement arbre puis panier |
| Emploi du temps | `ecran-emploi-du-temps.component.scss` | `.edt` : `grid-template-columns: 1fr` ; `.edt__gauche` : `max-height: 40vh`, bordure basse |
| Paramétrage | `ecran-parametrage.component.scss` | `.parametrage` : `grid-template-columns: 1fr` ; `.parametrage__nav` : bordure basse |

---

## Contrainte transverse : UNDO/REDO

- **Aucune frappe ni perte de focus** ne modifie le JSON, sauf les notes de la journée du cahier journal (enregistrées au blur, voir [cahier-journal](cahier-journal.md#notes-de-la-journée))
- Sinon, **seul un clic sur ENREGISTRER** (ou une action explicite : SUPPRIMER confirmé, ↑ ↓ du cahier journal, initialisation, duplication, export du panier) déclenche une mutation
- Chaque mutation est une **commande** soumise à `DonneesService`, qui gère les piles UNDO/REDO (voir [elements-techniques](../elements-techniques.md#pattern-commande-undoredo))
- Granularité : 1 action = 1 étape dans la pile, avec un libellé affiché dans les tooltips ANNULER / REFAIRE
