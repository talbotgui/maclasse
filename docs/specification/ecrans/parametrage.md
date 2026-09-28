---
name: parametrage
description: Spécification détaillée de l'écran Paramétrage — enseignant, classe, référentiels éditables, préférences, domaines de compétences
metadata:
  type: project
  updated: 2026-09-27
related:
  - specification/modeles-donnees
  - specification/ecrans/vue-ensemble
  - specification/composants-partages
  - specification/services
---

## Contexte

Écran de gestion des données de configuration : enseignant, classe, référentiels et données non manipulables depuis les autres écrans.
Accessible uniquement après chargement des données (`donneesChargeesGarde`), hors mode consultation du référentiel (`referentielSeulGarde`).

---

## Layout général

Deux colonnes :
- **Colonne gauche** : liste fixe des sections de paramétrage
- **Zone droite** : contenu de la section sélectionnée

---

## Colonne gauche — Navigation par section

Liste fixe de boutons (`btnSection{id}`), sans CRÉER, filtre ni SUPPRIMER :

1. Enseignant & Classe
2. Périodes scolaires
3. Semaine & Horaires
4. Groupes
5. Barème d'évaluation
6. Statuts élève
7. Types de contact
8. Jours fériés
9. Préférences
10. Domaines de compétences

La section active est mise en évidence (même convention que le lien de navigation actif dans l'entête). Enseignant & Classe est active à l'ouverture.

---

## Comportement commun

- **Pastille « Non enregistré »** : affichée à côté des boutons d'une section formulaire, ou d'une ligne de liste, dès que ses valeurs diffèrent des données enregistrées (comparaison `ObjetUtils.sontEgaux`)
- Les boutons ENREGISTRER (et ANNULER des sections formulaire) sont **désactivés tant que rien n'est modifié**
- Chaque ENREGISTRER soumet une commande à `DonneesService` (UNDO/REDO)
- **Saisies conservées au changement des données** : quand les données changent sans changement de section (ENREGISTRER d'une ligne, ANNULER / REFAIRE depuis l'entête), la section active ne recharge que ce qui n'est pas modifié. La comparaison se fait avec la valeur enregistrée au chargement précédent (référence mémorisée à chaque chargement) :
  - section formulaire (y compris la sélection des Domaines de compétences) : rechargée si la saisie est identique à la référence, conservée sinon ;
  - section liste : une ligne non modifiée reçoit la nouvelle valeur enregistrée ; une ligne modifiée garde sa saisie ; une ligne ajoutée non enregistrée est conservée ; une ligne dont l'entrée a disparu des données (suppression, ANNULER d'un ajout) est retirée, sauf si elle est modifiée : elle redevient alors une ligne non enregistrée, placée après les lignes enregistrées
- **Changement de section** : la nouvelle section est rechargée entièrement depuis les données ; les saisies non enregistrées de la section quittée sont abandonnées. Seule la section active peut donc porter des saisies non enregistrées
- **Avertissement de modifications non enregistrées** : si la section active est modifiée (mêmes critères que la pastille « Non enregistré » : formulaire différent des données, ligne modifiée ou ajoutée non enregistrée), cliquer sur une autre section ou quitter l'écran ouvre `popin-avertissement` (`LIBELLES.commun.avertissementModifications`). CONFIRMER change de section ou d'écran (saisies abandonnées) ; ANNULER reste sur la section, saisies conservées. Cliquer sur la section active ne fait rien. Quitter l'écran passe par `modificationsNonEnregistreesGarde` (voir [éléments techniques](../elements-techniques.md))

---

## Zone droite — Sections formulaire simple

Ces sections affichent un formulaire directement éditable avec **ENREGISTRER** / **ANNULER** en haut. ANNULER recharge les valeurs enregistrées.

### Section "Enseignant & Classe"

| Champ | Composant | Donnée |
|---|---|---|
| Prénom | `mc-input` | `enseignant.prenom` |
| Nom | `mc-input` | `enseignant.nom` |
| Année scolaire | `mc-input` (ex. "2025-2026") | `enseignant.annee` |
| Niveau de la classe | `mc-input` (ex. "CM1") | `classe.niveau` |

ENREGISTRER produit deux commandes `CommandeRemplacement` (enseignant, niveau de la classe), donc deux étapes UNDO.

### Section "Semaine & Horaires"

| Champ | Composant |
|---|---|
| Jours ouvrés | Chips `mc-chip-filtre` du **lundi au vendredi**, sélection multiple |
| Heure de début de journée | `mc-champ-heure` |
| Heure de fin de journée | `mc-champ-heure` |

> Persisté dans `referentiels.configEmploiDuTemps` (`ReferentielService.modifierConfigEmploiDuTemps`). Utilisé par la grille de l'EDT, le mini-calendrier et les heures proposées du cahier journal.

### Section "Préférences"

| Champ | Composant | Détail |
|---|---|---|
| Délai de sauvegarde automatique | `mc-input` type number (`min` 1, `max` 60) | En minutes, **5 par défaut**. Persiste dans `donnees.configuration.delaiSauvegardeAutoMinutes` |

