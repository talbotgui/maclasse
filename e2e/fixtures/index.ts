// test de base (avec screenshots automatiques) — à utiliser dans les specs sans fixture métier
export { test, expect } from './avec-screenshots.fixture';
// test avec données d'exemple préchargées (/accueil déjà affiché)
export { test as testAvecDonnees } from './avec-donnees.fixture';
// test avec fichier ZIP de test disponible
export { test as testAvecZip } from './avec-zip.fixture';
