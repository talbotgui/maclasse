---
name: services
description: Architecture des services de MaClasse — services avec état (DonneesService, ContexteService) et services sans état (métier, migration, chiffrement, sauvegarde)
metadata:
  type: project
  updated: 2026-09-27
related:
  - specification/description-generale
  - specification/modeles-donnees
  - specification/elements-techniques
  - specification/ecrans/vue-ensemble
---

## Principes

- Toute mutation des données transite par `DonneesService` — aucun composant ni service métier ne modifie le JSON directement
- Les services métier portent la validation, la manipulation et les algorithmes propres à leur domaine
- Les services sont `providedIn: 'root'` (singletons), injectés via `inject()`
- Répertoires : `services/avecEtat/` (état porté par des signaux) et `services/sansEtat/` (aucun état propre, sauf le minuteur de `SauvegardeAutoService`)

---

## Services avec état

### `DonneesService`

- Porte le **JSON complet** de l'application sous forme d'un **signal unique** `donnees` (lecture seule, `null` tant que rien n'est chargé)
- Embarque la logique **UNDO/REDO** :
  - Pile undo et pile redo maintenues en interne
  - Aucune méthode publique ne permet d'altérer directement les données
  - Les services métier soumettent des **commandes** (voir [elements-techniques](elements-techniques.md#pattern-commande-undoredo))
  - Signaux `peutAnnuler` et `peutRefaire` (activation des boutons de l'entête)
  - Signaux `libelleSommetUndo` et `libelleSommetRedo` : libellé de la commande au sommet de chaque pile, `null` si la pile est vide (tooltips ANNULER / REFAIRE)
- Méthodes : `charger(donnees, recentrerCahierJournalSurSemaineSuivante?)`, `executer(commande)`, `annuler()`, `refaire()`, `marquerCommeSauvegarde()`
- Signal `aDonneesModifiees` : passe à `true` après chaque `executer()`, `annuler()` ou `refaire()` ; remis à `false` par `charger()` et par `marquerCommeSauvegarde()` (appelé après chaque sauvegarde réussie)

#### `charger()`

1. Clone les données reçues
2. Applique `MigrationService.migrer()` (étapes de version et normalisation des identifiants manquants)
3. **Données d'exemple uniquement** (création d'une classe, consultation du référentiel — paramètre `recentrerCahierJournalSurSemaineSuivante` à `true`) : décale toutes les dates du cahier journal pour que la plus ancienne journée tombe dans la **semaine suivant la date du jour**, en conservant le jour de la semaine de chaque journée. Un ZIP importé garde ses dates telles quelles
4. Met les données en mémoire, vide les piles undo/redo, remet `aDonneesModifiees` à `false`

### `ContexteService`

Données globales transverses, non liées à un écran spécifique. Aucune n'est écrite dans le fichier de données.

| Propriété | Type | Description |
|---|---|---|
| `themeActif` | `signal<string>` | Identifiant du thème visuel actif, persisté dans le `localStorage` (voir [themes](themes.md)) |
| `eleveSelectionne` | `signal<string \| null>` | ID du dernier élève sélectionné (conservé au changement d'écran) |
| `projetSelectionne` | `signal<string \| null>` | ID du dernier projet sélectionné (conservé au changement d'écran) |
| `jourCourantCahierJournal` | `signal<string \| null>` | Date ISO du dernier jour consulté dans le cahier journal |
| `panierCompetences` | `signal<string[]>` | IDs des compétences dans le panier (écran Compétences), conservé entre les accès |
| `modeConsultationReferentiel` | `signal<boolean>` | `true` quand les données d'exemple ont été chargées par « Accéder aux programmes » (voir [démarrage](ecrans/demarrage.md)) : seul l'écran Compétences est accessible |
| `motDePasse` | `string \| null` | Mot de passe saisi au chargement ou à la première sauvegarde, conservé pour les sauvegardes suivantes (jamais persisté) |

Méthodes : `basculerTheme()` (thème suivant dans le cycle `defaut` → `foret` → `crepuscule` → `terre` → `contraste`), `appliquerTheme(id)` (attribut `data-theme` sur `<html>`, absent pour le thème par défaut).

---

## Services métier

Chaque service expose des méthodes de manipulation et de validation. Les mutations sont soumises à `DonneesService` via une commande dont le libellé vient de `LIBELLES.commandes`.

### `EleveService`

- CRUD élève (`creerEleve`, `modifierEleve`, `supprimerEleve`) → via commande à `DonneesService`
- `rechercherEleves(terme)` : élèves triés NOM Prénom, filtrés sur le nom et le prénom (insensible à la casse et aux accents)
- `listerIdsElevesAbsents(date)` : UUID des élèves ayant une `AbsencePonctuelle` à cette date (utilisé par le formulaire de séance du cahier journal)
- `genererLibellesAbsencesDuJour(date)` : une ligne par élève absent ce jour, triée par élève (« - NOM Prénom : … ») :
  - absences récurrentes du jour de la semaine, de parité `lesDeux` ou égale à celle de la semaine, triées par heure de début, au format « libellé (hh:mm-hh:mm) »
  - puis absences ponctuelles de la date, justification en MAJUSCULES
  - absences séparées par « ; » ; utilisé pour pré-remplir les notes d'une journée du cahier journal (règle détaillée dans le [plan 17](../plans/17-cahier-journal-regroupement-absences.md))

### `CompetenceService`

- `obtenirDomaines(): Competence[]` — nœuds de **niveau 1** (disciplines/domaines, ex. Français, Mathématiques), **filtrés selon `configuration.domainesActifs`** :
  - `domainesActifs` absent ou vide : arbre complet
  - domaine de niveau 1 actif : tout son sous-arbre
  - seuls certains sous-domaines de niveau 2 actifs : le domaine est conservé avec ces seuls sous-domaines
  - C'est la source des chips de disciplines (`disciplinesIds` des séances et des temps de créneau) et de l'arbre de l'écran Compétences
- `obtenirDomaineParId(id)` — résout un ID de discipline
- `rechercherCompetences(terme)` — nœuds de tous niveaux dont le libellé contient le terme (insensible à la casse et aux accents)
- `resoudreLibelle(id)` et `obtenirChemin(id)` — libellé complet et chemin d'une compétence dans l'arbre

### `ProjetService`

- CRUD projet (`creerProjet`, `modifierProjet`, `supprimerProjet`) → via commande à `DonneesService`
- `rechercherProjets(terme)` : filtre sur le **nom et la description** (insensible à la casse et aux accents)
- `modifierPeriode(projetId, ancienne, nouvelle)` : remplace une période de projet retrouvée par son `id` (utilisé par l'export de compétences depuis l'écran Compétences)

### `EmploiDuTempsService`

- CRUD des EDT (`creerEdt`, `modifierEdt`, `supprimerEdt`) et de leurs créneaux (`ajouterCreneau`, `modifierCreneau`, `supprimerCreneau`) → via commande à `DonneesService`
- Constante `NOMBRE_TEMPS_MAX` (4) : nombre maximal de temps par créneau, réutilisée par le formulaire de créneau
- **Conflit entre EDT** — `obtenirEdtsEnConflit(edt)` : un autre EDT est en conflit si les **trois** conditions sont réunies :
  1. fréquences compatibles (`verifierCompatibiliteFrequences` : `lesDeux` est compatible avec tout, `paire` et `impaire` ne le sont pas entre elles)
  2. plages de dates qui se chevauchent (une date absente = sans limite)
  3. au moins un temps de l'un chevauche un temps de l'autre **le même jour**
- **Chevauchement interne** — `verifierChevauchementInterne(edt)` : deux créneaux distincts d'un même EDT se chevauchent le même jour (les temps d'un même créneau ne sont pas comparés entre eux)
- `validerChevauchement(edt)` : chevauchement interne **ou** conflit avec un autre EDT → icône ⚠ sur l'EDT dans la liste (warning non bloquant)
- **Contrôle de cohérence absences** — `calculerConflitsAbsences(creneauId)` :
  - Créneaux pédagogiques uniquement, parité de l'absence compatible avec la fréquence de l'EDT
  - Calculé à l'**ouverture** de l'écran EDT et au **chargement d'un EDT** dans la grille ; relu au clic sur le triangle warning d'un créneau
  - Retourne les libellés « NOM Prénom — libellé d'absence »
- `obtenirAbsencesPertinentes(edt)` : absences récurrentes dont le jour est utilisé par l'EDT et de parité compatible (bandeau des absences régulières)

### `EmploiDuTempsCalculeService`

- CRUD des définitions d'EDT calculés (`creerEdtCalcule`, `modifierEdtCalcule`, `supprimerEdtCalcule`) → via commande à `DonneesService`
- `calculerCreneaux(edtCalcule): CreneauCalcule[]` — recalcule les créneaux à chaque affichage (jamais persistés) :
  - EDT sources retenus : plage de dates qui chevauche celle de la définition **et** fréquence compatible
  - Source `tempsHorsClasse` : un créneau par temps des créneaux récréation et pause déjeuner (élèves concernés ignorés)
  - Source `tempsClasse` : un créneau par temps pédagogique concernant au moins un des élèves choisis (aucun filtre si la définition concerne toute la classe)
  - Source `absencesRegulieres` : une entrée par absence récurrente des élèves choisis, de parité compatible
  - Résultat trié par heure de début
- Détail fonctionnel : [emploi-du-temps](ecrans/emploi-du-temps.md#emplois-du-temps-calculés)

### `CahierJournalService`

- CRUD séances dans une journée (`ajouterSeance`, `modifierSeance`, `supprimerSeance`) et suppression d'une journée → via commande à `DonneesService`
- `modifierNotesJournee(date, notes)` : notes libres de la journée (trim, vide → `undefined`, sans effet si inchangées)
- **Initialisation d'une journée vide** (`initialiserJourneeVide`)
- **Initialisation depuis l'EDT** (`initialiserDepuisEdt`) : sans effet si la journée existe déjà ou si la date tombe un week-end ; sinon :
  1. Retenir les EDT dont la plage de dates contient la date (date absente = sans limite)
  2. Parmi eux, garder ceux de fréquence `lesDeux` ou égale à la parité de la semaine
  3. Créer une séance par temps des créneaux du jour de la semaine correspondant, triées par heure de début
- **Notes pré-remplies** : aux deux initialisations, s'il y a au moins une absence ce jour, les notes reçoivent l'en-tête `LIBELLES.cahierJournal.enteteAbsencesJour` suivi des lignes de `EleveService.genererLibellesAbsencesDuJour(date)`
- **Échange d'heures** (`echangerHeuresSeances(date, idA, idB)`) : permute `heureDebut` et `heureFin` de deux séances (boutons ↑ ↓) ; l'ordre de stockage n'est pas modifié
- **Élèves sur des séances simultanées** — `detecterElevesSurSeancesSimultanees(date, seance)` : pour une séance pédagogique, libellés « NOM Prénom » (triés) des élèves également concernés par une autre séance pédagogique de la journée qui la chevauche (chevauchement strict, séance de même id exclue) ; appelé à l'ENREGISTRER du formulaire de séance, **bloquant**
- **Contrôle de cohérence absences récurrentes** — `calculerConflitsPourSeance(date, seance)` et `calculerConflitsAbsences(date, seanceId)` :
  - Déclenché à l'**ENREGISTRER** d'une séance (warning non bloquant, alimente `Seance.conflitDetecte`)
  - Relu au clic sur le triangle warning d'une séance
  - Retourne les libellés « NOM Prénom — libellé d'absence »
- Le périmètre d'une séance (classe / groupes / élèves) est résolu en identifiants d'élèves par une méthode privée commune au contrôle des absences récurrentes et à celui des séances simultanées
- **Duplication de séance** (`dupliquerSeance`) : copie une séance vers un autre jour (crée la `JourneeJournal` cible si nécessaire)
- **Duplication de journée** (`dupliquerJournee`) : copie les séances et les notes d'un jour vers un autre (crée la journée cible ou la remplace)

### `ReferentielService`

- **Contrôles d'utilisation**, une méthode par type, appelées par le Paramétrage pour désactiver le bouton `mc-bouton-destruction` d'une valeur utilisée :

| Méthode | Valeur utilisée si référencée par |
|---|---|
| `estGroupeUtilise(id)` | un élève, un temps de créneau EDT, un **EDT calculé** ou une séance du cahier journal |
| `estStatutAcquisitionUtilise(id)` | un PPI ou un bulletin |
| `estStatutEleveUtilise(id)` | un élève |
| `estTypeContactUtilise(id)` | un contact d'élève |
| `estPeriodeUtilisee(nom)` | une période de projet ou un bulletin — la période est identifiée par son **nom** (`ProjetPeriode.periodeNom`, `Bulletin.periode`) |

- CRUD des groupes, statuts d'acquisition, statuts d'élève, types de contact, périodes et **jours fériés** → via commande à `DonneesService`
- `modifierConfigEmploiDuTemps(…)` → via `CommandeRemplacement`

---

## Services techniques

### `MigrationService`

- Fait évoluer les données chargées vers le format de la version courante de l'application (détail des étapes : [elements-techniques](elements-techniques.md#gestion-des-versions-du-json))
- `obtenirVersionCourante()` : version cible de la dernière étape
- `estVersionSupportee(version)` : `true` si la version est inférieure ou égale à la version courante ; appelée par `popin-demarrage` après le déchiffrement d'un ZIP
- `migrer(donnees)` : applique en place les étapes dont la version cible est postérieure à `donnees.version`, met à jour `donnees.version`, puis attribue un `id` aux périodes de projet et aux entrées de cursus qui n'en ont pas (normalisation idempotente, appliquée à chaque chargement)
- Appelé par `DonneesService.charger()`

### `SauvegardeAutoService`

- `sauvegarder()` : chiffre les données avec `ContexteService.motDePasse` via `ChiffrementService.chiffrer()`, déclenche le téléchargement de `maclasse_AAAA-MM-JJ.zip`, appelle `DonneesService.marquerCommeSauvegarde()` et met à jour `dateDerniereSauvegarde` (tooltip du bouton SAUVEGARDER). Sans effet si aucune donnée ou aucun mot de passe
- `demarrer()` : (re)démarre un minuteur qui, toutes les N minutes, sauvegarde **uniquement si** `aDonneesModifiees` vaut `true`
  - N = `donnees.configuration.delaiSauvegardeAutoMinutes`, **5 par défaut** ; bornes 1–60 contrôlées par le Paramétrage
  - Démarré **au chargement d'un ZIP** (le mot de passe est alors connu) et **après la première sauvegarde manuelle** réussie
  - Redémarré à l'enregistrement des Préférences, **s'il était actif**, pour prendre en compte le nouveau délai
- `arreter()`, `timerActif`
- Utilisé pour les sauvegardes manuelles (entête) comme automatiques : aucune popin tant que le mot de passe est connu

### `RechercheGlobaleService`

- `rechercher(terme)` : parcourt les élèves (« NOM Prénom ») puis les projets (nom), insensible à la casse et aux accents ; tableau vide si le terme est vide
- Format de chaque résultat (`ResultatRecherche`) : `{ type, titre, id, route }`
  - `type` technique : `'eleve'` ou `'projet'` — l'entête affiche à sa place un libellé accentué issu de `LIBELLES` (« Élève », « Projet »)
  - Ex. `{ type: 'eleve', titre: 'MARTIN Paul', id: '...', route: '/eleves' }`
  - Ex. `{ type: 'projet', titre: 'compostage', id: '...', route: '/projets' }`
- Le composant de recherche de l'entête délègue le filtrage à ce service (saisie différée de 300 ms)

### `ChiffrementService`

- `chiffrer(donnees, motDePasse): Promise<Blob>` :
  1. Sérialisation JSON
  2. Compression deflate (`fflate`)
  3. Dérivation d'une clé AES-GCM 256 bits par **PBKDF2-SHA-256, 100 000 itérations**, salt aléatoire de 16 octets
  4. Chiffrement AES-GCM, IV aléatoire de 12 octets
  5. ZIP (`fflate`) contenant une seule entrée **`donnees.json.enc`** = `[salt][iv][données chiffrées]`
- `dechiffrer(fichier, motDePasse): Promise<DonneesApplication>` : opération inverse ; un échec du déchiffrement AES-GCM (`DOMException`) est affiché par `popin-demarrage` comme un mot de passe incorrect, toute autre erreur comme un fichier invalide
- Ne contrôle pas la version : c'est `popin-demarrage` qui appelle `MigrationService.estVersionSupportee()`
- Le téléchargement du fichier est fait par `SauvegardeAutoService`

---

## Diagramme de dépendances (simplifié)

```
Composant écran
  └─► Service métier (EleveService, CahierJournalService, …)
        └─► DonneesService.executer(commande)
              └─► Signal JSON mis à jour + pile undo alimentée

Entête (boutons Annuler/Refaire)
  └─► DonneesService.annuler() / .refaire()

Entête (bouton Sauvegarder) et minuteur de sauvegarde automatique
  └─► SauvegardeAutoService.sauvegarder()
        └─► ChiffrementService.chiffrer(donnees, motDePasse)

Popin de démarrage (Charger)
  ├─► ChiffrementService.dechiffrer(fichier, motDePasse)
  ├─► MigrationService.estVersionSupportee(version)
  └─► Écran de démarrage
        ├─► DonneesService.charger(donnees)
        │     └─► MigrationService.migrer(donnees)
        └─► SauvegardeAutoService.demarrer()
```
