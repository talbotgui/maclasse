import { type Page } from '@playwright/test';
import { testAvecDonnees, expect } from '../fixtures';
import { SelecteursCahierJournal } from '../selecteurs/selecteurs-cahier-journal';
import { SelecteursEleves } from '../selecteurs/selecteurs-eleves';
import { SelecteursEntete } from '../selecteurs/selecteurs-entete';

// Données du jeu d'exemple (dates décalées à la semaine suivant lundiDeLaSemaine(today)) :
// - Lundi (lundiCible + 0) : 7 séances
//     [0] 08:30–09:30 pédagogique "Lecture – Compréhension de texte"
//     [1] 09:30–10:30 pédagogique "Numération – Les grands nombres"
//     [2] 10:30–10:45 récréation (champs titre/objectifs/deroulement masqués)
// - Mardi (lundiCible + 1) : 7 séances avec données
// - Vendredi (lundiCible + 4) : Jean Ducobu absent 08:30–10:00 → popin conflits automatique
// lundiCible = lundiDeLaSemaine(today) + 7
//
// Navigation : btnPlus1Jour × N depuis today (robuste quel que soit le jour de la semaine).
// mini-calendrier uniquement dans E2E-64 qui teste cette fonctionnalité.

/**
 * Navigue vers lundiCible + offsetJours en cliquant btnPlus1Jour depuis today.
 * @param offsetDepuisLundiCible 0=lundi avec données, 4=vendredi avec données, 7=lundi sans données
 */
async function naviguerVersDateCj(
  cj: SelecteursCahierJournal,
  page: Page,
  offsetDepuisLundiCible: number,
): Promise<void> {
  const nbClics = await page.evaluate((offset: number) => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon ... 6=Sat
    const daysToLundiDeSemaine = (dayOfWeek - 1 + 7) % 7; // 0=Mon, 6=Sun
    const daysToLundiCible = 7 - daysToLundiDeSemaine; // 1..7
    return daysToLundiCible + offset;
  }, offsetDepuisLundiCible);

  for (let i = 0; i < nbClics; i++) {
    await cj.btnPlus1Jour.click();
  }
}

/** Retourne la date YYYY-MM-DD de lundiCible + offsetJours. */
async function obtenirDateCible(page: Page, offsetDepuisLundiCible: number): Promise<string> {
  return page.evaluate((offset: number) => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysToLundiDeSemaine = (dayOfWeek - 1 + 7) % 7;
    const daysToLundiCible = 7 - daysToLundiDeSemaine;
    const cible = new Date(today);
    cible.setDate(today.getDate() + daysToLundiCible + offset);
    return cible.toISOString().slice(0, 10);
  }, offsetDepuisLundiCible);
}

testAvecDonnees(
  'E2E-63 — Navigation temporelle J−1 / J+1 / J−7 / J+7',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const cj = new SelecteursCahierJournal(appAvecDonnees);

    await entete.navCahierJournal.click();
    await expect(appAvecDonnees).toHaveURL(/\/cahier-journal/);

    // Naviguer vers le lundi avec données (lundiCible)
    await naviguerVersDateCj(cj, appAvecDonnees, 0);
    await expect(cj.btnSupprimerJournee).toBeVisible();

    // +1 jour → mardi avec données
    await cj.btnPlus1Jour.click();
    await expect(cj.btnSupprimerJournee).toBeVisible();

    // −1 jour → retour lundi avec données
    await cj.btnMoins1Jour.click();
    await expect(cj.btnSupprimerJournee).toBeVisible();

    // −7 jours → lundi sans données (semaine courante)
    await cj.btnMoins7Jours.click();
    await expect(cj.btnInitialiserVidePrincipal).toBeVisible();

    // +7 jours → retour au lundi avec données
    await cj.btnPlus7Jours.click();
    await expect(cj.btnSupprimerJournee).toBeVisible();
  },
);