- Hors des bornes 1–60, le message *« Le délai doit être compris entre 1 et 60 minutes. »* s'affiche et ENREGISTRER est désactivé
- À l'ENREGISTRER, le minuteur de sauvegarde automatique est **redémarré avec le nouveau délai s'il était actif** (voir [vue-ensemble](vue-ensemble.md#sauvegarde-automatique))

### Section "Domaines de compétences"

Choix des domaines de compétences utilisés dans la classe → `configuration.domainesActifs`.

- Texte d'aide : *« Cochez les domaines et sous-domaines à utiliser dans votre classe. Décochez tout pour tout afficher. »*
- Une **case à cocher native** par domaine de niveau 1 (`checkDomaine{i}`), et sous chaque domaine une case par sous-domaine de niveau 2 (`checkSousDomaine{i}_{j}`), avec un `aria-label` « Activer le domaine / sous-domaine »
- Cocher ou décocher un domaine coche ou décoche tous ses sous-domaines ; décocher un seul sous-domaine d'un domaine entièrement actif le décompose en ses autres sous-domaines
- **ENREGISTRER** : `CommandeRemplacement` sur `configuration.domainesActifs`. Si tout est coché, la liste enregistrée est vide (= tous les domaines)
- **ANNULER** : recharge la sélection enregistrée (tout coché si la liste est vide)
- Effets : chips de disciplines (séances, temps de créneau), arbre et chips de l'écran Compétences, via `CompetenceService.obtenirDomaines()` (voir [services](../services.md#competenceservice))

---

## Zone droite — Sections liste éditable

Ces sections affichent une liste d'éléments éditables inline.

### Comportement commun

- Bouton **AJOUTER** en haut de la liste : ajoute une ligne vide en bas de liste (identifiant généré) et place le focus sur son premier champ ; la ligne n'existe dans les données qu'après son ENREGISTRER
- Chaque élément est **éditable directement dans la liste** (champs inline)
- **ENREGISTRER par ligne** (`btnEnregistrer…{i}`, `mc-btn-sm`) : crée ou modifie l'élément via `ReferentielService`. Il n'y a **pas d'ANNULER par ligne**
- Chaque élément dispose d'un bouton **SUPPRIMER** (`mc-bouton-destruction`, petit) avec comportement conditionnel :
  - **Si la valeur est utilisée** dans les données (méthode `estXxxUtilise` de `ReferentielService`, voir [services](../services.md#referentielservice)) :
    - Bouton désactivé (`desactive`)
    - Tooltip affiché au survol/focus : *« Cette valeur est utilisée et ne peut pas être supprimée »*
    - Message masqué visuellement relié par `aria-describedby` (conformité RGAA)
  - **Si la valeur n'est pas utilisée** : comportement standard `mc-bouton-destruction` (ANNULER + CONFIRMER)

### Identifiant saisi (Barème, Statuts élève, Types de contact)

Ces trois sections ont un champ « Identifiant » saisi par l'utilisateur, clé de référence des élèves (`Eleve.statut`), des contacts (`Contact.type`) et, à terme, des PPI et bulletins.

- **Ligne enregistrée** : identifiant en **lecture seule** (`mc-input` `lectureSeule`, fond distinct), infobulle *« L'identifiant d'une valeur enregistrée ne peut pas être modifié. »* et même texte masqué visuellement (`desc{Champ}{i}`, relié par `aria-describedby`). Le libellé, le glyphe et les couleurs restent modifiables. Un identifiant mal saisi se corrige en supprimant l'entrée tant qu'elle n'est pas utilisée. Une ligne dont l'entrée disparaît des données en restant modifiée (voir Comportement commun) redevient non enregistrée : son identifiant redevient éditable
- **Ligne non enregistrée** : identifiant **obligatoire** et **unique** dans la section, sans tenir compte de la casse ni des espaces en bordure, face aux entrées enregistrées **et** aux autres lignes de la section (deux nouvelles lignes « X » et « x » sont toutes deux en erreur)
  - Message `role="alert"` sous la ligne (`erreur{Champ}{i}`, relié au champ par `aria-describedby`) : *« Cet identifiant est déjà utilisé. »* immédiatement, *« L'identifiant est obligatoire. »* une fois le champ modifié ou quitté
  - ENREGISTRER de la ligne désactivé tant que l'identifiant est en erreur
  - À l'ENREGISTRER, les espaces en bordure de l'identifiant sont retirés

### Section "Périodes scolaires"

| Champ | Composant |
|---|---|
| Nom | `mc-input` |
| Date de début | `mc-input` type date |
| Date de fin | `mc-input` type date |

> Utilisé par : `ProjetPeriode.periodeNom` et `Bulletin.periode` (référence par le **nom**), bornes du mini-calendrier du cahier journal

### Section "Groupes"

| Champ | Composant |
|---|---|
| Libellé | `mc-input` |

> Identifiant généré à l'AJOUTER. Utilisé par : `Eleve.groupes`, `elevesConcernes.groupes` (séances, temps de créneau, EDT calculés)

### Section "Barème d'évaluation" (`statutsAcquisition`)

| Champ | Composant |
|---|---|
| Identifiant | `mc-input` (ex. "A", "EC") |
| Glyphe | `mc-input` (ex. "✓", "~") |
| Libellé | `mc-input` (ex. "Acquis") |
| Couleur texte | `mc-input` type color |
| Couleur fond | `mc-input` type color |
| Aperçu | `mc-badge-statut` en temps réel (mis à jour à la frappe) |

> Utilisé par : `PpiCompetence.evaluation`, `BulletinCompetence.evaluation` (phase 2)

### Section "Statuts élève"

| Champ | Composant |
|---|---|
| Identifiant | `mc-input` (ex. "DC") |
| Libellé | `mc-input` (ex. "Dans la classe") |

> Utilisé par : `Eleve.statut`

### Section "Types de contact"

| Champ | Composant |
|---|---|
| Identifiant | `mc-input` (ex. "P") |
| Libellé | `mc-input` (ex. "Père") |

> Utilisé par : `Contact.type`

### Section "Jours fériés"

| Champ | Composant |
|---|---|
| Nom | `mc-input` |
| Date | `mc-input` type date |

> Utilisé par : mini-calendrier du cahier journal (jours grisés). Un jour férié n'est jamais « utilisé » : il est toujours supprimable
