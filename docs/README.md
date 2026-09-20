# Documentation du projet Ma classe

Documentation de conception, d'évolution et de qualité de l'application. Ce répertoire est la référence : la mémoire de Claude (`.claude/memory/`) ne contient que le profil de l'utilisateur et les commandes de développement.

## Spécification

Description de l'application telle que conçue et implémentée.

| Document | Contenu |
|---|---|
| [description-generale](specification/description-generale.md) | SPA Angular 21 hors ligne, mono-utilisateur, ZIP chiffré AES-GCM, périmètre fonctionnel |
| [modeles-donnees](specification/modeles-donnees.md) | Structure JSON : configuration, référentiels, enseignant, classe, élèves, EDT, projets, cahier journal, PPI, bulletins |
| [architecture-applicative](specification/architecture-applicative.md) | Structure des dossiers, nommage, ordre d'implémentation |
| [elements-techniques](specification/elements-techniques.md) | Garde, pattern Commande, `@media print`, recherche globale, routing |
| [services](specification/services.md) | `DonneesService`, `ContextService`, `SauvegardeAutoService`, services métier |
| [composants-partages](specification/composants-partages.md) | Composants formulaire (ControlValueAccessor), mini-calendrier, popins |
| [themes](specification/themes.md) | 14 variables CSS par thème, 5 thèmes |
| [libelles](specification/libelles.md) | Structure de `libelles.ts` |

### Écrans

[vue d'ensemble](specification/ecrans/vue-ensemble.md) (entête, recherche globale, sauvegarde auto, UNDO/REDO) puis :
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
| [05](plans/05-cahier-journal-absences-notes.md) | Cahier journal : absences dans la note | voir le fichier |
| [06](plans/06-cahier-journal-pastilles-eleves.md) | Cahier journal : pastilles élèves/groupes | voir le fichier |
| [07](plans/07-sauvegarde-automatique.md) | Sauvegarde automatique | voir le fichier |
| [08](plans/08-conflit-edt-parite.md) | Correctif : conflit EDT et parité de semaine | voir le fichier |
| [09](plans/09-edt-titre-liste.md) | EDT : titre « Mes emplois du temps » | voir le fichier |
| [10](plans/10-edt-absences-regulieres.md) | EDT : absences régulières + icône conflit | voir le fichier |
| [11](plans/11-edt-temps-multiples.md) | EDT : créneaux à temps multiples | voir le fichier |
| [12](plans/12-edt-emplois-calcules.md) | EDT : emplois du temps calculés | implémenté le 2026-09-18 |
| [14](plans/14-completer-tests-e2e.md) | Compléter les tests E2E | terminé le 2026-09-19 |
| [15](plans/15-montees-de-version.md) | Montées de version (jsdom 30, Angular 22, TS 6.0) | validé le 2026-09-20, en cours |
| [16](plans/16-site-documentaire.md) | Site documentaire `/maclasse/doc/` | proposé, en attente de validation |

## Audits

| Audit | Statut |
|---|---|
| [2026-09-17 — inventaire des soucis SOU-XXX](audits/2026-09-17-inventaire-soucis.md) | 43 constats, traité le 2026-09-17 (SOU-028 et SOU-030 volontairement écartés) |