testAvecDonnees(
  'E2E-64 — Navigation via le mini-calendrier (mois précédent / clic sur un jour)',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const cj = new SelecteursCahierJournal(appAvecDonnees);

    await entete.navCahierJournal.click();

    // Calculer la date de lundiCible et naviguer le mini-calendrier si le mois change
    const infos = await appAvecDonnees.evaluate(() => {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const daysToLundiDeSemaine = (dayOfWeek - 1 + 7) % 7;
      const daysToLundiCible = 7 - daysToLundiDeSemaine;
      const cible = new Date(today);
      cible.setDate(today.getDate() + daysToLundiCible);
      const targetDate = cible.toISOString().slice(0, 10);
      const monthDiff =
        (cible.getFullYear() - today.getFullYear()) * 12 + (cible.getMonth() - today.getMonth());
      return { targetDate, monthDiff };
    });

    for (let i = 0; i < infos.monthDiff; i++) {
      await cj.btnMoisSuivant.click();
    }

    // Cliquer directement sur le jour dans le mini-calendrier
    await appAvecDonnees.locator(`#calendrierJour_${infos.targetDate}`).click();

    // La journée avec données est sélectionnée
    await expect(cj.btnSupprimerJournee).toBeVisible();
  },
);

testAvecDonnees('E2E-65 — Mémorisation du dernier jour consulté', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const cj = new SelecteursCahierJournal(appAvecDonnees);

  await entete.navCahierJournal.click();

  // Naviguer vers le lundi avec données
  await naviguerVersDateCj(cj, appAvecDonnees, 1);
  await expect(cj.btnSupprimerJournee).toBeVisible();

  // Naviguer vers un autre écran puis revenir (SPA — données en mémoire conservées)
  await entete.navEleves.click();
  await expect(appAvecDonnees).toHaveURL(/\/eleves/);
  await entete.navCahierJournal.click();

  // Le dernier jour consulté est mémorisé (ContexteService) : la journée avec données est réaffichée
  await expect(cj.btnSupprimerJournee).toBeVisible();
  await expect(cj.btnInitialiserVidePrincipal).not.toBeVisible();
});

testAvecDonnees('E2E-66 — Initialiser une journée vide', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const cj = new SelecteursCahierJournal(appAvecDonnees);

  await entete.navCahierJournal.click();

  // Naviguer vers lundiCible+7 : lundi sans données
  await naviguerVersDateCj(cj, appAvecDonnees, 7);
  await expect(cj.btnInitialiserVidePrincipal).toBeVisible();
  await expect(cj.btnSupprimerJournee).not.toBeVisible();

  // Initialiser une journée vide via le bouton central
  await cj.btnInitialiserVidePrincipal.click();

  // La journée existe maintenant (liste vide, boutons d'action présents)
  await expect(cj.btnSupprimerJournee).toBeVisible();
  await expect(cj.btnAjouterSeanceDebut).toBeVisible();
  await expect(entete.btnAnnuler).toBeEnabled();
});

testAvecDonnees("E2E-67 — Initialiser une journée depuis l'EDT", async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const cj = new SelecteursCahierJournal(appAvecDonnees);

  await entete.navCahierJournal.click();

  // Naviguer vers lundiCible+7 : lundi sans données
  await naviguerVersDateCj(cj, appAvecDonnees, 7);
  await expect(cj.btnInitialiserVidePrincipal).toBeVisible();

  // Initialiser depuis l'EDT "Semaine complète" (fréquence lesDeux → couvre tous les lundis)
  await cj.btnInitialiserEdt.click();

  // La journée est remplie avec les créneaux de l'EDT, dans l'ordre chronologique
  await expect(cj.btnSupprimerJournee).toBeVisible();
  await expect(cj.btnModifierPremierSeance).toBeVisible();
  await expect(entete.btnAnnuler).toBeEnabled();
});

testAvecDonnees(
  "E2E-68 — Boutons d'initialisation masqués si la journée existe déjà",
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const cj = new SelecteursCahierJournal(appAvecDonnees);

    await entete.navCahierJournal.click();
    await naviguerVersDateCj(cj, appAvecDonnees, 0);

    // Journée existante → boutons d'action journée présents
    await expect(cj.btnSupprimerJournee).toBeVisible();
    await expect(cj.btnDupliquerJournee).toBeVisible();
    await expect(cj.btnImprimerCj).toBeVisible();

    // Boutons d'initialisation masqués (journée déjà initialisée)
    await expect(cj.btnInitialiserVidePrincipal).not.toBeVisible();
    await expect(cj.btnInitialiserEdt).not.toBeVisible();

    // Bouton d'ajout de séance disponible
    await expect(cj.btnAjouterSeanceDebut).toBeVisible();
  },
);

