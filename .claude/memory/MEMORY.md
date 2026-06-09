# Mémoire du projet Ma classe

Index de toutes les notes mémorisées. Chaque entrée pointe vers un fichier détaillé.

---

## Profil

- [Profil utilisateur](user-profil.md) — Développeur Angular 21, RGAA, qualité Sonar, nommage français, collaboration avec validation préalable

## Projet

- [Vue d'ensemble](project-01-overview.md) — SPA Angular pour enseignant·e du primaire (CP–CM2), offline-first, pas de backend
- [Architecture](project-02-architecture.md) — Services, composants, écrans, navigation, données chiffrées AES-256-GCM
- [Modèles de données](project-03-modeles.md) — Schéma DonneesEnseignant, Eleve, SeanceJournaliere, NoeudCompetence…
- [JsonHistoriqueService](project-04-json-historique-pattern.md) — Source de vérité, pattern Redux, API publique, 10 types de modifications
- [Composants partagés et directives](project-05-composants-partages.md) — SelecteurCompetences, BarreActionsDetail, Separateur, BarreSuperieure, BoutonTheme
- [SCSS — variables et classes utilitaires](project-06-scss.md) — 16 variables CSS, 9 thèmes, catalogue classes mc-*
- [Scripts npm et workflow](project-07-npm.md) — Commandes, versions des dépendances, répertoire Sources/
- [ContexteService](project-08-contexte-service.md) — 5 signaux globaux (thème, sauvegarde, données chargées, période)
- [Sonar](project-09-sonar.md) — Exclusion ClaudeDesign/, pas de quality gates personnalisés

## Règles de code

- [Conventions Angular & TypeScript](feedback-01-angular.md) — standalone, Signals, OnPush, input()/output() public vs protected, RGAA
- [Nommage français](feedback-02-conventions.md) — Tout le code en français, sauf impositions Angular/TS
- [JSDoc et commentaires](feedback-03-doc.md) — Structure JSDoc systématique mais sans contenu et pas de commentaire
- [RGAA — accessibilité](feedback-04-rgaa.md) — Focus modale via [mcAutoFocus], balises natives plutôt que rôles ARIA
- [CSS qualité](feedback-05-scss.md) — Globalisation mc-, composition boutons, no hex hardcodé, classes utilitaires
- [Collaboration](feedback-06-collaboration.md) — Reformuler et valider avant toute écriture de code
- [IDs HTML](feedback-07-html.md) — Tout bouton/input doit avoir un id lowerCamelCase, dynamique en @for, contexteId si multi-instance
- [Tests](feedback-08-tests.md) — Vitest sans TestBed, instanciation directe, structure describe/it, pas de mocks
- [Polices locales](feedback-09-polices.md) — Toutes les polices dans public/fonts/, @font-face dans styles.scss, jamais de CDN externe
- [ComposantBase et LIBELLES](feedback-10-composant-base.md) — Tout composant partagé étend ComposantBase ; LIBELLES accessible dans les templates sans redéclaration
