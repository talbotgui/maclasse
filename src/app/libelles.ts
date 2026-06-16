/**
 * Constante centralisée de tous les libellés de l'interface utilisateur.
 * Organisée par domaine fonctionnel. Importée par ComposantBase pour les composants partagés,
 * et déclarée localement dans chaque composant d'écran.
 */
export const LIBELLES = {
  /** Libellés communs réutilisés dans plusieurs domaines. */
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

  /** Libellés de la barre d'en-tête. */
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

  /** Libellés de la navigation principale. */
  navigation: {
    accueil:       'Accueil',
    eleves:        'Élèves',
    projets:       'Projets',
    competences:   'Compétences',
    emploiDuTemps: 'Emploi du temps',
    cahierJournal: 'Cahier journal',
    parametrage:   'Paramétrage',
  },

  /** Libellés de l'écran de démarrage (popin obligatoire). */
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

  /** Libellés de l'écran Élèves. */
  eleve: {
    titre:                     'Élèves',
    sectionIdentite:           'Identité',
    sectionContacts:           'Contacts',
    sectionAbsencesRecurrentes:'Absences récurrentes',
    sectionAbsencesPonctuelles:'Absences ponctuelles',
    sectionCursus:             'Cursus',
    sectionNotes:              'Notes administratives',
    aucunEleve:                'Aucun élève dans la classe',
    boutonImprimer:            'Imprimer la fiche',
  },

  /** Libellés de l'écran Projets. */
  projet: {
    titre:          'Projets',
    sectionInfos:   'Informations générales',
    sectionPeriodes:'Périodes',
    aucunProjet:    'Aucun projet',
    boutonImprimer: 'Imprimer le projet',
  },

  /** Libellés de l'écran Compétences. */
  competences: {
    titre:               'Compétences',
    panierVide:          'Aucune compétence sélectionnée',
    boutonVider:         'Vider la liste',
    boutonEnvoyerProjet: 'Envoyer vers un projet',
    boutonEnvoyerSeance: 'Envoyer vers une séance',
  },

  /** Libellés de l'écran Emploi du temps. */
  edt: {
    titre:                      'Emploi du temps',
    boutonImprimer:             'Imprimer',
    avertissementChevauchement: 'Un conflit d\'absence a été détecté.',
  },

  /** Libellés de l'écran Cahier journal. */
  cahierJournal: {
    titre:                      'Cahier journal',
    boutonInitialiserVide:      'Initialiser une journée vide',
    boutonInitialiserEdt:       'Initialiser depuis l\'emploi du temps',
    boutonSupprimerJournee:     'Supprimer la journée',
    boutonDupliquerSeance:      'Dupliquer la séance',
    boutonDupliquerJournee:     'Dupliquer la journée',
    boutonImprimer:             'Imprimer',
    aucuneSeance:               'Aucune séance pour cette journée',
    labelJourCible:             'Jour cible',
    avertissementRemplacement:  'Le jour cible contient déjà des séances. Voulez-vous les remplacer ?',
  },

  /** Libellés de l'écran Paramétrage. */
  parametrage: {
    titre:  'Paramétrage',
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

  /** Libellés des fenêtres modales (popins). */
  popins: {
    /** Popin de confirmation avant perte de données. */
    avertissement: {
      titre:    'Attention',
      confirmer:'Continuer sans enregistrer',
      annuler:  'Rester sur la page',
    },
    /** Popin de saisie du mot de passe lors de la première sauvegarde. */
    sauvegarde: {
      titre:          'Première sauvegarde',
      labelMotDePasse:'Mot de passe de chiffrement',
      confirmer:      'Sauvegarder',
      annuler:        'Annuler',
    },
    /** Popin d'affichage des conflits d'absences. */
    warnings: {
      titre:  'Conflits détectés',
      fermer: 'Fermer',
    },
    /** Popin d'export de compétences vers un projet ou une séance. */
    exportCompetences: {
      titre:        'Exporter les compétences',
      choixProjet:  'Projet',
      choixPeriode: 'Période',
      choixJour:    'Jour',
      choixSeance:  'Séance',
      confirmer:    'Exporter',
      annuler:      'Annuler',
    },
  },

  /** Libellés destinés exclusivement à l'accessibilité (RGAA). */
  aria: {
    boutonFermerPopin:            'Fermer la fenêtre',
    navigationPrincipale:         'Navigation principale',
    champRecherche:               'Champ de recherche',
    valeurUtiliseeNonSupprimable: 'Cette valeur est utilisée dans l\'application et ne peut pas être supprimée',
    eleveAbsent:                  'Élève absent ce jour',
  },
} as const;
