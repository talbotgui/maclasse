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
    this.btnAjouterAbsencePonctuelle = page.locator('#btnAjouterAbsPonct');
  }

  /** Retourne le bouton de sélection d'un élève par son id. */
  boutonEleve(id: string): Locator {
    return this.page.locator(`#btnEleve${id}`);
  }

  /** Retourne le chip de filtre par groupe. */
  chipGroupe(groupeId: string): Locator {
    return this.page.locator(`#chipGroupe${groupeId}`);
  }

  /** Sélectionne un élève dans la liste par son texte affiché (NOM Prénom). */
  async selectionnerEleveParTexte(texte: string): Promise<void> {
    await this.listeEleves.getByRole('button', { name: texte }).click();
  }

  /** Crée un élève avec prénom et nom dans le bandeau du formulaire. */
  async remplirBandeau(prenom: string, nom: string): Promise<void> {
    await this.champPrenom.fill(prenom);
    await this.champNom.fill(nom);
  }
}
