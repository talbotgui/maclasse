---
name: projet-05-services
description: Architecture des services de MaClasse — services de contexte (stateful) et services métier (stateless)
metadata:
  type: project
  updated: 2026-06-09
related:
  - projet-01-descriptionGenerale
  - projet-02-modelesDonnees
  - projet-03-ecrans
---

## Principes

- Toute mutation des données transite par `DonneesService` — aucun composant ni service métier ne modifie le JSON directement
- Les services métier portent la validation, la manipulation et les algorithmes propres à leur domaine
- Les services sont `providedIn: 'root'` (singletons), injectés via `inject()`

---

## Services de contexte (stateful)

### `DonneesService`

- Porte le **JSON complet** de l'application sous forme d'un **signal unique**
- Embarque la logique **UNDO/REDO** :
  - Pile undo et pile redo maintenues en interne
  - Aucune méthode publique ne permet d'altérer directement les données
  - Les services métier soumettent des **commandes** (objet décrivant la mutation et son inverse)
  - Expose des signaux `peutAnnuler` et `peutRefaire` (pour activer/désactiver les boutons dans l'entête)
- Expose des méthodes : `executer(commande)`, `annuler()`, `refaire()`

### `ContextService`

Données globales transverses, non liées à un écran spécifique :

| Propriété | Type | Description |
|---|---|---|
| `themeActif` | `signal<string>` | Identifiant du thème visuel actif (ex. `'defaut'`, `'contraste'`) |
| `eleveSelectionne` | `signal<string \| null>` | ID du dernier élève sélectionné (conservé au changement d'écran) |
| `jourCourantCahierJournal` | `signal<string \| null>` | ISO date du dernier jour consulté dans le cahier journal |
| `panierCompetences` | `signal<string[]>` | IDs des compétences dans le panier (écran Compétences), persisté entre les accès |
| `motDePasse` | `string \| null` | Mot de passe saisi au chargement, conservé pour la sauvegarde (jamais persisté en localStorage) |

---

## Services métier (stateless)

Chaque service expose des méthodes pures de manipulation et validation. Les mutations sont soumises à `DonneesService` via une commande.

### `EleveService`

- CRUD élève (créer, lire, modifier, supprimer) → via commande à `DonneesService`
- Validation des données d'une fiche élève
- Résolution : élève par ID, liste filtrée par recherche textuelle
- Calcul des absences récurrentes d'un élève (liste des conflits potentiels)

### `CompetenceService`

- Parcours de l'arbre des compétences
- Recherche textuelle dans les libellés (tous niveaux)
- Filtrage par domaine (niveau 1 de l'arbre)
- Résolution d'un ID compétence en libellé complet + chemin dans l'arbre

### `ProjetService`

- CRUD projet → via commande à `DonneesService`
- Validation des données d'un projet
- Résolution : projet par ID, liste filtrée par recherche textuelle
- Association élèves ↔ projet, compétences ↔ période de projet

### `EmploiDuTempsService`

- CRUD des EDT eux-mêmes (créer, modifier nom/dates/fréquence, supprimer) → via commande à `DonneesService`
- CRUD des créneaux d'un EDT → via commande à `DonneesService`
- Validation d'un créneau (chevauchement horaire dans le même jour)
- **Contrôle de chevauchement d'EDT** : deux EDT ne peuvent pas avoir des plages de dates ET des fréquences qui se chevauchent — warning non bloquant affiché dans l'écran
- **Contrôle de cohérence absences** :
  - Déclenché à l'**ouverture** de l'écran EDT
  - Déclenché au clic sur le triangle warning d'un créneau
  - Retourne la liste des conflits (créneau EDT ↔ absence récurrente d'un élève)

### `CahierJournalService`

- CRUD séances dans une journée → via commande à `DonneesService`
- Initialisation d'une journée vide
- **Initialisation depuis l'EDT** : sélectionne l'EDT applicable à une date donnée selon l'algorithme :
  1. Filtrer les EDT dont la plage de dates contient la date (ou sans date = toujours applicable)
  2. Parmi eux, garder ceux dont la fréquence correspond à la parité de la semaine (ou fréquence = lesDeux)
  3. Copier les créneaux du jour de semaine correspondant
- Réorganisation des séances (déplacement vers le haut/bas)
- Validation : un élève ne peut pas être affecté à deux séances simultanées
- **Contrôle de cohérence absences** :
  - Déclenché à l'**ouverture** de l'écran cahier journal
  - Déclenché au clic sur le triangle warning d'une séance
  - Retourne la liste des conflits (séance ↔ absence récurrente d'un élève concerné)

### `ReferentielService`

- Expose des méthodes `estUtilise(type, id)` pour chaque type de référentiel :
  - Groupe utilisé par un élève ou une séance/créneau EDT ?
  - StatutAcquisition utilisé par un PPI ou un bulletin ?
  - StatutEleve utilisé par un élève ?
  - TypeContact utilisé par un contact d'élève ?
  - Période utilisée par un projet ou un bulletin ?
- Ces méthodes sont appelées par l'écran Paramétrage pour activer/désactiver les boutons `mc-bouton-destruction`
- CRUD des référentiels → via commande à `DonneesService`

### `ChiffrementService`

- Chiffrement AES-GCM via Web Crypto API (encrypt / decrypt)
- Compression et décompression ZIP (lecture/écriture du fichier de données)
- Génération du fichier ZIP chiffré à télécharger
- Lecture et déchiffrement d'un fichier ZIP uploadé

---

## Diagramme de dépendances (simplifié)

```
Composant écran
  └─► Service métier (EleveService, CahierJournalService, …)
        └─► DonneesService.executer(commande)
              └─► Signal JSON mis à jour + pile undo alimentée

Entête (boutons Annuler/Refaire)
  └─► DonneesService.annuler() / .refaire()

Entête (bouton Sauvegarder)
  └─► ChiffrementService.genererZipChiffre(donnees, motDePasse)
```
