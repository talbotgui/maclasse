import { type Page, type Locator } from '@playwright/test';
import { SelecteursBase } from './selecteurs-base';

/** Sélecteurs de l'écran Élèves. */
export class SelecteursEleves extends SelecteursBase {
  /** Bouton CRÉER un élève (colonne gauche). */
  readonly btnCreerEleve: Locator;
  /** Champ de recherche/filtre sur la liste des élèves. */
  readonly champRecherche: Locator;
  /** Liste des élèves affichés. */
  readonly listeEleves: Locator;
  /** Message affiché quand la liste est vide. */
  readonly messageListeVide: Locator;

  // --- Formulaire élève ---
  /** Champ Prénom dans le bandeau du formulaire. */
  readonly champPrenom: Locator;
  /** Champ Nom dans le bandeau du formulaire. */
  readonly champNom: Locator;
  /** Bouton ENREGISTRER dans le bandeau du formulaire. */
  readonly btnEnregistrer: Locator;
  /** Bouton ANNULER dans le bandeau du formulaire. */
  readonly btnAnnulerFormulaire: Locator;

  // --- Fiche élève (lecture seule) ---
  /** Titre de la fiche (NOM Prénom). */
  readonly titreFiche: Locator;
  /** Bouton MODIFIER sur la fiche. */
  readonly btnModifier: Locator;
  /** Bouton SUPPRIMER (premier état) sur la fiche. */
  readonly btnSupprimer: Locator;
  /** Bouton IMPRIMER sur la fiche. */
  readonly btnImprimer: Locator;
  /** Bouton CONFIRMER du bouton-destruction SUPPRIMER élève. */
  readonly btnSupprimerConfirmer: Locator;
  /** Message quand aucun élève n'est sélectionné. */
  readonly messageAucunEleveSelectionne: Locator;

  // --- Sous-formulaires ---
  /** Bouton AJOUTER dans la section Contacts. */
  readonly btnAjouterContact: Locator;
  /** Bouton AJOUTER dans la section Absences récurrentes. */
  readonly btnAjouterAbsenceRecurrente: Locator;
  /** Bouton AJOUTER dans la section Absences ponctuelles. */
  readonly btnAjouterAbsencePonctuelle: Locator;
  /** Bouton AJOUTER dans la section Cursus. */
  readonly btnAjouterCursus: Locator;

  // --- Sous-formulaire contact (index fixe : DUCOBU a déjà 2 contacts dans le jeu de données) ---
  /** Champ Nom du nouveau contact ajouté (index 2). */
  readonly champNouveauContactNom: Locator;
  /** Champ Téléphone du nouveau contact ajouté (index 2). */
  readonly champNouveauContactTel: Locator;

  // --- Sous-formulaire absence récurrente (index fixe : DUCOBU a déjà 1 absence récurrente) ---
  /** Champ Libellé de la nouvelle absence récurrente ajoutée (index 1). */
  readonly champNouvelleAbsenceRecurrenteLibelle: Locator;

  // --- Sous-formulaire absence ponctuelle (index fixe : DUCOBU n'a aucune absence ponctuelle) ---
  /** Champ Date de la nouvelle absence ponctuelle ajoutée (index 0). */
  readonly champNouvelleAbsencePonctuelleDate: Locator;
  /** Champ Justification de la nouvelle absence ponctuelle ajoutée (index 0). */
  readonly champNouvelleAbsencePonctuelleJustification: Locator;

  // --- Sous-formulaire cursus (index fixe : MARTINOT a déjà 2 cursus) ---
  /** Champ Niveau du nouveau cursus ajouté (index 2). */
  readonly champNouveauCursusNiveau: Locator;

  // --- Lecture seule ---
  /** Liste résumée affichant contacts en mode lecture. */
  readonly listeResumeeContacts: Locator;
  /** Liste résumée affichant les absences récurrentes en mode lecture. */
  readonly listeResumeeAbsencesRec: Locator;
  /** Liste résumée affichant les absences ponctuelles en mode lecture. */
  readonly listeResumeeAbsencesPonct: Locator;
  /** Liste résumée affichant les cursus en mode lecture. */
  readonly listeResumeeCursus: Locator;
  /** Colonne gauche de l'écran (masquée à l'impression). */
  readonly colonneGauche: Locator;

