---
name: modeles-donnees
description: Modèles de données de l'application MaClasse — structure du fichier JSON, entités et leurs propriétés
metadata:
  type: project
  updated: 2026-09-28
related:
  - specification/description-generale
---

## Structure racine du fichier JSON

```
{
  version: string,
  configuration: ConfigApplication,
  enseignant: Enseignant,
  classe: Classe,
  referentiels: Referentiels,
  emploisDuTemps: EmploiDuTemps[],
  emploisDuTempsCalcules: EmploiDuTempsCalcule[],
  projets: Projet[],
  cahierJournal: JourneeJournal[],
  ppi: Ppi[],           // phase 2, non implémenté
  bulletins: Bulletin[] // phase 2, non implémenté
}
```

## Types communs

```
JourSemaine      = 'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi'   // jours ouvrés possibles
FrequenceSemaine = 'paire' | 'impaire' | 'lesDeux'
TypeCreneau      = 'pedagogique' | 'recreation' | 'pauseDejeuner'

ElevesConcernes {
  type: 'classe' | 'groupes' | 'eleves',
  groupes: string[],     // ids de Groupe (mode groupes)
  elevesIds: string[]    // UUID d'élèves (mode élèves)
}
```

`JourSemaine` s'arrête au vendredi : le samedi et le dimanche ne peuvent pas être jours ouvrés.

## ConfigApplication

```
{
  delaiSauvegardeAutoMinutes: number, // délai entre deux sauvegardes automatiques, en minutes (défaut : 5, bornes 1–60)
  domainesActifs?: string[]           // ids des domaines (niveau 1) et sous-domaines (niveau 2) de compétences activés
}
```