testAvecDonnees(
  'E2E-69 — Créer une séance via le bouton « + » de début de journée',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const cj = new SelecteursCahierJournal(appAvecDonnees);

    await entete.navCahierJournal.click();
    await naviguerVersDateCj(cj, appAvecDonnees, 0);

    // Ouvrir le formulaire de création
    await cj.btnAjouterSeanceDebut.click();
    await expect(cj.champTitreSeance).toBeVisible();

    // Renseigner heure de début, fin et titre (type pédagogique par défaut), après la
    // dernière séance de la journée pour ne pas chevaucher une séance de toute la classe
    await cj.champHeureDebutSeance.fill('16:00');
    await cj.champHeureFinSeance.fill('17:00');
    await cj.champTitreSeance.fill('Dictée');
    await cj.btnEnregistrerSeance.click();

    // La séance apparaît dans la liste
    await expect(appAvecDonnees.locator('body')).toContainText('Dictée');
    await expect(entete.btnAnnuler).toBeEnabled();
  },
);

testAvecDonnees('E2E-70 — Modifier une séance existante', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const cj = new SelecteursCahierJournal(appAvecDonnees);

  await entete.navCahierJournal.click();
  await naviguerVersDateCj(cj, appAvecDonnees, 0);

  // Ouvrir le formulaire de la première séance (pédagogique "Lecture – Compréhension de texte")
  await cj.btnModifierPremierSeance.click();
  await expect(cj.champTitreSeance).toBeVisible();
  await expect(cj.champTitreSeance).toHaveValue('Lecture – Compréhension de texte');

  // Modifier le titre et ajouter des objectifs
  await cj.champTitreSeance.fill('Lecture modifiée E2E-70');
  await cj.textareaObjectifsSeance.fill('Comprendre un texte narratif');
  await cj.btnEnregistrerSeance.click();

  // Le nouveau titre apparaît dans la liste
  await expect(appAvecDonnees.locator('body')).toContainText('Lecture modifiée E2E-70');
  await expect(entete.btnAnnuler).toBeEnabled();
});

testAvecDonnees("E2E-71 — Annuler la modification d'une séance", async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const cj = new SelecteursCahierJournal(appAvecDonnees);

  await entete.navCahierJournal.click();
  await naviguerVersDateCj(cj, appAvecDonnees, 0);

  // Ouvrir et modifier sans enregistrer
  await cj.btnModifierPremierSeance.click();
  await cj.champTitreSeance.fill('Temporaire E2E-71');
  await cj.btnAnnulerSeance.click();

  // Formulaire fermé, titre d'origine préservé
  await expect(cj.btnAnnulerSeance).not.toBeVisible();
  await expect(appAvecDonnees.locator('body')).toContainText('Lecture – Compréhension de texte');
  await expect(entete.btnAnnuler).toBeDisabled();
});

testAvecDonnees(
  'E2E-72 — Réorganiser les séances avec les flèches haut / bas',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const cj = new SelecteursCahierJournal(appAvecDonnees);

    await entete.navCahierJournal.click();
    await naviguerVersDateCj(cj, appAvecDonnees, 0);

    // La première séance (index 0) a son bouton "monter" désactivé
    await expect(cj.btnMonterPremierSeance).toBeDisabled();

    // Descendre la première séance d'un rang → "Numération" passe en tête
    await cj.btnDescendrePremierSeance.click();
    await expect(entete.btnAnnuler).toBeEnabled();

    // Vérifier que la nouvelle première séance est "Numération"
    await cj.btnModifierPremierSeance.click();
    await expect(cj.champTitreSeance).toHaveValue('Numération – Les grands nombres');
    await cj.btnAnnulerSeance.click();
  },
);

testAvecDonnees(
  'E2E-73 — Champs absents pour les séances de type récréation',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const cj = new SelecteursCahierJournal(appAvecDonnees);

    await entete.navCahierJournal.click();
    await naviguerVersDateCj(cj, appAvecDonnees, 0);

    // Ouvrir le formulaire de création
    await cj.btnAjouterSeanceDebut.click();

    // Changer le type en "récréation"
    await cj.selectTypeSeance.selectOption('recreation');

    // Les champs spécifiques aux séances pédagogiques sont masqués
    await expect(cj.champTitreSeance).not.toBeVisible();
    await expect(cj.textareaObjectifsSeance).not.toBeVisible();
    await expect(cj.textareaDeroulementSeance).not.toBeVisible();
    await cj.btnAnnulerSeance.click();
  },
);

