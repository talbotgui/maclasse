---
name: feedback-16-focus-creation
description: Focus automatique sur le premier champ à la création — règle d'implémentation via mcAutoFocus + input focusDemande
metadata:
  type: feedback
---

Au clic sur CREER, le focus doit se placer sur le premier champ éditable du formulaire de la zone centrale.

**Règle d'implémentation :**
Chaque composant formulaire expose un `input()` booléen nommé `focusDemande`. Le premier champ éditable du formulaire porte `[mcAutoFocus]="focusDemande"`.

Le parent gère la valeur selon le contexte :
- **Formulaire sous `@if`** (Élèves, Projets, EDT) : passer `[focusDemande]="true"` (statique suffit, le composant est recréé à chaque apparition).
- **Formulaire toujours dans le DOM** (Cahier Journal) : passer un signal réactif, ex. `[focusDemande]="enCreationSeance()"`, pour que l'`effect()` de la directive se ré-exécute à chaque création.

**Why :** accessibilité RGAA et UX — après clic CREER, l'utilisateur ne doit pas avoir à cliquer manuellement dans le formulaire.

**How to apply :** appliquer ce pattern à tout nouveau composant formulaire (formulaire-eleve, formulaire-projet, cj-formulaire-seance, formulaires EDT et créneau). Voir aussi [[feedback-04-rgaa]] pour l'usage général de `mcAutoFocus`.
