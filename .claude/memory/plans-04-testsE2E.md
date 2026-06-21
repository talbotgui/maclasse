---
name: plans-04-testsE2E
description: Scénarios de tests End to End fonctionnels — couverture complète des cas d'usage de chaque écran de MaClasse
metadata:
  type: project
  updated: 2026-06-21
related:
  - projet-03-ecrans
  - projet-07-ecran-demarrage
  - projet-08-ecran-accueil
  - projet-09-ecran-eleves
  - projet-10-ecran-projets
  - projet-11-ecran-competences
  - projet-12-ecran-emploi-du-temps
  - projet-13-ecran-cahier-journal
  - projet-14-ecran-parametrage
---

# Scénarios de tests End to End — MaClasse

## Principes de lecture

- **Prérequis** : état de l'application au début du scénario.
- **Étapes** : actions de l'utilisateur dans l'ordre.
- **Résultat attendu** : vérification observable (écran, DOM, comportement).
- Les scénarios sont indépendants (chaque scénario peut partir d'un état décrit dans son prérequis).
- Le fichier `public/donnees-defaut.json` sert de base pour tous les scénarios post-démarrage.

---

## 1. Écran de démarrage

### E2E-01 — Accès direct à un écran applicatif sans données chargées

**Prérequis** : aucune donnée chargée en mémoire (première ouverture de l'application).

**Étapes** :
1. Saisir l'URL `/eleves` dans la barre d'adresse.

**Résultat attendu** :
- La garde `DonneesChargeesGarde` redirige vers `/demarrage`.
- La popin de démarrage s'affiche automatiquement (non fermable).
- Les boutons de navigation, SAUVEGARDER, ANNULER, REFAIRE sont masqués dans l'entête.
- Le bouton de changement de thème est visible et actif.

---

### E2E-02 — Créer un nouveau fichier (jeu de données d'exemple)

**Prérequis** : écran de démarrage affiché, aucune donnée chargée.

**Étapes** :
1. Cliquer sur le bouton "Créer ma classe à partir d'un jeu de données d'exemple" (zone "Nouveau").

**Résultat attendu** :
- La popin se ferme.
- L'entête affiche les boutons de navigation, SAUVEGARDER, ANNULER, REFAIRE.
- L'utilisateur est redirigé vers `/accueil`.
- L'écran Accueil affiche la date du jour et le résumé du cahier journal.

---

### E2E-03 — Charger un fichier ZIP valide avec le bon mot de passe

**Prérequis** : écran de démarrage affiché, un fichier ZIP valide disponible localement.

**Étapes** :
1. Cliquer sur le champ upload (zone "Charger") et sélectionner le fichier ZIP.
2. Saisir le mot de passe correct dans le champ "Mot de passe".
3. Cliquer sur le bouton CHARGER.

**Résultat attendu** :
- Pendant le déchiffrement : le bouton CHARGER est désactivé et affiche un spinner + "Chargement…".
- Après succès : la popin se ferme, l'entête est complète, redirection vers `/accueil`.
- Aucun message d'erreur affiché.

---

### E2E-04 — Charger un fichier ZIP avec un mauvais mot de passe

**Prérequis** : écran de démarrage affiché, un fichier ZIP valide disponible localement.

**Étapes** :
1. Sélectionner le fichier ZIP.
2. Saisir un mot de passe incorrect.
3. Cliquer sur le bouton CHARGER.

**Résultat attendu** :
- Un message d'erreur s'affiche en haut du formulaire (zone rouge).
- Le bouton CHARGER est réactivé.
- La popin reste affichée (l'utilisateur peut réessayer).
- Aucune redirection.

---

### E2E-05 — Bouton CHARGER désactivé tant que les champs sont vides

**Prérequis** : écran de démarrage affiché.

**Étapes** :
1. Observer l'état du bouton CHARGER sans remplir aucun champ.
2. Sélectionner uniquement un fichier (sans mot de passe).
3. Effacer le fichier, saisir uniquement un mot de passe (sans fichier).

**Résultat attendu** :
- Étape 1 : bouton CHARGER désactivé.
- Étape 2 : bouton CHARGER toujours désactivé (mot de passe vide).
- Étape 3 : bouton CHARGER toujours désactivé (fichier vide).
- Le bouton n'est actif que lorsque les deux champs sont renseignés.

---

### E2E-06 — Bouton œil : afficher et masquer le mot de passe

**Prérequis** : écran de démarrage affiché.

**Étapes** :
1. Saisir un mot de passe dans le champ "Mot de passe".
2. Cliquer sur le bouton œil.
3. Cliquer à nouveau sur le bouton œil.

**Résultat attendu** :
- Étape 2 : le champ bascule en `type="text"`, le mot de passe est visible en clair.
- Étape 3 : le champ repasse en `type="password"`, le mot de passe est masqué.

---

### E2E-07 — Changement de thème depuis l'écran de démarrage

**Prérequis** : écran de démarrage affiché.

**Étapes** :
1. Cliquer sur le bouton de changement de thème.
2. Recharger la page.

**Résultat attendu** :
- Le thème visuel change immédiatement (variables CSS appliquées sur `<html>`).
- Après rechargement, le thème choisi est restauré (persisté dans `localStorage`).

---

## 2. En-tête (navigation transverse)

### E2E-08 — Navigation entre les écrans via les boutons de l'entête

**Prérequis** : données chargées (depuis "Créer ma classe"), écran Accueil affiché.

**Étapes** :
1. Cliquer sur "Élèves" dans la navigation.
2. Cliquer sur "Projets" dans la navigation.
3. Cliquer sur "Compétences".
4. Cliquer sur "Emploi du temps".
5. Cliquer sur "Cahier journal".
6. Cliquer sur "Paramétrage".
7. Cliquer sur "Accueil".

**Résultat attendu** :
- Chaque clic charge l'écran correspondant (URL change : `/eleves`, `/projets`, etc.).
- Le bouton de navigation de l'écran actif est visuellement mis en évidence (couleur différente).
- Aucune redirection vers `/demarrage`.

---

### E2E-09 — Recherche globale : trouver un élève

**Prérequis** : données chargées avec au moins un élève (ex. "MARTIN Paul"), sur n'importe quel écran.

**Étapes** :
1. Cliquer sur le champ de recherche globale dans l'entête.
2. Saisir "martin".

**Résultat attendu** :
- Une liste d'autocomplétion s'affiche avec au minimum "Élève — MARTIN Paul".
- La recherche est insensible à la casse.

---

### E2E-10 — Recherche globale : naviguer vers un élève au clic sur le résultat

**Prérequis** : données chargées avec au moins un élève "MARTIN Paul", sur n'importe quel écran.

**Étapes** :
1. Saisir "martin" dans le champ de recherche globale.
2. Cliquer sur le résultat "Élève — MARTIN Paul".

**Résultat attendu** :
- Navigation vers `/eleves`.
- L'élève MARTIN Paul est sélectionné et sa fiche s'affiche en lecture seule dans la colonne droite.

---

### E2E-11 — Recherche globale : trouver un projet

**Prérequis** : données chargées avec au moins un projet nommé "Compostage".

**Étapes** :
1. Saisir "compo" dans le champ de recherche globale.
2. Cliquer sur le résultat "Projet — Compostage".

**Résultat attendu** :
- Navigation vers `/projets`.
- Le projet Compostage est sélectionné et sa fiche s'affiche.

---

### E2E-12 — Première sauvegarde manuelle : popin de saisie du mot de passe

**Prérequis** : données chargées (nouveau fichier), aucune sauvegarde précédente.

**Étapes** :
1. Cliquer sur le bouton SAUVEGARDER dans l'entête.

**Résultat attendu** :
- La `popin-sauvegarde` s'ouvre et demande la saisie d'un mot de passe.
- Après validation dans la popin, le fichier ZIP chiffré est téléchargé.
- Le tooltip du bouton SAUVEGARDER est mis à jour avec la date et l'heure de la sauvegarde.

---

### E2E-13 — Sauvegarde manuelle ultérieure : sans popin

**Prérequis** : une première sauvegarde a déjà été effectuée (mot de passe en mémoire dans `ContextService`).

**Étapes** :
1. Effectuer une modification (ex. créer un élève et enregistrer).
2. Cliquer sur SAUVEGARDER.

**Résultat attendu** :
- Aucune popin de saisie de mot de passe.
- Le fichier ZIP est téléchargé directement.
- Le tooltip est mis à jour.

---

### E2E-14 — Boutons ANNULER et REFAIRE : état selon la pile

**Prérequis** : données chargées, aucune modification effectuée.

**Étapes** :
1. Observer l'état des boutons ANNULER et REFAIRE.
2. Créer un élève et cliquer sur ENREGISTRER.
3. Cliquer sur ANNULER.
4. Cliquer sur REFAIRE.

**Résultat attendu** :
- Étape 1 : ANNULER désactivé, REFAIRE désactivé.
- Étape 2 : ANNULER activé (1 entrée dans la pile), REFAIRE toujours désactivé.
- Étape 3 : l'élève créé disparaît. ANNULER désactivé (pile vide), REFAIRE activé.
- Étape 4 : l'élève réapparaît. ANNULER activé à nouveau, REFAIRE désactivé.

---

### E2E-15 — Changement de thème : cycle entre les thèmes

**Prérequis** : données chargées.

**Étapes** :
1. Cliquer plusieurs fois sur le bouton de changement de thème.

**Résultat attendu** :
- Le thème visuel change à chaque clic (variables CSS modifiées sur `<html>`).
- Après plusieurs clics, le cycle revient au thème de départ.
- Le changement est immédiat, sans rechargement de page.

---

## 3. Écran Accueil

### E2E-16 — Affichage du résumé du cahier journal du jour (cas rempli)

**Prérequis** : données chargées, une journée de cahier journal existe pour la date du jour avec au moins une séance pédagogique et une récréation.

**Étapes** :
1. Naviguer vers `/accueil`.

**Résultat attendu** :
- La date du jour est affichée au format "lundi 9 juin 2026" (sans tiret), précédée du label "AUJOURD'HUI".
- La liste des séances pédagogiques est affichée (récréation et pause déjeuner exclues).
- Pour chaque séance : heure de début – heure de fin, nombre d'élèves concernés, domaine(s) de compétences niveau 1.
- Aucun bouton d'interaction (lecture seule).

---

### E2E-17 — Affichage du message "Aucun journal pour aujourd'hui"

**Prérequis** : données chargées, aucune entrée de cahier journal pour la date du jour.

**Étapes** :
1. Naviguer vers `/accueil`.

**Résultat attendu** :
- Le message "Aucun journal pour aujourd'hui" est affiché.
- Aucune liste de séances, aucun lien vers le cahier journal.

---

## 4. Écran Élèves

### E2E-18 — Créer un nouvel élève

**Prérequis** : données chargées, écran Élèves affiché.

**Étapes** :
1. Cliquer sur le bouton CRÉER dans la colonne gauche.
2. Remplir le champ Prénom ("Alice") et Nom ("DUPONT") dans le bandeau.
3. Cliquer sur ENREGISTRER.

**Résultat attendu** :
- La colonne droite passe en mode lecture seule avec "DUPONT Alice" en titre.
- L'élève "DUPONT Alice" apparaît dans la liste de gauche, triée par nom de famille.
- Le bouton ANNULER de l'entête est activé (UNDO disponible).

---

### E2E-19 — Modifier un élève existant

**Prérequis** : données chargées, un élève "MARTIN Paul" existe.

**Étapes** :
1. Cliquer sur "MARTIN Paul" dans la liste.
2. Cliquer sur le bouton MODIFIER.
3. Modifier le prénom ("Paul" → "Pierre") dans le bandeau.
4. Cliquer sur ENREGISTRER.

**Résultat attendu** :
- La fiche affiche "MARTIN Pierre" en titre.
- La liste de gauche reflète le nouveau prénom.
- Le bouton ANNULER de l'entête est activé.

---

### E2E-20 — Annuler une modification en cours

**Prérequis** : données chargées, un élève "MARTIN Paul" sélectionné en mode formulaire.

**Étapes** :
1. Modifier le prénom dans le formulaire ("Paul" → "Pierre").
2. Cliquer sur le bouton ANNULER du formulaire (pas ANNULER de l'entête).

**Résultat attendu** :
- Le formulaire se ferme, la fiche en lecture seule affiche "MARTIN Paul" (inchangé).
- Le bouton ANNULER de l'entête reste dans son état précédent (aucune mutation n'a eu lieu).

---

### E2E-21 — Supprimer un élève

**Prérequis** : données chargées, un élève "DUPONT Alice" existe et n'est associé à aucun projet ni séance.

**Étapes** :
1. Cliquer sur "DUPONT Alice" dans la liste.
2. Cliquer sur le bouton SUPPRIMER (composant `mc-bouton-destruction`).
3. Le bouton se masque et affiche ANNULER + CONFIRMER — cliquer sur CONFIRMER.

**Résultat attendu** :
- L'élève disparaît de la liste.
- La colonne droite devient vide.
- Le bouton ANNULER de l'entête est activé.

---

### E2E-22 — Popin d'avertissement au clic sur un autre élève sans enregistrer

**Prérequis** : données chargées, "MARTIN Paul" sélectionné et en mode formulaire avec une modification non enregistrée, "DUPONT Alice" aussi dans la liste.

**Étapes** :
1. Modifier le prénom de MARTIN Paul ("Paul" → "Pierre") sans enregistrer.
2. Cliquer sur "DUPONT Alice" dans la liste.

**Résultat attendu** :
- La `popin-avertissement` s'ouvre : "Des modifications non enregistrées seront perdues. Voulez-vous continuer ?"
- Cliquer sur ANNULER dans la popin → la popin se ferme, MARTIN Paul reste sélectionné avec le formulaire intact.
- Cliquer sur CONFIRMER → DUPONT Alice s'affiche en lecture seule, les modifications de MARTIN sont perdues.

---

### E2E-23 — Popin d'avertissement au clic sur CRÉER sans enregistrer

**Prérequis** : "MARTIN Paul" en mode formulaire avec modification non enregistrée.

**Étapes** :
1. Cliquer sur le bouton CRÉER.

**Résultat attendu** :
- La `popin-avertissement` s'ouvre.
- Cliquer CONFIRMER → un formulaire vide s'ouvre pour créer un nouvel élève.

---

### E2E-24 — Popin d'avertissement au changement d'écran sans enregistrer

**Prérequis** : formulaire élève non enregistré ouvert.

**Étapes** :
1. Cliquer sur le bouton "Projets" dans la navigation.

**Résultat attendu** :
- La `popin-avertissement` s'ouvre.
- ANNULER → reste sur l'écran Élèves avec le formulaire.
- CONFIRMER → navigue vers `/projets`, les modifications sont perdues.

---

### E2E-25 — Filtre textuel sur la liste des élèves

**Prérequis** : données chargées avec plusieurs élèves (MARTIN Paul, DUPONT Alice, BERNARD Jean).

**Étapes** :
1. Saisir "mar" dans le champ de recherche.

**Résultat attendu** :
- Seul "MARTIN Paul" apparaît dans la liste.
- La saisie d'un texte sans correspondance affiche une liste vide.
- Effacer le champ → tous les élèves réapparaissent.

---

### E2E-26 — Filtre par chip de groupe

**Prérequis** : données avec des groupes définis ("Groupe A", "Groupe B") et des élèves assignés à ces groupes.

**Étapes** :
1. Cliquer sur le chip "Groupe A".
2. Cliquer en plus sur le chip "Groupe B" (cumul).
3. Déselectionner "Groupe A".

**Résultat attendu** :
- Étape 1 : seuls les élèves du Groupe A sont affichés.
- Étape 2 : les élèves du Groupe A OU du Groupe B sont affichés.
- Étape 3 : seuls les élèves du Groupe B restent affichés.

---

### E2E-27 — Ajouter un contact dans la fiche élève

**Prérequis** : "MARTIN Paul" sélectionné, mode formulaire ouvert.

**Étapes** :
1. Naviguer jusqu'à la section Contacts.
2. Cliquer sur le bouton AJOUTER.
3. Remplir les champs (type "Père", nom "René MARTIN", téléphone "06 12 34 56 78").
4. Cliquer sur ENREGISTRER.

**Résultat attendu** :
- En mode lecture, le contact apparaît sur une ligne : "René MARTIN — Père — 06 12 34 56 78".

---

### E2E-28 — Ajouter une absence récurrente dans la fiche élève

**Prérequis** : "MARTIN Paul" sélectionné, mode formulaire.

**Étapes** :
1. Naviguer jusqu'à la section Absences récurrentes.
2. Cliquer sur AJOUTER.
3. Remplir : libellé "Orthophonie", jour "Mardi", heure début "10:00", heure fin "11:00", parité "Toutes les semaines".
4. Cliquer sur ENREGISTRER.

**Résultat attendu** :
- En mode lecture, l'absence apparaît : "Orthophonie — Mardi 10:00–11:00 — Toutes les semaines".

---

### E2E-29 — Ajouter une absence ponctuelle dans la fiche élève

**Prérequis** : "MARTIN Paul" sélectionné, mode formulaire.

**Étapes** :
1. Naviguer jusqu'à la section Absences ponctuelles.
2. Cliquer sur AJOUTER.
3. Remplir : date "09/06/2026", justification "Maladie".
4. Cliquer sur ENREGISTRER.

**Résultat attendu** :
- En mode lecture, l'absence ponctuelle apparaît : "09/06/2026 — Maladie".

---

### E2E-30 — Imprimer la fiche d'un élève

**Prérequis** : "MARTIN Paul" sélectionné, mode lecture seule.

**Étapes** :
1. Cliquer sur le bouton IMPRIMER.

**Résultat attendu** :
- La boîte de dialogue d'impression du navigateur s'ouvre.
- La colonne gauche (liste + filtre) est masquée à l'impression (`@media print`).

---

## 5. Écran Projets

### E2E-31 — Créer un nouveau projet

**Prérequis** : données chargées, écran Projets affiché.

**Étapes** :
1. Cliquer sur CRÉER.
2. Saisir le nom "Potager solidaire" dans le bandeau.
3. Cliquer sur ENREGISTRER.

**Résultat attendu** :
- La fiche en lecture seule affiche "Potager solidaire".
- Le projet apparaît dans la liste de gauche.
- ANNULER de l'entête activé.

---

### E2E-32 — Modifier les informations générales d'un projet

**Prérequis** : projet "Compostage" existant, sélectionné en mode formulaire.

**Étapes** :
1. Modifier la description.
2. Cocher plusieurs élèves associés (chips).
3. Cliquer sur ENREGISTRER.

**Résultat attendu** :
- En mode lecture, la description mise à jour et la liste des élèves cochés apparaissent.

---

### E2E-33 — Ajouter une période à un projet

**Prérequis** : projet "Compostage" sélectionné, mode formulaire.

**Étapes** :
1. Naviguer jusqu'à la section Périodes.
2. Cliquer sur AJOUTER UNE PÉRIODE.
3. Remplir : nom "Période 1", date début "01/09/2026", date fin "31/10/2026".
4. Dans le `mc-selecteur-competences`, saisir "lecture" et sélectionner une compétence.
5. Cliquer sur ENREGISTRER.

**Résultat attendu** :
- La période apparaît en mode lecture avec les informations remplies et la compétence listée.
- Les périodes sont triées par date de début.

---

### E2E-34 — Supprimer une période d'un projet

**Prérequis** : projet avec au moins deux périodes, mode formulaire.

**Étapes** :
1. Sur la deuxième période, cliquer sur SUPPRIMER (`mc-bouton-destruction`).
2. Cliquer sur CONFIRMER.
3. Cliquer sur ENREGISTRER.

**Résultat attendu** :
- La période supprimée n'apparaît plus en mode lecture.

---

### E2E-35 — Filtre textuel et chips de domaine dans la liste des projets

**Prérequis** : plusieurs projets avec des domaines de compétences différents.

**Étapes** :
1. Saisir "pot" dans le filtre textuel → seuls les projets dont le nom contient "pot" s'affichent.
2. Cliquer sur un chip de domaine (ex. "Sciences") → la liste est filtrée par ce domaine.
3. Combiner le filtre texte et le chip.

**Résultat attendu** :
- Chaque filtre réduit la liste de façon cumulative (ET logique).

---

### E2E-36 — Supprimer un projet

**Prérequis** : projet "Potager solidaire" sélectionné, mode lecture seule.

**Étapes** :
1. Cliquer sur MODIFIER pour passer en mode formulaire.
2. Cliquer sur SUPPRIMER → CONFIRMER.

**Résultat attendu** :
- Le projet disparaît de la liste.
- La colonne droite est vide.

---

## 6. Écran Compétences

### E2E-37 — Naviguer dans l'arbre des compétences (repliage/dépliage)

**Prérequis** : données chargées, écran Compétences affiché.

**Étapes** :
1. Observer l'état initial de l'arbre (tous les nœuds repliés).
2. Cliquer sur un nœud de domaine (niveau 1).
3. Cliquer à nouveau sur ce nœud.

**Résultat attendu** :
- Étape 1 : seuls les nœuds de niveau 1 sont visibles.
- Étape 2 : les enfants du domaine s'affichent.
- Étape 3 : les enfants se replient.

---

### E2E-38 — Filtre textuel dans l'arbre des compétences

**Prérequis** : écran Compétences affiché.

**Étapes** :
1. Saisir "écriture" dans le champ de recherche.

**Résultat attendu** :
- Seules les compétences dont le libellé contient "écriture" sont affichées, avec leurs nœuds ascendants.
- Les nœuds ascendants sont automatiquement dépliés.
- Effacer le filtre → l'arbre retourne à son état replié par défaut.

---

### E2E-39 — Chips de domaine dans l'arbre des compétences

**Prérequis** : écran Compétences affiché.

**Étapes** :
1. Cliquer sur le chip "Mathématiques".
2. Cliquer en plus sur le chip "Français" (cumul).

**Résultat attendu** :
- Étape 1 : seules les compétences du domaine Mathématiques sont visibles.
- Étape 2 : les compétences de Mathématiques ET Français sont visibles.

---

### E2E-40 — Ajouter une compétence au panier

**Prérequis** : écran Compétences affiché, panier vide.

**Étapes** :
1. Déplier un nœud de domaine pour accéder à une compétence feuille.
2. Cliquer sur le bouton "+" de la compétence.

**Résultat attendu** :
- La compétence apparaît dans le panier à droite.
- Le bouton "+" est désactivé (indiquant que la compétence est déjà dans le panier).
- Un indicateur visuel (couleur primaire + gras) s'applique sur la ligne de l'arbre.

---

### E2E-41 — Ne pas pouvoir ajouter deux fois la même compétence

**Prérequis** : une compétence déjà dans le panier.

**Étapes** :
1. Observer le bouton "+" de cette compétence.

**Résultat attendu** :
- Le bouton "+" est dans l'état `disabled`.
- L'attribut `aria-label` précise "Ajouter au panier : {libellé}".

---

### E2E-42 — Retirer une compétence du panier

**Prérequis** : au moins une compétence dans le panier.

**Étapes** :
1. Cliquer sur l'icône de suppression (✕) de la compétence dans le panier.

**Résultat attendu** :
- La compétence disparaît du panier.
- Le bouton "+" dans l'arbre redevient actif.
- L'indicateur visuel (couleur + gras) disparaît de la ligne de l'arbre.

---

### E2E-43 — Vider le panier

**Prérequis** : plusieurs compétences dans le panier.

**Étapes** :
1. Cliquer sur le bouton "VIDER LA LISTE".

**Résultat attendu** :
- Le panier est vide.
- Tous les boutons "+" dans l'arbre redeviennent actifs.
- Le bouton "VIDER LA LISTE" est désactivé.
- Les boutons d'export sont désactivés.

---

### E2E-44 — Bouton VIDER LA LISTE désactivé si panier vide

**Prérequis** : panier vide.

**Étapes** :
1. Observer l'état du bouton "VIDER LA LISTE".

**Résultat attendu** :
- Le bouton est dans l'état `disabled`.
- Les boutons "Envoyer vers un projet" et "Envoyer vers une séance" sont également désactivés.

---

### E2E-45 — Export du panier vers un projet (popin de sélection en cascade)

**Prérequis** : au moins une compétence dans le panier, au moins un projet avec au moins une période.

**Étapes** :
1. Cliquer sur "Envoyer vers un projet".
2. Dans la popin, sélectionner un projet dans le premier `mc-select`.
3. Sélectionner une période dans le second `mc-select` (options chargées en cascade).
4. Cliquer sur CONFIRMER.

**Résultat attendu** :
- La popin se ferme.
- Le panier est automatiquement vidé.
- En naviguant vers le projet et sa période, les compétences exportées apparaissent (sans doublon).

---

### E2E-46 — Annuler l'export du panier vers un projet

**Prérequis** : au moins une compétence dans le panier, popin d'export ouverte.

**Étapes** :
1. Cliquer sur ANNULER dans la popin.

**Résultat attendu** :
- La popin se ferme.
- Le panier n'est pas vidé.
- Aucune modification dans le projet.

---

### E2E-47 — Export du panier vers une séance du cahier journal

**Prérequis** : au moins une compétence dans le panier, une journée du cahier journal avec au moins une séance pédagogique.

**Étapes** :
1. Cliquer sur "Envoyer vers une séance".
2. Dans la popin, saisir une date dans le champ `mc-input` type date.
3. Sélectionner une séance dans le `mc-select` (séances du jour en cascade).
4. Cliquer sur CONFIRMER.

**Résultat attendu** :
- La popin se ferme.
- Le panier est vidé.
- La séance concernée dans le cahier journal contient les compétences exportées.

---

### E2E-48 — Panier persisté entre les accès à l'écran Compétences

**Prérequis** : une compétence ajoutée au panier.

**Étapes** :
1. Naviguer vers `/eleves`.
2. Revenir vers `/competences`.

**Résultat attendu** :
- La compétence est toujours présente dans le panier.

---

### E2E-49 — Navigation clavier dans l'arbre (conformité RGAA)

**Prérequis** : écran Compétences affiché, arbre avec au moins un domaine.

**Étapes** :
1. Positionner le focus sur l'arbre (Tab).
2. Appuyer sur ArrowDown pour naviguer vers le nœud suivant.
3. Appuyer sur ArrowRight pour déplier un nœud.
4. Appuyer sur ArrowLeft pour replier.
5. Appuyer sur Home pour revenir au premier nœud.
6. Appuyer sur End pour aller au dernier nœud.

**Résultat attendu** :
- Chaque touche produit le comportement décrit par la spec WAI-ARIA Tree View.
- Le focus se déplace visuellement sur le nœud concerné.

---

## 7. Écran Emploi du temps

### E2E-50 — Créer un nouvel emploi du temps

**Prérequis** : données chargées, écran Emploi du temps affiché.

**Étapes** :
1. Cliquer sur le bouton CRÉER dans la colonne gauche.

**Résultat attendu** :
- Un nouvel EDT est créé et sélectionné dans la liste.
- La colonne droite affiche le formulaire des propriétés EDT (vide).
- La zone centrale affiche la grille vide.

---

### E2E-51 — Renseigner et enregistrer les propriétés d'un EDT

**Prérequis** : un nouvel EDT vide sélectionné, formulaire de propriétés affiché.

**Étapes** :
1. Saisir le nom "Semaine complète".
2. Choisir la fréquence "Les deux" (radio group).
3. Saisir une date de début et une date de fin (optionnelles).
4. Cliquer sur ENREGISTRER.

**Résultat attendu** :
- La liste de gauche affiche "Semaine complète" avec la fréquence et les dates.
- Le formulaire reste affiché (état 1 des propriétés).

---

### E2E-52 — Annuler les modifications des propriétés EDT

**Prérequis** : EDT "Semaine complète" sélectionné, formulaire propriétés ouvert.

**Étapes** :
1. Modifier le nom en "Semaine teste".
2. Cliquer sur ANNULER.

**Résultat attendu** :
- Le nom revient à "Semaine complète".
- La liste de gauche est inchangée.

---

### E2E-53 — Ajouter un créneau pédagogique via le bouton AJOUTER d'une colonne

**Prérequis** : EDT "Semaine complète" sélectionné, grille affichée.

**Étapes** :
1. Dans la colonne "Lundi", cliquer sur le bouton AJOUTER.
2. Remplir : heure début "09:00", heure fin "10:00", type "Pédagogique", discipline "Français", titre "Lecture".
3. Cliquer sur ENREGISTRER.

**Résultat attendu** :
- La colonne droite revient à l'état 1 (propriétés EDT).
- Le créneau "09:00–10:00 Lecture" apparaît dans la grille, colonne Lundi.

---

### E2E-54 — Ajouter un créneau récréation

**Prérequis** : EDT sélectionné, grille affichée.

**Étapes** :
1. Cliquer sur le bouton AJOUTER dans la colonne "Mardi".
2. Choisir le type "Récréation", heure début "10:30", heure fin "11:00".
3. Cliquer sur ENREGISTRER.

**Résultat attendu** :
- Le créneau apparaît dans la grille sans champ de titre ni discipline (non applicables pour le type Récréation).

---

### E2E-55 — Insérer un créneau via le bouton intercalaire "+"

**Prérequis** : EDT avec au moins un créneau sur le Lundi.

**Étapes** :
1. Cliquer sur le bouton "+" entre deux créneaux du Lundi.
2. Remplir un créneau et enregistrer.

**Résultat attendu** :
- Le créneau est inséré à la position choisie dans la grille (ordre chronologique respecté).

---

### E2E-56 — Modifier un créneau existant

**Prérequis** : EDT avec un créneau pédagogique "Lecture" le Lundi 09:00–10:00.

**Étapes** :
1. Cliquer sur la cellule du créneau "Lecture" dans la grille.
2. Modifier le titre en "Lecture avancée".
3. Cliquer sur ENREGISTRER.

**Résultat attendu** :
- La grille affiche "Lecture avancée" pour ce créneau.
- La colonne droite revient aux propriétés EDT.

---

### E2E-57 — Supprimer un créneau

**Prérequis** : EDT avec un créneau sélectionné dans la colonne droite (formulaire de créneau).

**Étapes** :
1. Cliquer sur SUPPRIMER → CONFIRMER.

**Résultat attendu** :
- Le créneau disparaît de la grille.
- La colonne droite revient aux propriétés EDT.

---

### E2E-58 — Warning de chevauchement entre deux EDT

**Prérequis** : deux EDT avec des plages de dates et fréquences qui se chevauchent.

**Étapes** :
1. Naviguer vers l'écran Emploi du temps.
2. Observer la liste des EDT.

**Résultat attendu** :
- Une icône ⚠ est visible sur les EDT en conflit.
- Cliquer sur l'icône ouvre la `popin-warnings-absences` listant les EDT en conflit.
- La popin a un bouton Fermer.

---

### E2E-59 — Warning d'absence récurrente sur un créneau EDT

**Prérequis** : un élève avec une absence récurrente le Lundi 09:00–10:00, un créneau EDT sur ce même créneau avec cet élève dans les "élèves concernés".

**Étapes** :
1. Charger la grille de l'EDT concerné.
2. Observer le créneau Lundi 09:00–10:00.

**Résultat attendu** :
- Une icône ⚠ (triangle orange) est visible sur le créneau.
- Cliquer sur l'icône ouvre la `popin-warnings-absences` listant les conflits.

---

### E2E-60 — Supprimer un EDT (et tous ses créneaux)

**Prérequis** : EDT "Semaine complète" avec plusieurs créneaux.

**Étapes** :
1. Cliquer sur l'EDT dans la liste → formulaire propriétés s'ouvre.
2. Cliquer sur SUPPRIMER → CONFIRMER.

**Résultat attendu** :
- L'EDT et tous ses créneaux disparaissent.
- La liste de gauche ne contient plus cet EDT.
- La zone centrale et la colonne droite sont vides.

---

### E2E-61 — Imprimer la grille de l'EDT

**Prérequis** : EDT avec des créneaux, sélectionné.

**Étapes** :
1. Cliquer sur le bouton IMPRIMER.

**Résultat attendu** :
- La boîte d'impression du navigateur s'ouvre.
- La colonne gauche (liste des EDT) est masquée à l'impression.

---

## 8. Écran Cahier journal

### E2E-62 — Navigation temporelle avec les boutons J−1 / J+1

**Prérequis** : données chargées, écran Cahier journal affiché avec le jour courant affiché.

**Étapes** :
1. Cliquer sur le bouton J−1.
2. Cliquer sur le bouton J+1.
3. Cliquer sur le bouton J−7.
4. Cliquer sur le bouton J+7.

**Résultat attendu** :
- Chaque clic met à jour la date affichée dans la zone centrale.
- Le mini-calendrier reflète la date sélectionnée.

---

### E2E-63 — Navigation via le mini-calendrier

**Prérequis** : écran Cahier journal affiché.

**Étapes** :
1. Cliquer sur un jour dans le mini-calendrier.
2. Cliquer sur le bouton de mois précédent dans le calendrier.
3. Cliquer sur un autre jour.

**Résultat attendu** :
- La zone centrale charge la journée correspondante au jour cliqué.
- La navigation mensuelle du calendrier fonctionne indépendamment de la journée chargée.
- Les jours ayant une entrée CJ sont mis en évidence dans le calendrier.
- Les jours weekends, fériés et non ouvrés sont grisés.

---

### E2E-64 — Mémorisation du dernier jour consulté

**Prérequis** : "lundi 9 juin 2026" consulté dans le CJ.

**Étapes** :
1. Naviguer vers `/eleves`.
2. Revenir vers `/cahier-journal`.

**Résultat attendu** :
- La journée "lundi 9 juin 2026" est rechargée automatiquement (mémorisée dans `ContextService`).

---

### E2E-65 — Initialiser une journée vide

**Prérequis** : un jour sans entrée CJ sélectionné.

**Étapes** :
1. Cliquer sur le bouton INITIALISER VIDE.

**Résultat attendu** :
- La zone centrale affiche une journée vide avec les boutons intercalaires "+" pour ajouter des séances.
- Le bouton SUPPRIMER LA JOURNÉE apparaît en bas de la zone centrale.

---

### E2E-66 — Initialiser une journée depuis l'EDT

**Prérequis** : un jour sans entrée CJ sélectionné, un EDT avec des créneaux applicable à ce jour (bonne parité, bonne plage de dates).

**Étapes** :
1. Cliquer sur le bouton INITIALISER DEPUIS L'EDT.

**Résultat attendu** :
- La zone centrale affiche les séances correspondant aux créneaux de l'EDT pour ce jour de semaine.
- Les séances sont dans l'ordre chronologique.

---

### E2E-67 — Boutons d'initialisation inactifs si la journée existe déjà

**Prérequis** : une journée CJ déjà initialisée sélectionnée.

**Étapes** :
1. Observer les boutons INITIALISER VIDE et INITIALISER DEPUIS L'EDT.

**Résultat attendu** :
- Les deux boutons sont désactivés (`disabled`).

---

### E2E-68 — Créer une séance via le bouton intercalaire "+"

**Prérequis** : journée CJ existante avec au moins une séance.

**Étapes** :
1. Cliquer sur le bouton "+" entre deux séances.
2. Remplir : heure début "11:00", heure fin "12:00", type "Pédagogique", titre "Dictée".
3. Cliquer sur ENREGISTRER.

**Résultat attendu** :
- La séance "Dictée 11:00–12:00" est insérée à la position choisie.
- La colonne droite (formulaire) se ferme.
- Si un élève concerné a une absence récurrente sur ce créneau, l'icône ⚠ apparaît sur la séance.

---

### E2E-69 — Modifier une séance existante

**Prérequis** : journée CJ avec une séance "Dictée 11:00–12:00".

**Étapes** :
1. Cliquer sur la séance "Dictée".
2. Modifier le titre en "Dictée préparée".
3. Ajouter une description, des objectifs.
4. Cliquer sur ENREGISTRER.

**Résultat attendu** :
- La liste affiche "Dictée préparée" avec les nouvelles informations.
- La colonne droite se ferme.

---

### E2E-70 — Réorganiser les séances avec les flèches haut/bas

**Prérequis** : journée CJ avec trois séances dans l'ordre A, B, C.

**Étapes** :
1. Cliquer sur la flèche ↓ de la séance A (deuxième position).
2. Cliquer sur la flèche ↑ de la séance C (remontée).

**Résultat attendu** :
- La flèche ↑ de la première séance est désactivée.
- La flèche ↓ de la dernière séance est désactivée.
- Les déplacements modifient l'ordre de la liste.

---

### E2E-71 — Champs absents pour les séances de type récréation/pause déjeuner

**Prérequis** : journée CJ, formulaire de séance ouvert.

**Étapes** :
1. Choisir le type "Récréation".

**Résultat attendu** :
- Les champs Disciplines, Titre, Description, Objectifs, Déroulement, Ressources, Compétences, Élèves concernés disparaissent.
- Seules les heures début/fin et le type restent.

---

### E2E-72 — Élève absent (ponctuelle) désactivé dans mc-eleves-concernes

**Prérequis** : "MARTIN Paul" a une absence ponctuelle pour le jour "2026-06-09". La journée du "2026-06-09" est sélectionnée.

**Étapes** :
1. Ouvrir le formulaire d'une séance pédagogique du "2026-06-09".
2. Observer le composant `mc-eleves-concernes` en mode "Élèves spécifiques".

**Résultat attendu** :
- Le chip de "MARTIN Paul" est désactivé (non sélectionnable car absent ce jour).

---

### E2E-73 — Warning absence récurrente après enregistrement d'une séance

**Prérequis** : "MARTIN Paul" a une absence récurrente le Mardi 10:00–11:00. La journée d'un mardi est sélectionnée.

**Étapes** :
1. Créer une séance pédagogique de 10:00 à 11:00 avec "MARTIN Paul" dans les élèves concernés.
2. Cliquer sur ENREGISTRER.

**Résultat attendu** :
- La séance est enregistrée (non bloqué).
- Une icône ⚠ (triangle orange) apparaît sur la séance dans la liste.
- Cliquer sur l'icône ouvre la `popin-warnings-absences` avec le détail du conflit.

---

### E2E-74 — Supprimer une séance

**Prérequis** : journée CJ avec plusieurs séances, une séance sélectionnée dans la colonne droite.

**Étapes** :
1. Cliquer sur SUPPRIMER → CONFIRMER.

**Résultat attendu** :
- La séance disparaît de la liste.
- La colonne droite se ferme.

---

### E2E-75 — Dupliquer une séance vers un autre jour

**Prérequis** : séance "Dictée" du "2026-06-09" sélectionnée dans la colonne droite.

**Étapes** :
1. Sous le formulaire, cliquer sur "DUPLIQUER VERS UN AUTRE JOUR".
2. Saisir la date cible "2026-06-10".
3. Cliquer sur CONFIRMER DUPLICATION.

**Résultat attendu** :
- La séance "Dictée" est copiée dans la journée du "2026-06-10".
- Si la journée du "2026-06-10" n'existait pas, elle est créée automatiquement.

---

### E2E-76 — Supprimer la journée entière

**Prérequis** : journée CJ existante avec plusieurs séances.

**Étapes** :
1. Cliquer sur le bouton SUPPRIMER LA JOURNÉE (en bas de la zone centrale).
2. Le `mc-bouton-destruction` demande ANNULER ou CONFIRMER — cliquer sur CONFIRMER.

**Résultat attendu** :
- Toutes les séances de la journée sont supprimées.
- La zone centrale affiche les boutons INITIALISER VIDE et INITIALISER DEPUIS L'EDT.
- Le jour n'est plus mis en évidence dans le mini-calendrier.

---

### E2E-77 — Dupliquer la journée entière vers un autre jour

**Prérequis** : journée CJ avec plusieurs séances existante.

**Étapes** :
1. Cliquer sur "DUPLIQUER LA JOURNÉE VERS UN AUTRE JOUR".
2. Saisir la date cible.
3. Cliquer sur CONFIRMER DUPLICATION.

**Résultat attendu** :
- Toutes les séances sont copiées vers le jour cible.
- Si le jour cible n'a pas de journée, elle est créée.

---

### E2E-78 — Dupliquer la journée vers un jour déjà occupé (remplacement avec confirmation)

**Prérequis** : journée CJ existante pour la date source ET pour la date cible.

**Étapes** :
1. Cliquer sur "DUPLIQUER LA JOURNÉE VERS UN AUTRE JOUR".
2. Saisir la date d'un jour déjà initialisé.
3. Confirmer le remplacement via le `mc-bouton-destruction`.

**Résultat attendu** :
- La journée cible est remplacée par les séances de la journée source.

---

### E2E-79 — Imprimer la journée du cahier journal

**Prérequis** : journée CJ existante avec séances affichée.

**Étapes** :
1. Cliquer sur le bouton IMPRIMER.

**Résultat attendu** :
- La boîte d'impression s'ouvre.
- La colonne gauche (calendrier + navigation) est masquée à l'impression.

---

## 9. Écran Paramétrage

### E2E-80 — Navigation entre les sections du paramétrage

**Prérequis** : données chargées, écran Paramétrage affiché.

**Étapes** :
1. Cliquer successivement sur chaque section de la colonne gauche.

**Résultat attendu** :
- Chaque clic charge le contenu de la section dans la zone droite.
- La section active est mise en évidence dans la liste.

---

### E2E-81 — Modifier les informations Enseignant & Classe

**Prérequis** : section "Enseignant & Classe" affichée.

**Étapes** :
1. Modifier le prénom, le nom, l'année scolaire, le niveau de classe.
2. Cliquer sur ENREGISTRER.

**Résultat attendu** :
- Les valeurs sont sauvegardées (réaffichées si on revient sur la section).
- ANNULER de l'entête est activé.

---

### E2E-82 — Annuler des modifications dans Enseignant & Classe

**Prérequis** : section "Enseignant & Classe" avec des données.

**Étapes** :
1. Modifier le prénom.
2. Cliquer sur ANNULER (bouton du formulaire).

**Résultat attendu** :
- La valeur originale du prénom est restaurée.
- Aucune mutation enregistrée dans `DonneesService`.

---

### E2E-83 — Configurer les jours ouvrés dans Semaine & Horaires

**Prérequis** : section "Semaine & Horaires" affichée.

**Étapes** :
1. Décocher "Mercredi" des chips de jours ouvrés.
2. Modifier l'heure de début à "08:30".
3. Cliquer sur ENREGISTRER.

**Résultat attendu** :
- Les modifications sont persistées.
- Dans l'écran Emploi du temps, la colonne "Mercredi" n'apparaît plus dans la grille.

---

### E2E-84 — Ajouter un élément dans une section liste éditable (ex. Groupes)

**Prérequis** : section "Groupes" affichée.

**Étapes** :
1. Cliquer sur AJOUTER.
2. Saisir le libellé "Groupe C".
3. Cliquer sur ENREGISTRER (global ou par ligne selon l'implémentation).

**Résultat attendu** :
- "Groupe C" apparaît dans la liste.
- Dans l'écran Élèves, le chip "Groupe C" est disponible.

---

### E2E-85 — Supprimer un référentiel non utilisé

**Prérequis** : section "Groupes" avec un groupe "Groupe C" non assigné à aucun élève.

**Étapes** :
1. Cliquer sur SUPPRIMER sur la ligne "Groupe C".
2. Cliquer sur CONFIRMER.

**Résultat attendu** :
- "Groupe C" disparaît de la liste.

---

### E2E-86 — Bouton SUPPRIMER désactivé pour un référentiel utilisé

**Prérequis** : un statut d'élève "Dans la classe" assigné à au moins un élève.

**Étapes** :
1. Naviguer vers "Statuts d'élève".
2. Observer le bouton SUPPRIMER de "Dans la classe".

**Résultat attendu** :
- Le bouton SUPPRIMER est dans l'état `disabled`.
- Un tooltip s'affiche au survol/focus : "Cette valeur est utilisée et ne peut pas être supprimée".
- L'attribut `aria-describedby` pointe vers un message masqué visuellement (RGAA).

---

### E2E-87 — Configurer le barème d'évaluation avec aperçu en temps réel

**Prérequis** : section "Barème d'évaluation" affichée.

**Étapes** :
1. Cliquer sur AJOUTER.
2. Saisir : identifiant "A", glyphe "✓", libellé "Acquis".
3. Choisir une couleur texte et une couleur fond.

**Résultat attendu** :
- Le composant `mc-badge-statut` affiche un aperçu en temps réel avec les couleurs et le glyphe saisis.

---

### E2E-88 — Modifier le délai de sauvegarde automatique

**Prérequis** : section "Préférences" affichée, une première sauvegarde manuelle déjà effectuée.

**Étapes** :
1. Modifier le délai de sauvegarde automatique à "5".
2. Cliquer sur ENREGISTRER.

**Résultat attendu** :
- La valeur est persistée dans `donnees.configuration.delaiSauvegardeAutoMinutes`.
- La sauvegarde automatique se déclenchera désormais toutes les 5 minutes (si des modifications existent).

---

## 10. Comportement transverse : UNDO / REDO

### E2E-89 — Annuler une création via le bouton ANNULER de l'entête

**Prérequis** : données chargées, un élève "DUPONT Alice" vient d'être créé (ANNULER de l'entête actif).

**Étapes** :
1. Cliquer sur le bouton ANNULER dans l'entête.

**Résultat attendu** :
- L'élève "DUPONT Alice" disparaît de la liste.
- Le bouton ANNULER de l'entête est désactivé (pile vide si c'était la seule action).
- Le bouton REFAIRE de l'entête est activé.

---

### E2E-90 — Refaire après une annulation

**Prérequis** : suite du scénario E2E-89 — "DUPONT Alice" a été annulée, REFAIRE actif.

**Étapes** :
1. Cliquer sur le bouton REFAIRE dans l'entête.

**Résultat attendu** :
- "DUPONT Alice" réapparaît dans la liste.
- REFAIRE désactivé, ANNULER réactivé.

---

### E2E-91 — UNDO multi-étapes

**Prérequis** : données chargées.

**Étapes** :
1. Créer l'élève A → ENREGISTRER.
2. Créer l'élève B → ENREGISTRER.
3. Créer l'élève C → ENREGISTRER.
4. Cliquer sur ANNULER trois fois.

**Résultat attendu** :
- Après le premier ANNULER : C disparaît.
- Après le deuxième ANNULER : B disparaît.
- Après le troisième ANNULER : A disparaît.
- ANNULER est désactivé (pile vide).

---

### E2E-92 — Une frappe ou perte de focus ne modifie pas les données (pas de mutation implicite)

**Prérequis** : formulaire de modification d'un élève ouvert (ex. prénom "Paul").

**Étapes** :
1. Modifier le prénom dans le champ ("Paul" → "Pierre").
2. Cliquer ailleurs (perte de focus), sans cliquer ENREGISTRER.
3. Cliquer sur ANNULER (bouton du formulaire).
4. Observer le bouton ANNULER de l'entête.

**Résultat attendu** :
- Après ANNULER du formulaire, le prénom est "Paul" (non modifié).
- Le bouton ANNULER de l'entête est dans le même état qu'avant la saisie (aucune mutation n'a eu lieu).

---

## 11. Sauvegarde automatique

### E2E-93 — La sauvegarde automatique ne se déclenche pas avant la première sauvegarde manuelle

**Prérequis** : données chargées (nouveau fichier), aucune sauvegarde manuelle effectuée.

**Étapes** :
1. Créer un élève et enregistrer.
2. Attendre plusieurs minutes.

**Résultat attendu** :
- Aucune sauvegarde automatique ne se déclenche.
- Le tooltip du bouton SAUVEGARDER affiche "Aucune sauvegarde effectuée" (ou équivalent).

---

### E2E-94 — La sauvegarde automatique se déclenche après la première sauvegarde manuelle

**Prérequis** : une première sauvegarde manuelle effectuée (délai configuré à 2 min).

**Étapes** :
1. Créer un élève et enregistrer.
2. Attendre plus de 2 minutes.

**Résultat attendu** :
- Une sauvegarde automatique se déclenche (fichier téléchargé ou comportement équivalent).
- Le tooltip du bouton SAUVEGARDER est mis à jour avec la nouvelle date/heure.
- Aucune popin de mot de passe n'apparaît.

---

### E2E-95 — La sauvegarde automatique ne se déclenche pas si aucune modification

**Prérequis** : première sauvegarde manuelle effectuée, aucune modification depuis.

**Étapes** :
1. Attendre plusieurs cycles du timer (> 2 minutes sans modification).

**Résultat attendu** :
- Aucune sauvegarde automatique ne se déclenche (condition `aDonneesModifiees` est `false`).

---

## 12. Comportement responsive (≤ 768px)

### E2E-96 — Layout empilé sur mobile — Écran Élèves

**Prérequis** : largeur de fenêtre ≤ 768px.

**Étapes** :
1. Naviguer vers `/eleves`.

**Résultat attendu** :
- La colonne gauche (liste) s'affiche au-dessus de la zone de détail.
- La hauteur maximale de la colonne gauche est de 40vh avec scroll vertical.
- La bordure droite est remplacée par une bordure basse.

---

### E2E-97 — Layout empilé sur mobile — Écran Emploi du temps

**Prérequis** : largeur de fenêtre ≤ 768px.

**Étapes** :
1. Naviguer vers `/emploi-du-temps`.

**Résultat attendu** :
- Les trois colonnes s'empilent dans l'ordre : liste EDT → grille → formulaire.
- La colonne gauche a une hauteur max de 40vh avec scroll.

---

### E2E-98 — Libellé mobile du bouton dans l'écran de démarrage

**Prérequis** : largeur de fenêtre ≤ 768px, écran de démarrage affiché.

**Étapes** :
1. Observer le bouton de création de nouveau fichier.

**Résultat attendu** :
- Le libellé du bouton est "Créer ma classe" (libellé abrégé pour mobile).
- Sur desktop (> 768px), il affiche "Créer ma classe à partir d'un jeu de données d'exemple".

---

## 13. Accessibilité (RGAA)

### E2E-99 — Focus automatique sur la popin de démarrage

**Prérequis** : écran de démarrage, popin ouverte.

**Étapes** :
1. Observer où se trouve le focus au chargement de la page.

**Résultat attendu** :
- Le focus est positionné automatiquement sur le premier élément focusable de la popin (directive `[mcAutoFocus]`).

---

### E2E-100 — Focus automatique à la création d'un formulaire élève

**Prérequis** : écran Élèves, aucun formulaire ouvert.

**Étapes** :
1. Cliquer sur le bouton CRÉER.

**Résultat attendu** :
- Le focus se positionne automatiquement sur le premier champ éditable du formulaire (prénom ou nom).

---

### E2E-101 — Trap du focus dans les popins

**Prérequis** : `popin-avertissement` ouverte (formul. élève non enregistré).

**Étapes** :
1. Appuyer sur Tab plusieurs fois.

**Résultat attendu** :
- Le focus reste piégé dans la popin (ne sort pas vers les éléments en arrière-plan).

---

### E2E-102 — Fermeture de popin par la touche Échap (si applicable)

**Prérequis** : `popin-warnings-absences` ouverte (bouton Fermer présent).

**Étapes** :
1. Appuyer sur la touche Échap.

**Résultat attendu** :
- La popin se ferme.
- Le focus retourne à l'élément déclencheur.

---

## 14. Gestion des versions du fichier ZIP

### E2E-103 — Chargement d'un fichier avec version antérieure (migration)

**Prérequis** : un fichier ZIP chiffré avec une version antérieure de l'application.

**Étapes** :
1. Charger ce fichier avec le bon mot de passe.

**Résultat attendu** :
- Les migrations sont appliquées en mémoire.
- L'application se charge normalement vers `/accueil`.
- Aucun message d'erreur.
- Le fichier ZIP d'origine n'est pas modifié (la migration n'est appliquée qu'à la prochaine sauvegarde).

---

### E2E-104 — Chargement d'un fichier avec version incompatible (erreur bloquante)

**Prérequis** : un fichier ZIP avec une version de schéma plus récente que l'application.

**Étapes** :
1. Tenter de charger ce fichier avec le bon mot de passe.

**Résultat attendu** :
- Un message d'erreur bloquant s'affiche dans la popin (version incompatible).
- L'utilisateur reste sur l'écran de démarrage.
- Aucune redirection vers `/accueil`.
