---
name: plans-02-testsDeComposant
description: Plan de création des tests unitaires pour les 31 composants Angular non encore couverts — 11 étapes séquentielles par niveau de complexité
metadata:
  type: project
---

# Plan : Tests unitaires des composants Angular

## Contexte

- **34 composants** au total (composants partagés + sous-composants d'écrans + écrans)
- **3 déjà couverts** : `mc-arbre-competences`, `mc-mini-calendrier`, `mc-selecteur-competences`
- **31 à créer** — ce plan les couvre en 11 étapes du plus simple au plus complexe

**Why:** Atteindre 80 % de couverture sur les quatre métriques (lignes, branches, fonctions, statements) sur l'ensemble de l'application, conformément à `.claude/rules/tests.md`.

**How to apply:** Traiter les étapes dans l'ordre — chaque étape introduit un pattern ou un niveau de dépendance sur lequel les étapes suivantes s'appuient.

---

## Patterns de référence

### TestBed sans composant hôte (Pattern A)
Pour les composants dont les inputs se posent par `setInput()`.
```typescript
const fixture = TestBed.createComponent(MonComposant);
fixture.componentRef.setInput('monInput', valeur);
fixture.detectChanges();
```

### TestBed avec composant hôte (Pattern B)
Pour les composants dont on veut observer les outputs depuis un template, ou qui importent des directives.
```typescript
@Component({ template: `<mc-xxx [input]="val" (output)="capture($event)" />`, imports: [MonComposant] })
class ComposantHote { val = 'x'; capture = vi.fn(); }

const fixture = TestBed.createComponent(ComposantHote);
```

### CVA — test direct des méthodes
Sans FormControl réel : appel direct de `writeValue()`, `registerOnChange()`, `registerOnTouched()`, `setDisabledState()` sur l'instance.

### Polyfill `<dialog>` pour les popins
```typescript
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});
```

### Accès aux outputs protégés
```typescript
const emis: boolean[] = [];
(component as any).selectionChange.subscribe((v: boolean) => emis.push(v));
```

### Vitest fake timers pour le debounce
```typescript
vi.useFakeTimers();
vi.advanceTimersByTime(300);
vi.useRealTimers();
```

---

## Étape 1 — Composants purs et à logique simple (sans inject)

**Fichiers à créer :** 4

| Composant | Chemin spec |
|---|---|
| `mc-badge-statut` | `composants/mc-badge-statut/mc-badge-statut.component.spec.ts` |
| `mc-chip-filtre` | `composants/mc-chip-filtre/mc-chip-filtre.component.spec.ts` |
| `mc-bouton-destruction` | `composants/mc-bouton-destruction/mc-bouton-destruction.component.spec.ts` |
| `mc-champ-recherche` | `composants/mc-champ-recherche/mc-champ-recherche.component.spec.ts` |

### mc-badge-statut
Pattern A — `setInput('statut', ...)`.
```
affichage avec statut non null
  affiche le glyph du statut
  applique les couleurs (couleurFond, couleurTexte) en style inline
affichage avec statut null
  affiche un tiret
  n'applique aucune couleur
```

### mc-chip-filtre
Pattern B (composant hôte pour capturer `selectionChange`).
```
état initial
  chip inactif par défaut (actif=false)
  chip actif si input actif=true
interaction
  clic sur chip inactif → émet selectionChange(true)
  clic sur chip actif  → émet selectionChange(false)
accessibilité
  l'attribut aria-pressed reflète l'état actif
```

### mc-bouton-destruction
Pattern A — `setInput('id', ...)`.
```
état normal
  affiche le bouton SUPPRIMER
  n'affiche pas CONFIRMER ni ANNULER
demande de confirmation
  clic SUPPRIMER → bascule etatConfirmation à true
  affiche CONFIRMER et ANNULER, masque SUPPRIMER
annulation
  clic ANNULER → etatConfirmation repasse à false
  n'émet pas confirme
confirmation
  clic CONFIRMER → émet confirme (via (component as any).confirme)
  etatConfirmation repasse à false
désactivation
  desactive=true → bouton SUPPRIMER disabled
  tooltipDesactive renseigné → span .sr-only présent
  tooltipDesactive vide → span .sr-only absent
taille réduite
  petit=true → classe mc-btn-sm présente sur les boutons
```

### mc-champ-recherche
Pattern A — `setInput('id', 'recherche')`.
```
émission immédiate (delaiMs=0, défaut)
  surSaisie('abc') → émet 'abc' immédiatement
  reinitialiser() → émet ''
  reinitialiser() → valeurCourante = ''
debounce (delaiMs=300) — vi.useFakeTimers()
  surSaisie('a') → n'émet pas immédiatement
  après 300 ms → émet 'a'
  2e frappe avant délai → annule la 1re, émet seulement la 2e
reinitialiser avec debounce en cours
  reinitialiser() → émet '' immédiatement, annule timer
ngOnDestroy
  détruire le composant avec timer actif → pas d'émission tardive
```

---

## Étape 2 — Composants ControlValueAccessor sans inject

**Fichiers à créer :** 6

| Composant | Chemin spec |
|---|---|
| `mc-input` | `composants/mc-input/mc-input.component.spec.ts` |
| `mc-champ-heure` | `composants/mc-champ-heure/mc-champ-heure.component.spec.ts` |
| `mc-checkbox` | `composants/mc-checkbox/mc-checkbox.component.spec.ts` |
| `mc-radio-group` | `composants/mc-radio-group/mc-radio-group.component.spec.ts` |
| `mc-select` | `composants/mc-select/mc-select.component.spec.ts` |
| `mc-textarea` | `composants/mc-textarea/mc-textarea.component.spec.ts` |

**Cas communs à tous (Pattern A + appel direct des méthodes CVA) :**
```
writeValue
  valeur normale → valeur stockée dans le signal interne
  null → valeur par défaut ('' ou false)
  undefined → valeur par défaut
registerOnChange
  enregistre le callback
  surChangement(val) → callback appelé avec val
registerOnTouched
  enregistre le callback
  surBlur() → callback appelé
setDisabledState
  true → estDesactive signal = true
  false → estDesactive signal = false
```

**Cas spécifiques :**

`mc-select` :
```
avecOptionVide=true → option vide '—' présente en premier dans le DOM
avecOptionVide=false → option vide absente
```

`mc-radio-group` :
```
options=[...] → autant de radios que d'options rendus
writeValue('val') → radio correspondant coché dans le DOM
```

`mc-checkbox` :
```
writeValue(true) → case cochée dans le DOM
writeValue(false) → case décochée
```

`mc-textarea` :
```
lignes=5 → attribut rows=5 sur le <textarea>
```

---

## Étape 3 — CVA avec inject : mc-eleves-concernes

**Fichiers à créer :** 1

`composants/mc-eleves-concernes/mc-eleves-concernes.component.spec.ts`

Pré-requis : charger `DonneesMother.base()` dans `DonneesService` avant les tests.

```
computed groupes
  renvoie la liste des groupes du référentiel
computed eleves
  renvoie les élèves triés NOM puis prénom
writeValue
  null → valeur défaut { type: 'classe', groupes: [], elevesIds: [] }
  valeur existante → stockée dans valeurInterne
surChangementMode
  bascule vers 'groupes' → type='groupes', groupes=[], elevesIds=[]
  bascule vers 'eleves' → type='eleves', groupes=[], elevesIds=[]
  bascule vers 'classe' → réinitialise tout
  appelle onChange et onTouched
basculerGroupe
  ajoute un groupe absent de la sélection
  retire un groupe déjà présent
  appelle onChange et onTouched
basculerEleve
  ajoute un élève absent de la sélection
  retire un élève déjà présent
  appelle onChange et onTouched
```

---

## Étape 4 — Composant d'en-tête : mc-entete

**Fichiers à créer :** 1

`composants/mc-entete/mc-entete.component.spec.ts`

Dépendances : DonneesService, ContexteService, SauvegardeAutoService, RechercheGlobaleService, Router (provideRouter([]))

```
surSauvegarder
  sans mot de passe mémorisé → popinSauvegardeVisible = true
  avec mot de passe mémorisé → appelle sauvegardeAutoService.sauvegarder(), pas de popin
surConfirmationSauvegarde(mdp)
  mémorise motDePasse dans contexteService
  ferme la popin
  appelle sauvegardeAutoService.sauvegarder() puis demarrer()
surAnnulationSauvegarde
  popinSauvegardeVisible = false
surRecherche(terme)
  terme avec résultats → resultatsRecherche peuplés, listeResultatsVisible = true
  terme sans résultats → listeResultatsVisible = false
surSelectionResultat — type eleve
  eleveSelectionne.set(resultat.id)
  navigate vers resultat.route
  listeResultatsVisible = false
surSelectionResultat — type projet
  projetSelectionne.set(resultat.id)
  navigate vers resultat.route
surAnnuler → appelle donneesService.annuler()
surRefaire → appelle donneesService.refaire()
surBasculerTheme → appelle contexteService.basculerTheme()
tooltipSauvegarder
  dateDerniereSauvegarde = null → message "aucune sauvegarde"
  dateDerniereSauvegarde défini → message avec date et heure formatées
```

---

## Étape 5 — Popins sans inject

**Fichiers à créer :** 3

| Composant | Chemin spec |
|---|---|
| `popin-avertissement` | `composants/popins/popin-avertissement/popin-avertissement.component.spec.ts` |
| `popin-sauvegarde` | `composants/popins/popin-sauvegarde/popin-sauvegarde.component.spec.ts` |
| `popin-warnings-absences` | `composants/popins/popin-warnings-absences/popin-warnings-absences.component.spec.ts` |

Polyfill `HTMLDialogElement` requis dans `beforeAll`.

**Cas communs :**
```
ouverture/fermeture
  visible=false (défaut) → showModal non appelé
  setInput visible=true → showModal appelé
  setInput visible=false après ouverture → close appelé
```

**popin-avertissement :**
```
message
  message renseigné → texte affiché dans le corps
surConfirmation → émet confirme
surAnnulation → émet annule
surCancel (Échap) → appelle event.preventDefault(), émet annule
```

**popin-sauvegarde :**
```
ouverture → réinitialise motDePasse à ''
surConfirmation sans mdp → n'émet pas confirme
surConfirmation avec mdp → émet confirme(mdp.trim())
surAnnulation → émet annule
surCancel → appelle event.preventDefault(), émet annule
```

**popin-warnings-absences :**
```
conflits → liste affichée dans le DOM (autant d'items que de conflits)
fermer → émet annule
surCancel → appelle event.preventDefault(), émet annule
```

---

## Étape 6 — Popins avec inject

**Fichiers à créer :** 2

| Composant | Chemin spec |
|---|---|
| `popin-export-competences` | `composants/popins/popin-export-competences/popin-export-competences.component.spec.ts` |
| `popin-demarrage` | `composants/popins/popin-demarrage/popin-demarrage.component.spec.ts` |

**popin-export-competences** (inject DonneesService) :
```
mode 'projet'
  optionsPrimaires = liste des projets
  sélection d'un projet → optionsSecondaires = périodes de ce projet
  surChangementPrimaire → réinitialise selectionSecondaire
mode 'seance'
  optionsPrimaires = journées CJ avec au moins une séance pédago
  sélection d'une journée → optionsSecondaires = séances pédago de cette journée
peutConfirmer
  false si selectionPrimaire ou selectionSecondaire manque
  true si les deux renseignées
surConfirmation
  si peutConfirmer → émet ResultatExportCompetences correct
  sinon → n'émet pas
surAnnulation / surCancel → émet annule
```

**popin-demarrage** (inject ChiffrementService, ContexteService) :
Note : `afterNextRender` ne s'exécute pas en test — polyfill dialog suffit.
```
creer() — vi.stubGlobal('fetch', ...)
  fetch réussi → émet demarrageTermine(données)
  fetch échoue (reponse.ok=false) → erreur affichée, enChargement=false
  appel pendant enChargement → ignoré
charger()
  sans fichier sélectionné → ne fait rien
  sans mot de passe → ne fait rien
  succès → émet demarrageTermine, mémorise motDePasse dans contexteService
  DOMException → affiche erreur mot de passe
  autre erreur → affiche erreur fichier
  enChargement=false après chaque cas
peutCharger
  false si pas de fichier
  false si motDePasse vide
  false si enChargement=true
  true si fichier + mdp + pas en chargement
```

---

## Étape 7 — Formulaires sans inject (sous-composants d'écrans)

**Fichiers à créer :** 4

| Composant | Chemin spec |
|---|---|
| `fe-formulaire-eleve` | `ecrans/eleves/fe-formulaire-eleve/fe-formulaire-eleve.component.spec.ts` |
| `fp-formulaire-projet` | `ecrans/projets/fp-formulaire-projet/fp-formulaire-projet.component.spec.ts` |
| `cj-formulaire-seance` | `ecrans/cahier-journal/cj-formulaire-seance/cj-formulaire-seance.component.spec.ts` |
| `edt-formulaire` | `ecrans/emploi-du-temps/edt-formulaire/edt-formulaire.component.spec.ts` |

**Pré-requis :** lire `fp-formulaire-projet.component.ts`, `cj-formulaire-seance.component.ts` et `edt-formulaire.component.ts` avant implémentation.

**Cas communs (pattern formulaire avec `effect` sur l'input) :**
```
initialisation
  eleve=null → formEleve créé vide avec id généré
  eleve existant → formEleve = clone de l'élève
  changement de l'input eleve → formEleve rechargé
onEnregistrer
  émet un clone de formEleve (pas la référence originale)
annuler → émet annuler
focusDemande
  true → [mcAutoFocus] actif sur le premier champ
```

**Cas spécifiques `fe-formulaire-eleve` :**
```
basculerGroupe(id, true) → ajoute le groupe si absent
basculerGroupe(id, false) → retire le groupe
ajouterContact → ajoute un contact vide
supprimerContact(0) → retire le contact à l'index 0
ajouterAbsenceRecurrente → ajoute une absence récurrente vide avec id UUID
supprimerAbsenceRecurrente(0) → retire à l'index 0
ajouterAbsencePonctuelle → ajoute avec id UUID
supprimerAbsencePonctuelle(0) → retire à l'index 0
ajouterCursus → ajoute avec l'année courante
supprimerCursus(0) → retire à l'index 0
optionsStatut → mappées depuis statutsEleve()
optionsTypeContact → mappées depuis typesContact()
```

---

## Étape 8 — Fiches de lecture (fe-fiche-eleve, fp-fiche-projet)

**Fichiers à créer :** 2

| Composant | Chemin spec |
|---|---|
| `fe-fiche-eleve` | `ecrans/eleves/fe-fiche-eleve/fe-fiche-eleve.component.spec.ts` |
| `fp-fiche-projet` | `ecrans/projets/fp-fiche-projet/fp-fiche-projet.component.spec.ts` |

**Pré-requis :** lire ces deux composants avant implémentation.

**Cas généraux attendus (à ajuster après lecture) :**
```
affichage des données
  nom/prénom de l'élève affichés
  absences ponctuelles listées
bouton ÉDITER → émet le signal/output attendu
bouton SUPPRIMER → interagit avec mc-bouton-destruction
imprimer → appelle window.print() (vi.spyOn(window, 'print'))
```

---

## Étape 9 — Écrans simples (ecran-demarrage, ecran-accueil)

**Fichiers à créer :** 2

| Composant | Chemin spec |
|---|---|
| `ecran-demarrage` | `ecrans/demarrage/ecran-demarrage.component.spec.ts` |
| `ecran-accueil` | `ecrans/accueil/ecran-accueil.component.spec.ts` |

**ecran-demarrage** (inject DonneesService, Router) :
```
surDemarrageTermine(donnees)
  appelle donneesService.charger(donnees)
  navigue vers '/accueil'
```

**ecran-accueil** (inject DonneesService, CompetenceService) :
Note : `dateIsoAujourdhui` est calculé au constructeur. Utiliser `vi.setSystemTime(new Date('2026-06-20'))` dans `beforeEach` pour contrôler la date.

```
sans données chargées
  seancesResumees = []
avec journée du jour sans séance pédago
  seancesResumees = []
avec journée du jour et séances pédago
  filtre les récréations/pauses
  résout les disciplines depuis CompetenceService
  séance type 'classe' → nbEleves = total élèves de la classe
  séance type 'eleves' → nbEleves = elevesIds.length
  séance type 'groupes' → nbEleves = nb élèves appartenant aux groupes
dateFormatee
  retourne la date du jour en toutes lettres (ex. "vendredi 20 juin 2026")
```

---

## Étape 10 — Écrans avec logique de sélection (ecran-eleves, ecran-projets)

**Fichiers à créer :** 2

| Composant | Chemin spec |
|---|---|
| `ecran-eleves` | `ecrans/eleves/ecran-eleves.component.spec.ts` |
| `ecran-projets` | `ecrans/projets/ecran-projets.component.spec.ts` |

**Pré-requis :** lire `ecran-projets.component.ts` avant implémentation.

**ecran-eleves** (inject DonneesService, EleveService, ContexteService) :
```
selectionnerEleve — sans édition en cours
  contexteService.eleveSelectionne mis à jour
  enModeEdition reste false
selectionnerEleve — avec édition en cours
  popinAvertissementVisible = true
  actionEnAttente mémorisée
creerEleve — sans édition
  contexteService.eleveSelectionne = null
  enModeEdition = true
creerEleve — avec édition → popinAvertissementVisible = true
confirmerAvertissement
  exécute actionEnAttente
  enModeEdition = false
  popinAvertissementVisible = false
annulerAvertissement
  popinAvertissementVisible = false
  actionEnAttente effacée
onEnregistrer — élève existant
  appelle eleveService.modifierEleve(eleve)
  enModeEdition = false
onEnregistrer — nouvel élève
  appelle eleveService.creerEleve(eleve)
  contexteService.eleveSelectionne = eleve.id
  enModeEdition = false
onAnnulerEdition
  enModeEdition = false
  si nouvel élève → contexteService.eleveSelectionne = null
supprimerEleve
  appelle eleveService.supprimerEleve(id)
  contexteService.eleveSelectionne = null
basculerFiltreGroupe(id, true) → groupe ajouté à groupesFiltres
basculerFiltreGroupe(id, false) → groupe retiré
elevesAffiches
  filtrés par terme textuel
  filtrés par groupesFiltres
  sans filtre → tous les élèves
confirmerNavigation
  sans édition → Promise resolve(true) immédiat
  avec édition → ouvre popin, resolve(true) sur confirmer, resolve(false) sur annuler
```

---

## Étape 11 — Écrans complexes

**Fichiers à créer :** 4

| Composant | Chemin spec |
|---|---|
| `ecran-emploi-du-temps` | `ecrans/emploi-du-temps/ecran-emploi-du-temps.component.spec.ts` |
| `ecran-cahier-journal` | `ecrans/cahier-journal/ecran-cahier-journal.component.spec.ts` |
| `ecran-competences` | `ecrans/competences/ecran-competences.component.spec.ts` |
| `ecran-parametrage` | `ecrans/parametrage/ecran-parametrage.component.spec.ts` |

**Pré-requis :** lire `ecran-emploi-du-temps.component.ts`, `ecran-competences.component.ts` et `ecran-parametrage.component.ts` avant implémentation.

**ecran-cahier-journal** (inject DonneesService, CahierJournalService, CompetenceService) :
```
navigation
  naviguerJour(1) → dateSelectionnee + 1 jour, ferme le formulaire
  naviguerJour(-7) → dateSelectionnee - 7 jours
  surChangementDate('2026-06-21') → dateSelectionnee mis à jour
journeeSelectionnee
  date sans entrée CJ → null
  date avec entrée → journée correspondante
seances
  triées par heureDebut
  vides si journeeSelectionnee = null
initialisation
  initialiserVide → appelle cahierJournalService.initialiserJourneeVide(date)
  initialiserDepuisEdt → appelle cahierJournalService.initialiserDepuisEdt(date)
suppression journée
  demanderSuppressionJournee → popinSupprimerVisible = true
  confirmerSuppressionJournee → supprimerJournee(date), ferme popin, ferme formulaire
  annulerSuppression → ferme popin
duplication
  demanderDuplication(null) → seanceIdDuplication=null, popinDuplicationVisible=true
  demanderDuplication(id) → seanceIdDuplication=id
  confirmerDuplication sans date → ne fait rien
  confirmerDuplication avec date, seanceId=null → dupliquerJournee(dateSource, dateCible)
  confirmerDuplication avec date, seanceId renseigné → dupliquerSeance(id, dateSource, dateCible)
  annulerDuplication → popinDuplicationVisible = false
séances CRUD
  creerSeance → seanceEditee=null, enCreationSeance=true
  editerSeance(seance) → seanceEditee=seance, enCreationSeance=false
  onEnregistrerSeance — séance existante → modifierSeance
  onEnregistrerSeance — nouvelle séance → ajouterSeance
  onEnregistrerSeance avec conflits → popinConflitsVisible=true, conflits peuplés
  supprimerSeance(id) → cahierJournalService.supprimerSeance(date, id)
  supprimerSeance(id séance en cours d'édition) → ferme formulaire
  deplacerSeance(0, 1) → cahierJournalService.deplacerSeance(date, 0, 1)
  deplacerSeance(0, -1) — déjà en premier → ne fait rien
fermerConflits → popinConflitsVisible=false, conflits=[]
```

---

## Résumé du périmètre

| Étape | Composants | Fichiers .spec.ts |
|---|---|---|
| 1 — Purs et simples | mc-badge-statut, mc-chip-filtre, mc-bouton-destruction, mc-champ-recherche | 4 |
| 2 — CVA sans inject | mc-input, mc-champ-heure, mc-checkbox, mc-radio-group, mc-select, mc-textarea | 6 |
| 3 — CVA avec inject | mc-eleves-concernes | 1 |
| 4 — Entête | mc-entete | 1 |
| 5 — Popins sans inject | popin-avertissement, popin-sauvegarde, popin-warnings-absences | 3 |
| 6 — Popins avec inject | popin-export-competences, popin-demarrage | 2 |
| 7 — Formulaires | fe-formulaire-eleve, fp-formulaire-projet, cj-formulaire-seance, edt-formulaire | 4 |
| 8 — Fiches | fe-fiche-eleve, fp-fiche-projet | 2 |
| 9 — Écrans simples | ecran-demarrage, ecran-accueil | 2 |
| 10 — Écrans sélection | ecran-eleves, ecran-projets | 2 |
| 11 — Écrans complexes | ecran-emploi-du-temps, ecran-cahier-journal, ecran-competences, ecran-parametrage | 4 |
| **Total** | **31** | **31** |

## Informations non dérivables du code (à confirmer avec l'utilisateur)

- **Priorités d'étapes** : y a-t-il des composants plus urgents à tester que d'autres ?
- **Exclusions** : certains écrans (ex. `ecran-parametrage`) peuvent-ils être traités avec une couverture moindre si la logique est essentiellement de la configuration ?
- **Object Mothers manquants** : prévoir un `StatutAcquisitionMother` (étape 1) et potentiellement un `ResultatRechercheMother` (étape 4) — à confirmer selon les données réelles utilisées dans les tests.
