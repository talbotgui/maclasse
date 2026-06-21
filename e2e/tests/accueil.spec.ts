import { testAvecDonnees, expect } from '../fixtures';
import { SelecteursAccueil } from '../selecteurs/selecteurs-accueil';
import { SelecteursCahierJournal } from '../selecteurs/selecteurs-cahier-journal';
import { SelecteursEntete } from '../selecteurs/selecteurs-entete';

// Les données d'exemple (donnees-defaut.json) n'ont aucune entrée de cahier journal
// pour la date d'aujourd'hui → E2E-17 passe naturellement.
// E2E-16 nécessite de créer une séance pour aujourd'hui via l'écran Cahier Journal.

testAvecDonnees('E2E-16 — Accueil affiche le résumé du cahier journal du jour (cas rempli)', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const accueil = new SelecteursAccueil(appAvecDonnees);
  const cj = new SelecteursCahierJournal(appAvecDonnees);

  // Créer une séance pour aujourd'hui via le Cahier Journal
  await entete.navCahierJournal.click();
  await expect(appAvecDonnees).toHaveURL(/\/cahier-journal/);

  // Initialiser une journée vide pour aujourd'hui
  await expect(cj.btnInitialiserVide).toBeVisible();
  await cj.btnInitialiserVide.click();

  // Ajouter une séance via le bouton "+"
  await cj.btnAjouterSeance.click();

  // Remplir la séance : heure début, heure fin, type Pédagogique
  await appAvecDonnees.locator('#champHeureDebut input, [id*="HeureDebut"] input').first().fill('09:00');
  await appAvecDonnees.locator('#champHeureFin input, [id*="HeureFin"] input').first().fill('10:00');
  await appAvecDonnees.locator('#champTitreSeance input, [id*="Titre"] input').first().fill('Lecture du matin');
  await cj.btnEnregistrerSeance.click();

  // Retourner à l'accueil
  await entete.navAccueil.click();
  await expect(appAvecDonnees).toHaveURL(/\/accueil/);

  // La liste des séances doit être affichée (pas le message "aucun journal")
  await expect(accueil.messageAucunJournal).not.toBeVisible();
  await expect(accueil.listeSeances).toBeVisible();
  await expect(accueil.titreDateJour).toBeVisible();
});

testAvecDonnees('E2E-17 — Accueil affiche "Aucun journal pour aujourd\'hui" quand le CJ est vide', async ({ appAvecDonnees }) => {
  const accueil = new SelecteursAccueil(appAvecDonnees);

  // Les données d'exemple n'ont aucune entrée CJ pour aujourd'hui
  // (la fixture testAvecDonnees démarre déjà à /accueil)

  await expect(accueil.titreDateJour).toBeVisible();
  await expect(accueil.messageAucunJournal).toBeVisible();
  await expect(accueil.listeSeances).not.toBeVisible();
});
