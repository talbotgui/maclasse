import { testAvecDonnees, expect } from '../fixtures';
import { SelecteursEleves } from '../selecteurs/selecteurs-eleves';
import { SelecteursEmploiDuTemps } from '../selecteurs/selecteurs-emploi-du-temps';
import { SelecteursEntete } from '../selecteurs/selecteurs-entete';
import { SelecteursParametrage } from '../selecteurs/selecteurs-parametrage';
import { SelecteursProjets } from '../selecteurs/selecteurs-projets';

testAvecDonnees('E2E-98 — ANNULER / REFAIRE : création d’un élève', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const eleves = new SelecteursEleves(appAvecDonnees);

  await entete.navEleves.click();
  await eleves.btnCreerEleve.click();
  await eleves.remplirBandeau('Alice', 'ZEBULON');
  await eleves.btnEnregistrer.click();
  await expect(eleves.listeEleves).toContainText('ZEBULON');

  await entete.btnAnnuler.click();
  await expect(eleves.listeEleves).not.toContainText('ZEBULON');
  await expect(entete.btnRefaire).toBeEnabled();

  await entete.btnRefaire.click();
  await expect(eleves.listeEleves).toContainText('ZEBULON');
});

testAvecDonnees('E2E-99 — ANNULER / REFAIRE : création d’un projet', async ({ appAvecDonnees }) => {
  const entete = new SelecteursEntete(appAvecDonnees);
  const projets = new SelecteursProjets(appAvecDonnees);

  await entete.navProjets.click();
  await projets.btnCreerProjet.click();
  await projets.champFormNomProjet.fill('Potager solidaire');
  await projets.btnEnregistrerProjet.click();
  await expect(projets.listeProjets).toContainText('Potager solidaire');

  await entete.btnAnnuler.click();
  await expect(projets.listeProjets).not.toContainText('Potager solidaire');
  await expect(entete.btnRefaire).toBeEnabled();

  await entete.btnRefaire.click();
  await expect(projets.listeProjets).toContainText('Potager solidaire');
});

testAvecDonnees(
  'E2E-100 — ANNULER / REFAIRE : création d’un emploi du temps',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const edt = new SelecteursEmploiDuTemps(appAvecDonnees);

    await entete.navEmploiDuTemps.click();
    await edt.btnCreerEdt.click();
    await edt.inputNomEdt.fill('EDT annulable');
    await edt.btnEnregistrerEdt.click();
    await expect(edt.listeEdts).toContainText('EDT annulable');

    await entete.btnAnnuler.click();
    await expect(edt.listeEdts).not.toContainText('EDT annulable');
    await expect(entete.btnRefaire).toBeEnabled();

    await entete.btnRefaire.click();
    await expect(edt.listeEdts).toContainText('EDT annulable');
  },
);

testAvecDonnees(
  'E2E-101 — ANNULER / REFAIRE : ajout d’un groupe dans le paramétrage',
  async ({ appAvecDonnees }) => {
    const entete = new SelecteursEntete(appAvecDonnees);
    const param = new SelecteursParametrage(appAvecDonnees);

    await entete.navParametrage.click();
    await param.btnSectionGroupes.click();
    await param.btnAjouterGroupe.click();
    await param.champGroupeLibelle3.fill('Groupe D');
    await param.btnEnregistrerGroupe3.click();
    await expect(param.champGroupeLibelle3).toHaveValue('Groupe D');

    await entete.btnAnnuler.click();
    await expect(param.champGroupeLibelle3).toHaveCount(0);
    await expect(entete.btnRefaire).toBeEnabled();

    await entete.btnRefaire.click();
    await expect(param.champGroupeLibelle3).toHaveValue('Groupe D');
  },
);
