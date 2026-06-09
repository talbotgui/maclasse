---
name: project-02-architecture
description: Architecture de l'application Ma classe — services, composants, écrans, conventions
metadata:
  type: project
  updated: 2026-06-05
related:
  - project-03-modeles
  - project-04-json-historique-pattern
  - project-08-contexte-service
---

## Règle 1 - Introduction à l'architecture

Application SPA Angular 21. Les données manipulées seront dans un fichier JSON chiffré (AES-256-GCM, zippé, base64) téléversé/téléchargé par l'enseignant.

**Why:** Application desktop-only sans backend, données privées de l'enseignant.

**How to apply:** Toute persistance passe par un service dédié. Pas d'API.

## Règle 2 -  Services

- `JsonHistoriqueService` : source de vérité contenant les données JSON manipuler et les méthodes de modification (pattern Redux, undo/redo). Dans `/src/app/services/json-historique.service.ts`
- `CahierJournalService` : gestion du cahier journal (CRUD séances, navigation dates). Dans `/src/app/services/cahier-journal.service.ts`
- `ContexteService` : états UI partagés entre composants (filtres, sélections, vue active, élève sélectionné…)
- `CompetenceService` : logique métier des compétences (filtrage, recherche)
- `ChiffrementService` : WebCrypto AES-256-GCM, zip/unzip, base64

## Écrans implémentés

- **Accueil** (`/`) : deux états — formulaire de chargement fichier+mdp OU tableau de bord
- **Compétences** (`/competences`) : filtres + vue arbre/liste + panier sélection
- **Élèves** (`/eleves`) : liste maître-détail + fiche élève
- **Cahier journal** (`/cahier-journal`) : 3 colonnes — navigation + planning journalier + détail séance

## Structure du Cahier journal (`/pages/cahier-journal/`)

```
cahier-journal.ts/.html/.scss      ← page container (grid 3 colonnes: 220px / 1fr / 320px)
composants/
  navigation-journal/              ← colonne gauche
    navigation-journal.ts/.html/.scss
    mini-calendrier/               ← calendrier mensuel interactif
      mini-calendrier.ts/.html/.scss
  planning-journalier/             ← colonne centrale
    planning-journalier.ts/.html/.scss
    creneau-horaire/               ← carte d'un créneau (CDK drag handle)
      creneau-horaire.ts/.html/.scss
  detail-seance/                   ← colonne droite (panneau détail éditable)
    detail-seance.ts/.html/.scss
```

## Modèles du Cahier journal

- `SeanceJournaliere` + `StatutSeance` + `EtapeDeroulement` + `ElevesConcernes` + `RessourceLien` → `/modeles/seance-journaliere.ts`
- `JourJournal` → `/modeles/jour-journal.ts`
- `DonneesEnseignant.cahierJournal?: JourJournal[]` ajouté

## Dépendances ajoutées

- `@angular/cdk@21` (drag & drop pour réordonner les séances)

## Composants partagés

- `BarreSuperieure` : dans le composant racine `App`, masquée si aucun fichier chargé
  - `BoutonTheme` : popover 9 thèmes

## Navigation

- Si aucun fichier chargé : seul "Accueil" est visible
- Guard `donneesChargees` protège `/competences`, `/eleves`, `/cahier-journal`

## Données de référence (dans l'app, statiques)

- Thèmes (9 thèmes, CSS variables)

## Données de l'enseignant (dans le JSON chiffré, modifiables)

- Identité enseignant, année, classe
- Compétences / arbre BO — le 1er niveau représente les disciplines (modifiables)
- Statuts d'acquisition, groupes, périodes, élèves (modifiables)
- Cahier journal (journées, séances, notes, bilans)
