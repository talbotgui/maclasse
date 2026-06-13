---
name: projet-02-modelesDonnees
description: Modèles de données de l'application MaClasse — structure du fichier JSON, entités et leurs propriétés
metadata:
  type: project
  updated: 2026-06-09
related:
  - projet-01-descriptionGenerale
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
  projets: Projet[],
  cahierJournal: JourneeJournal[],
  ppi: Ppi[],           // à construire
  bulletins: Bulletin[] // à construire
}
```

## ConfigApplication

```
{
  delaiSauvegardeAutoMinutes: number  // délai entre deux sauvegardes automatiques (défaut : 2)
}
```

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
  annee: string | null,
  niveau: string | null,
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
  groupes: string[],            // ex: ["A"]
  dateNaissance: string,        // ISO date
  dateArrivee: string,          // ISO date
  statut: string,               // ref: statutsEleve (DC/DE/HE)
  bilans: string,               // texte libre
  accueil: string,              // texte libre
  inclusion: string | null,     // texte libre
  contacts: Contact[],
  absencesRecurrentes: AbsenceRecurrente[],
  absencesPonctuelles: AbsencePonctuelle[],
  cursus: CursusAnnee[],
  notesDroitImage: string,      // texte libre
  notesAutorisationBaignade: string, // texte libre
  notesPPA: string | null,      // texte libre
  notesESS: string | null       // texte libre
}
```

## Contact

```
{
  type: string,           // ref: typesContact (P=père, M=mère, ...)
  nom: string,
  email: string,
  telephone: string,
  adressePostale: string
}
```

## CursusAnnee

```
{
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
  raisonsAbsence: RaisonAbsence[],
  frequencesAbsence: FrequenceAbsence[],
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
  id: 'A' | 'EC' | 'NA' | 'NE',
  glyphe: string,   // ex: "✓", "~", "✗", "?"
  libelle: string,  // ex: "Acquis", "En cours", "Non acquis", "Non évalué"
  couleur: string,  // couleur texte (CSS)
  fond: string      // couleur fond (CSS)
}
```

### Periode

```
{
  nom: string,    // ex: "Période 1"
  debut: string,  // ISO date
  fin: string     // ISO date
}
```

### ConfigEmploiDuTemps (dans referentiels)

```
{
  joursOuvres: JourSemaine[],   // ex: ["lundi","mardi","jeudi","vendredi"]
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
  paritesSemaine: 'paire' | 'impaire' | 'lesDeux'
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
  frequence: 'paire' | 'impaire' | 'lesDeux',
  creneaux: CreneauEdt[]
}
```

### CreneauEdt

```
{
  id: string,
  jour: JourSemaine,        // ex: 'lundi', 'mardi'...
  heureDebut: string,       // "HH:MM"
  heureFin: string,         // "HH:MM"
  type: 'pedagogique' | 'recreation' | 'pauseDejeuner',
  disciplinesIds?: string[], // si type pédagogique — plusieurs disciplines possibles
  titre?: string,           // si type pédagogique
  elevesConcernes?: {       // si type pédagogique
    type: 'classe' | 'groupes' | 'eleves',
    groupes: string[],
    elevesIds: string[]
  }
}
```

> `emploisDuTemps: EmploiDuTemps[]` est dans la structure racine du JSON (voir plus haut).

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
  periodeNom: string,
  debut: string,            // ISO date — tri ascendant des périodes
  fin: string,              // ISO date
  description: string,
  competencesIds: string[]  // IDs de compétences travaillées
}
```

## JourneeJournal (cahier journal)

```
{
  date: string,      // ISO date
  seances: Seance[]
}
```

### Seance

```
{
  id: string,
  heureDebut: string,   // "HH:MM"
  heureFin: string,     // "HH:MM"
  type: 'pedagogique' | 'recreation' | 'pauseDejeuner',
  disciplinesIds?: string[], // si type pédagogique — plusieurs disciplines possibles
  titre?: string,            // si type pédagogique
  objectifs?: string,     // textarea libre, si type pédagogique
  competencesIds?: string[], // si type pédagogique
  deroulement?: string,   // textarea libre, si type pédagogique
  ressources?: string,    // textarea libre, si type pédagogique
  description?: string,   // si type pédagogique
  elevesConcernes?: {     // si type pédagogique
    type: 'classe' | 'groupes' | 'eleves',
    groupes: string[],
    elevesIds: string[]
  }
}
```

## PPI (Projet Pédagogique Individuel) — à construire

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

## Bulletin — à construire

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
