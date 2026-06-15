# Mémoire du projet Ma classe

Index de toutes les notes mémorisées. Chaque entrée pointe vers un fichier détaillé.

---

## Profil

- [Profil utilisateur](user-profil.md) — Développeur Angular 21, RGAA, qualité Sonar, nommage français, collaboration avec validation préalable

## Projet

- [Description générale](projet-01-descriptionGenerale.md) — SPA Angular 21 offline, mono-utilisateur, ZIP chiffré AES-GCM, périmètre fonctionnel complet
- [Modèles de données](projet-02-modelesDonnees.md) — Structure JSON : ConfigApplication, référentiels, enseignant, classe, élèves, emploi du temps (EDT), projets, cahier journal, PPI, bulletins
- [Écrans](projet-03-ecrans.md) — Entête (recherche globale, sauvegarde auto, tooltip), démarrage, accueil, élèves, projets, compétences, EDT, cahier journal, paramétrage + UNDO/REDO
- [Écran démarrage — détail](projet-07-ecran-demarrage.md) — Popin obligatoire : zone Nouveau + zone Charger ZIP/mdp, spinner+désactivation pendant chargement
- [Écran accueil — détail](projet-08-ecran-accueil.md) — Date du jour + résumé séances CJ (sans récréation/pause), lecture seule
- [Écran élèves — détail](projet-09-ecran-eleves.md) — Liste NOM Prénom triée, fiche+absences ponctuelles, formulaire inline, popin avertissement, IMPRIMER
- [Écran projets — détail](projet-10-ecran-projets.md) — Même pattern qu'élèves, chips filtrage par domaine, périodes avec mc-selecteur-competences, IMPRIMER
- [Écran compétences — détail](projet-11-ecran-competences.md) — 3 colonnes : filtres gauche, arbre centre, panier droit (VIDER+auto-clear) avec export vers projet/séance
- [Écran emploi du temps — détail](projet-12-ecran-emploi-du-temps.md) — 3 colonnes : liste EDT gauche, grille hebdo centre, formulaire contextuel droit (EDT ou créneau), IMPRIMER
- [Écran cahier journal — détail](projet-13-ecran-cahier-journal.md) — Navigation mini-calendrier, séances avec warning à ENREGISTRER, dupliquer séance/journée, SUPPRIMER JOURNÉE, IMPRIMER
- [Écran paramétrage — détail](projet-14-ecran-parametrage.md) — 11 sections dont Préférences (délai sauvegarde auto), SUPPRIMER désactivé+tooltip si valeur utilisée
- [Composants partagés](projet-04-composantsPartages.md) — Composants formulaire (ControlValueAccessor), mc-mini-calendrier (weekends+fériés+non ouvrés grisés), popins
- [Services](projet-05-services.md) — DonneesService (aDonneesModifiees), ContextService, SauvegardeAutoService, RechercheGlobaleService, services métier
- [Éléments techniques](projet-06-elementsTechniques.md) — DonneesChargeesGarde, pattern Commande (5 types), @media print, recherche globale, routing
- [Architecture applicative](projet-15-architectureApplicative.md) — Structure dossiers, nommage fichiers/classes, ordre d'implémentation en 9 étapes

## Règles de code

- [Conventions Angular & TypeScript](feedback-01-angular.md) — standalone, Signals, OnPush, input()/output() public vs protected, RGAA
- [Nommage français](feedback-02-conventions.md) — Tout le code en français, sauf impositions Angular/TS
- [JSDoc et commentaires](feedback-03-doc.md) — JSDoc rédigée obligatoire sur toute classe, membre et méthode — jamais vide
- [RGAA — accessibilité](feedback-04-rgaa.md) — Focus modale via [mcAutoFocus], balises natives plutôt que rôles ARIA
- [CSS qualité](feedback-05-scss.md) — Globalisation mc-, composition boutons, no hex hardcodé, classes utilitaires
- [Collaboration](feedback-06-collaboration.md) — Reformuler et valider avant toute écriture de code
- [IDs HTML](feedback-07-html.md) — Tout bouton/input doit avoir un id lowerCamelCase, dynamique en @for, contexteId si multi-instance
- [Tests](feedback-08-tests.md) — Vitest, instanciation directe ou TestBed selon inject(), structure describe/it, pas de mocks
- [Polices locales](feedback-09-polices.md) — Toutes les polices dans public/fonts/, @font-face dans styles.scss, jamais de CDN externe
- [ComposantBase et LIBELLES](feedback-10-composant-base.md) — Tout composant partagé étend ComposantBase ; LIBELLES accessible dans les templates sans redéclaration