testAvecDonnees('E2E-74 — Supprimer une séance', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const cj = new SelecteursCahierJournal(appAvecDonnees);

  await entete.navCahierJournal.click();
  await naviguerVersDateCj(cj, appAvecDonnees, 0);

  // Supprimer la première séance (suppression directe, sans popin de confirmation)
  await cj.btnSupprimerPremierSeance.click();

  // La première séance a disparu de la liste
  await expect(appAvecDonnees.locator('body')).not.toContainText(
    'Lecture – Compréhension de texte',
  );
  await expect(entete.btnAnnuler).toBeEnabled();
});

testAvecDonnees('E2E-75 — Dupliquer une séance vers un autre jour', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const cj = new SelecteursCahierJournal(appAvecDonnees);

  await entete.navCahierJournal.click();
  await naviguerVersDateCj(cj, appAvecDonnees, 0);

  // Ouvrir le mini-formulaire de duplication pour la première séance
  await cj.btnDupliquerPremierSeance.click();
  await expect(cj.inputDateDuplication).toBeVisible();

  // Date cible : lundiCible + 7 (lundi sans données)
  const dateCible = await obtenirDateCible(appAvecDonnees, 7);
  await cj.inputDateDuplication.fill(dateCible);
  await cj.btnConfirmerDuplication.click();

  // Le formulaire se ferme et les données sont mutées
  await expect(cj.inputDateDuplication).not.toBeVisible();
  await expect(entete.btnAnnuler).toBeEnabled();
});

testAvecDonnees(
  "E2E-76 — Warning d'absence récurrente après affichage du vendredi",
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const cj = new SelecteursCahierJournal(appAvecDonnees);

    await entete.navCahierJournal.click();

    // Naviguer au vendredi (lundiCible + 4) : Jean Ducobu absent 08:30–10:00 (lesDeux)
    // Les séances existantes 08:30–09:30 et 09:30–10:30 se chevauchent avec l'absence
    await naviguerVersDateCj(cj, appAvecDonnees, 4);

    // Edition de la première séance puis enregistrement
    await cj.btnModifierPremierSeance.click();
    await cj.btnEnregistrerSeance.click();

    // La popin d'avertissement s'affiche automatiquement (conflits détectés)
    await expect(cj.btnWarningsFermer).toBeVisible();
    await expect(cj.listeConflitsAbsences).toContainText('Ducobu');

    // Fermer la popin
    await cj.btnWarningsFermer.click();
    await expect(cj.btnWarningsFermer).not.toBeVisible();
  },
);

testAvecDonnees('E2E-77 — Supprimer la journée entière', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const cj = new SelecteursCahierJournal(appAvecDonnees);

  await entete.navCahierJournal.click();
  await naviguerVersDateCj(cj, appAvecDonnees, 0);
  await expect(cj.btnSupprimerJournee).toBeVisible();

  // Supprimer la journée (popin de confirmation)
  await cj.btnSupprimerJournee.click();
  await cj.btnAvertissementConfirmer.click();

  // La journée n'existe plus → bouton d'initialisation principal visible
  await expect(cj.btnInitialiserVidePrincipal).toBeVisible();
  await expect(cj.btnSupprimerJournee).not.toBeVisible();
  await expect(entete.btnAnnuler).toBeEnabled();
});

testAvecDonnees(
  'E2E-78 — Dupliquer la journée entière vers un autre jour',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const cj = new SelecteursCahierJournal(appAvecDonnees);

    await entete.navCahierJournal.click();
    await naviguerVersDateCj(cj, appAvecDonnees, 0);
    await expect(cj.btnSupprimerJournee).toBeVisible();

    // Ouvrir le mini-formulaire de duplication de journée
    await cj.btnDupliquerJournee.click();
    await expect(cj.inputDateDuplication).toBeVisible();

    // Date cible : lundiCible + 14 (2 semaines sans données)
    const dateCible = await obtenirDateCible(appAvecDonnees, 14);
    await cj.inputDateDuplication.fill(dateCible);
    await cj.btnConfirmerDuplication.click();
    await expect(entete.btnAnnuler).toBeEnabled();

    // Naviguer vers la date cible (+7 +7 depuis lundiCible)
    await cj.btnPlus7Jours.click();
    await cj.btnPlus7Jours.click();

    // La journée dupliquée existe à la date cible avec ses séances
    await expect(cj.btnSupprimerJournee).toBeVisible();
    await expect(appAvecDonnees.locator('body')).toContainText('Lecture – Compréhension de texte');
  },
);

