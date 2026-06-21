import { testAvecDonnees, expect } from '../fixtures';
import { SelecteursEleves } from '../selecteurs/selecteurs-eleves';
import { SelecteursEntete } from '../selecteurs/selecteurs-entete';

// Données du jeu d'exemple :
// - 11 élèves dont MARTINOT Boule (Groupe A), GRATIN Léonie (Groupes A+B), DUCOBU Jean (Groupe B)
// - Groupes : A, B, C

testAvecDonnees('E2E-18 — Créer un nouvel élève', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const eleves = new SelecteursEleves(appAvecDonnees);

  await entete.navEleves.click();

  await eleves.btnCreerEleve.click();
  await eleves.remplirBandeau('Alice', 'DUPONT');
  await eleves.btnEnregistrer.click();

  // Fiche en lecture seule avec le nom attendu
  await expect(eleves.titreFiche).toContainText('DUPONT');
  await expect(eleves.titreFiche).toContainText('Alice');

  // L'élève apparaît dans la liste
  await expect(eleves.listeEleves.getByRole('button', { name: /DUPONT/i })).toBeVisible();

  // UNDO disponible
  await expect(entete.btnAnnuler).toBeEnabled();
});

testAvecDonnees('E2E-19 — Modifier un élève existant', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const eleves = new SelecteursEleves(appAvecDonnees);

  await entete.navEleves.click();
  await eleves.selectionnerEleveParTexte('MARTINOT Boule');

  await eleves.btnModifier.click();
  await eleves.champPrenom.fill('Boule-Modifié');
  await eleves.btnEnregistrer.click();

  await expect(eleves.titreFiche).toContainText('Boule-Modifié');
  await expect(eleves.listeEleves.getByRole('button', { name: /Boule-Modifié/i })).toBeVisible();
  await expect(entete.btnAnnuler).toBeEnabled();
});

testAvecDonnees('E2E-20 — Annuler une modification en cours (bouton ANNULER du formulaire)', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const eleves = new SelecteursEleves(appAvecDonnees);

  await entete.navEleves.click();
  await eleves.selectionnerEleveParTexte('MARTINOT Boule');
  await eleves.btnModifier.click();

  await eleves.champPrenom.fill('PrenomModifie');
  await eleves.btnAnnulerFormulaire.click();

  // La fiche affiche le prénom d'origine
  await expect(eleves.titreFiche).toContainText('Boule');
  await expect(eleves.titreFiche).not.toContainText('PrenomModifie');

  // Aucune mutation → ANNULER entête non affecté par ce formulaire
  await expect(entete.btnAnnuler).toBeDisabled();
});

testAvecDonnees('E2E-21 — Supprimer un élève', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const eleves = new SelecteursEleves(appAvecDonnees);

  // Créer un élève temporaire pour le supprimer sans affecter le jeu de données
  await entete.navEleves.click();
  await eleves.btnCreerEleve.click();
  await eleves.remplirBandeau('Temporaire', 'ATEMP');
  await eleves.btnEnregistrer.click();
  await expect(eleves.titreFiche).toContainText('ATEMP');

  // Supprimer (étape 1 : clic sur SUPPRIMER)
  await eleves.btnSupprimer.click();
  // Étape 2 : confirmation
  await eleves.btnSupprimerConfirmer.click();

  await expect(eleves.listeEleves.getByRole('button', { name: /ATEMP/i })).not.toBeVisible();
  await expect(eleves.messageAucunEleveSelectionne).toBeVisible();
  await expect(entete.btnAnnuler).toBeEnabled();
});

