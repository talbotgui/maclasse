---
name: projet-17-libelles
description: Structure du fichier libelles.ts — constante LIBELLES centralisée, organisée par domaine fonctionnel
metadata:
  type: project
  updated: 2026-06-15
related:
  - projet-15-architectureApplicative
  - feedback-10-composant-base
---

## Emplacement

`src/app/libelles.ts` — au même niveau que `app.ts` et `composant-base.ts`.

---

## Principe

- Constante `LIBELLES` exportée en `as const` (les valeurs sont des string literals inférables par TypeScript)
- Importée par `composant-base.ts` pour l'exposer dans tous les templates via `protected readonly LIBELLES`
- Organisée par domaine fonctionnel, pas par type d'élément (pas de section "boutons", pas de section "titres")
- La section `aria` regroupe les libellés uniquement destinés à l'accessibilité

---

## Structure

```typescript
export const LIBELLES = {
  commun: {
    enregistrer:               'Enregistrer',
    annuler:                   'Annuler',
    supprimer:                 'Supprimer',
    modifier:                  'Modifier',
    creer:                     'Créer',
    confirmer:                 'Confirmer',
    imprimer:                  'Imprimer',
    fermer:                    'Fermer',
    ajouter:                   'Ajouter',
    vider:                     'Vider',
    dupliquer:                 'Dupliquer',
    charger:                   'Charger',
    chargement:                'Chargement…',
    rechercher:                'Rechercher…',
    aucunResultat:             'Aucun résultat',
    avertissementModifications:'Des modifications non enregistrées seront perdues. Voulez-vous continuer ?',
  },

  entete: {
    titre:                     'MaClasse',
    sauvegarder:               'Sauvegarder',
    refaire:                   'Refaire',
    annuler:                   'Annuler',
    tooltipDerniereSauvegarde: 'Dernière sauvegarde : ',
    tooltipAucuneSauvegarde:   'Aucune sauvegarde effectuée',
    rechercheLabel:            'Recherche globale',
    rechercheAria:             'Résultats de recherche',
  },

  navigation: {
    accueil:      'Accueil',
    eleves:       'Élèves',
    projets:      'Projets',
    competences:  'Compétences',
    emploiDuTemps:'Emploi du temps',
    cahierJournal:'Cahier journal',
    parametrage:  'Paramétrage',
  },

  demarrage: {
    bienvenue:                 'Bienvenue dans MaClasse — gérez votre classe, à votre façon.',
    titreNouveauFichier:       'Première utilisation ? Créez votre espace de classe.',
    boutonCreer:               'Créer ma classe à partir d\'un jeu de données d\'exemple',
    titreCharger:              'Sélectionner la dernière version des données de votre classe',
    labelFichier:              'Fichier ZIP',
    labelMotDePasse:           'Mot de passe',
    boutonCharger:             'Charger',
    boutonChargement:          'Chargement…',
    erreurFichier:             'Fichier invalide ou corrompu.',
    erreurMotDePasse:          'Mot de passe incorrect.',
    erreurVersionIncompatible: 'Ce fichier a été créé avec une version plus récente de MaClasse. Veuillez mettre à jour l\'application.',
  },

  eleve: {
    titre:                    'Élèves',
    sectionIdentite:          'Identité',
    sectionContacts:          'Contacts',
    sectionAbsencesRecurrentes:'Absences récurrentes',
    sectionAbsencesPonctuelles:'Absences ponctuelles',
    sectionCursus:            'Cursus',
    sectionNotes:             'Notes administratives',
    aucunEleve:               'Aucun élève dans la classe',
    boutonImprimer:           'Imprimer la fiche',
  },

  projet: {
    titre:          'Projets',
    sectionInfos:   'Informations générales',
    sectionPeriodes:'Périodes',
    aucunProjet:    'Aucun projet',
    boutonImprimer: 'Imprimer le projet',
  },

  competences: {
    titre:                  'Compétences',
    panierVide:             'Aucune compétence sélectionnée',
    boutonVider:            'Vider la liste',
    boutonEnvoyerProjet:    'Envoyer vers un projet',
    boutonEnvoyerSeance:    'Envoyer vers une séance',
  },

  edt: {
    titre:                  'Emploi du temps',
    boutonImprimer:         'Imprimer',
    avertissementChevauchement: 'Un conflit d\'absence a été détecté.',
  },

  cahierJournal: {
    titre:                  'Cahier journal',
    boutonInitialiserVide:  'Initialiser une journée vide',
    boutonInitialiserEdt:   'Initialiser depuis l\'emploi du temps',
    boutonSupprimerJournee: 'Supprimer la journée',
    boutonDupliquerSeance:  'Dupliquer la séance',
    boutonDupliquerJournee: 'Dupliquer la journée',
    boutonImprimer:         'Imprimer',
    aucuneSeance:           'Aucune séance pour cette journée',
    labelJourCible:         'Jour cible',
    avertissementRemplacement: 'Le jour cible contient déjà des séances. Voulez-vous les remplacer ?',
  },

  parametrage: {
    titre:        'Paramétrage',
    sections: {
      enseignant:         'Enseignant',
      classe:             'Classe',
      groupes:            'Groupes',
      periodes:           'Périodes',
      raisonsAbsence:     'Raisons d\'absence',
      statutsEleve:       'Statuts élève',
      typesContact:       'Types de contact',
      statutsAcquisition: 'Statuts d\'acquisition',
      configEdt:          'Configuration emploi du temps',
      joursFeries:        'Jours fériés',
      preferences:        'Préférences',
    },
    labelDelaiSauvegarde: 'Délai de sauvegarde automatique (minutes)',
  },

  popins: {
    avertissement: {
      titre:    'Attention',
      confirmer:'Continuer sans enregistrer',
      annuler:  'Rester sur la page',
    },
    sauvegarde: {
      titre:          'Première sauvegarde',
      labelMotDePasse:'Mot de passe de chiffrement',
      confirmer:      'Sauvegarder',
      annuler:        'Annuler',
    },
    warnings: {
      titre:  'Conflits détectés',
      fermer: 'Fermer',
    },
    exportCompetences: {
      titre:         'Exporter les compétences',
      choixProjet:   'Projet',
      choixPeriode:  'Période',
      choixJour:     'Jour',
      choixSeance:   'Séance',
      confirmer:     'Exporter',
      annuler:       'Annuler',
    },
  },

  aria: {
    boutonFermerPopin:           'Fermer la fenêtre',
    navigationPrincipale:        'Navigation principale',
    champRecherche:              'Champ de recherche',
    valeurUtiliseeNonSupprimable:'Cette valeur est utilisée dans l\'application et ne peut pas être supprimée',
    eleveAbsent:                 'Élève absent ce jour',
  },
} as const;
```

---

## Règles d'utilisation

- Dans les **templates de composants partagés** (`composants/`) : `LIBELLES.section.cle` — disponible via l'héritage de `ComposantBase`
- Dans les **composants d'écran** : déclarer `protected readonly LIBELLES = LIBELLES;` (les écrans n'héritent pas de `ComposantBase`)
- Dans les **valeurs par défaut d'`input()`** : importer `LIBELLES` directement depuis `'../../libelles'` (les valeurs par défaut sont évaluées au niveau module, pas à l'instance)
- Ne jamais dupliquer une chaîne : si le même texte apparaît à deux endroits, pointer `commun.xxx` depuis les sections spécifiques