testAvecDonnees('E2E-79 — Imprimer la journée du cahier journal', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const cj = new SelecteursCahierJournal(appAvecDonnees);

  await entete.navCahierJournal.click();
  await naviguerVersDateCj(cj, appAvecDonnees, 0);

  // Le bouton IMPRIMER est visible et actif pour une journée existante
  await expect(cj.btnImprimerCj).toBeVisible();
  await expect(cj.btnImprimerCj).toBeEnabled();

  // La boîte d'impression n'est pas testable en headless —
  // vérifier que la journée reste accessible (non masquée par @media print)
  await expect(cj.btnSupprimerJournee).toBeVisible();
});

testAvecDonnees(
  'E2E-102 — ANNULER / REFAIRE : initialisation d’une journée vide',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const cj = new SelecteursCahierJournal(appAvecDonnees);

    await entete.navCahierJournal.click();
    await naviguerVersDateCj(cj, appAvecDonnees, 7);
    await cj.btnInitialiserVidePrincipal.click();
    await expect(cj.btnSupprimerJournee).toBeVisible();

    await entete.btnAnnuler.click();
    await expect(cj.btnInitialiserVidePrincipal).toBeVisible();
    await expect(cj.btnSupprimerJournee).not.toBeVisible();

    await entete.btnRefaire.click();
    await expect(cj.btnSupprimerJournee).toBeVisible();
    await expect(cj.btnInitialiserVidePrincipal).not.toBeVisible();
  },
);

testAvecDonnees(
  'E2E-117 — Pastilles : une séance destinée à des groupes affiche leurs pastilles',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const cj = new SelecteursCahierJournal(appAvecDonnees);

    await entete.navCahierJournal.click();
    await naviguerVersDateCj(cj, appAvecDonnees, 0);
    await cj.btnAjouterSeanceDebut.click();
    // Après la dernière séance : les séances du jour concernent toute la classe
    await cj.champHeureDebutSeance.fill('16:00');
    await cj.champHeureFinSeance.fill('17:00');
    await cj.champTitreSeance.fill('Séance en groupes');
    await cj.radioGroupesSeance.check();
    await cj.chipGroupeASeance.click();
    await cj.chipGroupeBSeance.click();
    await cj.btnEnregistrerSeance.click();

    await expect(cj.pastillesSeances.filter({ hasText: 'Groupe A' })).toHaveCount(1);
    await expect(cj.pastillesSeances.filter({ hasText: 'Groupe B' })).toHaveCount(1);
    await expect(cj.pastillesSeances.filter({ hasText: 'Groupe C' })).toHaveCount(0);
  },
);

testAvecDonnees(
  'E2E-123 — Quitter le cahier journal avec une séance en cours de saisie : popin d’avertissement',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const cj = new SelecteursCahierJournal(appAvecDonnees);

    await entete.navCahierJournal.click();
    await naviguerVersDateCj(cj, appAvecDonnees, 0);
    await cj.btnAjouterSeanceDebut.click();
    await cj.champHeureDebutSeance.fill('09:00');
    await cj.champHeureFinSeance.fill('10:00');
    await cj.champTitreSeance.fill('Séance abandonnée');

    // ANNULER : on reste sur le cahier journal avec la saisie
    await entete.navEleves.click();
    await expect(cj.btnAvertissementNavigationConfirmer).toBeVisible();
    await cj.btnAvertissementNavigationAnnuler.click();
    await expect(cj.btnAvertissementNavigationConfirmer).not.toBeVisible();
    await expect(appAvecDonnees).toHaveURL(/\/cahier-journal/);
    await expect(cj.champTitreSeance).toHaveValue('Séance abandonnée');

    // CONTINUER : la navigation a lieu et la saisie est abandonnée
    await entete.navEleves.click();
    await cj.btnAvertissementNavigationConfirmer.click();
    await expect(appAvecDonnees).toHaveURL(/\/eleves/);
    await expect(entete.btnAnnuler).toBeDisabled();
  },
);

