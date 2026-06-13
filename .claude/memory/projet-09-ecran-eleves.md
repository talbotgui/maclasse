---
name: projet-09-ecran-eleves
description: Spécification détaillée de l'écran Élèves — liste filtrée, lecture seule, formulaire de création/modification
metadata:
  type: project
  updated: 2026-06-09
related:
  - projet-03-ecrans
  - projet-02-modelesDonnees
  - projet-04-composantsPartages
  - projet-05-services
---

## Layout général

Deux colonnes côte à côte :
- **Colonne gauche** : navigation dans la liste des élèves
- **Colonne droite** : détail / formulaire (vide à l'ouverture de l'écran)

---

## Colonne gauche

### Bouton CRÉER

- Positionné en haut, au-dessus du filtre textuel
- En mode formulaire non enregistré : affiche la **popin d'avertissement** avant de vider le formulaire et d'ouvrir un formulaire vide

### Filtre textuel

- Champ `mc-champ-recherche`
- Déclenchement **à la frappe** (temps réel)
- Filtre sur prénom + nom

### Chips de groupe

- Une chip `mc-chip-filtre` par groupe défini dans `referentiels.groupes` (tous les groupes, pas seulement ceux représentés)
- Sélection/désélection filtre la liste en combinaison avec le filtre textuel
- Plusieurs chips sélectionnables simultanément

### Liste des élèves

- Affiche au format **NOM Prénom** (nom en majuscules)
- Triée par **nom de famille** ascendant
- Au clic sur un élève :
  - Si aucun formulaire non enregistré ouvert → affiche la fiche en lecture seule dans la colonne droite + mémorise l'élève dans `ContextService`
  - Si formulaire non enregistré ouvert → affiche la **popin d'avertissement**

---

## Colonne droite — Bandeau supérieur

Présent dès qu'un élève est sélectionné ou qu'un formulaire de création est ouvert. Contient :

### Mode lecture seule

| Élément | Détail |
|---|---|
| Prénom + Nom | Affiché en titre |
| Bouton **MODIFIER** | Bascule en mode formulaire |
| Bouton **SUPPRIMER** | Composant `mc-bouton-destruction` : affiche ANNULER + CONFIRMER au premier clic |

### Mode formulaire (création ou modification)

| Élément | Détail |
|---|---|
| Champ Prénom | `mc-input` éditable directement dans le bandeau |
| Champ Nom | `mc-input` éditable directement dans le bandeau |
| Bouton **ANNULER** | Revient en lecture seule sans modifier le JSON ; si création, vide la colonne droite |
| Bouton **ENREGISTRER** | Soumet la commande à `DonneesService` ; bascule en lecture seule |

---

## Colonne droite — Sections de la fiche

Même organisation en lecture et en modification. Chaque section est séparée par un séparateur léger et un titre.

### Section Identité

| Champ | Mode lecture | Mode formulaire |
|---|---|---|
| Sexe | Valeur texte | `mc-radio-group` (M / F) |
| Date de naissance | Date formatée | `mc-input` type date |
| Date d'arrivée | Date formatée | `mc-input` type date |
| Niveau | Valeur texte | `mc-input` texte |
| Groupes | Liste des groupes | Chips sélectionnables/désélectionnables (un chip par groupe du référentiel) |
| Statut | Libellé du statut | `mc-select` (valeurs issues de `referentiels.statutsEleve`) |
| Bilans | Texte libre | `mc-textarea` |
| Accueil | Texte libre | `mc-textarea` |
| Inclusion | Texte libre | `mc-textarea` |

> L'identifiant (`id`) n'est jamais affiché.

### Section Contacts

- **Lecture** : chaque contact affiché sur **une ligne résumée** (ex. "René Martinot — Père — 06 12 34 56 78")
- **Formulaire** : chaque contact est éditable inline avec ses champs (type, nom, email, téléphone, adresse postale)
- Bouton **AJOUTER** : crée un nouveau contact vide en bas de la liste
- Chaque contact dispose d'un bouton **SUPPRIMER** (`mc-bouton-destruction`)

### Section Absences récurrentes

- **Lecture** : chaque absence sur **une ligne résumée** (ex. "Orthophonie — Mardi 10h00–11h00 — Toutes les semaines")
- **Formulaire** : chaque absence éditable inline (libellé, jour, heure début, heure fin, parité semaine)
- Bouton **AJOUTER** : crée une nouvelle absence vide
- Chaque absence dispose d'un bouton **SUPPRIMER** (`mc-bouton-destruction`)

### Section Cursus

- **Lecture** : chaque année sur **une ligne résumée** (ex. "2024 — CE2 — École Émile Zola")
- **Formulaire** : chaque année éditable inline (année, niveau, établissement, accompagnement)
- Bouton **AJOUTER** : crée une nouvelle entrée de cursus vide
- Chaque entrée dispose d'un bouton **SUPPRIMER** (`mc-bouton-destruction`)

### Section Absences ponctuelles

- **Lecture** : chaque absence sur **une ligne résumée** (ex. "09/06/2026 — Maladie")
- **Formulaire** : chaque absence éditable inline (date + justification)

| Champ | Mode lecture | Mode formulaire |
|---|---|---|
| Date | Date formatée (ex. "09/06/2026") | `mc-input` type date |
| Justification | Texte libre | `mc-textarea` |

- Bouton **AJOUTER** : crée une nouvelle absence ponctuelle vide
- Chaque absence dispose d'un bouton **SUPPRIMER** (`mc-bouton-destruction`)

> Ces absences sont utilisées dans le cahier journal pour désactiver le chip d'un élève dans `mc-eleves-concernes` si cet élève est absent le jour de la séance.

### Section Notes administratives

| Champ | Mode lecture | Mode formulaire |
|---|---|---|
| Droit à l'image | Texte libre | `mc-textarea` |
| Autorisation baignade | Texte libre | `mc-textarea` |
| PPA | Texte libre | `mc-textarea` |
| ESS | Texte libre | `mc-textarea` |

---

## Bouton IMPRIMER

- Positionné dans la colonne droite (bandeau ou bas de fiche)
- Déclenche l'impression via le navigateur (`window.print()`)
- **La colonne gauche n'est pas imprimée** (masquée via `@media print`)
- Uniquement disponible en mode lecture seule

---

## Popin d'avertissement (formulaire non enregistré)

Déclenchée dans trois cas :
- Clic sur un autre élève dans la liste
- Clic sur le bouton CRÉER
- Navigation vers un autre écran

Contenu :
- Message : *"Des modifications non enregistrées seront perdues. Voulez-vous continuer ?"*
- Bouton **ANNULER** : ferme la popin, reste sur le formulaire
- Bouton **CONFIRMER** : abandonne les saisies et exécute l'action demandée

---

## Aucun champ obligatoire

La validation ne bloque pas l'enregistrement. `EleveService` ne lève pas d'erreur sur des champs vides.