  // --- Chips de filtre par groupe ---
  /** Chip de filtre Groupe A. */
  readonly chipGroupeA: Locator;
  /** Chip de filtre Groupe B. */
  readonly chipGroupeB: Locator;

  // --- Boutons d'élèves du jeu de données fixture ---
  /** Bouton de l'élève MARTINOT Boule dans la liste. */
  readonly btnEleveMartinot: Locator;
  /** Bouton de l'élève GRATIN Léonie dans la liste. */
  readonly btnEleveGratin: Locator;
  /** Bouton de l'élève DUCOBU Jean dans la liste. */
  readonly btnEleveDucobu: Locator;

  constructor(page: Page) {
    super(page);
    this.btnCreerEleve = page.locator('#btnCreerEleve');
    this.champRecherche = page.locator('#rechercheEleves input');
    this.listeEleves = page.locator('.eleves__liste');
    this.messageListeVide = page.locator('.eleves__liste-vide');

    this.champPrenom = page.locator('#champFormPrenom input');
    this.champNom = page.locator('#champFormNom input');
    this.btnEnregistrer = page.locator('#btnEnregistrerEleve');
    this.btnAnnulerFormulaire = page.locator('#btnAnnulerEleve');

    this.titreFiche = page.locator('.fiche-eleve__titre');
    this.btnModifier = page.locator('#btnModifierEleve');
    this.btnSupprimer = page.locator('#btnSupprimerEleve');
    this.btnSupprimerConfirmer = page.locator('#btnSupprimerEleve_confirmer');
    this.btnImprimer = page.locator('#btnImprimerEleve');
    this.messageAucunEleveSelectionne = page.locator('.eleves__vide');

    this.btnAjouterContact = page.locator('#btnAjouterContact');
    this.btnAjouterAbsenceRecurrente = page.locator('#btnAjouterAbsRec');
    this.btnAjouterCursus = page.locator('#btnAjouterCursus');
    this.btnAjouterAbsencePonctuelle = page.locator('#btnAjouterAbsPonct');

    this.champNouveauContactNom = page.locator('#champContactNom2-input');
    this.champNouveauContactTel = page.locator('#champContactTel2-input');
    this.champNouvelleAbsenceRecurrenteLibelle = page.locator('#champAbsRecLibelle1-input');
    this.champNouvelleAbsencePonctuelleDate = page.locator('#champAbsPonctDate0-input');
    this.champNouvelleAbsencePonctuelleJustification = page.locator('#champAbsPonctJustif0');
    this.champNouveauCursusNiveau = page.locator('#champCursusNiveau2-input');
    this.listeResumeeContacts = page.locator('.fiche-eleve__liste-resumee-contacts');
    this.listeResumeeAbsencesRec = page.locator('.fiche-eleve__liste-resumee-absences-rec');
    this.listeResumeeAbsencesPonct = page.locator('.fiche-eleve__liste-resumee-absences-ponct');
    this.listeResumeeCursus = page.locator('.fiche-eleve__liste-resumee-cursus');
    this.colonneGauche = page.locator('.mc-colonne-gauche, .eleves__gauche');

    this.chipGroupeA = page.locator('#chipGroupeA');
    this.chipGroupeB = page.locator('#chipGroupeB');

    this.btnEleveMartinot = this.listeEleves.getByRole('button', { name: /MARTINOT/i });
    this.btnEleveGratin = this.listeEleves.getByRole('button', { name: /GRATIN/i });
    this.btnEleveDucobu = this.listeEleves.getByRole('button', { name: /DUCOBU/i });
  }

  /** Sélectionne MARTINOT Boule dans la liste. */
  async selectionnerMartinot(): Promise<void> {
    await this.btnEleveMartinot.click();
  }

  /** Sélectionne GRATIN Léonie dans la liste. */
  async selectionnerGratin(): Promise<void> {
    await this.btnEleveGratin.click();
  }

  /** Sélectionne DUCOBU Jean dans la liste. */
  async selectionnerDucobu(): Promise<void> {
    await this.btnEleveDucobu.click();
  }

  /** Crée un élève avec prénom et nom dans le bandeau du formulaire. */
  async remplirBandeau(prenom: string, nom: string): Promise<void> {
    await this.champPrenom.fill(prenom);
    await this.champNom.fill(nom);
  }
}
