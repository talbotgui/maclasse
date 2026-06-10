---
name: projet-01-descriptionGenerale
description: Vue d'ensemble de l'application MaClasse — objectif, utilisateur, périmètre fonctionnel, contraintes techniques
metadata:
  type: project
  updated: 2026-06-09
related:
  - projet-02-modelesDonnees
---

## Présentation

**MaClasse** est une SPA Angular 21 destinée à un enseignant du primaire (CP–CM2) pour gérer tous les aspects de la vie quotidienne de sa classe.

## Utilisateur

- Mono-utilisateur : un seul enseignant par instance
- Aucun système d'authentification multi-utilisateur
- Aucune notion de rôle

## Périmètre fonctionnel

| Domaine | Description |
|---|---|
| Référentiels | Identité enseignant, niveau de classe, barème de notes = `statutsAcquisition` (personnalisable : libellé, glyphe, couleur), compétences EN, périodes, groupes, statuts élève, jours fériés, config EDT |
| Élèves | Fiche élève complète, contacts, absences, cursus, notes administratives |
| Projets pédagogiques | Projets par période avec compétences associées et liste d'élèves |
| Cahier journal | Séances journalières avec horaires, discipline, compétences, déroulement |
| PPI | Projet Pédagogique Individuel par élève : compétences travaillées avec constat/actions/évaluation à deux dates |
| Bulletins | Évaluation par compétence + appréciation publique + appréciation privée |
| Tableau de bord | Agrégation PPI + bulletins + projets pour visualiser les compétences d'un élève |

## Contraintes techniques

- **100% offline** : aucun appel API, aucune ressource externe
- **Données locales** : portées par un fichier ZIP chiffré (AES-GCM via Web Crypto API)
- **Chargement** : upload du ZIP + saisie du mot de passe au démarrage
- **Sauvegarde** : re-téléchargement du ZIP chiffré avec le même mot de passe (popin de saisie si première sauvegarde)
- **Bootstrap** : `public/donnees-defaut.json` contient un jeu de données d'exemple pour initialiser un nouvel enseignant
- **Compétences** : stockées dans le fichier enseignant (personnalisables à terme), pas hardcodées dans l'app
