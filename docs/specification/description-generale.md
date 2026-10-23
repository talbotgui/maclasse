---
name: description-generale
description: Vue d'ensemble de l'application MaClasse — objectif, utilisateur, périmètre fonctionnel, contraintes techniques
metadata:
  type: project
  updated: 2026-09-27
related:
  - specification/modeles-donnees
---

## Présentation

**MaClasse** est une SPA Angular (version et dépendances : voir `package.json`) destinée à un enseignant du primaire (CP–CM2) pour gérer tous les aspects de la vie quotidienne de sa classe.

## Utilisateur

- Mono-utilisateur : un seul enseignant par instance
- Aucun système d'authentification multi-utilisateur
- Aucune notion de rôle

## Périmètre fonctionnel

| Domaine | Description |
|---|---|
| Référentiels | Identité enseignant, niveau de classe, barème de notes = `statutsAcquisition` (personnalisable : libellé, glyphe, couleur), compétences EN (domaines actifs choisis dans le Paramétrage), périodes, groupes, statuts élève, types de contact, jours fériés, config EDT |
| Élèves | Fiche administrative (identité, contacts, absences, cursus, notes administratives) et bilans par sous-domaine de compétences (textes riches et évaluations) |
| Projets pédagogiques | Projets par période avec compétences associées et liste d'élèves |
| Emploi du temps | Emplois du temps hebdomadaires (fréquence, dates, créneaux à temps multiples) et emplois du temps calculés en lecture seule |
| Cahier journal | Séances journalières avec horaires, discipline, compétences, déroulement, notes de la journée |
| Tableau de bord | **Phase 2, non implémenté.** Agrégation des bilans et des projets pour visualiser les compétences d'un élève |

Les modèles `Ppi` et `Bulletin` de la phase 2, jamais exploités, ont été retirés par le [plan 25](../plans/25-eleves-onglets-bilans.md) : le suivi individualisé passe par les bilans des élèves.

## Contraintes techniques

- **100% offline** : aucun appel API, aucune ressource externe
- **Données locales** : portées par un fichier ZIP chiffré (AES-GCM via Web Crypto API, clé dérivée par PBKDF2 — voir [services](services.md#chiffrementservice))
- **Chargement** : upload du ZIP + saisie du mot de passe au démarrage
- **Sauvegarde** : re-téléchargement du ZIP chiffré avec le même mot de passe (popin de saisie si aucun mot de passe n'est connu), plus une sauvegarde automatique périodique
- **Consultation du référentiel** : la popin de démarrage permet aussi de consulter les compétences seules, sans créer ni charger de classe
- **Bootstrap** : `public/donnees-defaut.json` contient un jeu de données d'exemple pour initialiser un nouvel enseignant
- **Compétences** : stockées dans le fichier enseignant (personnalisables à terme), pas hardcodées dans l'app