testAvecDonnees(
  'E2E-124 — Initialiser une journée pré-remplit les notes avec les absences régulières du jour',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const cj = new SelecteursCahierJournal(appAvecDonnees);

    await entete.navCahierJournal.click();

    // Vendredi sans données (lundiCible + 11) : Jean Ducobu est absent tous les vendredis (08:30–10:00)
    await naviguerVersDateCj(cj, appAvecDonnees, 11);
    await cj.btnInitialiserVidePrincipal.click();

    await expect(cj.champNotesJournee).toHaveValue(/Ducobu/);
    await expect(cj.champNotesJournee).toHaveValue(/Orthophoniste/);
    await expect(cj.champNotesJournee).not.toHaveValue(/Petit-Tonnerre/);
  },
);

testAvecDonnees(
  'E2E-127 — Replier et déplier les notes de la journée',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const cj = new SelecteursCahierJournal(appAvecDonnees);

    await entete.navCahierJournal.click();
    await naviguerVersDateCj(cj, appAvecDonnees, 0);

    // Saisir des notes puis replier : le champ disparaît, l'aperçu montre la première ligne
    await cj.champNotesJournee.fill('Sortie piscine\nPrévoir les maillots');
    await cj.btnBasculerNotes.click();
    await expect(cj.btnBasculerNotes).toHaveAttribute('aria-expanded', 'false');
    await expect(cj.champNotesJournee).not.toBeVisible();
    await expect(cj.apercuNotes).toHaveText('— Sortie piscine');

    // Déplier : le champ réapparaît avec les notes enregistrées au blur
    await cj.btnBasculerNotes.click();
    await expect(cj.btnBasculerNotes).toHaveAttribute('aria-expanded', 'true');
    await expect(cj.champNotesJournee).toHaveValue('Sortie piscine\nPrévoir les maillots');
    await expect(cj.apercuNotes).not.toBeVisible();
  },
);

testAvecDonnees(
  'E2E-128 — Un élève absent ce jour-là ne peut pas être sélectionné dans une séance',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const eleves = new SelecteursEleves(appAvecDonnees);
    const cj = new SelecteursCahierJournal(appAvecDonnees);

    // Jean Ducobu est absent (absence ponctuelle) le lundi de la journée de test
    const dateAbsence = await obtenirDateCible(appAvecDonnees, 0);
    await entete.navEleves.click();
    await eleves.selectionnerDucobu();
    await eleves.btnModifier.click();
    await eleves.btnAjouterAbsencePonctuelle.click();
    await eleves.champNouvelleAbsencePonctuelleDate.fill(dateAbsence);
    await eleves.champNouvelleAbsencePonctuelleJustification.fill('Rendez-vous');
    await eleves.btnEnregistrer.click();

    await entete.navCahierJournal.click();
    await naviguerVersDateCj(cj, appAvecDonnees, 0);
    await cj.btnModifierPremierSeance.click();
    await cj.radioElevesSeance.check();

    await expect(cj.chipEleveDucobuSeance).toBeDisabled();
  },
);

testAvecDonnees(
  'E2E-129 — Un élève ne peut pas être affecté à deux séances simultanées',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const cj = new SelecteursCahierJournal(appAvecDonnees);

    await entete.navCahierJournal.click();
    await naviguerVersDateCj(cj, appAvecDonnees, 0);

    // 08:00–09:00 chevauche « Lecture » (08:30–09:30, toute la classe)
    await cj.btnAjouterSeanceDebut.click();
    await cj.champHeureDebutSeance.fill('08:00');
    await cj.champHeureFinSeance.fill('09:00');
    await cj.champTitreSeance.fill('Séance en conflit');
    await cj.btnEnregistrerSeance.click();

    // Enregistrement bloqué : message d'erreur, formulaire toujours ouvert
    await expect(cj.erreurFormulaireSeance).toContainText('Ducobu Jean');
    await expect(cj.btnEnregistrerSeance).toBeVisible();
    await expect(entete.btnAnnuler).toBeDisabled();

    // Séance adjacente (08:00–08:30) : l'enregistrement passe
    await cj.champHeureFinSeance.fill('08:30');
    await cj.btnEnregistrerSeance.click();
    await expect(cj.btnEnregistrerSeance).not.toBeVisible();
    await expect(appAvecDonnees.locator('body')).toContainText('Séance en conflit');
  },
);
