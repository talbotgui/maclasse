---
name: projet-03-ecrans
description: Détail des écrans de MaClasse — structure, navigation, interactions par écran
metadata:
  type: project
  updated: 2026-06-09
related:
  - projet-01-descriptionGenerale
  - projet-04-composantsPartages
  - projet-05-services
---

## Structure globale

### Entête fixe

- Logo + titre de l'application
- Boutons de navigation vers chaque écran (visibles uniquement après chargement des données)
- **Champ de recherche globale** : autocomplétion en temps réel, résultats au format *"TYPE — titre"* (ex. "Élève — MARTIN Paul", "Projet — compostage") ; au clic sur un résultat, navigue vers l'écran concerné et sélectionne l'élément (visible uniquement après chargement)
- Bouton **SAUVEGARDER** (re-télécharge le ZIP chiffré ; popin de saisie du mot de passe si première sauvegarde) — **tooltip : date et heure de la dernière sauvegarde**
- Bouton **ANNULER** (undo) — désactivé si la pile undo est vide
- Bouton **REFAIRE** (redo) — désactivé si la pile redo est vide
- Bouton de changement de thème visuel (bascule entre les thèmes disponibles)

### Sauvegarde automatique

- Après le **premier clic sur SAUVEGARDER**, une sauvegarde automatique se déclenche **toutes les N minutes** (N configuré dans Paramétrage > Préférences, défaut : 2 minutes), **uniquement si des modifications ont été effectuées** depuis la dernière sauvegarde
- Le délai est lu depuis `donnees.configuration.delaiSauvegardeAutoMinutes`
- La sauvegarde automatique utilise le mot de passe déjà conservé en mémoire (`ContextService.motDePasse`) — aucune popin supplémentaire
- Le tooltip du bouton SAUVEGARDER est mis à jour après chaque sauvegarde (manuelle ou automatique)

### Thèmes visuels

- **Thème 1 (défaut)** : bleu et blanc
- **Thème 2 (contraste)** : noir et blanc (accessibilité fort contraste)
- Implémentation : variables CSS portées sur la balise DOM la plus haute (`<html>` ou `<app-root>`)
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

## Écran de démarrage (avant chargement des données)

- Le menu de l'entête est **masqué**
- Une **popin obligatoire** (non fermable) s'affiche avec deux options :
  1. **Charger un fichier** : upload d'un fichier ZIP chiffré + saisie du mot de passe (AES-GCM)
  2. **Nouveau fichier** : crée un jeu de données vierge à partir de `public/donnees-defaut.json`
- Une fois les données chargées, le menu s'affiche et l'utilisateur est redirigé vers l'écran d'accueil

---

## Écran Accueil

