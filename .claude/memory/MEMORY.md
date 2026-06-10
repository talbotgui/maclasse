# Mémoire du projet Ma classe

Index de toutes les notes mémorisées. Chaque entrée pointe vers un fichier détaillé.

---

## Profil

- [Profil utilisateur](user-profil.md) — Développeur Angular 21, RGAA, qualité Sonar, nommage français, collaboration avec validation préalable

## Projet

- [Description générale](projet-01-descriptionGenerale.md) — SPA Angular 21 offline, mono-utilisateur, ZIP chiffré AES-GCM, périmètre fonctionnel complet
- [Modèles de données](projet-02-modelesDonnees.md) — Structure JSON : enseignant, classe, élèves, référentiels, projets, cahier journal, PPI, bulletins
- [Écrans](projet-03-ecrans.md) — Navigation entête fixe, démarrage, accueil, compétences, élèves, projets, EDT, cahier journal + UNDO/REDO
- [Écran démarrage — détail](projet-07-ecran-demarrage.md) — Popin obligatoire : zone Nouveau + zone Charger ZIP/mdp, entête partiel
- [Écran accueil — détail](projet-08-ecran-accueil.md) — Date du jour + résumé séances CJ (sans récréation/pause), lecture seule
- [Écran élèves — détail](projet-09-ecran-eleves.md) — Liste filtrée (texte + chips groupe), fiche sections, formulaire inline, popin avertissement
- [Écran projets — détail](projet-10-ecran-projets.md) — Même pattern qu'élèves, chips filtrage par domaine, périodes avec mc-selecteur-competences
- [Écran compétences — détail](projet-11-ecran-competences.md) — 3 colonnes : filtres gauche, arbre centre, panier droit avec export vers projet/séance
- [Écran emploi du temps — détail](projet-12-ecran-emploi-du-temps.md) — 3 colonnes : liste EDT gauche, grille hebdo centre, formulaire contextuel droit (EDT ou créneau)
- [Écran cahier journal — détail](projet-13-ecran-cahier-journal.md) — Navigation mini-calendrier+J±1/7, liste séances avec "+" intercalaire et flèches, formulaire droite contextuel
- [Composants partagés](projet-04-composantsPartages.md) — Composants formulaire (ControlValueAccessor), affichage, riches (sélecteur compétences, mini-calendrier), popins
- [Services](projet-05-services.md) — DonneesService (signal+undo/redo), ContextService, services métier par domaine, ChiffrementService
- [Éléments techniques](projet-06-elementsTechniques.md) — DonneesChargeesGarde, mcAutoFocus, DateUtils, pattern Commande, FormatDatePipe, localStorage thème

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