`domainesActifs` absent ou vide : tous les domaines sont actifs. Sinon, un domaine de niveau 1 coché inclut tout son sous-arbre ; si seuls certains sous-domaines sont cochés, seuls leurs sous-arbres sont retenus (voir `CompetenceService.obtenirDomaines()` dans [services](services.md#competenceservice)). Modifié par la section « Domaines de compétences » du [paramétrage](ecrans/parametrage.md).

## Enseignant

```
{
  prenom: string,
  nom: string,
  annee: string  // ex: "2025-2026"
}
```

## Classe

```
{
  annee: string,
  niveau: string,
  eleves: Eleve[]
}
```

## Eleve

```
{
  id: string,                   // UUID
  prenom: string,
  nom: string,
  sexe: 'M' | 'F',
  niveau: string,               // ex: "CM1"
  groupes: string[],            // ref: Groupe.id
  dateNaissance: string,        // ISO date
  dateArrivee: string,          // ISO date
  statut: string,               // ref: StatutEleve.id (DC/DE/HE)
  bilans: string,               // texte libre
  accueil: string,              // texte libre
  inclusion: string | null,     // texte libre
  contacts: Contact[],
  absencesRecurrentes: AbsenceRecurrente[],
  absencesPonctuelles: AbsencePonctuelle[],
  cursus: CursusAnnee[],
  droitImage: Autorisation,
  autorisationBaignade: Autorisation,
  autorisationSortieReguliere: Autorisation,
  notesPPA: string | null,      // texte libre
  notesESS: string | null,      // texte libre
  portLunettes: boolean,
  notificationAesh: boolean,
  lateralite: 'gaucher' | 'droitier' | null   // null = non renseignée
}
```

## Autorisation

```
{
  reponse: 'accepte' | 'refuse' | 'sansReponse' | null,  // null = non renseignée (≠ 'sansReponse' : la famille n'a pas répondu)
  precision: string                                      // texte libre sur une ligne
}
```

## Contact

```
{
  type: string,           // ref: TypeContact.id (P=père, M=mère, ...)
  nom: string,
  email: string,
  telephone: string,
  adressePostale: string
}
```

## CursusAnnee

```
{
  id: string,             // UUID
  annee: number,
  niveau: string,
  etablissement: string,
  accompagnement: string
}
```

## Referentiels

```
{
  competences: Competence[],              // arbre hiérarchique (id, libelle, enfants?)
  periodes: Periode[],
  statutsAcquisition: StatutAcquisition[], // barème de notes personnalisable (A/EC/NA/NE par défaut)
  statutsEleve: StatutEleve[],
  typesContact: TypeContact[],
  groupes: Groupe[],
  joursFeries: JourFerie[],
  configEmploiDuTemps: ConfigEmploiDuTemps
}
```

### Competence (arbre)

```
{
  id: string,      // ex: "APS-C1-1-3"
  libelle: string,
  enfants?: Competence[]
}
```

### StatutAcquisition

```
{
  id: string,       // ex: "A", "EC", "NA", "NE" — barème personnalisable
  glyphe: string,   // ex: "✓", "~", "✗", "?"
  libelle: string,  // ex: "Acquis", "En cours", "Non acquis", "Non évalué"
  couleur: string,  // couleur texte (CSS)
  fond: string      // couleur fond (CSS)
}
```

### Periode

```
{
  id: string,     // UUID
  nom: string,    // ex: "Période 1" — clé métier référencée par ProjetPeriode.periodeNom et Bulletin.periode
  debut: string,  // ISO date
  fin: string     // ISO date
}
```

### StatutEleve

```
{
  id: string,      // ex: "DC"
  libelle: string  // ex: "Dans la classe"
}
```

### TypeContact

```
{
  id: string,      // ex: "P"
  libelle: string  // ex: "Père"
}
```

### Groupe

```
{
  id: string,      // "A", "B"… dans les données d'exemple ; UUID pour un groupe ajouté dans le Paramétrage
  libelle: string  // ex: "Groupe A"
}
```

### JourFerie

```
{
  id: string,      // UUID
  nom: string,     // ex: "Toussaint"
  date: string     // ISO date
}
```

### ConfigEmploiDuTemps (dans referentiels)

```
{
  joursOuvres: JourSemaine[],   // ex: ["lundi","mardi","jeudi","vendredi"] — du lundi au vendredi
  heureDebutJournee: string,    // "HH:MM"
  heureFinJournee: string       // "HH:MM"
}
```

### AbsenceRecurrente (dans Eleve)

```
{
  id: string,
  libelle: string,          // ex: "Orthophonie"
  jour: JourSemaine,
  heureDebut: string,       // "HH:MM"
  heureFin: string,         // "HH:MM"
  paritesSemaine: FrequenceSemaine
}
```

### AbsencePonctuelle (dans Eleve)

```
{
  id: string,
  date: string,             // ISO date (ex: "2026-06-09")
  justification: string     // texte libre
}
```

## EmploiDuTemps

```
{
  id: string,
  nom: string,              // obligatoire
  dateDebut: string | null, // ISO date
  dateFin: string | null,   // ISO date
  frequence: FrequenceSemaine,
  creneaux: CreneauEdt[]
}
```

### CreneauEdt

```
{
  id: string,
  jour: JourSemaine,        // ex: 'lundi', 'mardi'...
  type: TypeCreneau,
  temps: TempsCreneau[]     // 1 à 4, chacun avec son horaire
}
```

Récréations et pauses déjeuner forment les **temps hors classe**.

### TempsCreneau (dans CreneauEdt)

```
{
  id: string,
  heureDebut: string,       // "HH:MM"
  heureFin: string,         // "HH:MM"
  disciplinesIds?: string[], // si créneau pédagogique — plusieurs disciplines possibles
  titre?: string,           // si créneau pédagogique
  elevesConcernes?: ElevesConcernes // si créneau pédagogique
}
```

Les champs pédagogiques sont absents des temps d'un créneau récréation ou pause déjeuner.

> `emploisDuTemps: EmploiDuTemps[]` est dans la structure racine du JSON (voir plus haut).

### EmploiDuTempsCalcule

Définition persistée d'une vue en lecture seule ; ses créneaux sont recalculés à chaque affichage (voir l'écran Emploi du temps).

```
{
  id: string,
  nom: string,              // obligatoire
  dateDebut: string | null, // ISO date
  dateFin: string | null,   // ISO date
  frequence: FrequenceSemaine,
  sources: ('tempsHorsClasse' | 'tempsClasse' | 'absencesRegulieres')[], // au moins une
  elevesConcernes: ElevesConcernes
}
```

### CreneauCalcule (non persisté)

Créneau produit par `EmploiDuTempsCalculeService.calculerCreneaux()` à chaque affichage d'un EDT calculé. Jamais écrit dans le JSON.

```
{
  jour: JourSemaine,
  heureDebut: string,        // "HH:MM"
  heureFin: string,          // "HH:MM"
  source: TypeSourceCalculee,
  libelle: string,           // titre du temps, libellé de l'absence ou libellé du type hors classe
  eleveConcerneId?: string   // uniquement pour source = 'absenceReguliere'
}

TypeSourceCalculee = 'recreation' | 'pauseDejeuner' | 'tempsClasse' | 'absenceReguliere'
```

`TypeSourceCalculee` détaille l'origine d'un créneau calculé (la source `tempsHorsClasse` d'une définition produit des créneaux `recreation` ou `pauseDejeuner`) ; il détermine la couleur de la cellule dans la grille.

---

## Projet

```
{
  id: string,           // UUID
  nom: string,
  description: string,
  elevesIds: string[],  // UUIDs des élèves participants
  periodes: ProjetPeriode[]
}
```

### ProjetPeriode

```
{
  id: string,               // UUID
  periodeNom: string,       // ref: Periode.nom
  debut: string,            // ISO date — tri ascendant des périodes
  fin: string,              // ISO date
  description: string,
  competencesIds: string[]  // IDs de compétences travaillées
}
```

## JourneeJournal (cahier journal)

```
{
  id: string,        // UUID
  date: string,      // ISO date
  notes?: string,    // mémo libre de la journée (rappels, événements…), indépendant des séances
  seances: Seance[]
}
```

### Seance

```
{
  id: string,
  heureDebut: string,   // "HH:MM"
  heureFin: string,     // "HH:MM"
  type: TypeCreneau,
  disciplinesIds?: string[], // si type pédagogique — plusieurs disciplines possibles
  titre?: string,            // si type pédagogique
  objectifs?: string,     // textarea libre, si type pédagogique
  competencesIds?: string[], // si type pédagogique
  deroulement?: string,   // textarea libre, si type pédagogique
  ressources?: string,    // textarea libre, si type pédagogique
  description?: string,   // si type pédagogique
  elevesConcernes?: ElevesConcernes, // si type pédagogique
  conflitDetecte?: boolean  // champ dérivé : conflit avec une absence récurrente d'un élève concerné
}
```

`conflitDetecte` est un champ **dérivé** mais persisté : il est recalculé à chaque ENREGISTRER du formulaire de séance (voir [cahier-journal](ecrans/cahier-journal.md)) et affiche l'icône ⚠ dans la liste des séances.

## PPI (Projet Pédagogique Individuel) — phase 2, non implémenté

```
{
  id: string,
  eleveId: string,
  competencesEntrees: PpiCompetence[]
}
```

### PpiCompetence

```
{
  competenceId: string,
  dateInitiale: string,       // ISO date
  constatInitial: string,     // saisie libre
  actionsInitiales: string,   // saisie libre
  evaluation: string,         // ref: statutsAcquisition
  dateMaj: string,            // ISO date
  constatMaj: string,         // saisie libre
  actionsMaj: string          // saisie libre
}
```

## Bulletin — phase 2, non implémenté

```
{
  id: string,
  eleveId: string,
  periode: string,            // ref: periodes
  competencesEvaluees: BulletinCompetence[]
  // contenu détaillé à définir ultérieurement
}
```

### BulletinCompetence

```
{
  competenceId: string,
  evaluation: string,         // ref: statutsAcquisition
  appreciationPublique: string,  // saisie libre
  appreciationPrivee: string     // saisie libre
}
```
