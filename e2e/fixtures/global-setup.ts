import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync, zipSync } from 'fflate';
import { resolve, dirname } from 'node:path';

/** Mot de passe utilisé pour le ZIP de test. Doit correspondre à MOT_DE_PASSE_TEST dans avec-zip.fixture.ts. */
export const MOT_DE_PASSE_TEST = 'testmdp';

/** Chemin du ZIP de test généré. */
export const CHEMIN_ZIP_TEST = resolve('./e2e/donnees/maclasse-test.zip');

async function deriverCle(motDePasse: string, salt: Uint8Array<ArrayBuffer>, usages: KeyUsage[]): Promise<CryptoKey> {
  const materiau = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(motDePasse),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    materiau,
    { name: 'AES-GCM', length: 256 },
    false,
    usages,
  );
}

export default async function globalSetup(): Promise<void> {
  const donnees = JSON.parse(readFileSync(resolve('./public/donnees-defaut.json'), 'utf-8'));
  const octetsJson = new TextEncoder().encode(JSON.stringify(donnees));
  const compresse = deflateSync(octetsJson);

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cle = await deriverCle(MOT_DE_PASSE_TEST, salt, ['encrypt']);
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cle, compresse),
  );

  const payload = new Uint8Array(16 + 12 + ciphertext.byteLength);
  payload.set(salt, 0);
  payload.set(iv, 16);
  payload.set(ciphertext, 28);

  const zip = zipSync({ 'donnees.json.enc': payload });
  mkdirSync(dirname(CHEMIN_ZIP_TEST), { recursive: true });
  writeFileSync(CHEMIN_ZIP_TEST, zip);
}
