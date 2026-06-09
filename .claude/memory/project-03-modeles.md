---
name: project-03-modeles
description: Schéma complet de DonneesEnseignant et tous ses sous-types — structure du JSON chiffré persisté
metadata:
  type: project
  updated: 2026-06-05
related:
  - project-04-json-historique-pattern
  - project-02-architecture
---

Toutes les données métier vivent dans un unique objet `DonneesEnseignant` (JSON chiffré AES-256-GCM). Aucune API, pas de backend.

**Why:** Comprendre ce schéma est indispensable pour toute tâche touchant à la persistance, la logique métier ou les modifications via `JsonHistoriqueService`.

**How to apply:** Avant d'ajouter un attribut ou un type, vérifier s'il existe déjà dans ce schéma. Les formats de dates sont toujours `string ISO 8601`.

## Racine — `DonneesEnseignant`

```
version: string
enseignant: { prenom, nom, annee, ecole? }
classe: { niveaux: string[], libelle: string, eleves: Eleve[] }
cahierJournal?: JourJournal[]
modelesSeances?: SeanceJournaliere[]
projets?: Projet[]
referentiels: {
  periodes: Periode[]
  competences: NoeudCompetence[]
  statutsAcquisition: StatutAcquisition[]
  groupes: RefValeurString[]
  statutsEleve: RefValeurString[]
  typesContact: RefValeurString[]
  raisonsAbsence: RefValeurString[]
  frequencesAbsence: RefValeurString[]
  joursFeries: RefValeurString[]
}
```

## `Eleve`

```
id, prenom, nom
sexe?: 'F' | 'M'
niveau: string
groupes: string[]
dateNaissance?, dateArrivee?          ← ISO 8601
statut?, bilans?, accueil?
datesPPA?, datesESS?                  ← tableaux ISO 8601
droitImage?, autorisationBaignade?: boolean
inclusion: InclusionEleve | null
contacts: ContactEleve[]
absences: AbsenceEleve[]
cursus: CursusEleve[]
```

## `SeanceJournaliere`

```
id, titre
type?: 'seance' | 'repos'
heureDebut, heureFin                  ← string "HH:mm"
disciplineId: string
description?
statut: 'prevu' | 'en-cours' | 'termine' | 'reporte'
objectifs: string[]
competencesIds: string[]
deroulement: EtapeDeroulement[]
differentiation?
elevesConCernes: ElevesConcernes
ressources: RessourceLien[]
devoirs?, notesPersonnelles?
```

### Sous-types séance

```
EtapeDeroulement: { titre, dureeMinutes, description? }
ElevesConcernes:  { type: 'classe'|'groupes'|'individuels', groupes: string[], elevesIds: string[] }
RessourceLien:    { libelle, url }
```

## `JourJournal`

```
date: string          ← ISO 8601
notesGenerales?
seances: SeanceJournaliere[]
bilanFinJournee?
```

## `NoeudCompetence` (arbre récursif)

```
NoeudCompetence: { id, libelle, couleur?, teinte?, enfants?: NoeudCompetence[] }
NoeudFeuille:    { noeud: NoeudCompetence, ancetres: NoeudCompetence[] }   ← vue à plat
```

## `StatutAcquisition`

```
id, glyphe, libelle, couleur, fond
```

## `Periode`

```
nom, debut: string, fin: string      ← ISO 8601
```

## `Projet`

```
id, nom, description?
elevesIds: string[]
periodes: ProjetPeriode[]

ProjetPeriode: { periodeNom, description?, competencesIds: string[] }
```

## Références génériques

```
RefValeurString: { id: string, libelle }
RefValeurNombre: { id: number, libelle }
```
