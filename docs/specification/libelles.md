---
name: libelles
description: Structure du fichier libelles.ts — constante LIBELLES centralisée, organisée par domaine fonctionnel, rôle de chaque section
metadata:
  type: project
  updated: 2026-09-28
related:
  - specification/architecture-applicative
---

## Emplacement

`src/app/libelles.ts` — au même niveau que `app.ts` et `composant-base.ts`.

---

## Principe

- Constante `LIBELLES` exportée en `as const` (les valeurs sont des string literals inférables par TypeScript)
- Importée par `composant-base.ts` pour l'exposer dans tous les templates des composants partagés via `protected readonly LIBELLES`
- Organisée par domaine fonctionnel, pas par type d'élément (pas de section « boutons », pas de section « titres »)
- Contient aussi les chaînes françaises utilisées par la logique (ex. `dates.nomsJours` pour un lookup par index, libellés des commandes UNDO/REDO)
- Le fichier `libelles.ts` fait foi pour les valeurs : ce document décrit la structure et donne des exemples, sans recopier chaque clé

---

## Sections

| Section | Contenu | Exemples de clés |
|---|---|---|
| `dates` | Noms et initiales des jours, indexés comme `Date.getDay()` (0 = dimanche) | `nomsJours`, `initialeJours` |
| `commun` | Libellés réutilisés dans plusieurs domaines : actions, états, messages génériques | `enregistrer`, `annuler`, `supprimer`, `chargement`, `rechercher`, `avertissementModifications`, `erreurPlageHoraire`, `effacer`, `ariaEffacerReponse` |
| `entete` | Barre d'en-tête : titre, SAUVEGARDER / ANNULER / REFAIRE et leurs tooltips, recherche globale, thème, mode consultation du référentiel | `tooltipDerniereSauvegarde`, `tooltipPrefixeAnnuler`, `tooltipPrefixeRefaire`, `typesResultatRecherche` (`eleve` → « Élève », `projet` → « Projet »), `tooltipNavRestreinte` |
| `navigation` | Libellés des liens de navigation vers chaque écran | `accueil`, `eleves`, `competences`, `parametrage` |
| `demarrage` | Popin de démarrage : bienvenue, trois zones (nouveau, charger, référentiel), erreurs de chargement | `bienvenue`, `titreNouveau`, `texteNouveau`, `boutonCreer`, `titreCharger`, `titreReferentiel`, `boutonReferentiel`, `erreurMotDePasse`, `erreurVersionIncompatible` |
| `accueil` | Écran d'accueil | `labelAujourdhui`, `aucunJournal`, `labelNbEleves` |
| `eleve` | Écran Élèves : liste, fiche, formulaire (sections, champs, contacts, absences, cursus) | `sectionIdentite`, `sectionAbsencesRecurrentes`, `erreurHeuresAbsenceObligatoires`, `aucunEleve`, `reponsesAutorisation` (`accepte`, `refuse`, `sansReponse`), `lateralites` (`gaucher`, `droitier`), `sectionInformationsUtiles` |
| `projet` | Écran Projets : liste, fiche, formulaire, périodes | `sectionInfos`, `sectionPeriodes`, `aucunProjet` |
| `competences` | Écran Compétences : panier, export, information sur les domaines actifs, arbre | `panierVide`, `boutonEnvoyerProjet`, `infoDomainesParametrage`, `erreurExport` |
| `selecteurCompetences` | Composant `mc-selecteur-competences` | `placeholder`, `ariaSuggestions`, `ariaSupprimer` |
| `edt` | Écran Emploi du temps : listes, grille, formulaires d'EDT, de créneau et d'EDT calculé, types de créneau, sources, impression, conflits | `typesCreneau`, `joursLibelles`, `colonneHeure`, `boutonAjouterTemps`, `erreurNomObligatoire`, `prefixeDateDepuis`, `separateurPlageDates` |
| `cahierJournal` | Écran Cahier journal : navigation, journée, notes, séances, formulaire, duplication | `boutonInitialiserVide`, `labelNotes`, `enteteAbsencesJour`, `erreurChampsObligatoires` |
| `parametrage` | Écran Paramétrage : sections, champs, bornes du délai, pastille « Non enregistré », domaines de compétences | `sections`, `erreurDelaiSauvegardeHorsBornes`, `erreurIdentifiantObligatoire`, `erreurIdentifiantDejaUtilise`, `tooltipIdentifiantFige`, `pastilleNonEnregistre`, `labelDomainesInfo` |
| `popins` | Titres et boutons des popins (avertissement, sauvegarde, conflits, export de compétences) | `avertissement.confirmer`, `sauvegarde.labelMotDePasse`, `exportCompetences.choixSeance` |
| `elevesConcernes` | Composants `mc-eleves-concernes` et `mc-pastilles-eleves-concernes` | `modeClasse`, `modeGroupes`, `modeEleves`, `mentionEleveAbsent` |
| `commandes` | Libellés des commandes UNDO/REDO, affichés dans les tooltips ANNULER / REFAIRE | `ajoutEleve`, `initialisationDepuisEdt`, `modificationDomainesActifs` |
| `aria` | Libellés destinés uniquement à l'accessibilité (lecteurs d'écran) | `navigationPrincipale`, `valeurUtiliseeNonSupprimable`, `calendrierMoisPrecedent` |

### Extrait

```typescript
export const LIBELLES = {
  dates: {
    nomsJours: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
    initialeJours: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  },
  entete: {
    titre: 'MaClasse',
    tooltipPrefixeAnnuler: 'Annuler : ',
    typesResultatRecherche: { eleve: 'Élève', projet: 'Projet' },
    // …
  },
  commandes: {
    ajoutEleve: "Ajout d'un élève",
    // …
  },
  // …
} as const;
```

---

## Règles d'utilisation

- Dans les **templates de composants partagés** (`composants/`) : `LIBELLES.section.cle` — disponible via l'héritage de `ComposantBase`
- Dans les **composants d'écran** : déclarer `protected readonly LIBELLES = LIBELLES;` (les écrans n'héritent pas de `ComposantBase`)
- Dans les **valeurs par défaut d'`input()`** : importer `LIBELLES` directement depuis `'../../libelles'` (les valeurs par défaut sont évaluées au niveau module, pas à l'instance)
- Dans les **services** : importer `LIBELLES` pour les libellés de commande et les textes générés (ex. en-tête des notes d'absences)
- Ne jamais dupliquer une chaîne : si le même texte apparaît à deux endroits, pointer `commun.xxx` depuis les sections spécifiques
