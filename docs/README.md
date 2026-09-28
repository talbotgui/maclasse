# Documentation du projet Ma classe

Documentation de conception, d'évolution et de qualité de l'application. Ce répertoire est la référence : la mémoire de Claude (`.claude/memory/`) ne contient que le profil de l'utilisateur et les commandes de développement.

## Spécification

Description de l'application telle que conçue et implémentée.

| Document | Contenu |
|---|---|
| [description-generale](specification/description-generale.md) | SPA Angular hors ligne, mono-utilisateur, ZIP chiffré AES-GCM, périmètre fonctionnel (PPI, bulletins, tableau de bord en phase 2) |
| [modeles-donnees](specification/modeles-donnees.md) | Structure JSON : configuration, référentiels, enseignant, classe, élèves, EDT, projets, cahier journal, PPI, bulletins |
| [architecture-applicative](specification/architecture-applicative.md) | Structure des dossiers, nommage, fichiers racine, décisions techniques |
| [elements-techniques](specification/elements-techniques.md) | Gardes, classes de base, utilitaires, pattern Commande, versions du JSON, persistance, routing, `@media print`, recherche globale |
| [services](specification/services.md) | `DonneesService`, `ContexteService`, services métier, `MigrationService`, `SauvegardeAutoService`, `ChiffrementService` |
| [composants-partages](specification/composants-partages.md) | `ChampBase`, composants formulaire et d'affichage, composants riches, `PopinBase` et popins, entête |
| [themes](specification/themes.md) | 15 variables CSS par thème, 5 thèmes |
| [libelles](specification/libelles.md) | Structure de `libelles.ts`, rôle de chaque section |

### Écrans

[vue d'ensemble](specification/ecrans/vue-ensemble.md) (entête, sauvegarde auto, thèmes, responsive, UNDO/REDO) puis :
[démarrage](specification/ecrans/demarrage.md) ·
[accueil](specification/ecrans/accueil.md) ·
[élèves](specification/ecrans/eleves.md) ·
[projets](specification/ecrans/projets.md) ·
[compétences](specification/ecrans/competences.md) ·
[emploi du temps](specification/ecrans/emploi-du-temps.md) ·
[cahier journal](specification/ecrans/cahier-journal.md) ·
[paramétrage](specification/ecrans/parametrage.md)

## Plans

Un plan par évolution ou chantier. La numérotation est historique ; le 13 est devenu un audit (voir plus bas).

| Plan | Sujet | Statut |
|---|---|---|
| [01](plans/01-generation-initiale.md) | Génération initiale en 9 étapes | voir le fichier |
| [02](plans/02-tests-de-composants.md) | Tests des 31 composants | voir le fichier |
| [03](plans/03-problemes-tests.md) | Problèmes relevés dans les tests | voir le fichier |
| [04](plans/04-tests-e2e.md) | 104 scénarios E2E | périmé, remplacé par le plan 14 |
| [05](plans/05-cahier-journal-absences-notes.md) | Cahier journal : absences dans la note | affiné par le plan 17 |
| [06](plans/06-cahier-journal-pastilles-eleves.md) | Cahier journal : pastilles élèves/groupes | voir le fichier |
| [07](plans/07-sauvegarde-automatique.md) | Sauvegarde automatique | voir le fichier |
| [08](plans/08-conflit-edt-parite.md) | Correctif : conflit EDT et parité de semaine | voir le fichier |
| [09](plans/09-edt-titre-liste.md) | EDT : titre « Mes emplois du temps » | voir le fichier |
| [10](plans/10-edt-absences-regulieres.md) | EDT : absences régulières + icône conflit | voir le fichier |
| [11](plans/11-edt-temps-multiples.md) | EDT : créneaux à temps multiples | voir le fichier |
| [12](plans/12-edt-emplois-calcules.md) | EDT : emplois du temps calculés | implémenté le 2026-09-18 |
| [14](plans/14-completer-tests-e2e.md) | Compléter les tests E2E | terminé le 2026-09-19 |
| [15](plans/15-montees-de-version.md) | Montées de version (jsdom 30, Angular 22, TS 6.0) | terminé le 2026-09-20 |
| [16](plans/16-site-documentaire.md) | Site documentaire `/maclasse/doc/` | proposé, en attente de validation |
| [17](plans/17-cahier-journal-regroupement-absences.md) | Cahier journal : regroupement des absences par élève | terminé le 2026-09-27 |
| [18](plans/18-edt-impression.md) | EDT : impression paysage, grille seule, titre, page unique | terminé le 2026-09-27 |
| [19](plans/19-cahier-journal-densification.md) | Cahier journal : densification (« + » en bout de ligne, notes repliables, récréations en ligne fine) + règles élève absent / séances simultanées | terminé le 2026-09-27 |
| [20](plans/20-edt-pause-meridienne.md) | EDT : pause méridienne (libellé, couleur, source « Temps hors classe », conflits limités au pédagogique, migration 2026.09.4) | terminé le 2026-09-27 |
| [21](plans/21-edt-formulaire-reactive-forms.md) | EDT : `edt-formulaire` en Reactive Forms (FormGroup des propriétés, FormArray des temps, validateurs partagés `FormulaireUtils`) | terminé le 2026-09-27 |
| [22](plans/22-formulaires-reactive-forms.md) | Formulaires Élèves, Projets et Paramétrage en Reactive Forms (3 incréments, suivi des lignes par instance de `FormGroup`) | terminé le 2026-09-27 |
| [23](plans/23-parametrage-saisies-identifiants-absences.md) | Paramétrage : saisies conservées au rechargement, identifiants figés et uniques, avertissement de navigation ; plage horaire des absences récurrentes | terminé le 2026-09-28 |
| [24](plans/24-eleves-autorisations-informations-utiles.md) | Élèves : autorisations structurées (droit à l'image, baignade, sortie régulière) et section « Informations utiles » (lunettes, AESH, latéralité) | en cours : incrément 1 sur 2 terminé le 2026-09-28 |

## Audits

| Audit | Statut |
|---|---|
| [2026-09-17 — inventaire des soucis SOU-XXX](audits/2026-09-17-inventaire-soucis.md) | 43 constats, traité le 2026-09-17 (SOU-028 et SOU-030 volontairement écartés) |
| [2026-09-27 — lint initial](audits/2026-09-27-lint-initial.md) | 387 erreurs ESLint à la mise en place du lint, traité le 2026-09-27 |