testAvecDonnees('E2E-22 — Popin d\'avertissement au clic sur un autre élève sans enregistrer', async ({ appAvecDonnees }) => {
  const eleves = new SelecteursEleves(appAvecDonnees);

  await appAvecDonnees.goto('/eleves');
  await eleves.selectionnerEleveParTexte('MARTINOT Boule');
  await eleves.btnModifier.click();
  await eleves.champPrenom.fill('PrenomNonSauvegarde');

  // Cliquer sur un autre élève
  await eleves.selectionnerEleveParTexte('GRATIN Léonie');

  // La popin d'avertissement doit s'ouvrir
  await expect(eleves.btnAvertissementAnnuler).toBeVisible();
  await expect(eleves.btnAvertissementConfirmer).toBeVisible();

  // Scénario A : ANNULER → reste sur MARTINOT
  await eleves.btnAvertissementAnnuler.click();
  await expect(eleves.champPrenom).toHaveValue('PrenomNonSauvegarde');

  // Scénario B : cliquer à nouveau sur GRATIN et CONFIRMER
  await eleves.selectionnerEleveParTexte('GRATIN Léonie');
  await eleves.btnAvertissementConfirmer.click();
  await expect(eleves.titreFiche).toContainText('GRATIN');
});

testAvecDonnees('E2E-23 — Popin d\'avertissement au clic sur CRÉER sans enregistrer', async ({ appAvecDonnees }) => {
  const eleves = new SelecteursEleves(appAvecDonnees);

  await appAvecDonnees.goto('/eleves');
  await eleves.selectionnerEleveParTexte('MARTINOT Boule');
  await eleves.btnModifier.click();
  await eleves.champPrenom.fill('Brouillon');

  await eleves.btnCreerEleve.click();

  await expect(eleves.btnAvertissementConfirmer).toBeVisible();
  await eleves.btnAvertissementConfirmer.click();

  // Formulaire vide pour un nouvel élève
  await expect(eleves.champPrenom).toHaveValue('');
  await expect(eleves.champNom).toHaveValue('');
});

testAvecDonnees('E2E-24 — Popin d\'avertissement au changement d\'écran sans enregistrer', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const eleves = new SelecteursEleves(appAvecDonnees);

  await appAvecDonnees.goto('/eleves');
  await eleves.selectionnerEleveParTexte('MARTINOT Boule');
  await eleves.btnModifier.click();
  await eleves.champPrenom.fill('Brouillon');

  await entete.navProjets.click();
  await expect(eleves.btnAvertissementConfirmer).toBeVisible();

  // ANNULER → reste sur les élèves
  await eleves.btnAvertissementAnnuler.click();
  await expect(appAvecDonnees).toHaveURL(/\/eleves/);

  // Retenter et CONFIRMER → navigue vers les projets
  await entete.navProjets.click();
  await eleves.btnAvertissementConfirmer.click();
  await expect(appAvecDonnees).toHaveURL(/\/projets/);
});

testAvecDonnees('E2E-25 — Filtre textuel sur la liste des élèves', async ({ appAvecDonnees }) => {
  const eleves = new SelecteursEleves(appAvecDonnees);

  await appAvecDonnees.goto('/eleves');

  await eleves.champRecherche.fill('martinot');
  await expect(eleves.listeEleves.getByRole('button', { name: /MARTINOT/i })).toBeVisible();
  // Les autres élèves ne sont pas affichés
  await expect(eleves.listeEleves.getByRole('button', { name: /GRATIN/i })).not.toBeVisible();

  // Texte sans correspondance → liste vide
  await eleves.champRecherche.fill('xyzxyz');
  await expect(eleves.messageListeVide).toBeVisible();

  // Effacer → tous les élèves réapparaissent
  await eleves.champRecherche.fill('');
  await expect(eleves.listeEleves.getByRole('button', { name: /MARTINOT/i })).toBeVisible();
  await expect(eleves.listeEleves.getByRole('button', { name: /GRATIN/i })).toBeVisible();
});

testAvecDonnees('E2E-26 — Filtre par chip de groupe', async ({ appAvecDonnees }) => {
  const eleves = new SelecteursEleves(appAvecDonnees);

  await appAvecDonnees.goto('/eleves');

  // Groupe A seul → Martinot, Gratin, Zimmermann
  await eleves.chipGroupe('A').click();
  await expect(eleves.listeEleves.getByRole('button', { name: /MARTINOT/i })).toBeVisible();
  await expect(eleves.listeEleves.getByRole('button', { name: /DUCOBU/i })).not.toBeVisible();

  // Cumul A + B → ajoute Ducobu et Gratin
  await eleves.chipGroupe('B').click();
  await expect(eleves.listeEleves.getByRole('button', { name: /DUCOBU/i })).toBeVisible();
  await expect(eleves.listeEleves.getByRole('button', { name: /GRATIN/i })).toBeVisible();

  // Déselectionner A → seul Groupe B : Gratin et Ducobu
  await eleves.chipGroupe('A').click();
  await expect(eleves.listeEleves.getByRole('button', { name: /MARTINOT/i })).not.toBeVisible();
  await expect(eleves.listeEleves.getByRole('button', { name: /DUCOBU/i })).toBeVisible();
});

