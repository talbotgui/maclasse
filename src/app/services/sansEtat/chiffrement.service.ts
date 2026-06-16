/**
 * Service de chiffrement/déchiffrement AES-GCM avec compression deflate.
 * Utilise la Web Crypto API native et la bibliothèque `fflate` pour la compression.
 */

import { Injectable } from '@angular/core';
import { deflateSync, inflateSync, zipSync, unzipSync } from 'fflate';
import { DonneesApplication } from '../../modeles/donnees-application.modele';

/** Nom du fichier chiffré à l'intérieur du ZIP de sortie. */
const NOM_FICHIER_CHIFFRE = 'donnees.json.enc';

/** Longueur du salt PBKDF2 en octets. */
const LONGUEUR_SALT = 16;

/** Longueur du vecteur d'initialisation AES-GCM en octets. */
const LONGUEUR_IV = 12;

/** Nombre d'itérations PBKDF2 — équilibre sécurité/performance. */
const ITERATIONS_PBKDF2 = 100_000;

/**
 * Service sans état exposant deux opérations asynchrones :
 * chiffrement et déchiffrement d'un fichier ZIP.
 *
 * Format du payload stocké dans le ZIP :
 * `[salt : 16 oct][iv : 12 oct][données AES-GCM chiffrées]`
 */
@Injectable({ providedIn: 'root' })
export class ChiffrementService {
  /**
   * Chiffre les données de l'application et retourne un `Blob` ZIP téléchargeable.
   *
   * Algorithme :
   * 1. Sérialisation JSON → UTF-8
   * 2. Compression deflate via `fflate`
   * 3. Dérivation de clé AES-GCM 256 bits via PBKDF2 (salt aléatoire)
   * 4. Chiffrement AES-GCM (IV aléatoire)
   * 5. Emballage `[salt][iv][ciphertext]` dans un ZIP mono-fichier
   *
   * @param donnees Données à chiffrer.
   * @param motDePasse Mot de passe en clair saisi par l'utilisateur.
   * @returns `Blob` ZIP contenant le fichier chiffré.
   */
  public async chiffrer(donnees: DonneesApplication, motDePasse: string): Promise<Blob> {
    const octetsJson = new TextEncoder().encode(JSON.stringify(donnees));
    const compresse = deflateSync(octetsJson);

    const salt = crypto.getRandomValues(new Uint8Array(LONGUEUR_SALT));
    const iv = crypto.getRandomValues(new Uint8Array(LONGUEUR_IV));
    const cle = await this._deriverCle(motDePasse, salt, ['encrypt']);
    const ciphertext = new Uint8Array(
      await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cle, compresse),
    );

    const payload = new Uint8Array(LONGUEUR_SALT + LONGUEUR_IV + ciphertext.byteLength);
    payload.set(salt, 0);
    payload.set(iv, LONGUEUR_SALT);
    payload.set(ciphertext, LONGUEUR_SALT + LONGUEUR_IV);

    const zip = zipSync({ [NOM_FICHIER_CHIFFRE]: payload });
    return new Blob([zip], { type: 'application/zip' });
  }

  /**
   * Déchiffre un fichier ZIP et retourne les données de l'application.
   *
   * Algorithme inverse de `chiffrer` :
   * 1. Lecture du ZIP et extraction du fichier chiffré
   * 2. Séparation `[salt][iv][ciphertext]`
   * 3. Dérivation de clé via PBKDF2 avec le salt extrait
   * 4. Déchiffrement AES-GCM avec l'IV extrait
   * 5. Décompression deflate + désérialisation JSON
   *
   * @param fichier Fichier ZIP sélectionné par l'utilisateur.
   * @param motDePasse Mot de passe en clair saisi par l'utilisateur.
   * @returns Données déchiffrées et désérialisées.
   * @throws DOMException si le mot de passe est incorrect ou le fichier corrompu.
   */
  public async dechiffrer(fichier: File, motDePasse: string): Promise<DonneesApplication> {
    const tampon = await fichier.arrayBuffer();
    const zip = unzipSync(new Uint8Array(tampon));
    const payload = zip[NOM_FICHIER_CHIFFRE];

    const salt = payload.slice(0, LONGUEUR_SALT);
    const iv = payload.slice(LONGUEUR_SALT, LONGUEUR_SALT + LONGUEUR_IV);
    const ciphertext = payload.slice(LONGUEUR_SALT + LONGUEUR_IV);

    const cle = await this._deriverCle(motDePasse, salt, ['decrypt']);
    const decrypte = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cle, ciphertext);

    const decompresse = inflateSync(new Uint8Array(decrypte));
    return JSON.parse(new TextDecoder().decode(decompresse)) as DonneesApplication;
  }

  /**
   * Dérive une clé AES-GCM 256 bits depuis un mot de passe et un salt via PBKDF2-SHA-256.
   * @param motDePasse Mot de passe en clair.
   * @param salt Salt aléatoire (16 octets).
   * @param usages Usages autorisés (`'encrypt'` ou `'decrypt'`).
   * @returns Clé cryptographique non extractible.
   */
  private async _deriverCle(
    motDePasse: string,
    salt: Uint8Array<ArrayBuffer>,
    usages: KeyUsage[],
  ): Promise<CryptoKey> {
    const materiau = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(motDePasse),
      'PBKDF2',
      false,
      ['deriveKey'],
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: ITERATIONS_PBKDF2, hash: 'SHA-256' },
      materiau,
      { name: 'AES-GCM', length: 256 },
      false,
      usages,
    );
  }
}