- Affiché après le chargement des données (page d'accueil par défaut)
- Contenu : **résumé du cahier journal du jour**
  - Date du jour
  - Liste des séances de la journée courante avec :
    - Heure de début / heure de fin
    - Nombre d'élèves concernés
    - Domaine(s) de compétences associés (niveau 1 de l'arbre)
- Vue allégée (lecture seule, pas d'interaction de modification)

---

## Écran Compétences

- **Lecture seule** (pas d'édition dans cette version)
- Layout : 2 zones — `mc-arbre-competences` à gauche (filtres + arbre intégrés) | panier à droite
- Zone gauche : composant `mc-arbre-competences` — champ de recherche textuelle + chips de filtrage par domaine + arbre repliable (filtre masque les non-correspondants et déploie les ancêtres), navigation clavier WAI-ARIA Tree View
- Zone droite : panier de compétences sélectionnées, persisté dans `ContextService`, export vers ProjetPeriode ou séance via popin

---

## Écran Élèves

- Layout : colonne latérale gauche + zone principale droite

### Colonne gauche

- Bouton **CRÉER** (ouvre un formulaire vide dans la zone droite)
- Champ filtre de recherche (filtre sur prénom + nom)
- Liste des élèves filtrée (prénom + nom), cliquable

### Zone droite

#### Mode lecture (par défaut au clic sur un élève)

- Affichage complet de la fiche élève en lecture seule
- Bouton **MODIFIER** → passe en mode édition
- Bouton **SUPPRIMER** → `mc-bouton-destruction` (masque SUPPRIMER, affiche ANNULER + CONFIRMER)

#### Mode édition / création

- Formulaire complet de la fiche élève
- Bouton **ANNULER** → revient au mode lecture sans modifier le JSON
- Bouton **ENREGISTRER** → écrit dans le JSON via le service de mutation (UNDO/REDO)

---

## Écran Projets

- Même pattern liste+détail que l'écran Élèves
- Colonne gauche : bouton CRÉER + filtre + liste des projets (nom)
- Zone droite :
  - Mode lecture : détail du projet (nom, description, élèves, périodes+compétences)
  - Mode édition : formulaire + Annuler / Enregistrer / Supprimer

---

## Écran Emploi du temps

- Layout 3 colonnes : liste des EDT à gauche | grille hebdomadaire au centre | formulaire contextuel à droite
- Colonne gauche : bouton CRÉER + liste des EDT (nom, fréquence, dates) avec icône warning si chevauchement
- Chaque EDT a une fréquence (paire / impaire / les deux) et des dates de début/fin optionnelles
- Deux EDT ne peuvent pas se chevaucher (même plage de dates ET même parité) — warning sur l'EDT dans la liste
- Colonne droite contextuelle : propriétés EDT (état 1) ou formulaire créneau (état 2), sans mode lecture intermédiaire
- Types de créneau : séance pédagogique, récréation (type dédié), pause déjeuner (type dédié)
- **Warning non bloquant** à la sauvegarde si un créneau EDT est incohérent avec une absence récurrente d'élève

---

## Écran Cahier journal

- Layout : colonne latérale gauche + zone principale droite

### Colonne gauche

- **Mini-calendrier** pour navigation par date
- Boutons de navigation rapide : **J−7**, **J−1**, **J+1**, **J+7**

### Zone principale droite

#### Journée non initialisée

- Bouton **Initialiser vide** : crée une journée vide
- Bouton **Initialiser depuis EDT** : pré-remplit depuis l'emploi du temps du jour correspondant
- Ces deux boutons sont **inactifs** si une entrée existe déjà pour ce jour

#### Journée existante

- Liste ordonnée des séances de la journée (heure début/fin, disciplines, titre, élèves concernés)
- Types de séance : pédagogique, récréation (type dédié), pause déjeuner (type dédié)
- **Réorganisation** : flèches haut/bas (pas de glisser-déposer)
- **Ajout** d'une séance possible en milieu de journée (insertion à une position donnée)
- **Warning non bloquant** à la sauvegarde si une séance est incohérente avec une absence récurrente d'élève

---

## Écrans phase 2 (à concevoir ultérieurement)

- PPI (Projet Pédagogique Individuel)
- Bulletins
- Tableau de bord de progression

## Écran Paramétrage (spécifié, à implémenter)

- Layout 2 colonnes : liste fixe de 10 sections à gauche | contenu à droite
- Sections formulaire simple : Enseignant & Classe, Semaine & Horaires
- Sections liste éditable : Périodes, Barème d'évaluation, Groupes, Statuts élève, Types de contact, Raisons/Fréquences d'absence, Jours fériés
- Bouton SUPPRIMER désactivé (tooltip + ARIA) si la valeur est utilisée dans les données

---

## Contrainte transverse : UNDO/REDO

- **Aucune frappe ni perte de focus** ne modifie le JSON
- **Seul un clic sur ENREGISTRER** déclenche une mutation
- Chaque mutation transite par un **service dédié** (à concevoir) qui gère la pile UNDO/REDO
- Granularité : 1 clic ENREGISTRER = 1 étape dans la pile