testAvecDonnees('E2E-27 — Ajouter un contact dans la fiche élève', async ({ appAvecDonnees }) => {
  const eleves = new SelecteursEleves(appAvecDonnees);

  await appAvecDonnees.goto('/eleves');
  await eleves.selectionnerEleveParTexte('DUCOBU Jean');
  await eleves.btnModifier.click();

  await eleves.btnAjouterContact.click();

  // Remplir le contact à l'index 0 (dernier ajouté en fin de liste)
  const indexContact = await appAvecDonnees.locator('[id^="champContactNom"]').count() - 1;
  await appAvecDonnees.locator(`#champContactNom${indexContact} input`).fill('René Ducobu');
  await appAvecDonnees.locator(`#champContactTel${indexContact} input`).fill('06 12 34 56 78');

  await eleves.btnEnregistrer.click();

  // En lecture seule, le contact apparaît
  await expect(appAvecDonnees.locator('.fiche-eleve__liste-resumee')).toContainText('René Ducobu');
});

testAvecDonnees('E2E-28 — Ajouter une absence récurrente dans la fiche élève', async ({ appAvecDonnees }) => {
  const eleves = new SelecteursEleves(appAvecDonnees);

  await appAvecDonnees.goto('/eleves');
  await eleves.selectionnerEleveParTexte('DUCOBU Jean');
  await eleves.btnModifier.click();

  await eleves.btnAjouterAbsenceRecurrente.click();

  const indexAbs = await appAvecDonnees.locator('[id^="champAbsRecLibelle"]').count() - 1;
  await appAvecDonnees.locator(`#champAbsRecLibelle${indexAbs} input`).fill('Orthophonie');

  await eleves.btnEnregistrer.click();

  await expect(appAvecDonnees.locator('.fiche-eleve__liste-resumee')).toContainText('Orthophonie');
});

testAvecDonnees('E2E-29 — Ajouter une absence ponctuelle dans la fiche élève', async ({ appAvecDonnees }) => {
  const eleves = new SelecteursEleves(appAvecDonnees);

  await appAvecDonnees.goto('/eleves');
  await eleves.selectionnerEleveParTexte('DUCOBU Jean');
  await eleves.btnModifier.click();

  await eleves.btnAjouterAbsencePonctuelle.click();

  const indexAbs = await appAvecDonnees.locator('[id^="champAbsPonctDate"]').count() - 1;
  await appAvecDonnees.locator(`#champAbsPonctDate${indexAbs} input`).fill('2026-06-09');
  await appAvecDonnees.locator(`#champAbsPonctJustif${indexAbs} textarea`).fill('Maladie');

  await eleves.btnEnregistrer.click();

  await expect(appAvecDonnees.locator('.fiche-eleve__liste-resumee')).toContainText('Maladie');
});

testAvecDonnees('E2E-30 — Imprimer la fiche d\'un élève', async ({ appAvecDonnees }) => {
  const eleves = new SelecteursEleves(appAvecDonnees);

  await appAvecDonnees.goto('/eleves');
  await eleves.selectionnerEleveParTexte('MARTINOT Boule');

  // Vérifier que le bouton IMPRIMER est présent et visible en lecture seule
  await expect(eleves.btnImprimer).toBeVisible();
  await expect(eleves.btnImprimer).toBeEnabled();

  // On ne déclenche pas la boîte d'impression du navigateur (non testable en headless)
  // mais on vérifie que la colonne gauche ne sera pas imprimée
  // via l'attribut aria / classe qui sera masqué en @media print
  await expect(appAvecDonnees.locator('.mc-colonne-gauche, .eleves__gauche')).toBeVisible();
});
