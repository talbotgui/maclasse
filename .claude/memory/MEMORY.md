# Mémoire du projet Ma classe

Index de toutes les notes mémorisées. Chaque entrée pointe vers un fichier détaillé.

---

## Profil

- [Profil utilisateur](user-profil.md) — Développeur Angular 21, RGAA, qualité Sonar, nommage français, collaboration avec validation préalable

## Référence

- [Commandes dev](reference-commandesDev.md) — npm start (ng serve :4200), npm test (ng test/Vitest+couverture), npm run e2e* (Playwright, webServer auto)

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
- [Thèmes visuels](projet-16-themes.md) — 14 variables CSS par thème, 5 thèmes : Océan (défaut), Forêt, Crépuscule, Terre, Contraste
- [Libellés UI](projet-17-libelles.md) — Structure de libelles.ts : LIBELLES as const, organisé par domaine fonctionnel (commun, entete, navigation, écrans, popins, aria)

## Plans de génération

- [Plan génération initiale](plans-01-generationInitiale.md) — 9 étapes séquentielles : config → modèles → services → composants → écrans → en-tête
- [Plan tests composants](plans-02-testsDeComposant.md) — 11 étapes : 31 composants à couvrir, du plus simple (pur/CVA) aux écrans complexes
- [Problèmes dans les tests](plans-03-problemesTests.md) — 7 catégories : subscribe() interdit (25 occ.), tests tautologiques, branche EDT manquante, mocks, assertions trop faibles
- [Tests E2E fonctionnels](plans-04-testsE2E.md) — 104 scénarios couvrant démarrage, entête, accueil, élèves, projets, compétences, EDT, CJ, paramétrage, UNDO/REDO, sauvegarde auto, responsive, RGAA, versions

## Plans d'évolution

- [Cahier journal — absences dans la note](plans-05-cahierJournalAbsencesNotes.md) — Pré-remplissage `notes` avec absences régulières+ponctuelles du jour (si vide), filtrage par parité de semaine
- [Cahier journal — pastilles élèves/groupes](plans-06-cahierJournalPastillesElevesConcernes.md) — Nouveau composant mc-pastilles-eleves-concernes, pastilles statiques (mc-disc-pill) dans cahier journal + EDT
- [Sauvegarde automatique](plans-07-sauvegardeAutomatique.md) — Démarrage après chargement ZIP, sauvegarde conditionnée à modification, délai 5min configurable bornes 1-60, relance timer
- [EDT — titre "Mes emplois du temps"](plans-09-edtTitreListeEdt.md) — Titre de section au-dessus de la liste EDT, classe réutilisable en prévision de la liste des EDT calculés
- [EDT — absences régulières + icône conflit](plans-10-edtAbsencesRegulieres.md) — Bandeau d'absences pertinentes pour l'EDT sélectionné (jour+parité) + câblage de l'icône ⚠ par créneau déjà prévue mais jamais codée
- [EDT — créneaux à temps multiples](plans-11-edtTempsMultiples.md) — 1 à 4 "temps" indépendants par créneau (horaire propre à chacun), refonte CreneauEdt, migration de données à concevoir
- [EDT — emplois du temps calculés](plans-12-edtEmploisCalcules.md) — Nouvelle entité persistée en lecture seule, calcul à la volée depuis récréations/temps de classe/absences régulières

## Plans de correction

- [Conflit EDT — parité de semaine](plans-08-conflitEdtParite.md) — Bug confirmé : calculerConflitsAbsences ignore la parité paire/impaire, correctif via verifierCompatibiliteFrequences existante
